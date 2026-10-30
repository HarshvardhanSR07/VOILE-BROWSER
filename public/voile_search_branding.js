// Voile Search Engine Co-Branding Script
// Injects Voile Identity & Visual Branding over external search engines (Google, DuckDuckGo)
// Executes directly inside webview guest context at document_start / dom-ready.

(() => {
  'use strict';

  if (window.__voile_search_branding_installed__) return;
  window.__voile_search_branding_installed__ = true;

  const hostname = window.location.hostname;
  const isGoogle = hostname.includes('google.');
  const isDuckDuckGo = hostname.includes('duckduckgo.com');

  if (!isGoogle && !isDuckDuckGo) return;

  // 1. Inject immediate styling to suppress original vendor logos before paint
  const styleEl = document.createElement('style');
  styleEl.id = 'voile-search-branding-style';
  styleEl.textContent = `
    /* Instant logo hide on Google */
    #logo svg,
    a[aria-label*="Google Home"] svg,
    a#logo > svg,
    .FgNLaf svg,
    .o3j99.n1xJcf svg {
      display: none !important;
    }

    /* Voile Logo Container */
    .voile-injected-brand {
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
      text-decoration: none !important;
      cursor: pointer !important;
      user-select: none !important;
      vertical-align: middle !important;
      padding: 2px 4px !important;
      transition: opacity 0.15s ease !important;
    }
    .voile-injected-brand:hover {
      opacity: 0.85 !important;
    }
    .voile-injected-text {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif !important;
      font-weight: 700 !important;
      font-size: 22px !important;
      letter-spacing: -0.5px !important;
      background: linear-gradient(135deg, #38BDF8 0%, #818CF8 100%) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      display: inline-block !important;
      line-height: 1 !important;
    }
    .voile-injected-pill {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      font-weight: 600 !important;
      font-size: 9px !important;
      letter-spacing: 0.8px !important;
      text-transform: uppercase !important;
      color: #38BDF8 !important;
      background: rgba(56, 189, 248, 0.12) !important;
      border: 1px solid rgba(56, 189, 248, 0.3) !important;
      border-radius: 5px !important;
      padding: 1px 5px !important;
      display: inline-block !important;
      line-height: 1.3 !important;
      vertical-align: middle !important;
    }
  `;
  (document.head || document.documentElement).appendChild(styleEl);

  // Voile Leaf SVG Icon Markup
  const VOILE_LOGO_SVG = `
    <svg viewBox="0 0 48 48" style="width:26px;height:26px;filter:drop-shadow(0 0 6px rgba(56,189,248,0.5));shrink:0;" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vLeafGrad" x1="6" y1="42" x2="42" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#0284C7" />
          <stop offset="50%" stop-color="#38BDF8" />
          <stop offset="100%" stop-color="#818CF8" />
        </linearGradient>
        <linearGradient id="vVeinGrad" x1="12" y1="36" x2="36" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.25" />
        </linearGradient>
      </defs>
      <path d="M10 38C10 38 10 22 24 10C34 1.5 40 4 41 5C42 6 44.5 12 36 22C24 36 10 38 10 38Z" fill="url(#vLeafGrad)" />
      <path d="M10 38C18 34 26 26 34 14" stroke="url(#vVeinGrad)" stroke-width="2.5" stroke-linecap="round" />
      <path d="M19 30C23 28 27 25 30 20" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round" />
      <path d="M15 34C17 31 20 28 23 26" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  `;

  function createVoileBrandBadge(isCompact = false) {
    const wrap = document.createElement('div');
    wrap.className = 'voile-injected-brand';
    wrap.innerHTML = `
      ${VOILE_LOGO_SVG}
      <span class="voile-injected-text">Voile</span>
      ${!isCompact ? '<span class="voile-injected-pill">Search</span>' : ''}
    `;
    wrap.setAttribute('title', 'Voile Privacy Search');
    wrap.addEventListener('click', (e) => {
      // Optional: Navigate to Voile home if clicked
      // window.location.href = 'voile://newtab';
    });
    return wrap;
  }

  function applyVoileGoogleBranding() {
    // 1. Google Search Results Header Logo: #logo or a#logo
    const logoLink = document.getElementById('logo') || 
                     document.querySelector('a#logo') ||
                     document.querySelector('a[aria-label="Go to Google Home"]') ||
                     document.querySelector('a[title="Go to Google Home"]');

    if (logoLink && !logoLink.querySelector('.voile-injected-brand')) {
      // Hide all child SVGs and images
      const svgs = logoLink.querySelectorAll('svg, img');
      svgs.forEach(s => s.style.setProperty('display', 'none', 'important'));

      // Append Voile badge
      const badge = createVoileBrandBadge(false);
      logoLink.appendChild(badge);
      logoLink.setAttribute('aria-label', 'Voile Search');
      logoLink.setAttribute('title', 'Voile Search');
    }

    // 2. Center Logo on Google Homepage (if visiting google.com directly)
    const homeLogoImg = document.querySelector('img[alt="Google"], .k1zIA img');
    if (homeLogoImg && homeLogoImg.parentElement && !homeLogoImg.parentElement.querySelector('.voile-injected-brand')) {
      homeLogoImg.style.setProperty('display', 'none', 'important');
      const bigBadge = document.createElement('div');
      bigBadge.className = 'voile-injected-brand';
      bigBadge.style.cssText = 'transform: scale(1.6); margin: 30px auto; display: flex !important; justify-content: center;';
      bigBadge.innerHTML = `
        <svg viewBox="0 0 48 48" style="width:48px;height:48px;filter:drop-shadow(0 0 10px rgba(56,189,248,0.6));" fill="none">
          <path d="M10 38C10 38 10 22 24 10C34 1.5 40 4 41 5C42 6 44.5 12 36 22C24 36 10 38 10 38Z" fill="url(#vLeafGrad)" />
          <path d="M10 38C18 34 26 26 34 14" stroke="#FFF" stroke-width="2.5" stroke-linecap="round" />
        </svg>
        <span class="voile-injected-text" style="font-size: 42px !important; margin-left: 8px;">Voile</span>
      `;
      homeLogoImg.parentElement.appendChild(bigBadge);
    }

    // 3. Document Title Replacement: "xyz - Google Search" -> "xyz — Voile Search"
    if (document.title && document.title.includes('Google Search')) {
      document.title = document.title.replace('Google Search', 'Voile Search').replace(' - ', ' — ');
    } else if (document.title === 'Google') {
      document.title = 'Voile Search';
    }
  }

  function applyVoileDuckDuckGoBranding() {
    const ddgLogo = document.getElementById('logo_homepage_link') ||
                    document.querySelector('.header__logo') ||
                    document.querySelector('a[href="/"][title*="DuckDuckGo"]');

    if (ddgLogo && !ddgLogo.querySelector('.voile-injected-brand')) {
      const svgs = ddgLogo.querySelectorAll('svg, img, span');
      svgs.forEach(s => s.style.setProperty('display', 'none', 'important'));

      const badge = createVoileBrandBadge(false);
      ddgLogo.appendChild(badge);
    }

    if (document.title && document.title.includes('at DuckDuckGo')) {
      document.title = document.title.replace('at DuckDuckGo', '— Voile Search');
    }
  }

  function runBranding() {
    if (isGoogle) applyVoileGoogleBranding();
    if (isDuckDuckGo) applyVoileDuckDuckGoBranding();
  }

  // Initial runs
  runBranding();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runBranding);
  }
  window.addEventListener('load', runBranding);

  // Continuous observer to persist branding through dynamic SPA search updates
  const observer = new MutationObserver(() => {
    runBranding();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // Also monitor title changes
  const titleEl = document.querySelector('title');
  if (titleEl) {
    new MutationObserver(() => {
      if (document.title && (document.title.includes('Google Search') || document.title.includes('at DuckDuckGo'))) {
        document.title = document.title
          .replace('Google Search', 'Voile Search')
          .replace('at DuckDuckGo', '— Voile Search')
          .replace(' - ', ' — ');
      }
    }).observe(titleEl, { childList: true, characterData: true });
  }
})();
