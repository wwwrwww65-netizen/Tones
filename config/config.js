Config({
  // =========================================================================
  // 1. البيانات الأساسية للشبكة (الاسم، الترحيب، الدعم الفني، واتساب، الشريط الإخباري)
  // =========================================================================

  // اسم الشبكة الذي يظهر في الترويسة وجميع أرجاء الصفحة
  "network-name": "  سوما نت  ",

  // نص الترحيب الرئيسي الموجود فوق البنر (اتركه فارغاً ليأخذ اسم الشبكة تلقائياً، أو اكتب النص الذي تريده)
  "welcome-title": "مرحبا بكم في شبكة سوما نت",

  // رقم خدمة العملاء والدعم الفني للاتصال الهاتفي المباشر
  "service-number": "776590171",

  // رقم الواتساب لخدمة العملاء (يقبل الرقم مع الرمز الدولي أو بدونه مثل 776590171 أو 967776590171)
  "whatsapp-number": "776590171",

  // نص الرسالة التلقائية المجهزة مسبقاً للعميل عند فتح محادثة الواتساب
  "whatsapp-text": "مرحبا خدمة عملاء شبكة سوما نت اللاسلكية",

  // رابط واتساب مخصص اختياري (إذا أردت وضع رابط مباشر لمجموعة أو رابط جاهز)
  "whatsapp-url": "",

  // =========================================================================
  // 👇 [نص الشريط الإخباري المتحرك] 👇
  // اكتب هنا النص الذي تريده أن يتحرك في الشريط (آيات قرآنية، إعلانات، تنبيهات)
  // =========================================================================
  "news-line":
    "{بسم الله الرحمن الرحيم} ( قل للمؤمنين يغضوا من أبصرهم ويحفظوا فروجهم ذلك ازكى لهم إن الله خبير بما يصنعون ) صدق الله العظيم",

  // =========================================================================
  // 2. إعدادات الإعلان المنبثق (Popup Ad)
  // =========================================================================
  "popup-adv-time": 5,           // مدة ظهور الإعلان بالثواني قبل إمكانية إغلاقه
  "popup-adv-img-type": true,    // تفعيل عرض صورة الإعلان
  "popup-adv-repeat-after": 120, // تكرار ظهور الإعلان بعد عدد معين من الدقائق

  // =========================================================================
  // 3. إعدادات تسجيل الدخول ونوع الكرت
  // =========================================================================
  "login-type": "User",          // نوع تسجيل الدخول (User: مستخدم فقط / UserPass: مستخدم وكلمة مرور)
  "login-chap": 0,               // نوع التشفير (0: عادي / 1: CHAP)
  "input-type": "tel",           // نوع لوحة المفاتيح في الهاتف (tel: أرقام لسرعة الإدخال)
  "input-autocomplete": "on",    // إكمال تلقائي لأرقام الكروت المحفوظة

  // =========================================================================
  // 4. إعدادات وقائمة سرعات الإنترنت (تتزامن تلقائياً في صفحة الدخول وصفحة الحالة)
  // =========================================================================
  "login-speeds-mode": false,     // اختيار السرعة قبل الدخول (false للتوافق الشامل مع المايكروتك / true في حال تفعيل سكربتات السرعات)
  "speed-trychange": 3,           // أقصى عدد لمرات تغيير السرعة المسموح بها للمشترك
  "speed-trychange-timeout": 3,   // مدة حظر تغيير السرعة بالدقائق عند تجاوز المحاولات

  // قائمة السرعات: يمكنك إضافة أو حذف أو تعديل أي سرعة هنا، وستتزامن فوراً في نافذة السرعات بصفحة الدخول وبصفحة الحالة
  "speeds": [
    { title: "سرعة اقتصادية", value: "128k/512k" },
    { title: "سرعة عادية", value: "256k/700k", default: true },
    { title: "سرعة متوسطة", value: "256k/1M" },
    { title: "سرعة عالية", value: "512M/3M" },
    { title: "سرعة عالية جدا", value: "1M/8M", enabled: false }
  ],

  // =========================================================================
  // 5. إعدادات معالجة وتصحيح أرقام الكروت المدخلة
  // =========================================================================
  "input-rm-white-spaces": 0,    // إزالة المسافات الفارغة تلقائياً
  "input-to-lower": 0,           // تحويل الحروف الإنجليزية إلى صغيرة
  "input-to-upper": 0,           // تحويل الحروف الإنجليزية إلى كبيرة
  "input-to-arabic-numbers": 1,  // تحويل الأرقام العربية (١٢٣) إلى إنجليزية (123) تلقائياً
  "input-only-numbers": 0,       // قبول الأرقام فقط في حقل الكرت
  "input-no-numbers": 0,
  "input-only-alphanumeric": 0,
  "input-to-tel-type-when": 0,

  // =========================================================================
  // 6. إعدادات الكوكيز وحفظ الكرت في المتصفح
  // =========================================================================
  "enable-hot-cookie": 1,        // تفعيل حفظ كرت المستخدم لتسهيل الدخول التلقائي
  "clear-router-cookie": 1,      // مسح كوكيز الراوتر عند تسجيل الخروج
  "clear-hot-cookie": 1,         // مسح كوكيز الصفحة عند تسجيل الخروج

  // =========================================================================
  // 7. نظام مكافحة التخمين والحظر التلقائي (HotBlocker)
  // =========================================================================
  "enable-hot-blocker": 1,       // تفعيل نظام حظر التخمين والمحاولات الخاطئة
  "try-count": 20,               // عدد المحاولات الخاطئة المسموح بها قبل فرض الحظر
  "warn-when": 10,               // بدء إظهار رسالة التحذير عند الوصول لهذا العدد من الأخطاء
  "block-time": 1,               // مدة الحظر بالدقائق عند تجاوز عدد المحاولات المسموحة
  // نص رسالة التحذير التي تظهر للعميل عند تكرار إدخال كروت خاطئة
  "warn-message":
    "تحذير !! عدد محاولاتك الخاطئة اصبح {{tryCounter}} محاولات, عدد المحاولات المسموح بها هي {{tryCount}} محاولات فقط, عدد محاولاتك المتبقية {{restTryCount}} محاولات, سيتم حظرك لمدة {{blockTime}} دقائق اذا تجاوزت العدد المسموح للمحاولات",

  // =========================================================================
  // 8. إظهار وإخفاء الأزرار والخدمات (true: يظهر / false: يختفي)
  // =========================================================================
  "speed-button": false,         // إظهار/إخفاء زر وقائمة تغيير السرعة (في صفحة تسجيل الدخول وصفحة الحالة)
  "update-button": false,        // إظهار/إخفاء زر إيقاف التحديثات والمتجر (في صفحة تسجيل الدخول وصفحة الحالة)
  "price-button": true,          // إظهار زر قائمة أسعار الكروت (true: نعم / false: لا)
  "sell-point-button": true,     // إظهار زر نقاط البيع وأماكن التوزيع (true: نعم / false: لا)
  "loan-button": true,           // إظهار زر خدمة الاستدانة / كرت سلف (true: نعم / false: لا)
  "app-store-status-button": false,
  "show-date-field": false,

  // =========================================================================
  // 9. الروابط الخارجية (البث المباشر / الاستراحة / متجر البرامج)
  // =========================================================================
  "redirect-to-esterahah": "",   // رابط صفحة الاستراحة / الترفيه (اختياري)
  "redirect-to-mobasher": "",    // رابط البث المباشر والمباريات (اختياري)
  "app-store-base-url": "",
  "app-store-base-url-ext": "",

  // =========================================================================
  // 10. جدول باقات وأسعار الكروت (يتم تعديل الأسعار والساعات من هنا)
  // =========================================================================
  profiles: [
    {
      name: "الباقات المفتوحة (2)",
      price: "(100) ريال",
      time: "(3) ساعات",
      validity: "(3) أيام",
    },
    {
      name: "الباقات المفتوحة (3)",
      price: "(200) ريال",
      time: "(7) ساعات",
      validity: "(7) يوم",
    },
    {
      name: "الباقات المفتوحة (1)",
      price: "(4500) ريال",
      time: "اشتراك 145 ساعة",
      validity: "(30) يوم",
    },
  ],

  // =========================================================================
  // 11. نقاط البيع ومراكز توزيع الكروت (اكتب هنا أسماء وأرقام المحلات)
  // =========================================================================
  "sell-points": [
    { name: "بقالة المكلاء (هلال)" },
    { name: "بقالة الطلائع" },
    { name: "بقالة الانهار (عدنان)" },
    { name: "بقالة البدائل" },
    { name: "بقالة الحمادي" },
    { name: "بقالة حدة الحديثة" },
    { name: "بقالة انهار الخير ( ضروة )" },
  ],

  // =========================================================================
  // 12. نصوص جديدنا والعروض (تعديل مباشر وسهل لرسائل العروض والتنبيهات)
  // =========================================================================
  "news-title": "زبائننا الكرام",
  "news-content": "التطوير مستمر نحن بخدمتكم دائما مع تحيات إدارة شبكة سوما",
  "news-code": "",
  "news-extra-title": "",
  "news-extra-content": "",
  "news-extra-badge": "",

  // =========================================================================
  // 13. صور بنر الإعلانات في الصفحة (تلقائي حسب الصور الموجودة في مجلد adimg)
  // =========================================================================
  "banner-images": [
    "adimg/2.jpg",
    "adimg/3.jpg",
    "adimg/5.jpg"
  ],
});

