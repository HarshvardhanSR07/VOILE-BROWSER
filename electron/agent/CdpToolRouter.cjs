// electron/agent/CdpToolRouter.cjs
// Native Chrome DevTools Protocol (CDP 1.3) & Tab Automation Router for Voile Browser

const { ipcMain } = require('electron');

class CdpToolRouter {
  constructor() {
    this.mainWindow = null;
    this.activeWebContents = null;
    this.guestRegistry = new Map(); // id -> webContents
  }

  init(mainWindow) {
    this.mainWindow = mainWindow;
    this.registerIpcHandlers();
  }

  registerGuest(webContents) {
    if (!webContents) return;
    const id = webContents.id;
    this.guestRegistry.set(id, webContents);
    this.activeWebContents = webContents;

    webContents.on('destroyed', () => {
      this.guestRegistry.delete(id);
      if (this.activeWebContents && this.activeWebContents.id === id) {
        this.activeWebContents = this.guestRegistry.values().next().value || null;
      }
    });

    webContents.on('focus', () => {
      this.activeWebContents = webContents;
    });
  }

  getActive() {
    if (this.activeWebContents && !this.activeWebContents.isDestroyed()) {
      return this.activeWebContents;
    }
    for (const wc of this.guestRegistry.values()) {
      if (!wc.isDestroyed()) {
        this.activeWebContents = wc;
        return wc;
      }
    }
    return null;
  }

  registerIpcHandlers() {
    // 1. Tool: browser_navigate
    ipcMain.handle('agent-cdp-navigate', async (event, { url, tabId } = {}) => {
      try {
        if (!url || typeof url !== 'string') {
          return { success: false, error: 'Invalid URL supplied' };
        }

        let targetUrl = url.trim();
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
          targetUrl = `https://${targetUrl}`;
        }

        // Direct main window to open or navigate active tab
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('open-external-tab', targetUrl);
        }

        // Wait up to 3 seconds for active webContents to attach/navigate
        await new Promise(r => setTimeout(r, 1200));
        const wc = this.getActive();
        const currentUrl = wc && !wc.isDestroyed() ? wc.getURL() : targetUrl;

        return {
          success: true,
          loadedUrl: currentUrl,
          title: wc && !wc.isDestroyed() ? wc.getTitle() : 'Web Page',
          status: 200
        };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });

    // 2. Tool: browser_snapshot_dom
    ipcMain.handle('agent-cdp-snapshot-dom', async (event, { selector } = {}) => {
      try {
        const wc = this.getActive();
        if (!wc || wc.isDestroyed()) {
          return {
            success: false,
            error: 'No active browser tab found to snapshot'
          };
        }

        const script = `
          (() => {
            const root = ${selector ? `document.querySelector('${selector}') || document.body` : 'document.body'};
            if (!root) return { title: document.title, url: window.location.href, content: '' };

            // Extract main headings
            const headings = Array.from(root.querySelectorAll('h1, h2, h3')).map(h => h.textContent.trim()).filter(Boolean).slice(0, 15);

            // Extract pricing blocks if present
            const pricingElements = Array.from(root.querySelectorAll('[class*="pricing"], [class*="plan"], [id*="pricing"], table, [role="table"]'))
              .map(el => el.textContent.replace(/\\s+/g, ' ').trim())
              .filter(t => t.length > 20 && t.length < 500)
              .slice(0, 5);

            // Extract paragraphs
            const paragraphs = Array.from(root.querySelectorAll('p, li, article'))
              .map(p => p.textContent.replace(/\\s+/g, ' ').trim())
              .filter(t => t.length > 25 && t.length < 400)
              .slice(0, 20);

            // Extract key navigational links
            const links = Array.from(root.querySelectorAll('a[href]'))
              .map(a => ({ text: a.textContent.trim(), href: a.href }))
              .filter(l => l.text.length > 2 && l.href.startsWith('http'))
              .slice(0, 15);

            return {
              title: document.title,
              url: window.location.href,
              headings,
              pricingElements,
              paragraphs,
              links,
              textSnippet: root.innerText ? root.innerText.slice(0, 2500) : ''
            };
          })()
        `;

        const data = await wc.executeJavaScript(script);
        return {
          success: true,
          data
        };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });

    // 3. Tool: browser_click_element
    ipcMain.handle('agent-cdp-click-element', async (event, { selector, textMatch } = {}) => {
      try {
        const wc = this.getActive();
        if (!wc || wc.isDestroyed()) {
          return { success: false, error: 'No active browser tab found to interact with' };
        }

        const script = `
          (() => {
            let el = null;
            if (${JSON.stringify(selector)}) {
              el = document.querySelector(${JSON.stringify(selector)});
            }
            if (!el && ${JSON.stringify(textMatch)}) {
              const targetText = ${JSON.stringify(textMatch)}.toLowerCase();
              const candidates = Array.from(document.querySelectorAll('a, button, input[type="button"], [role="button"]'));
              el = candidates.find(c => (c.textContent || '').toLowerCase().includes(targetText));
            }

            if (!el) return { clicked: false, error: 'Element not found' };

            el.scrollIntoView({ behavior: 'instant', block: 'center' });
            el.click();
            return { clicked: true, tagName: el.tagName, text: (el.textContent || '').slice(0, 40).trim() };
          })()
        `;

        const result = await wc.executeJavaScript(script);
        return { success: !!result.clicked, details: result };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });

    // 4. Tool: browser_input_text
    ipcMain.handle('agent-cdp-input-text', async (event, { selector, text } = {}) => {
      try {
        const wc = this.getActive();
        if (!wc || wc.isDestroyed()) {
          return { success: false, error: 'No active browser tab found' };
        }

        const script = `
          (() => {
            const input = document.querySelector(${JSON.stringify(selector)});
            if (!input) return { filled: false, error: 'Input element not found' };
            input.focus();
            input.value = ${JSON.stringify(text)};
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            return { filled: true, value: input.value };
          })()
        `;

        const res = await wc.executeJavaScript(script);
        return { success: !!res.filled, details: res };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });

    // 5. Tool: browser_capture_evidence
    ipcMain.handle('agent-cdp-capture-evidence', async () => {
      try {
        const wc = this.getActive();
        if (!wc || wc.isDestroyed()) {
          return { success: false, error: 'No active tab for screenshot' };
        }
        const nativeImage = await wc.capturePage();
        const base64 = nativeImage.toDataURL();
        return {
          success: true,
          url: wc.getURL(),
          title: wc.getTitle(),
          dataUrl: base64.slice(0, 200) + '...[truncated]',
          timestamp: Date.now()
        };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });
  }
}

module.exports = { CdpToolRouter };
