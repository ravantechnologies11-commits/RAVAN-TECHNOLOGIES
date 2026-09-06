import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { SmartImage } from '../components/common/SmartImage';
import { dataService } from '../lib/dataService';
import { EcosystemItem } from '../types';
import { initialEcosystem } from '../data/initialData';
import { Building2, Clapperboard, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EcosystemPage: React.FC = () => {
  const [items, setItems] = useState<EcosystemItem[]>(() => dataService.getEcosystemSync());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    dataService.getEcosystem().then((data) => {
      if (isMounted && data) {
        setItems(data);
      }
    }).catch(() => {});

    const handleUpdate = () => {
      dataService.getEcosystem().then((data) => {
        if (isMounted) setItems(data);
      });
    };
    window.addEventListener('ravan_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('ravan_data_updated', handleUpdate);
    };
  }, []);

  const techPark = items ? (items.find(i => i.type === 'hub') || items[0]) : null;
  const filmStudio = items ? (items.find(i => i.type === 'studio') || items[1]) : null;

  return (
    <Layout>
      <SEOHead 
        title="The Ravan Ecosystem — Tech Park & Film Studio"
        description="Discover our 120,000+ sq ft physical R&D campus and virtual production LED volume studio."
        canonical="/ecosystem"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Ecosystem", path: "/ecosystem" }]}
      />

      <section className="w-full max-w-container-max mx-auto px-gutter pt-24 pb-16">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
            THE DUAL ENGINE
          </span>
          <div className="h-[1px] w-12 bg-secondary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold font-display text-primary mb-6 leading-tight max-w-4xl">
          Physical Computing Infrastructure & Cinematic Virtual Production.
        </h1>
      </section>

      {loading || !items ? (
        <section className="w-full max-w-container-max mx-auto px-gutter pb-28 space-y-20 animate-pulse" aria-busy="true">
          <div className="p-8 md:p-12 rounded-2xl bg-surface border border-outline-variant grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <div className="h-4 w-32 bg-slate-700/60 rounded" />
              <div className="h-10 w-3/4 bg-slate-800 rounded" />
              <div className="h-4 w-full bg-slate-800/60 rounded" />
              <div className="h-20 bg-slate-800/40 rounded-xl" />
            </div>
            <div className="lg:col-span-5 h-72 bg-slate-800/50 rounded-xl" />
          </div>
          <div className="p-8 md:p-12 rounded-2xl bg-surface border border-outline-variant grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <div className="h-4 w-32 bg-slate-700/60 rounded" />
              <div className="h-10 w-3/4 bg-slate-800 rounded" />
              <div className="h-4 w-full bg-slate-800/60 rounded" />
              <div className="h-20 bg-slate-800/40 rounded-xl" />
            </div>
            <div className="lg:col-span-5 h-72 bg-slate-800/50 rounded-xl" />
          </div>
        </section>
      ) : (
        <>
          {/* Tech Park Section */}
      <section id="tech-park" className="w-full max-w-container-max mx-auto px-gutter pb-20 scroll-mt-28">
        <div className="p-8 md:p-12 rounded-2xl bg-surface border border-outline-variant shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <span className="px-3 py-1 bg-secondary text-white text-[10px] font-bold uppercase tracking-widest rounded inline-block mb-4">
              ENTERPRISE R&D CAMPUS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-primary mb-3">
              {techPark?.name}
            </h2>
            <p className="text-sm font-semibold text-secondary mb-4">
              {techPark?.tagline}
            </p>
            <p className="text-sm md:text-base text-on-surface-variant leading-relaxed mb-6">
              {techPark?.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {techPark?.specifications?.map((spec, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded font-semibold text-xs tracking-widest uppercase hover:bg-primary-container transition-colors shadow"
            >
              <span>INQUIRE CAMPUS SPACE</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-5 aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-outline-variant">
            <SmartImage
              src={techPark?.image_url}
              alt={techPark?.name || 'Ravan Tech Park'}
              containerClassName="w-full h-full"
              fallbackText={techPark?.name || 'Ravan Tech Park'}
            />
          </div>
        </div>
      </section>

      {/* Film Studio Section */}
      <section id="film-studio" className="w-full max-w-container-max mx-auto px-gutter pb-28 scroll-mt-28">
        <div className="p-8 md:p-12 rounded-2xl bg-surface border border-outline-variant shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 lg:order-1 aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-outline-variant">
            <SmartImage
              src={filmStudio?.image_url}
              alt={filmStudio?.name || 'Ravan Film Studio'}
              containerClassName="w-full h-full"
              fallbackText={filmStudio?.name || 'Ravan Film Studio'}
            />
          </div>

          <div className="lg:col-span-7 lg:order-2">
            <span className="px-3 py-1 bg-secondary text-white text-[10px] font-bold uppercase tracking-widest rounded inline-block mb-4">
              VIRTUAL PRODUCTION & MEDIA
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-primary mb-3">
              {filmStudio?.name}
            </h2>
            <p className="text-sm font-semibold text-secondary mb-4">
              {filmStudio?.tagline}
            </p>
            <p className="text-sm md:text-base text-on-surface-variant leading-relaxed mb-6">
              {filmStudio?.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {filmStudio?.specifications?.map((spec, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded font-semibold text-xs tracking-widest uppercase hover:bg-primary-container transition-colors shadow"
            >
              <span>INQUIRE PRODUCTION STAGES</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
        </>
      )}
    </Layout>
  );
};
