import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Code2, Trophy, CheckCircle2 } from 'lucide-react';

export const LearningMethodology: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Learn',
      desc: 'Acquire foundational knowledge through structured modules, interactive sandboxes, and expert seminars.',
      icon: 'school'
    },
    {
      num: '02',
      title: 'Build',
      desc: 'Apply concepts immediately by constructing production prototypes and contributing to core infrastructure.',
      icon: 'terminal'
    },
    {
      num: '03',
      title: 'Compete',
      desc: 'Test your architectures in high-stakes hackathons and algorithmic benchmarks against global peers.',
      icon: 'emoji_events'
    },
    {
      num: '04',
      title: 'Solve',
      desc: 'Deploy sovereign solutions to address complex, real-world enterprise constraints and operational bottlenecks.',
      icon: 'verified'
    }
  ];

  return (
    <section className="py-28 bg-surface relative border-t border-outline-variant/60">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[1px] w-8 bg-secondary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
                LEARNING METHODOLOGY
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-primary tracking-tight">
              Rigorous 4-Phase Progression
            </h2>
          </div>
          <Link
            to="/learning"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-secondary hover:text-primary transition-colors"
          >
            <span>VIEW CURRICULUM</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Progression Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((s, idx) => (
            <div
              key={s.num}
              className={`flex flex-col p-6 rounded-xl border border-outline-variant/60 bg-surface-container-lowest hover:shadow-lg transition-all duration-300 group ${
                idx === 3 ? 'border-secondary/50 bg-secondary-container/10' : ''
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                <span className="font-display font-bold text-lg">{s.num}</span>
              </div>
              <h3 className="text-xl font-bold font-display text-primary mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
