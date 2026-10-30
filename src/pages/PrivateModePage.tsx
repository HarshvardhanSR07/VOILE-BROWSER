import React, { useState } from 'react';
import { useBrowser } from '../context/BrowserContext';
import { 
  EyeOff, 
  Shield, 
  Trash2, 
  Lock, 
  HardDrive, 
  Fingerprint, 
  Search, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const PrivateModePage: React.FC = () => {
  const { navigateTab, searchEngine } = useBrowser();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigateTab(search.trim());
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#090614] via-[#0D0B1F] to-[#080612] text-white p-6 no-scrollbar flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full text-center py-8">
        {/* Emblem */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 shadow-[0_0_35px_rgba(168,85,247,0.2)]">
          <EyeOff className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Voile Private Window
        </h1>

        <p className="text-sm text-purple-300/80 mb-8 max-w-lg mx-auto">
          Pages you view in this window won't appear in your browser history, and cookies will be cleared automatically when you close all private tabs.
        </p>

        {/* Private Search */}
        <form onSubmit={handleSearch} className="max-w-lg mx-auto relative mb-10">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search privately with ${searchEngine}...`}
            className="w-full h-12 pl-4 pr-12 rounded-2xl bg-white/[0.05] border border-purple-500/30 text-xs text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-500/40"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* What Private Mode does / doesn't do */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <span>What Voile Won't Save</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Browsing and search history</li>
              <li>Cookies and local site container data</li>
              <li>Form entries and temporary passwords</li>
              <li>Temporary download history</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>What Is Still Visible</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Websites you visit directly</li>
              <li>Your network ISP or network administrator</li>
              <li>Files you manually choose to download</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
