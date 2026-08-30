const fs = require('fs');

// Read source template
const sourceTemplatePath = fs.existsSync('login-source.html') ? 'login-source.html' : 'index.html';
const indexHtml = fs.readFileSync(sourceTemplatePath, 'utf8');

// =========================================================================
// 1. GENERATE login.html
// =========================================================================
let loginHtml = indexHtml;

const chapAndSendin = `
    <!-- MikroTik CHAP sendin form & MD5 authentication -->
    <script type="text/javascript" src="md5.js"></script>
    <script type="text/javascript">
    <!--
    function cleanCardNumber(str) {
        if (!str) return '';
        var arabicNums = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
        var result = String(str).trim();
        for (var i = 0; i < 10; i++) {
            result = result.split(arabicNums[i]).join(String(i));
        }
        return result.replace(/\s+/g, '');
    }
    function removeSpaces(str) {
        return cleanCardNumber(str);
    }
    function doLogin() {
        var uField = document.login ? (document.login.username || document.querySelector('input[name="username"]')) : document.querySelector('input[name="username"]');
        var u = uField ? cleanCardNumber(uField.value) : '';
        if (uField) uField.value = u;
        
        if (!u) {
            var errEl = document.getElementById("error");
            if (errEl) errEl.innerText = "يرجى إدخال رقم الكرت للمتابعة";
            var errContainer = document.querySelector(".error-container");
            if (errContainer) {
                errContainer.classList.add("active");
                setTimeout(function() { errContainer.classList.add("zoom"); }, 50);
                setTimeout(function() {
                    errContainer.classList.remove("active");
                    errContainer.classList.remove("zoom");
                }, 6000);
            }
            if (uField) uField.focus();
            return false;
        }

        // Save username in local storage so it is never lost
        try {
            localStorage.setItem('mikrotik_last_user', u);
        } catch(e) {}
        
        // Button Loading State
        var btn = document.getElementById("mainLoginBtn") || document.querySelector(".login-submit-btn");
        if (btn) {
            btn.classList.add("processing");
        }
        
        if (typeof rememberLoginCard === 'function') {
            try { rememberLoginCard(u); } catch(e) {}
        }
        
        var isSpeedOn = (typeof hotspotConfig !== "undefined" && hotspotConfig["speed-button"] === true && hotspotConfig["login-speeds-mode"] !== false);
        var speedSelect = document.querySelector("#speed, select[speed-field]");
        var chUpdate = document.getElementById("chupdate");
        var updateFlag = (chUpdate && chUpdate.checked) ? (chUpdate.value || "_Uon") : "";

        if (isSpeedOn && speedSelect && speedSelect.value) {
            var domainVal = speedSelect.value + updateFlag;
            if (document.login) {
                speedSelect.setAttribute("name", "domain");
            }
        } else {
            if (speedSelect) {
                speedSelect.removeAttribute("name");
            }
        }

        return true;
    }
    //-->
    </script>
`;

loginHtml = loginHtml.replace('</head>', chapAndSendin + '\n</head>');

