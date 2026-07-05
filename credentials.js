// ================================================================
//  CREDENTIALS – HydroTrace
// ================================================================

window.TRACKER_CONFIG = {
    // Project name – determines Firebase path and StatCounter loading
    project: 'hydrotrace',

    // EmailJS – set sendEmail: false to disable emails
    sendEmail: true,
    emailjsPublicKey: 'Lm0xRXQfM_1D_Ixjg',
    emailjsServiceId: 'service_4ijc7zv',
    emailjsTemplateId: 'template_ywkznzc',   // HydroTrace template
    receiverEmail: 'pavan310512@gmail.com',

    // IPinfo token – get free token from https://ipinfo.io/signup
    ipinfoToken: 'fd9d2987ec82ec',

    // StatCounter (only used when project = 'hydrotrace')
    statcounter: {
        project: 13333804,
        invisible: 1,
        security: '719d08da'
    },

    // Set to false to block the HTTP fallback (ip-api.com) on HTTPS sites
    allowHttpFallback: false
};