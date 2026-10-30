// Voile Guest Webview Preload
// Executes inside all guest webviews at document_start
// Injects Chameleon Anti-Fingerprinting, Universal Web AdBlock, and Zero-Ad YouTube Sanitization

try {
  Object.defineProperty(window, '__voile_guest__', {
    value: true,
    writable: false,
    configurable: false
  });
} catch (e) {}

// ============================================================
// 1. OMNI-ANON CHAMELEON SHIELD (ANTI-FINGERPRINTING)
// ============================================================
(() => {
  'use strict';
  try {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4, configurable: true });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8, configurable: true });
    Object.defineProperty(navigator, 'platform', { get: () => 'Win32', configurable: true });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'], configurable: true });
    try { delete Object.getPrototypeOf(navigator).webdriver; } catch (e) {}
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined, configurable: true });
  } catch (e) {}

  // Canvas Noise / Fuzzing to defeat fingerprinting
  try {
    const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (type, ...args) {
      const ctx = this.getContext('2d');
      if (ctx && this.width > 16 && this.height > 16) {
        try {
          const imgData = ctx.getImageData(0, 0, 1, 1);
          imgData.data[0] = Math.min(255, Math.max(0, imgData.data[0] ^ 1));
          ctx.putImageData(imgData, 0, 0);
        } catch (e) {}
      }
      return origToDataURL.apply(this, [type, ...args]);
    };
  } catch (e) {}
})();

// ============================================================
// 2. UNIVERSAL WEB & SEARCH ENGINE COSMETIC AD FILTER
// ============================================================
(() => {
  'use strict';
  const genericAdStyle = document.createElement('style');
  genericAdStyle.id = 'voile-universal-adblock-styles';
  genericAdStyle.textContent = `
    /* Universal Display Ads & Banners */
    [id^="google_ads_"],
    [id^="div-gpt-ad"],
    [class*="sponsored-post"],
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

    /* Search Engine Sponsored Links (Google, Bing, DuckDuckGo) */
    div[data-text-ad],
    div[aria-label="Ads"],
    #taw,
    #bottomads,
    .commercial-unit-desktop-top,
    .commercial-unit-desktop-rhs,
    #tads,
    #tadsb,
    .badge--ad,
    .js-badge--ad,
    .results--ads,
    .b_ad,
    .b_adSlug,
    .b_algoSponsored,

    /* YouTube Banners & Promotional Overlays */
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

  function injectGenericStyles() {
    if (!document.getElementById('voile-universal-adblock-styles')) {
      (document.head || document.documentElement || document.body)?.appendChild(genericAdStyle);
    }
  }

  injectGenericStyles();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectGenericStyles);
  }
})();

// ============================================================
// 3. ZERO-AD YOUTUBE PLAYER PRE-ROLL PURGE (AT DOCUMENT_START)
// Removes ad placements from player response before playback queues ads.
// No seeking, no fast-forwarding, no muting needed.
// ============================================================
(() => {
  'use strict';

  function mainWorldYouTubePurge() {
    if (window.__voile_yt_purged__) return;
    window.__voile_yt_purged__ = true;

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

    // 1. Hook JSON.parse to automatically sanitize any stringified player response or ad placement payloads
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

    // 2. Intercept initial player and page data before video starts
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

    // 3. Intercept next-video / SPA player fetch requests
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

    // 3. Intercept XMLHttpRequest player requests
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

    // 4. Dismiss anti-adblock enforcement dialogs automatically
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

  try {
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.textContent = `(${mainWorldYouTubePurge.toString()})();`;
    const target = document.head || document.documentElement || document.body;
    if (target) {
      target.appendChild(script);
      script.remove();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        (document.head || document.documentElement || document.body)?.appendChild(script);
        script.remove();
      });
    }
  } catch (e) {}

  mainWorldYouTubePurge();
})();

// ============================================================
// 4. GOOGLE AUTHENTICATION INTEGRITY ASSISTANT
// ============================================================
(() => {
  'use strict';
  const isGoogleAuth = window.location.hostname.includes('accounts.google') || 
                       (window.location.hostname.includes('google.') && window.location.pathname.includes('/signin'));
  if (!isGoogleAuth) return;

  function injectGoogleAuthBanner() {
    if (document.getElementById('voile-google-auth-overlay')) return;
    const banner = document.createElement('div');
    banner.id = 'voile-google-auth-overlay';
    banner.style.cssText = `
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2147483647;
      background: #0E1524;
      border: 1px solid rgba(56, 189, 248, 0.4);
      box-shadow: 0 12px 32px rgba(0,0,0,0.8);
      border-radius: 14px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      max-width: 90vw;
    `;
    banner.innerHTML = `
      <div style="font-weight: 600; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
        🛡️ Google Sign-In Assistance
      </div>
      <div style="color: #94a3b8; font-size: 12px;">
        Google requires desktop authentication via system browser (RFC 8252).
      </div>
      <button id="voile-auth-action-btn" style="
        background: linear-gradient(to right, #0284c7, #4f46e5);
        color: #fff;
        border: none;
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      ">
        Open in System Browser
      </button>
    `;
    (document.body || document.documentElement)?.appendChild(banner);

    const btn = document.getElementById('voile-auth-action-btn');
    if (btn) {
      btn.onclick = () => {
        window.open(window.location.href, '_blank');
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectGoogleAuthBanner);
  } else {
    injectGoogleAuthBanner();
  }
})();

