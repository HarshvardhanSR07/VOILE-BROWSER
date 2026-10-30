import React from 'react';
import { useBrowser } from '../context/BrowserContext';
import { 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  Share2, 
  Printer, 
  RotateCw,
  AlertCircle,
  FileText,
  Info
} from 'lucide-react';

export const SimulatedWebPage: React.FC = () => {
  const { activeTab, privacyStats, shieldsEnabled, sendAdaLMessage, openNewTab } = useBrowser();

  const domain = (() => {
    try {
      return new URL(activeTab.url).hostname;
    } catch {
      return activeTab.url;
    }
  })();

  const isSearch = activeTab.url.includes('search') || activeTab.url.includes('query=') || activeTab.url.includes('?q=');
  const isWikipedia = activeTab.url.includes('wikipedia');
  const isGithub = activeTab.url.includes('github');
  const isProton = activeTab.url.includes('proton');

  return (
    <div className="flex-1 overflow-y-auto bg-[#0E1524] text-slate-100 flex flex-col no-scrollbar">
      {/* Top Page Header Banner */}
      <div className="px-6 py-3 bg-[#131B2E] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 text-xs">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-medium">Strict HTTPS • TLS 1.3</span>
          </div>

          <div className="p-1.5 rounded-lg bg-voile-accent/10 text-voile-accent border border-voile-accent/20 flex items-center gap-1.5 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Shields Active ({shieldsEnabled ? privacyStats.trackersBlocked : 0} Trackers Blocked)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => sendAdaLMessage(`Please analyze and summarize the page: ${activeTab.title} (${activeTab.url})`)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-voile-accent to-voile-indigo text-slate-950 font-semibold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Summarize with AdaL</span>
          </button>

          <a
            href={activeTab.url}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Open in native desktop browser window"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Page Content Body */}
      <div className="max-w-4xl mx-auto p-8 w-full flex-1 space-y-6">
        {/* Title area */}
        <div className="pb-4 border-b border-white/[0.08]">
          <span className="text-xs font-mono text-voile-accent">{domain}</span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1">
            {activeTab.title}
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1 break-all">
            {activeTab.url}
          </p>
        </div>

        {/* Dynamic Mockup Content Based on Target */}
        {isWikipedia ? (
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p className="text-base text-slate-200">
              The free encyclopedia that anyone can edit. Voile ensures your reading habits, political inquiries, and research remain completely confidential without third-party tracking telemetry or ad network surveillance.
            </p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <h3 className="font-semibold text-white">Browser Architecture Overview</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Modern web browsers are divided into multiple distinct processes: the Browser process (responsible for window chrome, tab management, and network I/O), the Renderer process (running Blink/Gecko to layout HTML, CSS, and execute JavaScript in isolated sandboxes), and specialized GPU/Utility processes.
              </p>
            </div>
          </div>
        ) : isGithub ? (
          <div className="space-y-4 text-sm text-slate-300">
            <div className="p-4 rounded-xl bg-[#131B2E] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400">voile / browser-core</span>
                <h3 className="text-base font-semibold text-white">A Privacy-First, AI-Native Web Browser</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono">
                main branch
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Voile is an ambitious exploration of browser engineering designed to integrate privacy protections, user experience, and native AI into a single coherent interface.
            </p>
          </div>
        ) : isProton ? (
          <div className="space-y-4 text-sm text-slate-300">
            <div className="p-5 rounded-2xl bg-[#131B2E] border border-white/10">
              <h3 className="text-lg font-semibold text-white">Proton Mail Secure Portal</h3>
              <p className="text-xs text-slate-400 mt-1">
                Zero-access encrypted inbox protected by Swiss privacy legislation.
              </p>
            </div>
          </div>
        ) : isSearch ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Encrypted Search Results
            </h3>
            {[
              {
                title: 'Voile: La vie privée avant tout',
                url: 'https://voile.browser/mission',
                snippet: 'Voile combines advanced uBlock Origin rule parsing, Canvas and AudioContext fingerprint mitigation, and the AdaL local assistant.'
              },
              {
                title: 'Privacy-First Web Browsing in 2026',
                url: 'https://privacyguides.org/browsers/voile',
                snippet: 'Comprehensive analysis of modern browser engines: Gecko vs Chromium, isolating telemetry, and client-side sandboxing.'
              },
              {
                title: 'Open Source Security Research & Auditing',
                url: 'https://eff.org/deeplinks/voile-architecture',
                snippet: 'Why separating browsing execution from third-party tracking trackers is essential for modern web safety.'
              }
            ].map((res, i) => (
              <div 
                key={i} 
                onClick={() => openNewTab(res.url, res.title)}
                className="p-4 rounded-xl bg-[#131B2E]/60 border border-white/5 hover:border-voile-accent/40 cursor-pointer transition-all"
              >
                <span className="text-[11px] font-mono text-voile-accent">{res.url}</span>
                <h4 className="text-sm font-semibold text-white hover:underline mt-0.5">{res.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{res.snippet}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-voile-accent font-semibold text-sm">
              <Info className="w-4 h-4" />
              <span>Simulated Sandbox Web View</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              This webpage is isolated inside Voile's protected process container. All cross-site cookie leaks, script trackers, and device fingerprint queries have been automatically shielded.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
