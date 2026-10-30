// Voile Shield — Comprehensive Cosmetic & Player Sanitization Engine (v7.0)
// Completely eliminates YouTube pre-roll/mid-roll ad queuing at document_start,
// removes search engine sponsored ads (Google, Bing, DuckDuckGo),
// and hides universal web ad containers with zero playback disruption.

(() => {
  'use strict';

  if (window.__voile_cosmetics_active__) return;
  window.__voile_cosmetics_active__ = true;

  // ============================================================
  // 1. INJECT ROBUST AD-HIDING STYLES ACROSS WEB & SEARCH ENGINES
  // ============================================================
  const style = document.createElement('style');
  style.id = 'voile-cosmetic-adblock-styles';
  style.textContent = `
    /* === A. Universal Web Banner & Ad Container Removal === */
    [id^="google_ads_"],
    [id^="div-gpt-ad"],
    [class*="ad-banner"],
    [class*="ad-container"],
    [class*="advertisement"],
    [class*="adsbygoogle"],
    [data-ad-client],
    [data-ad-slot],
    .outbrain,
    .taboola,
    .ad-slot,
    .ad-wrapper,
    .ad-placeholder,
    .afs_ads,
    .commercial-unit,

    /* === B. Search Engine Sponsored Placements Removal === */
    /* Google Search Ads */
    div[data-text-ad],
    div[aria-label="Ads"],
    #taw,
    #bottomads,
    .commercial-unit-desktop-top,
    .commercial-unit-desktop-rhs,
    #tads,
    #tadsb,
    div[data-ad-slot],

    /* DuckDuckGo Sponsored Ads */
    .badge--ad,
    .js-badge--ad,
    .results--ads,
    .result--ad,

    /* Bing Search Sponsored Ads */
    .b_ad,
    .b_adSlug,
    .b_algoSponsored,
    .b_adBottom,

    /* === C. YouTube Banner, Overlay & Promoted Shelf Removal === */
    #masthead-ad,
    ytd-ad-slot-renderer,
    ytd-in-feed-ad-layout-renderer,
    ytd-promoted-video-renderer,
    ytd-promoted-sparkles-web-renderer,
    ytd-action-companion-ad-renderer,
    .ytd-banner-promo-renderer,
    .ytd-statement-banner-renderer,
    #player-ads,
    #fulfilled-ad-shelf,
    ytd-companion-slot-renderer,
    ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"],
    ytd-merch-shelf-renderer,
    .ytp-ad-overlay-container,
    .ytp-ad-message-container,
    .ytp-ad-preview-container,
    .ytp-ad-info-dialog-container,
    .ytp-ad-persistent-progress-bar,

    /* Neutralize YouTube Anti-Adblock Warning Modals */
    ytd-popup-container:has(ytd-enforcement-message-view-model),
    tp-yt-paper-dialog:has(ytd-enforcement-message-view-model),
    ytd-enforcement-message-view-model {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      width: 0 !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;

  function injectStyles() {
    if (!document.getElementById('voile-cosmetic-adblock-styles')) {
      (document.head || document.documentElement || document.body)?.appendChild(style);
    }
  }

  injectStyles();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  }

  // ============================================================
  // 2. YOUTUBE ZERO-AD PLAYER METADATA PURGE (AT DOCUMENT_START)
  // Strips all ad metadata before player queues ads, preventing any ad from ever loading
  // ============================================================
  const isYouTube = location.hostname.includes('youtube.com') || location.hostname.includes('youtu.be');

  if (isYouTube) {
    function purgeAdPlacements(obj) {
      if (!obj || typeof obj !== 'object') return obj;
      try {
        if (obj.adPlacements) delete obj.adPlacements;
        if (obj.playerAds) delete obj.playerAds;
        if (obj.adSlots) delete obj.adSlots;
        if (obj.adBreakHeartbeatParams) delete obj.adBreakHeartbeatParams;
        if (obj.adBreakHeartbeatPayload) delete obj.adBreakHeartbeatPayload;
        if (obj.playerConfig && obj.playerConfig.adConfig) delete obj.playerConfig.adConfig;
        if (obj.auxiliaryUi && obj.auxiliaryUi.messageRenderers) {
          delete obj.auxiliaryUi.messageRenderers.enforcementMessageViewModel;
        }
        if (obj.playerResponse && typeof obj.playerResponse === 'object') {
          purgeAdPlacements(obj.playerResponse);
        }
      } catch (e) {}
      return obj;
    }

    // Hook JSON.parse to automatically sanitize any stringified player response or ad placement payloads
    try {
      const origParse = JSON.parse;
      JSON.parse = function(...args) {
        const result = origParse.apply(this, args);
        if (result && typeof result === 'object') {
          if (result.adPlacements || result.playerAds || result.adSlots) {
            purgeAdPlacements(result);
          }
          if (result.playerResponse) {
            purgeAdPlacements(result.playerResponse);
          }
        }
        return result;
      };
    } catch (e) {}

    // A. Intercept ytInitialPlayerResponse & ytInitialData at document start
    let _ytInitialPlayerResponse = window.ytInitialPlayerResponse;
    if (_ytInitialPlayerResponse) {
      purgeAdPlacements(_ytInitialPlayerResponse);
    }
    try {
      Object.defineProperty(window, 'ytInitialPlayerResponse', {
        get: () => _ytInitialPlayerResponse,
        set: (val) => {
          _ytInitialPlayerResponse = purgeAdPlacements(val);
        },
        configurable: true,
        enumerable: true
      });
    } catch (e) {}

    let _ytInitialData = window.ytInitialData;
    if (_ytInitialData) {
      purgeAdPlacements(_ytInitialData);
    }
    try {
      Object.defineProperty(window, 'ytInitialData', {
        get: () => _ytInitialData,
        set: (val) => {
          _ytInitialData = purgeAdPlacements(val);
        },
        configurable: true,
        enumerable: true
      });
    } catch (e) {}

    // B. Intercept dynamically fetched player responses on next-video clicks (fetch)
    try {
      const origFetch = window.fetch;
      window.fetch = async function (...args) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
        const response = await origFetch.apply(this, args);

        if (typeof url === 'string' && url.includes('/youtubei/v1/player')) {
          try {
            const cloned = response.clone();
            const json = await cloned.json();
            purgeAdPlacements(json);
            const modifiedBlob = new Blob([JSON.stringify(json)], { type: 'application/json' });
            return new Response(modifiedBlob, {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          } catch (e) {
            return response;
          }
        }

        return response;
      };
    } catch (e) {}

    // C. Intercept XMLHttpRequest player requests
    try {
      const origOpen = XMLHttpRequest.prototype.open;
      const origSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function(method, url, ...args) {
        this._voileUrl = typeof url === 'string' ? url : (url?.toString() || '');
        return origOpen.apply(this, [method, url, ...args]);
      };
      XMLHttpRequest.prototype.send = function(...args) {
        if (this._voileUrl && this._voileUrl.includes('/youtubei/v1/player')) {
          const onReady = () => {
            if (this.readyState === 4 && this.status === 200) {
              try {
                const data = JSON.parse(this.responseText);
                purgeAdPlacements(data);
                const sanitized = JSON.stringify(data);
                Object.defineProperty(this, 'responseText', { value: sanitized, configurable: true });
                Object.defineProperty(this, 'response', { value: sanitized, configurable: true });
              } catch (e) {}
            }
          };
          this.addEventListener('readystatechange', onReady, false);
        }
        return origSend.apply(this, args);
      };
    } catch (e) {}

    // D. Automatically dismiss any anti-adblock message dialogs
    const dismissDialogs = () => {
      const dialogs = document.querySelectorAll('tp-yt-paper-dialog, ytd-enforcement-message-view-model');
      dialogs.forEach(d => {
        if (d.textContent && (d.textContent.includes('Ad blockers') || d.textContent.includes('allowlist'))) {
          d.remove();
          document.querySelectorAll('tp-yt-iron-overlay-backdrop').forEach(b => b.remove());
          const video = document.querySelector('video');
          if (video && video.paused) {
            video.play().catch(() => {});
          }
        }
      });
    };

    setInterval(dismissDialogs, 1000);
  }
})();
