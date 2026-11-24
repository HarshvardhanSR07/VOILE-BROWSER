const { app, BrowserWindow, session, ipcMain, Menu, MenuItem, clipboard, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const logFile = path.join(app.getPath('userData'), 'voile_app.log');
function log(msg) {
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
    console.log(msg);
  } catch(e) {}
}

process.on('uncaughtException', (err) => {
  log('[UNCAUGHT EXCEPTION] ' + (err?.stack || err));
});
process.on('unhandledRejection', (reason) => {
  log('[UNHANDLED REJECTION] ' + (reason?.stack || reason));
});

const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Chromium switches for smooth media & audio playback without user gesture blocking
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('disable-features', 'PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies');

// Strict Zero-Telemetry Chromium flags (disables background Google pings, crash reporting & telemetry)
app.commandLine.appendSwitch('disable-breakpad');               // Eliminates Google Breakpad crash dump reports
app.commandLine.appendSwitch('disable-component-update');       // Eliminates background component update checks
app.commandLine.appendSwitch('disable-domain-reliability');     // Eliminates network error telemetry to Google
app.commandLine.appendSwitch('disable-sync');                   // Eliminates background profile sync
app.commandLine.appendSwitch('disable-background-networking');  // Prevents idle background telemetry requests
app.commandLine.appendSwitch('no-default-browser-check');

app.userAgentFallback = CHROME_UA;

let mainWindow = null;

// Centralized High-Performance Ad-Blocking Engine (EasyList + EasyPrivacy + Ghostery compiled rules)
const { AdBlockEngine } = require('./adblock/AdBlockEngine.cjs');
const adBlockEngine = new AdBlockEngine();

// Standards-Compliant Google OAuth 2.0 Service (RFC 8252 + PKCE)
const { GoogleAuthService } = require('./auth/GoogleAuthService.cjs');
const googleAuthService = new GoogleAuthService(app, log);

// Autonomous AI Companion Tab Automation (CDP 1.3 Tool Router)
const { CdpToolRouter } = require('./agent/CdpToolRouter.cjs');
const cdpToolRouter = new CdpToolRouter();

function setupSession(ses) {
  if (!ses || ses._voileConfigured) return;
  ses._voileConfigured = true;

  // Set modern desktop Chrome User-Agent so Google/YouTube/etc don't block or redirect
  ses.setUserAgent(CHROME_UA);

  // Hook Centralized Ad-Blocking & Network Filtering Engine
  adBlockEngine.enableInSession(ses);

  // Permission handling: Block invasive sensors/geolocation/notifications, but allow media/audio playback
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'geolocation' || permission === 'notifications') {
      callback(false);
    } else {
      callback(true);
    }
  });
}

