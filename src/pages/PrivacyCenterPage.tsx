import React, { useState } from 'react';
import { useBrowser } from '../context/BrowserContext';
import { 
  ShieldCheck, 
  Shield, 
  Lock, 
  Fingerprint, 
  Zap, 
  EyeOff, 
  ToggleRight, 
  ToggleLeft,
  CheckCircle2,
  Info,
  Sliders,
  Flame,
  Globe,
  Key,
  ShieldAlert,
  Cpu
} from 'lucide-react';

export const PrivacyCenterPage: React.FC = () => {
  const { 
    shieldsEnabled, 
    toggleShields, 
    privacyStats,
    chameleonEnabled,
    toggleChameleon,
    secretScannerEnabled,
    toggleSecretScanner,
    secretsInterceptedCount
  } = useBrowser();

  const [aggressiveBlocking, setAggressiveBlocking] = useState(true);
  const [rfpEnabled, setRfpEnabled] = useState(true);
  const [clearUrlsEnabled, setClearUrlsEnabled] = useState(true);
  const [httpsOnly, setHttpsOnly] = useState(true);
  const [cookiePartitioning, setCookiePartitioning] = useState(true);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0F19] text-white p-6 no-scrollbar">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-voile-accent" />
              <span>Voile Privacy Center & Shields</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Fine-tune built-in ad blocking, fingerprinting mitigation, and network defenses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 font-medium">
              Global Shields:
            </span>
            <button
              onClick={toggleShields}
              className="focus:outline-none"
            >
              {shieldsEnabled ? (
                <ToggleRight className="w-9 h-9 text-voile-accent" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Protection Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0E1524] border border-white/[0.08] shadow-voile-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Trackers Blocked</span>
              <Lock className="w-4 h-4 text-voile-accent" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {privacyStats.trackersBlocked}
            </div>
            <div className="text-[10.5px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Cross-site isolated</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E1524] border border-white/[0.08] shadow-voile-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Ads & Clutter Blocked</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {privacyStats.adsBlocked}
            </div>
            <div className="text-[10.5px] text-slate-400 mt-1">
              uBlock Origin filter lists
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E1524] border border-white/[0.08] shadow-voile-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Fingerprint Defenses</span>
              <Fingerprint className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {privacyStats.fingerprintsBlocked}
            </div>
            <div className="text-[10.5px] text-purple-300 mt-1">
              Canvas & Audio noise active
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E1524] border border-white/[0.08] shadow-voile-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Bandwidth Conserved</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {privacyStats.bandwidthSavedMb} MB
            </div>
            <div className="text-[10.5px] text-amber-400 mt-1">
              Faster page load times
            </div>
          </div>
        </div>

        {/* Core Shield Controls */}
        <div className="bg-[#0E1524] border border-white/[0.08] rounded-2xl p-5 shadow-voile-card space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-voile-accent" />
            <span>Defensive Protection Settings</span>
          </h3>

          <div className="divide-y divide-white/[0.06] text-xs">
            {/* Aggressive Ad Blocking */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-100">Aggressive Ad and Tracker Blocking</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Blocks third-party advertising scripts, malicious redirects, and intrusive cookie pop-up overlays.
                </p>
              </div>
              <button onClick={() => setAggressiveBlocking(!aggressiveBlocking)}>
                {aggressiveBlocking ? <ToggleRight className="w-7 h-7 text-voile-accent" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
              </button>
            </div>

            {/* RFP / Fingerprinting */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-100">Resist Fingerprinting (RFP)</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Injects subtle randomized jitter into HTML5 Canvas readbacks, WebGL vendor strings, and AudioContext APIs.
                </p>
              </div>
              <button onClick={() => setRfpEnabled(!rfpEnabled)}>
                {rfpEnabled ? <ToggleRight className="w-7 h-7 text-voile-accent" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
              </button>
            </div>

            {/* ClearURLs */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-100">ClearURLs Tracking Stripping</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Automatically strips tracking tokens (such as `utm_source`, `fbclid`, `gclid`) from links before navigation.
                </p>
              </div>
              <button onClick={() => setClearUrlsEnabled(!clearUrlsEnabled)}>
                {clearUrlsEnabled ? <ToggleRight className="w-7 h-7 text-voile-accent" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
              </button>
            </div>

            {/* Strict HTTPS */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-100">Strict HTTPS-Only Upgrades</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Upgrades all insecure HTTP requests to encrypted HTTPS and alerts before sending plaintext data.
                </p>
              </div>
              <button onClick={() => setHttpsOnly(!httpsOnly)}>
                {httpsOnly ? <ToggleRight className="w-7 h-7 text-voile-accent" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
              </button>
            </div>

            {/* Cookie Partitioning */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-100">Total Cookie Protection</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Confines each site's cookies to an isolated sandbox so trackers cannot follow you across the web.
                </p>
              </div>
              <button onClick={() => setCookiePartitioning(!cookiePartitioning)}>
                {cookiePartitioning ? <ToggleRight className="w-7 h-7 text-voile-accent" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── NEW: OMNI-ANON CHAMELEON SHIELD INTEGRATION ── */}
        <div className="bg-[#0E1524] border border-sky-500/30 rounded-2xl p-5 shadow-voile-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Omni-Anon Chameleon Anti-Fingerprint Shield (v3.0)
                </h3>
                <p className="text-xs text-slate-400">
                  Tor and Mullvad-standard anti-fingerprinting: Uniformity over randomization.
                </p>
              </div>
            </div>
            <button onClick={toggleChameleon}>
              {chameleonEnabled ? <ToggleRight className="w-8 h-8 text-sky-400" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-[#080D18] border border-white/5 space-y-1">
              <span className="font-semibold text-slate-200">Hardware Normalization</span>
              <p className="text-[11px] text-slate-400">Cores locked to 4, RAM to 8GB, platform to Win32, webdriver cleared.</p>
            </div>
            <div className="p-3 rounded-xl bg-[#080D18] border border-white/5 space-y-1">
              <span className="font-semibold text-slate-200">Spectre Timer Coarsening</span>
              <p className="text-[11px] text-slate-400">0.1ms performance.now & 100ms Date.now jitter mitigates CPU cache attacks.</p>
            </div>
            <div className="p-3 rounded-xl bg-[#080D18] border border-white/5 space-y-1">
              <span className="font-semibold text-slate-200">GPU Masking & UTC Lock</span>
              <p className="text-[11px] text-slate-400">Unmasked WebGL vendor set to Intel UHD 620; timezone spoofed to UTC.</p>
            </div>
          </div>
        </div>

        {/* ── NEW: SECURE_TRANSFER PRE-FLIGHT SECRET SCANNER ── */}
        <div className="bg-[#0E1524] border border-red-500/30 rounded-2xl p-5 shadow-voile-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Pre-Flight Secret Scanner &amp; Push Protection (from secure_transfer)
                </h3>
                <p className="text-xs text-slate-400">
                  Pre-transmission scanner blocking API keys, cloud tokens, database URIs, and private keys.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 font-mono text-xs">
                {secretsInterceptedCount} Protected
              </span>
              <button onClick={toggleSecretScanner}>
                {secretScannerEnabled ? <ToggleRight className="w-8 h-8 text-red-400" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080D18] border border-white/5 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Active client-side rules:</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              • AWS Access Keys (`AKIA...`), Google Cloud (`AIza...`), GitHub PAT (`ghp_...`), Stripe (`sk_live_...`), Slack Tokens (`xoxb-...`), RSA/EC Private Keys, and Shannon Entropy threshold analysis (&gt; 4.60).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
