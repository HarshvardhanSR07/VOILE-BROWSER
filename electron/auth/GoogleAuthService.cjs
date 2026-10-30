// electron/auth/GoogleAuthService.cjs
// Voile Identity Bridge — Backward-Compatible Service Wrapper
// Delegates all authentication operations to the modular AuthController subsystems.

const { AuthController } = require('./AuthController.cjs');
const { OAuthStateManager } = require('./OAuthStateManager.cjs');
const { OAuthConfigValidator } = require('./OAuthConfigValidator.cjs');

class GoogleAuthService {
  constructor(app, logFn) {
    this.controller = new AuthController(app, logFn);
    this.app = app;
    this.log = logFn || console.log;
    this.storagePath = this.controller.credentialStore.storagePath;
  }

  get clientId() {
    return this.controller.clientId;
  }

  set clientId(val) {
    this.controller.clientId = val;
  }

  get pendingAuth() {
    return this.controller.googleProvider.activeWindow || this.controller.callbackHandler.server;
  }

  loadConfig() {
    this.controller.loadConfig();
  }

  saveConfig(clientId) {
    this.controller.saveConfig(clientId);
  }

  generatePKCE() {
    return this.controller.stateManager.createSession();
  }

  getUser() {
    return this.controller.getUser();
  }

  getStatus() {
    return this.controller.getStatus();
  }

  async startAuth(mainWindow, options = {}) {
    return this.controller.startAuth(mainWindow, options);
  }

  async startEmailAuth(mainWindow, email, name) {
    return this.controller.startEmailAuth(mainWindow, email, name);
  }

  continueAsGuest(mainWindow) {
    return this.controller.continueAsGuest(mainWindow);
  }

  cancelAuth(mainWindow, customMessage) {
    this.controller.cancelAuth(mainWindow, customMessage);
  }

  logout(mainWindow) {
    this.controller.logout(mainWindow);
  }

  cleanupServer() {
    this.controller.googleProvider.closeWindow();
    this.controller.callbackHandler.stop();
    this.controller.stateManager.clearSession();
  }
}

module.exports = {
  GoogleAuthService,
  AuthController,
  OAuthConfigValidator,
  OAuthStateManager
};
