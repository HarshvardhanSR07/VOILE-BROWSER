import React, { useState, useRef, useEffect } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { scanForSecrets } from '../../services/secretScanner';
import { 
  Sparkles, 
  X, 
  Maximize2, 
  Minimize2, 
  Send, 
  Lock, 
  FileText, 
  Scale, 
  Compass, 
  Search, 
  ChevronRight,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

export const AdaLPanel: React.FC = () => {
  const { 
    isAdaLOpen, 
    toggleAdaL, 
    isAdaLExpanded, 
    toggleAdaLExpand, 
    adaLMessages, 
    sendAdaLMessage, 
    runAdaLAction, 
    isAdaLTyping,
    activeTab,
    secretScannerEnabled,
    incrementSecretsIntercepted
  } = useBrowser();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const detectedSecrets = secretScannerEnabled ? scanForSecrets(input) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [adaLMessages, isAdaLTyping]);

  if (!isAdaLOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isAdaLTyping) {
      if (detectedSecrets.length > 0) {
        incrementSecretsIntercepted();
      }
      sendAdaLMessage(input.trim());
      setInput('');
    }
  };

  const suggestedActions = [
    {
      id: 'summarize',
      title: 'Summarize this page',
      subtitle: 'Get the key points',
      icon: FileText,
      iconColor: 'text-sky-400',
    },
    {
      id: 'compare',
      title: 'Compare privacy tools',
      subtitle: 'Find the best option',
      icon: Scale,
      iconColor: 'text-indigo-400',
    },
    {
      id: 'plan',
      title: 'Plan a private trip',
      subtitle: 'Create an itinerary without cookies',
      icon: Compass,
      iconColor: 'text-emerald-400',
    },
    {
      id: 'search',
      title: 'Ask anything',
      subtitle: 'Search the web with me',
      icon: Search,
      iconColor: 'text-purple-400',
    },
  ];

  const panelWidth = isAdaLExpanded ? 'w-[520px]' : 'w-[360px]';

  return (
    <aside className={`${panelWidth} bg-[#0A0E17] border-l border-white/[0.08] flex flex-col justify-between shrink-0 select-none z-20 transition-all duration-200 h-full`}>
      {/* 1. Header */}
      <div className="p-3.5 border-b border-white/[0.06] flex items-center justify-between bg-[#0D1322]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-voile-accent/30 to-voile-indigo/30 border border-voile-accent/40 flex items-center justify-center text-voile-accent shadow-sm">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-white">AdaL</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-voile-accent/15 border border-voile-accent/30 text-voile-accent font-medium">
                Groq Qwen 27B
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-500/15 border border-sky-500/30 text-sky-400 font-medium">
                Tavily Search
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[210px]">
              Your AI companion, built for your privacy.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleAdaLExpand}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title={isAdaLExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            {isAdaLExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={toggleAdaL}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Close AdaL"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Chat / Content Body */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4 no-scrollbar">
        {/* Welcome Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <img src="/assets/voile-logo.svg" alt="" className="w-4 h-4" />
            <h3 className="text-xs font-semibold text-white">Hello! I'm AdaL.</h3>
          </div>
          <p className="text-[11.5px] text-slate-300 leading-relaxed">
            I'm here to help you browse smarter, find information faster, and get things done — all while respecting your privacy.
          </p>
          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-slate-400">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Active context: <strong className="text-slate-300 truncate max-w-[170px] inline-block align-bottom">{activeTab.title}</strong></span>
          </div>
        </div>

        {/* Proactive Permission Protection Alert (from Architecture Diagram) */}
        <div className="p-3.5 rounded-2xl bg-[#121024] border border-purple-500/30 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-purple-300 font-semibold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AdaL Privacy Guard</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
              Live Alert
            </span>
          </div>

          <p className="text-[11.5px] text-slate-200 leading-snug">
            This site is requesting your location. Do you want to block it?
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                sendAdaLMessage("Block location permission for this domain.");
              }}
              className="flex-1 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Block
            </button>
            <button
              onClick={() => {
                sendAdaLMessage("Allow location permission temporarily for this session.");
              }}
              className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
            >
              Allow
            </button>
          </div>
        </div>

        {/* Suggested Actions Stack */}
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-2 px-1">
            Suggested Actions
          </div>
          <div className="space-y-1.5">
            {suggestedActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => runAdaLAction(action.title)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#111726] border border-white/[0.05] hover:border-voile-accent/30 hover:bg-[#162035] transition-all text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/5 group-hover:scale-105 transition-transform">
                      <Icon className={`w-3.5 h-3.5 ${action.iconColor}`} />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-200 group-hover:text-white">
                        {action.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {action.subtitle}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-voile-accent group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation Message List */}
        <div className="space-y-3 pt-2">
          {adaLMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1 text-[9.5px] text-slate-500 mb-1 px-1">
                {msg.sender === 'user' ? (
                  <>
                    <span>You</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-2.5 h-2.5 text-voile-accent" />
                    <span className="text-voile-accent">AdaL</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </>
                )}
              </div>

              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[95%] whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-voile-accent/20 border border-voile-accent/30 text-white rounded-tr-sm shadow-sm'
                    : 'bg-[#131B2E] border border-white/10 text-slate-200 rounded-tl-sm shadow-sm'
                }`}
              >
                {msg.text}

                {msg.memoryUsed && (
                  <div className="mt-2 pt-1.5 border-t border-white/[0.08] text-[10px] text-emerald-400 flex items-center gap-1.5 font-sans">
                    <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="font-medium">Personalized Memory Grounded</span>
                  </div>
                )}

                {msg.webSearchUsed && (
                  <div className="mt-1.5 pt-1.5 border-t border-white/[0.08] text-[10px] text-sky-400 flex items-center gap-1.5 font-sans">
                    <Search className="w-3 h-3 text-sky-400 shrink-0" />
                    <span className="font-medium">Tavily Web Search Grounded</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isAdaLTyping && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#131B2E] border border-white/10 text-xs text-slate-400 max-w-[80%]">
              <Sparkles className="w-3.5 h-3.5 text-voile-accent animate-spin" />
              <span>AdaL is thinking privately...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. Input & Privacy Assurance Footer */}
      <div className="p-3 border-t border-white/[0.06] bg-[#0D1322]">
        {/* Real-time Secret Leak Warning (from secure_transfer) */}
        {detectedSecrets.length > 0 && (
          <div className="mb-2 p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-[11px] flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-1.5 truncate mr-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="truncate">
                <strong>Secret Guard:</strong> {detectedSecrets[0].description} ({detectedSecrets[0].matchedSnippet})
              </span>
            </div>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-red-500/30 font-mono text-red-200 shrink-0">
              Push Guard
            </span>
          </div>
        )}

        <form onSubmit={handleSend} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Ask AdaL anything..."
            rows={2}
            className="w-full resize-none bg-[#131B2E] border border-white/10 rounded-xl p-2.5 pr-10 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-voile-accent/50 focus:ring-1 focus:ring-voile-accent/20 transition-all selection:bg-voile-accent/30"
          />
          <button
            type="submit"
            disabled={!input.trim() || isAdaLTyping}
            className="absolute right-2.5 bottom-3.5 p-1.5 rounded-lg bg-voile-accent text-slate-950 hover:bg-sky-300 disabled:opacity-30 disabled:hover:bg-voile-accent transition-colors"
            title="Send prompt (Enter)"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Client-Side Privacy Notice */}
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>Your conversations are private and never leave your device.</span>
        </div>
      </div>
    </aside>
  );
};
