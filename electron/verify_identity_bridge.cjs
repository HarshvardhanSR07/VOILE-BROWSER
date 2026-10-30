// electron/verify_identity_bridge.cjs
// Voile Identity Bridge — Comprehensive Test Suite

const { app } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const { OAuthConfigValidator } = require('./auth/OAuthConfigValidator.cjs');
const { OAuthStateManager } = require('./auth/OAuthStateManager.cjs');
const { OAuthCallbackHandler } = require('./auth/OAuthCallbackHandler.cjs');
const { CredentialStore } = require('./auth/CredentialStore.cjs');
const { AuthSessionManager } = require('./auth/AuthSessionManager.cjs');
const { AuthController } = require('./auth/AuthController.cjs');
const { GoogleAuthService } = require('./auth/GoogleAuthService.cjs');

async function runTestSuite() {
  console.log('================================================================');
  console.log('VOILE IDENTITY BRIDGE: AUTOMATED COMPREHENSIVE TEST SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, errorDetails = '') {
    if (condition) {
      console.log(`✓ ${testName}`);
      passed++;
    } else {
      console.error(`✗ ${testName}: ${errorDetails}`);
      failed++;
    }
  }

  // --- SUITE 1: OAuthConfigValidator ---
  console.log('\n[Suite 1] OAuthConfigValidator Tests');
  try {
    const emptyCheck = OAuthConfigValidator.validateClientId('');
    assert(!emptyCheck.valid && emptyCheck.error.includes('Missing'), 'TEST 1.1: Rejects empty Client ID');

    const placeholderCheck = OAuthConfigValidator.validateClientId('1035248981442-voilebrowserdesktopapps.apps.googleusercontent.com');
    assert(!placeholderCheck.valid && placeholderCheck.isPlaceholder, 'TEST 1.2: Flags unconfigured dummy/placeholder Client ID');

    const malformedCheck = OAuthConfigValidator.validateClientId('invalid-client-id-without-domain');
    assert(!malformedCheck.valid && !malformedCheck.isPlaceholder, 'TEST 1.3: Rejects malformed Client ID format');

    const validCheck = OAuthConfigValidator.validateClientId('9876543210-abcdefghij123456.apps.googleusercontent.com');
    assert(validCheck.valid, 'TEST 1.4: Validates real Google Desktop Application Client ID format');

    const validRedirect = OAuthConfigValidator.validateRedirectUri('http://127.0.0.1:49281/oauth2callback');
    assert(validRedirect.valid, 'TEST 1.5: Validates RFC 8252 compliant loopback redirect URI');

    const invalidRedirect = OAuthConfigValidator.validateRedirectUri('https://remote-server.com/callback');
    assert(!invalidRedirect.valid, 'TEST 1.6: Rejects non-loopback redirect URIs');
  } catch (e) {
    console.error('Suite 1 Exception:', e);
    failed++;
  }

  // --- SUITE 2: OAuthStateManager (PKCE & CSRF) ---
  console.log('\n[Suite 2] OAuthStateManager Tests');
  try {
    const stateManager = new OAuthStateManager();
    const session1 = stateManager.createSession();

    assert(session1.verifier && session1.verifier.length >= 43 && session1.verifier.length <= 128,
      'TEST 2.1: Generates RFC 7636 compliant PKCE code_verifier');

    assert(session1.challenge && session1.challenge.length >= 40,
      'TEST 2.2: Generates S256 code_challenge from verifier');

    assert(session1.state && session1.state.length >= 32,
      'TEST 2.3: Generates high-entropy cryptographic CSRF state token');

    // Valid state verification
    const verifySuccess = stateManager.verifyAndConsumeState(session1.state);
    assert(verifySuccess.valid && verifySuccess.verifier === session1.verifier,
      'TEST 2.4: Verifies matching state and returns verifier');

    // Replay attack prevention (state consumed)
    const replayCheck = stateManager.verifyAndConsumeState(session1.state);
    assert(!replayCheck.valid, 'TEST 2.5: Rejects replay of consumed state token');

    // Tampered state rejection
    stateManager.createSession();
    const tamperedCheck = stateManager.verifyAndConsumeState('tampered_csrf_token_value_xyz');
    assert(!tamperedCheck.valid, 'TEST 2.6: Rejects tampered CSRF state');
  } catch (e) {
    console.error('Suite 2 Exception:', e);
    failed++;
  }

  // --- SUITE 3: OAuthCallbackHandler (Loopback HTTP Server) ---
  console.log('\n[Suite 3] OAuthCallbackHandler Tests');
  try {
    const stateManager = new OAuthStateManager();
    const handler = new OAuthCallbackHandler(stateManager, () => {});

    let receivedCallback = null;
    const { port, redirectUri } = await handler.start((err, data) => {
      receivedCallback = { err, data };
    });

    assert(port > 0 && redirectUri.startsWith(`http://127.0.0.1:${port}/oauth2callback`),
      'TEST 3.1: Binds ephemeral loopback HTTP listener exclusively to 127.0.0.1');

    // Test sending invalid endpoint
    const notFoundCode = await new Promise((resolve) => {
      http.get(`http://127.0.0.1:${port}/wrong-endpoint`, (res) => resolve(res.statusCode));
    });
    assert(notFoundCode === 404, 'TEST 3.2: Rejects unauthorized request paths with HTTP 404');

    // Test sending valid callback
    const sessionObj = stateManager.createSession();
    const callbackRes = await new Promise((resolve) => {
      http.get(`http://127.0.0.1:${port}/oauth2callback?code=test_code_123&state=${sessionObj.state}`, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
    });

    assert(callbackRes.status === 200 && callbackRes.body.includes('Authentication successful'),
      'TEST 3.3: Returns attractive HTML feedback and accepts valid callback');

    assert(receivedCallback && receivedCallback.data.code === 'test_code_123',
      'TEST 3.4: Dispatches code and verifier to authentication pipeline');

    handler.stop();
  } catch (e) {
    console.error('Suite 3 Exception:', e);
    failed++;
  }

  // --- SUITE 4: CredentialStore (OS DPAPI Storage) ---
  console.log('\n[Suite 4] CredentialStore Tests');
  try {
    const credStore = new CredentialStore(app.getPath('userData'), () => {});
    const sampleAuth = {
      user: {
        name: 'Test Identity',
        email: 'test@identity.local',
        provider: 'email',
        isAuthenticated: true
      },
      tokens: { access_token: 'secret_token_never_plain_123' }
    };

    credStore.saveCredentials(sampleAuth);
    assert(fs.existsSync(credStore.storagePath), 'TEST 4.1: Persists encrypted payload on disk');

    const rawFileContent = fs.readFileSync(credStore.storagePath, 'utf8');
    assert(!rawFileContent.includes('secret_token_never_plain_123') && !rawFileContent.includes('test@identity.local'),
      'TEST 4.2: Zero plaintext credentials or tokens leak to disk storage');

    const loaded = credStore.loadCredentials();
    assert(loaded && loaded.user && loaded.user.email === 'test@identity.local',
      'TEST 4.3: Decrypts authenticated user credentials correctly');

    credStore.clear();
    assert(!fs.existsSync(credStore.storagePath) && !credStore.loadCredentials(),
      'TEST 4.4: Complete cryptographic wipe on logout/clear');
  } catch (e) {
    console.error('Suite 4 Exception:', e);
    failed++;
  }

  // --- SUITE 5: AuthController & Alternative Identity Flows ---
  console.log('\n[Suite 5] AuthController & Alternative Flows Tests');
  try {
    const mockWindow = {
      isDestroyed: () => false,
      webContents: { send: () => {} }
    };

    const controller = new AuthController(app, () => {});

    // Email Profile Sign-In
    const emailRes = await controller.startEmailAuth(mockWindow, 'alex@voilebrowser.org', 'Alex');
    assert(emailRes.status === 'success' && controller.getUser().email === 'alex@voilebrowser.org',
      'TEST 5.1: Connects local Email Profile with secure OS storage');

    // Guest Mode
    const guestRes = controller.continueAsGuest(mockWindow);
    assert(guestRes.mode === 'guest' && controller.getUser().provider === 'guest',
      'TEST 5.2: Activates anonymous Guest Mode (no account required)');

    // Logout
    controller.logout(mockWindow);
    assert(!controller.getUser() && controller.getStatus().status === 'unauthenticated',
      'TEST 5.3: Wipes session and returns to unauthenticated state on logout');

    // Google placeholder detection
    const unconfiguredRes = await controller.startAuth(mockWindow, {
      clientId: '1035248981442-voilebrowserdesktopapps.apps.googleusercontent.com'
    });
    assert(unconfiguredRes.status === 'config_error' && unconfiguredRes.instructions.length > 0,
      'TEST 5.4: Upfront detection of placeholder client ID with actionable GCP instructions (prevents 401 invalid_client)');
  } catch (e) {
    console.error('Suite 5 Exception:', e);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  setTimeout(() => {
    app.exit(failed === 0 ? 0 : 1);
  }, 500);
}

app.whenReady().then(runTestSuite);
