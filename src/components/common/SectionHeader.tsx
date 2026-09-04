import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  alignment?: 'left' | 'center';
  dark?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  alignment = 'left',
  dark = false
}) => {
  return (
    <div className={`mb-16 flex flex-col ${alignment === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
      {eyebrow && (
        <div className="flex items-center gap-3 mb-4">
          <div className={`h-[1px] w-8 ${dark ? 'bg-secondary-fixed' : 'bg-secondary'}`}></div>
          <span className={`text-xs font-semibold tracking-widest uppercase ${dark ? 'text-secondary-fixed' : 'text-secondary'}`}>
            {eyebrow}
          </span>
          <div className={`h-[1px] w-8 ${dark ? 'bg-secondary-fixed' : 'bg-secondary'}`}></div>
        </div>
      )}
      <h2 className={`text-3xl md:text-5xl font-bold font-display tracking-tight leading-tight ${dark ? 'text-white' : 'text-primary'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base md:text-lg max-w-2xl leading-relaxed ${dark ? 'text-white/80' : 'text-on-surface-variant'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
