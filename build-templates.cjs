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

        // Native seamless submit to MikroTik (matching standard reliable Hotspot flow)
        return true;
    }
    //-->
    </script>
`;

loginHtml = loginHtml.replace('</head>', chapAndSendin + '\n</head>');

// Error translation block for MikroTik Hotspot
const errorBoxHtml = `
                            <div id="mikrotik-error-box" style="display: none; background: rgba(220, 38, 38, 0.22); border: 1px solid rgba(239, 68, 68, 0.5); color: #fecdd3; padding: 12px 16px; border-radius: 14px; margin-bottom: 16px; font-size: 14px; font-weight: 700; text-align: center; align-items: center; justify-content: center; gap: 8px;">
                                <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: #f43f5e; flex-shrink: 0;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                                <span id="mikrotik-error-msg"></span>
                            </div>
                            <script type="text/javascript">
                            (function() {
                                var rawErr = "$(error)";
                                if (!rawErr || rawErr.trim() === "" || rawErr.indexOf("$(") !== -1 || rawErr === "none") {
                                    return;
                                }
                                var errLower = rawErr.toLowerCase();
                                var arabicMsg = rawErr;
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
                                }
                                var box = document.getElementById("mikrotik-error-box");
                                var msg = document.getElementById("mikrotik-error-msg");
                                if (box && msg) {
                                    msg.textContent = arabicMsg;
                                    box.style.display = "flex";
                                }
                            })();
                            </script>`;

// Replace login form with action="$(link-login-only)" and onsubmit="return doLogin();"
loginHtml = loginHtml.replace(
    /<form class="login-form" name="login"[^>]*>/,
    `<form class="login-form" name="login" action="$(link-login-only)" method="post" onSubmit="return doLogin();">
                            <input type="hidden" name="dst" value="$(link-orig)" />
                            <input type="hidden" name="popup" value="false" />
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
                            <form action="$(link-logout)" name="logout" method="post" onSubmit="if(this.action.includes('$(')) this.action='/logout'; try { localStorage.removeItem('mikrotik_last_user'); } catch(e) {}" style="flex: 1; margin: 0;">
                                <input type="hidden" name="erase-cookie" value="on" />
                                <button class="btn-danger-glass" type="submit" style="width: 100%;">
                                    <svg viewBox="0 0 24 24" class="action-btn-icon">
                                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                                    </svg>
                                    <span>تسجيل الخروج</span>
                                </button>
                            </form>
                            <form action="$(link-logout)" name="disconnect" method="post" onSubmit="if(this.action.includes('$(')) this.action='/logout'; try { localStorage.setItem('mikrotik_last_user', '$(username)'); } catch(e) {}" style="flex: 1; margin: 0;">
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

// =========================================================================
// 3. GENERATE redirect.html, alogin.html, logout.html, rlogin.html, rstatus.html, radvert.html, error.html
// WITH THE EXACT LIGHT NAVY & CORAL GLASSMORPHISM DESIGN MATCHING login.html & status.html
// =========================================================================

