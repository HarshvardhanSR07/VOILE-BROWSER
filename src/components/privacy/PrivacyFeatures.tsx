import React from 'react';
import { 
  ShieldCheck, 
  EyeOff, 
  Zap, 
  Flame, 
  Lock,
  Sparkles
} from 'lucide-react';
import { useBrowser } from '../../context/BrowserContext';

export const PrivacyFeatures: React.FC = () => {
  const { setActiveView } = useBrowser();

  const features = [
    {
      id: 'ads',
      title: 'Ad Blocker',
      subtitle: 'Clean web. No distractions.',
      icon: ShieldCheck,
      iconColor: 'text-voile-accent',
      view: 'privacy' as const,
    },
    {
      id: 'trackers',
      title: 'Tracker Protection',
      subtitle: 'Stops trackers & fingerprinting.',
      icon: Lock,
      iconColor: 'text-indigo-400',
      view: 'privacy' as const,
    },
    {
      id: 'private',
      title: 'Privacy Mode',
      subtitle: 'Browse without leaving a trace.',
      icon: EyeOff,
      iconColor: 'text-purple-400',
      view: 'private' as const,
    },
    {
      id: 'faster',
      title: 'Faster Browsing',
      subtitle: 'Less clutter. More speed.',
      icon: Zap,
      iconColor: 'text-emerald-400',
      view: 'privacy' as const,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-8 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 bg-[#0E1524]/75 backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-voile-card overflow-hidden">
        {features.map((feat, index) => {
          const Icon = feat.icon;
          const isNotLast = index < features.length - 1;

          return (
            <div
              key={feat.id}
              onClick={() => setActiveView(feat.view)}
              className={`p-4 flex flex-col items-center text-center group cursor-pointer hover:bg-white/[0.03] transition-colors ${
                isNotLast ? 'md:border-r border-b md:border-b-0 border-white/[0.06]' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-2.5 group-hover:scale-105 group-hover:bg-white/[0.08] transition-all">
                <Icon className={`w-5 h-5 ${feat.iconColor}`} />
              </div>

              <h4 className="text-xs font-semibold text-slate-100 group-hover:text-voile-accent transition-colors">
                {feat.title}
              </h4>

              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {feat.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
