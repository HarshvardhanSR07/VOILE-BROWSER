import React, { useState } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { 
  Folder, 
  Globe, 
  ChevronDown, 
  Plus, 
  Star,
  ExternalLink,
  Shield,
  Trash2
} from 'lucide-react';
import { Bookmark } from '../../types/browser';

export const BookmarksBar: React.FC = () => {
  const { 
    bookmarks, 
    bookmarkFolders, 
    bookmarksBarVisible, 
    navigateTab, 
    openNewTab,
    setIsAddBookmarkModalOpen,
    removeBookmark,
    reorderBookmarks,
    updateBookmark
  } = useBrowser();

  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [draggingBookmarkId, setDraggingBookmarkId] = useState<string | null>(null);
  const [dragOverBookmarkId, setDragOverBookmarkId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; bookmark: Bookmark } | null>(null);

  if (!bookmarksBarVisible) return null;

  const rootBookmarks = bookmarks.filter(b => !b.folderId);

  const getFolderBookmarks = (folderId: string) => {
    return bookmarks.filter(b => b.folderId === folderId);
  };

  const handleBookmarkClick = (bookmark: Bookmark, e: React.MouseEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      openNewTab(bookmark.url, bookmark.title);
    } else {
      navigateTab(bookmark.url, bookmark.title);
    }
    setOpenFolderId(null);
  };

  return (
    <div className="h-7 px-3 bg-[#0D1322]/90 border-b border-white/[0.06] flex items-center gap-1.5 text-xs text-slate-300 overflow-x-auto no-scrollbar select-none z-20">
      {/* Folder Dropdowns */}
      {bookmarkFolders.map(folder => {
        const folderItems = getFolderBookmarks(folder.id);
        const isOpen = openFolderId === folder.id;
        const isFolderDragOver = dragOverFolderId === folder.id;

        return (
          <div 
            key={folder.id} 
            className="relative"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              setDragOverFolderId(folder.id);
            }}
            onDragLeave={() => {
              if (dragOverFolderId === folder.id) setDragOverFolderId(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const bookmarkId = e.dataTransfer.getData('text/plain') || draggingBookmarkId;
              if (bookmarkId) {
                updateBookmark(bookmarkId, { folderId: folder.id });
              }
              setDraggingBookmarkId(null);
              setDragOverFolderId(null);
            }}
          >
            <button
              onClick={() => setOpenFolderId(isOpen ? null : folder.id)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                isFolderDragOver
                  ? 'bg-sky-500/30 text-white ring-1 ring-sky-400'
                  : isOpen 
                    ? 'bg-white/10 text-white' 
                    : 'hover:bg-white/5 text-slate-300 hover:text-white'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-voile-accent/80" />
              <span className="font-medium text-[11px]">{folder.title}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Folder Items Dropdown */}
            {isOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setOpenFolderId(null)} 
                />
                <div className="absolute left-0 top-full mt-1 w-52 py-1 bg-[#131B2E] border border-white/10 rounded-lg shadow-xl backdrop-blur-xl z-40">
                  <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase border-b border-white/5">
                    {folder.title} ({folderItems.length})
                  </div>
                  {folderItems.length === 0 ? (
                    <div className="px-3 py-2 text-slate-500 text-[11px] italic">Folder is empty</div>
                  ) : (
                    folderItems.map(item => (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between px-2.5 py-1.5 hover:bg-white/5 cursor-pointer text-slate-200 transition-colors"
                        onClick={(e) => handleBookmarkClick(item, e)}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', item.id);
                          setDraggingBookmarkId(item.id);
                        }}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-voile-accent shrink-0" />
                          <span className="truncate text-[11px]">{item.title}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBookmark(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-slate-400 transition-opacity"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}

      <div className="h-3 w-[1px] bg-white/10 mx-1" />

      {/* Top-Level Bookmarks with Drag-and-Drop Reordering */}
      {rootBookmarks.map(bookmark => {
        const isDragOver = dragOverBookmarkId === bookmark.id && draggingBookmarkId !== bookmark.id;
        return (
          <div key={bookmark.id} className="relative flex items-center">
            {isDragOver && (
              <div className="absolute -left-1 top-0 bottom-0 w-[2px] bg-sky-400 rounded-full shadow-[0_0_6px_rgba(56,189,248,0.8)] z-10" />
            )}
            <button
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', bookmark.id);
                e.dataTransfer.effectAllowed = 'move';
                setDraggingBookmarkId(bookmark.id);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragOverBookmarkId(bookmark.id);
              }}
              onDragLeave={() => {
                if (dragOverBookmarkId === bookmark.id) setDragOverBookmarkId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const sourceId = e.dataTransfer.getData('text/plain') || draggingBookmarkId;
                if (sourceId && sourceId !== bookmark.id) {
                  reorderBookmarks(sourceId, bookmark.id);
                }
                setDraggingBookmarkId(null);
                setDragOverBookmarkId(null);
              }}
              onDragEnd={() => {
                setDraggingBookmarkId(null);
                setDragOverBookmarkId(null);
              }}
              onClick={(e) => handleBookmarkClick(bookmark, e)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, bookmark });
              }}
              className={`group flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/5 text-slate-300 hover:text-white transition-colors truncate max-w-[140px] ${
                draggingBookmarkId === bookmark.id ? 'opacity-30' : ''
              }`}
              title={`${bookmark.title} (${bookmark.url}) - Drag to reorder, right click for options`}
            >
              <Globe className="w-3 h-3 text-slate-400 group-hover:text-voile-accent shrink-0" />
              <span className="truncate text-[11px]">{bookmark.title}</span>
            </button>
          </div>
        );
      })}

      {/* Quick Add Button */}
      <button
        onClick={() => setIsAddBookmarkModalOpen(true)}
        className="ml-auto p-1 rounded hover:bg-white/5 text-slate-400 hover:text-voile-accent transition-colors flex items-center gap-1"
        title="Add current page to bookmarks"
      >
        <Plus className="w-3 h-3" />
        <span className="text-[10px] hidden sm:inline">Add Bookmark</span>
      </button>

      {/* Right Click Context Menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)} />
          <div 
            className="fixed z-50 w-44 py-1.5 bg-[#131B2E] border border-white/10 rounded-xl shadow-2xl backdrop-blur-2xl text-xs text-slate-200"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div className="px-3 py-1 font-semibold text-[10.5px] text-slate-400 border-b border-white/5 truncate">
              {contextMenu.bookmark.title}
            </div>
            <button
              onClick={() => {
                openNewTab(contextMenu.bookmark.url, contextMenu.bookmark.title);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Open in new tab</span>
            </button>
            <button
              onClick={() => {
                const newTitle = prompt('Edit bookmark name:', contextMenu.bookmark.title);
                if (newTitle && newTitle.trim()) {
                  updateBookmark(contextMenu.bookmark.id, { title: newTitle.trim() });
                }
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit name...</span>
            </button>
            <button
              onClick={() => {
                removeBookmark(contextMenu.bookmark.id);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-red-400 flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete bookmark</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