// Error translation block for MikroTik Hotspot
const errorBoxHtml = `
                            $(if error)
                            <div id="mikrotik-error-box" style="background: rgba(220, 38, 38, 0.22); border: 1px solid rgba(239, 68, 68, 0.5); color: #fecdd3; padding: 12px 16px; border-radius: 14px; margin-bottom: 16px; font-size: 14px; font-weight: 700; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: #f43f5e; flex-shrink: 0;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                                <span id="mikrotik-error-msg">
                                    <script type="text/javascript">
                                    (function() {
                                        var rawErr = "$(error)".toLowerCase();
                                        var arabicMsg = "$(error)";
                                        if (rawErr.indexOf("invalid username") !== -1 || rawErr.indexOf("invalid password") !== -1 || rawErr.indexOf("not found") !== -1 || rawErr.indexOf("user&not") !== -1) {
                                            arabicMsg = "رقم الكرت غير صحيح أو منتهي الصلاحية، يرجى التأكد والمحاولة مجدداً";
                                        } else if (rawErr.indexOf("traffic limit") !== -1 || rawErr.indexOf("transfer limit") !== -1) {
                                            arabicMsg = "لقد انتهى رصيد هذا الكرت، يرجى التعبئة أو استخدام كرت جديد";
                                        } else if (rawErr.indexOf("uptime limit") !== -1 || rawErr.indexOf("no more online time") !== -1) {
                                            arabicMsg = "عذراً، لقد انتهى الوقت المتاح لهذا الكرت";
                                        } else if (rawErr.indexOf("session limit") !== -1 || rawErr.indexOf("no more sessions") !== -1 || rawErr.indexOf("simultaneous") !== -1) {
                                            arabicMsg = "هذا الكرت متصل حالياً في جهاز آخر";
                                        } else if (rawErr.indexOf("not allowed to log in from this mac") !== -1 || rawErr.indexOf("invalid calling-station-id") !== -1 || rawErr.indexOf("invalid-mac") !== -1) {
                                            arabicMsg = "هذا الكرت مقترن بجهاز آخر ولا يمكن استخدامه هنا";
                                        } else if (rawErr.indexOf("radius") !== -1 || rawErr.indexOf("timeout") !== -1 || rawErr.indexOf("server&is&not&responding") !== -1) {
                                            arabicMsg = "خادم المصادقة لا يستجيب، يرجى المحاولة بعد قليل";
                                        } else if (rawErr.indexOf("already authorizing") !== -1) {
                                            arabicMsg = "جاري تسجيل الدخول، يرجى الانتظار ثوانٍ معدودة";
                                        } else if (rawErr.indexOf("access denied") !== -1) {
                                            arabicMsg = "بطاقة سهرة لا يمكن استخدامها في هذا الوقت";
                                        }
                                        document.write(arabicMsg);
                                    })();
                                    </script>
                                </span>
                            </div>
                            $(endif)`;

// Replace login form with action="$(link-login-only)" and onsubmit="return doLogin();"
loginHtml = loginHtml.replace(
    /<form class="login-form" name="login"[^>]*>/,
    `<form class="login-form" name="login" action="$(link-login-only)" method="post" onSubmit="return doLogin();">
                            <input type="hidden" name="dst" value="$(link-orig)" />
                            <input type="hidden" name="popup" value="true" />
                            ${errorBoxHtml}`
);

// Ensure username value is set to $(username)
loginHtml = loginHtml.replace(
    /name="username"\s+value=""/,
    'name="username" value="$(username)"'
);

// Make submit button type="submit"
loginHtml = loginHtml.replace(
    /type="button"\s+id="mainLoginBtn"/,
    'type="submit" id="mainLoginBtn"'
);

// Make #login active and visible, #status hidden
loginHtml = loginHtml.replace('<div class="app active" id="login">', '<div class="app active" id="login" style="display: block;">');
loginHtml = loginHtml.replace('<div class="app" id="status">', '<div class="app" id="status" style="display: none;">');

// Disable dummy password field so only username is sent to MikroTik (matching soma)
loginHtml = loginHtml.replace(
    '<input type="hidden" name="password"',
    '<input type="hidden" id="dummy_password"'
);

