import React, { useState } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { Play, Search, ShieldCheck, Monitor, ExternalLink, Sparkles } from 'lucide-react';

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

interface CuratedVideo {
  id: string;
  title: string;
  channel: string;
  category: string;
  duration: string;
}

const FEATURED_VIDEOS: CuratedVideo[] = [
  {
    id: 'jfKfP5Ev038',
    title: 'lofi hip hop radio 📚 - beats to relax/study to',
    channel: 'Lofi Girl',
    category: 'Music',
    duration: 'LIVE'
  },
  {
    id: 'ybaX49pK1Yo',
    title: 'Why Privacy Still Matters in 2024',
    channel: 'The Hated One',
    category: 'Privacy',
    duration: '14:20'
  },
  {
    id: 'WjDrn4qH_yQ',
    title: 'How Web Browsers Work: Architecture & Engines',
    channel: 'Computerphile',
    category: 'Tech',
    duration: '18:45'
  },
  {
    id: '7_LPdttKXPc',
    title: 'How the Internet Works in 5 Minutes',
    channel: 'Aaron',
    category: 'Tech',
    duration: '05:12'
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (4K)',
    channel: 'Rick Astley',
    category: 'Music',
    duration: '03:32'
  },
  {
    id: 'oHg5SJYRHA0',
    title: 'The Future of AI & Personal Computing',
    channel: 'Lex Fridman Clips',
    category: 'AI',
    duration: '12:10'
  }
];

export const YouTubePrivacyHub: React.FC<{ initialQuery?: string }> = ({ initialQuery = '' }) => {
  const { navigateTab, sendAdaLMessage } = useBrowser();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Privacy', 'Tech', 'Music', 'AI'];

  const filteredVideos = selectedCategory === 'All' 
    ? FEATURED_VIDEOS 
    : FEATURED_VIDEOS.filter(v => v.category === selectedCategory);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if user entered a direct YouTube video URL
    const urlMatch = searchQuery.match(/(?:v=|\/shorts\/|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (urlMatch && urlMatch[1]) {
      navigateTab(`https://www.youtube.com/watch?v=${urlMatch[1]}`);
      return;
    }

    // Otherwise navigate to DuckDuckGo/Startpage privacy video search
    navigateTab(`https://html.duckduckgo.com/html/?q=site:youtube.com+${encodeURIComponent(searchQuery.trim())}`);
  };

  const handlePlayVideo = (videoId: string, title: string) => {
    navigateTab(`https://www.youtube.com/watch?v=${videoId}`, `${title} — Voile Privacy Player`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0F19] text-white overflow-y-auto select-none p-6">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Top Info Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-voile-navy to-voile-accent/10 border border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <YoutubeIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Voile YouTube Privacy Player</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium">
                  Zero Telemetry
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Stream videos directly via YouTube's privacy-enhanced embed without tracking cookies or intrusive ads.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Open in Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Video / URL Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="flex items-center h-12 px-4 rounded-2xl bg-[#111726] border border-white/10 hover:border-white/20 focus-within:border-red-500/60 focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Paste any YouTube video link (e.g. watch?v=...) or search topics..."
              className="flex-1 bg-transparent border-none outline-none text-xs text-slate-100 placeholder-slate-500"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              Play Video
            </button>
          </div>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Curated Privacy Video Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Featured Privacy & Tech Streams
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => handlePlayVideo(video.id, video.title)}
                className="group p-3 rounded-2xl bg-[#111726] border border-white/[0.06] hover:border-red-500/40 hover:bg-[#151D30] transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Thumbnail Preview Area */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 mb-3 border border-white/5">
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-red-600 group-hover:scale-110 text-white flex items-center justify-center shadow-lg transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                    {video.duration}
                  </span>
                </div>

                {/* Video Info */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-red-400 transition-colors line-clamp-2 leading-relaxed">
                    {video.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>{video.channel}</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-slate-400">
                      {video.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Browser Tip Card */}
        <div className="p-4 rounded-2xl bg-[#0F1626] border border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-voile-accent" />
            <span>
              Want the full native YouTube website with your Google account, playlists, and comments? Launch Voile via <code className="text-voile-accent bg-black/40 px-1.5 py-0.5 rounded font-mono">npm run app</code>.
            </span>
          </div>
          <button
            onClick={() => sendAdaLMessage('How do I play YouTube videos in Voile?')}
            className="text-xs text-voile-accent hover:underline shrink-0 ml-3"
          >
            Ask AdaL
          </button>
        </div>
      </div>
    </div>
  );
};
