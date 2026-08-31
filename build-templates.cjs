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

// 3. GENERATE redirect.html
// 3. GENERATE redirect.html, alogin.html, logout.html, etc. WITH ROYAL LIGHT NAVY THEME
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="theme-color" content="#1a2b4c">
    <title data-network-name>${config.title} | شبكة سوما نت</title>
    
    <link rel="stylesheet" href="fonts/Almarai.css">
    <link rel="stylesheet" href="css/colors.css">
    <link rel="stylesheet" href="css/style.min.css">
    
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: "Almarai", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        html, body {
            width: 100%;
            min-height: 100vh;
            background: #1a2b4c;
            background: linear-gradient(150deg, #2a4365 0%, #1a2b4c 45%, #0f172a 100%);
            color: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow-x: hidden;
        }
        .ambient-mesh {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            z-index: 1;
        }
        .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            opacity: 0.45;
            animation: orbFloat 14s infinite ease-in-out alternate;
        }
        .orb-1 { width: 280px; height: 280px; background: #3b82f6; top: -50px; left: -50px; }
        .orb-2 { width: 320px; height: 320px; background: #FF7F50; bottom: -60px; right: -60px; animation-duration: 18s; }
        .orb-3 { width: 200px; height: 200px; background: #60a5fa; top: 40%; right: 15%; opacity: 0.3; }
        @keyframes orbFloat {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(25px, 20px) scale(1.08); }
            100% { transform: translate(-20px, 35px) scale(0.95); }
        }
        .redirect-wrapper {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 440px;
            padding: 20px;
            margin: auto;
        }
        .transition-card {
            background: rgba(26, 43, 76, 0.65);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 127, 80, 0.4);
            border-radius: 28px;
            padding: 36px 24px 30px;
            text-align: center;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45), 0 0 35px rgba(255, 127, 80, 0.2);
            animation: cardAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes cardAppear {
            from { opacity: 0; transform: translateY(24px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .brand-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 127, 80, 0.3);
            border-radius: 30px;
            padding: 6px 16px;
            margin-bottom: 22px;
            font-size: 13px;
            font-weight: 700;
            color: #FFA07A;
        }
        .brand-pill svg { width: 16px; height: 16px; fill: #FF7F50; }
        .status-icon-box {
            width: 88px;
            height: 88px;
            border-radius: 50%;
            background: ${config.iconBg};
            border: 2px solid ${config.iconBorder};
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            position: relative;
            box-shadow: 0 0 30px ${config.iconGlow};
            animation: pulseGlow 2.5s infinite ease-in-out;
        }
        @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 20px ${config.iconGlow}; transform: scale(1); }
            50% { box-shadow: 0 0 35px ${config.iconGlow}; transform: scale(1.04); }
        }
        .status-icon-box svg { width: 44px; height: 44px; fill: ${config.iconFill}; }
        .main-title {
            font-size: 22px;
            font-weight: 800;
            color: #FFFFFF;
            margin-bottom: 8px;
            letter-spacing: -0.3px;
        }
        .sub-desc {
            font-size: 14px;
            line-height: 1.6;
            color: #E2E8F0;
            margin-bottom: 24px;
            padding: 0 10px;
        }
        .progress-box {
            background: rgba(15, 23, 42, 0.55);
            border: 1px solid rgba(255, 127, 80, 0.25);
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 22px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .progress-status-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 13px;
            color: #FFA07A;
            font-weight: 700;
        }
        .spinner-mini {
            width: 18px;
            height: 18px;
            border: 2.5px solid rgba(255, 127, 80, 0.25);
            border-top-color: #FF7F50;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .progress-track {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            overflow: hidden;
            position: relative;
        }
        .progress-fill {
            position: absolute;
            top: 0;
            right: 0;
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #FFA07A 0%, #FF7F50 50%, #FF4500 100%);
            border-radius: 10px;
            animation: fillBar ${config.animationDuration || "1.2s"} cubic-bezier(0.1, 0.7, 0.1, 1) forwards;
        }
        @keyframes fillBar {
            0% { width: 0%; }
            100% { width: 100%; }
        }
        .action-link-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            padding: 14px 20px;
            background: linear-gradient(135deg, #FFA07A 0%, #FF7F50 50%, #FF4500 100%);
            border: none;
            border-radius: 16px;
            color: #0B1120;
            font-size: 15px;
            font-weight: 800;
            text-decoration: none;
            cursor: pointer;
            box-shadow: 0 10px 25px rgba(255, 127, 80, 0.35);
            transition: all 0.25s ease;
        }
        .action-link-btn:hover, .action-link-btn:active {
            transform: translateY(-2px);
            box-shadow: 0 14px 30px rgba(255, 127, 80, 0.5);
        }
        .action-link-btn svg { width: 18px; height: 18px; fill: #0B1120; }
        .footer-note {
            margin-top: 14px;
            font-size: 12px;
            color: rgba(226, 232, 240, 0.65);
        }
    </style>
</head>
<body>
    <div class="ambient-mesh">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
    </div>
    <div class="redirect-wrapper">
        <div class="transition-card">
            <div class="brand-pill">
                <svg viewBox="0 0 24 24">
                    <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A16.88 16.88 0 0 0 12 4zm0 2.9a13.9 13.9 0 0 1 9.35 3.65L12 19.89 2.65 10.55A13.9 13.9 0 0 1 12 6.9z"/>
                </svg>
                <span data-network-name>شبكة سوما نت اللاسلكية</span>
            </div>
            <div class="status-icon-box">${config.iconSvg}</div>
            <h1 class="main-title">${config.title}</h1>
            <p class="sub-desc">${config.description}</p>
            <div class="progress-box">
                <div class="progress-status-row">
                    <span>${config.progressLabel}</span>
                    <div class="spinner-mini"></div>
                </div>
                <div class="progress-track">
                    <div class="progress-fill"></div>
                </div>
            </div>
            <a href="$(link-${config.targetLink})" id="directRedirectBtn" class="action-link-btn">
                <span>${config.buttonText}</span>
                <svg viewBox="0 0 24 24">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
            </a>
            <p class="footer-note">سيتم التحويل فوراً بشكل تلقائي دون الحاجة للنقر</p>
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
  description: "شكراً لاستخدامك شبكتنا. جاري تحويلك تلقائياً وبشكل فوري إلى صفحة تسجيل الدخول...",
  progressLabel: "جاري التحويل التلقائي لصفحة الدخول...",
  buttonText: "الدخول إلى الشبكة الآن",
  iconBg: "linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(185, 28, 28, 0.45) 100%)",
  iconBorder: "rgba(239, 68, 68, 0.65)",
  iconGlow: "rgba(239, 68, 68, 0.4)",
  iconFill: "#FF7F50",
  iconSvg: `<svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>`,
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
  title: "تم تسجيل الدخول بنجاح",
  description: "أهلاً بك في شبكة سوما نت اللاسلكية! تم الاتصال بنجاح وجاري نقلك لصفحة الحالة...",
  progressLabel: "جاري فتح لوحة البيانات والحالة...",
  buttonText: "الانتقال إلى صفحة الحالة",
  iconBg: "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.45) 100%)",
  iconBorder: "rgba(16, 185, 129, 0.65)",
  iconGlow: "rgba(16, 185, 129, 0.4)",
  iconFill: "#10b981",
  iconSvg: `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
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
  description: "تم توجيهك بنجاح، جاري تحويلك تلقائياً إلى صفحتك المطلوبة...",
  progressLabel: "جاري الاتصال والتوجيه التلقائي...",
  buttonText: "متابعة التصفح",
  iconBg: "linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(29, 78, 216, 0.45) 100%)",
  iconBorder: "rgba(59, 130, 246, 0.65)",
  iconGlow: "rgba(59, 130, 246, 0.4)",
  iconFill: "#60a5fa",
  iconSvg: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
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
  description: "يرجى تسجيل الدخول للاتصال بالإنترنت، جاري نقلك لصفحة إدخال الكرت...",
  progressLabel: "جاري الانتقال لصفحة تسجيل الدخول...",
  buttonText: "تسجيل الدخول الآن",
  iconBg: "linear-gradient(135deg, rgba(255, 127, 80, 0.25) 0%, rgba(255, 69, 0, 0.45) 100%)",
  iconBorder: "rgba(255, 127, 80, 0.65)",
  iconGlow: "rgba(255, 127, 80, 0.4)",
  iconFill: "#FF7F50",
  iconSvg: `<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>`,
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
  description: "أنت متصل بالفعل بالإنترنت، جاري نقلك إلى لوحة بياناتك...",
  progressLabel: "جاري الانتقال إلى لوحة الحالة...",
  buttonText: "عرض بيانات الاستهلاك",
  iconBg: "linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(29, 78, 216, 0.45) 100%)",
  iconBorder: "rgba(59, 130, 246, 0.65)",
  iconGlow: "rgba(59, 130, 246, 0.4)",
  iconFill: "#60a5fa",
  iconSvg: `<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>`,
  animationDuration: "0.8s",
  jsDelay: 100,
  extraScript: ""
};

const radvertConfig = {
  httpStatusText: "Hotspot advertisement",
  targetLink: "orig",
  defaultTarget: "status.html",
  refreshTime: "0",
  title: "جاري توجيهك...",
  description: "جاري إتمام التحويل للرابط المطلوب تلقائياً...",
  progressLabel: "جاري التحويل...",
  buttonText: "متابعة التصفح",
  iconBg: "linear-gradient(135deg, rgba(255, 127, 80, 0.25) 0%, rgba(255, 69, 0, 0.45) 100%)",
  iconBorder: "rgba(255, 127, 80, 0.65)",
  iconGlow: "rgba(255, 127, 80, 0.4)",
  iconFill: "#FF7F50",
  iconSvg: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
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

fs.writeFileSync("redirect.html", redirectHtml, "utf8");
fs.writeFileSync("rlogin.html", rloginHtml, "utf8");
fs.writeFileSync("rstatus.html", rstatusHtml, "utf8");
fs.writeFileSync("alogin.html", aloginHtml, "utf8");
fs.writeFileSync("logout.html", logoutHtml, "utf8");
fs.writeFileSync("radvert.html", radvertHtml, "utf8");

fs.writeFileSync("soma/redirect.html", redirectHtml, "utf8");
fs.writeFileSync("soma/rlogin.html", rloginHtml, "utf8");
fs.writeFileSync("soma/rstatus.html", rstatusHtml, "utf8");
fs.writeFileSync("soma/alogin.html", aloginHtml, "utf8");
fs.writeFileSync("soma/logout.html", logoutHtml, "utf8");
fs.writeFileSync("soma/radvert.html", radvertHtml, "utf8");

fs.writeFileSync("soma/lv/redirect.html", redirectHtml, "utf8");
fs.writeFileSync("soma/lv/alogin.html", aloginHtml, "utf8");
fs.writeFileSync("soma/lv/logout.html", logoutHtml, "utf8");
fs.writeFileSync("soma/lv/radvert.html", radvertHtml, "utf8");

console.log("Updated build-templates.cjs successfully");