function getPageHtml(config) {
  return `$(if http-status == 302)${config.httpStatusText}$(endif)
$(if http-header == "Location")$(link-${config.targetLink})$(endif)
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="${config.refreshTime}; url=$(link-${config.targetLink})">
    <meta http-equiv="pragma" content="no-cache">
    <meta http-equiv="cache-control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="expires" content="-1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#1a2b4c">
    <title data-network-name>${config.title} | شبكة سوما نت اللاسلكية</title>
    
    <script>
        var hotspotConfig = (typeof hotspotConfig !== "undefined" && Object.keys(hotspotConfig).length > 0) ? hotspotConfig : {};
        function Config(a) { hotspotConfig = a; }
    </script>
    <script src="config/config.js"></script>

    <link rel="shortcut icon" type="image/x-icon" href="img/favicon.ico">
    <link rel="stylesheet" href="fonts/Almarai.css">
    <link rel="stylesheet" href="css/fontello.min.css">
    <!-- Master Colors & Theme Configuration -->
    <link rel="stylesheet" href="css/colors.css">
    <link rel="stylesheet" href="css/style.min.css">
    <!-- Announcements System CSS -->
    <link rel="stylesheet" href="css/announcements-style.css">
    
    <style>
        @keyframes pulseDot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.3); }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        @keyframes fillBar {
            0% { width: 0%; }
            100% { width: 100%; }
        }
        @keyframes pulseGlow {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
    </style>
</head>
<body translate="no">

    <!-- Floating SVG Vector Icons Layer (Exact match to login.html & status.html) -->
    <ul class="floating-icons">
        <!-- 1. Wifi Icon -->
        <li><svg viewBox="0 0 24 24"><path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A16.88 16.88 0 0 0 12 4zm0 2.9a13.9 13.9 0 0 1 9.35 3.65L12 19.89 2.65 10.55A13.9 13.9 0 0 1 12 6.9z" /></svg></li>
        <!-- 2. Royal Star Icon -->
        <li><svg viewBox="0 0 24 24"><path d="M12 1.5l3.09 6.26L22 8.77l-5 4.87 1.18 6.88L12 17.27l-6.18 3.25L7 13.64 2 8.77l6.91-1.01L12 1.5z" /></svg></li>
        <!-- 3. Sparkle Diamond Icon -->
        <li><svg viewBox="0 0 24 24"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" /></svg></li>
        <!-- 4. Global Network Icon -->
        <li><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg></li>
        <!-- 5. Modern Gem Diamond Icon -->
        <li><svg viewBox="0 0 24 24"><path d="M19 3H5L2 9l10 12L22 9l-3-6zM5.3 5h13.4l1.5 3H3.8l1.5-3zm6.7 13.5L5.4 10h13.2L12 18.5z" /></svg></li>
        <!-- 6. Wifi High Wave Icon -->
        <li><svg viewBox="0 0 24 24"><path d="M12 3C6.95 3 2.38 5.05 0 8.41L1.44 9.9C3.47 6.94 7.47 5 12 5c4.53 0 8.53 1.94 10.56 4.9L24 8.41C21.62 5.05 17.05 3 12 3zm0 4c-3.73 0-7.04 1.54-9.4 4l1.45 1.45C5.7 10.82 8.65 9.5 12 9.5c3.35 0 6.3 1.32 8.35 3.35L21.8 11.4C19.44 8.94 16.13 7 12 7zm0 4c-2.4 0-4.57 1-6.14 2.6L12 21l6.14-7.4A8.52 8.52 0 0 0 12 11z" /></svg></li>
        <!-- 7. High-Speed Lightning Bolt Icon -->
        <li><svg viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8H7z" /></svg></li>
        <!-- 8. Four Point Star Burst Icon -->
        <li><svg viewBox="0 0 24 24"><path d="M12 0l2.6 8.4L23 11l-8.4 2.6L12 22l-2.6-8.4L1 11l8.4-2.6L12 0z" /></svg></li>
        <!-- 9. Wifi Strong Signal Icon -->
        <li><svg viewBox="0 0 24 24"><path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A16.88 16.88 0 0 0 12 4zm0 2.9a13.9 13.9 0 0 1 9.35 3.65L12 19.89 2.65 10.55A13.9 13.9 0 0 1 12 6.9z" /></svg></li>
        <!-- 10. Royal Star Outline Icon -->
        <li><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg></li>
        <!-- 11. Diamond Sparkle Icon -->
        <li><svg viewBox="0 0 24 24"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" /></svg></li>
        <!-- 12. Wifi Full Wave Icon -->
        <li><svg viewBox="0 0 24 24"><path d="M12 3C6.95 3 2.38 5.05 0 8.41L1.44 9.9C3.47 6.94 7.47 5 12 5c4.53 0 8.53 1.94 10.56 4.9L24 8.41C21.62 5.05 17.05 3 12 3zm0 4c-3.73 0-7.04 1.54-9.4 4l1.45 1.45C5.7 10.82 8.65 9.5 12 9.5c3.35 0 6.3 1.32 8.35 3.35L21.8 11.4C19.44 8.94 16.13 7 12 7zm0 4c-2.4 0-4.57 1-6.14 2.6L12 21l6.14-7.4A8.52 8.52 0 0 0 12 11z" /></svg></li>
        <!-- 13. Fast Flash Icon -->
        <li><svg viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8H7z" /></svg></li>
        <!-- 14. Crown Star Gem Icon -->
        <li><svg viewBox="0 0 24 24"><path d="M19 3H5L2 9l10 12L22 9l-3-6z" /></svg></li>
    </ul>

    <!-- Ambient Mesh Background (Light Navy Spatial Theme) -->
    <div class="screen-background">
        <span class="screen-background-shape screen-background-shape1"></span>
        <span class="screen-background-shape screen-background-shape2"></span>
        <span class="screen-background-shape screen-background-shape3"></span>
        <span class="screen-background-shape screen-background-shape4"></span>
        <span class="screen-background-shape screen-background-shape5"></span>
        <span class="screen-background-shape screen-background-shape6"></span>
        <span class="screen-background-shape screen-background-shape7"></span>
        <span class="screen-background-shape screen-background-shape8"></span>
    </div>

    <div class="container">
        <div class="screen">
            <div class="screen-content">

                <!-- Top Modern Header Matching login.html & status.html -->
                <header class="top-header">
                    <div class="network-brand">
                        <div class="brand-icon-wrap" aria-label="رمز الواي فاي">
                            <svg class="wifi-animated-icon" viewBox="0 0 24 24">
                                <path class="wifi-sig wifi-sig-3" d="M12 3C7.2 3 2.8 4.9 0 7.9l1.8 1.9C4.3 7.3 8 5.6 12 5.6s7.7 1.7 10.2 4.2L24 7.9C21.2 4.9 16.8 3 12 3z" />
                                <path class="wifi-sig wifi-sig-2" d="M12 7.5c-3.6 0-6.9 1.4-9.3 3.8l1.8 1.9c2-2 4.7-3.1 7.5-3.1s5.5 1.1 7.5 3.1l1.8-1.9c-2.4-2.4-5.7-3.8-9.3-3.8z" />
                                <path class="wifi-sig wifi-sig-1" d="M12 12c-2.4 0-4.6 1-6.2 2.6l1.8 1.9C8.8 15.3 10.3 14.6 12 14.6s3.2 0.7 4.4 1.9l1.8-1.9C16.6 13 14.4 12 12 12z" />
                                <circle class="wifi-sig wifi-sig-dot" cx="12" cy="19.5" r="1.8" />
                            </svg>
                        </div>
                        <div class="brand-info">
                            <span class="brand-name" data-network-name>سوما نت</span>
                            <span class="brand-status">جاري التحويل التلقائي...</span>
                        </div>
                    </div>
                </header>

                <!-- Modern Ticker Bar -->
                <section class="section" style="margin-top: 4px; margin-bottom: 12px;">
                    <div class="ticker-container">
                        <div class="ticker-content-track">
                            <p class="marquee" data-news-line>مرحباً بكم في شبكة سوما نت اللاسلكية - سرعات فائقة وباقات متميزة</p>
                        </div>
                    </div>
                </section>

                <!-- Glassmorphic Transition Card (Identical Structure to login.html / status.html cards) -->
                <div class="login-card" style="text-align: center; padding: 26px 20px 22px;">
                    
                    <!-- Status Live Pulse Badge -->
                    <div style="margin: 0 auto 16px; width: fit-content; display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: rgba(255, 127, 80, 0.12); border: 1px solid rgba(255, 127, 80, 0.4); border-radius: 9999px; color: #FFA07A; font-size: 0.82rem; font-weight: 700; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
                        <span style="display: flex; align-items: center; justify-content: center; width: 8px; height: 8px; position: relative;">
                            <span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #FF7F50; opacity: 0.75; animation: pulseDot 1.5s infinite;"></span>
                            <span style="width: 6px; height: 6px; border-radius: 50%; background: #FF7F50;"></span>
                        </span>
                        <span>${config.badgeText}</span>
                    </div>

                    <!-- Glowing Center Icon Box -->
                    <div style="width: 78px; height: 78px; border-radius: 50%; background: ${config.iconBg}; border: 2px solid ${config.iconBorder}; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 0 26px ${config.iconGlow}; animation: pulseGlow 2.5s infinite ease-in-out;">
                        ${config.iconSvg}
                    </div>

                    <h1 class="main-title" style="font-size: 1.28rem; font-weight: 900; color: #FFFFFF; margin-bottom: 6px; text-shadow: 0 2px 6px rgba(0,0,0,0.6);">${config.title}</h1>
                    <p style="font-size: 0.88rem; line-height: 1.6; color: #E2E8F0; margin-bottom: 20px; padding: 0 8px;">${config.description}</p>

                    <!-- Progress Status & Track -->
                    <div style="background: rgba(15, 23, 42, 0.45); border: 1px solid rgba(255, 127, 80, 0.3); border-radius: 14px; padding: 12px 14px; margin-bottom: 18px; text-align: right;">
                        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; font-weight: 700; color: #FFA07A; margin-bottom: 8px;">
                            <span>${config.progressLabel}</span>
                            <div style="width: 16px; height: 16px; border: 2.5px solid rgba(255, 127, 80, 0.25); border-top-color: #FF7F50; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                        </div>
                        <div style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 99px; overflow: hidden; position: relative;">
                            <div style="position: absolute; top: 0; right: 0; height: 100%; width: 0%; background: linear-gradient(90deg, #FFA07A 0%, #FF7F50 50%, #FF4500 100%); border-radius: 99px; animation: fillBar ${config.animationDuration || "0.8s"} cubic-bezier(0.1, 0.7, 0.1, 1) forwards;"></div>
                        </div>
                    </div>

                    <!-- Direct Action Button (Exact match to .points-register-btn) -->
                    <a href="$(link-${config.targetLink})" id="directRedirectBtn" class="points-register-btn" style="text-decoration: none; margin-bottom: 8px;">
                        <span class="button-text">${config.buttonText}</span>
                        <svg viewBox="0 0 24 24" class="points-btn-icon" style="width: 18px; height: 18px; fill: #0B1120;">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                        </svg>
                    </a>

                    <p style="font-size: 0.76rem; color: rgba(226, 232, 240, 0.65); margin-top: 10px;">سيتم التحويل فوراً وبشكل تلقائي دون الحاجة للنقر</p>
                </div>

            </div>
        </div>
    </div>

    <script type="text/javascript">
    (function() {
        var target = "$(link-${config.targetLink})";
        var defaultFallback = "${config.defaultTarget}";
        if (!target || target.indexOf("$(") !== -1 || target === "#") {
            target = defaultFallback;
        }
        ${config.extraScript || ""}
        var btn = document.getElementById("directRedirectBtn");
        if (btn) btn.href = target;
        var delay = ${config.jsDelay || 200};
        setTimeout(function() {
            try { window.location.replace(target); } catch(e) { window.location.href = target; }
        }, delay);
    })();
    </script>
</body>
</html>`;
}

