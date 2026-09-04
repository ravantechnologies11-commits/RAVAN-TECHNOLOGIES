import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { SmartImage } from '../components/common/SmartImage';
import { dataService } from '../lib/dataService';
import { ProjectItem } from '../types';
import { initialProjects } from '../data/initialData';
import { ArrowUpRight, FolderGit2, Sparkles, Filter } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    dataService.getProjects().then((data) => {
      if (isMounted) {
        setProjects(data);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    const handleUpdate = () => {
      dataService.getProjects().then((data) => {
        if (isMounted) setProjects(data);
      });
    };
    window.addEventListener('ravan_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('ravan_data_updated', handleUpdate);
    };
  }, []);

  const categories = ['ALL', 'FINTECH', 'LOGISTICS', 'AI / ML', 'INFRASTRUCTURE', 'ENTERPRISE'];

  const filteredProjects = (projects || []).filter(p => {
    if (selectedCategory === 'ALL') return true;
    return (p.category || '').toUpperCase() === selectedCategory;
  });

  return (
    <Layout>
      <SEOHead 
        title="Projects & Case Studies — Ravan Technologies"
        description="Explore enterprise software architectures, low-latency financial systems, and AI models engineered by Ravan Technologies."
        canonical="/projects"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Projects", path: "/projects" }]}
      />

      <section className="w-full max-w-container-max mx-auto px-gutter pt-24 pb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
            CASE STUDIES & DELIVERABLES
          </span>
          <div className="h-[1px] w-12 bg-secondary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold font-display text-primary mb-6 leading-tight max-w-4xl">
          Architectural Case Studies in Mission-Critical Systems.
        </h1>
        <p className="text-base md:text-lg font-body text-on-surface-variant max-w-2xl leading-relaxed">
          High-performance distributed systems, low-latency trading cores, predictive logistics meshes, and private AI inference engines built for enterprise scale.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mt-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="w-full max-w-container-max mx-auto px-gutter pb-28">
        {loading || !projects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10" aria-busy="true">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-surface rounded-2xl overflow-hidden border border-outline-variant/70 animate-pulse">
                <div className="h-64 bg-slate-800/50" />
                <div className="p-8 space-y-4">
                  <div className="h-4 w-32 bg-slate-700/60 rounded" />
                  <div className="h-8 w-3/4 bg-slate-800 rounded" />
                  <div className="h-4 w-full bg-slate-800/60 rounded" />
                  <div className="h-4 w-2/3 bg-slate-800/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-16 rounded-2xl bg-surface border border-outline-variant text-center max-w-xl mx-auto my-12">
            <FolderGit2 className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold font-display text-primary mb-2">No Case Studies Found</h3>
            <p className="text-xs text-on-surface-variant">There are currently no published projects matching the selected category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {filteredProjects.map(p => (
              <div
                key={p.id}
                className="bg-surface rounded-2xl overflow-hidden border border-outline-variant/70 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/10] relative overflow-hidden bg-slate-900">
                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                      <span className="px-3 py-1 bg-surface/90 backdrop-blur text-primary text-[10px] font-bold uppercase rounded shadow">
                        {p.project_number}
                      </span>
                      <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase rounded shadow">
                        {p.category}
                      </span>
                    </div>
                    <SmartImage
                      src={p.image_url}
                      alt={p.title}
                      className="group-hover:scale-105 transition-transform duration-700"
                      containerClassName="w-full h-full"
                      fallbackText={p.title}
                    />
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-bold font-display text-primary mb-4">
                      {p.title}
                    </h3>
                    <div className="space-y-3 mb-6 text-xs text-on-surface-variant leading-relaxed">
                      <div>
                        <strong className="text-primary font-bold uppercase tracking-wider text-[10px] block mb-0.5">Problem:</strong>
                        <p>{p.problem}</p>
                      </div>
                      <div>
                        <strong className="text-primary font-bold uppercase tracking-wider text-[10px] block mb-0.5">Solution:</strong>
                        <p>{p.solution}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {p.technologies?.map(t => (
                        <span key={t} className="px-2 py-0.5 bg-surface-container text-primary text-[11px] font-semibold rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-0 border-t border-outline-variant/50 flex items-center justify-between mt-auto">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">OUTCOME METRIC</div>
                    <div className="text-xl font-bold font-display text-secondary">
                      {p.outcome_metric} <span className="text-xs font-normal text-on-surface-variant">{p.outcome_label}</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};
