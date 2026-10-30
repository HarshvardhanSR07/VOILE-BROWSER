import React, { useState, useRef, useEffect } from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { AdaLHeader } from './AdaLHeader';
import { AdaLComposer } from './AdaLComposer';
import { PrivacyStatusBar } from './PrivacyStatusBar';
import { SafeMarkdownView } from './SafeMarkdownView';
import { RichRecommendationCard } from './RichRecommendationCard';
import { Sparkles, Bot, AlertTriangle, Search, ChevronRight, FileText, Scale } from 'lucide-react';

export const AdaLPopup: React.FC = () => {
  const {
    isAdaLOpen,
    toggleAdaL,
    adaLMessages,
    sendAdaLMessage,
    runAdaLAction,
    isAdaLTyping,
    shieldsEnabled,
    privacyStats,
    adBlockStats,
    openNewTab
  } = useBrowser();

  const [input, setInput] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  // Safe canonical URL opener that routes to a new tab without resetting AdaL state
  const handleOpenExternal = (url: string, title?: string) => {
    if (!url || typeof url !== 'string') return;
    try {
      let resolved = url.trim();
      if (!resolved.startsWith('http://') && !resolved.startsWith('https://')) {
        if (/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/.test(resolved)) {
          resolved = `https://${resolved}`;
        } else {
          console.warn('[AdaL] Rejected non-web destination:', resolved);
          return;
        }
      }
      const parsed = new URL(resolved);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        openNewTab(resolved, title || parsed.hostname.replace(/^www\./, ''));
      }
    } catch (e) {
      console.warn('[AdaL] Rejected invalid URL:', url);
    }
  };

  // Smart auto-scroll: automatically scrolls down on new messages unless user intentionally scrolled up
  useEffect(() => {
    if (!userHasScrolledUp && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [adaLMessages, isAdaLTyping, userHasScrolledUp]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
      setUserHasScrolledUp(!isNearBottom);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isAdaLTyping) {
      sendAdaLMessage(input.trim());
      setInput('');
      setUserHasScrolledUp(false);
    }
  };

  if (!isAdaLOpen) return null;

  const totalTrackers = adBlockStats?.blockedCount || privacyStats.trackersBlocked || 0;

  const suggestedActions = [
    {
      id: 'privacy-tools',
      title: 'Explore leading open-source privacy tools',
      subtitle: 'Proton, Bitwarden, Brave, Tor, Signal with live previews',
      icon: Search,
      iconColor: 'text-sky-400',
    },
    {
      id: 'summarize',
      title: 'Summarize current page',
      subtitle: 'Extract key points securely with zero telemetry',
      icon: FileText,
      iconColor: 'text-indigo-400',
    },
    {
      id: 'compare',
      title: 'Compare privacy tools',
      subtitle: 'Proton, Bitwarden, Brave, Voile',
      icon: Scale,
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className="fixed bottom-20 right-6 z-50 w-[660px] max-w-[calc(100vw-2.5rem)] h-[820px] max-h-[calc(100vh-6.5rem)] flex flex-col bg-gradient-to-b from-[#0B152A] via-[#080E1C] to-[#060B16] border border-sky-500/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] shadow-sky-950/50 overflow-hidden backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 select-none">
      {/* 1. Header Inspired by Reference Image 1 */}
      <AdaLHeader onClose={toggleAdaL} activeSearchMode="Tavily Search" />

      {/* 2. Scrollable Conversation Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar select-text"
      >
        {/* Suggested Actions for Quick Prototyping/Testing */}
        {adaLMessages.length <= 1 && (
          <div className="space-y-2 mb-2 select-none">
            <span className="text-[11px] font-semibold tracking-wider text-sky-400/80 uppercase px-1">
              Suggested Explorations
            </span>
            <div className="grid grid-cols-1 gap-2">
              {suggestedActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      if (action.id === 'privacy-tools') {
                        sendAdaLMessage("What are the best open-source privacy and security tools?");
                      } else {
                        runAdaLAction(action.id);
                      }
                      setUserHasScrolledUp(false);
                    }}
                    className="w-full p-3 rounded-2xl bg-[#091122]/90 hover:bg-[#0E1A36] border border-sky-500/15 hover:border-sky-400/40 flex items-center justify-between text-left transition-all duration-200 group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                        <Icon className={`w-4 h-4 ${action.iconColor}`} />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white group-hover:text-sky-300 block leading-tight">
                          {action.title}
                        </span>
                        <span className="text-[11px] text-slate-400 block leading-tight mt-0.5">
                          {action.subtitle}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-300 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Stream */}
        {adaLMessages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            {msg.sender === 'user' ? (
              /* User Message Bubble */
              <div className="flex justify-end">
                <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-sky-600 to-indigo-600 text-white px-4 py-3 text-sm font-medium shadow-lg shadow-sky-950/40 leading-relaxed">
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ) : (
              /* Assistant Message Container (Matches Reference Image 1) */
              <div className="flex gap-3 items-start">
                {/* Glowing Avatar */}
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400/20 via-blue-600/30 to-indigo-600/30 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0 shadow-sm mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>

                {/* Assistant Content Box */}
                <div className="flex-1 rounded-2xl bg-[#0C152B]/85 border border-sky-500/20 p-4 sm:p-5 text-slate-200 shadow-xl shadow-black/40 space-y-4">
                  {/* Formatted Markdown Content */}
                  <SafeMarkdownView content={msg.text} onOpenLink={handleOpenExternal} />

                  {/* Rich Recommendation Cards */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {msg.recommendations.map((card, i) => (
                        <RichRecommendationCard 
                          key={`${card.url}-${i}`} 
                          card={card} 
                          onOpenLink={handleOpenExternal} 
                        />
                      ))}
                    </div>
                  )}

                  {/* Metadata Grounding Badges */}
                  {(msg.webSearchUsed || msg.memoryUsed) && (
                    <div className="flex items-center gap-3 pt-2 border-t border-white/5 text-[11px] text-slate-400">
                      {msg.webSearchUsed && (
                        <div className="flex items-center gap-1.5 text-sky-400 font-medium">
                          <Search className="w-3 h-3" />
                          <span>Tavily Grounded</span>
                        </div>
                      )}
                      {msg.memoryUsed && (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                          <Sparkles className="w-3 h-3" />
                          <span>Personalized Memory</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing / Thinking Indicator */}
        {isAdaLTyping && (
          <div className="flex gap-3 items-start animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400/20 via-blue-600/30 to-indigo-600/30 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0 shadow-sm mt-0.5">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="rounded-2xl bg-[#0C152B]/85 border border-sky-500/20 px-4 py-3 flex items-center gap-2.5 text-xs text-sky-300">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span className="font-medium animate-pulse">AdaL is searching and thinking privately...</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Fixed Bottom Section: Message Composer + Privacy Status Bar */}
      <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-gradient-to-b from-[#091122] to-[#060B16] shrink-0 space-y-2">
        <AdaLComposer
          input={input}
          setInput={setInput}
          onSend={handleSend}
          isTyping={isAdaLTyping}
        />
        <PrivacyStatusBar
          trackersBlocked={totalTrackers}
          shieldsEnabled={shieldsEnabled}
        />
      </div>
    </div>
  );
};