const logoutConfig = {
  httpStatusText: "Hotspot logout successful",
  targetLink: "login",
  defaultTarget: "login.html",
  refreshTime: "0",
  title: "تم تسجيل الخروج بنجاح",
  badgeText: "تم إنهاء الجلسة بنجاح",
  description: "شكراً لاستخدامك شبكتنا. جاري تحويلك تلقائياً وبشكل فوري إلى صفحة تسجيل الدخول...",
  progressLabel: "جاري التحويل التلقائي لصفحة الدخول...",
  buttonText: "الدخول إلى الشبكة الآن",
  iconBg: "linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(185, 28, 28, 0.45) 100%)",
  iconBorder: "rgba(239, 68, 68, 0.65)",
  iconGlow: "rgba(239, 68, 68, 0.4)",
  iconSvg: `<svg viewBox="0 0 24 24" style="width: 38px; height: 38px; fill: #FF7F50;"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>`,
  animationDuration: "0.8s",
  jsDelay: 100,
  extraScript: `
        var u = "";
        try {
            u = localStorage.getItem("mikrotik_last_user") || localStorage.getItem("hotspot_username") || "";
        } catch(e) {}
        if (u && u !== "-") {
            target += (target.indexOf("?") === -1 ? "?" : "&") + "username=" + encodeURIComponent(u);
        }
  `
};

