// electron/auth/AuthSessionManager.cjs
// Voile Identity Bridge — Authentication Session & Lifecycle Manager

class AuthSessionManager {
  constructor(credentialStore, logFn) {
    this.credentialStore = credentialStore;
    this.log = logFn || console.log;

    this.currentUser = null;
    this.status = 'unauthenticated';
    this.lastError = null;

    this.initFromStorage();
  }

  initFromStorage() {
    try {
      const stored = this.credentialStore.loadCredentials();
      if (stored && stored.user) {
        this.currentUser = {
          ...stored.user,
          isAuthenticated: true
        };
        this.status = 'authenticated';
        this.log(`[AuthSessionManager] Restored active session for: ${this.currentUser.email} (${this.currentUser.provider || 'google'})`);
      }
    } catch (e) {
      this.currentUser = null;
      this.status = 'unauthenticated';
    }
  }

  getUser() {
    return this.currentUser ? { ...this.currentUser } : null;
  }

  getStatus() {
    return {
      status: this.status,
      user: this.getUser(),
      error: this.lastError
    };
  }

  setConnecting(mainWindow, details = {}) {
    this.status = 'connecting';
    this.lastError = null;
    this.notify(mainWindow, {
      status: 'pending',
      ...details
    });
  }

  setAuthenticated(mainWindow, user, tokens = null, isDiagnostic = false) {
    const sanitizedUser = {
      name: user.name || 'Voile User',
      email: user.email || '',
      picture: user.picture || '',
      verifiedEmail: !!user.verifiedEmail,
      isAuthenticated: true,
      provider: user.provider || 'google',
      isDiagnostic: !!isDiagnostic
    };

    this.currentUser = sanitizedUser;
    this.status = 'authenticated';
    this.lastError = null;

    // Save encrypted credentials if not a temporary guest
    if (sanitizedUser.provider !== 'guest') {
      this.credentialStore.saveCredentials({
        user: sanitizedUser,
        tokens: tokens || undefined
      });
    }

    this.log(`[AuthSessionManager] Session authenticated for ${sanitizedUser.email}`);
    this.notify(mainWindow, {
      status: 'success',
      user: sanitizedUser,
      message: 'Connected successfully.'
    });
  }

  setGuestSession(mainWindow) {
    const guestUser = {
      name: 'Guest Explorer',
      email: 'guest@voile.local',
      picture: '',
      verifiedEmail: false,
      isAuthenticated: true,
      provider: 'guest'
    };

    this.currentUser = guestUser;
    this.status = 'guest';
    this.lastError = null;

    this.notify(mainWindow, {
      status: 'success',
      user: guestUser,
      message: 'Browsing as Guest. No account data stored.'
    });
  }

  setCancelled(mainWindow, message = 'Sign-in was cancelled. You can try again.') {
    this.status = 'cancelled';
    this.lastError = message;
    this.notify(mainWindow, {
      status: 'cancelled',
      error: message
    });
  }

  setError(mainWindow, statusType, errorMessage, detail = null) {
    this.status = statusType || 'error';
    this.lastError = errorMessage;
    this.notify(mainWindow, {
      status: statusType || 'error',
      error: errorMessage,
      detail: detail || undefined
    });
  }

  logout(mainWindow) {
    this.credentialStore.clear();
    this.currentUser = null;
    this.status = 'unauthenticated';
    this.lastError = null;

    this.log('[AuthSessionManager] User logged out. In-memory session and encrypted disk store wiped.');
    this.notify(mainWindow, {
      status: 'logged_out',
      user: null
    });
  }

  notify(mainWindow, payload) {
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
      mainWindow.webContents.send('google-auth-status-changed', payload);
    }
  }
}

module.exports = { AuthSessionManager };
