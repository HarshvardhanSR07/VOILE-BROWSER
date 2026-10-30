// src/components/agent/LiveLogsView.tsx
// Real-time Transparent Agent Execution Log Stream

import React, { useState, useEffect, useRef } from 'react';
import { useAgent } from '../../context/AgentContext';
import { Terminal, Trash2, Copy, Check, Filter } from 'lucide-react';

export const LiveLogsView: React.FC = () => {
  const { logs, clearLogs } = useAgent();
  const [copied, setCopied] = useState(false);
  const [filterSource, setFilterSource] = useState<string>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.level.toUpperCase()}] [${l.source}]: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = filterSource === 'all' 
    ? logs 
    : logs.filter(l => l.source === filterSource);

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'planner':
        return <span className="text-purple-400 font-bold">[PLANNER]</span>;
      case 'router':
        return <span className="text-sky-400 font-bold">[ROUTER]</span>;
      case 'cdp':
        return <span className="text-cyan-400 font-bold">[CDP-TAB]</span>;
      case 'verifier':
        return <span className="text-emerald-400 font-bold">[VERIFIER]</span>;
      case 'policy':
        return <span className="text-amber-400 font-bold">[POLICY]</span>;
      case 'user':
        return <span className="text-blue-400 font-bold">[USER]</span>;
      default:
        return <span className="text-slate-400">[{source.toUpperCase()}]</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-text font-mono text-xs">
      {/* Log Header Controls */}
      <div className="p-3 border-b border-white/10 bg-[#070D18] flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white tracking-tight">Execution Stream</span>
          <span className="text-[10px] text-slate-500">({filteredLogs.length} events)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Source Filter */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-[11px] text-slate-300 focus:outline-none"
          >
            <option value="all">All Sources</option>
            <option value="planner">Planner</option>
            <option value="router">Tool Router</option>
            <option value="cdp">CDP Automation</option>
            <option value="verifier">Verifier</option>
            <option value="policy">Policy Engine</option>
          </select>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Copy logs to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={clearLogs}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear log history"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Content Scroll Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3.5 space-y-2 bg-[#050912] font-mono text-[11px] no-scrollbar"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 text-xs select-none">
            No execution events recorded yet.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-500 shrink-0 select-none">
                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="shrink-0">{getSourceBadge(log.source)}</span>
              <span className={`flex-1 break-all ${
                log.level === 'error'
                  ? 'text-rose-400 font-semibold'
                  : log.level === 'warn'
                  ? 'text-amber-300'
                  : log.level === 'success'
                  ? 'text-emerald-300'
                  : log.level === 'action'
                  ? 'text-cyan-300'
                  : 'text-slate-300'
              }`}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
