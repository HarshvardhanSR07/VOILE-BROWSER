import React, { useState } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { Mascot } from './Mascot';
import { AdaLPopup } from '../adal/AdaLPopup';
import { Sparkles, X } from 'lucide-react';

export const AdaLMascotWidget: React.FC = () => {
  const { 
    isAdaLOpen, 
    toggleAdaL
  } = useBrowser();

  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [permissionBlocked] = useState(false);

  return (
    <>
      {/* 1. Redesigned Premium AdaL AI Companion Popup (Matches Reference Image 1) */}
      <AdaLPopup />

      {/* 2. Floating AI Agent Mascot Button at Bottom Right Corner */}
      <div className="fixed bottom-4 right-5 z-40 flex flex-col items-end pointer-events-auto select-none">
        {/* Proactive / Interactive Speech Bubble */}
        {showSpeechBubble && !isAdaLOpen && (
          <div className="mb-2 max-w-[220px] p-2.5 rounded-2xl bg-[#0E1524]/95 backdrop-blur-xl border border-voile-accent/30 shadow-2xl text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200 relative group cursor-pointer"
               onClick={toggleAdaL}>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-voile-accent flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AdaL Companion
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpeechBubble(false);
                }}
                className="text-slate-400 hover:text-white p-0.5 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] leading-snug text-slate-300">
              {permissionBlocked 
                ? '⚠️ Blocked location request! Click me to review.' 
                : 'I can summarize this page or plan a private trip. Click me!'}
            </p>
            {/* Small triangle arrow pointing down to mascot */}
            <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-[#0E1524] border-b border-r border-voile-accent/30 transform rotate-45" />
          </div>
        )}

        {/* Mascot Pedestal & Interactive Character */}
        <div 
          className="relative group cursor-pointer"
          onClick={toggleAdaL}
          title="AdaL — Your AI Mascot & Companion (Click to open chat)"
        >
          {/* Subtle Ambient Glowing Orb */}
          <div className="absolute inset-0 bg-gradient-to-tr from-voile-accent/25 via-indigo-500/20 to-sky-400/25 blur-xl rounded-full -z-10 group-hover:scale-115 transition-transform duration-300" />

          {/* Frosted Base Container */}
          <div className="relative p-1 rounded-full bg-[#0B0F19]/90 border border-white/15 group-hover:border-voile-accent/60 shadow-2xl transition-all duration-300 flex items-center justify-center">
            {/* The Cursor-Tracking Interactive Mascot */}
            <Mascot
              directions="./mascots/scout-directions.webp"
              reactions="./mascots/scout-reactions.webp"
              size={76}
              label="AdaL AI Agent Mascot"
            />

            {/* Active Status Ring Badge */}
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0B0F19] shadow-sm flex items-center justify-center" title="AdaL Online & Guarding">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