function handleBrowserShortcut(event, input, sourceWebContents, isGuest) {
  if (input.type !== 'keyDown') return;

  const isMac = process.platform === 'darwin';
  const cmdOrCtrl = isMac ? input.meta : input.control;
  const key = input.key ? input.key.toLowerCase() : '';
  const code = input.code || '';

  // 1. Navigation & Tabs
  // Ctrl+T / Cmd+T: New Tab
  if (cmdOrCtrl && !input.shift && !input.alt && key === 't') {
    mainWindow?.webContents.send('browser-shortcut', { action: 'new-tab' });
    event.preventDefault();
    return;
  }

  // Ctrl+W / Cmd+W: Close Current Tab
  if (cmdOrCtrl && !input.shift && !input.alt && key === 'w') {
    mainWindow?.webContents.send('browser-shortcut', { action: 'close-tab' });
    event.preventDefault();
    return;
  }

  // Ctrl+Shift+T / Cmd+Shift+T: Reopen Last Closed Tab
  if (cmdOrCtrl && input.shift && !input.alt && key === 't') {
    mainWindow?.webContents.send('browser-shortcut', { action: 'reopen-closed-tab' });
    event.preventDefault();
    return;
  }

  // Ctrl+L / Cmd+L OR Alt+D: Focus Address Bar
  if ((cmdOrCtrl && !input.shift && !input.alt && key === 'l') || (!cmdOrCtrl && !input.shift && input.alt && key === 'd')) {
    mainWindow?.webContents.send('browser-shortcut', { action: 'focus-omnibox' });
    event.preventDefault();
    return;
  }

  // Ctrl+Tab / Cmd+Option+Right Arrow: Switch to Next Tab
  if ((input.control && !input.shift && !input.alt && (key === 'tab' || code === 'Tab')) || (isMac && input.meta && input.alt && key === 'arrowright')) {
    mainWindow?.webContents.send('browser-shortcut', { action: 'next-tab' });
    event.preventDefault();
    return;
  }

  // Ctrl+Shift+Tab / Cmd+Option+Left Arrow: Switch to Previous Tab
  if ((input.control && input.shift && !input.alt && (key === 'tab' || code === 'Tab')) || (isMac && input.meta && input.alt && key === 'arrowleft')) {
    mainWindow?.webContents.send('browser-shortcut', { action: 'prev-tab' });
    event.preventDefault();
    return;
  }

  // Ctrl+1-8 / Cmd+1-8: Jump to tab 1-8
  if (cmdOrCtrl && !input.shift && !input.alt && key >= '1' && key <= '8') {
    mainWindow?.webContents.send('browser-shortcut', { action: 'jump-tab', index: parseInt(key, 10) });
    event.preventDefault();
    return;
  }

  // Ctrl+9 / Cmd+9: Jump to last tab
  if (cmdOrCtrl && !input.shift && !input.alt && key === '9') {
    mainWindow?.webContents.send('browser-shortcut', { action: 'jump-last-tab' });
    event.preventDefault();
    return;
  }

  // Alt+Left Arrow: Back in history
  if (!cmdOrCtrl && !input.shift && input.alt && key === 'arrowleft') {
    mainWindow?.webContents.send('browser-shortcut', { action: 'history-back' });
    event.preventDefault();
    return;
  }

  // Alt+Right Arrow: Forward in history
  if (!cmdOrCtrl && !input.shift && input.alt && key === 'arrowright') {
    mainWindow?.webContents.send('browser-shortcut', { action: 'history-forward' });
    event.preventDefault();
    return;
  }

  // Alt+Home: Go to home page
  if (!cmdOrCtrl && !input.shift && input.alt && key === 'home') {
    mainWindow?.webContents.send('browser-shortcut', { action: 'go-home' });
    event.preventDefault();
    return;
  }

  // Ctrl+H / Cmd+Y: Open browsing history
  if ((cmdOrCtrl && !input.shift && !input.alt && key === 'h') || (isMac && input.meta && !input.shift && !input.alt && key === 'y')) {
    mainWindow?.webContents.send('browser-shortcut', { action: 'open-history' });
    event.preventDefault();
    return;
  }

  // Downloads: Ctrl+J (Win/Linux) OR Cmd+Shift+J (Mac)
  if ((!isMac && input.control && !input.shift && !input.alt && key === 'j') || (isMac && input.meta && input.shift && !input.alt && key === 'j')) {
    mainWindow?.webContents.send('browser-shortcut', { action: 'open-downloads' });
    event.preventDefault();
    return;
  }

  // 2. Window & View Control
  // Ctrl+N / Cmd+N: New Window
  if (cmdOrCtrl && !input.shift && !input.alt && key === 'n') {
    createWindow();
    event.preventDefault();
    return;
  }

  // Ctrl+Shift+N / Cmd+Shift+N: New Incognito/Private window or tab
  if (cmdOrCtrl && input.shift && !input.alt && key === 'n') {
    mainWindow?.webContents.send('browser-shortcut', { action: 'new-private-window' });
    event.preventDefault();
    return;
  }

  // Ctrl+Q / Cmd+Q / Alt+F4: Quit browser entirely
  if ((cmdOrCtrl && !input.shift && !input.alt && key === 'q') || (!isMac && input.alt && key === 'f4')) {
    app.quit();
    event.preventDefault();
    return;
  }

  // F11 / Ctrl+Shift+F (Mac): Toggle Full-screen
  if (key === 'f11' || (isMac && cmdOrCtrl && input.shift && key === 'f')) {
    if (mainWindow) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
    event.preventDefault();
    return;
  }

  // Zoom In: Ctrl++ / Cmd++ / Ctrl+= / Cmd+= / NumpadAdd
  if (cmdOrCtrl && !input.alt && (key === '+' || key === '=' || code === 'NumpadAdd')) {
    mainWindow?.webContents.send('browser-shortcut', { action: 'zoom-in' });
    event.preventDefault();
    return;
  }

  // Zoom Out: Ctrl+- / Cmd+- / Ctrl+_ / Cmd+_ / NumpadSubtract
  if (cmdOrCtrl && !input.alt && (key === '-' || key === '_' || code === 'NumpadSubtract')) {
    mainWindow?.webContents.send('browser-shortcut', { action: 'zoom-out' });
    event.preventDefault();
    return;
  }

  // Zoom Reset: Ctrl+0 / Cmd+0 / Numpad0
  if (cmdOrCtrl && !input.shift && !input.alt && (key === '0' || code === 'Numpad0')) {
    mainWindow?.webContents.send('browser-shortcut', { action: 'zoom-reset' });
    event.preventDefault();
    return;
  }

  // 3. Edit & Text Selection
  // Ctrl+F / Cmd+F: Find on page
  if (cmdOrCtrl && !input.shift && !input.alt && key === 'f') {
    mainWindow?.webContents.send('browser-shortcut', { action: 'find-in-page' });
    event.preventDefault();
    return;
  }

  // Ctrl+G / Cmd+G: Find next
  if (cmdOrCtrl && !input.shift && !input.alt && key === 'g') {
    mainWindow?.webContents.send('browser-shortcut', { action: 'find-next' });
    event.preventDefault();
    return;
  }

  // Ctrl+Shift+G / Cmd+Shift+G: Find previous
  if (cmdOrCtrl && input.shift && !input.alt && key === 'g') {
    mainWindow?.webContents.send('browser-shortcut', { action: 'find-prev' });
    event.preventDefault();
    return;
  }

  // Ctrl+U / Cmd+Option+U: View page source code
  if ((cmdOrCtrl && !input.shift && !input.alt && key === 'u') || (isMac && input.meta && input.alt && !input.shift && key === 'u')) {
    mainWindow?.webContents.send('browser-shortcut', { action: 'view-source' });
    event.preventDefault();
    return;
  }

  // 4. File & Page Actions
  // Ctrl+P / Cmd+P: Print page
  if (cmdOrCtrl && !input.shift && !input.alt && key === 'p') {
    mainWindow?.webContents.send('browser-shortcut', { action: 'print-page' });
    event.preventDefault();
    return;
  }

  // Ctrl+S / Cmd+S: Save page
  if (cmdOrCtrl && !input.shift && !input.alt && key === 's') {
    mainWindow?.webContents.send('browser-shortcut', { action: 'save-page' });
    event.preventDefault();
    return;
  }

  // Ctrl+O / Cmd+O: Open file
  if (cmdOrCtrl && !input.shift && !input.alt && key === 'o') {
    mainWindow?.webContents.send('browser-shortcut', { action: 'open-file' });
    event.preventDefault();
    return;
  }

  // DevTools: F12 / Ctrl+Shift+I / Cmd+Option+I
  if (key === 'f12' || (cmdOrCtrl && input.shift && !input.alt && key === 'i') || (isMac && input.meta && input.alt && !input.shift && key === 'i')) {
    if (isGuest && sourceWebContents) {
      if (sourceWebContents.isDevToolsOpened()) {
        sourceWebContents.closeDevTools();
      } else {
        sourceWebContents.openDevTools({ mode: 'bottom' });
      }
    } else {
      mainWindow?.webContents.send('keyboard-toggle-devtools');
    }
    event.preventDefault();
    return;
  }

  // 5. Security & Privacy
  // Clear Browsing Data: Ctrl+Shift+Delete / Cmd+Shift+Delete
  if (cmdOrCtrl && input.shift && !input.alt && (key === 'delete' || key === 'backspace' || code === 'Delete')) {
    mainWindow?.webContents.send('browser-shortcut', { action: 'clear-browsing-data' });
    event.preventDefault();
    return;
  }

  // DevTools Console: Ctrl+Shift+J (Windows) / Cmd+Option+J (Mac)
  if ((!isMac && input.control && input.shift && !input.alt && key === 'j') || (isMac && input.meta && input.alt && !input.shift && key === 'j')) {
    if (isGuest && sourceWebContents) {
      sourceWebContents.openDevTools({ mode: 'bottom' });
    } else if (mainWindow) {
      mainWindow.webContents.openDevTools({ mode: 'bottom' });
    }
    event.preventDefault();
    return;
  }
}

