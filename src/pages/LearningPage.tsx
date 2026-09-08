import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { dataService } from '../lib/dataService';
import { LearningProgram } from '../types';
import { GraduationCap, BookOpen, Terminal, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LearningPage: React.FC = () => {
  const [programs, setPrograms] = useState<LearningProgram[] | null>(() => dataService.getCachedLearningPrograms());
  const [loading, setLoading] = useState<boolean>(() => dataService.getCachedLearningPrograms() === null);

  useEffect(() => {
    let isMounted = true;
    dataService.getLearningPrograms().then((data) => {
      if (isMounted) {
        setPrograms(data || []);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        setPrograms([]);
        setLoading(false);
      }
    });

    const handleUpdate = () => {
      dataService.getLearningPrograms(true).then((data) => {
        if (isMounted) {
          setPrograms(data || []);
          setLoading(false);
        }
      });
    };
    window.addEventListener('ravan_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('ravan_data_updated', handleUpdate);
    };
  }, []);

  const activePrograms = (programs || [])
    .filter(p => p.status !== 'draft' && p.status !== 'archived')
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <Layout>
      <SEOHead 
        title="Learning Academy & Engineering Tracks — Ravan Technologies"
        description="Master enterprise software architecture, sovereign AI deployment, and rapid prototyping through our 4-phase methodology."
        canonical="/learning"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Learning Academy", path: "/learning" }]}
      />

      {/* Header */}
      <section className="w-full max-w-container-max mx-auto px-gutter pt-24 pb-16">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
            ENGINEERING ACADEMY
          </span>
          <div className="h-[1px] w-12 bg-secondary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold font-display text-primary mb-6 leading-tight max-w-4xl">
          Learn. Build. Compete. Solve.
        </h1>
        <p className="text-base md:text-lg font-body text-on-surface-variant max-w-2xl leading-relaxed">
          Our specialized learning tracks equip software engineers and AI developers with battle-tested architectures required by modern enterprises.
        </p>
      </section>

      {/* Programs Grid */}
      <section className="w-full max-w-container-max mx-auto px-gutter pb-28">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10" aria-busy="true">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-8 md:p-10 rounded-2xl bg-surface border border-outline-variant/70 animate-pulse space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 w-28 bg-slate-700/60 rounded" />
                  <div className="h-4 w-24 bg-slate-700/60 rounded" />
                </div>
                <div className="h-8 w-3/4 bg-slate-800 rounded" />
                <div className="h-4 w-full bg-slate-800/60 rounded" />
                <div className="h-20 bg-slate-800/40 rounded-xl" />
              </div>
            ))}
          </div>
        ) : activePrograms.length === 0 ? (
          <div className="p-16 rounded-2xl bg-surface border border-outline-variant/70 text-center max-w-xl mx-auto my-12">
            <GraduationCap className="w-12 h-12 text-secondary/60 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-display text-primary mb-2">Academy Curriculums Under Review</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              Our specialized engineering tracks, deep-tech research cohorts, and developer mentorship pipelines are currently undergoing institutional curriculum review. Inquire directly for corporate training and cohort enrollments.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white text-xs font-semibold tracking-widest uppercase rounded hover:bg-primary-container transition-all shadow-md"
            >
              <span>ENQUIRE ABOUT ENGINEERING COHORTS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {activePrograms.map(prog => (
            <div key={prog.id} className="p-8 md:p-10 rounded-2xl bg-surface border border-outline-variant/70 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-2.5 py-0.5 bg-secondary text-[#0a192f] text-[10px] font-extrabold uppercase rounded">
                    {prog.badge || 'SPECIALIZATION'}
                  </span>
                  <span className="text-xs font-semibold text-secondary">
                    {prog.enrolled_count} Engineers Trained
                  </span>
                </div>

                <h3 className="text-2xl font-bold font-display text-primary mb-3">
                  {prog.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  {prog.description}
                </p>

                {/* Modules */}
                <div className="space-y-3 mb-6">
                  {prog.curriculum?.map(mod => (
                    <div key={mod.id} className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
                      <div className="flex items-center justify-between text-xs font-bold text-primary mb-1">
                        <span>{mod.title}</span>
                        <span className="text-[10px] text-secondary font-mono">{mod.duration}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {mod.topics?.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-surface-container text-primary text-[10px] rounded font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant/50 flex items-center justify-between">
                <span className="text-xs font-semibold text-primary">
                  Methodology: {prog.methodology_phase || '01 Learn'}
                </span>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded font-semibold text-xs tracking-widest uppercase hover:bg-primary-container transition-colors shadow"
                >
                  <span>APPLY FOR TRACK</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>
    </Layout>
  );
};
