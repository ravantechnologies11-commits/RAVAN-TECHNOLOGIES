import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Clapperboard } from 'lucide-react';
import { EcosystemItem } from '../../types';
import { SmartImage } from '../common/SmartImage';

interface EcosystemTeaserProps {
  ecosystem: EcosystemItem[];
  isLoading?: boolean;
}

export const EcosystemTeaser: React.FC<EcosystemTeaserProps> = ({ ecosystem, isLoading = false }) => {
  if (isLoading) {
    return (
      <section className="py-28 bg-surface relative border-t border-outline-variant/60 overflow-hidden" aria-busy="true">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 animate-pulse">
            <div className="h-3 w-28 bg-slate-700/60 rounded mb-3" />
            <div className="h-10 w-72 bg-slate-800 rounded mb-4" />
            <div className="h-4 w-96 bg-slate-800/60 rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden h-[440px] bg-slate-800/40 border border-outline-variant animate-pulse p-8 flex flex-col justify-end">
                <div className="h-5 w-28 bg-slate-700/60 rounded mb-3" />
                <div className="h-8 w-64 bg-slate-700 rounded mb-3" />
                <div className="h-4 w-full bg-slate-700/50 rounded mb-2" />
                <div className="h-4 w-3/4 bg-slate-700/50 rounded mb-6" />
                <div className="h-10 w-36 bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const techPark = ecosystem.find(e => e.type === 'hub' || e.name.toLowerCase().includes('tech park')) || ecosystem[0];
  const filmStudio = ecosystem.find(e => e.type === 'studio' || e.name.toLowerCase().includes('film studio')) || ecosystem[1];

  return (
    <section className="py-28 bg-surface relative border-t border-outline-variant/60 overflow-hidden">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-[1px] w-8 bg-secondary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
              THE DUAL ENGINE
            </span>
            <div className="h-[1px] w-8 bg-secondary" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-display text-primary tracking-tight mb-4">
            The Ravan Ecosystem
          </h2>
          <p className="text-base text-on-surface-variant leading-relaxed">
            Operating at the intersection of rigorous physical engineering and visionary digital media production.
          </p>
        </div>

        {/* Dual Split Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ravan Tech Park */}
          <div className="relative rounded-2xl overflow-hidden h-[440px] shadow-xl border border-outline-variant group bg-[#07111e]">
            {techPark?.image_url ? (
              <SmartImage
                src={techPark.image_url}
                alt={techPark.name || 'Ravan Tech Park'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                containerClassName="w-full h-full"
                fallbackText={techPark.name || 'Ravan Tech Park'}
              />
            ) : (
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                <div className="absolute top-10 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent pointer-events-none" />
            
            <div className="absolute bottom-0 left-0 p-8 w-full z-10">
              <span className="inline-block px-3 py-1 bg-surface/20 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-widest text-white mb-3 border border-white/20">
                {techPark?.status_badge || 'ENTERPRISE HUB'}
              </span>
              <h3 className="text-3xl font-bold font-display text-white mb-2">
                {techPark?.name || 'Ravan Tech Park'}
              </h3>
              <p className="text-sm text-white/80 max-w-md mb-6 leading-relaxed">
                {techPark?.description || '120,000+ sq ft dedicated to sovereign AI infrastructure, GPU clusters, hardware testbeds, and collaborative engineering.'}
              </p>
              <Link
                to="/ecosystem#tech-park"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded font-semibold text-xs tracking-widest uppercase hover:bg-secondary-container transition-colors shadow"
              >
                <span>EXPLORE CAMPUS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Ravan Film Studio */}
          <div className="relative rounded-2xl overflow-hidden h-[440px] shadow-xl border border-outline-variant group bg-[#07111e]">
            {filmStudio?.image_url ? (
              <SmartImage
                src={filmStudio.image_url}
                alt={filmStudio.name || 'Ravan Film Studio'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                containerClassName="w-full h-full"
                fallbackText={filmStudio.name || 'Ravan Film Studio'}
              />
            ) : (
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary-fixed/10 rounded-full blur-3xl" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-tertiary-container via-tertiary-container/70 to-transparent pointer-events-none" />
            
            <div className="absolute bottom-0 left-0 p-8 w-full z-10">
              <span className="inline-block px-3 py-1 bg-surface/20 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-widest text-white mb-3 border border-white/20">
                {filmStudio?.status_badge || 'CREATIVE VENTURE'}
              </span>
              <h3 className="text-3xl font-bold font-display text-white mb-2">
                {filmStudio?.name || 'Ravan Film Studio'}
              </h3>
              <p className="text-sm text-white/80 max-w-md mb-6 leading-relaxed">
                {filmStudio?.description || 'Real-time LED volume virtual production pipelines, 4K/8K workflows, and cinematic storytelling engineered for global impact.'}
              </p>
              <Link
                to="/ecosystem#film-studio"
                className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-white text-white rounded font-semibold text-xs tracking-widest uppercase hover:bg-white hover:text-primary transition-colors shadow"
              >
                <span>VIEW REEL</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
