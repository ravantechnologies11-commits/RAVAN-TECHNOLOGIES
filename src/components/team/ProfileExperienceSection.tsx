import React from 'react';
import { ProfileExperience } from '../../types';
import { Briefcase, Calendar, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ProfileExperienceSectionProps {
  experiences?: ProfileExperience[];
}

export const ProfileExperienceSection: React.FC<ProfileExperienceSectionProps> = ({ experiences }) => {
  if (!experiences || experiences.length === 0) return null;

  return (
    <section className="space-y-6 pt-8 border-t border-outline-variant/60">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary shrink-0 shadow-sm">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block">
            CAREER TRAJECTORY
          </span>
          <h2 className="text-xl md:text-2xl font-bold font-display text-primary tracking-tight">
            Professional Experience
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {experiences.map((exp, idx) => {
          const isCurrent = exp.is_current || (!exp.end_date || exp.end_date.toLowerCase().includes('present'));
          const dateRange = exp.start_date
            ? (isCurrent ? `${exp.start_date} – ` : (exp.end_date ? `${exp.start_date} – ${exp.end_date}` : exp.start_date))
            : '';

          return (
            <div
              key={exp.id || idx}
              className="p-6 rounded-2xl bg-surface border border-outline-variant/80 shadow-sm hover:shadow-md hover:border-secondary/40 transition-all duration-300 space-y-4 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base md:text-lg font-bold font-display text-primary group-hover:text-secondary transition-colors">
                      {exp.role}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5 text-secondary shrink-0" />
                    <span>{exp.organization}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {dateRange && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant text-[11px] font-mono font-semibold text-on-surface-variant">
                      <Calendar className="w-3 h-3 text-secondary" />
                      <span>{dateRange}</span>
                    </div>
                  )}
                  {isCurrent && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      CURRENT
                    </span>
                  )}
                </div>
              </div>

              {exp.description && (
                <p className="text-xs md:text-sm text-on-surface-variant font-body leading-relaxed">
                  {exp.description}
                </p>
              )}

              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block">
                    Core Operational Responsibilities
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {exp.responsibilities.map((resp, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/60 flex items-start gap-2.5 text-xs text-on-surface-variant leading-relaxed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {exp.contributions && exp.contributions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block">
                    Key Institutional Achievements
                  </span>
                  <div className="space-y-1.5">
                    {exp.contributions.map((cont, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/60 flex items-start gap-2.5 text-xs text-on-surface-variant leading-relaxed"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                        <span>{cont}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
