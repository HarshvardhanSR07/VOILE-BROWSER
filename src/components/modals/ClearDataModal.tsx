import React, { useState } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { X, Trash2, AlertTriangle, Check } from 'lucide-react';

export const ClearDataModal: React.FC = () => {
  const { isClearHistoryModalOpen, setIsClearHistoryModalOpen, clearHistory } = useBrowser();
  const [cleared, setCleared] = useState(false);

  if (!isClearHistoryModalOpen) return null;

  const handleClear = () => {
    clearHistory();
    setCleared(true);
    setTimeout(() => {
      setCleared(false);
      setIsClearHistoryModalOpen(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#131B2E] border border-white/10 rounded-2xl shadow-2xl p-5 text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold">Clear Browsing Data</h3>
          </div>
          <button
            onClick={() => setIsClearHistoryModalOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>This will delete all cached history entries, local storage cookies, and session logs on this device.</span>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded accent-voile-accent" />
              <span>Browsing & navigation history</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded accent-voile-accent" />
              <span>Cookies and cross-site data</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded accent-voile-accent" />
              <span>Cached images and web assets</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setIsClearHistoryModalOpen(false)}
            className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={cleared}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-1.5"
          >
            {cleared ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Cleared!
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
