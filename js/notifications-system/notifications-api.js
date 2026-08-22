/**
 * Notifications API Manager
 * Handles fetching notifications and announcements from server
 */

window.NotificationsAPI = {
    /**
     * Fetch notifications and announcements
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>}
     */
    async fetchContent(options = {}) {
        const config = window.NotificationsConfig?.api || {};
        const baseURL = typeof config.baseURL === 'function' ? config.baseURL() : config.baseURL;
        const endpoint = config.endpoint || '/api/v1/public/content';

        // Build URL with query parameters
        const params = new URLSearchParams();

        // Add user_token if available (from LoyaltyStorage)
        if (options.userToken) {
            params.append('user_token', options.userToken);
        } else if (window.LoyaltyStorage?.get) {
            const userData = window.LoyaltyStorage.get();
            if (userData?.token) {
                params.append('user_token', userData.token);
            }
        }

        // Add other parameters
        if (options.includeNotifications !== undefined) {
            params.append('include_notifications', options.includeNotifications);
        }
        if (options.includeAnnouncements !== undefined) {
            params.append('include_announcements', options.includeAnnouncements);
        }
        if (options.notificationsLimit) {
            params.append('notifications_limit', options.notificationsLimit);
        }
        if (options.announcementsPosition) {
            params.append('announcements_position', options.announcementsPosition);
        }

        const url = `${baseURL}${endpoint}${params.toString() ? '?' + params.toString() : ''}`;

        if (window.NotificationsConfig?.debug) {
            console.log('[NotificationsAPI] Fetching from:', url);
        }

        try {
            const response = await this._fetchWithTimeout(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }, config.timeout || 10000);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (window.NotificationsConfig?.debug) {
                console.log('[NotificationsAPI] Received:', data);
            }

            return {
                success: true,
                data: data
            };

        } catch (error) {
            console.error('[NotificationsAPI] Fetch error:', error);

            // Retry logic
            if (options._retryCount === undefined) {
                options._retryCount = 0;
            }

            const maxRetries = config.retries || 0;
            if (options._retryCount < maxRetries) {
                console.log(`[NotificationsAPI] Retrying... (${options._retryCount + 1}/${maxRetries})`);
                await this._delay(config.retryDelay || 1000);
                options._retryCount++;
                return this.fetchContent(options);
            }

            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Fetch with timeout
     * @private
     */
    async _fetchWithTimeout(url, options, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    },

    /**
     * Delay helper
     * @private
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.NotificationsAPI;
}
