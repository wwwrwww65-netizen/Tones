const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

// =========================================================================
// 1. GENERATE login.html
// =========================================================================
let loginHtml = indexHtml;

const sendinForm = `
    <!-- MikroTik CHAP sendin form & MD5 authentication -->
    <form name="sendin" action="$(link-login-only)" method="post" style="display:none;">
        <input type="hidden" name="username" />
        <input type="hidden" name="password" />
        <input type="hidden" name="dst" value="$(link-orig)" />
        <input type="hidden" name="popup" value="true" />
    </form>
    <script type="text/javascript" src="md5.js"></script>
    <script type="text/javascript">
    function doLogin() {
        var uField = document.login.username;
        var u = uField ? uField.value.trim() : '';
        if (typeof hotspotConfig !== 'undefined' && hotspotConfig['input-rm-white-spaces']) {
            u = u.replace(/\\s+/g, '');
            if (uField) uField.value = u;
        }
        var pField = document.login.password;
        var p = pField ? pField.value : '';
        if (!p || p === '') {
            var lType = (typeof hotspotConfig !== 'undefined' && hotspotConfig['login-type']) ? hotspotConfig['login-type'] : 'User';
            if (lType === 'User' || lType === 'passwordAsUser' || lType === 'user') {
                p = u;
                if (pField) pField.value = u;
            }
        }
        var speedSelect = document.getElementById('speed');
        var chUpdate = document.getElementById('chupdate');
        var domain = '';
        if (speedSelect && speedSelect.value && typeof hotspotConfig !== 'undefined' && hotspotConfig['login-speeds-mode'] === true && hotspotConfig['speed-button'] === true) {
            domain = speedSelect.value;
        }
        if (chUpdate && chUpdate.checked && typeof hotspotConfig !== 'undefined' && hotspotConfig['update-button'] === true) {
            domain += '_Uoff';
        }
        if (domain && document.login.domain) {
            document.login.domain.value = domain;
        }
        if (typeof rememberLoginCard === 'function') {
            try { rememberLoginCard(u); } catch(e) {}
        }
        var chapId = '$(chap-id)';
        var chapChallenge = '$(chap-challenge)';
        if (chapId && chapId !== '' && !chapId.includes('$(') && typeof hexMD5 === 'function' && document.sendin) {
            document.sendin.username.value = (domain ? u + '@' + domain : u);
            document.sendin.password.value = hexMD5(chapId + p + chapChallenge);
            document.sendin.submit();
            return false;
        }
        var linkLoginOnly = '$(link-login-only)';
        if (linkLoginOnly.includes('$(')) {
            if (typeof userLogin === 'function') {
                userLogin();
                return false;
            }
        }
        return true;
    }
    </script>
`;

loginHtml = loginHtml.replace('</head>', sendinForm + '\n</head>');

// Replace login form with action="$(link-login-only)" and onsubmit="return doLogin();"
loginHtml = loginHtml.replace(
    '<form class="login-form" name="login" onsubmit="return false;">',
    `<form class="login-form" name="login" action="$(link-login-only)" method="post" onsubmit="return doLogin();">
                            <input type="hidden" name="dst" value="$(link-orig)" />
                            <input type="hidden" name="popup" value="true" />
                            <input type="hidden" name="domain" value="" />
                            $(if error)
                            <div id="mikrotik-error-box" style="background: rgba(220, 38, 38, 0.22); border: 1px solid rgba(239, 68, 68, 0.5); color: #fecdd3; padding: 12px 16px; border-radius: 14px; margin-bottom: 16px; font-size: 14px; font-weight: 700; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: #f43f5e; flex-shrink: 0;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                                <span id="mikrotik-error-msg">$(error)</span>
                            </div>
                            $(endif)`
);

