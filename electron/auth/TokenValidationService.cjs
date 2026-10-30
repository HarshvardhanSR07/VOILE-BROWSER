// electron/auth/TokenValidationService.cjs
// Voile Identity Bridge — Secure Token Exchange & User Profile Validation

const https = require('https');

class TokenValidationService {
  constructor(logFn) {
    this.log = logFn || console.log;
  }

  /**
   * Exchanges authorization code for OAuth tokens via HTTPS POST to Google's token endpoint.
   * @param {{ code: string, verifier: string, clientId: string, redirectUri: string }} params 
   * @returns {Promise<{ access_token: string, refresh_token?: string, expires_in?: number, id_token?: string }>}
   */
  async exchangeCode({ code, verifier, clientId, redirectUri }) {
    this.log('[TokenValidationService] Initiating token exchange with Google OAuth token endpoint.');

    const postData = new URLSearchParams({
      client_id: clientId,
      code: code,
      code_verifier: verifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    }).toString();

    const response = await this.httpsPost('oauth2.googleapis.com', '/token', postData);

    if (!response || !response.access_token) {
      const errMsg = response?.error_description || response?.error || 'Token exchange failed without access token.';
      const err = new Error(errMsg);
      err.oauthError = response?.error;
      throw err;
    }

    return response;
  }

  /**
   * Fetches and validates user profile from Google's OpenID UserInfo endpoint.
   * @param {string} accessToken 
   * @returns {Promise<{ name: string, email: string, picture: string, verifiedEmail: boolean }>}
   */
  async fetchUserInfo(accessToken) {
    this.log('[TokenValidationService] Fetching authenticated user profile from Google UserInfo endpoint.');

    const userInfo = await this.httpsGet('www.googleapis.com', '/oauth2/v3/userinfo', accessToken);

    if (!userInfo || !userInfo.email) {
      throw new Error('Google UserInfo response did not contain an email address.');
    }

    return {
      name: userInfo.name || (userInfo.email ? userInfo.email.split('@')[0] : 'Google User'),
      email: userInfo.email,
      picture: userInfo.picture || '',
      verifiedEmail: !!userInfo.email_verified
    };
  }

  httpsPost(hostname, pathStr, postData) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname,
        port: 443,
        path: pathStr,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          'Accept': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } catch (e) {
            reject(new Error(`Invalid JSON response from ${hostname}: ${body.slice(0, 100)}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(postData);
      req.end();
    });
  }

  httpsGet(hostname, pathStr, bearerToken) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname,
        port: 443,
        path: pathStr,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Accept': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } catch (e) {
            reject(new Error(`Invalid JSON response from ${hostname}: ${body.slice(0, 100)}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.end();
    });
  }
}

module.exports = { TokenValidationService };
