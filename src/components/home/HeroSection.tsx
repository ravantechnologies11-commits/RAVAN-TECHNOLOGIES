import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SmartImage } from '../common/SmartImage';

interface HeroSectionProps {
  onOpenModal: () => void;
  heroImageUrl?: string;
  heroImageAlt?: string;
  focalX?: number;
  focalY?: number;
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  isLoading?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onOpenModal,
  heroImageUrl,
  heroImageAlt = 'Ravan Technologies Sovereign Intelligence Infrastructure',
  focalX = 50,
  focalY = 50,
  heroBadge = 'SOVEREIGN INTELLIGENCE IN ENTERPRISE ENGINEERING',
  heroTitle = 'Building Technology. Solving Real Problems.',
  heroSubtitle = 'Ravan Technologies builds software, AI/ML solutions, learning platforms and innovation programs designed to solve meaningful real-world challenges.',
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-20 overflow-hidden bg-surface" aria-busy="true">
        {/* Background Graphic: Clean Sovereign Structural Grid */}
        <div className="absolute inset-0 z-0 bg-[#07111e]">
          <div className="w-full h-full relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/90 to-transparent" />
          </div>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-fixed/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-secondary-fixed/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-container-max mx-auto px-gutter w-full flex flex-col items-start gap-8 animate-pulse">
          {/* Eyebrow Skeleton */}
          <div className="inline-flex items-center gap-3 bg-surface-container-highest/40 backdrop-blur-md px-4 py-2 rounded-full border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-slate-700" />
            <div className="h-3 w-48 bg-slate-700/60 rounded" />
          </div>

          {/* Title Skeleton */}
          <div className="w-full max-w-4xl space-y-4">
            <div className="h-12 sm:h-16 md:h-20 w-4/5 bg-slate-800/80 rounded" />
            <div className="h-12 sm:h-16 md:h-20 w-3/5 bg-slate-800/60 rounded" />
          </div>

          {/* Subtitle Skeleton */}
          <div className="w-full max-w-2xl space-y-2.5">
            <div className="h-4 sm:h-5 w-full bg-slate-800/50 rounded" />
            <div className="h-4 sm:h-5 w-5/6 bg-slate-800/50 rounded" />
            <div className="h-4 sm:h-5 w-3/5 bg-slate-800/50 rounded" />
          </div>

          {/* CTA Skeletons */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="h-12 w-48 bg-slate-800 rounded" />
            <div className="h-12 w-40 bg-slate-800/40 rounded border border-slate-700/40" />
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-20 overflow-hidden bg-surface">
      {/* Background Graphic & Depth: Real Database Image OR Sovereign Structural Grid */}
      <div className="absolute inset-0 z-0 bg-[#07111e]">
        {heroImageUrl ? (
          <div className="w-full h-full relative overflow-hidden">
            <SmartImage
              src={heroImageUrl}
              alt={heroImageAlt}
              priority={true}
              className="w-full h-full object-cover opacity-35 mix-blend-luminosity transition-opacity duration-700"
              containerClassName="w-full h-full"
              style={{
                objectPosition: `${focalX}% ${focalY}%`
              }}
              fallbackText="Ravan Technologies"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* Clean, Sovereign Architectural Matrix Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/90 to-transparent" />
          </div>
        )}

        {/* Subtle glowing volumetric radial gradient in Navy & Gold */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-fixed/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-secondary-fixed/15 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-container-max mx-auto px-gutter w-full flex flex-col items-start gap-8">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-3 bg-surface-container-highest/60 backdrop-blur-md px-4 py-2 rounded-full border border-outline-variant/40 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface">
            {heroBadge}
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-display text-primary max-w-4xl tracking-tight leading-[1.05] uppercase">
          {heroTitle.includes('.') ? (
            <>
              {heroTitle.split('.')[0]}.<br />
              <span className="text-on-surface-variant">{heroTitle.split('.').slice(1).join('.').trim()}</span>
            </>
          ) : (
            heroTitle
          )}
        </h1>

        {/* Supporting Message */}
        <p className="text-base sm:text-lg md:text-xl font-body text-on-surface-variant max-w-2xl leading-relaxed">
          {heroSubtitle}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <Link
            to="/solutions"
            className="group relative px-8 py-4 bg-primary text-white rounded font-semibold text-xs tracking-widest uppercase overflow-hidden transition-all shadow-md hover:shadow-xl flex items-center gap-3"
          >
            <span className="relative z-10">EXPLORE SOLUTIONS</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-primary-container translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
          </Link>

          <button
            onClick={onOpenModal}
            className="px-8 py-4 border-[1.5px] border-secondary text-secondary rounded font-semibold text-xs tracking-widest uppercase hover:bg-secondary-container hover:text-on-secondary-container transition-all flex items-center gap-2 shadow-sm"
          >
            WORK WITH US
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-gutter hidden md:flex items-center gap-4 text-on-surface-variant opacity-60">
        <div className="w-12 h-[1px] bg-outline-variant" />
        <span className="text-[11px] font-semibold tracking-widest uppercase">SCROLL TO DISCOVER</span>
      </div>
    </section>
  );
};
