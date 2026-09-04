import React from 'react';
import { ProfileEducation } from '../../types';
import { GraduationCap, Calendar, Building2 } from 'lucide-react';

interface ProfileEducationSectionProps {
  education?: ProfileEducation[];
}

export const ProfileEducationSection: React.FC<ProfileEducationSectionProps> = ({ education }) => {
  if (!education || education.length === 0) return null;

  return (
    <section className="space-y-6 pt-8 border-t border-outline-variant/60">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary shrink-0 shadow-sm">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block">
            ACADEMIC PEDIGREE
          </span>
          <h2 className="text-xl md:text-2xl font-bold font-display text-primary tracking-tight">
            Education & Qualifications
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {education.map((item, idx) => {
          const yearDisplay = item.start_year
            ? (item.end_year ? `${item.start_year} – ${item.end_year}` : `${item.start_year} – Present`)
            : item.end_year || '';

          return (
            <div
              key={item.id || idx}
              className="p-5 md:p-6 rounded-2xl bg-surface border border-outline-variant/80 shadow-sm hover:shadow-md hover:border-secondary/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base md:text-lg font-bold font-display text-primary group-hover:text-secondary transition-colors">
                      {item.degree}
                    </h3>
                    {item.field && (
                      <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
                        {item.field}
                      </p>
                    )}
                  </div>
                  {yearDisplay && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant text-[10px] font-mono font-bold text-on-surface-variant shrink-0">
                      <Calendar className="w-3 h-3 text-secondary" />
                      <span>{yearDisplay}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                  <Building2 className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span>{item.institution}</span>
                </div>

                {item.description && (
                  <p className="text-xs md:text-sm text-on-surface-variant font-body leading-relaxed pt-2 border-t border-outline-variant/40">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
