import React from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { Plus, X } from 'lucide-react';
import { Shortcut } from '../../types/browser';

// Brand icons matching high-fidelity reference design
const renderShortcutIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('youtube')) {
    return (
      <div className="w-8 h-6 bg-[#FF0000] rounded-[6px] flex items-center justify-center shadow-sm">
        <svg className="w-3.5 h-3.5 text-white fill-current ml-0.5" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    );
  }
  if (t.includes('github')) {
    return (
      <svg className="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    );
  }
  if (t.includes('notion')) {
    return (
      <div className="w-7 h-7 flex items-center justify-center">
        <svg className="w-6.5 h-6.5 text-white fill-current" viewBox="0 0 24 24">
          <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l11.472-.699c.56 0 .093-.466-.186-.653L16.324 2.15c-.466-.373-1.12-.653-2.053-.56L3.526 2.57c-.56.046-.7.373-.466.653zm.653 3.639v12.316c0 .84.42 1.165 1.306 1.12l12.825-.747c.886-.046.98-.606.98-1.26V7.1c0-.7-.373-1.073-1.073-1.026L5.926 6.774c-.7.047-.814.42-.814 1.073zm12.315 1.493c.047.373 0 .746-.373.793l-.84.14v8.584c-.373.187-.793.28-1.213.28-.653 0-.933-.28-1.493-1.026l-4.2-6.39v6.577l1.4.28c.047.373-.093.746-.466.746l-3.36.187c-.046-.373 0-.746.374-.793l.933-.187V9.754l-1.306-.14c-.047-.373.093-.746.466-.746l3.547-.234 4.386 6.671V9.474l-1.12-.14c-.047-.373.093-.746.467-.746z"/>
        </svg>
      </div>
    );
  }
  if (t.includes('reddit')) {
    return (
      <div className="w-7 h-7 rounded-full bg-[#FF4500] flex items-center justify-center shadow-sm">
        <svg className="w-4.5 h-4.5 text-white fill-current" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      </div>
    );
  }
  if (t.includes('wikipedia')) {
    return (
      <span className="text-2xl font-serif font-black text-white tracking-tighter select-none">
        W
      </span>
    );
  }
  return (
    <span className="text-lg font-bold text-white uppercase">
      {title.charAt(0)}
    </span>
  );
};

export const Shortcuts: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { 
    shortcuts, 
    navigateTab, 
    removeShortcut, 
    setIsAddShortcutModalOpen 
  } = useBrowser();

  const handleShortcutClick = (shortcut: Shortcut) => {
    navigateTab(shortcut.url, shortcut.title);
  };

  return (
    <div className={`flex items-center justify-center gap-4 sm:gap-6 flex-wrap max-w-3xl mx-auto px-4 relative z-10 transition-all duration-300 ease-out ${className}`}>
      {shortcuts.map((shortcut) => (
        <div key={shortcut.id} className="group relative flex flex-col items-center">
          <button
            onClick={() => handleShortcutClick(shortcut)}
            className="w-16 h-16 rounded-2xl bg-[#0D1526]/80 backdrop-blur-md border border-white/[0.08] hover:border-sky-400/40 hover:bg-[#131E35] hover:shadow-[0_8px_25px_rgba(2,132,199,0.25)] hover:-translate-y-1 transition-all duration-200 flex items-center justify-center"
            title={`Open ${shortcut.title}`}
          >
            {renderShortcutIcon(shortcut.title)}
          </button>

          {/* Delete shortcut action on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeShortcut(shortcut.id);
            }}
            className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow"
            title="Delete shortcut"
          >
            <X className="w-3 h-3" />
          </button>

          <span className="text-xs font-normal text-slate-300 mt-2 truncate max-w-[76px] text-center tracking-wide">
            {shortcut.title}
          </span>
        </div>
      ))}

      {/* 6th Tile: Add Shortcut Tile */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => setIsAddShortcutModalOpen(true)}
          className="w-16 h-16 rounded-2xl bg-[#0D1526]/50 backdrop-blur-md border border-white/[0.08] hover:border-sky-400/40 hover:bg-[#131E35] hover:text-white text-slate-300 hover:shadow-[0_8px_25px_rgba(2,132,199,0.25)] hover:-translate-y-1 transition-all duration-200 flex items-center justify-center"
          title="Add custom shortcut"
        >
          <Plus className="w-6 h-6 stroke-[2]" />
        </button>
        <span className="text-xs font-normal text-slate-300 mt-2 tracking-wide">
          Add
        </span>
      </div>
    </div>
  );
};
