import React, { useState, useEffect } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { useAgent } from '../../context/AgentContext';
import { BookmarksBar } from './BookmarksBar';
import { ShieldsPopover } from '../privacy/ShieldsPopover';
import { BookmarkPopover } from './BookmarkPopover';
import { VoileLogo } from '../common/VoileLogo';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  Lock, 
  Star, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Plus, 
  X, 
  MoreVertical,
  Search,
  BookmarkCheck,
  Shield,
  Layers,
  Settings,
  Terminal,
  Code,
  PanelRight,
  Pin
} from 'lucide-react';

export const BrowserChrome: React.FC = () => {
  const {
    tabs,
    activeTabId,
    activeTab,
    openNewTab,
    closeTab,
    selectTab,
    duplicateTab,
    togglePinTab,
    navigateTab,
    goBack,
    goForward,
    reloadTab,
    shieldsEnabled,
    privacyStats,
    shieldsPopoverOpen,
    setShieldsPopoverOpen,
    isAdaLOpen,
    toggleAdaL,
    isBookmarked,
    addBookmark,
    removeBookmark,
    bookmarks,
    bookmarksBarVisible,
    activeView,
    setActiveView,
    searchEngine,
    isSidebarOpen,
    toggleSidebar,
    reorderTabs,
    isBookmarkPopoverOpen,
    setIsBookmarkPopoverOpen
  } = useBrowser();

  const { togglePanel: toggleAgentPanel, isPanelOpen: isAgentPanelOpen, plan: agentPlan } = useAgent();

  const [inputUrl, setInputUrl] = useState<string>(activeTab?.url || '');
  const [isEditingUrl, setIsEditingUrl] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Drag and drop tabs state
  const [draggingTabId, setDraggingTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    if (!isEditingUrl && activeTab) {
      if (activeTab.url === 'voile://newtab') {
        setInputUrl('');
      } else {
        setInputUrl(activeTab.url);
      }
    }
  }, [activeTab?.url, isEditingUrl]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      navigateTab(inputUrl.trim());
      setIsEditingUrl(false);
    }
  };

  const handleHomeClick = () => {
    navigateTab('voile://newtab', 'New Tab');
  };

  const isCurrentBookmarked = isBookmarked(activeTab.url);

  const toggleCurrentBookmark = () => {
    if (!isCurrentBookmarked) {
      // 1-Click bookmark immediately to default location
      addBookmark(activeTab.title || 'Bookmark', activeTab.url);
    }
    setIsBookmarkPopoverOpen(true);
  };

  const canGoBack = activeTab.historyIndex > 0;
  const canGoForward = activeTab.historyIndex < activeTab.history.length - 1;

  return (
    <header className="bg-[#0B0F19] border-b border-white/[0.08] flex flex-col z-30 select-none">
      {/* 1. Tab Bar & Window Chrome */}
      <div 
        className="flex items-center h-10 px-3 bg-[#080E1A] border-b border-white/[0.05] gap-2 select-none"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        {/* Tab Strip */}
        <div 
          className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar py-1"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const isDiscarded = tab.lifecycleState === 'discarded';
            const isDragTarget = dragOverTabId === tab.id && draggingTabId !== tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => selectTab(tab.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  togglePinTab(tab.id);
                }}
                draggable={!tab.isPinned}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', tab.id);
                  e.dataTransfer.effectAllowed = 'move';
                  setDraggingTabId(tab.id);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  const rect = e.currentTarget.getBoundingClientRect();
                  const offset = e.clientX - rect.left;
                  const pos = offset > rect.width / 2 ? 'right' : 'left';
                  setDragOverTabId(tab.id);
                  setDragOverPosition(pos);
                }}
                onDragLeave={() => {
                  if (dragOverTabId === tab.id) {
                    setDragOverTabId(null);
                    setDragOverPosition(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromId = e.dataTransfer.getData('text/plain') || draggingTabId;
                  if (fromId && fromId !== tab.id) {
                    reorderTabs(fromId, tab.id);
                  }
                  setDraggingTabId(null);
                  setDragOverTabId(null);
                  setDragOverPosition(null);
                }}
                onDragEnd={() => {
                  setDraggingTabId(null);
                  setDragOverTabId(null);
                  setDragOverPosition(null);
                }}
                className={`group relative flex items-center gap-2 ${tab.isPinned ? 'w-auto px-2.5' : 'max-w-[210px] min-w-[140px] px-3'} h-8 rounded-t-lg text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#0E1524] text-white border-t border-x border-white/10 shadow-sm font-medium'
                    : 'bg-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                } ${isDiscarded ? 'opacity-60' : ''} ${draggingTabId === tab.id ? 'opacity-40 scale-[0.98]' : ''}`}
                title={tab.isPinned ? `${tab.title} (Pinned — Right click to unpin)` : `${tab.title} (Right click to pin, drag to reorder)`}
              >
                {/* Visual Drag Drop Indicator Line */}
                {isDragTarget && (
                  <div 
                    className={`absolute top-0 bottom-0 w-[2.5px] bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)] z-30 rounded-full ${
                      dragOverPosition === 'left' ? 'left-0' : 'right-0'
                    }`} 
                  />
                )}

                {/* Tab Icon or Pin Indicator */}
                {tab.isPinned ? (
                  <Pin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                ) : (
                  <VoileLogo className={`w-3.5 h-3.5 shrink-0 ${tab.isLoading ? 'animate-spin' : ''}`} glow={false} />
                )}
                
                {/* Title */}
                {!tab.isPinned && (
                  <span className="truncate flex-1 text-[11.5px]">
                    {tab.title || 'New Tab'}
                  </span>
                )}

                {/* Close Tab Button */}
                {!tab.isPinned && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className={`p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-opacity ${
                      isActive ? 'opacity-80 hover:opacity-100' : 'opacity-0 group-hover:opacity-80'
                    }`}
                    title="Close tab"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Active Tab Accent Line */}
                {isActive && (
                  <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-gradient-to-r from-voile-accent to-voile-indigo" />
                )}
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            onClick={() => openNewTab('voile://newtab', 'New Tab')}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors ml-1 shrink-0"
            title="Open new tab (Ctrl+T)"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Windows Caption Controls Spacer */}
        <div className="w-36 h-full shrink-0" />
      </div>

      {/* 2. Omnibox Toolbar Row */}
      <div className="flex items-center h-12 px-3 gap-2 bg-[#0A101E] border-b border-white/[0.05]">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1 text-slate-300">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Go forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={reloadTab}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Reload current page"
          >
            <RotateCw className={`w-4 h-4 ${activeTab.isLoading ? 'animate-spin text-voile-accent' : ''}`} />
          </button>
          <button
            onClick={handleHomeClick}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Voile Home"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Omnibox (Address & Search Bar) - Smooth Pill Capsule */}
        <form 
          onSubmit={handleUrlSubmit}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={(e) => {
            e.preventDefault();
            const text = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
            if (text) {
              setInputUrl(text);
              navigateTab(text);
            }
          }}
          className="flex-1 flex items-center h-8.5 px-3.5 rounded-full bg-[#101828]/90 border border-white/[0.10] hover:border-white/20 focus-within:border-sky-400/50 focus-within:ring-2 focus-within:ring-sky-400/20 transition-all text-sm group relative"
        >
          {/* Security / Scheme Indicator */}
          <div className="flex items-center gap-1.5 text-slate-400 mr-2 shrink-0">
            {activeTab.url.startsWith('https://') ? (
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium" title="Connection is encrypted (Strict HTTPS)">
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Secure</span>
              </div>
            ) : activeTab.url.startsWith('voile://') && activeTab.url !== 'voile://newtab' ? (
              <div className="flex items-center gap-1 text-voile-accent text-xs font-medium" title="Internal Voile Component">
                <VoileLogo className="w-3.5 h-3.5" glow={false} />
                <span className="hidden xl:inline text-[11px]">Voile System</span>
              </div>
            ) : (
              <Search className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>

          {/* URL text input */}
          <input
            id="voile-omnibox-input"
            type="text"
            value={inputUrl}
            onChange={(e) => {
              setInputUrl(e.target.value);
              setIsEditingUrl(true);
            }}
            onFocus={() => {
              setIsEditingUrl(true);
              if (!inputUrl && activeTab.url !== 'voile://newtab') {
                setInputUrl(activeTab.url);
              }
            }}
            onBlur={() => {
              setTimeout(() => setIsEditingUrl(false), 200);
            }}
            placeholder="Search or enter a URL"
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-100 placeholder-slate-400 selection:bg-voile-accent/30"
          />

          {/* Star Bookmark Button inside omnibox */}
          <button
            type="button"
            onClick={toggleCurrentBookmark}
            className={`p-1 rounded hover:bg-white/10 transition-colors ml-1 ${
              isCurrentBookmarked ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={isCurrentBookmarked ? 'Remove bookmark' : 'Bookmark this tab'}
          >
            {isCurrentBookmarked ? (
              <BookmarkCheck className="w-4 h-4 fill-amber-400/20" />
            ) : (
              <Star className="w-4 h-4" />
            )}
          </button>
        </form>

        {/* Action Controls on the Right - Minimalist & Clean */}
        <div className="flex items-center gap-1.5 shrink-0 relative">
          {/* AdaL Autonomous Companion Button */}
          <button
            type="button"
            onClick={toggleAgentPanel}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
              isAgentPanelOpen
                ? 'bg-sky-500 text-white shadow-sky-500/40'
                : agentPlan?.status === 'RUNNING'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-sky-600/20 to-indigo-600/20 hover:from-sky-600/30 hover:to-indigo-600/30 border border-sky-400/30 text-sky-300'
            }`}
            title="Open AdaL Autonomous Companion Panel"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="hidden sm:inline font-bold">AdaL Agent</span>
          </button>

          {/* Cyan Shields Icon Button */}
          <button
            onClick={() => setShieldsPopoverOpen(!shieldsPopoverOpen)}
            className="p-2 rounded-lg hover:bg-white/10 text-sky-400 hover:text-sky-300 transition-colors"
            title={`Voile Shields (${shieldsEnabled ? 'Active' : 'Disabled'})`}
          >
            {shieldsEnabled ? (
              <ShieldCheck className="w-5 h-5 text-sky-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-400" />
            )}
          </button>

          {/* Browser Main Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Voile Menu"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-56 py-1.5 bg-[#131B2E] border border-white/10 rounded-xl shadow-2xl backdrop-blur-2xl z-50 text-xs text-slate-200">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5 flex items-center justify-between">
                    <span>Voile Browser</span>
                    <span className="text-voile-accent lowercase font-normal">private</span>
                  </div>

                  <button
                    onClick={() => {
                      openNewTab('voile://newtab', 'New Tab');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                  >
                    <Plus className="w-4 h-4 text-slate-400" />
                    <span>New Tab</span>
                    <span className="ml-auto text-[10px] text-slate-500 font-mono">Ctrl+T</span>
                  </button>

                  <button
                    onClick={() => {
                      openNewTab('voile://private', 'Voile — Private Window', true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left text-purple-300"
                  >
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>New Private Window</span>
                    <span className="ml-auto text-[10px] text-slate-500 font-mono">Ctrl+Shift+N</span>
                  </button>

                  <button
                    onClick={() => {
                      toggleSidebar();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                  >
                    <PanelRight className="w-4 h-4 text-slate-400" />
                    <span>{isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}</span>
                    <span className="ml-auto text-[10px] text-slate-500 font-mono">Ctrl+B</span>
                  </button>

                  <div className="h-[1px] bg-white/5 my-1" />

                  <button
                    onClick={() => {
                      setActiveView('workspace');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                  >
                    <Layers className="w-4 h-4 text-voile-accent" />
                    <span>Voile Workspace</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('privacy');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Privacy Center & Shields</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('settings');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </button>

                  <div className="h-[1px] bg-white/5 my-1" />

                  <button
                    onClick={() => {
                      const webview = (document.getElementById(`webview-${activeTabId}`) || document.querySelector('webview')) as any;
                      if (webview) {
                        try {
                          if (webview.isDevToolsOpened?.()) webview.closeDevTools();
                          else webview.openDevTools({ mode: 'bottom' });
                        } catch (e) {}
                      } else {
                        (window as any).voileDesktop?.toggleMainDevTools?.();
                      }
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                  >
                    <Terminal className="w-4 h-4 text-voile-accent" />
                    <span>Developer Tools</span>
                    <span className="ml-auto text-[10px] text-slate-500 font-mono">F12</span>
                  </button>

                  <button
                    onClick={() => {
                      (window as any).voileDesktop?.toggleMainDevTools?.();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                  >
                    <Code className="w-4 h-4 text-slate-400" />
                    <span>Inspect Voile Shell</span>
                    <span className="ml-auto text-[10px] text-slate-500 font-mono">Ctrl+Shift+U</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bookmarks Bar (Hidden on clean home view) */}
      {bookmarksBarVisible && activeTab.url !== 'voile://newtab' && activeView !== 'home' && (
        <BookmarksBar />
      )}

      {/* Shields Popover */}
      <ShieldsPopover />

      {/* Bookmark Popover */}
      <BookmarkPopover />
    </header>
  );
};
