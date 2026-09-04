import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ProjectItem } from '../../types';

import { SmartImage } from '../common/SmartImage';

interface SelectedProjectsPreviewProps {
  projects: ProjectItem[];
  isLoading?: boolean;
}

export const SelectedProjectsPreview: React.FC<SelectedProjectsPreviewProps> = ({ projects, isLoading = false }) => {
  if (isLoading) {
    return (
      <section className="py-28 bg-surface-container-lowest relative border-t border-outline-variant/60" aria-busy="true">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-3 w-28 bg-slate-700/60 rounded" />
              <div className="h-10 w-80 bg-slate-800 rounded" />
            </div>
            <div className="h-4 w-36 bg-slate-700/60 rounded" />
          </div>

          <div className="space-y-24">
            {[1, 2].map((idx) => (
              <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-pulse">
                <div className={`lg:col-span-7 h-[420px] rounded-xl bg-slate-800/50 border border-outline-variant ${idx % 2 === 1 ? 'lg:order-2' : 'lg:order-1'}`} />
                <div className={`lg:col-span-5 space-y-4 ${idx % 2 === 1 ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="h-8 w-3/4 bg-slate-800 rounded" />
                  <div className="h-4 w-full bg-slate-800/60 rounded" />
                  <div className="h-4 w-5/6 bg-slate-800/60 rounded" />
                  <div className="h-4 w-32 bg-slate-700/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayProjects = projects.slice(0, 2);

  return (
    <section className="py-28 bg-surface-container-lowest relative border-t border-outline-variant/60">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[1px] w-8 bg-secondary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
                SELECTED CASE STUDIES
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-primary tracking-tight">
              Engineering Sovereign Solutions.
            </h2>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-secondary hover:text-primary transition-colors"
          >
            <span>VIEW ALL PROJECTS</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-24">
          {displayProjects.map((p, idx) => (
            <div
              key={p.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center group"
            >
              {/* Visual Column */}
              <div className={`lg:col-span-7 relative h-[420px] rounded-xl overflow-hidden shadow-xl border border-outline-variant bg-[#07111e] ${
                idx % 2 === 1 ? 'lg:order-2' : 'lg:order-1'
              }`}>
                <div className="absolute top-6 left-6 z-20 flex gap-2">
                  <span className="px-3 py-1 bg-surface/90 backdrop-blur-md text-primary text-[10px] font-bold uppercase rounded shadow-sm">
                    {p.project_number}
                  </span>
                  <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase rounded shadow-sm">
                    {p.category}
                  </span>
                </div>
                {p.image_url ? (
                  <SmartImage
                    src={p.image_url}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    containerClassName="w-full h-full"
                    fallbackText={p.title}
                  />
                ) : (
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 bg-grid-pattern opacity-15" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07111e] via-[#07111e]/60 to-transparent" />
                  </div>
                )}
              </div>

              {/* Content Column */}
              <div className={`lg:col-span-5 flex flex-col justify-center ${
                idx % 2 === 1 ? 'lg:order-1' : 'lg:order-2'
              }`}>
                <h3 className="text-2xl md:text-3xl font-bold font-display text-primary mb-4">
                  {p.title}
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                      THE PROBLEM
                    </h4>
                    <p className="text-sm text-on-surface leading-relaxed">
                      {p.problem}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                      THE SOLUTION
                    </h4>
                    <p className="text-sm text-on-surface leading-relaxed">
                      {p.solution}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {p.technologies?.map(t => (
                      <span key={t} className="px-2.5 py-1 bg-surface-container text-primary text-xs font-semibold rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      OUTCOME
                    </div>
                    <div className="text-xl font-bold font-display text-secondary">
                      {p.outcome_metric} <span className="text-xs font-normal text-on-surface-variant">{p.outcome_label}</span>
                    </div>
                  </div>
                  <Link
                    to="/projects"
                    className="px-5 py-2.5 bg-primary text-white rounded font-semibold text-xs tracking-widest uppercase hover:bg-primary-container transition-colors flex items-center gap-1.5"
                  >
                    <span>VIEW DETAILS</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
