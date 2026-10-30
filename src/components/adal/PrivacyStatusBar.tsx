import React from 'react';
import { Lock, Shield } from 'lucide-react';

interface PrivacyStatusBarProps {
  trackersBlocked: number;
  shieldsEnabled: boolean;
}

export const PrivacyStatusBar: React.FC<PrivacyStatusBarProps> = ({
  trackersBlocked,
  shieldsEnabled
}) => {
  return (
    <div className="flex items-center justify-between text-xs px-2 pt-2.5 text-slate-400 select-none">
      {/* Zero Telemetry Guarantee */}
      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
        <Lock className="w-3.5 h-3.5" />
        <span>Zero telemetry</span>
      </div>

      {/* Subtle Divider */}
      <div className="h-3 w-px bg-white/10 mx-2" />

      {/* Real Trackers Blocked Count */}
      <div className="flex items-center gap-1.5 text-slate-400">
        <Shield className="w-3.5 h-3.5 text-sky-400/80" />
        <span>
          {shieldsEnabled 
            ? `${trackersBlocked} trackers blocked` 
            : 'Shields paused'}
        </span>
      </div>
    </div>
  );
};
