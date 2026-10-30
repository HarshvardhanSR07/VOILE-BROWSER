import React from 'react';
import { useBrowser } from '../context/BrowserContext';
import { 
  Download, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  FolderOpen 
} from 'lucide-react';

export const DownloadsPage: React.FC = () => {
  const { downloads } = useBrowser();

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0F19] text-white p-6 no-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Download className="w-6 h-6 text-voile-accent" />
              <span>Downloads</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Downloaded files are isolated in your operating system's designated safe directory.
            </p>
          </div>
        </div>

        <div className="bg-[#0E1524] border border-white/[0.08] rounded-2xl overflow-hidden shadow-voile-card divide-y divide-white/[0.06]">
          {downloads.map(d => (
            <div key={d.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-voile-accent">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    {d.filename}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                    <span>{d.size}</span>
                    <span>•</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </span>
                    <span>•</span>
                    <span>{d.completedAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => alert(`Simulated: Opening ${d.filename}`)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-200 transition-colors flex items-center gap-1"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Show in folder</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