const aloginConfig = {
  httpStatusText: "Hotspot login successful",
  targetLink: "status",
  defaultTarget: "status.html",
  refreshTime: "0",
  title: "تم تسجيل الدخول بنجاح!",
  badgeText: "متصل بالإنترنت الآن",
  description: "أهلاً بك في شبكة سوما نت اللاسلكية! تم الاتصال بنجاح وجاري نقلك لصفحة الحالة والرصيد...",
  progressLabel: "جاري فتح لوحة البيانات والحالة...",
  buttonText: "الانتقال إلى صفحة الحالة",
  iconBg: "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.45) 100%)",
  iconBorder: "rgba(16, 185, 129, 0.65)",
  iconGlow: "rgba(16, 185, 129, 0.4)",
  iconSvg: `<svg viewBox="0 0 24 24" style="width: 38px; height: 38px; fill: #10b981;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
  animationDuration: "0.8s",
  jsDelay: 100,
  extraScript: ""
};

const redirectConfig = {
  httpStatusText: "Hotspot redirect",
  targetLink: "redirect",
  defaultTarget: "status.html",
  refreshTime: "0",
  title: "جاري التحويل والاتصال",
  badgeText: "توجيه تلقائي نشط",
  description: "تم توجيه اتصالك بنجاح، جاري تحويلك تلقائياً وبسرعة إلى صفحتك المطلوبة...",
  progressLabel: "جاري الاتصال والتوجيه التلقائي...",
  buttonText: "متابعة التصفح",
  iconBg: "linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(29, 78, 216, 0.45) 100%)",
  iconBorder: "rgba(59, 130, 246, 0.65)",
  iconGlow: "rgba(59, 130, 246, 0.4)",
  iconSvg: `<svg viewBox="0 0 24 24" style="width: 38px; height: 38px; fill: #60a5fa;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
  animationDuration: "0.8s",
  jsDelay: 100,
  extraScript: ""
};

