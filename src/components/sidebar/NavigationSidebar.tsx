import React from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { 
  Home, 
  LayoutGrid, 
  EyeOff, 
  Bookmark, 
  Clock, 
  Download, 
  ShieldCheck, 
  Settings,
  Shield,
  Sparkles,
  Layers,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { ActiveView } from '../../types/browser';

import { VoileLogo } from '../common/VoileLogo';

interface NavItemConfig {
  id: ActiveView;
  label: string;
  icon: React.ElementType;
  badge?: string;
  isPrivateAccent?: boolean;
}

export const NavigationSidebar: React.FC = () => {
  const { activeView, setActiveView, sidebarPosition, toggleSidebar, isAdaLOpen, toggleAdaL } = useBrowser();

  const navItems: NavItemConfig[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workspace', label: 'Workspace', icon: LayoutGrid, badge: 'Hub' },
    { id: 'private', label: 'Private Mode', icon: EyeOff, isPrivateAccent: true },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'privacy', label: 'Privacy Center', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const borderClass = sidebarPosition === 'right' ? 'border-l border-white/[0.08]' : 'border-r border-white/[0.08]';

  return (
    <aside className={`w-56 bg-[#0B0F19] ${borderClass} flex flex-col justify-between shrink-0 select-none z-20 transition-all`}>
      {/* Top Branding Section */}
      <div>
        <div className="flex items-center justify-between px-3 pt-3 pb-2 mx-1">
          <div 
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2.5 cursor-pointer group hover:opacity-90 transition-opacity"
          >
            <VoileLogo className="w-7 h-7 transition-transform group-hover:scale-105" glow={true} />
            <div>
              <span className="font-bold text-sm text-white tracking-wide font-sans block leading-none">
                Voile
              </span>
              <span className="text-[9.5px] text-sky-400 font-mono tracking-wider font-semibold uppercase mt-0.5 block">
                AI Browser
              </span>
            </div>
          </div>

          {/* Close / Collapse Sidebar button */}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Collapse Sidebar (Ctrl+B)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? item.isPrivateAccent
                      ? 'bg-purple-950/60 text-purple-200 border border-purple-500/30 shadow-sm'
                      : 'bg-voile-accent/15 text-white border border-voile-accent/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon 
                    className={`w-4 h-4 ${
                      isSelected 
                        ? item.isPrivateAccent ? 'text-purple-400' : 'text-voile-accent'
                        : 'text-slate-400'
                    }`} 
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold rounded bg-voile-indigo/20 text-voile-indigo border border-voile-indigo/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Privacy Statement & Status */}
      <div className="p-4 border-t border-white/[0.05] bg-[#080C14]">
        {/* Quick AdaL trigger card */}
        <div 
          onClick={toggleAdaL}
          className="mb-3 p-2.5 rounded-xl bg-gradient-to-r from-voile-indigo/15 to-voile-accent/10 border border-white/10 hover:border-voile-accent/30 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-voile-accent animate-pulse" />
              <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                AdaL Companion
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {isAdaLOpen ? 'Open' : 'Minimized'}
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1 leading-snug line-clamp-2">
            AI assistance with client-side zero-leakage guarantee.
          </p>
        </div>

        {/* Motto / Philosophy */}
        <div className="flex items-center gap-2 text-slate-400">
          <Shield className="w-3.5 h-3.5 text-voile-accent/80 shrink-0" />
          <span className="text-[11px] font-medium text-slate-400 italic">
            "La vie privée avant tout."
          </span>
        </div>
        <div className="text-[9.5px] text-slate-500 mt-1 pl-5.5">
          Privacy-First Architecture
        </div>
      </div>
    </aside>
  );
};
