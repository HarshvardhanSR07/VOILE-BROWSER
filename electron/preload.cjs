const { contextBridge, ipcRenderer } = require('electron');

let preloadUrl = '';
try {
  const path = require('path');
  const { pathToFileURL } = require('url');
  const preloadScriptPath = path.join(__dirname, 'webview_preload.cjs');
  preloadUrl = pathToFileURL(preloadScriptPath).href;
} catch (e) {
  console.warn('[Preload Path Resolution Warning]', e.message);
}

try {
  contextBridge.exposeInMainWorld('voileDesktop', {
    isElectron: true,
    platform: typeof process !== 'undefined' ? process.platform : 'win32',
    webviewPreloadPath: preloadUrl,
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    sendTabUpdate: (tabId, data) => ipcRenderer.send('tab-update', { tabId, data }),
    onExtractContent: (callback) => ipcRenderer.on('extract-content', (e, args) => callback(args)),
    extractPageText: (url) => ipcRenderer.invoke('extract-page-text', url),
    toggleMainDevTools: () => ipcRenderer.send('toggle-main-devtools'),
    toggleWebviewDevTools: () => ipcRenderer.send('toggle-active-webview-devtools'),
    onKeyboardToggleDevTools: (callback) => {
      const handler = (e, args) => callback(args);
      ipcRenderer.on('keyboard-toggle-devtools', handler);
      return () => ipcRenderer.removeListener('keyboard-toggle-devtools', handler);
    },
    onOpenExternalTab: (callback) => {
      const handler = (e, url) => callback(url);
      ipcRenderer.on('open-external-tab', handler);
      return () => ipcRenderer.removeListener('open-external-tab', handler);
    },
    onShieldBlocked: (callback) => {
      const handler = (e, data) => callback(data);
      ipcRenderer.on('shield-blocked-event', handler);
      return () => ipcRenderer.removeListener('shield-blocked-event', handler);
    },
    onBrowserShortcut: (callback) => {
      const handler = (e, data) => callback(data);
      ipcRenderer.on('browser-shortcut', handler);
      return () => ipcRenderer.removeListener('browser-shortcut', handler);
    },
    setShieldsEnabled: (enabled) => ipcRenderer.send('set-shields-enabled', enabled),
    getAdBlockStats: () => ipcRenderer.invoke('adblock-get-stats'),
    getAdBlockDiagnostics: () => ipcRenderer.invoke('adblock-get-diagnostics'),
    addAdBlockException: (domain) => ipcRenderer.invoke('adblock-add-exception', domain),
    removeAdBlockException: (domain) => ipcRenderer.invoke('adblock-remove-exception', domain),
    updateAdBlockFilters: () => ipcRenderer.invoke('adblock-update-filters'),
    openNewWindow: (isPrivate) => ipcRenderer.send('window-new', { isPrivate }),
    quitApp: () => ipcRenderer.send('app-quit'),
    toggleFullScreen: () => ipcRenderer.send('window-toggle-fullscreen'),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    savePageDialog: (url, title) => ipcRenderer.invoke('save-page-dialog', { url, title }),
    // Voile Identity Bridge Authentication (RFC 8252 + PKCE)
    googleAuthGetUser: () => ipcRenderer.invoke('google-auth-get-user'),
    googleAuthStart: (options) => ipcRenderer.invoke('google-auth-start', options),
    googleAuthEmail: (params) => ipcRenderer.invoke('google-auth-email', params),
    googleAuthGuest: () => ipcRenderer.invoke('google-auth-guest'),
    googleAuthCancel: () => ipcRenderer.invoke('google-auth-cancel'),
    googleAuthLogout: () => ipcRenderer.invoke('google-auth-logout'),
    googleAuthSaveConfig: (clientId) => ipcRenderer.invoke('google-auth-save-config', clientId),
    onGoogleAuthStatusChanged: (callback) => {
      const handler = (e, data) => callback(data);
      ipcRenderer.on('google-auth-status-changed', handler);
      return () => ipcRenderer.removeListener('google-auth-status-changed', handler);
    },
    // AdaL Autonomous Companion CDP 1.3 Tab Automation
    agentNavigate: (url) => ipcRenderer.invoke('agent-cdp-navigate', { url }),
    agentSnapshotDom: (selector) => ipcRenderer.invoke('agent-cdp-snapshot-dom', { selector }),
    agentClickElement: (selector, textMatch) => ipcRenderer.invoke('agent-cdp-click-element', { selector, textMatch }),
    agentInputText: (selector, text) => ipcRenderer.invoke('agent-cdp-input-text', { selector, text }),
    agentCaptureEvidence: () => ipcRenderer.invoke('agent-cdp-capture-evidence')
  });
} catch (e) {
  console.error('[Preload exposeInMainWorld Error]', e);
}
