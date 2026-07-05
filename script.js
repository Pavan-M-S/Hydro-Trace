// ============================================================
// FIREBASE CONFIGURATION – HydroTrace
// ============================================================
const firebaseConfig = {
    apiKey: "AIzaSyC2qST8vZoIdGsFi0BzG30hjlvGyhk09QA",
    authDomain: "water-dispenser-df505.firebaseapp.com",
    databaseURL: "https://water-dispenser-df505-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "water-dispenser-df505",
    storageBucket: "water-dispenser-df505.firebasestorage.app",
    messagingSenderId: "1055301805602",
    appId: "1:1055301805602:web:88aeecb0a41fd264be0c7b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ============================================================
// REAL-TIME FIREBASE CONNECTION STATUS
// ============================================================
const connectionDot = document.getElementById('connectionDot');
const connectionStatus = document.getElementById('connectionStatus');

const connectedRef = database.ref('.info/connected');
connectedRef.on('value', (snap) => {
    const isConnected = snap.val() === true;
    if (isConnected) {
        connectionDot.style.background = 'var(--seafoam)';
        connectionDot.style.animation = 'blink 1.5s infinite';
        connectionStatus.textContent = 'CONNECTED';
        connectionStatus.style.color = 'var(--seafoam)';
    } else {
        connectionDot.style.background = 'var(--red)';
        connectionDot.style.animation = 'none';
        connectionStatus.textContent = 'DISCONNECTED';
        connectionStatus.style.color = 'var(--red)';
    }
});

// ----- THEME TOGGLE -----
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('hydrotrace-theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('hydrotrace-theme', next);
});

// ----- MOBILE NAV -----
const hamburger = document.getElementById('navHamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
    });
});

// ----- MOBILE DROPDOWN TOGGLE -----
document.querySelectorAll('.dropdown > a').forEach(link => {
    link.addEventListener('click', function(e) {
        if (window.innerWidth <= 900) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
            }
            const parent = this.closest('.dropdown');
            parent.classList.toggle('open');
        }
    });
});
document.addEventListener('click', function(e) {
    if (window.innerWidth <= 900) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
        }
    }
});

// ----- ABSTRACT TABS -----
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = {
    problems: document.getElementById('panel-problems'),
    disadvantages: document.getElementById('panel-disadvantages'),
    impact: document.getElementById('panel-impact'),
    audience: document.getElementById('panel-audience'),
};
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Object.keys(tabPanels).forEach(key => {
            tabPanels[key].classList.toggle('active', key === btn.dataset.tab);
        });
    });
});

// ----- FAQ ACCORDION -----
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
        const item = q.closest('.faq-item');
        const wasOpen = item.classList.contains('open');
        if (wasOpen) {
            item.classList.remove('open');
        } else {
            item.classList.add('open');
        }
    });
});

// ============================================================
// 1. DASHBOARD METRICS – read from firebase/data
// ============================================================
const cleanLevelEl = document.getElementById('cleanLevel');
const wasteLevelEl = document.getElementById('wasteLevel');
const flowRateEl = document.getElementById('flowRate');
const flowMetaEl = document.getElementById('flowMeta');
const totalDispensedEl = document.getElementById('totalDispensed');
const userCountEl = document.getElementById('userCount');
const effScoreEl = document.getElementById('effScore');
const cleanBar = document.getElementById('cleanBar');
const wasteBar = document.getElementById('wasteBar');
const flowBar = document.getElementById('flowBar');

function formatValue(value, unit) {
    if (value === null || value === undefined || value === 0) {
        return 'nil';
    }
    return value + (unit || '');
}

const dataRef = database.ref('hydrotrace/data');
dataRef.on('value', (snapshot) => {
    const data = snapshot.val() || {};

    // Clean Tank Level
    const clean = data.cleanLevel;
    if (clean !== null && clean !== undefined && clean !== 0) {
        cleanLevelEl.textContent = clean + ' L';
        cleanBar.style.width = Math.min((clean / 60) * 100, 100).toFixed(1) + '%';
    } else {
        cleanLevelEl.textContent = 'nil';
        cleanBar.style.width = '0%';
    }

    // Wastewater Accumulated
    const waste = data.wasteLevel;
    if (waste !== null && waste !== undefined && waste !== 0) {
        wasteLevelEl.textContent = waste + ' mL';
        wasteBar.style.width = Math.min((waste / 3000) * 100, 100).toFixed(1) + '%';
    } else {
        wasteLevelEl.textContent = 'nil';
        wasteBar.style.width = '0%';
    }

    // Active Flow Rate (in mL/min)
    const flow = data.flowRate;
    if (flow !== null && flow !== undefined && flow !== 0) {
        flowRateEl.textContent = flow + ' mL/min';
        flowRateEl.className = 'dash-panel-val aqua';
        flowMetaEl.innerHTML = '<span style="color:var(--aqua)">●</span> Active dispensing';
        flowBar.style.width = Math.min((flow / 1200) * 100, 100).toFixed(1) + '%';
    } else {
        flowRateEl.textContent = '0.0 mL/min';
        flowRateEl.className = 'dash-panel-val seafoam';
        flowMetaEl.textContent = 'No active dispensing';
        flowBar.style.width = '0%';
    }

    // Total Dispensed Today
    const dispensed = data.totalDispensed;
    totalDispensedEl.textContent = formatValue(dispensed, ' L');

    // Users Today
    const users = data.userCount;
    userCountEl.textContent = formatValue(users, '');

    // Efficiency Score
    const eff = data.effScore;
    effScoreEl.textContent = formatValue(eff, '%');

}, (error) => {
    console.warn('Dashboard read error:', error);
    cleanLevelEl.textContent = 'offline';
    wasteLevelEl.textContent = 'offline';
    flowRateEl.textContent = 'offline';
    totalDispensedEl.textContent = 'offline';
    userCountEl.textContent = 'offline';
    effScoreEl.textContent = 'offline';
});

