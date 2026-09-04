import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <Layout>
      <SEOHead 
        title="404 — Page Not Found | Ravan Technologies"
        description="The requested page could not be located on this server."
        noindex={true}
      />
      <div className="min-h-[75vh] flex items-center justify-center px-gutter py-24">
        <div className="max-w-md w-full p-8 md:p-12 rounded-2xl bg-surface border border-outline-variant text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary mx-auto mb-6">
            <Compass className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-secondary block mb-2">
            HTTP 404 ERROR
          </span>

          <h1 className="text-2xl md:text-3xl font-bold font-display text-primary mb-3">
            Resource Not Found
          </h1>

          <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed mb-8">
            The page you requested is unavailable, does not exist, or has been moved within our infrastructure.
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-colors shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 text-secondary" />
            <span>Return to Public Home</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
};
