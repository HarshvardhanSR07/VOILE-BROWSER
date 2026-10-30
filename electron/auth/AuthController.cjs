// electron/auth/AuthController.cjs
// Voile Identity Bridge — Main Authentication Controller
// Orchestrates GoogleIdentityProvider, CredentialStore, AuthSessionManager, and Email/Guest flows.

const path = require('path');
const fs = require('fs');
const { CredentialStore } = require('./CredentialStore.cjs');
const { AuthSessionManager } = require('./AuthSessionManager.cjs');
const { OAuthStateManager } = require('./OAuthStateManager.cjs');
const { OAuthCallbackHandler } = require('./OAuthCallbackHandler.cjs');
const { TokenValidationService } = require('./TokenValidationService.cjs');
const { GoogleIdentityProvider } = require('./GoogleIdentityProvider.cjs');
const { OAuthConfigValidator } = require('./OAuthConfigValidator.cjs');

class AuthController {
  constructor(app, logFn) {
    this.app = app;
    this.log = logFn || console.log;
    this.userDataPath = app.getPath('userData');
    this.configPath = path.join(this.userDataPath, 'voile_google_oauth_config.json');

    // 1. Initialize Subsystems
    this.credentialStore = new CredentialStore(this.userDataPath, this.log);
    this.sessionManager = new AuthSessionManager(this.credentialStore, this.log);
    this.stateManager = new OAuthStateManager();
    this.callbackHandler = new OAuthCallbackHandler(this.stateManager, this.log);
    this.tokenService = new TokenValidationService(this.log);
    this.googleProvider = new GoogleIdentityProvider(
      this.stateManager,
      this.callbackHandler,
      this.tokenService,
      this.sessionManager,
      this.log
    );

    // Default Client ID storage
    this.clientId = '';
    this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        if (data.clientId) this.clientId = data.clientId.trim();
      }
    } catch (e) {}
  }

  saveConfig(clientId) {
    try {
      this.clientId = (clientId || '').trim();
      fs.writeFileSync(this.configPath, JSON.stringify({ clientId: this.clientId }, null, 2), 'utf8');
      this.log(`[AuthController] Saved OAuth Client ID configuration.`);
    } catch (e) {}
  }

  getUser() {
    return this.sessionManager.getUser();
  }

  getStatus() {
    return this.sessionManager.getStatus();
  }

  /**
   * Main authentication dispatcher. Supports Google OAuth, mock mode, and custom configurations.
   */
  async startAuth(mainWindow, options = {}) {
    this.cancelAuth();

    // Check if email or guest flow requested via options
    if (options.method === 'email' && options.email) {
      return this.startEmailAuth(mainWindow, options.email, options.name);
    }
    if (options.method === 'guest') {
      return this.continueAsGuest(mainWindow);
    }

    // Google Identity Provider flow
    return this.googleProvider.authenticate(mainWindow, this.clientId, options);
  }

  /**
   * Native Email Authentication Flow for Voile Browser.
   * Securely saves local profile encrypted in OS storage without third-party OAuth.
   */
  async startEmailAuth(mainWindow, email, name) {
    if (!email || !email.includes('@')) {
      this.sessionManager.setError(mainWindow, 'error', 'Please enter a valid email address.');
      return { status: 'error', error: 'Invalid email' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && name.trim()) || cleanEmail.split('@')[0];

    const emailUser = {
      name: cleanName,
      email: cleanEmail,
      picture: '',
      verifiedEmail: true,
      provider: 'email',
      isAuthenticated: true
    };

    this.sessionManager.setAuthenticated(mainWindow, emailUser, null, false);
    return { status: 'success', user: emailUser };
  }

  /**
   * Continue without an account (Guest / Privacy Mode).
   */
  continueAsGuest(mainWindow) {
    this.sessionManager.setGuestSession(mainWindow);
    return { status: 'success', mode: 'guest' };
  }

  /**
   * Graceful cancellation of any active auth request.
   */
  cancelAuth(mainWindow, message) {
    this.googleProvider.cancel(mainWindow);
    if (message) {
      this.sessionManager.setCancelled(mainWindow, message);
    }
  }

  /**
   * Log out active session and wipe encrypted credentials.
   */
  logout(mainWindow) {
    this.googleProvider.cancel();
    this.sessionManager.logout(mainWindow);
  }
}

module.exports = { AuthController };
