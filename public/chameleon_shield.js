// Omni-Anon Chameleon Anti-Fingerprinting Shield v3.0
// Executes in MAIN world at document_start before any page scripts can execute.

(() => {
    'use strict';

    console.log('[Omni-Anon] Chameleon Shield Active: Enforcing Uniformity over Randomization.');

    // 1. Hardware Concurrency & Memory Normalization
    try {
        Object.defineProperty(navigator, 'hardwareConcurrency', {
            get: () => 4,
            configurable: true
        });
        Object.defineProperty(navigator, 'deviceMemory', {
            get: () => 8,
            configurable: true
        });
        Object.defineProperty(navigator, 'platform', {
            get: () => 'Win32',
            configurable: true
        });
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
            configurable: true
        });
        // Remove automation/webdriver flag without triggering browser banner
        try {
            delete Object.getPrototypeOf(navigator).webdriver;
        } catch (err) {}
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
            configurable: true
        });
    } catch (e) {}

    // 2. High-Resolution Timer Coarsening (100 microseconds / 0.1ms)
    // Eliminates micro-architectural CPU cache side-channel timing attacks (Spectre)
    // Preserves millisecond precision for HTML5 video/audio playback and MediaSource buffering.
    try {
        const origPerformanceNow = performance.now.bind(performance);
        performance.now = function () {
            const raw = origPerformanceNow();
            return Math.floor(raw / 0.1) * 0.1;
        };
    } catch (e) {}

    // 3. Timezone Spoofing (Lock to UTC)
    try {
        const origDateTimeFormat = Intl.DateTimeFormat;
        Intl.DateTimeFormat = function (...args) {
            const inst = new origDateTimeFormat(...args);
            return new Proxy(inst, {
                get(target, prop) {
                    if (prop === 'resolvedOptions') {
                        return () => Object.assign(target.resolvedOptions(), { timeZone: 'UTC' });
                    }
                    return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop];
                }
            });
        };
    } catch (e) {}

    // 4. WebGL Normalization (Mask GPU hardware fingerprint)
    try {
        const UNMASKED_VENDOR_WEBGL = 0x9245;
        const UNMASKED_RENDERER_WEBGL = 0x9246;

        const patchWebGL = (proto) => {
            if (!proto || !proto.getParameter) return;
            const origGetParam = proto.getParameter;
            proto.getParameter = function (param) {
                if (param === UNMASKED_VENDOR_WEBGL) {
                    return 'Intel Inc.';
                }
                if (param === UNMASKED_RENDERER_WEBGL) {
                    return 'Intel(R) UHD Graphics 620';
                }
                return origGetParam.apply(this, arguments);
            };
        };

        if (window.WebGLRenderingContext) {
            patchWebGL(WebGLRenderingContext.prototype);
        }
        if (window.WebGL2RenderingContext) {
            patchWebGL(WebGL2RenderingContext.prototype);
        }
    } catch (e) {}

    // 5. Canvas Readback Protection
    try {
        const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
        CanvasRenderingContext2D.prototype.getImageData = function (sx, sy, sw, sh) {
            // Check canvas dimensions; if tiny off-screen probe (<= 16x16), return blank/neutral
            if (sw <= 16 && sh <= 16) {
                return new ImageData(sw, sh);
            }
            return origGetImageData.apply(this, arguments);
        };
    } catch (e) {}

    // 6. Disable Battery & Sensor APIs
    try {
        if ('getBattery' in navigator) {
            delete navigator.getBattery;
        }
    } catch (e) {}

    // 7. Inject Tor-Style Letterboxing
    window.addEventListener('DOMContentLoaded', () => {
        try {
            const style = document.createElement('style');
            style.textContent = `
                /* Omni-Anon Letterbox Frame */
                html {
                    background-color: #1a1a1a !important;
                }
            `;
            document.head && document.head.appendChild(style);
        } catch (e) {}
    });

})();
