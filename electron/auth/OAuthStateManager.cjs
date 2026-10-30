// electron/auth/OAuthStateManager.cjs
// Voile Identity Bridge — Cryptographic OAuth State & PKCE Manager (RFC 7636 + RFC 8252)

const crypto = require('crypto');

class OAuthStateManager {
  constructor() {
    this.activeSession = null;
  }

  /**
   * Base64-URL encoder according to RFC 7636 / RFC 4648 Section 5.
   * @param {Buffer} buffer 
   * @returns {string}
   */
  base64UrlEncode(buffer) {
    return buffer.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Generates a high-entropy PKCE Code Verifier, S256 Code Challenge, and CSRF State Token.
   * Enforces a 5-minute validity window.
   * @returns {{ verifier: string, challenge: string, state: string, expiresAt: number }}
   */
  createSession() {
    // 64 random bytes -> 86 chars URL-safe verifier (RFC 7636 Section 4.1 mandates 43-128 chars)
    const verifier = this.base64UrlEncode(crypto.randomBytes(64));

    // S256 code_challenge = BASE64URL(SHA256(ASCII(code_verifier)))
    const challenge = this.base64UrlEncode(
      crypto.createHash('sha256').update(verifier).digest()
    );

    // High-entropy 64-char hex CSRF state parameter
    const state = crypto.randomBytes(32).toString('hex');

    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minute expiry

    this.activeSession = {
      verifier,
      challenge,
      state,
      expiresAt
    };

    return {
      verifier,
      challenge,
      state,
      expiresAt
    };
  }

  /**
   * Validates received CSRF state against the active session and checks for expiration.
   * Destroys the state on verification to prevent replay attacks.
   * @param {string} receivedState 
   * @returns {{ valid: boolean, error?: string, verifier?: string }}
   */
  verifyAndConsumeState(receivedState) {
    if (!this.activeSession) {
      return { valid: false, error: 'No active authentication session found.' };
    }

    if (Date.now() > this.activeSession.expiresAt) {
      this.clearSession();
      return { valid: false, error: 'Authentication session expired. Please try again.' };
    }

    if (!receivedState || typeof receivedState !== 'string') {
      this.clearSession();
      return { valid: false, error: 'Missing OAuth state parameter in callback.' };
    }

    // Timing-safe comparison to prevent timing attacks
    const expectedBuf = Buffer.from(this.activeSession.state);
    const receivedBuf = Buffer.from(receivedState);

    let isMatch = false;
    if (expectedBuf.length === receivedBuf.length) {
      isMatch = crypto.timingSafeEqual(expectedBuf, receivedBuf);
    }

    if (!isMatch) {
      this.clearSession();
      return { valid: false, error: 'Security validation failed: CSRF state parameter mismatch.' };
    }

    const verifier = this.activeSession.verifier;
    this.clearSession();

    return {
      valid: true,
      verifier
    };
  }

  getActiveVerifier() {
    return this.activeSession ? this.activeSession.verifier : null;
  }

  clearSession() {
    this.activeSession = null;
  }
}

module.exports = { OAuthStateManager };
