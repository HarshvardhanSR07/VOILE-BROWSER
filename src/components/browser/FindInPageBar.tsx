import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

export const FindInPageBar: React.FC = () => {
  const { isFindInPageOpen, setIsFindInPageOpen, activeTabId, activeView } = useBrowser();
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current active webview element
  const getActiveWebview = useCallback(() => {
    return document.getElementById(`webview-${activeTabId}`) as any;
  }, [activeTabId]);

  const prevIsOpenRef = useRef(false);

  // Focus input whenever find bar opens
  useEffect(() => {
    if (isFindInPageOpen) {
      prevIsOpenRef.current = true;
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      if (prevIsOpenRef.current) {
        prevIsOpenRef.current = false;
        const webview = getActiveWebview();
        if (webview && typeof webview.stopFindInPage === 'function') {
          try {
            webview.stopFindInPage('clearSelection');
          } catch (e) {}
        }
      }
      setMatches({ current: 0, total: 0 });
    }
  }, [isFindInPageOpen, getActiveWebview]);

  // Listen to 'found-in-page' event from the active webview
  useEffect(() => {
    if (!isFindInPageOpen) return;
    const webview = getActiveWebview();
    if (!webview) return;

    const handleFoundInPage = (e: any) => {
      if (e.result) {
        setMatches({
          current: e.result.activeMatchOrdinal || 0,
          total: e.result.numberOfMatches || 0
        });
      }
    };

    webview.addEventListener('found-in-page', handleFoundInPage);
    return () => {
      webview.removeEventListener('found-in-page', handleFoundInPage);
    };
  }, [activeTabId, isFindInPageOpen, getActiveWebview]);

  // Perform search on query change
  useEffect(() => {
    if (!isFindInPageOpen) return;
    const webview = getActiveWebview();
    if (!webview || typeof webview.findInPage !== 'function') return;

    if (!query.trim()) {
      try {
        webview.stopFindInPage('clearSelection');
      } catch (e) {}
      setMatches({ current: 0, total: 0 });
      return;
    }

    try {
      webview.findInPage(query, { forward: true, findNext: false });
    } catch (e) {}
  }, [query, isFindInPageOpen, getActiveWebview]);

  const findNext = useCallback(() => {
    if (!query) return;
    const webview = getActiveWebview();
    if (webview && typeof webview.findInPage === 'function') {
      webview.findInPage(query, { forward: true, findNext: true });
    }
  }, [query, getActiveWebview]);

  const findPrev = useCallback(() => {
    if (!query) return;
    const webview = getActiveWebview();
    if (webview && typeof webview.findInPage === 'function') {
      webview.findInPage(query, { forward: false, findNext: true });
    }
  }, [query, getActiveWebview]);

  const handleClose = () => {
    setIsFindInPageOpen(false);
  };

  // Listen for global find-next / find-prev shortcuts
  useEffect(() => {
    const handleNextEvent = () => findNext();
    const handlePrevEvent = () => findPrev();

    window.addEventListener('voile:find-next', handleNextEvent);
    window.addEventListener('voile:find-prev', handlePrevEvent);

    return () => {
      window.removeEventListener('voile:find-next', handleNextEvent);
      window.removeEventListener('voile:find-prev', handlePrevEvent);
    };
  }, [findNext, findPrev]);

  if (!isFindInPageOpen) return null;

  return (
    <div className="absolute top-3 right-6 z-50 flex items-center gap-1.5 bg-[#0E1524]/95 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-2xl shadow-2xl text-xs text-white animate-in fade-in slide-in-from-top-2 duration-150">
      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) {
              findPrev();
            } else {
              findNext();
            }
          } else if (e.key === 'Escape') {
            e.preventDefault();
            handleClose();
          }
        }}
        placeholder="Find in page..."
        className="w-40 bg-transparent text-xs text-white placeholder-slate-400 outline-none border-none py-1 px-1 selection:bg-sky-500/30"
      />

      {/* Match indicator */}
      {query && (
        <span className="text-[11px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/5 shrink-0">
          {matches.total > 0 ? `${matches.current}/${matches.total}` : '0/0'}
        </span>
      )}

      {/* Previous Match */}
      <button
        onClick={findPrev}
        disabled={matches.total === 0}
        title="Previous match (Shift+Enter or Ctrl+Shift+G)"
        className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 hover:text-white transition-colors"
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>

      {/* Next Match */}
      <button
        onClick={findNext}
        disabled={matches.total === 0}
        title="Next match (Enter or Ctrl+G)"
        className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 hover:text-white transition-colors"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-3.5 bg-white/10 mx-0.5" />

      {/* Close button */}
      <button
        onClick={handleClose}
        title="Close (Escape)"
        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
