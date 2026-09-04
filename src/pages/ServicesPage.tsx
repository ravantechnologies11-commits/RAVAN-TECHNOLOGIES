import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { SmartImage } from '../components/common/SmartImage';
import { WorkWithUsModal } from '../components/common/WorkWithUsModal';
import { dataService } from '../lib/dataService';
import { ServiceItem } from '../types';
import { initialServices } from '../data/initialData';
import { ArrowRight, CheckCircle2, ArrowUpRight } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    dataService.getServices().then((data) => {
      if (isMounted) {
        setServices(data);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    const handleUpdate = () => {
      dataService.getServices(true).then((data) => {
        if (isMounted) setServices(data);
      });
    };
    window.addEventListener('ravan_data_updated', handleUpdate);
    window.addEventListener('ravan_services_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('ravan_data_updated', handleUpdate);
      window.removeEventListener('ravan_services_updated', handleUpdate);
    };
  }, []);

  return (
    <Layout>
      <SEOHead 
        title="Services & Capabilities — Ravan Technologies"
        description="Comprehensive enterprise software engineering, sovereign AI/ML models, digital platforms, and automation architectures."
        canonical="/services"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Services", path: "/services" }]}
      />

      {/* Header */}
      <section className="w-full max-w-container-max mx-auto px-gutter pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
                EXPERTISE & CAPABILITIES
              </span>
              <div className="h-[1px] w-12 bg-secondary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-display text-primary mb-6 leading-tight">
              Architecting sovereign intelligence for the modern enterprise.
            </h1>
            <p className="text-base md:text-lg font-body text-on-surface-variant max-w-2xl leading-relaxed">
              We engineer stable, high-performance systems that blend institutional reliability with cutting-edge artificial intelligence. Our capabilities span the full lifecycle of digital transformation.
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-4 bg-primary text-white rounded font-semibold text-xs tracking-widest uppercase hover:bg-primary-container transition-all shadow-md flex items-center gap-3"
            >
              <span>INITIATE CONSULTATION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="w-full max-w-container-max mx-auto px-gutter py-12 pb-28">
        {loading || !services ? (
          <div className="flex flex-col gap-12" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-8 md:p-12 rounded-2xl bg-surface border border-outline-variant/70 animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-4">
                  <div className="h-3 w-24 bg-slate-700/60 rounded" />
                  <div className="h-8 w-3/4 bg-slate-800 rounded" />
                  <div className="h-4 w-full bg-slate-800/60 rounded" />
                  <div className="h-4 w-5/6 bg-slate-800/60 rounded" />
                </div>
                <div className="lg:col-span-7 h-64 bg-slate-800/40 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-24">
            {services
              .filter(srv => srv.status !== 'draft' && srv.status !== 'archived')
              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
              .map((srv, idx) => (
            <div
              key={srv.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center p-8 md:p-12 rounded-2xl bg-surface border border-outline-variant/70 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Content */}
              <div className={`lg:col-span-5 flex flex-col justify-center ${
                idx % 2 === 1 ? 'lg:order-2' : 'lg:order-1'
              }`}>
                <div className="text-[11px] font-bold text-secondary tracking-widest uppercase mb-2">
                  {srv.code}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-primary mb-3">
                  {srv.title}
                </h2>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  {srv.full_description || srv.short_description}
                </p>

                {/* Features */}
                <div className="flex flex-col gap-3 mb-6">
                  {srv.features?.map((f, fi) => (
                    <div key={fi} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                        {f.icon || 'check_circle'}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                          {f.title}
                        </h4>
                        <p className="text-xs text-on-surface-variant">
                          {f.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-outline-variant flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {srv.technologies?.slice(0, 3).map(tech => (
                      <span key={tech} className="px-2 py-0.5 bg-surface-container text-primary text-[11px] font-semibold rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedService(srv);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors"
                  >
                    <span>{srv.cta_text || 'CONSULT'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Image & Metric */}
              <div className={`lg:col-span-7 relative h-[380px] rounded-xl overflow-hidden shadow-lg border border-outline-variant ${
                idx % 2 === 1 ? 'lg:order-1' : 'lg:order-2'
              }`}>
                <SmartImage
                  src={srv.image_url}
                  alt={srv.title}
                  containerClassName="w-full h-full"
                  fallbackText={srv.title}
                />
                {srv.metric_value && (
                  <div className="absolute bottom-4 right-4 bg-surface/90 backdrop-blur-md p-3.5 rounded border border-outline-variant shadow flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        {srv.metric_label || 'SLA'}
                      </div>
                      <div className="text-xl font-bold font-display text-primary">
                        {srv.metric_value}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        )}
      </section>

      <WorkWithUsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        defaultInquiryType={selectedService ? selectedService.title : 'Enterprise Engineering'}
      />
    </Layout>
  );
};
