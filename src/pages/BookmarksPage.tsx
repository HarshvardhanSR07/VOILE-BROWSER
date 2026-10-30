import React, { useState } from 'react';
import { useBrowser } from '../context/BrowserContext';
import { 
  Bookmark, 
  Folder, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Search, 
  Globe, 
  FolderPlus,
  Edit2,
  Check,
  X
} from 'lucide-react';

export const BookmarksPage: React.FC = () => {
  const { 
    bookmarks, 
    bookmarkFolders, 
    removeBookmark, 
    navigateTab, 
    openNewTab,
    setIsAddBookmarkModalOpen,
    addBookmarkFolder,
    deleteBookmarkFolder,
    updateBookmark
  } = useBrowser();

  const [search, setSearch] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = bookmarks.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.url.toLowerCase().includes(search.toLowerCase());
    const matchFolder = selectedFolderId === 'all' 
      ? true 
      : selectedFolderId === 'root' 
        ? !b.folderId 
        : b.folderId === selectedFolderId;
    return matchSearch && matchFolder;
  });

  const handleCreateFolder = () => {
    const name = prompt('Enter new folder name:');
    if (name && name.trim()) {
      const created = addBookmarkFolder(name.trim());
      setSelectedFolderId(created.id);
    }
  };

  const handleStartEdit = (b: { id: string; title: string }) => {
    setEditingBookmarkId(b.id);
    setEditTitle(b.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      updateBookmark(id, { title: editTitle.trim() });
    }
    setEditingBookmarkId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0F19] text-white p-6 no-scrollbar">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-voile-accent" />
              <span>Bookmarks Manager</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Organize, search, and manage all your saved links in Voile.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateFolder}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/10"
            >
              <FolderPlus className="w-4 h-4 text-slate-300" />
              <span>New Folder</span>
            </button>
            <button
              onClick={() => setIsAddBookmarkModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-voile-accent text-slate-950 text-xs font-semibold hover:bg-sky-300 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bookmark</span>
            </button>
          </div>
        </div>

        {/* Toolbar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Folders filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            <button
              onClick={() => setSelectedFolderId('all')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                selectedFolderId === 'all' ? 'bg-voile-accent/20 text-voile-accent border border-voile-accent/30 font-semibold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              All ({bookmarks.length})
            </button>
            <button
              onClick={() => setSelectedFolderId('root')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                selectedFolderId === 'root' ? 'bg-voile-accent/20 text-voile-accent border border-voile-accent/30 font-semibold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              Bookmarks Bar
            </button>
            {bookmarkFolders.map(folder => (
              <div key={folder.id} className="relative group/folder flex items-center">
                <button
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl transition-colors ${
                    selectedFolderId === folder.id ? 'bg-voile-accent/20 text-voile-accent border border-voile-accent/30 font-semibold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>{folder.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete folder "${folder.title}" and move its bookmarks to root?`)) {
                        deleteBookmarkFolder(folder.id);
                        if (selectedFolderId === folder.id) setSelectedFolderId('all');
                      }
                    }}
                    className="p-0.5 rounded text-slate-400 hover:text-red-400 opacity-60 hover:opacity-100 ml-1"
                    title="Delete folder"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </button>
              </div>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookmarks..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#131B2E] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-voile-accent/60"
            />
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="bg-[#0E1524] border border-white/[0.08] rounded-2xl overflow-hidden shadow-voile-card divide-y divide-white/[0.06]">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No bookmarks found matching your criteria.
            </div>
          ) : (
            filtered.map(b => (
              <div
                key={b.id}
                className="p-3.5 hover:bg-white/[0.03] transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div 
                    onClick={() => navigateTab(b.url, b.title)}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-voile-accent/30 cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-voile-accent" />
                  </div>
                  
                  {editingBookmarkId === b.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(b.id);
                          if (e.key === 'Escape') setEditingBookmarkId(null);
                        }}
                        autoFocus
                        className="px-2.5 py-1 bg-[#131B2E] border border-voile-accent/60 rounded-lg text-xs text-white outline-none flex-1"
                      />
                      <button
                        onClick={() => handleSaveEdit(b.id)}
                        className="p-1 rounded bg-voile-accent/20 text-voile-accent hover:bg-voile-accent/40"
                        title="Save"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingBookmarkId(null)}
                        className="p-1 rounded bg-white/10 text-slate-400 hover:text-white"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => navigateTab(b.url, b.title)}
                      className="truncate cursor-pointer flex-1"
                    >
                      <h4 className="text-xs font-semibold text-white group-hover:text-voile-accent transition-colors truncate">
                        {b.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        {b.url}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => handleStartEdit(b)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Edit title"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openNewTab(b.url, b.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-voile-accent hover:bg-white/10 transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeBookmark(b.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
                    title="Delete bookmark"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
