// src/components/auth/GoogleAuthHelper.tsx
// Voile Identity Bridge — Native Authentication & Identity Interface
// Provides secure Google OAuth 2.0 (RFC 8252 + PKCE), Email Profiles, and Guest Mode.

import React, { useState } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  LogOut, 
  ArrowLeft, 
  Shield, 
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCw,
  FlaskConical,
  Check,
  Mail,
  UserCheck,
  HelpCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface GoogleAuthHelperProps {
  onBackToBrowsing?: () => void;
  compact?: boolean;
}

export const GoogleAuthHelper: React.FC<GoogleAuthHelperProps> = ({ 
  onBackToBrowsing,
  compact = false 
}) => {
  const { 
    googleUser, 
    googleAuthStatus, 
    googleAuthError, 
    startGoogleAuth, 
    startEmailAuth,
    continueAsGuest,
    cancelGoogleAuth, 
    logoutGoogle,
    navigateTab 
  } = useBrowser();

  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('google');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [customClientId, setCustomClientId] = useState('');
  const [useSystemBrowser, setUseSystemBrowser] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleStartGoogleAuth = (isMock = false) => {
    startGoogleAuth({
      isMock,
      clientId: customClientId.trim() || undefined,
      useSystemBrowser
    });
  };

  const handleStartEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) return;
    startEmailAuth(emailInput.trim(), nameInput.trim() || undefined);
  };

  const handleGuestClick = () => {
    continueAsGuest();
    if (onBackToBrowsing) {
      onBackToBrowsing();
    } else {
      navigateTab('voile://newtab', 'New Tab');
    }
  };

  const handleSaveClientId = async () => {
    if (!customClientId.trim()) return;
    try {
      await (window as any).voileDesktop?.googleAuthSaveConfig?.(customClientId.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {}
  };

  const handleReturnToBrowsing = () => {
    if (googleAuthStatus === 'pending') {
      cancelGoogleAuth();
    }
    if (onBackToBrowsing) {
      onBackToBrowsing();
    } else {
      navigateTab('voile://newtab', 'New Tab');
    }
  };

  return (
    <div className={`w-full ${compact ? 'p-2' : 'flex-1 p-6 sm:p-10 overflow-y-auto'} bg-[#0B0F19] text-white flex flex-col items-center justify-center select-none`}>
      <div className={`w-full ${compact ? 'max-w-md' : 'max-w-xl'} bg-[#0E1524] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl`}>
        {/* Ambient atmospheric gradients */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Clean Header: Voile Identity Bridge */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-white/[0.06]">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center shadow-md shrink-0">
            <Shield className="w-6 h-6 text-sky-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Voile Identity Bridge</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                RFC 8252
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Secure desktop authentication and local encrypted identity management.
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* STATE 1: ALREADY AUTHENTICATED                           */}
        {/* ======================================================== */}
        {googleUser && googleUser.isAuthenticated ? (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {googleUser.provider === 'guest' 
                      ? 'Guest session active' 
                      : 'Identity connected successfully.'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {googleUser.provider || 'Google'}
                </span>
              </div>

              <div className="flex items-center gap-3.5 pt-1">
                {googleUser.picture ? (
                  <img 
                    src={googleUser.picture} 
                    alt={googleUser.name} 
                    className="w-12 h-12 rounded-full border border-emerald-400/30 object-cover shrink-0" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-base shrink-0">
                    {googleUser.name ? googleUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white truncate">{googleUser.name}</h3>
                    {googleUser.isDiagnostic && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium">
                        Simulated Test
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 truncate">{googleUser.email}</p>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400/90">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      {googleUser.provider === 'guest' 
                        ? 'Temporary memory-only session (Zero persistent data)' 
                        : 'Credentials encrypted via OS DPAPI Storage'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleReturnToBrowsing}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Browsing</span>
              </button>
              <button
                onClick={logoutGoogle}
                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-medium border border-red-500/20 transition-all flex items-center gap-2 ml-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : googleAuthStatus === 'pending' ? (
          /* ======================================================== */
          /* STATE 2: LOADING / CONNECTING                             */
          /* ======================================================== */
          <div className="space-y-6 py-4 text-center">
            <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-sky-500/20 border-t-sky-400 animate-spin" />
              <Shield className="w-6 h-6 text-sky-400" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-white">
                Connecting to Google...
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Please complete authorization in the secure authentication window. Voile is securely awaiting the loopback callback.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={cancelGoogleAuth}
                className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all"
              >
                Cancel Sign-In
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* STATE 3: READY TO SIGN IN / IDENTITY CHOOSER              */
          /* ======================================================== */
          <div className="space-y-5">
            {/* Tab Selection: Google Account vs Email Profile */}
            <div className="flex rounded-xl bg-black/40 border border-white/5 p-1">
              <button
                type="button"
                onClick={() => setAuthMethod('google')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  authMethod === 'google' 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Google Multi-color G */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google Account</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  authMethod === 'email' 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>Email Profile</span>
              </button>
            </div>

            {/* Error / Cancellation Banners */}
            {googleAuthStatus === 'cancelled' && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Sign-in was cancelled. You can try again.</span>
                </div>
                <button
                  onClick={() => handleStartGoogleAuth(false)}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px] font-medium text-white transition-all flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {googleAuthStatus === 'config_error' && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-amber-300">Google OAuth configuration requires attention.</div>
                    <div className="text-[11px] text-amber-200/80 mt-1 leading-relaxed">
                      {googleAuthError || 'Google requires a registered Desktop Client ID in Google Cloud Console to complete OAuth 2.0 authentication.'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => setShowDiagnostics(true)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-medium transition-all"
                  >
                    Configure Client ID
                  </button>
                  <button
                    onClick={() => setAuthMethod('email')}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[11px] font-medium transition-all"
                  >
                    Use Email Instead
                  </button>
                  <button
                    onClick={handleGuestClick}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-medium transition-all"
                  >
                    Continue as Guest
                  </button>
                </div>
              </div>
            )}

            {googleAuthStatus === 'network_error' && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-300">Network connection error.</div>
                    <div className="text-[11px] text-red-200/80 mt-0.5">Please check your internet connection and try again.</div>
                  </div>
                </div>
                <button
                  onClick={() => handleStartGoogleAuth(false)}
                  className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-[11px] font-medium text-red-200 transition-all flex items-center gap-1 shrink-0"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {googleAuthStatus === 'error' && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{googleAuthError || 'Authentication could not be completed. Please try again.'}</span>
                </div>
                <button
                  onClick={() => handleStartGoogleAuth(false)}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px] font-medium text-white transition-all flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* TAB 1: GOOGLE AUTHENTICATION */}
            {authMethod === 'google' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/20 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-sky-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Standards-Based Native Security</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Voile implements Google's official <strong>RFC 8252 + PKCE</strong> authorization code flow. Your password is entered directly into Google's secure authorization window and never intercepted by webview scripts.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <button
                    onClick={() => handleStartGoogleAuth(false)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 hover:from-sky-400 hover:via-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#FFFFFF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#FFFFFF" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FFFFFF" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#FFFFFF" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button
                    onClick={handleGuestClick}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Continue without an account (Guest Mode)</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: EMAIL PROFILE */}
            {authMethod === 'email' && (
              <form onSubmit={handleStartEmailAuth} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-400">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-400">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your profile and preferences are encrypted locally using OS DPAPI. No third-party account required.
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Connect with Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGuestClick}
                    className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <span>Continue without an account</span>
                  </button>
                </div>
              </form>
            )}

            {/* Collapsible Developer Diagnostics Drawer */}
            <div className="pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className="w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-300 py-1 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3 h-3 text-slate-400" />
                  <span>Developer Diagnostics & OAuth Settings</span>
                </div>
                {showDiagnostics ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {showDiagnostics && (
                <div className="mt-3 p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-3.5 animate-fadeIn">
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Test the OAuth 2.0 PKCE loopback lifecycle or configure your Google Cloud Desktop Client ID.
                  </div>

                  {/* Diagnostic Test Mode Button */}
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartGoogleAuth(true)}
                      className="w-full py-2 px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>Run Diagnostic OAuth Lifecycle (Mock Mode)</span>
                    </button>
                    <p className="text-[10px] text-slate-500 text-center">
                      Simulates loopback token exchange and OS encryption. A test simulation is never represented as a real Google account.
                    </p>
                  </div>

                  {/* Custom Client ID Configuration */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <label className="block text-[11px] text-slate-400 font-medium">
                      Configure Google Cloud Desktop Client ID:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customClientId}
                        onChange={(e) => setCustomClientId(e.target.value)}
                        placeholder="e.g. 123456789-xyz.apps.googleusercontent.com"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#0B0F19] border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={handleSaveClientId}
                        disabled={!customClientId.trim()}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs text-white font-medium transition-all flex items-center gap-1"
                      >
                        {saveSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                        <span>{saveSuccess ? 'Saved' : 'Save'}</span>
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500 space-y-0.5 pt-1">
                      <div>1. Open Google Cloud Console &gt; APIs &amp; Services &gt; Credentials.</div>
                      <div>2. Create OAuth client ID with Application type: <strong>Desktop App</strong>.</div>
                      <div>3. Paste the generated client ID above and click Save.</div>
                    </div>
                  </div>

                  {/* External System Browser Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[11px] text-slate-400">Launch in System Browser</span>
                    <input
                      type="checkbox"
                      checked={useSystemBrowser}
                      onChange={(e) => setUseSystemBrowser(e.target.checked)}
                      className="rounded bg-black/40 border-white/20 text-sky-500 focus:ring-0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Back to Browsing action */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={handleReturnToBrowsing}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                ← Return to ordinary browsing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