// Script to handle auto-fill of username and error toast popup on login.html load
const loginAutoFillAndToastScript = `
<script type="text/javascript">
(function() {
    // 1. Auto-fill username if available
    var uField = document.querySelector('input[name="username"], input[username-field]');
    if (uField) {
        var uVal = "$(username)";
        if (!uVal || uVal.includes('$(')) {
            var urlParams = new URLSearchParams(window.location.search);
            uVal = urlParams.get('username') || '';
        }
        if (!uVal) {
            try { uVal = localStorage.getItem('mikrotik_last_user') || ''; } catch(e) {}
        }
        if (uVal && uVal !== "-") {
            uField.value = uVal;
        }
    }

    // 2. Trigger top floating toast notification on error
    var rawErr = "$(error)";
    if (rawErr && !rawErr.includes('$(')) {
        var arabicMsg = "حدث خطأ أثناء تسجيل الدخول";
        var errLower = rawErr.toLowerCase();
        if (errLower.indexOf("invalid username") !== -1 || errLower.indexOf("invalid password") !== -1 || errLower.indexOf("not found") !== -1 || errLower.indexOf("user&not") !== -1) {
            arabicMsg = "رقم الكرت غير صحيح أو منتهي الصلاحية، يرجى التأكد والمحاولة مجدداً";
        } else if (errLower.indexOf("traffic limit") !== -1 || errLower.indexOf("transfer limit") !== -1) {
            arabicMsg = "لقد انتهى رصيد هذا الكرت، يرجى التعبئة أو استخدام كرت جديد";
        } else if (errLower.indexOf("uptime limit") !== -1 || errLower.indexOf("no more online time") !== -1) {
            arabicMsg = "عذراً، لقد انتهى الوقت المتاح لهذا الكرت";
        } else if (errLower.indexOf("session limit") !== -1 || errLower.indexOf("no more sessions") !== -1 || errLower.indexOf("simultaneous") !== -1) {
            arabicMsg = "هذا الكرت متصل حالياً في جهاز آخر";
        } else if (errLower.indexOf("not allowed to log in from this mac") !== -1 || errLower.indexOf("invalid calling-station-id") !== -1 || errLower.indexOf("invalid-mac") !== -1) {
            arabicMsg = "هذا الكرت مقترن بجهاز آخر ولا يمكن استخدامه هنا";
        } else if (errLower.indexOf("radius") !== -1 || errLower.indexOf("timeout") !== -1 || errLower.indexOf("server&is&not&responding") !== -1) {
            arabicMsg = "خادم المصادقة لا يستجيب، يرجى المحاولة بعد قليل";
        } else if (errLower.indexOf("already authorizing") !== -1) {
            arabicMsg = "جاري تسجيل الدخول، يرجى الانتظار ثوانٍ معدودة";
        } else if (errLower.indexOf("access denied") !== -1) {
            arabicMsg = "بطاقة سهرة لا يمكن استخدامها في هذا الوقت";
        } else {
            arabicMsg = rawErr;
        }

        var errToastEl = document.getElementById("error");
        if (errToastEl) {
            errToastEl.innerText = arabicMsg;
        }
        var errorContainer = document.querySelector(".error-container");
        if (errorContainer) {
            errorContainer.classList.add("active");
            setTimeout(function() {
                errorContainer.classList.add("zoom");
            }, 60);
            setTimeout(function() {
                errorContainer.classList.remove("active");
                errorContainer.classList.remove("zoom");
            }, 6500);
        }

        // Auto focus input field so user can edit their card immediately
        if (uField) {
            setTimeout(function() {
                uField.focus();
                uField.select();
            }, 250);
        }
    }
})();
</script>
`;

loginHtml = loginHtml.replace('</body>', loginAutoFillAndToastScript + '\n</body>');

fs.writeFileSync('login.html', loginHtml, 'utf8');
console.log('Successfully generated login.html (size:', loginHtml.length, ')');

// =========================================================================
// 2. GENERATE status.html
// =========================================================================
let statusHtml = indexHtml;

