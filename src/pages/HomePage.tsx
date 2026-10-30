import React, { useState, useEffect } from 'react';
import { useBrowser, SEARCH_ENGINES } from '../context/BrowserContext';
import { SearchEngineType } from '../types/browser';
import { VoileLogo } from '../components/common/VoileLogo';
import { Shortcuts } from '../components/browser/Shortcuts';
import { Search, ArrowRight, ChevronDown } from 'lucide-react';

const renderEngineIcon = (engine: SearchEngineType) => {
  switch (engine) {
    case 'DuckDuckGo':
      return (
        <div className="w-5 h-5 rounded-full bg-[#DE5833] flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-0.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="#DE5833"/>
            {/* Duck head & body */}
            <path d="M12 4.5C9.8 4.5 8.2 6.2 8.2 8.4C8.2 9.5 8.8 10.6 9.6 11.3L9.2 13.8C9.2 15 10.4 16 12 16C13.6 16 14.8 15 14.8 13.8L14.4 11.3C15.2 10.6 15.8 9.5 15.8 8.4C15.8 6.2 14.2 4.5 12 4.5Z" fill="white"/>
            {/* Beak */}
            <path d="M14.4 7.8C16.2 7.8 17.8 8.3 18.2 9.2C17.2 9.8 15.5 9.8 14.2 9.6L14.4 7.8Z" fill="#F4A62A"/>
            {/* Eye */}
            <circle cx="13" cy="7.5" r="0.8" fill="#222"/>
            {/* Bowtie */}
            <path d="M10.2 15.2L12 16L13.8 15.2L13.8 16.8L12 16L10.2 16.8Z" fill="#459E3D"/>
          </svg>
        </div>
      );
    case 'Google':
      return (
        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm p-0.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
        </div>
      );
    case 'Brave':
      return (
        <div className="w-5 h-5 rounded-full bg-[#FB542B] flex items-center justify-center shrink-0 shadow-sm text-white font-bold text-[10px]">
          B
        </div>
      );
    case 'Startpage':
      return (
        <div className="w-5 h-5 rounded-full bg-[#1B365D] flex items-center justify-center shrink-0 shadow-sm text-sky-400 font-bold text-[10px]">
          SP
        </div>
      );
    case 'Ecosia':
      return (
        <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm text-white font-bold text-[10px]">
          🌱
        </div>
      );
    default:
      return (
        <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
          <Search className="w-3 h-3" />
        </div>
      );
  }
};

export const HomePage: React.FC = () => {
  const { navigateTab, searchEngine, setSearchEngine } = useBrowser();
  const [searchQuery, setSearchQuery] = useState('');
  const [engineMenuOpen, setEngineMenuOpen] = useState(false);

  // Close engine menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && engineMenuOpen) {
        setEngineMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engineMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTab(searchQuery.trim());
    }
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden min-h-0 bg-[#060B18] text-white select-none">
      {/* 1. Luxurious Deep Blue Silk Waves Background */}
      <div 
        className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-95 z-0"
        style={{ backgroundImage: `url('./assets/home-waves.svg')` }}
      />

      {/* Ambient Radial Gradient Glow behind central hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-sky-500/[0.06] blur-[100px] pointer-events-none rounded-full" />

      {/* 2. Main Central Hero & Search Section */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-4 py-8 mx-auto -mt-6">
        {/* Freestanding 3D Glowing Feather Emblem */}
        <div className="relative mb-3 flex items-center justify-center">
          <VoileLogo 
            className="w-20 h-20 sm:w-24 sm:h-24 filter drop-shadow-[0_12px_28px_rgba(56,189,248,0.45)]" 
            glow={true} 
          />
        </div>

        {/* Clean Title */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-sans mb-1.5">
          Voile
        </h1>

        {/* Subtitle matching reference design */}
        <p className="text-sm sm:text-base font-normal text-slate-400 tracking-wide">
          Privacy first. AI native.
        </p>

        {/* Central Search Bar Capsule with high stacking context */}
        <div className="w-full max-w-2xl mt-8 relative z-30">
          <form 
            onSubmit={handleSearchSubmit}
            className="relative flex items-center h-14 w-full rounded-full bg-[#0D1526]/80 backdrop-blur-xl border border-white/[0.12] hover:border-white/20 focus-within:border-sky-400/60 focus-within:ring-4 focus-within:ring-sky-400/15 shadow-[0_10px_35px_rgba(0,0,0,0.4)] transition-all px-2.5"
          >
            {/* Search Engine Selector Dropdown Pill */}
            <div className="relative flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setEngineMenuOpen(!engineMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full hover:bg-white/[0.08] text-xs font-medium text-slate-200 transition-colors"
                title="Change search engine"
              >
                {renderEngineIcon(searchEngine)}
                <span className="text-xs font-medium text-slate-200">{SEARCH_ENGINES[searchEngine]?.name || searchEngine}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${engineMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Vertical Separator */}
              <div className="w-[1px] h-6 bg-white/10 mx-2" />

              {/* Dropdown Menu */}
              {engineMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setEngineMenuOpen(false)} />
                  <div className="absolute left-0 top-full mt-2.5 w-52 py-2 px-1.5 bg-[#0D1526]/98 border border-white/10 rounded-2xl shadow-2xl z-50 text-xs backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                    {(Object.keys(SEARCH_ENGINES) as SearchEngineType[]).map(key => {
                      const opt = SEARCH_ENGINES[key];
                      const isSelected = searchEngine === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSearchEngine(key);
                            setEngineMenuOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2.5 ${
                            isSelected ? 'text-sky-400 font-semibold bg-white/[0.06]' : 'text-slate-300'
                          }`}
                        >
                          {renderEngineIcon(key)}
                          <span className="flex-1">{opt.name}</span>
                          {opt.privacy === 'High' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                              Private
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Magnifying Glass Search Icon */}
            <Search className="w-4 h-4 text-slate-400 ml-1 mr-2 shrink-0" />

            {/* Input Field */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the web privately..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-100 placeholder-slate-400 selection:bg-sky-400/30 px-1"
              autoFocus
            />

            {/* Circular Blue Submit Arrow Button */}
            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className="w-10 h-10 rounded-full bg-[#1A8CFF] hover:bg-[#38A3FF] text-white disabled:opacity-40 disabled:hover:bg-[#1A8CFF] transition-all flex items-center justify-center shrink-0 shadow-md ml-2"
              title="Search"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* 6 Website Shortcut Cards Row with Dynamic Spacing when Engine Menu is Open */}
        <Shortcuts className={engineMenuOpen ? 'mt-[236px]' : 'mt-8'} />
      </div>
    </div>
  );
};
