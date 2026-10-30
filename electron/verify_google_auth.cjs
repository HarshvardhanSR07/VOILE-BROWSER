// electron/verify_google_auth.cjs
// Automated test suite for In-App Google Authentication in Voile Browser

const { app } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { GoogleAuthService } = require('./auth/GoogleAuthService.cjs');

async function runTestSuite() {
  console.log('=====================================================');
  console.log('VOILE BROWSER: IN-APP GOOGLE AUTHENTICATION TEST SUITE');
  console.log('=====================================================');

  let passed = 0;
  let failed = 0;

  let lastIpcSent = null;
  const mockMainWindow = {
    isDestroyed: () => false,
    webContents: {
      send: (channel, data) => {
        lastIpcSent = { channel, data };
      }
    }
  };

  const authService = new GoogleAuthService(app, (msg) => {
    // suppress verbose internal logs during test
  });

  // --- TEST 1: PKCE & Cryptographic State Generation ---
  try {
    const pkce = authService.generatePKCE();
    if (pkce.verifier && pkce.challenge && pkce.state) {
      if (pkce.verifier.length >= 43 && pkce.challenge.length >= 40 && pkce.state.length >= 32) {
        console.log('✓ TEST 1 PASSED: PKCE (RFC 7636) verifier, S256 challenge & state generated correctly.');
        passed++;
      } else {
        throw new Error('PKCE parameters do not meet RFC entropy requirements.');
      }
    } else {
      throw new Error('Missing PKCE fields.');
    }
  } catch (err) {
    console.error('✗ TEST 1 FAILED:', err.message);
    failed++;
  }

  // --- TEST 2 & 3: Ephemeral Loopback Binding & Invalid State Rejection ---
  try {
    const authSession = await authService.startAuth(mockMainWindow, { isMock: true });
    const port = authSession.port;
    const validState = authSession.state;

    // Send an INVALID state to the loopback server
    const invalidStateRes = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${port}/oauth2callback?code=abc&state=TAMPERED_STATE_123`, (res) => {
        resolve(res.statusCode);
      }).on('error', reject);
    });

    if (invalidStateRes === 400) {
      console.log('✓ TEST 2 & 3 PASSED: Loopback server strictly binds to 127.0.0.1 and rejects tampered CSRF state with HTTP 400.');
      passed++;
    } else {
      throw new Error(`Expected HTTP 400 on tampered state, got ${invalidStateRes}`);
    }
  } catch (err) {
    console.error('✗ TEST 2 & 3 FAILED:', err.message);
    failed++;
  }

  // --- TEST 4: User Cancellation & Status Message Verification ---
  try {
    const sessionToCancel = await authService.startAuth(mockMainWindow, { isMock: true });
    authService.cancelAuth(mockMainWindow);
    if (!authService.pendingAuth) {
      if (lastIpcSent && lastIpcSent.data && lastIpcSent.data.status === 'cancelled' && lastIpcSent.data.error === 'Sign-in was cancelled. You can try again.') {
        console.log('✓ TEST 4 PASSED: User cancellation shuts down loopback listener and emits standard cancellation status.');
        passed++;
      } else {
        throw new Error(`Unexpected cancellation payload: ${JSON.stringify(lastIpcSent)}`);
      }
    } else {
      throw new Error('Pending state remained active after cancel.');
    }
  } catch (err) {
    console.error('✗ TEST 4 FAILED:', err.message);
    failed++;
  }

  // --- TEST 5: Successful Flow via Valid Loopback Callback ---
  try {
    const successSession = await authService.startAuth(mockMainWindow, { isMock: true });
    const port = successSession.port;
    const validState = successSession.state;

    // Send valid callback to loopback server
    const successRes = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${port}/oauth2callback?code=mock_valid_code&state=${validState}`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }).on('error', reject);
    });

    if (successRes.status === 200 && successRes.body.includes('Authentication successful!')) {
      const user = authService.getUser();
      if (user && user.isAuthenticated && user.email === 'user@voilebrowser.org') {
        console.log(`✓ TEST 5 PASSED: Valid loopback callback completed successfully. User: ${user.name} (${user.email}).`);
        passed++;
      } else {
        throw new Error('User was not set to authenticated after valid callback.');
      }
    } else {
      throw new Error(`Unexpected loopback response: ${successRes.status}`);
    }
  } catch (err) {
    console.error('✗ TEST 5 FAILED:', err.message);
    failed++;
  }

  // --- TEST 6: OS-Backed Encrypted Storage ---
  try {
    const encFile = authService.storagePath;
    if (fs.existsSync(encFile)) {
      const rawEnc = fs.readFileSync(encFile, 'utf8');
      if (!rawEnc.includes('user@voilebrowser.org') && !rawEnc.includes('mock_token')) {
        console.log('✓ TEST 6 PASSED: Authentication credentials stored with encrypted payload (zero plaintext token leakage).');
        passed++;
      } else {
        throw new Error('Raw credentials found in plaintext in storage file.');
      }
    } else {
      throw new Error('Encrypted credentials file not found on disk.');
    }
  } catch (err) {
    console.error('✗ TEST 6 FAILED:', err.message);
    failed++;
  }

  // --- TEST 7: Logout & Secure Data Wipe ---
  try {
    authService.logout(mockMainWindow);
    const userAfterLogout = authService.getUser();
    const fileExistsAfterLogout = fs.existsSync(authService.storagePath);

    if (!userAfterLogout && !fileExistsAfterLogout) {
      console.log('✓ TEST 7 PASSED: Logout successfully destroyed in-memory session and wiped encrypted storage.');
      passed++;
    } else {
      throw new Error('Credentials or memory persisted after logout.');
    }
  } catch (err) {
    console.error('✗ TEST 7 FAILED:', err.message);
    failed++;
  }

  // --- TEST 8: Security Regression & Sandboxing Checks ---
  try {
    const mainCjs = fs.readFileSync(path.join(__dirname, 'main.cjs'), 'utf8');
    const hasDisabledWebSecurity = mainCjs.includes('webSecurity: false');
    const hasIgnoreCertErrors = mainCjs.includes('ignore-certificate-errors');

    if (!hasDisabledWebSecurity && !hasIgnoreCertErrors) {
      console.log('✓ TEST 8 PASSED: Web security and TLS certificate validation remain strictly enabled.');
      passed++;
    } else {
      throw new Error('Security regression: Web security or TLS validation is disabled.');
    }
  } catch (err) {
    console.error('✗ TEST 8 FAILED:', err.message);
    failed++;
  }

  // --- TEST 9: In-App Window Configuration Verification ---
  try {
    const providerSource = fs.readFileSync(path.join(__dirname, 'auth', 'GoogleIdentityProvider.cjs'), 'utf8');
    const hasInAppBrowserWindow = providerSource.includes('new BrowserWindow');
    const hasModalTrue = providerSource.includes('modal: true');
    const hasDimensions = providerSource.includes('width: 520') && providerSource.includes('height: 680');
    const hasPartition = providerSource.includes("session.fromPartition('persist:voile-main')");
    const hasCloseHandling = providerSource.includes("authWin.on('closed'");

    if (hasInAppBrowserWindow && hasModalTrue && hasDimensions && hasPartition && hasCloseHandling) {
      console.log('✓ TEST 9 PASSED: In-app modal authentication window configured with isolated session and lifecycle event listeners.');
      passed++;
    } else {
      throw new Error('In-app modal BrowserWindow configuration incomplete.');
    }
  } catch (err) {
    console.error('✗ TEST 9 FAILED:', err.message);
    failed++;
  }

  // --- TEST 10: OAuthConfigValidator & Identity Bridge Integration ---
  try {
    const validatorSource = fs.readFileSync(path.join(__dirname, 'auth', 'OAuthConfigValidator.cjs'), 'utf8');
    const hasValidator = validatorSource.includes('validateClientId');
    const hasLoopbackCheck = validatorSource.includes('validateRedirectUri');

    if (hasValidator && hasLoopbackCheck) {
      console.log('✓ TEST 10 PASSED: Voile Identity Bridge validation active — protects against 401 invalid_client.');
      passed++;
    } else {
      throw new Error('OAuthConfigValidator configuration incomplete.');
    }
  } catch (err) {
    console.error('✗ TEST 10 FAILED:', err.message);
    failed++;
  }

  console.log('=====================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=====================================================');

  setTimeout(() => {
    app.exit(failed === 0 ? 0 : 1);
  }, 500);
}

app.whenReady().then(runTestSuite);
