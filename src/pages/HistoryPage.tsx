import React, { useState } from 'react';
import { useBrowser } from '../context/BrowserContext';
import { 
  Clock, 
  Trash2, 
  ExternalLink, 
  Search, 
  Globe, 
  Calendar,
  AlertTriangle 
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { history, navigateTab, setIsClearHistoryModalOpen } = useBrowser();
  const [search, setSearch] = useState('');

  const filtered = history.filter(h => 
    h.title.toLowerCase().includes(search.toLowerCase()) || 
    h.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0F19] text-white p-6 no-scrollbar">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-voile-accent" />
              <span>Browsing History</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Review and clear site visits recorded in your local browser sandbox.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsClearHistoryModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold hover:bg-red-500/30 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Clear Browsing Data</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search browsing history..."
            className="w-full pl-9 pr-3 py-2 bg-[#131B2E] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-voile-accent/60"
          />
        </div>

        {/* History List */}
        <div className="bg-[#0E1524] border border-white/[0.08] rounded-2xl overflow-hidden shadow-voile-card divide-y divide-white/[0.06]">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No history entries found.
            </div>
          ) : (
            filtered.map((item) => {
              const timeString = new Date(item.visitedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div
                  key={item.id}
                  onClick={() => navigateTab(item.url, item.title)}
                  className="p-3.5 hover:bg-white/[0.03] transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-[11px] font-mono text-slate-500 w-14 shrink-0">
                      {timeString}
                    </span>
                    <Globe className="w-4 h-4 text-slate-400 group-hover:text-voile-accent shrink-0" />
                    <div className="truncate">
                      <h4 className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10.5px] text-slate-500 font-mono truncate">
                        {item.url}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                      {item.visitCount} visits
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-voile-accent" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
