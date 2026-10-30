import React from 'react';

interface VoileLogoProps {
  className?: string;
  glow?: boolean;
}

export const VoileLogo: React.FC<VoileLogoProps> = ({ className = 'w-7 h-7', glow = true }) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/30 to-indigo-500/30 blur-md rounded-full -z-10 pointer-events-none" />
      )}
      <svg 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
      >
        <defs>
          <linearGradient id="voileLeafGrad" x1="6" y1="42" x2="42" y2="6" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
          <linearGradient id="voileVeinGrad" x1="12" y1="36" x2="36" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.15" />
          </linearGradient>
          <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Outer leaf / veil silhouette */}
        <path 
          d="M10 38C10 38 10 22 24 10C34 1.5 40 4 41 5C42 6 44.5 12 36 22C24 36 10 38 10 38Z" 
          fill="url(#voileLeafGrad)" 
          filter="url(#subtleGlow)"
        />
        {/* Central spine / vein */}
        <path 
          d="M10 38C18 34 26 26 34 14" 
          stroke="url(#voileVeinGrad)" 
          strokeWidth="2.5" 
          strokeLinecap="round"
        />
        {/* Secondary delicate veins */}
        <path 
          d="M19 30C23 28 27 25 30 20" 
          stroke="rgba(255,255,255,0.45)" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
        <path 
          d="M15 34C17 31 20 28 23 26" 
          stroke="rgba(255,255,255,0.35)" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
        <path 
          d="M25 24C28 22 32 18 35 13" 
          stroke="rgba(255,255,255,0.45)" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
