import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HackathonItem } from '../../types';

import { SmartImage } from '../common/SmartImage';

interface HackathonEngineProps {
  hackathon?: HackathonItem | null;
  isLoading?: boolean;
}

export const HackathonEngine: React.FC<HackathonEngineProps> = ({ hackathon, isLoading = false }) => {
  if (isLoading || !hackathon) {
    return (
      <section className="py-28 bg-surface-container relative border-t border-outline-variant/60" aria-busy="true">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center animate-pulse">
            <div className="lg:col-span-6 h-[480px] rounded-2xl bg-slate-800/50 border border-outline-variant" />
            <div className="lg:col-span-6 space-y-6">
              <div className="h-3 w-32 bg-slate-700/60 rounded" />
              <div className="space-y-3">
                <div className="h-10 w-3/4 bg-slate-800 rounded" />
                <div className="h-10 w-1/2 bg-slate-800/80 rounded" />
              </div>
              <div className="h-16 w-full bg-slate-800/40 rounded" />
              <div className="h-12 w-48 bg-slate-800 rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-28 bg-surface-container relative border-t border-outline-variant/60">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Visual Side */}
          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden h-[480px] shadow-2xl border border-outline-variant group bg-[#07111e]">
            {hackathon.image_url ? (
              <SmartImage
                src={hackathon.image_url}
                alt={hackathon.title || 'Ravan Hackathon Environment'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                containerClassName="w-full h-full"
                fallbackText="Ravan Hackathons"
              />
            ) : (
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent pointer-events-none" />
            
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-secondary text-white rounded text-[10px] font-bold uppercase tracking-widest">
                  NEXT EVENT
                </span>
                <span className="text-white text-xs font-semibold tracking-wider">
                  {hackathon.event_date}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold font-display text-white mb-2">
                {hackathon.title}
              </h3>
              <p className="text-sm text-white/80">
                {hackathon.focus_statement}
              </p>
            </div>
          </div>

          {/* Content Side */}
          <div className="lg:col-span-6 flex flex-col items-start gap-6">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-secondary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
                INNOVATION ECOSYSTEM
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold font-display text-primary leading-[1.1] uppercase">
              Real Problems.<br />
              <span className="text-on-surface-variant">Real Builders.</span><br />
              Real Solutions.
            </h2>

            <p className="text-base font-body text-on-surface-variant leading-relaxed">
              Theory is insufficient. Our hackathon ecosystem is the crucible where theoretical engineering meets the uncompromising demands of actual enterprise bottlenecks. We convene top-tier talent to forge robust solutions under pressure.
            </p>

            {/* Cycle Diagram */}
            <div className="w-full pt-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-[1px] bg-outline-variant" />
                <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
                  THE CYCLE
                </span>
                <div className="flex-1 h-[1px] bg-outline-variant" />
              </div>

              <div className="flex items-center justify-between text-xs font-bold tracking-widest text-primary uppercase">
                <span className="px-3 py-1.5 bg-surface rounded">LEARN</span>
                <ArrowRight className="w-4 h-4 text-secondary shrink-0" />
                <span className="px-3 py-1.5 bg-surface rounded">BUILD</span>
                <ArrowRight className="w-4 h-4 text-secondary shrink-0" />
                <span className="px-3 py-1.5 bg-surface rounded">COMPETE</span>
                <ArrowRight className="w-4 h-4 text-secondary shrink-0" />
                <span className="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded">SOLVE</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <Link
                to="/hackathons"
                className="px-8 py-4 bg-primary text-white rounded font-semibold text-xs tracking-widest uppercase hover:bg-primary-container transition-colors shadow flex items-center gap-2"
              >
                <span>JOIN THE ECOSYSTEM</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
