import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Founder } from '../../types';
import { SmartImage } from '../common/SmartImage';

interface FounderSpotlightProps {
  founder?: Founder | null;
  isLoading?: boolean;
}

export const FounderSpotlight: React.FC<FounderSpotlightProps> = ({ founder, isLoading = false }) => {
  if (isLoading) {
    return (
      <section className="py-28 relative bg-surface-container-lowest border-y border-outline-variant/60 overflow-hidden" aria-busy="true">
        <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Skeleton Visual Column */}
          <div className="md:col-span-5 md:col-start-2 relative">
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-800/60 border border-outline-variant animate-pulse flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-700/50" />
            </div>
          </div>

          {/* Skeleton Content Column */}
          <div className="md:col-span-6 flex flex-col items-start gap-6 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-slate-700" />
              <div className="h-3 w-32 bg-slate-700/60 rounded" />
            </div>

            <div className="w-full space-y-3">
              <div className="h-9 w-3/4 bg-slate-700/80 rounded" />
              <div className="h-4 w-1/2 bg-slate-700/50 rounded" />
            </div>

            <div className="w-full h-16 bg-slate-800/40 rounded-xl border border-slate-700/30" />

            <div className="w-full space-y-2">
              <div className="h-4 w-full bg-slate-700/40 rounded" />
              <div className="h-4 w-5/6 bg-slate-700/40 rounded" />
              <div className="h-4 w-4/6 bg-slate-700/40 rounded" />
            </div>

            <div className="h-4 w-36 bg-slate-700/60 rounded mt-2" />
          </div>
        </div>
      </section>
    );
  }

  if (!founder || founder.status !== 'published') {
    return null;
  }

  return (
    <section className="py-28 relative bg-surface-container-lowest border-y border-outline-variant/60 overflow-hidden">
      <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20 items-center">
        {/* Visual Column with clean, unobstructed authentic photo with Premium Motion */}
        <div className="md:col-span-5 md:col-start-2 relative select-none">
          <div 
            style={{ touchAction: 'manipulation' }}
            className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/15 border border-outline-variant/80 hover:border-secondary/50 transition-all duration-500 ease-out cursor-pointer select-none motion-reduce:transform-none"
          >
            <SmartImage
              src={founder.image_url}
              alt={`${founder.name} — Founder of Ravan Technologies`}
              priority={true}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] group-active:scale-[1.02] motion-reduce:transform-none will-change-transform"
              containerClassName="w-full h-full bg-transparent overflow-hidden"
              fallbackText={founder.name}
            />
          </div>
        </div>

        {/* Content Column */}
        <div className="md:col-span-6 flex flex-col items-start gap-6">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-secondary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
              EXECUTIVE LEADERSHIP
            </span>
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-primary tracking-tight">
              The Architecture of Order
            </h2>
            <p className="text-sm font-semibold text-secondary mt-1">
              {founder.name} — {founder.designation}
            </p>
          </div>

          {founder.vision && (
            <div className="p-4 rounded-xl bg-surface border border-outline-variant/60 border-l-4 border-l-secondary text-sm font-body text-primary italic leading-relaxed">
              &ldquo;{founder.vision}&rdquo;
            </div>
          )}

          <p className="text-base md:text-lg font-body text-on-surface-variant leading-relaxed">
            At Ravan Technologies, we view software engineering as a discipline of structural integrity. We do not just write code; we architect sovereign systems capable of self-regulation, massive scale, and uncompromising security.
          </p>

          <p className="text-sm md:text-base font-body text-on-surface-variant leading-relaxed opacity-85">
            Our approach blends deep enterprise experience with bleeding-edge machine learning capabilities, delivering solutions that are not just theoretically sound, but robustly battle-tested in real-world scenarios.
          </p>

          <Link
            to="/founder"
            className="group inline-flex items-center gap-3 text-secondary font-semibold text-xs uppercase tracking-widest mt-2 hover:text-primary transition-colors"
          >
            <span>MEET THE FOUNDER</span>
            <div className="w-8 h-[1px] bg-secondary group-hover:w-14 transition-all" />
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
