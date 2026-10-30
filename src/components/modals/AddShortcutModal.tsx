import React, { useState } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { X, Plus, Globe } from 'lucide-react';

export const AddShortcutModal: React.FC = () => {
  const { isAddShortcutModalOpen, setIsAddShortcutModalOpen, addShortcut } = useBrowser();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  if (!isAddShortcutModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && url.trim()) {
      let resolvedUrl = url.trim();
      if (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://')) {
        resolvedUrl = `https://${resolvedUrl}`;
      }
      addShortcut(name.trim(), resolvedUrl);
      setName('');
      setUrl('');
      setIsAddShortcutModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#131B2E] border border-white/10 rounded-2xl shadow-2xl p-5 text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-voile-accent" />
            <h3 className="text-sm font-semibold">Add Website Shortcut</h3>
          </div>
          <button
            onClick={() => setIsAddShortcutModalOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Shortcut Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Proton Mail"
              className="w-full px-3 py-2 bg-[#0E1524] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-voile-accent/60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Website URL
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. mail.proton.me"
              className="w-full px-3 py-2 bg-[#0E1524] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-voile-accent/60"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddShortcutModalOpen(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-voile-accent text-slate-950 hover:bg-sky-300 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Shortcut
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
