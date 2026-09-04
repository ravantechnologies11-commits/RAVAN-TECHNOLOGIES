import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { SmartImage } from '../components/common/SmartImage';
import { dataService } from '../lib/dataService';
import { BlogPost } from '../types';
import { initialBlogPosts } from '../data/initialData';
import { ArrowRight, Clock, Newspaper } from 'lucide-react';

export const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    dataService.getBlogPosts().then((data) => {
      if (isMounted) {
        setPosts(data);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    const handleUpdate = () => {
      dataService.getBlogPosts().then((data) => {
        if (isMounted) setPosts(data);
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
        title="Engineering Whitepapers & News — Ravan Technologies"
        description="Architectural insights, distributed systems whitepapers, and sovereign AI directives from our engineering team."
        canonical="/blog"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Engineering Whitepapers", path: "/blog" }]}
      />

      <section className="w-full max-w-container-max mx-auto px-gutter pt-24 pb-16">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
            ENGINEERING WHITEPAPERS
          </span>
          <div className="h-[1px] w-12 bg-secondary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold font-display text-primary mb-6 leading-tight max-w-4xl">
          Dispatches from the Sovereign Frontier.
        </h1>
      </section>

      <section className="w-full max-w-container-max mx-auto px-gutter pb-28 space-y-12">
        {loading || !posts ? (
          <div className="space-y-8" aria-busy="true">
            {[1, 2].map(i => (
              <div key={i} className="p-8 md:p-12 rounded-2xl bg-surface border border-outline-variant animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4">
                  <div className="h-4 w-32 bg-slate-700/60 rounded" />
                  <div className="h-8 w-3/4 bg-slate-800 rounded" />
                  <div className="h-4 w-full bg-slate-800/60 rounded" />
                </div>
                <div className="lg:col-span-4 h-48 bg-slate-800/50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-16 rounded-2xl bg-surface border border-outline-variant text-center max-w-xl mx-auto my-12">
            <Newspaper className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold font-display text-primary mb-2">No Whitepapers Published</h3>
            <p className="text-xs text-on-surface-variant">There are currently no engineering whitepapers published.</p>
          </div>
        ) : (
          posts.map(p => (
            <article key={p.id} className="p-8 md:p-12 rounded-2xl bg-surface border border-outline-variant shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-3">
                  <span className="font-semibold text-secondary">{p.author_name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {p.read_time_minutes} min read</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-primary mb-3">
                  {p.title}
                </h2>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  {p.excerpt}
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.tags?.map(t => (
                    <span key={t} className="px-2.5 py-0.5 bg-surface-container text-primary text-xs font-semibold rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4 h-56 rounded-xl overflow-hidden border border-outline-variant shadow">
                <SmartImage
                  src={p.cover_image_url}
                  alt={p.title}
                  containerClassName="w-full h-full"
                  fallbackText={p.title}
                />
              </div>
            </article>
          ))
        )}
      </section>
    </Layout>
  );
};