// Make submit button type="submit"
loginHtml = loginHtml.replace(
    '<button class="button login-submit login-submit-btn" parent-id="status" enable-hot-cookie\n                                type="button" id="mainLoginBtn">',
    '<button class="button login-submit login-submit-btn" parent-id="status" enable-hot-cookie type="submit" id="mainLoginBtn">'
);

// Make #login active and visible, #status hidden
loginHtml = loginHtml.replace('<div class="app active" id="login">', '<div class="app active" id="login" style="display: block;">');
loginHtml = loginHtml.replace('<div class="app" id="status">', '<div class="app" id="status" style="display: none;">');

fs.writeFileSync('login.html', loginHtml, 'utf8');
console.log('Successfully generated login.html (size:', loginHtml.length, ')');

// =========================================================================
// 2. GENERATE status.html
// =========================================================================
let statusHtml = indexHtml;

// Add refresh timeout to head
const statusMeta = `
    $(if refresh-timeout)
    <meta http-equiv="refresh" content="$(refresh-timeout-secs)">
    $(endif)
`;
statusHtml = statusHtml.replace('<head>', '<head>' + statusMeta);

// In status.html, make #status active and visible, #login hidden
statusHtml = statusHtml.replace('<div class="app active" id="login">', '<div class="app" id="login" style="display: none;">');
statusHtml = statusHtml.replace('<div class="app" id="status">', '<div class="app active" id="status" style="display: block;">');

// Populate MikroTik status values into HTML
statusHtml = statusHtml.replace('<span class="metric-val cyan" id="bytes_out">-</span>', '<span class="metric-val cyan" id="bytes_out">$(bytes-out-nice)</span>');
statusHtml = statusHtml.replace('<span class="metric-val emerald" id="bytes_in">-</span>', '<span class="metric-val emerald" id="bytes_in">$(bytes-in-nice)</span>');
statusHtml = statusHtml.replace('<span class="metric-val gold" id="remain_bytes_total">مفتوح</span>', '<span class="metric-val gold" id="remain_bytes_total">$(remain-bytes-total-nice)</span>');
statusHtml = statusHtml.replace('<span class="metric-val" id="uptime">-</span>', '<span class="metric-val" id="uptime">$(uptime)</span>');
statusHtml = statusHtml.replace('<span class="metric-val gold" id="session_time_left">مفتوح</span>', '<span class="metric-val gold" id="session_time_left">$(session-time-left)</span>');

// Replace session action buttons with real MikroTik logout forms
const logoutForms = `
                        <!-- Session Action Controls with MikroTik Logout Form -->
                        <div class="status-actions-row">
                            <form action="$(link-logout)" name="logout" method="post" style="flex: 1; display: flex;">
                                <button class="btn-danger-glass app-logout" erase-cookie clear-hot-cookie type="submit" style="width: 100%;">
                                    <svg viewBox="0 0 24 24" class="action-btn-icon">
                                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                                    </svg>
                                    <span>تسجيل الخروج</span>
                                </button>
                            </form>
                            <form action="$(link-logout)" name="logout2" method="post" style="flex: 1; display: flex;">
                                <button class="btn-secondary-glass app-logout" type="submit" style="width: 100%;">
                                    <svg viewBox="0 0 24 24" class="action-btn-icon">
                                        <path d="M16.01 7L16 3h-2v4h-4V3H8v4h-.01C6.89 7 6 7.89 6 8.98v5.52L9.5 18v3h5v-3l3.5-3.51V9c0-1.1-.9-2-1.99-2z" />
                                    </svg>
                                    <span>قطع الاتصال</span>
                                </button>
                            </form>
                        </div>
`;

statusHtml = statusHtml.replace(
    /<!-- Session Action Controls -->[\s\S]*?<\/div>\s*<\/div>\s*<button class="button app-submit/m,
    logoutForms + '\n                        <button class="button app-submit'
);

fs.writeFileSync('status.html', statusHtml, 'utf8');
console.log('Successfully generated status.html (size:', statusHtml.length, ')');
