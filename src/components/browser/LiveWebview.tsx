import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { ShieldCheck, ExternalLink, AlertCircle, Shield, RefreshCw } from 'lucide-react';
import { YouTubePrivacyHub } from './YouTubePrivacyHub';
import { GoogleAuthHelper } from '../auth/GoogleAuthHelper';

// Declare webview element for JSX TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      webview: any;
    }
  }
}

export const LiveWebview: React.FC = () => {
  const { 
    tabs,
    activeTabId,
    activeTab, 
    navigateTab, 
    updateTabState,
    restoreTab,
    shieldsEnabled, 
    privacyStats, 
    sendAdaLMessage,
    zoomFactor 
  } = useBrowser();

  // Multi-Webview Pool: Maps stable tab.id to active Webview DOM elements
  const webviewsRef = useRef<Map<string, any>>(new Map());
  const boundWebviewsRef = useRef<Set<string>>(new Set());
  const lastLoadedUrlsRef = useRef<Map<string, string>>(new Map());

  const [loadErrors, setLoadErrors] = useState<Record<string, string>>({});

  // Check if running in Electron desktop runtime
  const isDesktop = useMemo(() => {
    if (typeof window === 'undefined') return false;
    if (!!(window as any).voileDesktop?.isElectron) return true;
    if (/electron/i.test(navigator.userAgent)) return true;
    if (window.location.protocol === 'file:') return true;
    return false;
  }, []);

  // Filter for tabs that require web rendering (not purely internal voile:// pages)
  const webTabs = useMemo(() => {
    return tabs.filter(t => !t.url.startsWith('voile://'));
  }, [tabs]);

  // Clean title formatter for search engines
  const cleanTitle = (rawTitle: string): string => {
    if (!rawTitle) return '';
    if (rawTitle.includes('Google Search')) {
      return rawTitle.replace('Google Search', 'Voile Search').replace(' - ', ' — ');
    } else if (rawTitle === 'Google') {
      return 'Voile Search';
    } else if (rawTitle.includes('at DuckDuckGo')) {
      return rawTitle.replace('at DuckDuckGo', '— Voile Search');
    }
    return rawTitle;
  };

  // Register Webview reference and attach persistent per-tab listeners
  const registerWebview = useCallback((tabId: string, el: any) => {
    if (!el) {
      webviewsRef.current.delete(tabId);
      boundWebviewsRef.current.delete(tabId);
      lastLoadedUrlsRef.current.delete(tabId);
      return;
    }

    webviewsRef.current.set(tabId, el);

    // Prevent duplicate listener attachments on re-renders
    if (boundWebviewsRef.current.has(tabId)) return;
    boundWebviewsRef.current.add(tabId);

    const handleTitleUpdated = (e: any) => {
      if (e.title) {
        updateTabState(tabId, { title: cleanTitle(e.title) });
      }
    };

    const handleDidNavigate = (e: any) => {
      if (e.url && !e.url.startsWith('about:') && !e.url.includes('signin_passive') && !e.url.includes('ServiceLogin?service=youtube')) {
        lastLoadedUrlsRef.current.set(tabId, e.url);
        updateTabState(tabId, { url: e.url, isLoading: false });
      }
    };

    const handleDidNavigateInPage = (e: any) => {
      if (e.url && !e.url.startsWith('about:')) {
        lastLoadedUrlsRef.current.set(tabId, e.url);
        updateTabState(tabId, { url: e.url });
      }
    };

    const handleDidStartLoading = () => {
      updateTabState(tabId, { isLoading: true });
      setLoadErrors(prev => {
        const next = { ...prev };
        delete next[tabId];
        return next;
      });
    };

    const handleDidStopLoading = () => {
      updateTabState(tabId, { isLoading: false });
    };

    const handleDidFailLoad = (e: any) => {
      // Ignore user-aborted or redirect-initiated aborts (-3)
      if (e.errorCode !== -3 && e.errorDescription) {
        setLoadErrors(prev => ({ ...prev, [tabId]: e.errorDescription }));
      }
      updateTabState(tabId, { isLoading: false });
    };

    const handleDidFinishLoad = () => {
      updateTabState(tabId, { isLoading: false });
      if (zoomFactor !== 1.0 && typeof el.setZoomFactor === 'function') {
        try {
          el.setZoomFactor(zoomFactor);
        } catch (e) {}
      }
      // Restore scroll position if previously recorded
      const tabObj = tabs.find(t => t.id === tabId);
      if (tabObj?.scrollPosition) {
        try {
          el.executeJavaScript(`window.scrollTo(${tabObj.scrollPosition.x}, ${tabObj.scrollPosition.y})`).catch(() => {});
        } catch (e) {}
      }
    };

    const handleDomReady = () => {
      try {
        const cur = el.getURL?.();
        const targetTab = tabs.find(t => t.id === tabId);
        if (targetTab && targetTab.url && !targetTab.url.startsWith('voile://')) {
          if (!cur || cur === 'about:blank' || cur === '' || cur !== targetTab.url) {
            lastLoadedUrlsRef.current.set(tabId, targetTab.url);
            el.loadURL(targetTab.url);
          }
        }
      } catch (e) {}
    };

    el.addEventListener('page-title-updated', handleTitleUpdated);
    el.addEventListener('did-navigate', handleDidNavigate);
    el.addEventListener('did-navigate-in-page', handleDidNavigateInPage);
    el.addEventListener('did-start-loading', handleDidStartLoading);
    el.addEventListener('did-stop-loading', handleDidStopLoading);
    el.addEventListener('did-fail-load', handleDidFailLoad);
    el.addEventListener('did-finish-load', handleDidFinishLoad);
    el.addEventListener('dom-ready', handleDomReady);
  }, [tabs, updateTabState]);

  // Navigate active webview ONLY when the active URL genuinely changes externally (omnibox/bookmarks)
  useEffect(() => {
    if (!isDesktop) return;
    const activeWebview = webviewsRef.current.get(activeTabId);
    if (!activeWebview) return;

    try {
      const currentUrl = activeWebview.getURL?.();
      if (
        activeTab?.url && 
        !activeTab.url.startsWith('voile://') && 
        currentUrl !== activeTab.url &&
        lastLoadedUrlsRef.current.get(activeTabId) !== activeTab.url
      ) {
        lastLoadedUrlsRef.current.set(activeTabId, activeTab.url);
        activeWebview.loadURL(activeTab.url);
      }
    } catch (e) {}
  }, [isDesktop, activeTabId, activeTab?.url]);

  // Event dispatchers for Reload, Back, and Forward across persistent webviews
  useEffect(() => {
    const handleReload = (e: any) => {
      const tabId = e.detail?.tabId || activeTabId;
      const webview = webviewsRef.current.get(tabId);
      if (webview && typeof webview.reload === 'function') {
        webview.reload();
      }
    };

    const handleGoBack = (e: any) => {
      const tabId = e.detail?.tabId || activeTabId;
      const webview = webviewsRef.current.get(tabId);
      if (webview && typeof webview.canGoBack === 'function' && webview.canGoBack()) {
        webview.goBack();
      }
    };

    const handleGoForward = (e: any) => {
      const tabId = e.detail?.tabId || activeTabId;
      const webview = webviewsRef.current.get(tabId);
      if (webview && typeof webview.canGoForward === 'function' && webview.canGoForward()) {
        webview.goForward();
      }
    };

    window.addEventListener('voile:reload-active-tab', handleReload);
    window.addEventListener('voile:go-back', handleGoBack);
    window.addEventListener('voile:go-forward', handleGoForward);

    const handleSetZoom = (e: any) => {
      const factor = e.detail?.zoomFactor || 1.0;
      const webview = webviewsRef.current.get(activeTabId);
      if (webview && typeof webview.setZoomFactor === 'function') {
        webview.setZoomFactor(factor);
      }
    };

    const handlePrint = () => {
      const webview = webviewsRef.current.get(activeTabId);
      if (webview && typeof webview.print === 'function') {
        webview.print();
      } else {
        window.print();
      }
    };

    const handleSave = (e: any) => {
      const filePath = e.detail?.filePath;
      if (!filePath) return;
      const webview = webviewsRef.current.get(activeTabId);
      if (webview && typeof webview.savePage === 'function') {
        webview.savePage(filePath, 'HTMLComplete').catch((err: any) => {
          console.error('[Save Page Error]', err);
        });
      }
    };

    window.addEventListener('voile:set-zoom', handleSetZoom);
    window.addEventListener('voile:print-active-page', handlePrint);
    window.addEventListener('voile:save-active-page', handleSave);

    return () => {
      window.removeEventListener('voile:reload-active-tab', handleReload);
      window.removeEventListener('voile:go-back', handleGoBack);
      window.removeEventListener('voile:go-forward', handleGoForward);
      window.removeEventListener('voile:set-zoom', handleSetZoom);
      window.removeEventListener('voile:print-active-page', handlePrint);
      window.removeEventListener('voile:save-active-page', handleSave);
    };
  }, [activeTabId]);

  // Record scroll position periodically on active tab before discarding
  useEffect(() => {
    if (!isDesktop) return;
    const activeWebview = webviewsRef.current.get(activeTabId);
    if (!activeWebview) return;

    const interval = setInterval(async () => {
      try {
        const pos = await activeWebview.executeJavaScript(`({ x: window.scrollX, y: window.scrollY })`);
        if (pos && typeof pos.x === 'number') {
          updateTabState(activeTabId, { scrollPosition: pos });
        }
      } catch (e) {}
    }, 4000);

    return () => clearInterval(interval);
  }, [isDesktop, activeTabId, updateTabState]);

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#0B0F19] relative overflow-hidden select-text">
      {/* Sleek Top Loading Indicator for Active Tab */}
      {activeTab?.isLoading && (
        <div className="h-0.5 w-full bg-slate-800 overflow-hidden relative z-30 shrink-0">
          <div className="h-full bg-gradient-to-r from-voile-accent via-sky-300 to-voile-indigo w-1/2 animate-[shimmer_1.5s_infinite] rounded-full" />
        </div>
      )}

      {/* Main Viewport Container — Hosts the Persistent Multi-Webview Pool */}
      <div className="flex-1 relative w-full h-full bg-black overflow-hidden">
        {webTabs.map((tab) => {
          const isSelected = tab.id === activeTabId;
          const isDiscarded = tab.lifecycleState === 'discarded';
          const errorMsg = loadErrors[tab.id];

          return (
            <div
              key={tab.id}
              id={`tab-container-${tab.id}`}
              className="absolute inset-0 w-full h-full flex flex-col"
              style={{
                display: isSelected ? 'flex' : 'none',
                zIndex: isSelected ? 10 : 0
              }}
            >
              {/* STATE 0: Google Authentication Flow Interception (RFC 8252 + PKCE) */}
              {tab.url.includes('accounts.google.com') ? (
                <GoogleAuthHelper onBackToBrowsing={() => navigateTab('voile://newtab', 'New Tab')} />
              ) : isDiscarded ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#0B0F19] text-slate-300 p-8 text-center select-none">
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4 shadow-xl">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h2 className="text-base font-semibold text-white mb-1.5">Tab Sleeping to Save Memory</h2>
                  <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
                    <strong>{tab.title}</strong> was safely discarded to keep your browser fast. Its URL and state are preserved.
                  </p>
                  <button
                    onClick={() => restoreTab(tab.id)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resume Tab</span>
                  </button>
                </div>
              ) : isDesktop ? (
                /* STATE 2: Electron Desktop Mode -> Persistent Native Chromium <webview> */
                <webview
                  ref={(el) => registerWebview(tab.id, el)}
                  id={`webview-${tab.id}`}
                  src={tab.url}
                  className="w-full flex-1 border-none bg-black"
                  style={{ width: '100%', height: '100%', display: 'flex' }}
                  partition={tab.isPrivate ? 'voile-private-temp' : 'persist:voile-main'}
                  preload={(window as any).voileDesktop?.webviewPreloadPath}
                  allowpopups
                />
              ) : (
                /* STATE 3: Browser Preview Mode -> Fallback Proxy Iframe */
                <iframe
                  src={tab.url.startsWith('http') ? `/api/proxy?url=${encodeURIComponent(tab.url)}` : tab.url}
                  className="w-full h-full border-none bg-white"
                  style={{ width: '100%', height: '100%', display: 'block' }}
                  title={tab.title}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                />
              )}

              {/* Non-blocking Load Error Banner for this specific tab */}
              {errorMsg && isSelected && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-red-950/90 border border-red-500/50 text-red-200 text-xs shadow-2xl z-30 flex items-center gap-2 backdrop-blur-md">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Connection issue: {errorMsg}</span>
                  <button 
                    onClick={() => {
                      const webview = webviewsRef.current.get(tab.id);
                      webview?.reload?.();
                    }}
                    className="ml-2 px-2 py-0.5 rounded bg-red-500/30 hover:bg-red-500/50 text-white font-medium underline"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
