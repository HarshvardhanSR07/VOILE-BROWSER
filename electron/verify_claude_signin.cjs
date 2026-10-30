// electron/verify_claude_signin.cjs
// Verifies that Claude.ai authentication popup opens cleanly without error in Voile Browser.

const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const { AdBlockEngine } = require('./adblock/AdBlockEngine.cjs');

app.whenReady().then(async () => {
  console.log('=====================================================');
  console.log('VOILE BROWSER: CLAUDE.AI AUTHENTICATION TEST SUITE');
  console.log('=====================================================');

  const ses = session.fromPartition('persist:voile-main');
  const adBlockEngine = new AdBlockEngine();
  adBlockEngine.enableInSession(ses);

  const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  let popupOpened = false;
  let popupUrl = '';

  const hostWin = new BrowserWindow({
    width: 1280,
    height: 900,
    show: false,
    webPreferences: {
      webviewTag: true,
      contextIsolation: false,
      nodeIntegration: true,
      sandbox: false
    }
  });

  hostWin.webContents.on('will-attach-webview', (e, webPreferences) => {
    webPreferences.contextIsolation = false;
    webPreferences.nodeIntegration = false;
    webPreferences.sandbox = false;
  });

  let guestWebContents = null;

  hostWin.webContents.on('did-attach-webview', (e, webContents) => {
    guestWebContents = webContents;
    webContents.setUserAgent(CHROME_UA);

    webContents.setWindowOpenHandler((details) => {
      const isAuthOrModal = details.url.includes('accounts.google.com') ||
                            details.url.includes('auth') ||
                            details.url.includes('login') ||
                            details.features.includes('width=') ||
                            details.disposition === 'new-window';

      if (isAuthOrModal) {
        popupOpened = true;
        popupUrl = details.url;
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            width: 600,
            height: 800,
            autoHideMenuBar: true,
            title: 'Sign In — Google Accounts',
            webPreferences: {
              session: webContents.session,
              contextIsolation: false,
              nodeIntegration: false,
              sandbox: false
            }
          }
        };
      }
      return { action: 'deny' };
    });
  });

  await hostWin.loadURL(`data:text/html,
    <html>
      <body style="margin:0; overflow:hidden;">
        <webview id="claude-wv" src="https://claude.ai/login" partition="persist:voile-main" allowpopups style="width:100vw; height:100vh;"></webview>
      </body>
    </html>
  `);

  console.log('Loading Claude login page...');
  await new Promise(r => setTimeout(r, 6000));

  if (!guestWebContents) {
    console.error('✗ TEST FAILED: Guest webview did not attach.');
    app.exit(1);
    return;
  }

  console.log('Triggering "Continue with Google" click...');
  await guestWebContents.executeJavaScript(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Continue with Google') || b.innerText.includes('Google'));
    if (btn) btn.click();
  })()`);

  await new Promise(r => setTimeout(r, 6000));

  const postClick = await guestWebContents.executeJavaScript(`(() => {
    const body = document.body ? document.body.innerText : '';
    return {
      hasErrorMessage: body.includes('There was an error logging you in'),
      snippet: body.slice(0, 300)
    };
  })()`);

  let passed = 0;
  let failed = 0;

  if (popupOpened && popupUrl.includes('accounts.google.com')) {
    console.log('✓ TEST 1 PASSED: Google Identity Services OAuth popup window opened successfully.');
    passed++;
  } else {
    console.error('✗ TEST 1 FAILED: OAuth popup window was blocked or did not open.');
    failed++;
  }

  if (!postClick.hasErrorMessage) {
    console.log('✓ TEST 2 PASSED: Claude login interface did NOT show "There was an error logging you in".');
    passed++;
  } else {
    console.error('✗ TEST 2 FAILED: Claude displayed "There was an error logging you in".');
    failed++;
  }

  console.log('=====================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=====================================================');

  setTimeout(() => {
    app.exit(failed === 0 ? 0 : 1);
  }, 500);
});
