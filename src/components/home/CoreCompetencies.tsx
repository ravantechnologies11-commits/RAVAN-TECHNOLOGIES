import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { ServiceItem } from '../../types';

interface CoreCompetenciesProps {
  services: ServiceItem[];
  isLoading?: boolean;
}

export const CoreCompetencies: React.FC<CoreCompetenciesProps> = ({ services, isLoading = false }) => {
  if (isLoading) {
    return (
      <section className="py-28 bg-surface relative overflow-hidden" id="solutions" aria-busy="true">
        <div className="max-w-container-max mx-auto px-gutter relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 animate-pulse">
            <div className="space-y-3">
              <div className="h-3 w-28 bg-slate-700/60 rounded" />
              <div className="h-10 w-80 bg-slate-800 rounded" />
            </div>
            <div className="h-4 w-36 bg-slate-700/60 rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-800/40 border border-outline-variant/60 p-8 rounded-2xl h-[400px] animate-pulse flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-700/60" />
                  <div className="h-4 w-24 bg-slate-700/40 rounded" />
                  <div className="h-8 w-4/5 bg-slate-700/80 rounded" />
                  <div className="h-4 w-full bg-slate-700/40 rounded" />
                  <div className="h-4 w-5/6 bg-slate-700/40 rounded" />
                </div>
                <div className="h-8 w-28 bg-slate-700/50 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!services || services.length === 0) return null;

  const topServices = services.slice(0, 3);

  const getIcon = (iconName?: string, idx?: number) => {
    if (iconName) return iconName;
    if (idx === 0) return 'integration_instructions';
    if (idx === 1) return 'psychology';
    return 'schema';
  };

  return (
    <section className="py-28 bg-surface relative overflow-hidden" id="solutions">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-fixed/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-container-max mx-auto px-gutter relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[1px] w-8 bg-secondary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
                CORE COMPETENCIES
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-primary tracking-tight">
              Capabilities defined by precision.
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-secondary hover:text-primary transition-colors"
          >
            <span>VIEW ALL SERVICES</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Core Cards Rendered Dynamically from Supabase Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {topServices.map((service, idx) => {
            const isMiddleDark = idx === 1;

            if (isMiddleDark) {
              return (
                <div
                  key={service.id}
                  className="group bg-primary text-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[400px] md:-translate-y-4 border border-secondary/20"
                >
                  <div className="absolute -bottom-16 -right-16 text-[180px] font-display font-black text-white/5 select-none pointer-events-none transition-transform duration-700 group-hover:rotate-12">
                    AI
                  </div>
                  <div className="relative z-10">
                    <span className="material-symbols-outlined text-[40px] text-secondary-fixed mb-6 block">
                      {getIcon(service.icon, idx)}
                    </span>
                    <div className="text-[11px] font-bold text-secondary-fixed tracking-widest uppercase mb-2">
                      {service.code || `0${idx + 1} // SOVEREIGN ENGINE`}
                    </div>
                    <h3 className="text-2xl font-bold font-display text-white mb-3">
                      {service.title}
                    </h3>
                    <p className="text-sm text-on-primary-fixed-variant leading-relaxed text-white/80">
                      {service.short_description || service.full_description}
                    </p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/20 relative z-10">
                    <Link
                      to="/services"
                      className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-secondary-fixed hover:text-white transition-colors"
                    >
                      <span>EXPLORE BLUEPRINTS</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={service.id}
                className="group bg-surface-container-lowest p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/40 relative overflow-hidden flex flex-col justify-between min-h-[400px]"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-surface-variant rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500 opacity-40" />
                <div>
                  <span className="material-symbols-outlined text-[40px] text-primary mb-6 block">
                    {getIcon(service.icon, idx)}
                  </span>
                  <div className="text-[11px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">
                    {service.code || `0${idx + 1} // CORE CAPABILITY`}
                  </div>
                  <h3 className="text-2xl font-bold font-display text-primary mb-3">
                    {service.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {service.short_description || service.full_description}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-outline-variant">
                  <Link
                    to="/services"
                    className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-primary hover:text-secondary transition-colors"
                  >
                    <span>VIEW SPECIFICATIONS</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
