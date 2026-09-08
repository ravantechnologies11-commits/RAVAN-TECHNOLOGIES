import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { dataService } from '../lib/dataService';
import { AIMLModel } from '../types';
import { WorkWithUsModal } from '../components/common/WorkWithUsModal';
import { 
  Cpu, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  Layers, 
  Server, 
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AIMLPage: React.FC = () => {
  const [models, setModels] = useState<AIMLModel[]>(() => dataService.getAIMLModelsSync());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    dataService.getAIMLModels().then(data => {
      if (isMounted && data && data.length > 0) {
        setModels(data);
      }
    }).catch(() => {});

    const handleUpdate = () => {
      dataService.getAIMLModels(true).then(data => {
        if (isMounted && data) setModels(data);
      });
    };

    window.addEventListener('ravan_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('ravan_data_updated', handleUpdate);
    };
  }, []);

  const publishedModels = (models || [])
    .filter(m => m.status === 'published')
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <Layout>
      <SEOHead 
        title="Applied AI & Sovereign Machine Learning — Ravan Technologies"
        description="Architecting confidential compute LLMs, reinforcement learning graph systems, and on-premise AI acceleration infrastructure for sovereign enterprise scale."
        canonical="/ai-ml"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Applied AI & ML', path: '/ai-ml' }
        ]}
      />

      {/* Hero Section */}
      <section className="w-full relative bg-surface overflow-hidden pt-24 pb-20 px-gutter max-w-container-max mx-auto border-b border-outline-variant">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8 flex flex-col z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                SOVEREIGN INTELLIGENCE RESEARCH & LABS
              </span>
              <div className="h-[1px] w-12 bg-secondary" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold font-display text-primary mb-6 leading-tight tracking-tight">
              Air-Gapped Models & High-Throughput Inference Engines.
            </h1>

            <p className="text-base md:text-lg font-body text-on-surface-variant max-w-2xl leading-relaxed mb-8">
              Ravan Technologies engineers sovereign artificial intelligence pipelines, on-premise transformer fine-tunes, and zero-allocation algorithmic models designed for zero data leakage and mission-critical enterprise autonomy.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-all shadow-md"
              >
                <span>DEPLOY SOVEREIGN COMPUTE</span>
                <ArrowRight className="w-4 h-4 text-secondary" />
              </button>
              <Link
                to="/solutions"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-surface-container text-primary hover:text-secondary rounded-lg font-bold text-xs uppercase tracking-widest border border-outline-variant hover:border-secondary transition-colors"
              >
                <span>ENTERPRISE BLUEPRINTS</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Security Architecture</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">AIR-GAPPED</span>
              </div>
              <div className="space-y-3 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
                  <span>Confidential compute enclaves (Intel SGX / AMD SEV)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-secondary shrink-0" />
                  <span>Zero data retention guarantee for enterprise weights</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-secondary shrink-0" />
                  <span>Direct C++ / CUDA / Rust kernel inference acceleration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Model Catalog Grid */}
      <section className="py-24 max-w-container-max mx-auto px-gutter">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
                PRODUCTION INFERENCE CATALOG
              </span>
              <div className="h-px w-8 bg-secondary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-primary tracking-tight">
              Sovereign Machine Learning Models
            </h2>
          </div>
          <p className="text-xs md:text-sm text-on-surface-variant max-w-md">
            Validated models engineered for on-premise clusters at Ravan Tech Park and institutional client environments.
          </p>
        </div>

        {publishedModels.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {publishedModels.map(model => (
              <div
                key={model.id}
                className="p-8 rounded-2xl bg-surface border border-outline-variant hover:border-secondary/60 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/30 text-[10px] font-bold uppercase tracking-wider">
                          {model.model_type}
                        </span>
                        {model.version && (
                          <span className="px-2 py-0.5 rounded bg-surface-container text-slate-400 font-mono text-[10px]">
                            {model.version}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold font-display text-primary">
                        {model.name}
                      </h3>
                      <p className="text-xs text-secondary font-mono mt-0.5">
                        Engineered by {model.provider || 'Ravan Technologies'}
                      </p>
                    </div>

                    {model.latency && (
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block uppercase tracking-widest">Inference Latency</span>
                        <span className="text-sm font-mono font-bold text-emerald-400">{model.latency}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {model.description}
                  </p>

                  {model.capabilities && model.capabilities.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                        Core Architectural Capabilities
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {model.capabilities.map((cap, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant/60 text-xs font-semibold text-primary"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {model.use_cases && model.use_cases.length > 0 && (
                    <div className="pt-4 border-t border-outline-variant/60">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                        Institutional Use Cases
                      </span>
                      <ul className="space-y-1.5 text-xs text-on-surface-variant">
                        {model.use_cases.map((uc, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                            <span>{uc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-outline-variant/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase text-secondary hover:text-primary transition-colors"
                  >
                    <span>REQUEST BENCHMARK & ACCESS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 md:p-16 text-center rounded-2xl bg-surface border border-outline-variant max-w-2xl mx-auto space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto text-secondary shadow-sm">
              <Cpu className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-display text-primary">
                Sovereign Model Benchmarks Under Institutional Validation
              </h3>
              <p className="text-xs md:text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
                Institutional model weights, confidential compute transformers, and hardware-accelerated inference pipelines are currently undergoing validation at Ravan Tech Park. Direct architectural specifications and benchmark access are available upon institutional request.
              </p>
            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-all shadow-md"
              >
                <span>REQUEST BLUEPRINT & ACCESS</span>
                <ArrowRight className="w-4 h-4 text-secondary" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Engagement Modal */}
      <WorkWithUsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultInquiryType="AI / ML Infrastructure"
      />
    </Layout>
  );
};
