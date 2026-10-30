import React, { useState } from 'react';
import { useBrowser, SEARCH_ENGINES } from '../context/BrowserContext';
import { SearchEngineType } from '../types/browser';
import { 
  Settings, 
  Search, 
  Bookmark, 
  Sparkles, 
  Shield, 
  Sliders, 
  Check, 
  Globe,
  ToggleRight,
  ToggleLeft,
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Filter,
  Key
} from 'lucide-react';
import { GoogleAuthHelper } from '../components/auth/GoogleAuthHelper';

export const SettingsPage: React.FC = () => {
  const { 
    bookmarksBarVisible, 
    toggleBookmarksBar, 
    isAdaLOpen, 
    toggleAdaL,
    searchEngine,
    setSearchEngine,
    isSidebarOpen,
    toggleSidebar,
    sidebarPosition,
    setSidebarPosition,
    shieldsEnabled,
    toggleShields,
    adBlockStats,
    addAdBlockException,
    removeAdBlockException,
    updateAdBlockFilters
  } = useBrowser();

  const [localLlm, setLocalLlm] = useState(true);
  const [newExceptionDomain, setNewExceptionDomain] = useState('');
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const handleAddException = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExceptionDomain.trim()) {
      addAdBlockException(newExceptionDomain.trim());
      setNewExceptionDomain('');
    }
  };

  const handleManualUpdate = async () => {
    setUpdateMessage(null);
    const success = await updateAdBlockFilters();
    if (success) {
      setUpdateMessage('Filter lists updated successfully!');
    } else {
      setUpdateMessage('Filter lists are already up to date.');
    }
    setTimeout(() => setUpdateMessage(null), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0F19] text-white p-6 no-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="pb-4 border-b border-white/[0.08]">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-voile-accent" />
            <span>Voile Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your browser defaults, ad blocking engine, appearance, and search preferences.
          </p>
        </div>

        {/* ============================================================ */}
        {/* SECTION 1: CENTRAL AD-BLOCKING & PRIVACY ENGINE             */}
        {/* ============================================================ */}
        <div className="p-5 rounded-2xl bg-[#0E1524] border border-white/[0.08] shadow-voile-card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Voile Shield & Ad-Blocking Engine</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Centralized network-level ad blocking, cross-site tracking prevention, and cosmetic filtering.
              </p>
            </div>
            <button onClick={toggleShields}>
              {shieldsEnabled ? (
                <ToggleRight className="w-8 h-8 text-voile-accent" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-600" />
              )}
            </button>
          </div>

          {/* Engine Real-Time Metrics & Rule Lists */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[11px] text-slate-400 block">Session Blocked Requests</span>
              <span className="text-lg font-bold text-voile-accent font-mono mt-0.5 block">
                {adBlockStats.blockedCount.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Live network requests cancelled</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[11px] text-slate-400 block">Compiled Filter Rules</span>
              <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">
                {adBlockStats.rulesCount.toLocaleString()}+
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">EasyList, EasyPrivacy, uBlock Filters</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Filter List Status</span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5 block">
                  Active & Cached
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Last updated: {adBlockStats.lastUpdated ? new Date(adBlockStats.lastUpdated).toLocaleDateString() : 'Active'}
                </span>
              </div>
              <button
                onClick={handleManualUpdate}
                disabled={adBlockStats.isUpdating}
                className="mt-2.5 px-3 py-1 rounded-lg bg-voile-accent/20 hover:bg-voile-accent/30 text-voile-accent text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 self-start disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${adBlockStats.isUpdating ? 'animate-spin' : ''}`} />
                <span>{adBlockStats.isUpdating ? 'Updating...' : 'Check for Updates'}</span>
              </button>
            </div>
          </div>

          {updateMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-3.5 h-3.5" />
              <span>{updateMessage}</span>
            </div>
          )}

          {/* Website Exceptions / Whitelist Manager */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-voile-accent" />
                <span>Website Exceptions (Allowlist)</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Disable ad blocking and tracking protection on trusted websites.
              </p>
            </div>

            <form onSubmit={handleAddException} className="flex gap-2">
              <input
                type="text"
                value={newExceptionDomain}
                onChange={(e) => setNewExceptionDomain(e.target.value)}
                placeholder="e.g. example.com or news.site"
                className="flex-1 px-3 py-1.5 bg-[#131B2E] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-voile-accent/60"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-voile-accent text-slate-950 font-semibold text-xs rounded-xl hover:bg-sky-300 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Exception</span>
              </button>
            </form>

            {adBlockStats.exceptions.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {adBlockStats.exceptions.map((domain) => (
                  <span
                    key={domain}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 font-mono"
                  >
                    <span>{domain}</span>
                    <button
                      onClick={() => removeAdBlockException(domain)}
                      className="p-0.5 hover:text-red-400 transition-colors"
                      title="Remove exception"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">No site exceptions configured. Protection is active everywhere.</p>
            )}
          </div>

          {/* Architecture & Capabilities Disclosure */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">How Voile Blocks Ads:</span>
            <p>
              • <strong>Pre-Request Interception</strong>: Outgoing advertising network requests (scripts, banners, telemetry, tracker beacons) are intercepted and dropped before delivery using compiled EasyList and EasyPrivacy rules.
            </p>
            <p>
              • <strong>YouTube Architecture</strong>: Player metadata is sanitized at <code>document_start</code> to eliminate queued ad breaks before video playback begins. Voile does not artificially seek, fast-forward, or mute videos.
            </p>
            <p>
              • <strong>Search Engines</strong>: Sponsored ads on Google, Bing, and DuckDuckGo are cleanly hidden without impacting organic results.
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 2: SEARCH ENGINE                                    */}
        {/* ============================================================ */}
        <div className="p-5 rounded-2xl bg-[#0E1524] border border-white/[0.08] shadow-voile-card space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-voile-accent" />
            <span>Default Search Engine</span>
          </h3>
          <p className="text-xs text-slate-400">
            Search engine used in the address bar and home search field.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {(Object.keys(SEARCH_ENGINES) as SearchEngineType[]).map(key => {
              const engine = SEARCH_ENGINES[key];
              const isSelected = searchEngine === key;
              return (
                <div
                  key={key}
                  onClick={() => setSearchEngine(key)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-voile-accent/10 border-voile-accent/60 text-white shadow-sm ring-1 ring-voile-accent/30'
                      : 'bg-white/[0.03] border-white/5 text-slate-400 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-100">{engine.name}</span>
                      {key === 'DuckDuckGo' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-voile-accent/20 text-voile-accent font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-voile-accent" />}
                  </div>
                  <p className="text-[10.5px] text-slate-400 mt-1.5 leading-relaxed">{engine.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 3: BOOKMARKS BAR APPEARANCE                          */}
        {/* ============================================================ */}
        <div className="p-5 rounded-2xl bg-[#0E1524] border border-white/[0.08] shadow-voile-card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>Show Bookmarks Bar</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Display the bookmarks bar directly underneath the address bar.
              </p>
            </div>
            <button onClick={toggleBookmarksBar}>
              {bookmarksBarVisible ? (
                <ToggleRight className="w-8 h-8 text-voile-accent" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 4: NAVIGATION SIDEBAR POSITION                      */}
        {/* ============================================================ */}
        <div className="p-5 rounded-2xl bg-[#0E1524] border border-white/[0.08] shadow-voile-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-voile-accent" />
                <span>Navigation Sidebar</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure the visibility and position of the browser navigation panel (Shortcut: Ctrl+B).
              </p>
            </div>
            <button onClick={toggleSidebar}>
              {isSidebarOpen ? (
                <ToggleRight className="w-8 h-8 text-voile-accent" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-600" />
              )}
            </button>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-300">Sidebar Position</span>
            <div className="flex items-center gap-2 bg-[#131B2E] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setSidebarPosition('left')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                  sidebarPosition === 'left'
                    ? 'bg-voile-accent text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Left Side
              </button>
              <button
                onClick={() => setSidebarPosition('right')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                  sidebarPosition === 'right'
                    ? 'bg-voile-accent text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Right Side (Default)
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 5: ADAL AI PREFERENCES                               */}
        {/* ============================================================ */}
        <div className="p-5 rounded-2xl bg-[#0E1524] border border-white/[0.08] shadow-voile-card space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-voile-accent" />
            <span>AdaL AI Companion</span>
          </h3>

          <div className="divide-y divide-white/[0.06] text-xs pt-1">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-200">Show AdaL in sidebar</span>
                <p className="text-[11px] text-slate-400">Keep the AdaL AI panel docked to the right edge</p>
              </div>
              <button onClick={toggleAdaL}>
                {isAdaLOpen ? <ToggleRight className="w-7 h-7 text-voile-accent" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
              </button>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-200">Zero-Telemetry AI Processing</span>
                <p className="text-[11px] text-slate-400">All reasoning and memory stay strictly private without big tech profiling</p>
              </div>
              <button onClick={() => setLocalLlm(!localLlm)}>
                {localLlm ? <ToggleRight className="w-7 h-7 text-voile-accent" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 6: VOILE IDENTITY BRIDGE & AUTHENTICATION            */}
        {/* ============================================================ */}
        <div className="p-5 rounded-2xl bg-[#0E1524] border border-white/[0.08] shadow-voile-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-sky-400" />
                <span>Voile Identity Bridge & Authentication</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Manage your connected Google Account, local Email Profile, or guest browsing preferences.
              </p>
            </div>
          </div>

          <GoogleAuthHelper compact={true} />
        </div>
      </div>
    </div>
  );
};
