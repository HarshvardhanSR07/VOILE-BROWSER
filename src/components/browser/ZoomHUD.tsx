import React from 'react';
import { useBrowser } from '../../context/BrowserContext';
import { ZoomIn } from 'lucide-react';

export const ZoomHUD: React.FC = () => {
  const { zoomHUDText } = useBrowser();

  if (!zoomHUDText) return null;

  return (
    <div className="absolute top-14 right-6 z-50 flex items-center gap-2 bg-[#0E1524]/90 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-full shadow-2xl text-xs font-medium text-white pointer-events-none animate-in fade-in zoom-in-95 duration-150">
      <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
      <span>{zoomHUDText}</span>
    </div>
  );
};
