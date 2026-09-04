import React from 'react';
import { ProfileProject } from '../../types';
import { Layers, ExternalLink, Github, Sparkles, CheckCircle, Clock } from 'lucide-react';

interface ProfileProjectsSectionProps {
  projects?: ProfileProject[];
}

export const ProfileProjectsSection: React.FC<ProfileProjectsSectionProps> = ({ projects }) => {
  if (!projects || projects.length === 0) return null;

  // Filter only published projects and sort by display_order
  const displayProjects = projects
    .filter(p => p.is_published !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  if (displayProjects.length === 0) return null;

  return (
    <section className="space-y-6 pt-8 border-t border-outline-variant/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary shrink-0 shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block">
              PORTFOLIO & DELIVERABLES
            </span>
            <h2 className="text-xl md:text-2xl font-bold font-display text-primary tracking-tight">
              Strategic Deliveries & Projects
            </h2>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full border border-outline-variant">
          {displayProjects.length} {displayProjects.length === 1 ? 'Project' : 'Projects'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayProjects.map((proj, idx) => {
          const status = (proj.status || 'Completed').toLowerCase();
          const isCompleted = status.includes('complete') || status.includes('prod') || status.includes('live');
          const dateRange = proj.start_date
            ? (proj.end_date ? `${proj.start_date} – ${proj.end_date}` : `${proj.start_date} – Present`)
            : proj.end_date || '';

          return (
            <div
              key={proj.id || idx}
              className="p-6 rounded-2xl bg-surface border border-outline-variant/80 shadow-sm hover:shadow-xl hover:border-secondary/50 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header: Title, Status, and Index Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-secondary tracking-widest">
                        PROJECT 0{idx + 1}
                      </span>
                      {proj.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/30 text-[9px] font-bold uppercase tracking-wider">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base md:text-lg font-bold font-display text-primary group-hover:text-secondary transition-colors line-clamp-2">
                      {proj.title}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0 flex items-center gap-1 ${
                      isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span>{proj.status || 'Active'}</span>
                  </span>
                </div>

                {/* Role & Dates */}
                {(proj.role || dateRange) && (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs py-2 border-y border-outline-variant/40">
                    {proj.role && (
                      <span className="font-semibold text-primary">
                        Role: <span className="text-on-surface-variant font-normal">{proj.role}</span>
                      </span>
                    )}
                    {dateRange && (
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {dateRange}
                      </span>
                    )}
                  </div>
                )}

                {/* Description */}
                {proj.short_description && (
                  <p className="text-xs md:text-sm text-on-surface-variant font-body leading-relaxed">
                    {proj.short_description}
                  </p>
                )}

                {/* Tech Stack Chips */}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                      Technologies & Stack
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant text-[11px] font-medium text-primary shadow-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Links Footer */}
              {(proj.project_url || proj.github_url) && (
                <div className="pt-4 mt-4 border-t border-outline-variant/50 flex flex-wrap items-center gap-3">
                  {proj.project_url && (
                    <a
                      href={proj.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-container text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                    >
                      <span>View Project</span>
                      <ExternalLink className="w-3 h-3 text-secondary" />
                    </a>
                  )}
                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-semibold text-primary transition-colors"
                    >
                      <Github className="w-3.5 h-3.5 text-secondary" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
