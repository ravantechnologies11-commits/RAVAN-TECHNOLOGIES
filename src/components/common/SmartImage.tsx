import React, { useState, useEffect, useRef } from 'react';
import { ImageOff } from 'lucide-react';

export interface SmartImageProps {
  src: string | undefined | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string; // e.g. 'aspect-[4/3]', 'aspect-[4/5]', 'aspect-video', 'aspect-square'
  priority?: boolean; // If true: loading='eager', fetchPriority='high' for critical hero/LCP images
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  fallbackText?: string;
  style?: React.CSSProperties;
}

/**
 * SmartImage — Production-grade lightweight image loader.
 * - Prevents Cumulative Layout Shift (CLS) by locking container dimensions and aspect ratio.
 * - Displays an elegant, subtle navy/slate shimmer skeleton while loading.
 * - Detects cached images immediately to eliminate artificial loading delay.
 * - Smoothly fades in the loaded image with zero jump.
 * - Gracefully renders a minimal fallback state if network/URL fails (no broken image icons, no random stock demo images).
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  aspectRatio,
  priority = false,
  objectFit = 'cover',
  fallbackText,
  style
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state on src change and check if already complete in browser cache
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    if (!src) {
      setHasError(true);
      return;
    }

    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  const fitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none'
  }[objectFit];

  return (
    <div
      className={`relative overflow-hidden ${isLoaded ? 'bg-transparent' : 'bg-surface-container-low'} ${aspectRatio ? aspectRatio : ''} ${containerClassName}`}
    >
      {/* Subtle Premium Skeleton / Shimmer (Active while loading) */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-slate-900 via-slate-800/60 to-slate-900 bg-[length:200%_100%] animate-pulse">
          <div className="w-8 h-8 rounded-full border border-slate-700/40 opacity-40 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-secondary/40" />
          </div>
        </div>
      )}

      {/* Error / Fallback State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#0a192f] border border-slate-800 text-slate-500 text-center">
          <ImageOff className="w-6 h-6 mb-2 opacity-50 text-slate-400" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            {fallbackText || alt || 'Image Unavailable'}
          </span>
        </div>
      )}

      {/* Actual Image */}
      {src && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...(priority ? { fetchPriority: 'high' as any } : {})}
          onLoad={handleLoad}
          onError={handleError}
          style={style}
          className={`w-full h-full ${fitClass} transition-opacity duration-300 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
        />
      )}
    </div>
  );
};
