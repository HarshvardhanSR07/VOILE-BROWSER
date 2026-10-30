// electron/auth/OAuthCallbackHandler.cjs
// Voile Identity Bridge — Loopback HTTP Callback Server (RFC 8252 Section 7.3)

const http = require('http');

class OAuthCallbackHandler {
  constructor(stateManager, logFn) {
    this.stateManager = stateManager;
    this.log = logFn || console.log;
    this.server = null;
    this.port = null;
    this.timer = null;
  }

  /**
   * Starts temporary loopback server on 127.0.0.1 with dynamic ephemeral port.
   * @param {Function} onCallback (err, { code, verifier }) => void
   * @param {number} timeoutMs default 120000 (2 minutes)
   * @returns {Promise<{ port: number, redirectUri: string }>}
   */
  start(onCallback, timeoutMs = 120000) {
    this.stop();

    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res, onCallback);
      });

      // Strict binding to 127.0.0.1 for local isolation
      this.server.listen(0, '127.0.0.1', () => {
        const address = this.server.address();
        this.port = address.port;
        const redirectUri = `http://127.0.0.1:${this.port}/oauth2callback`;

        // Safety timeout
        this.timer = setTimeout(() => {
          this.log('[OAuthCallbackHandler] Authorization timed out waiting for redirect.');
          this.stop();
          onCallback(new Error('Authentication session timed out. Please try again.'));
        }, timeoutMs);

        resolve({ port: this.port, redirectUri });
      });

      this.server.on('error', (err) => {
        this.log(`[OAuthCallbackHandler] Server error: ${err.message}`);
        this.stop();
        reject(err);
      });
    });
  }

  handleRequest(req, res, onCallback) {
    try {
      const reqUrl = new URL(req.url, `http://127.0.0.1:${this.port}`);

      if (reqUrl.pathname !== '/oauth2callback') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }

      const code = reqUrl.searchParams.get('code');
      const state = reqUrl.searchParams.get('state');
      const error = reqUrl.searchParams.get('error');

      // 1. Handle OAuth error response from Google
      if (error) {
        this.log(`[OAuthCallbackHandler] Google returned error in callback: ${error}`);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(this.renderHtml(false, `Authentication was cancelled or denied: ${error}`));
        this.stop();

        const errObj = new Error(error === 'access_denied' ? 'Sign-in was cancelled. You can try again.' : `Google error: ${error}`);
        errObj.oauthError = error;
        onCallback(errObj);
        return;
      }

      // 2. Validate CSRF state parameter strictly
      const stateValidation = this.stateManager.verifyAndConsumeState(state);
      if (!stateValidation.valid) {
        this.log(`[OAuthCallbackHandler] State validation failed: ${stateValidation.error}`);
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(this.renderHtml(false, stateValidation.error || 'Invalid state parameter.'));
        this.stop();

        const errObj = new Error(stateValidation.error || 'CSRF state verification failed.');
        errObj.isSecurityViolation = true;
        onCallback(errObj);
        return;
      }

      // 3. Validate code existence
      if (!code) {
        this.log('[OAuthCallbackHandler] Missing authorization code.');
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(this.renderHtml(false, 'Missing authorization code in redirect.'));
        this.stop();
        onCallback(new Error('Missing authorization code from Google.'));
        return;
      }

      // 4. Send success HTML feedback
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(this.renderHtml(true, 'Authentication successful! You can now return to Voile Browser.'));

      const verifier = stateValidation.verifier;
      this.stop();

      // Proceed with token exchange
      onCallback(null, { code, verifier });
    } catch (e) {
      this.log(`[OAuthCallbackHandler] Exception in request handler: ${e.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      this.stop();
      onCallback(e);
    }
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.server) {
      try {
        this.server.close();
      } catch (e) {}
      this.server = null;
    }
    this.port = null;
  }

  renderHtml(isSuccess, message) {
    const title = isSuccess ? 'Authentication Successful' : 'Authentication Failed';
    const accent = isSuccess ? '#06b6d4' : '#ef4444';
    const icon = isSuccess ? '✓' : '✕';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} — Voile</title>
  <style>
    body {
      margin: 0; padding: 0;
      background: #0B0F19; color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex; align-items: center; justify-content: center;
      height: 100vh; text-align: center;
    }
    .card {
      background: #0E1524;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 40px; max-width: 420px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .badge {
      width: 54px; height: 54px; border-radius: 50%;
      background: ${accent}22; border: 1px solid ${accent}55;
      color: ${accent}; display: flex; align-items: center; justify-content: center;
      font-size: 24px; font-weight: bold; margin: 0 auto 18px;
    }
    h1 { font-size: 18px; margin: 0 0 10px; color: #FFF; }
    p { font-size: 13px; color: #94A3B8; line-height: 1.5; margin: 0 0 20px; }
    .hint { font-size: 11px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="hint">Voile Identity Bridge · Secure Native Desktop Flow</div>
  </div>
</body>
</html>`;
  }
}

module.exports = { OAuthCallbackHandler };
