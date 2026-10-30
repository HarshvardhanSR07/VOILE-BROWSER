// src/components/agent/ArtifactsView.tsx
// Verified Deliverables & Artifacts Gallery for Autonomous Workflows

import React from 'react';
import { useAgent } from '../../context/AgentContext';
import { FileSpreadsheet, FileText, CheckCircle2, Download, ExternalLink, Sparkles, Folder } from 'lucide-react';

export const ArtifactsView: React.FC = () => {
  const { plan } = useAgent();

  const artifacts = plan?.artifacts || [];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar select-text">
      {artifacts.length === 0 ? (
        <div className="flex-1 h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 select-none">
          <Folder className="w-10 h-10 text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">No Artifacts Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Run Workflow A (Spreadsheet) or Workflow B (GTM Pack) to generate verified output files.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {artifacts.map((art, index) => (
            <div
              key={`${art.path}-${index}`}
              className="p-4 rounded-2xl bg-[#0A1224] border border-sky-500/20 shadow-lg space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  art.type === 'spreadsheet' 
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                    : 'bg-purple-500/15 border border-purple-500/30 text-purple-400'
                }`}>
                  {art.type === 'spreadsheet' ? <FileSpreadsheet className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      VERIFIED DELIVERABLE
                    </span>
                    {art.size && <span className="text-[10px] text-slate-400 font-mono">{art.size}</span>}
                  </div>

                  <h4 className="text-sm font-bold text-white mt-1 truncate">
                    {art.name}
                  </h4>
                  {art.summary && (
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {art.summary}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[240px]">
                  {art.path}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    (window as any).voileDesktop?.openExternalTab?.(art.path);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Open Artifact</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
