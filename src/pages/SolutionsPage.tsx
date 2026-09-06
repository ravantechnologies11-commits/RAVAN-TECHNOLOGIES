import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { SmartImage } from '../components/common/SmartImage';
import { dataService } from '../lib/dataService';
import { SolutionItem } from '../types';
import { initialSolutions } from '../data/initialData';
import { CheckCircle2, ArrowRight, Layers, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SolutionsPage: React.FC = () => {
  const [solutions, setSolutions] = useState<SolutionItem[]>(() => dataService.getSolutionsSync());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    dataService.getSolutions().then((data) => {
      if (isMounted && data) {
        setSolutions(data);
      }
    }).catch(() => {});

    const handleUpdate = () => {
      dataService.getSolutions(true).then((data) => {
        if (isMounted) setSolutions(data);
      });
    };
    window.addEventListener('ravan_data_updated', handleUpdate);
    window.addEventListener('ravan_solutions_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('ravan_data_updated', handleUpdate);
      window.removeEventListener('ravan_solutions_updated', handleUpdate);
    };
  }, []);

  return (
    <Layout>
      <SEOHead 
        title="Enterprise Solutions & Blueprints — Ravan Technologies"
        description="Explore sovereign AI governance, low-latency financial systems, and decentralized supply chain architectures."
        canonical="/solutions"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Solutions", path: "/solutions" }]}
      />

      <section className="w-full max-w-container-max mx-auto px-gutter pt-24 pb-16">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
            PROVEN ARCHITECTURAL BLUEPRINTS
          </span>
          <div className="h-[1px] w-12 bg-secondary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold font-display text-primary mb-6 leading-tight max-w-4xl">
          Enterprise Systems Built for Extreme Scale and Sovereignty.
        </h1>
        <p className="text-base md:text-lg font-body text-on-surface-variant max-w-2xl leading-relaxed">
          Pre-validated architectural frameworks designed to solve high-concurrency, security, and algorithmic efficiency challenges across institutional sectors.
        </p>
      </section>

      <section className="w-full max-w-container-max mx-auto px-gutter pb-28 space-y-16">
        {loading || !solutions ? (
          <div className="space-y-12" aria-busy="true">
            {[1, 2].map(i => (
              <div key={i} className="p-8 md:p-12 rounded-2xl bg-surface border border-outline-variant animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-4">
                  <div className="h-4 w-28 bg-slate-700/60 rounded" />
                  <div className="h-8 w-3/4 bg-slate-800 rounded" />
                  <div className="h-4 w-full bg-slate-800/60 rounded" />
                  <div className="h-20 bg-slate-800/40 rounded-xl" />
                </div>
                <div className="lg:col-span-5 h-64 bg-slate-800/50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          solutions
            .filter(sol => sol.status !== 'draft' && sol.status !== 'archived')
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .map((sol, idx) => (
          <div
            key={sol.id}
            className="p-8 md:p-12 rounded-2xl bg-surface border border-outline-variant shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className={`lg:col-span-7 ${idx % 2 === 1 ? 'lg:order-2' : 'lg:order-1'}`}>
              <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 block">
                {sol.category}
              </span>
              <h2 className="text-2xl md:text-4xl font-bold font-display text-primary mb-4">
                {sol.title}
              </h2>
              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed mb-6">
                {sol.description}
              </p>

              <div className="p-4 rounded-xl bg-surface-container mb-6 border border-outline-variant/50">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Architecture Specifications:
                </div>
                <p className="text-xs text-on-surface-variant font-mono leading-relaxed">
                  {sol.architecture_details}
                </p>
                {sol.problem && (
                  <div className="mt-3 pt-3 border-t border-outline-variant/30 text-xs text-on-surface-variant">
                    <span className="font-bold text-primary uppercase tracking-wider">Institutional Challenge:</span> {sol.problem}
                  </div>
                )}
              </div>

              {sol.benefits && sol.benefits.length > 0 && (
                <div className="space-y-2 mb-6">
                  {sol.benefits.map((b, bi) => (
                    <div key={bi} className="flex items-start gap-2 text-xs text-on-surface font-medium">
                      <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}

              {sol.technologies && sol.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-8">
                  {sol.technologies.map(tech => (
                    <span key={tech} className="px-2.5 py-1 bg-surface-container text-primary text-[11px] font-semibold rounded-md border border-outline-variant/50">
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <Link
                to={sol.cta_url || "/contact"}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded font-semibold text-xs tracking-widest uppercase hover:bg-primary-container transition-colors shadow"
              >
                <span>{sol.cta_text || "REQUEST BLUEPRINT SPECS"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className={`lg:col-span-5 aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-outline-variant ${
              idx % 2 === 1 ? 'lg:order-1' : 'lg:order-2'
            }`}>
              <SmartImage
                src={sol.image_url}
                alt={sol.title}
                containerClassName="w-full h-full"
                fallbackText={sol.title}
              />
            </div>
          </div>
        ))
      )}
      </section>
    </Layout>
  );
};
