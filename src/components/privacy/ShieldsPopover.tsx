import React from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Fingerprint, 
  Zap, 
  EyeOff, 
  ToggleLeft, 
  ToggleRight,
  ExternalLink,
  RefreshCw,
  Info
} from 'lucide-react';

export const ShieldsPopover: React.FC = () => {
  const { 
    shieldsEnabled, 
    toggleShields, 
    privacyStats, 
    shieldsPopoverOpen, 
    setShieldsPopoverOpen, 
    activeTab,
    reloadTab
  } = useBrowser();

  if (!shieldsPopoverOpen) return null;

  let currentHost = 'Voile Protected Space';
  try {
    if (activeTab.url.startsWith('http')) {
      currentHost = new URL(activeTab.url).hostname;
    } else if (activeTab.url.startsWith('voile://')) {
      currentHost = activeTab.url.replace('voile://', 'voile://');
    }
  } catch {
    currentHost = activeTab.url;
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/20" 
        onClick={() => setShieldsPopoverOpen(false)} 
      />
      <div className="absolute right-14 top-14 w-80 bg-[#131B2E] border border-white/10 rounded-xl shadow-2xl backdrop-blur-2xl z-50 p-4 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${shieldsEnabled ? 'bg-voile-accent/20 text-voile-accent' : 'bg-red-500/20 text-red-400'}`}>
              {shieldsEnabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-semibold text-sm leading-tight">Voile Shields</div>
              <div className="text-[11px] text-slate-400 truncate max-w-[170px]">{currentHost}</div>
            </div>
          </div>
          <button
            onClick={toggleShields}
            className="focus:outline-none transition-transform hover:scale-105"
            title={shieldsEnabled ? 'Disable shields for this site' : 'Enable shields for this site'}
          >
            {shieldsEnabled ? (
              <ToggleRight className="w-8 h-8 text-voile-accent" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-500" />
            )}
          </button>
        </div>

        {/* State Banner */}
        <div className="my-3 py-2 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-slate-300">
            Shields are <strong className={shieldsEnabled ? 'text-voile-accent' : 'text-red-400'}>{shieldsEnabled ? 'UP' : 'DOWN'}</strong>
          </span>
          <button 
            onClick={() => reloadTab()}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Reload site
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 text-center">
          <div className="p-2 rounded-lg bg-[#0E1524] border border-white/5">
            <div className="text-lg font-bold text-voile-accent">
              {shieldsEnabled ? privacyStats.trackersBlocked : 0}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Trackers</div>
          </div>
          <div className="p-2 rounded-lg bg-[#0E1524] border border-white/5">
            <div className="text-lg font-bold text-emerald-400">
              {shieldsEnabled ? privacyStats.adsBlocked : 0}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Ads Blocked</div>
          </div>
          <div className="p-2 rounded-lg bg-[#0E1524] border border-white/5">
            <div className="text-lg font-bold text-purple-400">
              {shieldsEnabled ? privacyStats.fingerprintsBlocked : 0}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Fingerprints</div>
          </div>
        </div>

        {/* Protections Checklist (Matching Architecture Diagram) */}
        <div className="mt-3 pt-3 border-t border-white/5 space-y-2.5 text-xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Privacy Protection
          </div>

          <div className="flex items-center justify-between text-slate-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Ad &amp; Tracker Blocking</span>
            </div>
            <span className="text-[11px] font-mono text-purple-400 font-medium">uBlock Active</span>
          </div>

          <div className="flex items-center justify-between text-slate-200">
            <div className="flex items-center gap-2">
              <EyeOff className="w-3.5 h-3.5 text-sky-400" />
              <span>ClearURLs</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-medium">Stripping Active</span>
          </div>

          <div className="flex items-center justify-between text-slate-200">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
              <span>Fingerprint Protection</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-medium">Randomized</span>
          </div>

          <div className="flex items-center justify-between text-slate-200">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Private Search (Startpage)</span>
            </div>
            <span className="text-[11px] font-mono text-voile-accent font-medium">Default</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>La vie privée avant tout</span>
          </div>
          <button 
            onClick={() => setShieldsPopoverOpen(false)}
            className="hover:text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};