function createWindow() {
  log('Creating main browser window...');

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#080E1A',
    title: 'Voile — Privacy-First AI Browser',
    show: true,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#080E1A',
      symbolColor: '#94A3B8',
      height: 40
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      webviewTag: true,
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false,
      sandbox: false,
    },
  });

  mainWindow.webContents.on('preload-error', (e, preloadPath, error) => {
    log(`[webContents preload-error] Path: ${preloadPath}, Error: ${error?.stack || error}`);
  });

  mainWindow.once('ready-to-show', () => {
    log('Window ready-to-show event fired. Displaying window.');
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.webContents.on('did-fail-load', (e, code, desc, url) => {
    log(`[webContents did-fail-load] Code: ${code}, Desc: ${desc}, URL: ${url}`);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    log(`[webContents did-finish-load] Loaded successfully: ${mainWindow.webContents.getURL()}`);
  });

  // Global Browser Keyboard Shortcuts Listener on main window
  mainWindow.webContents.on('before-input-event', (event, input) => {
    handleBrowserShortcut(event, input, mainWindow.webContents, false);
  });

  // Initialize Central AdBlock Engine
  adBlockEngine.init(mainWindow);

  // Initialize Autonomous Agent CDP Tool Router
  cdpToolRouter.init(mainWindow);

  // Setup all sessions
  setupSession(session.defaultSession);
  setupSession(session.fromPartition('persist:voile-main'));
  setupSession(session.fromPartition('voile-private-temp'));

  function loadScript(relPath) {
    const candidatePaths = [
      path.join(__dirname, '..', relPath),
      path.join(app.getAppPath(), relPath),
      path.join(__dirname, relPath),
      path.join(process.cwd(), relPath)
    ];
    for (const p of candidatePaths) {
      try {
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, 'utf8');
          if (content) return content;
        }
      } catch (e) {}
    }
    return '';
  }

  const chameleonCode = loadScript('public/chameleon_shield.js');
  const cosmeticsCode = loadScript('public/adblock_cosmetics.js');
  const searchBrandingCode = loadScript('public/voile_search_branding.js');

  // 1. Enforce strict contextIsolation and sandbox on guest webviews to prevent prototype pollution and guest escapes
  mainWindow.webContents.on('will-attach-webview', (event, webPreferences, params) => {
    webPreferences.contextIsolation = true;
    webPreferences.nodeIntegration = false;
    webPreferences.sandbox = true;
    log('Webview will-attach: Enforced contextIsolation and sandbox security.');
  });

  // 2. Inject Chameleon Shield, Universal Cosmetic AdBlock, and DevTools Context Menu into webviews
  mainWindow.webContents.on('did-attach-webview', (event, webContents) => {
    webContents.setUserAgent(CHROME_UA);
    setupSession(webContents.session);
    cdpToolRouter.registerGuest(webContents);
    log('Webview attached. Assigned modern Chrome UA and registered with CDP Tool Router.');

    // Intelligent popup & link routing:
    // Allows legitimate authentication/OAuth popups with window.opener preserved,
    // while safely capturing arbitrary target="_blank" links into internal tabs.
    webContents.setWindowOpenHandler((details) => {
      const url = details.url || '';
      const features = details.features || '';
      const disposition = details.disposition || '';

      const isAuthOrModal = url.includes('accounts.google.com') ||
                            url.includes('appleid.apple.com') ||
                            url.includes('github.com/login') ||
                            url.includes('auth0.com') ||
                            url.includes('/auth') ||
                            url.includes('/login') ||
                            url.includes('/signin') ||
                            url.includes('/oauth') ||
                            features.includes('width=') ||
                            features.includes('height=') ||
                            features.includes('popup=yes') ||
                            disposition === 'new-window';

      if (isAuthOrModal) {
        log(`[WindowOpenHandler] Permitted authentication/modal popup: ${url.slice(0, 80)}`);
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            width: 600,
            height: 800,
            autoHideMenuBar: true,
            title: 'Sign In',
            webPreferences: {
              session: webContents.session,
              contextIsolation: true,
              nodeIntegration: false,
              sandbox: true
            }
          }
        };
      }

      // Normal links (e.g. target="_blank") -> open as an internal browser tab
      mainWindow?.webContents.send('open-external-tab', details.url);
      return { action: 'deny' };
    });

    webContents.on('did-create-window', (childWin, details) => {
      log(`[did-create-window] Child auth window created for: ${details.url?.slice(0, 80)}`);
      childWin.webContents.setUserAgent(CHROME_UA);
      setupSession(childWin.webContents.session);
    });

    // Global Browser Keyboard Shortcuts Listener inside webview
    webContents.on('before-input-event', (event, input) => {
      handleBrowserShortcut(event, input, webContents, true);
    });

    // Right-Click Context Menu for Webviews (Inspect Element, Developer Tools)
    webContents.on('context-menu', (event, params) => {
      const menu = new Menu();

      if (params.linkURL) {
        menu.append(new MenuItem({
          label: 'Open Link in New Tab',
          click: () => mainWindow?.webContents.send('open-external-tab', params.linkURL)
        }));
        menu.append(new MenuItem({
          label: 'Copy Link Address',
          click: () => clipboard.writeText(params.linkURL)
        }));
        menu.append(new MenuItem({ type: 'separator' }));
      }

      if (params.selectionText) {
        menu.append(new MenuItem({ label: 'Copy', role: 'copy' }));
        menu.append(new MenuItem({ type: 'separator' }));
      }

      menu.append(new MenuItem({
        label: 'Back',
        enabled: webContents.canGoBack(),
        click: () => webContents.goBack()
      }));
      menu.append(new MenuItem({
        label: 'Forward',
        enabled: webContents.canGoForward(),
        click: () => webContents.goForward()
      }));
      menu.append(new MenuItem({
        label: 'Reload',
        click: () => webContents.reload()
      }));
      menu.append(new MenuItem({ type: 'separator' }));

      menu.append(new MenuItem({
        label: 'Inspect Element',
        click: () => {
          webContents.inspectElement(params.x, params.y);
          if (!webContents.isDevToolsOpened()) {
            webContents.openDevTools({ mode: 'bottom' });
          }
        }
      }));
      menu.append(new MenuItem({
        label: 'Developer Tools (F12)',
        accelerator: 'F12',
        click: () => {
          if (webContents.isDevToolsOpened()) {
            webContents.closeDevTools();
          } else {
            webContents.openDevTools({ mode: 'bottom' });
          }
        }
      }));

      menu.popup({ window: mainWindow });
    });

    const injectShields = () => {
      if (!adBlockEngine.isShieldEnabled) return;
      const url = webContents.getURL() || '';
      if (adBlockEngine.isDomainWhitelisted(url)) return;

      if (chameleonCode) {
        webContents.executeJavaScript(chameleonCode).catch(() => {});
      }
      if (cosmeticsCode) {
        webContents.executeJavaScript(cosmeticsCode).catch(() => {});
      }
      if (searchBrandingCode && (url.includes('google.') || url.includes('duckduckgo.com') || !url || url === 'about:blank')) {
        webContents.executeJavaScript(searchBrandingCode).catch(() => {});
      }
    };

    injectShields();
    webContents.on('did-start-navigation', (e, url) => {
      log(`[webview did-start-navigation] ${url}`);
      injectShields();
    });
    webContents.on('did-finish-load', () => {
      log(`[webview did-finish-load] ${webContents.getURL()}`);
    });
    webContents.on('did-fail-load', (e, code, desc, url) => {
      log(`[webview did-fail-load] Code: ${code}, Desc: ${desc}, URL: ${url}`);
    });
    webContents.on('dom-ready', injectShields);
  });

  // Direct native file loading — Zero localhost dependency
  const indexPath = path.join(__dirname, '../dist/index.html');
  log('Loading index file: ' + indexPath);
  mainWindow.loadFile(indexPath).catch(err => {
    log('Error loading index file: ' + err.message);
  });

  mainWindow.on('closed', () => {
    log('Window closed event fired.');
    mainWindow = null;
  });
}

