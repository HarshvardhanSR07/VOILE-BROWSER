import React, { useState } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { X, Star, Folder } from 'lucide-react';

export const AddBookmarkModal: React.FC = () => {
  const { 
    isAddBookmarkModalOpen, 
    setIsAddBookmarkModalOpen, 
    addBookmark, 
    activeTab, 
    bookmarkFolders 
  } = useBrowser();

  const [title, setTitle] = useState(activeTab?.title || '');
  const [url, setUrl] = useState(activeTab?.url || '');
  const [folderId, setFolderId] = useState<string>('');

  React.useEffect(() => {
    if (isAddBookmarkModalOpen && activeTab) {
      setTitle(activeTab.title || '');
      setUrl(activeTab.url || '');
      setFolderId('');
    }
  }, [isAddBookmarkModalOpen, activeTab]);

  if (!isAddBookmarkModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      addBookmark(title.trim() || url.trim(), url.trim(), folderId || undefined);
      setIsAddBookmarkModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#131B2E] border border-white/10 rounded-2xl shadow-2xl p-5 text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold">Bookmark Page</h3>
          </div>
          <button
            onClick={() => setIsAddBookmarkModalOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#0E1524] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-voile-accent/60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              URL
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 bg-[#0E1524] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-voile-accent/60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Folder
            </label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full px-3 py-2 bg-[#0E1524] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-voile-accent/60"
            >
              <option value="">Bookmarks Bar (Root)</option>
              {bookmarkFolders.map(f => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddBookmarkModalOpen(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-voile-accent text-slate-950 hover:bg-sky-300 transition-colors"
            >
              Save Bookmark
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