const rloginConfig = {
  httpStatusText: "Hotspot login required",
  targetLink: "login",
  defaultTarget: "login.html",
  refreshTime: "0",
  title: "تسجيل الدخول إلى الشبكة",
  badgeText: "مطلوب تسجيل الدخول",
  description: "يرجى تسجيل الدخول للاتصال بالإنترنت، جاري نقلك لصفحة إدخال الكرت...",
  progressLabel: "جاري الانتقال لصفحة تسجيل الدخول...",
  buttonText: "تسجيل الدخول الآن",
  iconBg: "linear-gradient(135deg, rgba(255, 127, 80, 0.25) 0%, rgba(255, 69, 0, 0.45) 100%)",
  iconBorder: "rgba(255, 127, 80, 0.65)",
  iconGlow: "rgba(255, 127, 80, 0.4)",
  iconSvg: `<svg viewBox="0 0 24 24" style="width: 38px; height: 38px; fill: #FF7F50;"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>`,
  animationDuration: "0.8s",
  jsDelay: 100,
  extraScript: ""
};

const rstatusConfig = {
  httpStatusText: "Hotspot redirect",
  targetLink: "status",
  defaultTarget: "status.html",
  refreshTime: "0",
  title: "صفحة الحالة والرصيد",
  badgeText: "الجلسة نشطة ومستمرة",
  description: "أنت متصل بالفعل بالإنترنت، جاري نقلك إلى لوحة بياناتك...",
  progressLabel: "جاري الانتقال إلى لوحة الحالة...",
  buttonText: "عرض بيانات الاستهلاك",
  iconBg: "linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(29, 78, 216, 0.45) 100%)",
  iconBorder: "rgba(59, 130, 246, 0.65)",
  iconGlow: "rgba(59, 130, 246, 0.4)",
  iconSvg: `<svg viewBox="0 0 24 24" style="width: 38px; height: 38px; fill: #60a5fa;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>`,
  animationDuration: "0.8s",
  jsDelay: 100,
  extraScript: ""
};