// ============================================================
// 2. USERS & ACTIVITY LOG – read from firebase/users and /transactions
// ============================================================
let userMap = {};
let transactions = [];
const activityBody = document.getElementById('activityBody');

// Load users map
const usersRef = database.ref('hydrotrace/users');
usersRef.on('value', (snapshot) => {
    const usersData = snapshot.val() || {};
    userMap = {};
    Object.keys(usersData).forEach(key => {
        const user = usersData[key];
        if (user && user.rfid) {
            userMap[user.rfid] = {
                name: user.name || 'Unknown',
                userId: user.userId || 'N/A'
            };
        }
    });
    console.log('✅ User map loaded:', Object.keys(userMap).length, 'users');
    renderActivity();
}, (error) => {
    console.warn('Error loading users:', error);
});

// Load transactions (latest 10)
const transactionsRef = database.ref('hydrotrace/transactions');
transactionsRef.limitToLast(10).on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) {
        transactions = [];
        renderActivity();
        return;
    }
    const newList = Object.values(data).map(entry => {
        if (!entry.timestamp) {
            entry.timestamp = Date.now();
        }
        return entry;
    });
    newList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    transactions = newList.slice(0, 5);
    renderActivity();
}, (error) => {
    console.warn('Error loading transactions:', error);
    activityBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--red);">Error loading activity</td></tr>`;
});

function renderActivity() {
    if (!activityBody) return;

    if (transactions.length === 0) {
        activityBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No activity logged</td></tr>`;
        return;
    }

    let html = '';
    transactions.forEach(entry => {
        const rfid = entry.rfid || '';
        const user = userMap[rfid] || null;
        const userId = user ? user.userId : 'N/A';
        const name = user ? user.name : 'Unknown User';
        const dispensed = entry.dispensed || 0;
        const wasted = entry.wasted || 0;
        const time = entry.time || '--:--:--';

        let badgeClass, badgeText;
        if (wasted === 0) {
            badgeClass = 'badge-green';
            badgeText = '✓ Zero Waste';
        } else if (wasted < 30) {
            badgeClass = 'badge-amber';
            badgeText = '⚠ Minor Runoff';
        } else {
            badgeClass = 'badge-red';
            badgeText = '✗ High Wastage';
        }

        html += `<tr>
            <td style="color:var(--aqua)">${userId}</td>
            <td>${name}</td>
            <td>${time}</td>
            <td>${dispensed} mL</td>
            <td>${wasted} mL</td>
            <td><span class="badge ${badgeClass}">${badgeText}</span></td>
        </tr>`;
    });

    activityBody.innerHTML = html;
}

transactionsRef.limitToLast(1).on('child_added', (snapshot) => {
    const newEntry = snapshot.val();
    if (!newEntry) return;
    if (!newEntry.timestamp) newEntry.timestamp = Date.now();
    const exists = transactions.some(t => t.timestamp === newEntry.timestamp && t.rfid === newEntry.rfid);
    if (!exists) {
        transactions.unshift(newEntry);
        if (transactions.length > 5) transactions.pop();
        renderActivity();
    }
});

// ============================================================
// 3. SCROLL REVEAL
// ============================================================
const revealElements = document.querySelectorAll(
    '.component-card, .feature-card, .future-card, .impact-metric, .data-card, ' +
    '.control-card, .error-item, .faq-item, .section-title, .section-sub, ' +
    '.section-eyebrow, .stats-strip .stat-item, .contact-info, .contact-form, ' +
    '.dashboard-shell, .cta-section h2, .cta-section p, .cta-section .btn-primary, .cta-section .btn-secondary'
);
revealElements.forEach((el, index) => {
    el.classList.add('reveal');
    const delay = Math.min(index % 6 + 1, 6);
    el.classList.add(`delay-${delay}`);
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' });
revealElements.forEach(el => revealObserver.observe(el));

document.querySelectorAll('section').forEach(section => {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
            }
        });
    }, { threshold: 0.1 });
    sectionObserver.observe(section);
});

window.addEventListener('load', () => {
    if (!window.location.hash) {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
});

// ============================================================
// 4. CONTACT FORM SUBMISSION → FIREBASE (hydrotrace)
//    KEY = formattedTimestamp string
// ============================================================
const contactForm = document.getElementById('contactForm');

function formatTimestamp() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const sec = pad(now.getSeconds());
    const min = pad(now.getMinutes());
    const hrs = pad(now.getHours());
    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1);
    const year = now.getFullYear();
    return `${sec}${min}${hrs}${day}${month}${year}`;
}

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const org = document.getElementById('contactOrg').value.trim() || 'N/A';
    const stations = document.getElementById('contactStations').value.trim() || 'N/A';
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) {
        alert('Please fill in all required fields.');
        return;
    }

    const now = Date.now();
    const formatted = formatTimestamp(); // e.g., "27561903072026"

    const responsesRef = database.ref('responses/hydrotrace');

    // ✅ KEY = formattedTimestamp string
    responsesRef.child(formatted).set({
        name: name,
        email: email,
        organization: org,
        stations: stations,
        message: message,
        formattedTimestamp: formatted
    }).then(() => {
        alert('✅ Thank you for reaching out! We\'ll respond within 24 hours.');
        contactForm.reset();
    }).catch((error) => {
        console.error('Error sending message:', error);
        alert('❌ Something went wrong. Please try again later.');
    });
});

console.log('HydroTrace loaded · theme:', currentTheme);