// IPC Window Controls
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow?.close();
});

ipcMain.on('toggle-main-devtools', () => {
  if (!mainWindow) return;
  if (mainWindow.webContents.isDevToolsOpened()) {
    mainWindow.webContents.closeDevTools();
  } else {
    mainWindow.webContents.openDevTools({ mode: 'bottom' });
  }
});

// Voile Identity Bridge Authentication Handlers (RFC 8252 + PKCE)
ipcMain.handle('google-auth-get-user', () => {
  return googleAuthService.getUser();
});

ipcMain.handle('google-auth-start', async (event, options) => {
  return await googleAuthService.startAuth(mainWindow, options);
});

ipcMain.handle('google-auth-email', async (event, { email, name } = {}) => {
  return await googleAuthService.startEmailAuth(mainWindow, email, name);
});

ipcMain.handle('google-auth-guest', () => {
  return googleAuthService.continueAsGuest(mainWindow);
});

ipcMain.handle('google-auth-cancel', () => {
  googleAuthService.cancelAuth(mainWindow);
  return { success: true };
});

ipcMain.handle('google-auth-logout', () => {
  googleAuthService.logout(mainWindow);
  return { success: true };
});

ipcMain.handle('google-auth-save-config', (event, clientId) => {
  googleAuthService.saveConfig(clientId);
  return { success: true };
});

