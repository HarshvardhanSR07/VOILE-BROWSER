import { useEffect, useRef, useCallback } from 'react';
import { useBrowser } from '../context/BrowserContext';

export function useBrowserShortcuts() {
  const {
    activeTabId,
    activeTab,
    openNewTab,
    closeTab,
    reopenLastClosedTab,
    selectNextTab,
    selectPreviousTab,
    selectTabByIndex,
    selectLastTab,
    navigateTab,
    goBack,
    goForward,
    setActiveView,
    zoomIn,
    zoomOut,
    resetZoom,
    setIsFindInPageOpen,
    setIsClearHistoryModalOpen
  } = useBrowser();

  const lastActionTimeRef = useRef<{ [action: string]: number }>({});

  const executeAction = useCallback(async (action: string, payload?: any) => {
    const now = Date.now();
    const lastTime = lastActionTimeRef.current[action] || 0;
    // Debounce duplicate triggers within 120ms (e.g. IPC + DOM keydown)
    if (now - lastTime < 120) {
      return;
    }
    lastActionTimeRef.current[action] = now;

    const desktop = (window as any).voileDesktop;

    switch (action) {
      case 'new-tab':
        openNewTab('voile://newtab', 'New Tab');
        break;

      case 'close-tab':
        closeTab(activeTabId);
        break;

      case 'reopen-closed-tab':
        reopenLastClosedTab();
        break;

      case 'focus-omnibox': {
        const omnibox = document.getElementById('voile-omnibox-input') as HTMLInputElement | null;
        if (omnibox) {
          omnibox.focus();
          omnibox.select();
        }
        break;
      }

      case 'next-tab':
        selectNextTab();
        break;

      case 'prev-tab':
        selectPreviousTab();
        break;

      case 'jump-tab':
        if (typeof payload?.index === 'number') {
          selectTabByIndex(payload.index);
        }
        break;

      case 'jump-last-tab':
        selectLastTab();
        break;

      case 'history-back':
        goBack();
        break;

      case 'history-forward':
        goForward();
        break;

      case 'go-home':
        navigateTab('voile://newtab', 'New Tab');
        break;

      case 'open-history':
        setActiveView('history');
        break;

      case 'open-downloads':
        setActiveView('downloads');
        break;

      case 'new-window':
        if (desktop?.openNewWindow) {
          desktop.openNewWindow(false);
        } else {
          window.open(window.location.href, '_blank');
        }
        break;

      case 'new-private-window':
        openNewTab('voile://private', 'Voile — Private Shielded Session', true);
        break;

      case 'quit-app':
        if (desktop?.quitApp) {
          desktop.quitApp();
        } else {
          window.close();
        }
        break;

      case 'toggle-fullscreen':
        if (desktop?.toggleFullScreen) {
          desktop.toggleFullScreen();
        } else {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }
        break;

      case 'zoom-in':
        zoomIn();
        break;

      case 'zoom-out':
        zoomOut();
        break;

      case 'zoom-reset':
        resetZoom();
        break;

      case 'find-in-page':
        setIsFindInPageOpen(true);
        break;

      case 'find-next':
        window.dispatchEvent(new CustomEvent('voile:find-next'));
        break;

      case 'find-prev':
        window.dispatchEvent(new CustomEvent('voile:find-prev'));
        break;

      case 'view-source':
        if (activeTab?.url && !activeTab.url.startsWith('voile://')) {
          const sourceUrl = activeTab.url.startsWith('view-source:') 
            ? activeTab.url 
            : `view-source:${activeTab.url}`;
          openNewTab(sourceUrl, `Source: ${activeTab.title || 'Page'}`);
        }
        break;

      case 'print-page':
        window.dispatchEvent(new CustomEvent('voile:print-active-page'));
        break;

      case 'save-page':
        if (desktop?.savePageDialog) {
          try {
            const filePath = await desktop.savePageDialog(activeTab.url, activeTab.title);
            if (filePath) {
              window.dispatchEvent(new CustomEvent('voile:save-active-page', { detail: { filePath } }));
            }
          } catch (e) {
            console.error('[Save Page Dialog Error]', e);
          }
        }
        break;

      case 'open-file':
        if (desktop?.openFileDialog) {
          try {
            const fileUrl = await desktop.openFileDialog();
            if (fileUrl) {
              const fileName = decodeURIComponent(fileUrl.split('/').pop() || 'Local Document');
              openNewTab(fileUrl, fileName);
            }
          } catch (e) {
            console.error('[Open File Dialog Error]', e);
          }
        }
        break;

      case 'clear-browsing-data':
        setIsClearHistoryModalOpen(true);
        break;

      default:
        break;
    }
  }, [
    activeTabId,
    activeTab,
    openNewTab,
    closeTab,
    reopenLastClosedTab,
    selectNextTab,
    selectPreviousTab,
    selectTabByIndex,
    selectLastTab,
    navigateTab,
    goBack,
    goForward,
    setActiveView,
    zoomIn,
    zoomOut,
    resetZoom,
    setIsFindInPageOpen,
    setIsClearHistoryModalOpen
  ]);

  // 1. Electron IPC Listener: receives shortcuts forwarded from main process and guest webviews
  useEffect(() => {
    const desktop = (window as any).voileDesktop;
    if (desktop?.onBrowserShortcut) {
      const cleanup = desktop.onBrowserShortcut((data: { action: string; [key: string]: any }) => {
        if (data?.action) {
          executeAction(data.action, data);
        }
      });
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    }
  }, [executeAction]);

  // 2. DOM Keydown Listener: catches keyboard shortcuts in browser UI mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key.toLowerCase();
      const code = e.code;

      // Ctrl + T: New tab
      if (cmdOrCtrl && !e.shiftKey && !e.altKey && key === 't') {
        e.preventDefault();
        executeAction('new-tab');
        return;
      }

      // Ctrl + W: Close tab
      if (cmdOrCtrl && !e.shiftKey && !e.altKey && key === 'w') {
        e.preventDefault();
        executeAction('close-tab');
        return;
      }

      // Ctrl + Shift + T: Reopen closed tab
      if (cmdOrCtrl && e.shiftKey && !e.altKey && key === 't') {
        e.preventDefault();
        executeAction('reopen-closed-tab');
        return;
      }

      // Ctrl + L or Alt + D: Focus address bar
      if ((cmdOrCtrl && !e.shiftKey && !e.altKey && key === 'l') || (!cmdOrCtrl && !e.shiftKey && e.altKey && key === 'd')) {
        e.preventDefault();
        executeAction('focus-omnibox');
        return;
      }

      // Ctrl + Tab: Next tab
      if ((e.ctrlKey && !e.shiftKey && !e.altKey && (key === 'tab' || code === 'Tab')) || (isMac && e.metaKey && e.altKey && key === 'arrowright')) {
        e.preventDefault();
        executeAction('next-tab');
        return;
      }

      // Ctrl + Shift + Tab: Previous tab
      if ((e.ctrlKey && e.shiftKey && !e.altKey && (key === 'tab' || code === 'Tab')) || (isMac && e.metaKey && e.altKey && key === 'arrowleft')) {
        e.preventDefault();
        executeAction('prev-tab');
        return;
      }

      // Ctrl + 1-8: Jump tab 1-8
      if (cmdOrCtrl && !e.shiftKey && !e.altKey && key >= '1' && key <= '8') {
        e.preventDefault();
        executeAction('jump-tab', { index: parseInt(key, 10) });
        return;
      }

      // Ctrl + 9: Jump last tab
      if (cmdOrCtrl && !e.shiftKey && !e.altKey && key === '9') {
        e.preventDefault();
        executeAction('jump-last-tab');
        return;
      }

      // Alt + Left: Back in history
      if (!cmdOrCtrl && !e.shiftKey && e.altKey && key === 'arrowleft') {
        e.preventDefault();
        executeAction('history-back');
        return;
      }

      // Alt + Right: Forward in history
      if (!cmdOrCtrl && !e.shiftKey && e.altKey && key === 'arrowright') {
        e.preventDefault();
        executeAction('history-forward');
        return;
      }

      // Alt + Home: Go to home page
      if (!cmdOrCtrl && !e.shiftKey && e.altKey && key === 'home') {
        e.preventDefault();
        executeAction('go-home');
        return;
      }

      // Ctrl + H / Cmd + Y: Open history
      if ((cmdOrCtrl && !e.shiftKey && !e.altKey && key === 'h') || (isMac && e.metaKey && !e.shiftKey && !e.altKey && key === 'y')) {
        e.preventDefault();
        executeAction('open-history');
        return;
      }

      // Downloads: Ctrl + J (Windows) or Cmd + Shift + J (Mac)
      if ((!isMac && e.ctrlKey && !e.shiftKey && !e.altKey && key === 'j') || (isMac && e.metaKey && e.shiftKey && !e.altKey && key === 'j')) {
        e.preventDefault();
        executeAction('open-downloads');
        return;
      }

      // Ctrl + N: New window
      if (cmdOrCtrl && !e.shiftKey && !e.altKey && key === 'n') {
        e.preventDefault();
        executeAction('new-window');
        return;
      }

      // Ctrl + Shift + N: New private window
      if (cmdOrCtrl && e.shiftKey && !e.altKey && key === 'n') {
        e.preventDefault();
        executeAction('new-private-window');
        return;
      }

      // Ctrl + Q / Alt + F4: Quit browser
      if ((cmdOrCtrl && !e.shiftKey && !e.altKey && key === 'q') || (!isMac && e.altKey && key === 'f4')) {
        e.preventDefault();
        executeAction('quit-app');
        return;
      }

      // F11 / Ctrl + Shift + F: Toggle fullscreen
      if (key === 'f11' || (isMac && cmdOrCtrl && e.shiftKey && key === 'f')) {
        e.preventDefault();
        executeAction('toggle-fullscreen');
        return;
      }

      // Zoom In: Ctrl + + / =
      if (cmdOrCtrl && !e.altKey && (key === '+' || key === '=' || code === 'NumpadAdd')) {
        e.preventDefault();
        executeAction('zoom-in');
        return;
      }

      // Zoom Out: Ctrl + - / _
      if (cmdOrCtrl && !e.altKey && (key === '-' || key === '_' || code === 'NumpadSubtract')) {
        e.preventDefault();
        executeAction('zoom-out');
        return;
      }

      // Reset Zoom: Ctrl + 0
      if (cmdOrCtrl && !e.shiftKey && !e.altKey && (key === '0' || code === 'Numpad0')) {
        e.preventDefault();
        executeAction('zoom-reset');
        return;
      }

      // Ctrl + F: Find on page
      if (cmdOrCtrl && !e.shiftKey && !e.altKey && key === 'f') {
        e.preventDefault();
        executeAction('find-in-page');
        return;
      }

      // Ctrl + G: Find next
      if (cmdOrCtrl && !e.shiftKey && !e.altKey && key === 'g') {
        e.preventDefault();
        executeAction('find-next');
        return;
      }

      // Ctrl + Shift + G: Find previous
      if (cmdOrCtrl && e.shiftKey && !e.altKey && key === 'g') {
        e.preventDefault();
        executeAction('find-prev');
        return;
      }

      // Ctrl + U / Cmd + Option + U: View source
      if ((cmdOrCtrl && !e.shiftKey && !e.altKey && key === 'u') || (isMac && e.metaKey && e.altKey && !e.shiftKey && key === 'u')) {
        e.preventDefault();
        executeAction('view-source');
        return;
      }

      // Ctrl + P: Print page
      if (cmdOrCtrl && !e.shiftKey && !e.altKey && key === 'p') {
        e.preventDefault();
        executeAction('print-page');
        return;
      }

      // Ctrl + S: Save page
      if (cmdOrCtrl && !e.shiftKey && !e.altKey && key === 's') {
        e.preventDefault();
        executeAction('save-page');
        return;
      }

      // Ctrl + O: Open file
      if (cmdOrCtrl && !e.shiftKey && !e.altKey && key === 'o') {
        e.preventDefault();
        executeAction('open-file');
        return;
      }

      // Ctrl + Shift + Delete: Clear browsing data
      if (cmdOrCtrl && e.shiftKey && !e.altKey && (key === 'delete' || key === 'backspace' || code === 'Delete')) {
        e.preventDefault();
        executeAction('clear-browsing-data');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeAction]);

  // 3. Ctrl + Mouse Scroll Wheel: Pinch/Zoom In and Out
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          executeAction('zoom-in');
        } else if (e.deltaY > 0) {
          executeAction('zoom-out');
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [executeAction]);
}
