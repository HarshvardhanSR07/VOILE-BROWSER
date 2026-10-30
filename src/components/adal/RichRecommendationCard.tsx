import React, { useState } from 'react';
import { RecommendationCard } from '../../types/browser';
import { Globe, ArrowUpRight } from 'lucide-react';

interface RichRecommendationCardProps {
  card: RecommendationCard;
  onOpenLink: (url: string, title?: string) => void;
}

export const RichRecommendationCard: React.FC<RichRecommendationCardProps> = ({ card, onOpenLink }) => {
  const [imageLoaded, setImageLoaded] = useState(true);

  // Normalize and resolve canonical URL
  const normalizedUrl = (() => {
    if (!card.url) return '';
    const trimmed = card.url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/.test(trimmed)) return `https://${trimmed}`;
    return trimmed;
  })();

  const cleanDomain = card.domain || (() => {
    try {
      return new URL(normalizedUrl).hostname.replace(/^www\./, '');
    } catch {
      return 'web';
    }
  })();

  // Distinct monogram styling for leading knowledge and web sources
  const getBrandMonogram = (domain: string, title: string) => {
    const lower = domain.toLowerCase();
    if (lower.includes('wikipedia')) {
      return { text: 'W', bg: 'bg-slate-200', textColor: 'text-black font-serif' };
    }
    if (lower.includes('reddit')) {
      return { text: 'R', bg: 'bg-[#FF4500]', textColor: 'text-white' };
    }
    if (lower.includes('github')) {
      return { text: 'GH', bg: 'bg-[#24292E]', textColor: 'text-white' };
    }
    if (lower.includes('pixabay')) {
      return { text: 'px', bg: 'bg-[#00AB6B]', textColor: 'text-white' };
    }
    if (lower.includes('pexels')) {
      return { text: 'P', bg: 'bg-[#05A081]', textColor: 'text-white' };
    }
    if (lower.includes('unsplash')) {
      return { text: 'U', bg: 'bg-black border border-white/20', textColor: 'text-white' };
    }
    if (lower.includes('duckduckgo')) {
      return { text: 'DDG', bg: 'bg-[#DE5833]', textColor: 'text-white' };
    }
    const initial = (title || domain).trim().slice(0, 2).toUpperCase();
    return { text: initial, bg: 'bg-gradient-to-br from-sky-600 to-indigo-700', textColor: 'text-white' };
  };

  const monogram = getBrandMonogram(cleanDomain, card.title);

  // General high-quality category thumbnails for tech & privacy
  const getCuratedThumbnail = (domain: string, title: string) => {
    const lower = (domain + ' ' + title + ' ' + (card.description || '')).toLowerCase();
    if (lower.includes('code') || lower.includes('dev') || lower.includes('git')) {
      return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80';
    }
    if (lower.includes('privacy') || lower.includes('security') || lower.includes('encryption')) {
      return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80';
    }
    return null;
  };

  const displayImage = (imageLoaded && card.thumbnail) ? card.thumbnail : getCuratedThumbnail(cleanDomain, card.title);

  // Single unified navigation trigger with event neutralization
  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (normalizedUrl) {
      onOpenLink(normalizedUrl, card.title);
    }
  };

  return (
    <div 
      onClick={handleNavigate}
      className="p-4 rounded-2xl bg-[#091122]/90 hover:bg-[#0D1830] border border-sky-500/20 hover:border-sky-400/50 transition-all duration-200 shadow-xl shadow-black/40 flex flex-col sm:flex-row gap-4 justify-between items-start cursor-pointer group"
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (normalizedUrl) onOpenLink(normalizedUrl, card.title);
        }
      }}
      aria-label={`Open ${card.title} in a new tab`}
    >
      {/* Left Column: Brand Info, Description, Action Button */}
      <div className="flex-1 flex flex-col justify-between min-w-0 pr-1">
        <div>
          {/* Header Row: Logo, Title, Badge */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Monogram Brand Badge */}
            <div 
              onClick={handleNavigate}
              className={`w-7 h-7 rounded-lg ${monogram.bg} ${monogram.textColor} font-bold text-xs flex items-center justify-center shrink-0 shadow-sm cursor-pointer`}
            >
              {monogram.text}
            </div>

            {/* Title */}
            <h4 
              onClick={handleNavigate}
              className="text-base font-bold text-white group-hover:text-sky-300 transition-colors tracking-tight cursor-pointer"
            >
              {card.title}
            </h4>

            {/* Quality / Category Badge */}
            {card.badge && (
              <span className="px-2 py-0.5 rounded-full bg-sky-950/70 border border-sky-400/35 text-sky-300 text-[11px] font-medium tracking-tight">
                {card.badge}
              </span>
            )}
          </div>

          {/* Description */}
          {card.description && (
            <p className="text-xs text-slate-300 leading-relaxed mt-2.5 line-clamp-3">
              {card.description}
            </p>
          )}

          {/* Clean Domain Breadcrumb */}
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <span className="text-slate-500">Source:</span>
            <span className="text-sky-400/90 underline decoration-sky-500/40">{cleanDomain}</span>
          </div>
        </div>

        {/* Action Button: Explore Domain ↗ */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleNavigate}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-sky-950/60 flex items-center gap-1.5 transition-all active:scale-95 group-hover:shadow-sky-500/20"
          >
            <span>{card.actionLabel || `Explore ${card.title}`}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Column: High Quality Preview Thumbnail */}
      {displayImage ? (
        <div 
          onClick={handleNavigate}
          className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-md relative bg-[#070D18] cursor-pointer"
        >
          <img
            src={displayImage}
            alt={card.title}
            onError={() => setImageLoaded(false)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      ) : (
        <div 
          onClick={handleNavigate}
          className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden shrink-0 border border-sky-500/15 bg-gradient-to-br from-sky-950/40 to-[#0A1224] flex flex-col items-center justify-center text-sky-400/50 p-2 text-center cursor-pointer group-hover:border-sky-400/40 transition-colors"
        >
          <Globe className="w-8 h-8 mb-1 opacity-60 text-sky-400" />
          <span className="text-[10px] text-slate-400 font-mono truncate max-w-full px-1">{cleanDomain}</span>
        </div>
      )}
    </div>
  );
};
