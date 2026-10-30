import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function voileProxyPlugin(): Plugin {
  return {
    name: 'voile-proxy',
    configureServer(server) {
      // 1. Text extraction endpoint for AdaL AI summarization
      server.middlewares.use('/api/extract', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', 'http://localhost');
          let target = urlObj.searchParams.get('url');
          if (!target) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing url parameter' }));
            return;
          }
          if (!target.startsWith('http://') && !target.startsWith('https://')) {
            target = 'https://' + target;
          }

          const response = await fetch(target, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Voile/1.0',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            }
          });

          const html = await response.text();
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : target;
          
          const text = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, ' ')
            .trim();

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({
            title,
            url: target,
            text: text.slice(0, 6000),
            length: text.length
          }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      // 2. Full web navigation proxy for live iframe browsing
      server.middlewares.use('/api/proxy', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', 'http://localhost');
          let target = urlObj.searchParams.get('url');
          if (!target) {
            res.statusCode = 400;
            res.end('Missing target url');
            return;
          }
          if (!target.startsWith('http://') && !target.startsWith('https://')) {
            target = 'https://' + target;
          }

          const parsed = new URL(target);
          const origin = parsed.origin;

          const response = await fetch(target, {
            redirect: 'follow',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Voile/1.0',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            }
          });

          const contentType = response.headers.get('content-type') || 'text/html';

          res.setHeader('Content-Type', contentType);
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.removeHeader('x-frame-options');
          res.removeHeader('content-security-policy');
          res.removeHeader('cross-origin-opener-policy');
          res.removeHeader('cross-origin-embedder-policy');

          if (contentType.includes('text/html')) {
            let html = await response.text();
            
            const baseTag = `<base href="${origin}/" target="_self">`;
            const scriptTag = `
              <script>
                (function() {
                  function reportLoaded() {
                    try {
                      window.parent.postMessage({
                        type: 'VOILE_PAGE_LOADED',
                        title: document.title || '${parsed.hostname}',
                        url: '${target}'
                      }, '*');
                    } catch(e) {}
                  }
                  if (document.readyState === 'complete') {
                    reportLoaded();
                  } else {
                    window.addEventListener('load', reportLoaded);
                  }

                  document.addEventListener('click', function(e) {
                    var link = e.target.closest('a');
                    if (link && link.href && !link.href.startsWith('javascript:') && !link.href.startsWith('#')) {
                      e.preventDefault();
                      window.parent.postMessage({
                        type: 'VOILE_NAVIGATE',
                        url: link.href
                      }, '*');
                    }
                  }, true);

                  document.addEventListener('submit', function(e) {
                    var form = e.target;
                    if (form && form.action && form.method && form.method.toLowerCase() === 'get') {
                      e.preventDefault();
                      var formData = new FormData(form);
                      var params = new URLSearchParams(formData).toString();
                      var actionUrl = form.action + (form.action.includes('?') ? '&' : '?') + params;
                      window.parent.postMessage({
                        type: 'VOILE_NAVIGATE',
                        url: actionUrl
                      }, '*');
                    }
                  }, true);
                })();
              </script>
            `;

            if (html.includes('<head>')) {
              html = html.replace('<head>', `<head>${baseTag}${scriptTag}`);
            } else if (html.includes('<HEAD>')) {
              html = html.replace('<HEAD>', `<HEAD>${baseTag}${scriptTag}`);
            } else {
              html = `${baseTag}${scriptTag}${html}`;
            }

            res.statusCode = response.status;
            res.end(html);
          } else {
            const buffer = Buffer.from(await response.arrayBuffer());
            res.statusCode = response.status;
            res.end(buffer);
          }
        } catch (err: any) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'text/html');
          res.end(`
            <div style="font-family: system-ui, sans-serif; background: #0B0F19; color: #fff; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px;">
              <h2 style="color: #38bdf8;">Voile Secure Navigation</h2>
              <p style="color: #94a3b8; max-width: 500px;">Unable to load destination directly: ${err.message}</p>
              <a href="${req.url}" style="margin-top: 15px; color: #38bdf8; text-decoration: underline;">Retry</a>
            </div>
          `);
        }
      });
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), voileProxyPlugin()],
});
