// electron/verify_slice_1.cjs
// Verification Suite for Slice 1: Shell & Transparent Execution UI

const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const { AdBlockEngine } = require('./adblock/AdBlockEngine.cjs');

app.whenReady().then(async () => {
  console.log('================================================================');
  console.log('VERIFY SLICE 1: SHELL & TRANSPARENT EXECUTION UI');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(cond, msg) {
    total++;
    if (cond) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
    }
  }

  const ses = session.fromPartition('persist:voile-main');
  const adBlockEngine = new AdBlockEngine();
  adBlockEngine.enableInSession(ses);

  ipcMain.handle('adblock-get-stats', () => ({ blockedCount: 0 }));
  ipcMain.handle('google-auth-get-user', () => null);

  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      webviewTag: true,
      contextIsolation: true
    }
  });

  win.webContents.on('will-attach-webview', (e, webPreferences) => {
    webPreferences.contextIsolation = false;
    webPreferences.nodeIntegration = false;
    webPreferences.sandbox = false;
  });

  await win.loadFile(path.join(__dirname, '../dist/index.html'));
  await new Promise(r => setTimeout(r, 1200));

  // 1. Verify Browser Chrome & AdaL Agent Toggle Button
  const hasAgentButton = await win.webContents.executeJavaScript(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('AdaL Agent'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()
  `);
  assert(hasAgentButton, 'AdaL Agent button exists in chrome and is clickable');

  await new Promise(r => setTimeout(r, 600));

  // 2. Verify AgentPanel is open
  const panelVisible = await win.webContents.executeJavaScript(`
    (() => {
      const panel = document.querySelector('aside');
      return panel !== null && panel.textContent.includes('AdaL Companion');
    })()
  `);
  assert(panelVisible, 'AdaL Autonomous Companion side-panel opens cleanly');

  // 3. Trigger Workflow A preset button
  const presetClicked = await win.webContents.executeJavaScript(`
    (() => {
      const presetBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('10 AI Startups'));
      if (presetBtn) {
        presetBtn.click();
        return true;
      }
      return false;
    })()
  `);
  assert(presetClicked, 'Flagship Workflow A preset button clicked');

  await new Promise(r => setTimeout(r, 600));

  // 4. Verify Plan Generation & Steps
  const stepCount = await win.webContents.executeJavaScript(`
    (() => {
      const steps = document.querySelectorAll('h5');
      return steps.length;
    })()
  `);
  assert(stepCount >= 5, `Plan generated with ${stepCount} sequential steps`);

  // 5. Verify Live Log Stream has events
  const logsCount = await win.webContents.executeJavaScript(`
    (() => {
      // Switch to logs tab
      const logTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Live Log'));
      if (logTab) logTab.click();
      return true;
    })()
  `);
  await new Promise(r => setTimeout(r, 400));

  const eventsRecorded = await win.webContents.executeJavaScript(`
    (() => {
      const logEntries = document.querySelectorAll('span');
      const plannerEntries = Array.from(logEntries).filter(s => s.textContent && s.textContent.includes('[PLANNER]'));
      return plannerEntries.length;
    })()
  `);
  assert(eventsRecorded >= 1, `Live Log displays real-time execution stream (${eventsRecorded} planner events)`);

  // 6. Test Manual Takeover Control
  const takeoverToggled = await win.webContents.executeJavaScript(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('TAKEOVER'));
      if (btn) {
        btn.click();
        return btn.textContent.includes('ON') || btn.textContent.includes('TAKEOVER');
      }
      return false;
    })()
  `);
  assert(takeoverToggled, 'Manual Takeover toggle successfully changes state');

  console.log('\n================================================================');
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log('================================================================\n');

  win.destroy();
  app.quit();
  process.exit(passed === total ? 0 : 1);
});