// Add cache control to head
const statusMeta = `
    <meta http-equiv="pragma" content="no-cache">
    <meta http-equiv="expires" content="-1">
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
statusHtml = statusHtml.replace('<span class="status-user-badge" id="username">-</span>', '<span class="status-user-badge" id="username">$(username)</span>');
statusHtml = statusHtml.replace('<span class="status-ip-badge" id="ip">-</span>', '<span class="status-ip-badge" id="ip">$(ip)</span>');

// Replace session action controls with real MikroTik logout & disconnect forms
const oldSessionActions = `                        <!-- Session Action Controls -->
                        <div class="status-actions-row">
                            <button class="btn-danger-glass app-logout" erase-cookie clear-hot-cookie type="button">
                                <svg viewBox="0 0 24 24" class="action-btn-icon">
                                    <path
                                        d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                                </svg>
                                <span>تسجيل الخروج</span>
                            </button>
                            <button class="btn-secondary-glass app-logout" type="button">
                                <svg viewBox="0 0 24 24" class="action-btn-icon">
                                    <path
                                        d="M16.01 7L16 3h-2v4h-4V3H8v4h-.01C6.89 7 6 7.89 6 8.98v5.52L9.5 18v3h5v-3l3.5-3.51V9c0-1.1-.9-2-1.99-2z" />
                                </svg>
                                <span>قطع الاتصال</span>
                            </button>
                        </div>`;

const statusActionsRealHtml = `                        <!-- Session Action Controls with Direct MikroTik Logout & Disconnect Forms -->
                        <div class="status-actions-row" style="display: flex; gap: 10px; width: 100%; margin-top: 14px;">
                            <form action="$(link-logout)" name="logout" method="post" onSubmit="try { localStorage.removeItem('mikrotik_last_user'); } catch(e) {}" style="flex: 1; margin: 0;">
                                <input type="hidden" name="erase-cookie" value="on" />
                                <button class="btn-danger-glass" type="submit" style="width: 100%;">
                                    <svg viewBox="0 0 24 24" class="action-btn-icon">
                                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                                    </svg>
                                    <span>تسجيل الخروج</span>
                                </button>
                            </form>
                            <form action="$(link-logout)" name="disconnect" method="post" onSubmit="try { localStorage.setItem('mikrotik_last_user', '$(username)'); } catch(e) {}" style="flex: 1; margin: 0;">
                                <button class="btn-secondary-glass" type="submit" style="width: 100%;">
                                    <svg viewBox="0 0 24 24" class="action-btn-icon">
                                        <path d="M16.01 7L16 3h-2v4h-4V3H8v4h-.01C6.89 7 6 7.89 6 8.98v5.52L9.5 18v3h5v-3l3.5-3.51V9c0-1.1-.9-2-1.99-2z" />
                                    </svg>
                                    <span>قطع الاتصال</span>
                                </button>
                            </form>
                        </div>`;

statusHtml = statusHtml.replace(oldSessionActions, statusActionsRealHtml);



// Add Arabic time formatting script and store username in status.html
const statusTimeFormatScript = `
<script type="text/javascript">
(function() {
    var rawLeft = "$(session-time-left)";
    if (rawLeft && !rawLeft.includes('$(')) {
        var el = document.getElementById("session_time_left");
        if (el) {
            el.innerHTML = rawLeft.replace(/w/g, " أسبوع , ").replace(/d/g, " يوم , ").replace(/h/g, " ساعة , ").replace(/m/g, " دقيقة , ").replace(/s/g, " ثانية");
        }
    }
    var u = "$(username)";
    if (u && !u.includes('$(') && u !== "-") {
        try { localStorage.setItem('mikrotik_last_user', u); } catch(e) {}
    }
})();
</script>
`;
statusHtml = statusHtml.replace('</body>', statusTimeFormatScript + '\n</body>');

fs.writeFileSync('status.html', statusHtml, 'utf8');
console.log('Successfully generated status.html (size:', statusHtml.length, ')');

// =========================================================================
// 3. GENERATE redirect.html
// =========================================================================
const redirectHtml = `$(if http-status == 302)Hotspot redirect$(endif)$(if http-header == "Location")$(link-redirect)$(endif)<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>...</title>
<meta http-equiv="refresh" content="0; url=$(link-redirect)">
<meta http-equiv="pragma" content="no-cache">
<meta http-equiv="expires" content="-1">
<style>html, body { background-color: #0f172a !important; margin: 0; padding: 0; overflow: hidden; }</style>
<script type="text/javascript">
window.location.replace('$(link-redirect)');
</script>
</head>
<body style="background-color: #0f172a; margin: 0; padding: 0;"></body>
</html>`;

fs.writeFileSync('redirect.html', redirectHtml, 'utf8');
if (fs.existsSync('soma')) fs.writeFileSync('soma/redirect.html', redirectHtml, 'utf8');
console.log('Successfully generated redirect.html');

// =========================================================================
// 4. GENERATE rlogin.html
// =========================================================================
const rloginHtml = `$(if http-status == 302)Hotspot login required$(endif)$(if http-header == "Location")$(link-redirect)$(endif)<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>...</title>
<meta http-equiv="refresh" content="0; url=$(link-redirect)">
<meta http-equiv="pragma" content="no-cache">
<meta http-equiv="expires" content="-1">
<style>html, body { background-color: #0f172a !important; margin: 0; padding: 0; overflow: hidden; }</style>
<script type="text/javascript">
window.location.replace('$(link-redirect)');
</script>
</head>
<body style="background-color: #0f172a; margin: 0; padding: 0;"></body>
</html>`;

fs.writeFileSync('rlogin.html', rloginHtml, 'utf8');
if (fs.existsSync('soma')) fs.writeFileSync('soma/rlogin.html', rloginHtml, 'utf8');
console.log('Successfully generated rlogin.html');

// =========================================================================
// 5. GENERATE alogin.html (Instant direct redirect to status without delay screen)
// =========================================================================
const aloginHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>...</title>
<meta http-equiv="refresh" content="0; url=$(link-status)">
<meta http-equiv="pragma" content="no-cache">
<meta http-equiv="expires" content="-1">
<style>html, body { background-color: #0f172a !important; margin: 0; padding: 0; overflow: hidden; }</style>
<script type="text/javascript">
(function() {
    var target = '$(link-status)';
    if (!target || target.includes('$(')) target = 'status.html';
    window.location.replace(target);
})();
</script>
</head>
<body style="background-color: #0f172a; margin: 0; padding: 0;"></body>
</html>`;

fs.writeFileSync('alogin.html', aloginHtml, 'utf8');
if (fs.existsSync('soma')) fs.writeFileSync('soma/alogin.html', aloginHtml, 'utf8');
console.log('Successfully generated alogin.html (Instant Zero-Delay Redirect)');

// =========================================================================
// 6. GENERATE logout.html (Instant direct redirect to login preserving card)
// =========================================================================
const logoutHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>...</title>
<meta http-equiv="refresh" content="0; url=$(link-login)">
<meta http-equiv="pragma" content="no-cache">
<meta http-equiv="expires" content="-1">
<style>html, body { background-color: #0f172a !important; margin: 0; padding: 0; overflow: hidden; }</style>
<script type="text/javascript">
(function() {
    var u = "";
    try {
        u = localStorage.getItem('mikrotik_last_user') || localStorage.getItem('hotspot_username') || '';
    } catch(e) {}
    var target = '$(link-login)';
    if (!target || target.includes('$(')) target = 'login.html';
    if (u && u !== "-") {
        target += (target.indexOf('?') === -1 ? '?' : '&') + 'username=' + encodeURIComponent(u);
    }
    window.location.replace(target);
})();
</script>
</head>
<body style="background-color: #0f172a; margin: 0; padding: 0;"></body>
</html>`;

fs.writeFileSync('logout.html', logoutHtml, 'utf8');
if (fs.existsSync('soma')) fs.writeFileSync('soma/logout.html', logoutHtml, 'utf8');
console.log('Successfully generated logout.html (Instant Zero-Delay Redirect with Card Preserved)');

// =========================================================================
// 7. GENERATE index.html (MikroTik Router & Browser Dispatcher)
// =========================================================================
const indexDispatcherHtml = `$(if logged-in == 'yes')
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>...</title>
<meta http-equiv="refresh" content="0; url=$(link-status)">
<meta http-equiv="pragma" content="no-cache">
<meta http-equiv="expires" content="-1">
<style>html, body { background-color: #0f172a !important; margin: 0; padding: 0; overflow: hidden; }</style>
<script type="text/javascript">
(function() {
    var target = '$(link-status)';
    if (!target || target.includes('$(')) target = 'status.html';
    window.location.replace(target);
})();
</script>
</head>
<body style="background-color: #0f172a; margin: 0; padding: 0;"></body>
</html>
$(else)
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>...</title>
<meta http-equiv="refresh" content="0; url=$(link-login)">
<meta http-equiv="pragma" content="no-cache">
<meta http-equiv="expires" content="-1">
<style>html, body { background-color: #0f172a !important; margin: 0; padding: 0; overflow: hidden; }</style>
<script type="text/javascript">
(function() {
    var target = '$(link-login)';
    if (!target || target.includes('$(')) target = 'login.html';
    window.location.replace(target);
})();
</script>
</head>
<body style="background-color: #0f172a; margin: 0; padding: 0;"></body>
</html>
$(endif)
`;

fs.writeFileSync('index.html', indexDispatcherHtml, 'utf8');
if (fs.existsSync('soma')) fs.writeFileSync('soma/index.html', indexDispatcherHtml, 'utf8');
console.log('Successfully generated index.html (MikroTik Conditional Status/Login Dispatcher)');

// Sync login.html and status.html to soma directory if it exists
if (fs.existsSync('soma')) {
    fs.writeFileSync('soma/login.html', loginHtml, 'utf8');
    fs.writeFileSync('soma/status.html', statusHtml, 'utf8');
    console.log('Successfully synchronized all templates into soma/ folder');
}


