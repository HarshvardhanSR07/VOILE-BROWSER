import React from 'react';
import { Sparkles, Search, X } from 'lucide-react';

interface AdaLHeaderProps {
  onClose: () => void;
  activeSearchMode?: string;
}

export const AdaLHeader: React.FC<AdaLHeaderProps> = ({ 
  onClose,
  activeSearchMode = 'Tavily Search'
}) => {
  return (
    <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-[#0C152B] via-[#091122] to-[#070D1A] shrink-0">
      <div className="flex items-center gap-3.5">
        {/* Glowing AdaL Mascot Avatar */}
        <div className="relative">
          <div className="absolute inset-0 bg-sky-400/30 blur-md rounded-2xl animate-pulse" />
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400/20 via-blue-600/30 to-indigo-600/30 border border-sky-400/40 flex items-center justify-center text-sky-300 shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5 text-sky-400" />
          </div>
        </div>

        <div>
          {/* Title & Badge Row */}
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white tracking-tight">AdaL</h2>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-950/60 border border-sky-400/40 text-sky-300 text-xs font-medium shadow-sm">
              <Search className="w-3 h-3 text-sky-400" />
              <span>{activeSearchMode}</span>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xs text-slate-400 mt-0.5 tracking-tight">
            Your built-in privacy companion
          </p>
        </div>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-400"
        title="Close AdaL"
        aria-label="Close AdaL Companion"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
