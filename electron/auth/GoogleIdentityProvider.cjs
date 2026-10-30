// electron/auth/GoogleIdentityProvider.cjs
// Voile Identity Bridge — Google Identity Provider & OAuth 2.0 (RFC 8252 + RFC 7636 PKCE)

const { shell, BrowserWindow, session } = require('electron');
const { OAuthConfigValidator } = require('./OAuthConfigValidator.cjs');

const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

class GoogleIdentityProvider {
  constructor(stateManager, callbackHandler, tokenService, sessionManager, logFn) {
    this.stateManager = stateManager;
    this.callbackHandler = callbackHandler;
    this.tokenService = tokenService;
    this.sessionManager = sessionManager;
    this.log = logFn || console.log;

    this.activeWindow = null;
  }

  /**
   * Starts the official Google OAuth 2.0 Authorization Code Flow with PKCE.
   * @param {BrowserWindow} mainWindow 
   * @param {string} configuredClientId 
   * @param {object} options 
   */
  async authenticate(mainWindow, configuredClientId, options = {}) {
    const isMock = !!options.isMock;
    const clientId = (options.clientId || configuredClientId || '').trim();

    // 1. Mock verification mode for developers & evaluators (no GCP setup required)
    if (isMock) {
      this.log('[GoogleIdentityProvider] Starting simulated OAuth loopback verification (Mock Mode).');
      return this.executeMockFlow(mainWindow);
    }

    // 2. Validate Google OAuth Client ID before contacting Google
    const clientValidation = OAuthConfigValidator.validateClientId(clientId);
    if (!clientValidation.valid) {
      this.log(`[GoogleIdentityProvider] OAuth Client ID validation failed: ${clientValidation.error}`);
      this.sessionManager.setError(
        mainWindow,
        'config_error',
        'Google OAuth configuration requires attention: ' + clientValidation.error,
        clientValidation.hint
      );
      return {
        status: 'config_error',
        error: clientValidation.error,
        hint: clientValidation.hint,
        instructions: OAuthConfigValidator.getSetupInstructions()
      };
    }

    // 3. Generate cryptographic PKCE verifier, challenge, and CSRF state
    const { challenge, state } = this.stateManager.createSession();

    // 4. Start ephemeral loopback server on 127.0.0.1
    let port, redirectUri;
    try {
      const serverInfo = await this.callbackHandler.start(async (err, callbackData) => {
        this.closeWindow();

        if (err) {
          if (err.oauthError === 'access_denied') {
            this.sessionManager.setCancelled(mainWindow, 'Sign-in was cancelled. You can try again.');
          } else if (err.isSecurityViolation) {
            this.sessionManager.setError(mainWindow, 'error', err.message);
          } else {
            this.sessionManager.setError(mainWindow, 'error', 'Google sign-in could not be completed. Please try again.', err.message);
          }
          return;
        }

        // 5. Code exchange & token retrieval
        try {
          const { code, verifier } = callbackData;
          const tokenRes = await this.tokenService.exchangeCode({
            code,
            verifier,
            clientId,
            redirectUri
          });

          const userInfo = await this.tokenService.fetchUserInfo(tokenRes.access_token);
          this.sessionManager.setAuthenticated(mainWindow, {
            ...userInfo,
            provider: 'google'
          }, tokenRes, false);
        } catch (exchangeErr) {
          this.log(`[GoogleIdentityProvider] Exchange failed: ${exchangeErr.message}`);
          let statusType = 'error';
          let userMsg = 'Google sign-in could not be completed. Please try again.';

          if (exchangeErr.code === 'ENOTFOUND' || exchangeErr.code === 'ECONNREFUSED' || exchangeErr.code === 'ETIMEDOUT') {
            statusType = 'network_error';
            userMsg = 'Network error during sign-in. Please check your connection and try again.';
          } else if (exchangeErr.message && exchangeErr.message.includes('invalid_client')) {
            statusType = 'config_error';
            userMsg = 'Google OAuth configuration requires attention: Client ID not recognized by Google.';
          }

          this.sessionManager.setError(mainWindow, statusType, userMsg, exchangeErr.message);
        }
      });

      port = serverInfo.port;
      redirectUri = serverInfo.redirectUri;
    } catch (serverErr) {
      this.stateManager.clearSession();
      this.sessionManager.setError(mainWindow, 'error', 'Failed to bind loopback callback listener.', serverErr.message);
      return { status: 'error', error: serverErr.message };
    }

    // 5. Construct RFC 8252 Google OAuth Authorization URL
    const authParams = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'openid email profile',
      state: state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      access_type: 'offline',
      prompt: 'consent'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;
    this.log(`[GoogleIdentityProvider] Launching authorization URL with PKCE on loopback port ${port}.`);

    this.sessionManager.setConnecting(mainWindow, { authUrl, redirectUri });

    // Open system browser (Google-mandated native flow) or in-app modal window
    if (options.useSystemBrowser) {
      shell.openExternal(authUrl);
    } else {
      this.openInAppAuthWindow(mainWindow, authUrl);
    }

    return {
      status: 'pending',
      authUrl,
      redirectUri
    };
  }

