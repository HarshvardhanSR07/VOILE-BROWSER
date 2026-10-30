import React, { useState } from 'react';
import { useBrowser } from '../context/BrowserContext';
import { VoileLogo } from '../components/common/VoileLogo';
import { 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  Bookmark, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Terminal, 
  Download, 
  ExternalLink,
  Lock,
  Globe,
  Radio,
  Copy,
  Check,
  ToggleRight,
  ToggleLeft,
  Flame,
  Bot
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const { 
    shieldsEnabled, 
    toggleShields, 
    navigateTab, 
    openNewTab,
    privacyStats
  } = useBrowser();

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Live state for the 4 privacy toggles shown in the diagram
  const [adBlocking, setAdBlocking] = useState(true);
  const [clearUrls, setClearUrls] = useState(true);
  const [fingerprint, setFingerprint] = useState(true);
  const [startpageSearch, setStartpageSearch] = useState(true);

  // AdaL permission alert test state
  const [permissionBlocked, setPermissionBlocked] = useState<boolean | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#070A12] text-white p-6 no-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 text-xs font-mono text-voile-accent mb-1.5">
            <span>03 · ARCHITECTURE</span>
            <span>•</span>
            <span className="text-slate-400">ENGINEERING SPECIFICATION</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>Built Layer by Layer</span>
            <span className="text-xs font-normal px-2.5 py-1 rounded-full bg-voile-accent/10 border border-voile-accent/30 text-voile-accent">
              Interactive System Map
            </span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            A privacy-first browser companion, combining a secure core, modular services, and a seamless user experience.
          </p>
        </div>

        {/* ── LAYER 1: VOILE INTERFACE (TOP UI LAYER) ── */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0E1524] via-[#111A30] to-[#0E1524] border border-voile-accent/30 shadow-[0_0_35px_rgba(56,189,248,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-40 bg-voile-accent/[0.05] blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-voile-accent/20 border border-voile-accent/40 flex items-center justify-center">
                  <VoileLogo className="w-6 h-6" glow={false} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Voile Interface</h2>
                  <span className="text-xs font-mono text-voile-accent uppercase tracking-wider">
                    BROWSER EXTENSION (UI LAYER)
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  React 19
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-medium">
                  TypeScript
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-medium">
                  Vite 6
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-medium">
                  Tailwind CSS
                </span>
              </div>

              {/* Bullet Points */}
              <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Clean & minimal UI with custom layered wave aesthetic</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-time privacy insights & Shields telemetry</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Modular three-column collapsible panel structure</span>
                </li>
              </ul>
            </div>

            {/* Mockup Preview Card */}
            <div className="w-full lg:w-72 p-4 rounded-2xl bg-[#080D18] border border-white/10 shadow-2xl shrink-0">
              <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
                <div className="flex items-center gap-1.5">
                  <VoileLogo className="w-4 h-4" glow={false} />
                  <span className="text-xs font-semibold text-white">Voile</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="flex flex-col items-center text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-voile-accent/20 border border-voile-accent/40 flex items-center justify-center text-voile-accent mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-white">You're Protected &gt;</span>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-voile-accent to-voile-indigo h-full w-[88%]" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-1">Shields 100% active</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── LAYER 2: THREE MODULAR SERVICES ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Privacy Layer Card */}
          <div className="p-5 rounded-3xl bg-[#0E1524] border border-purple-500/30 flex flex-col justify-between shadow-voile-card">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Privacy layer</h3>
                  <span className="text-[10px] font-mono text-purple-400">DEFENSIVE BARRIER</span>
                </div>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-300 mb-4">
                <li>• uBlock Origin filter engine integration</li>
                <li>• ClearURLs token stripper</li>
                <li>• Startpage (private search without logging)</li>
                <li>• Canvas & AudioContext fingerprint noise</li>
                <li>• Zero-telemetry audit verified</li>
              </ul>
            </div>

            {/* Interactive Widget Box */}
            <div className="p-3.5 rounded-2xl bg-[#080D18] border border-white/10 space-y-2.5 text-xs">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Privacy Protection
              </span>

              <div className="flex items-center justify-between">
                <span className="text-slate-200 text-[11px] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  Ad &amp; Tracker Blocking
                </span>
                <button onClick={() => setAdBlocking(!adBlocking)}>
                  {adBlocking ? <ToggleRight className="w-6 h-6 text-purple-400" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-200 text-[11px] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  ClearURLs
                </span>
                <button onClick={() => setClearUrls(!clearUrls)}>
                  {clearUrls ? <ToggleRight className="w-6 h-6 text-purple-400" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-200 text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Fingerprint Protection
                </span>
                <button onClick={() => setFingerprint(!fingerprint)}>
                  {fingerprint ? <ToggleRight className="w-6 h-6 text-purple-400" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-200 text-[11px] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  Private Search (Startpage)
                </span>
                <button onClick={() => setStartpageSearch(!startpageSearch)}>
                  {startpageSearch ? <ToggleRight className="w-6 h-6 text-purple-400" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
                </button>
              </div>
            </div>
          </div>

          {/* 2. AdaL Companion Card */}
          <div className="p-5 rounded-3xl bg-[#0E1524] border border-voile-accent/30 flex flex-col justify-between shadow-voile-card">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 rounded-xl bg-voile-accent/20 text-voile-accent border border-voile-accent/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">AdaL companion</h3>
                  <span className="text-[10px] font-mono text-voile-accent">LOCAL AI AGENT</span>
                </div>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-300 mb-4">
                <li>• AI side panel assistant</li>
                <li>• Explains permissions & risks</li>
                <li>• Privacy recommendations</li>
                <li>• Local-first client processing</li>
              </ul>
            </div>

            {/* Interactive Mockup Widget */}
            <div className="p-3.5 rounded-2xl bg-[#080D18] border border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-voile-accent font-semibold text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AdaL Security Alert</span>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug">
                This site is requesting your location. Do you want to block it?
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setPermissionBlocked(true)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                    permissionBlocked === true
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-600/70 hover:bg-purple-600 text-white'
                  }`}
                >
                  Block
                </button>
                <button
                  onClick={() => setPermissionBlocked(false)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    permissionBlocked === false
                      ? 'bg-white/20 text-white border-white/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  Allow
                </button>
              </div>

              {permissionBlocked !== null && (
                <div className="text-[10px] text-emerald-400 font-mono pt-1 text-center">
                  {permissionBlocked ? '✓ Location query rejected privately' : '⚠ Location granted for session'}
                </div>
              )}
            </div>
          </div>

          {/* 3. Bookmarks & Workspace Card */}
          <div className="p-5 rounded-3xl bg-[#0E1524] border border-pink-500/30 flex flex-col justify-between shadow-voile-card">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Bookmarks · Workspace</h3>
                  <span className="text-[10px] font-mono text-pink-400">ORGANIZATION & LAUNCHER</span>
                </div>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-300 mb-4">
                <li>• Firefox native bookmarks</li>
                <li>• Directory of privacy tools</li>
                <li>• Organize &amp; discover privacy services</li>
              </ul>
            </div>

            {/* Interactive Bookmarks Folders */}
            <div className="p-3.5 rounded-2xl bg-[#080D18] border border-white/10 space-y-1.5 text-xs">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Bookmarks
              </span>

              {[
                { name: 'Privacy Tools', count: '4' },
                { name: 'Search Engines', count: '3' },
                { name: 'Productivity', count: '5' },
                { name: 'Security', count: '2' },
              ].map((folder, i) => (
                <div
                  key={i}
                  onClick={() => navigateTab('voile://workspace', 'Voile Workspace')}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-slate-200 transition-colors"
                >
                  <span className="text-[11px] flex items-center gap-2">
                    <span>📁</span> {folder.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">&gt;</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── LAYER 3: FIREFOX CORE (BROWSER RUNTIME) ── */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0C1220] via-[#111A30] to-[#0C1220] border border-orange-500/30 shadow-[0_0_35px_rgba(249,115,22,0.1)] relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-orange-500 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">Firefox core</h2>
                <span className="text-xs font-mono text-orange-400 uppercase tracking-wider">
                  BROWSER RUNTIME (EXTENSION BASE)
                </span>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Gecko rendering engine, SpiderMonkey JavaScript engine, native process isolation, and security sandboxing.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs text-slate-300 font-mono shrink-0">
              <span className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-orange-400" /> Gecko (rendering engine)
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-orange-400" /> SpiderMonkey (JavaScript)
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-orange-400" /> Open source C++/Rust codebase
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-orange-400" /> Windows 11 x64 primary target
              </span>
            </div>
          </div>
        </div>

        {/* ── DATA & SERVICE FLOW PIPELINE ── */}
        <div className="p-6 rounded-3xl bg-[#0A0F1D] border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-voile-accent animate-pulse" />
            <h3 className="font-bold text-sm text-white">Data &amp; Service Flow</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 flex flex-col items-center">
              <span className="text-lg mb-1">🌐</span>
              <span className="font-semibold text-slate-200">Web Page</span>
              <span className="text-[10px] text-slate-400">(Visited Site)</span>
            </div>

            <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex flex-col items-center">
              <span className="text-lg mb-1">⚙️</span>
              <span className="font-semibold text-orange-300">Firefox Core</span>
              <span className="text-[10px] text-slate-400">(Processing)</span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center">
              <span className="text-lg mb-1">🛡️</span>
              <span className="font-semibold text-purple-300">Privacy Layer</span>
              <span className="text-[10px] text-slate-400">(Block / Clean)</span>
            </div>

            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex flex-col items-center">
              <span className="text-lg mb-1">🤖</span>
              <span className="font-semibold text-sky-300">AdaL Companion</span>
              <span className="text-[10px] text-slate-400">(Analyse &amp; Explain)</span>
            </div>

            <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex flex-col items-center">
              <span className="text-lg mb-1">🔖</span>
              <span className="font-semibold text-pink-300">Bookmarks</span>
              <span className="text-[10px] text-slate-400">(Save &amp; Access)</span>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400 italic pt-1">
            ↺ Feedback &amp; Insights loop back into the Privacy Layer and AdaL assistant for proactive defense.
          </div>
        </div>

        {/* ── OFFICIAL WINDOWS ENGINE BUILD GUIDE ── */}
        <div className="p-6 rounded-3xl bg-[#0E1524] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-5 h-5 text-orange-400" />
              <div>
                <h3 className="font-bold text-sm text-white">Native Firefox Engine Build on Windows</h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  firefox-source-docs.mozilla.org/setup/windows_build.html
                </span>
              </div>
            </div>
            <a
              href="https://firefox-source-docs.mozilla.org/setup/windows_build.html"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-voile-accent hover:underline flex items-center gap-1"
            >
              <span>Mozilla Docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            To compile the underlying <strong>Firefox / Gecko core</strong> on Windows 11 with your custom Voile interface, follow Mozilla's 5 official steps:
          </p>

          <div className="space-y-3 pt-2 text-xs">
            {[
              {
                step: '1. Install MozillaBuild',
                cmd: 'curl.exe -O https://ftp.mozilla.org/pub/mozilla/libraries/win32/MozillaBuildSetup-Latest.exe\nMozillaBuildSetup-Latest.exe',
                desc: 'Installs the complete self-contained Windows build environment to C:\\mozilla-build (includes MSYS bash, clang, python, and toolchains).'
              },
              {
                step: '2. Download Firefox Source & Dependencies',
                cmd: 'C:\\mozilla-build\\start-shell.bat\npython3 bootstrap.py',
                desc: 'Run start-shell.bat to enter the build environment, then execute bootstrap.py. Select option "1. Firefox for Desktop" to clone mozilla-unified.'
              },
              {
                step: '3. Configure the Build (.mozconfig)',
                cmd: 'echo "ac_add_options --enable-application=browser" >> mozconfig\necho "ac_add_options --enable-debug" >> mozconfig',
                desc: 'Create a mozconfig file in the source root to set compile flags, enable debug logging, and configure branding.'
              },
              {
                step: '4. Compile Firefox Core',
                cmd: './mach build',
                desc: 'Compiles C++, Rust, Gecko layout engine, and SpiderMonkey JavaScript runtime. Uses sccache for distributed caching.'
              },
              {
                step: '5. Launch Voile Locally Built Browser',
                cmd: './mach run',
                desc: 'Spawns the compiled Firefox binary with your custom Voile interface extension loaded.'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#080D18] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{item.step}</span>
                  <button
                    onClick={() => copyToClipboard(item.cmd, idx)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{item.desc}</p>
                <pre className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-voile-accent overflow-x-auto">
                  {item.cmd}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
