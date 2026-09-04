import React from 'react';
import { useBrandLogo } from '../../hooks/useBrandLogo';

export interface BrandLogoProps {
  variant?: 'navbar' | 'footer' | 'sidebar' | 'login' | 'preview' | 'custom';
  showText?: boolean;
  className?: string;
  imgClassName?: string;
  textClassName?: string;
  customSrc?: string;
}

const variantStyles = {
  navbar: {
    container: 'flex items-center gap-2.5 sm:gap-3 group shrink-0 whitespace-nowrap',
    imgWrapper: 'h-8 sm:h-9 max-h-10 w-auto flex items-center justify-center shrink-0 overflow-visible',
    img: 'h-full w-auto max-w-[160px] sm:max-w-[200px] object-contain object-left transition-transform duration-200 group-hover:scale-105',
    textWrapper: 'flex flex-col shrink-0',
    title: 'font-display font-bold text-base sm:text-lg tracking-tight text-primary leading-tight whitespace-nowrap',
    subtitle: 'text-[8px] sm:text-[9px] font-semibold tracking-widest text-secondary uppercase -mt-0.5 whitespace-nowrap'
  },
  footer: {
    container: 'flex items-center gap-3 group shrink-0 mb-4 sm:mb-6',
    imgWrapper: 'h-9 sm:h-10 max-h-12 w-auto flex items-center justify-center shrink-0 overflow-visible',
    img: 'h-full w-auto max-w-[180px] sm:max-w-[220px] object-contain object-left transition-transform duration-200 group-hover:scale-105',
    textWrapper: 'flex flex-col shrink-0',
    title: 'font-display font-bold text-lg sm:text-xl tracking-tight text-primary leading-tight',
    subtitle: 'text-[9px] font-semibold tracking-widest text-secondary uppercase -mt-0.5'
  },
  sidebar: {
    container: 'flex items-center gap-2.5 group shrink-0',
    imgWrapper: 'h-8 max-h-9 w-auto flex items-center justify-center shrink-0 overflow-visible',
    img: 'h-full w-auto max-w-[140px] object-contain object-left',
    textWrapper: 'flex flex-col shrink-0',
    title: 'font-display font-bold text-sm tracking-tight text-white leading-tight',
    subtitle: 'text-[8px] font-semibold tracking-widest text-secondary uppercase -mt-0.5'
  },
  login: {
    container: 'flex flex-col items-center text-center mb-6 shrink-0',
    imgWrapper: 'h-12 sm:h-14 max-h-16 w-auto flex items-center justify-center shrink-0 mb-3 overflow-visible',
    img: 'h-full w-auto max-w-[240px] object-contain object-center',
    textWrapper: 'flex flex-col items-center text-center',
    title: 'text-2xl font-bold font-display text-white',
    subtitle: 'text-xs font-semibold text-secondary-fixed uppercase tracking-widest mt-1'
  },
  preview: {
    container: 'flex items-center justify-center w-full h-full p-2 overflow-hidden',
    imgWrapper: 'w-full h-full flex items-center justify-center overflow-visible',
    img: 'max-h-full max-w-full object-contain',
    textWrapper: 'hidden',
    title: '',
    subtitle: ''
  },
  custom: {
    container: 'flex items-center gap-2 shrink-0',
    imgWrapper: 'flex items-center justify-center shrink-0',
    img: 'object-contain',
    textWrapper: 'flex flex-col shrink-0',
    title: 'font-display font-bold text-primary',
    subtitle: 'text-xs font-semibold text-secondary uppercase'
  }
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'navbar',
  showText = true,
  className = '',
  imgClassName = '',
  textClassName = '',
  customSrc
}) => {
  const { logoUrl, logoAlt, siteName, loading } = useBrandLogo();
  const currentConfig = variantStyles[variant];
  const effectiveSrc = customSrc || logoUrl;

  return (
    <div className={`${currentConfig.container} ${className}`}>
      <div className={currentConfig.imgWrapper}>
        {loading && !customSrc ? (
          <div className="w-8 h-8 rounded-lg bg-slate-800/80 animate-pulse flex items-center justify-center">
            <span className="text-[10px] font-bold text-slate-500 font-mono">RT</span>
          </div>
        ) : effectiveSrc ? (
          <img
            src={effectiveSrc}
            alt={logoAlt}
            className={`${currentConfig.img} ${imgClassName}`}
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary font-bold text-xs tracking-wider">
            RT
          </div>
        )}
      </div>

      {showText && variant !== 'preview' && (
        <div className={`${currentConfig.textWrapper} ${textClassName}`}>
          {loading && !customSrc ? (
            <div className="space-y-1 py-1">
              <div className="h-3.5 w-16 bg-slate-800/80 rounded animate-pulse" />
              <div className="h-2 w-20 bg-slate-800/50 rounded animate-pulse" />
            </div>
          ) : (
            <>
              <span className={currentConfig.title}>
                {siteName?.toUpperCase().includes('RAVAN') ? 'RAVAN' : siteName}
              </span>
              <span className={currentConfig.subtitle}>
                TECHNOLOGIES
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