const radvertConfig = {
  httpStatusText: "Hotspot advertisement",
  targetLink: "orig",
  defaultTarget: "status.html",
  refreshTime: "0",
  title: "جاري إتمام التوجيه...",
  badgeText: "توجيه تصفح الإنترنت",
  description: "جاري إتمام التحويل للرابط المطلوب تلقائياً...",
  progressLabel: "جاري التحويل...",
  buttonText: "متابعة التصفح",
  iconBg: "linear-gradient(135deg, rgba(255, 127, 80, 0.25) 0%, rgba(255, 69, 0, 0.45) 100%)",
  iconBorder: "rgba(255, 127, 80, 0.65)",
  iconGlow: "rgba(255, 127, 80, 0.4)",
  iconSvg: `<svg viewBox="0 0 24 24" style="width: 38px; height: 38px; fill: #FF7F50;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
  animationDuration: "0.8s",
  jsDelay: 100,
  extraScript: ""
};

const errorConfig = {
  httpStatusText: "Hotspot login error",
  targetLink: "login",
  defaultTarget: "login.html",
  refreshTime: "0",
  title: "تنبيه في الاتصال",
  badgeText: "حالة المصادقة",
  description: "$(error)",
  progressLabel: "جاري العودة لصفحة تسجيل الدخول...",
  buttonText: "العودة لتسجيل الدخول",
  iconBg: "linear-gradient(135deg, rgba(244, 63, 94, 0.25) 0%, rgba(225, 29, 72, 0.45) 100%)",
  iconBorder: "rgba(244, 63, 94, 0.65)",
  iconGlow: "rgba(244, 63, 94, 0.4)",
  iconSvg: `<svg viewBox="0 0 24 24" style="width: 38px; height: 38px; fill: #f43f5e;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`,
  animationDuration: "0.8s",
  jsDelay: 100,
  extraScript: ""
};

const logoutHtml = getPageHtml(logoutConfig);
const aloginHtml = getPageHtml(aloginConfig);
const redirectHtml = getPageHtml(redirectConfig);
const rloginHtml = getPageHtml(rloginConfig);
const rstatusHtml = getPageHtml(rstatusConfig);
const radvertHtml = getPageHtml(radvertConfig);
const errorHtml = getPageHtml(errorConfig);

fs.writeFileSync("redirect.html", redirectHtml, "utf8");
fs.writeFileSync("rlogin.html", rloginHtml, "utf8");
fs.writeFileSync("rstatus.html", rstatusHtml, "utf8");
fs.writeFileSync("alogin.html", aloginHtml, "utf8");
fs.writeFileSync("logout.html", logoutHtml, "utf8");
fs.writeFileSync("radvert.html", radvertHtml, "utf8");
fs.writeFileSync("error.html", errorHtml, "utf8");

fs.writeFileSync("soma/redirect.html", redirectHtml, "utf8");
fs.writeFileSync("soma/rlogin.html", rloginHtml, "utf8");
fs.writeFileSync("soma/rstatus.html", rstatusHtml, "utf8");
fs.writeFileSync("soma/alogin.html", aloginHtml, "utf8");
fs.writeFileSync("soma/logout.html", logoutHtml, "utf8");
fs.writeFileSync("soma/radvert.html", radvertHtml, "utf8");
fs.writeFileSync("soma/error.html", errorHtml, "utf8");

fs.writeFileSync("soma/lv/redirect.html", redirectHtml, "utf8");
fs.writeFileSync("soma/lv/rlogin.html", rloginHtml, "utf8");
fs.writeFileSync("soma/lv/rstatus.html", rstatusHtml, "utf8");
fs.writeFileSync("soma/lv/alogin.html", aloginHtml, "utf8");
fs.writeFileSync("soma/lv/logout.html", logoutHtml, "utf8");
fs.writeFileSync("soma/lv/radvert.html", radvertHtml, "utf8");
fs.writeFileSync("soma/lv/error.html", errorHtml, "utf8");

console.log("Updated build-templates.cjs successfully");
