const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../electron/preload.cjs')
    }
  });

  win.webContents.on('console-message', (e, level, msg) => {
    console.log('[BROWSER CONSOLE]', msg);
  });

  const distPath = path.join(__dirname, '../dist/index.html');
  await win.loadFile(distPath);

  setTimeout(async () => {
    const info = await win.webContents.executeJavaScript(`
      (() => {
        const btn = document.querySelector('button[title="Change search engine"]');
        if (!btn) return 'NO_BTN';
        btn.click();
        return 'CLICKED_OK';
      })()
    `);
    console.log('INFO:', info);

    setTimeout(async () => {
      const htmlCheck = await win.webContents.executeJavaScript(`
        document.body.innerText.includes('DuckDuckGo') && document.body.innerText.includes('Google')
      `);
      console.log('HTML_HAS_ENGINES:', htmlCheck);

      const image = await win.webContents.capturePage();
      const outPath = path.join(__dirname, '../voile_dropdown_spacing_preview.png');
      fs.writeFileSync(outPath, image.toPNG());
      console.log('SCREENSHOT_SAVED:' + outPath);
      app.quit();
    }, 1000);
  }, 2000);
});
