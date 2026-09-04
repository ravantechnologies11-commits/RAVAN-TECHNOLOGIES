import React from 'react';
import { ProfileSkill, SkillCategory } from '../../types';
import { Cpu, Terminal, Sparkles, Globe, Smartphone, Cloud, Database, GitBranch, Layers, Palette, Users, Wrench } from 'lucide-react';

interface ProfileSkillsSectionProps {
  skills?: ProfileSkill[];
}

const CATEGORY_ORDER: SkillCategory[] = [
  'Programming',
  'AI / ML',
  'Web Development',
  'Mobile Development',
  'Hardware',
  'Embedded Systems',
  'Cloud',
  'Database',
  'DevOps',
  'Design',
  'Management',
  'Other'
];

const CATEGORY_ICONS: Record<SkillCategory, React.ReactNode> = {
  'Programming': <Terminal className="w-4 h-4 text-secondary" />,
  'AI / ML': <Sparkles className="w-4 h-4 text-secondary" />,
  'Web Development': <Globe className="w-4 h-4 text-secondary" />,
  'Mobile Development': <Smartphone className="w-4 h-4 text-secondary" />,
  'Hardware': <Cpu className="w-4 h-4 text-secondary" />,
  'Embedded Systems': <Cpu className="w-4 h-4 text-secondary" />,
  'Cloud': <Cloud className="w-4 h-4 text-secondary" />,
  'Database': <Database className="w-4 h-4 text-secondary" />,
  'DevOps': <GitBranch className="w-4 h-4 text-secondary" />,
  'Design': <Palette className="w-4 h-4 text-secondary" />,
  'Management': <Users className="w-4 h-4 text-secondary" />,
  'Other': <Wrench className="w-4 h-4 text-secondary" />
};

export const ProfileSkillsSection: React.FC<ProfileSkillsSectionProps> = ({ skills }) => {
  if (!skills || skills.length === 0) return null;

  // Group skills strictly by category
  const grouped = skills.reduce<Record<string, ProfileSkill[]>>((acc, skill) => {
    const cat = skill.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  // Only display categories that actually contain skills
  const activeCategories = CATEGORY_ORDER.filter(cat => grouped[cat] && grouped[cat].length > 0);

  // Include any custom categories not in CATEGORY_ORDER
  Object.keys(grouped).forEach(cat => {
    if (!activeCategories.includes(cat as SkillCategory) && grouped[cat].length > 0) {
      activeCategories.push(cat as SkillCategory);
    }
  });

  if (activeCategories.length === 0) return null;

  return (
    <section className="space-y-6 pt-8 border-t border-outline-variant/60">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary shrink-0 shadow-sm">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block">
            CORE CAPABILITIES
          </span>
          <h2 className="text-xl md:text-2xl font-bold font-display text-primary tracking-tight">
            Skills & Technical Expertise
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeCategories.map(category => {
          const categorySkills = grouped[category].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
          const icon = CATEGORY_ICONS[category] || <Cpu className="w-4 h-4 text-secondary" />;

          return (
            <div
              key={category}
              className="p-5 rounded-2xl bg-surface border border-outline-variant/80 shadow-sm hover:border-secondary/40 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant/60">
                    {icon}
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                    {category}
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-semibold text-on-surface-variant">
                  {categorySkills.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {categorySkills.map((s, idx) => (
                  <span
                    key={s.id || idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-xs font-medium text-primary hover:border-secondary/50 hover:bg-surface-container-high transition-colors shadow-xs"
                  >
                    <span>{s.name}</span>
                    {s.proficiency && s.proficiency !== 'Standard' && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-80">
                        • {s.proficiency}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