/* =========================================================================
 *  CardBox Floating Button - زر كارد بوكس العائم
 * ========================================================================= */
(function() {
    // 👇 ضع رابط شبكتك هنا بكل وضوح:
    var CARDBOX_URL = "https://cardbox.basmasoft.com/n/86267";

    // نص الزر:
    var BUTTON_TEXT = "اشتري كرتك من \"كارد بوكس\"";

    if (document.getElementById('cardbox-float-btn')) return;

    // 1. إضافة تنسيقات الزر والأنيميشن التفاعلي
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = [
        '#cardbox-float-btn {',
        '    position: fixed !important;',
        '    top: 50px !important;',
        '    right: 18px !important;',
        '    z-index: 2147483647 !important;',
        '    display: inline-flex !important;',
        '    align-items: center !important;',
        '    justify-content: center !important;',
        '    gap: 9px !important;',
        '    padding: 12px 24px 12px 20px !important;',
        '    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 45%, #db2777 100%) !important;',
        '    color: #ffffff !important;',
        '    font-family: "Almarai", "Tajawal", "Cairo", system-ui, -apple-system, sans-serif !important;',
        '    font-size: 15.5px !important;',
        '    font-weight: 700 !important;',
        '    text-decoration: none !important;',
        '    line-height: 1.2 !important;',
        '    border-radius: 9999px !important;',
        '    border: 1.5px solid rgba(255, 255, 255, 0.5) !important;',
        '    box-shadow: 0 6px 22px rgba(124, 58, 237, 0.48), 0 2px 10px rgba(219, 39, 119, 0.38) !important;',
        '    direction: rtl !important;',
        '    cursor: pointer !important;',
        '    overflow: hidden !important;',
        '    -webkit-user-select: none !important;',
        '    user-select: none !important;',
        '    -webkit-tap-highlight-color: transparent !important;',
        '    transform-origin: 50% 20% !important;',
        '    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease !important;',
        '    animation: cardboxBellAttention 4.5s infinite ease-in-out !important;',
        '}',
        '@supports (top: max(0px)) {',
        '    #cardbox-float-btn {',
        '        top: max(50px, calc(env(safe-area-inset-top) + 24px)) !important;',
        '        right: max(18px, env(safe-area-inset-right)) !important;',
        '    }',
        '}',
        '#cardbox-float-btn:hover {',
        '    color: #ffffff !important;',
        '    text-decoration: none !important;',
        '    animation-play-state: paused !important;',
        '    transform: translateY(-2px) scale(1.05) !important;',
        '    box-shadow: 0 10px 28px rgba(124, 58, 237, 0.7), 0 4px 16px rgba(219, 39, 119, 0.5) !important;',
        '}',
        '#cardbox-float-btn:active {',
        '    transform: translateY(1px) scale(0.96) !important;',
        '    box-shadow: 0 2px 10px rgba(124, 58, 237, 0.4) !important;',
        '}',
        '#cardbox-float-btn .cardbox-btn-text {',
        '    color: #ffffff !important;',
        '    font-size: 15.5px !important;',
        '    font-weight: 700 !important;',
        '    letter-spacing: -0.2px !important;',
        '    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25) !important;',
        '    white-space: nowrap !important;',
        '    display: inline-block !important;',
        '}',
        '#cardbox-float-btn .cardbox-btn-icon {',
        '    width: 20px !important;',
        '    height: 20px !important;',
        '    flex-shrink: 0 !important;',
        '    stroke: #ffffff !important;',
        '    fill: none !important;',
        '    stroke-width: 2.2 !important;',
        '    stroke-linecap: round !important;',
        '    stroke-linejoin: round !important;',
        '    transform-origin: 50% 10% !important;',
        '    animation: cardboxCartWiggle 4.5s infinite ease-in-out !important;',
        '}',
        '#cardbox-float-btn:hover .cardbox-btn-icon {',
        '    transform: scale(1.15) rotate(-6deg) !important;',
        '}',
        '#cardbox-float-btn::after {',
        '    content: "" !important;',
        '    position: absolute !important;',
        '    top: 0 !important;',
        '    right: -60% !important;',
        '    width: 40% !important;',
        '    height: 100% !important;',
        '    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent) !important;',
        '    transform: skewX(-25deg) !important;',
        '    animation: cardboxShimmer 4.5s infinite ease-in-out !important;',
        '    pointer-events: none !important;',
        '}',
        '@media screen and (max-width: 480px) {',
        '    #cardbox-float-btn {',
        '        top: 38px !important;',
        '        right: 12px !important;',
        '        padding: 9px 18px 9px 15px !important;',
        '        gap: 7px !important;',
        '    }',
        '    #cardbox-float-btn .cardbox-btn-text {',
        '        font-size: 13.5px !important;',
        '    }',
        '    #cardbox-float-btn .cardbox-btn-icon {',
        '        width: 17px !important;',
        '        height: 17px !important;',
        '    }',
        '}',
        '@keyframes cardboxBellAttention {',
        '    0%, 100% {',
        '        transform: scale(1) rotate(0deg);',
        '        box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45), 0 2px 10px rgba(219, 39, 119, 0.35);',
        '    }',
        '    8% {',
        '        transform: scale(1.12) rotate(0deg);',
        '        box-shadow: 0 10px 28px rgba(124, 58, 237, 0.65), 0 4px 16px rgba(219, 39, 119, 0.5), 0 0 0 4px rgba(219, 39, 119, 0.25);',
        '    }',
        '    16% {',
        '        transform: scale(0.95) rotate(0deg);',
        '        box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4), 0 2px 8px rgba(219, 39, 119, 0.3);',
        '    }',
        '    22% { transform: scale(1.04) rotate(0deg); }',
        '    26% { transform: scale(1.02) rotate(-9deg); }',
        '    30% { transform: scale(1.02) rotate(9deg); }',
        '    34% { transform: scale(1.01) rotate(-8deg); }',
        '    38% { transform: scale(1.01) rotate(8deg); }',
        '    42% { transform: scale(1) rotate(-5deg); }',
        '    46% { transform: scale(1) rotate(5deg); }',
        '    50% { transform: scale(1) rotate(-2deg); }',
        '    54% { transform: scale(1) rotate(2deg); }',
        '    58% {',
        '        transform: scale(1) rotate(0deg);',
        '        box-shadow: 0 8px 24px rgba(124, 58, 237, 0.55), 0 3px 12px rgba(219, 39, 119, 0.45);',
        '    }',
        '    72% { transform: scale(1) rotate(0deg); }',
        '}',
        '@keyframes cardboxCartWiggle {',
        '    0%, 25%, 58%, 100% { transform: rotate(0deg); }',
        '    28% { transform: rotate(-14deg); }',
        '    32% { transform: rotate(14deg); }',
        '    36% { transform: rotate(-12deg); }',
        '    40% { transform: rotate(12deg); }',
        '    44% { transform: rotate(-8deg); }',
        '    48% { transform: rotate(8deg); }',
        '    52% { transform: rotate(-4deg); }',
        '    56% { transform: rotate(0deg); }',
        '}',
        '@keyframes cardboxShimmer {',
        '    0% { right: -60%; }',
        '    15%, 100% { right: 140%; }',
        '}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);

    // 2. دالة حقن الزر في الصفحة
    function injectBtn() {
        if (document.getElementById('cardbox-float-btn') || !document.body) return false;

        var btn = document.createElement('a');
        btn.id = 'cardbox-float-btn';
        btn.href = CARDBOX_URL;
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.title = 'شراء كروت الإنترنت عبر كارد بوكس';

        var span = document.createElement('span');
        span.className = 'cardbox-btn-text';
        span.textContent = BUTTON_TEXT;

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'cardbox-btn-icon');
        svg.setAttribute('viewBox', '0 0 24 24');

        var circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle1.setAttribute('cx', '9');
        circle1.setAttribute('cy', '20');
        circle1.setAttribute('r', '1.5');

        var circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle2.setAttribute('cx', '18');
        circle2.setAttribute('cy', '20');
        circle2.setAttribute('r', '1.5');

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M1 2h3.5l2.4 12.2a1.8 1.8 0 0 0 1.8 1.4h9.6a1.8 1.8 0 0 0 1.8-1.4L22 6H5.2');

        svg.appendChild(circle1);
        svg.appendChild(circle2);
        svg.appendChild(path);

        btn.appendChild(span);
        btn.appendChild(svg);

        btn.addEventListener('click', function() {
            try {
                var popup = window.open(CARDBOX_URL, '_blank');
                if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                    window.location.href = CARDBOX_URL;
                }
            } catch(e) {
                window.location.href = CARDBOX_URL;
            }
        });

        document.body.appendChild(btn);
        return true;
    }

    // 3. ضمان تشغيل الزر فور جاهزية الصفحة
    if (!injectBtn()) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectBtn);
        }
        window.addEventListener('load', injectBtn);
        var attempts = 0;
        var timer = setInterval(function() {
            attempts++;
            if (injectBtn() || attempts > 20) {
                clearInterval(timer);
            }
        }, 150);
    }
})();
