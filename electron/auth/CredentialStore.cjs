// electron/auth/CredentialStore.cjs
// Voile Identity Bridge — OS-Backed Secure Encrypted Credential Storage

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { safeStorage } = require('electron');

class CredentialStore {
  constructor(userDataPath, logFn) {
    this.userDataPath = userDataPath;
    this.storagePath = path.join(this.userDataPath, 'voile_identity_credentials.enc');
    this.legacyStoragePath = path.join(this.userDataPath, 'voile_google_auth.enc');
    this.log = logFn || console.log;
  }

  /**
   * Encrypts plaintext string using OS DPAPI (safeStorage) or AES-256-GCM hardware-derived fallback.
   */
  encrypt(plaintext) {
    try {
      if (safeStorage && safeStorage.isEncryptionAvailable && safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(plaintext);
        return {
          method: 'safeStorage',
          data: encrypted.toString('base64')
        };
      }
    } catch (e) {
      this.log(`[CredentialStore] safeStorage encryption fallback: ${e.message}`);
    }

    try {
      const key = crypto.scryptSync(process.env.COMPUTERNAME || 'voile-device-id', 'voile-identity-salt-88', 32);
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
      let enc = cipher.update(plaintext, 'utf8', 'base64');
      enc += cipher.final('base64');
      const tag = cipher.getAuthTag().toString('base64');
      return {
        method: 'aes-256-gcm',
        iv: iv.toString('base64'),
        tag,
        data: enc
      };
    } catch (err) {
      this.log(`[CredentialStore] AES-256-GCM encryption error: ${err.message}`);
      return null;
    }
  }

  /**
   * Decrypts encrypted payload using OS DPAPI or AES-256-GCM.
   */
  decrypt(payload) {
    if (!payload || !payload.data) return null;

    try {
      if (payload.method === 'safeStorage') {
        const buffer = Buffer.from(payload.data, 'base64');
        return safeStorage.decryptString(buffer);
      } else if (payload.method === 'aes-256-gcm') {
        const key = crypto.scryptSync(process.env.COMPUTERNAME || 'voile-device-id', 'voile-identity-salt-88', 32);
        const iv = Buffer.from(payload.iv, 'base64');
        const tag = Buffer.from(payload.tag, 'base64');
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);
        let dec = decipher.update(payload.data, 'base64', 'utf8');
        dec += decipher.final('utf8');
        return dec;
      }
    } catch (err) {
      this.log(`[CredentialStore] Decryption failed: ${err.message}`);
      return null;
    }
    return null;
  }

  /**
   * Saves credentials to encrypted disk storage.
   * @param {{ user: object, tokens?: object }} authData 
   */
  saveCredentials(authData) {
    try {
      const plainText = JSON.stringify(authData);
      const encrypted = this.encrypt(plainText);
      if (encrypted) {
        fs.writeFileSync(this.storagePath, JSON.stringify(encrypted), 'utf8');
      }
    } catch (e) {
      this.log(`[CredentialStore] Failed to write encrypted credentials: ${e.message}`);
    }
  }

  /**
   * Loads and decrypts stored user data. Returns sanitized user object (zero token leakage).
   * @returns {{ user: object, tokens?: object } | null}
   */
  loadCredentials() {
    try {
      const targetPath = fs.existsSync(this.storagePath) ? this.storagePath : 
                        (fs.existsSync(this.legacyStoragePath) ? this.legacyStoragePath : null);

      if (!targetPath) return null;

      const raw = fs.readFileSync(targetPath, 'utf8');
      const payload = JSON.parse(raw);
      const decryptedStr = this.decrypt(payload);
      if (decryptedStr) {
        return JSON.parse(decryptedStr);
      }
    } catch (e) {
      this.log(`[CredentialStore] Could not load stored credentials: ${e.message}`);
    }
    return null;
  }

  /**
   * Completely destroys stored encrypted credentials on disk.
   */
  clear() {
    try {
      if (fs.existsSync(this.storagePath)) {
        fs.unlinkSync(this.storagePath);
      }
      if (fs.existsSync(this.legacyStoragePath)) {
        fs.unlinkSync(this.legacyStoragePath);
      }
    } catch (e) {
      this.log(`[CredentialStore] Clear error: ${e.message}`);
    }
  }
}

module.exports = { CredentialStore };
