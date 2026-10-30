import React, { useState, useEffect } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { Star, Trash2, Check, FolderPlus, Folder } from 'lucide-react';

export const BookmarkPopover: React.FC = () => {
  const {
    bookmarks,
    bookmarkFolders,
    activeTab,
    isBookmarkPopoverOpen,
    setIsBookmarkPopoverOpen,
    addBookmark,
    updateBookmark,
    removeBookmark,
    addBookmarkFolder
  } = useBrowser();

  const currentBookmark = bookmarks.find(b => b.url === activeTab.url);

  const [title, setTitle] = useState(currentBookmark?.title || activeTab?.title || 'Bookmark');
  const [folderId, setFolderId] = useState<string>(currentBookmark?.folderId || '');
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  useEffect(() => {
    if (isBookmarkPopoverOpen) {
      setTitle(currentBookmark?.title || activeTab?.title || 'Bookmark');
      setFolderId(currentBookmark?.folderId || '');
      setIsCreatingFolder(false);
      setNewFolderName('');
    }
  }, [isBookmarkPopoverOpen, currentBookmark, activeTab]);

  if (!isBookmarkPopoverOpen) return null;

  const handleSaveAndClose = () => {
    let finalFolderId = folderId;
    if (isCreatingFolder && newFolderName.trim()) {
      const created = addBookmarkFolder(newFolderName.trim());
      finalFolderId = created.id;
    }

    if (currentBookmark) {
      updateBookmark(currentBookmark.id, {
        title: title.trim() || activeTab.title || 'Bookmark',
        folderId: finalFolderId || undefined
      });
    } else {
      addBookmark(
        title.trim() || activeTab.title || 'Bookmark',
        activeTab.url,
        finalFolderId || undefined
      );
    }
    setIsBookmarkPopoverOpen(false);
  };

  const handleRemove = () => {
    if (currentBookmark) {
      removeBookmark(currentBookmark.id);
    }
    setIsBookmarkPopoverOpen(false);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      const created = addBookmarkFolder(newFolderName.trim());
      setFolderId(created.id);
      setIsCreatingFolder(false);
      setNewFolderName('');
    }
  };

  return (
    <>
      {/* Click-away backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/20" 
        onClick={handleSaveAndClose} 
      />

      {/* Popover Bubble anchored under Omnibox Star button */}
      <div 
        className="absolute right-12 top-13 w-80 bg-[#131B2E] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 p-4 text-slate-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">
              {currentBookmark ? 'Bookmark Saved' : 'Add Bookmark'}
            </h3>
            <p className="text-[11px] text-slate-400">
              Saved directly to your browser bookmarks
            </p>
          </div>
        </div>

        <div className="mt-3.5 space-y-3">
          {/* Bookmark Name Input */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveAndClose();
                }
              }}
              className="w-full px-3 py-1.5 bg-[#0E1524] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-voile-accent/60"
              autoFocus
            />
          </div>

          {/* Folder Selection (Completely Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-300">
                Folder
              </label>
              {!isCreatingFolder && (
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(true)}
                  className="text-[10.5px] text-voile-accent hover:underline flex items-center gap-1"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>New folder</span>
                </button>
              )}
            </div>

            {!isCreatingFolder ? (
              <select
                value={folderId}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setIsCreatingFolder(true);
                  } else {
                    setFolderId(e.target.value);
                  }
                }}
                className="w-full px-3 py-1.5 bg-[#0E1524] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-voile-accent/60"
              >
                <option value="">Bookmarks bar</option>
                {bookmarkFolders.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
                <option value="__new__">+ New folder...</option>
              </select>
            ) : (
              <form onSubmit={handleCreateFolder} className="flex gap-1.5 mt-1">
                <input
                  type="text"
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-[#0E1524] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-voile-accent/60"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-2.5 py-1.5 rounded-xl bg-voile-accent text-slate-950 text-xs font-medium hover:bg-sky-300 disabled:opacity-40"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(false)}
                  className="px-2 py-1.5 rounded-xl hover:bg-white/10 text-slate-400 text-xs"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleRemove}
            className="px-2.5 py-1.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
            title="Remove this bookmark"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-voile-accent text-slate-950 hover:bg-sky-300 transition-colors flex items-center gap-1 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </>
  );
};