// Voile Shield State Synchronization is handled directly inside AdBlockEngine.cjs

// App & Window Control Handlers
ipcMain.on('window-new', (event, { isPrivate } = {}) => {
  createWindow();
});

ipcMain.on('app-quit', () => {
  app.quit();
});

ipcMain.on('window-toggle-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

// Native File Open & Save Dialogs
ipcMain.handle('open-file-dialog', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open File',
    properties: ['openFile'],
    filters: [
      { name: 'Web Documents', extensions: ['html', 'htm', 'txt', 'pdf', 'json', 'svg', 'xml', 'md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
    const { pathToFileURL } = require('url');
    return pathToFileURL(result.filePaths[0]).href;
  }
  return null;
});

ipcMain.handle('save-page-dialog', async (event, { url, title } = {}) => {
  if (!mainWindow) return null;
  const sanitized = (title || 'saved_page').replace(/[/\\?%*:|"<>]/g, '_').slice(0, 60);
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Page',
    defaultPath: `${sanitized}.html`,
    filters: [
      { name: 'HTML Document', extensions: ['html', 'htm'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (!result.canceled && result.filePath) {
    return result.filePath;
  }
  return null;
});

// IPC text extraction for AdaL AI Assistant
ipcMain.handle('extract-page-text', async (event, url) => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': CHROME_UA,
        'Accept': 'text/html,*/*'
      }
    });
    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return { title, text: text.slice(0, 5000), url };
  } catch (e) {
    return { title: url, text: '', error: e.message };
  }
});

app.whenReady().then(() => {
  log('Electron app.whenReady fired.');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  log('app window-all-closed fired.');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  log('app will-quit fired.');
});
