import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck } from 'lucide-react';

interface AicteLogoProps {
  className?: string;
  size?: 'normal' | 'login';
}

export const AicteLogo: React.FC<AicteLogoProps> = ({ className = '', size = 'normal' }) => {
  const { t } = useApp();
  const [hasError, setHasError] = useState(false);

  // Height about 80-96px (h-20 = 80px, sm:h-24 = 96px)
  const heightClass = size === 'login' ? 'h-20 sm:h-24' : 'h-16 sm:h-20 lg:h-24';

  if (hasError) {
    return (
      <div 
        className={`bg-white text-govNavy-900 border border-slate-200 dark:border-slate-700 rounded-md p-2 flex items-center justify-center shrink-0 shadow-xs ${heightClass} w-auto aspect-square ${className}`}
        title={t.header.logoAlt}
        aria-label={t.header.logoAlt}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <ShieldCheck className="w-8 h-8 text-govSaffron-500" />
          <span className="text-[10px] font-black tracking-wider text-govNavy-900 mt-0.5">AICTE</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-1 sm:p-1.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 flex items-center justify-center ${className}`}>
      <img
        src="/assets/aicte-logo.png"
        alt={t.header.logoAlt}
        onError={() => setHasError(true)}
        className={`${heightClass} w-auto max-w-full object-contain`}
      />
    </div>
  );
};
