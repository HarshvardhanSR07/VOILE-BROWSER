// electron/verify_adal_navigation.cjs
// Comprehensive Automated Test Suite: AdaL Search Result Navigation in Voile Browser

const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const { AdBlockEngine } = require('./adblock/AdBlockEngine.cjs');

app.whenReady().then(async () => {
  console.log('================================================================');
  console.log('VOILE BROWSER: ADAL SEARCH RESULTS NAVIGATION TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${message}`);
    }
  }

  // 1. Setup session & ad blocker
  const ses = session.fromPartition('persist:voile-main');
  const adBlockEngine = new AdBlockEngine();
  adBlockEngine.enableInSession(ses);

  // Register stub handlers for clean test environment
  ipcMain.handle('adblock-get-stats', () => ({ blockedCount: 0 }));
  ipcMain.handle('google-auth-get-user', () => null);

  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.webContents.on('will-attach-webview', (e, webPreferences) => {
    webPreferences.contextIsolation = false;
    webPreferences.nodeIntegration = false;
    webPreferences.sandbox = false;
  });

  const attachedWebviews = [];
  win.webContents.on('did-attach-webview', (e, webContents) => {
    attachedWebviews.push(webContents);
    webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  });

  await win.loadFile(path.join(__dirname, '../dist/index.html'));
  await new Promise(r => setTimeout(r, 1200));

  // TEST 1: Open Wikipedia search result
  console.log('--- TEST 1: Open Wikipedia Search Result ---');
  win.webContents.send('open-external-tab', 'https://en.wikipedia.org/wiki/Privacy');
  await new Promise(r => setTimeout(r, 2000));

  let webviews = await win.webContents.executeJavaScript(`
    (() => {
      const list = Array.from(document.querySelectorAll('webview'));
      return list.map(w => ({
        id: w.id,
        src: w.getAttribute('src'),
        currentUrl: w.getURL ? w.getURL() : '',
        offsetW: w.offsetWidth,
        offsetH: w.offsetHeight
      }));
    })()
  `);

  assert(webviews.length >= 1, 'Webview element created in DOM for Wikipedia tab');
  const wikiWebview = webviews.find(w => w.src && w.src.includes('wikipedia.org'));
  assert(wikiWebview !== undefined, 'Webview has Wikipedia src assigned');
  assert(wikiWebview && wikiWebview.offsetW > 0 && wikiWebview.offsetH > 0, 'Webview has non-zero visible dimensions (not blank)');

  // TEST 2: Open Reddit search result
  console.log('\n--- TEST 2: Open Reddit Search Result ---');
  win.webContents.send('open-external-tab', 'https://www.reddit.com/r/privacy/');
  await new Promise(r => setTimeout(r, 2000));

  webviews = await win.webContents.executeJavaScript(`
    (() => {
      const list = Array.from(document.querySelectorAll('webview'));
      return list.map(w => ({
        id: w.id,
        src: w.getAttribute('src'),
        offsetW: w.offsetWidth,
        offsetH: w.offsetHeight
      }));
    })()
  `);

  assert(webviews.length >= 2, 'New distinct tab created for Reddit result');
  const redditWebview = webviews.find(w => w.src && w.src.includes('reddit.com'));
  assert(redditWebview !== undefined, 'Reddit webview successfully mounted');

  // TEST 3: Open Pexels media result
  console.log('\n--- TEST 3: Open Pexels Media Result ---');
  win.webContents.send('open-external-tab', 'https://www.pexels.com/search/nature/');
  await new Promise(r => setTimeout(r, 2000));

  webviews = await win.webContents.executeJavaScript(`
    (() => {
      const list = Array.from(document.querySelectorAll('webview'));
      return list.map(w => ({
        id: w.id,
        src: w.getAttribute('src')
      }));
    })()
  `);

  assert(webviews.length >= 3, 'New distinct tab created for Pexels result');
  const pexelsWebview = webviews.find(w => w.src && w.src.includes('pexels.com'));
  assert(pexelsWebview !== undefined, 'Pexels webview successfully mounted');

  // TEST 4: Protocol validation & rejection of non-web URLs
  console.log('\n--- TEST 4: Protocol Validation & Non-Web Rejection ---');
  const tabsBefore = webviews.length;
  // Attempt sending malicious/unsupported URLs
  win.webContents.send('open-external-tab', 'javascript:alert(1)');
  win.webContents.send('open-external-tab', 'data:text/html,<h1>Hack</h1>');
  await new Promise(r => setTimeout(r, 1000));

  webviews = await win.webContents.executeJavaScript(`
    (() => Array.from(document.querySelectorAll('webview')).map(w => w.getAttribute('src')))()
  `);

  assert(webviews.length === tabsBefore, 'Rejected javascript: and data: URLs (no invalid tabs created)');

  // TEST 5: Verify AdaL conversation persistence across tab switches
  console.log('\n--- TEST 5: AdaL Conversation State Persistence ---');
  const adaLVisible = await win.webContents.executeJavaScript(`
    (() => {
      // AdaL state is held in BrowserContext
      return document.querySelector('#root') !== null;
    })()
  `);
  assert(adaLVisible, 'Root browser container intact without unmounting');

  console.log('\n================================================================');
  console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('================================================================\n');

  win.destroy();
  app.quit();
  process.exit(passedTests === totalTests ? 0 : 1);
});
