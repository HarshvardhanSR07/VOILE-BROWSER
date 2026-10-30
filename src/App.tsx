import React from 'react';
import { BrowserProvider, useBrowser } from './context/BrowserContext';
import { BrowserChrome } from './components/browser/BrowserChrome';
import { NavigationSidebar } from './components/sidebar/NavigationSidebar';
import { AdaLMascotWidget } from './components/mascot/AdaLMascotWidget';

// Pages
import { HomePage } from './pages/HomePage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { PrivateModePage } from './pages/PrivateModePage';
import { BookmarksPage } from './pages/BookmarksPage';
import { HistoryPage } from './pages/HistoryPage';
import { DownloadsPage } from './pages/DownloadsPage';
import { PrivacyCenterPage } from './pages/PrivacyCenterPage';
import { SettingsPage } from './pages/SettingsPage';
import { GoogleAuthHelper } from './components/auth/GoogleAuthHelper';
import { LiveWebview } from './components/browser/LiveWebview';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AgentProvider } from './context/AgentContext';
import { AgentPanel } from './components/agent/AgentPanel';

// Modals
import { AddShortcutModal } from './components/modals/AddShortcutModal';
import { AddBookmarkModal } from './components/modals/AddBookmarkModal';
import { ClearDataModal } from './components/modals/ClearDataModal';
import { FindInPageBar } from './components/browser/FindInPageBar';
import { ZoomHUD } from './components/browser/ZoomHUD';
import { useBrowserShortcuts } from './hooks/useBrowserShortcuts';

const MainBrowserLayout: React.FC = () => {
  const { activeView, isSidebarOpen, sidebarPosition, toggleSidebar, openNewTab, navigateTab } = useBrowser();

  // Initialize Comprehensive Desktop Browser Keyboard Shortcuts
  useBrowserShortcuts();

  // Drag and drop local files (HTML, PDF, images, text) into the browser to open
  React.useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const path = (file as any).path;
          if (path) {
            const formattedUrl = 'file:///' + path.replace(/\\/g, '/');
            openNewTab(formattedUrl, file.name);
          } else if (file.name) {
            openNewTab(URL.createObjectURL(file), file.name);
          }
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [openNewTab]);

  // Keyboard shortcut Ctrl+B to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const renderInternalView = () => {
    switch (activeView) {
      case 'home':
        return <HomePage />;
      case 'workspace':
        return <WorkspacePage />;
      case 'architecture':
        return <ArchitecturePage />;
      case 'private':
        return <PrivateModePage />;
      case 'bookmarks':
        return <BookmarksPage />;
      case 'history':
        return <HistoryPage />;
      case 'downloads':
        return <DownloadsPage />;
      case 'privacy':
        return <PrivacyCenterPage />;
      case 'settings':
        return <SettingsPage />;
      case 'google-auth':
        return <GoogleAuthHelper onBackToBrowsing={() => navigateTab('voile://newtab', 'New Tab')} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B0F19] font-sans antialiased">
      {/* 1. Top Browser Chrome (TabStrip, Omnibox, BookmarksBar) */}
      <BrowserChrome />

      {/* 2. Full-Width Desktop Work Area (Repositionable sidebar) */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0 relative">
        {/* Left Navigation Sidebar (if position is left, hidden on clean home view) */}
        {sidebarPosition === 'left' && isSidebarOpen && activeView !== 'home' && <NavigationSidebar />}

        {/* Central Workspace / Content Page (Expanded to full width) */}
        <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
          {/* Persistent Multi-Tab Web Viewport Pool (Stays mounted so webviews are never destroyed on view switches) */}
          <div 
            className="w-full h-full"
            style={{ 
              display: activeView === 'web' ? 'flex' : 'none',
              flex: 1,
              minHeight: 0,
              position: 'relative'
            }}
          >
            <ErrorBoundary fallbackTitle="Web Viewport Error">
              <LiveWebview />
            </ErrorBoundary>
          </div>

          {/* System & Internal Voile Pages (Home, Workspace, Privacy Center, etc.) */}
          {activeView !== 'web' && (
            <div className="flex-1 flex flex-col overflow-hidden relative w-full h-full bg-[#0B0F19]">
              <ErrorBoundary fallbackTitle="Voile View Error">
                {renderInternalView()}
              </ErrorBoundary>
            </div>
          )}
        </main>

        {/* Repositioned Right Navigation Sidebar (hidden on clean home view) */}
        {sidebarPosition === 'right' && isSidebarOpen && activeView !== 'home' && <NavigationSidebar />}
      </div>

      {/* 3. Interactive Floating AI Agent Mascot & Companion Panel */}
      <AdaLMascotWidget />
      <AgentPanel />

      {/* 4. Global Overlays & Modals */}
      <AddShortcutModal />
      <AddBookmarkModal />
      <ClearDataModal />
      <FindInPageBar />
      <ZoomHUD />
    </div>
  );
};

export default function App() {
  return (
    <BrowserProvider>
      <AgentProvider>
        <MainBrowserLayout />
      </AgentProvider>
    </BrowserProvider>
  );
}
