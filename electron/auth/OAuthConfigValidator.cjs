// electron/auth/OAuthConfigValidator.cjs
// Voile Identity Bridge — OAuth 2.0 Configuration Validator
// Validates client IDs, client types, redirect URIs, and scopes against Google's desktop OAuth standards.

class OAuthConfigValidator {
  /**
   * Validates a Google OAuth 2.0 Client ID for desktop applications.
   * @param {string} clientId 
   * @returns {{ valid: boolean, isPlaceholder: boolean, error?: string, hint?: string }}
   */
  static validateClientId(clientId) {
    if (!clientId || typeof clientId !== 'string' || clientId.trim() === '') {
      return {
        valid: false,
        isPlaceholder: false,
        error: 'Missing OAuth Client ID.',
        hint: 'A Google Cloud Desktop Client ID is required to initiate OAuth 2.0 authentication.'
      };
    }

    const trimmed = clientId.trim();

    // Check for dummy or placeholder client IDs
    if (trimmed.includes('voilebrowserdesktopapps') || trimmed.includes('placeholder') || trimmed.includes('your-client-id')) {
      return {
        valid: false,
        isPlaceholder: true,
        error: 'OAuth Client ID is an unconfigured placeholder.',
        hint: 'Please provide a valid Google Cloud Desktop Client ID (ending in .apps.googleusercontent.com) created in Google Cloud Console.'
      };
    }

    // Google OAuth 2.0 Desktop Client ID format:
    // Usually <numeric-project-id>-<random-alphanumeric>.apps.googleusercontent.com
    const googleClientIdRegex = /^[0-9]+-[a-z0-9_-]+\.apps\.googleusercontent\.com$/i;
    if (!googleClientIdRegex.test(trimmed)) {
      return {
        valid: false,
        isPlaceholder: false,
        error: 'Malformed Google Client ID format.',
        hint: 'Google Client IDs typically look like: 1234567890-abcdefg1234567.apps.googleusercontent.com'
      };
    }

    return {
      valid: true,
      isPlaceholder: false
    };
  }

  /**
   * Validates that the loopback redirect URI conforms strictly to RFC 8252 Section 7.3.
   * @param {string} uri 
   * @returns {{ valid: boolean, error?: string }}
   */
  static validateRedirectUri(uri) {
    if (!uri) {
      return { valid: false, error: 'Redirect URI is required.' };
    }

    try {
      const parsed = new URL(uri);
      if (parsed.protocol !== 'http:') {
        return { valid: false, error: 'RFC 8252 requires HTTP scheme for loopback redirects.' };
      }
      if (parsed.hostname !== '127.0.0.1' && parsed.hostname !== '[::1]') {
        return { valid: false, error: 'Loopback redirect must bind strictly to 127.0.0.1 or [::1].' };
      }
      if (parsed.pathname !== '/oauth2callback') {
        return { valid: false, error: 'Expected pathname /oauth2callback.' };
      }
      return { valid: true };
    } catch (e) {
      return { valid: false, error: `Invalid URI: ${e.message}` };
    }
  }

  /**
   * Returns human-readable step-by-step setup instructions for GCP OAuth Desktop credentials.
   */
  static getSetupInstructions() {
    return [
      '1. Open Google Cloud Console (https://console.cloud.google.com/).',
      '2. Navigate to APIs & Services > Credentials.',
      '3. Click "+ Create Credentials" > "OAuth client ID".',
      '4. Set Application type to "Desktop App" and name it "Voile Browser".',
      '5. Copy the generated Client ID and paste it in Voile Developer Diagnostics.'
    ];
  }
}

module.exports = { OAuthConfigValidator };
