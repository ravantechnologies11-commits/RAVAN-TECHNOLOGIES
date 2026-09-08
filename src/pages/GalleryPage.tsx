import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { SmartImage } from '../components/common/SmartImage';
import { dataService } from '../lib/dataService';
import { GalleryAlbum } from '../types';
import { Images } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[] | null>(() => dataService.getCachedGalleryAlbums());
  const [loading, setLoading] = useState<boolean>(() => dataService.getCachedGalleryAlbums() === null);

  useEffect(() => {
    let isMounted = true;
    dataService.getGalleryAlbums().then((data) => {
      if (isMounted) {
        setAlbums(data || []);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        setAlbums([]);
        setLoading(false);
      }
    });

    const handleUpdate = () => {
      dataService.getGalleryAlbums(true).then((data) => {
        if (isMounted) {
          setAlbums(data || []);
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

  return (
    <Layout>
      <SEOHead 
        title="Visual Archives & Gallery — Ravan Technologies"
        description="Explore the campus, high-density computing clusters, virtual production sets, and hackathon arenas."
        canonical="/gallery"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Gallery", path: "/gallery" }]}
      />

      <section className="w-full max-w-container-max mx-auto px-gutter pt-24 pb-16">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
            VISUAL ARCHIVE
          </span>
          <div className="h-[1px] w-12 bg-secondary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold font-display text-primary mb-6 leading-tight max-w-4xl">
          Visual Archives & Campus Stills.
        </h1>
        <p className="text-base md:text-lg font-body text-on-surface-variant max-w-2xl leading-relaxed">
          High-fidelity photography documenting our R&D facilities, supercomputing nodes, LED volume stages, and engineering hackathons.
        </p>
      </section>

      <section className="w-full max-w-container-max mx-auto px-gutter pb-28">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" aria-busy="true">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface rounded-2xl overflow-hidden border border-outline-variant animate-pulse">
                <div className="aspect-[16/10] bg-slate-800/50" />
                <div className="p-6 space-y-3">
                  <div className="h-6 w-3/4 bg-slate-800 rounded" />
                  <div className="h-4 w-full bg-slate-800/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (!albums || albums.length === 0) ? (
          <div className="p-16 rounded-2xl bg-surface border border-outline-variant/70 text-center max-w-xl mx-auto my-12">
            <Images className="w-12 h-12 text-secondary/60 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-display text-primary mb-2">Visual Archives Under Curatorial Staging</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              High-resolution campus photography, hardware laboratory captures, and virtual production stage footage are currently undergoing curatorial preparation for public exhibition.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {albums.map(alb => (
              <div key={alb.id} className="bg-surface rounded-2xl overflow-hidden border border-outline-variant shadow-sm hover:shadow-xl transition-all group flex flex-col">
                <div className="aspect-[16/10] relative overflow-hidden bg-slate-900">
                  <SmartImage
                    src={alb.cover_image_url}
                    alt={alb.title}
                    className="group-hover:scale-105 transition-transform duration-500"
                    containerClassName="w-full h-full"
                    fallbackText={alb.title}
                  />
                  <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-primary">
                    {alb.category}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-display text-primary mb-2">
                      {alb.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {alb.description}
                    </p>
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