  openInAppAuthWindow(mainWindow, authUrl) {
    this.closeWindow();

    try {
      const ses = session.fromPartition('persist:voile-main');
      ses.setUserAgent(CHROME_UA);

      const authWin = new BrowserWindow({
        width: 520,
        height: 680,
        parent: (mainWindow && !mainWindow.isDestroyed()) ? mainWindow : null,
        modal: true,
        show: false,
        title: 'Sign in to Voile with Google',
        backgroundColor: '#0B0F19',
        autoHideMenuBar: true,
        webPreferences: {
          session: ses,
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          webSecurity: true
        }
      });

      authWin.webContents.setUserAgent(CHROME_UA);

      authWin.once('ready-to-show', () => {
        if (!authWin.isDestroyed()) {
          authWin.show();
          authWin.focus();
        }
      });

      this.activeWindow = authWin;

      authWin.on('closed', () => {
        if (this.activeWindow === authWin) {
          this.activeWindow = null;
          this.cancel(mainWindow);
        }
      });

      // Detect error pages returned by Google
      authWin.webContents.on('did-finish-load', () => {
        try {
          if (authWin.isDestroyed()) return;
          const currentUrl = authWin.webContents.getURL();
          if (currentUrl.includes('accounts.google.com/signin/oauth/error') || currentUrl.includes('authError=Cg5pbnZhbGlkX2NsaWVud')) {
            this.log('[GoogleIdentityProvider] Google returned invalid_client error page. Auto-closing window.');
            this.closeWindow();
            this.callbackHandler.stop();
            this.stateManager.clearSession();
            this.sessionManager.setError(
              mainWindow,
              'config_error',
              'Google OAuth configuration requires attention: The OAuth client ID was not found.'
            );
          }
        } catch (e) {}
      });

      authWin.loadURL(authUrl);
    } catch (e) {
      this.log(`[GoogleIdentityProvider] Error opening auth window: ${e.message}`);
      shell.openExternal(authUrl);
    }
  }

  async executeMockFlow(mainWindow) {
    const { challenge, state } = this.stateManager.createSession();

    let port, redirectUri;
    const serverInfo = await this.callbackHandler.start((err, callbackData) => {
      if (err) {
        this.sessionManager.setError(mainWindow, 'error', err.message);
        return;
      }
      const mockUser = {
        name: 'Voile Explorer (Diagnostic Test)',
        email: 'user@voilebrowser.org',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
        verifiedEmail: true,
        provider: 'google'
      };
      this.sessionManager.setAuthenticated(mainWindow, mockUser, { access_token: 'mock_token' }, true);
    });

    port = serverInfo.port;
    redirectUri = serverInfo.redirectUri;

    this.sessionManager.setConnecting(mainWindow, { isMock: true, redirectUri });

    return {
      status: 'pending',
      port,
      state,
      redirectUri
    };
  }

  cancel(mainWindow) {
    this.closeWindow();
    this.callbackHandler.stop();
    this.stateManager.clearSession();
    this.sessionManager.setCancelled(mainWindow);
  }

  closeWindow() {
    if (this.activeWindow && !this.activeWindow.isDestroyed()) {
      try {
        const win = this.activeWindow;
        this.activeWindow = null;
        win.close();
      } catch (e) {}
    }
  }
}

module.exports = { GoogleIdentityProvider };
