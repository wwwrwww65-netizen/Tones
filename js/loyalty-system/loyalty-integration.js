(function () {
    "use strict";

    let isSystemLoaded = false;
    let loadingPromise = null;

    async function loadLoyaltySystem() {
        if (isSystemLoaded) return true;
        if (loadingPromise) return loadingPromise;

        loadingPromise = (async () => {
            try {
                console.log("[LoyaltyIntegration] Loading system scripts...");
                const scripts = [
                    "js/loyalty-system/loyalty-config.js",
                    "js/loyalty-system/loyalty-storage.js",
                    "js/loyalty-system/loyalty-api.js",
                    "js/loyalty-system/loyalty-manager.js",
                    "js/loyalty-system/banner.js",
                    "js/loyalty-system/loyalty-modal.js"
                ];

                for (const scriptUrl of scripts) {
                    await loadScript(scriptUrl);
                }

                if (window.LoyaltyManager && typeof window.LoyaltyManager.init === 'function') {
                    await window.LoyaltyManager.init();
                }

                isSystemLoaded = true;
                console.log("[LoyaltyIntegration] Loyalty system loaded successfully");
                updateInlinePointsElements();
                return true;
            } catch (err) {
                console.error("[LoyaltyIntegration] Failed to load loyalty system:", err);
                return false;
            }
        })();

        return loadingPromise;
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if already in DOM
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                return resolve();
            }
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                console.log(`[LoyaltyIntegration] Loaded: ${src}`);
                resolve();
            };
            script.onerror = () => {
                console.warn(`[LoyaltyIntegration] Optional script failed to load: ${src}`);
                resolve(); // Don't reject to keep running
            };
            document.head.appendChild(script);
        });
    }

    function setupLoginPointsHook() {
        const origUserLogin = window.userLogin;
        window.userLogin = async function (arg) {
            let cardValue = "";
            if (document.login && document.login.username) {
                cardValue = document.login.username.value;
            }

            if (origUserLogin && typeof origUserLogin === 'function') {
                try {
                    origUserLogin.call(this, arg);
                } catch (e) {
                    console.error("[LoyaltyIntegration] Original userLogin error:", e);
                }
            }

            if (await loadLoyaltySystem()) {
                if (window.LoyaltyManager && window.LoyaltyManager.isLoggedIn()) {
                    window.LoyaltyManager.updateUI();
                    if (cardValue) {
                        try {
                            const res = await window.LoyaltyManager.addPointsForCard(cardValue);
                            if (res && res.success && typeof Banner !== 'undefined' && Banner.show) {
                                Banner.show(res.message, "success");
                            }
                        } catch (err) {
                            // Non-blocking card check
                        }
                    }
                }
            }
        };
    }

    function updateInlinePointsElements() {
        const isLogged = window.LoyaltyManager && typeof window.LoyaltyManager.isLoggedIn === 'function' && window.LoyaltyManager.isLoggedIn();
        
        const regSec = document.getElementById("loyalty-registered-section");
        const unregSec = document.getElementById("loyalty-unregistered-section");
        const regStatusSec = document.getElementById("loyalty-registered-section-status");
        const unregStatusSec = document.getElementById("loyalty-unregistered-section-status");

        if (isLogged) {
            if (regSec) regSec.style.display = "block";
            if (unregSec) unregSec.style.display = "none";
            if (regStatusSec) regStatusSec.style.display = "block";
            if (unregStatusSec) unregStatusSec.style.display = "none";

            const currentUser = window.LoyaltyManager.getCurrentUser();
            const phone = currentUser ? currentUser.phone : (localStorage.getItem('points_user_phone') || '');
            const points = window.LoyaltyManager.getPoints();

            document.querySelectorAll("#loyalty-user-phone, .loyalty-user-phone").forEach(el => {
                if (el) el.textContent = phone;
            });

            document.querySelectorAll(".loyalty-points-value").forEach(el => {
                if (el) el.textContent = points;
            });
        } else {
            if (regSec) regSec.style.display = "none";
            if (unregSec) unregSec.style.display = "block";
            if (regStatusSec) regStatusSec.style.display = "none";
            if (unregStatusSec) unregStatusSec.style.display = "block";
        }
    }

    function bindLoyaltyActionButtons() {
        // Loan buttons
        document.querySelectorAll("#loyalty-loan-btn, #loyalty-loan-btn-status, [data-loyalty-loan]").forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                if (window.LoyaltyManager && window.LoyaltyManager.isLoggedIn()) {
                    window.LoyaltyManager.openLoanModal();
                } else if (window.LoyaltyManager) {
                    window.LoyaltyManager.openRegistrationModal();
                }
            };
        });

        // Buy card / exchange points buttons
        document.querySelectorAll("#loyalty-buy-card-btn, #loyalty-buy-card-btn-status, [data-loyalty-buy]").forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                if (window.LoyaltyManager && window.LoyaltyManager.isLoggedIn()) {
                    window.LoyaltyManager.openBuyCardModal();
                } else if (window.LoyaltyManager) {
                    window.LoyaltyManager.openRegistrationModal();
                }
            };
        });

        // Saved cards buttons
        document.querySelectorAll("#loyalty-saved-cards-btn, #loyalty-saved-cards-btn-status, [data-loyalty-saved]").forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                if (window.LoyaltyModal && typeof window.LoyaltyModal.showSavedCards === 'function') {
                    window.LoyaltyModal.showSavedCards();
                }
            };
        });

        // Points account / portal page buttons
        document.querySelectorAll("#loyalty-account-btn, #loyalty-account-btn-status, [data-loyalty-account]").forEach(btn => {
            btn.onclick = async (e) => {
                e.preventDefault();
                if (window.LoyaltyManager && window.LoyaltyManager.isLoggedIn()) {
                    window.LoyaltyManager.openPointsPage();
                } else if (window.LoyaltyManager) {
                    window.LoyaltyManager.openRegistrationModal();
                }
            };
        });

        // Logout buttons
        document.querySelectorAll("#loyalty-logout-btn, #loyalty-logout-btn-status, .loyalty-logout-pill-btn, [data-loyalty-logout]").forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                if (window.LoyaltyManager) {
                    window.LoyaltyManager.logout();
                }
            };
        });

        // Registration modal trigger buttons
        document.querySelectorAll("#openPointsRegisterBtn, .points-register-btn, .loyalty-register-btn, [data-loyalty-register]").forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                if (window.LoyaltyManager) {
                    window.LoyaltyManager.openRegistrationModal();
                }
            };
        });
    }

    async function init() {
        console.log("[LoyaltyIntegration] Initializing loyalty integration...");
        
        // Capture Hotspot Metadata if present
        window.hotspotData = window.hotspotData || { ip: "", mac: "", identity: "" };
        try {
            document.querySelectorAll("script").forEach((s) => {
                const text = s.textContent;
                const ipMatch = text.match(/"ip"\s*:\s*"([^"]+)"/);
                if (ipMatch) window.hotspotData.ip = ipMatch[1];
                const macMatch = text.match(/"mac"\s*:\s*"([^"]+)"/);
                if (macMatch) window.hotspotData.mac = macMatch[1];
            });
        } catch (e) {}

        bindLoyaltyActionButtons();
        setupLoginPointsHook();

        await loadLoyaltySystem();

        if (window.LoyaltyManager) {
            window.LoyaltyManager.updateUI();
            updateInlinePointsElements();
            if (window.LoyaltyManager.isLoggedIn()) {
                window.LoyaltyManager.getUserPoint();
            }
        }

        bindLoyaltyActionButtons();
    }

    window.updateInlinePointsElements = updateInlinePointsElements;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
