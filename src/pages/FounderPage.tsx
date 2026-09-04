import React from 'react';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { SmartImage } from '../components/common/SmartImage';
import { SocialProfilesList } from '../components/team/SocialProfilesList';
import { useFounder } from '../hooks/useFounder';
import { buildFounderPersonSchema } from '../lib/seoService';
import { Quote, Award, Target, CheckCircle2, ArrowRight, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FounderPage: React.FC = () => {
  const { founder, loading } = useFounder();

  if (loading || !founder) {
    return (
      <Layout>
        <SEOHead 
          title="Executive Leadership & Founder — Ravan Technologies"
          description="Architecting sovereign digital infrastructure and enterprise AI at Ravan Technologies."
          canonical="/founder"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Founder Address', path: '/founder' }
          ]}
        />
        <section className="w-full relative bg-surface overflow-hidden pt-24 pb-20 px-gutter max-w-container-max mx-auto border-b border-outline-variant animate-pulse" aria-busy="true">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="h-3 w-36 bg-slate-700/60 rounded" />
              <div className="h-12 w-4/5 bg-slate-800 rounded" />
              <div className="h-4 w-1/2 bg-slate-700/60 rounded" />
              <div className="h-20 w-full bg-slate-800/40 rounded-xl" />
            </div>
            <div className="lg:col-span-5 lg:col-start-8 aspect-[4/5] rounded-xl bg-slate-800/50" />
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead 
        title={`${founder.name} — Founder & Chief Architect | Ravan Technologies`}
        description={founder.vision || founder.bio || 'Architecting sovereign digital infrastructure and enterprise AI at Ravan Technologies.'}
        ogImage={founder.image_url}
        ogType="profile"
        canonical="/founder"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Founder Address', path: '/founder' }
        ]}
        mainEntity={buildFounderPersonSchema(founder)}
      />

      {/* Hero: Split Panel Style matching Stitch prototype */}
      <section className="w-full relative bg-surface overflow-hidden pt-24 pb-20 px-gutter max-w-container-max mx-auto border-b border-outline-variant">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Side */}
          <div className="lg:col-span-6 flex flex-col z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-secondary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
                EXECUTIVE LEADERSHIP
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold font-display text-primary mb-4 leading-tight tracking-tight">
              Architecting the Foundation of Sovereign Intelligence.
            </h1>

            <div className="text-lg font-semibold text-secondary mb-4">
              {founder.name} — <span className="text-on-surface-variant font-normal">{founder.designation}</span>
            </div>

            {founder.vision && (
              <p className="text-base md:text-lg font-body text-on-surface-variant max-w-xl leading-relaxed mb-6">
                &ldquo;{founder.vision}&rdquo;
              </p>
            )}

            <SocialProfilesList
              socialLinks={founder.social_links}
              memberName={founder.name}
            />
          </div>

          {/* Image Side - Clean, unobstructed portrait with Premium Motion */}
          <div className="lg:col-span-5 lg:col-start-8 relative select-none">
            <div 
              style={{ touchAction: 'manipulation' }}
              className="group relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-lg shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/15 border border-outline-variant/80 hover:border-secondary/50 transition-all duration-500 ease-out cursor-pointer select-none motion-reduce:transform-none"
            >
              <SmartImage
                src={founder.image_url}
                alt={founder.name}
                priority={true}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] group-active:scale-[1.02] motion-reduce:transform-none will-change-transform"
                containerClassName="w-full h-full bg-transparent overflow-hidden"
                fallbackText={founder.name}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quote Banner */}
      {founder.quote && (
        <section className="w-full bg-primary text-white py-20 px-gutter border-b border-outline-variant">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <Quote className="w-12 h-12 text-secondary mb-6 opacity-80" />
            <blockquote className="text-xl md:text-2xl font-display font-medium leading-relaxed mb-6 italic">
              &ldquo;{founder.quote}&rdquo;
            </blockquote>
            <div className="h-0.5 w-12 bg-secondary mb-3" />
            <div className="text-xs uppercase tracking-widest text-secondary font-semibold">
              {founder.name} — {founder.quote_author_tag || 'Direct Address'}
            </div>
          </div>
        </section>
      )}

      {/* Comprehensive Biography */}
      {founder.bio && (
        <section className="py-24 bg-surface max-w-container-max mx-auto px-gutter border-b border-outline-variant">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary block mb-2">
                EXECUTIVE BIOGRAPHY
              </span>
              <h2 className="text-3xl font-bold font-display text-primary tracking-tight">
                Architectural Trajectory
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-6 text-on-surface-variant font-body leading-relaxed whitespace-pre-line text-base">
              {founder.bio}
            </div>
          </div>
        </section>
      )}

      {/* Achievements / Milestones */}
      {(founder.achievements && founder.achievements.length > 0) && (
        <section className="py-24 bg-surface-container-lowest border-b border-outline-variant">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="max-w-2xl mb-16">
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary block mb-2">
                KEY DELIVERABLES
              </span>
              <h2 className="text-3xl font-bold font-display text-primary tracking-tight">
                Strategic Milestones & Deployments
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {founder.achievements.map((ach, idx) => (
                <div key={idx} className="p-8 rounded-xl bg-surface border border-outline-variant shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary shrink-0 font-mono font-bold text-xs">
                    0{idx + 1}
                  </div>
                  <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                    {ach}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Custom Content Sections */}
      {(founder.custom_sections && founder.custom_sections.length > 0) && (
        <section className="py-24 bg-surface max-w-container-max mx-auto px-gutter border-b border-outline-variant">
          <div className="space-y-16">
            {founder.custom_sections.map(sec => (
              <div key={sec.id} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-secondary block mb-2">
                    SPECIAL DIRECTIVE
                  </span>
                  <h3 className="text-2xl font-bold font-display text-primary tracking-tight">
                    {sec.title}
                  </h3>
                </div>
                <div className="lg:col-span-8 space-y-4 text-on-surface-variant font-body leading-relaxed whitespace-pre-line text-base">
                  {sec.content}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Governance & Team Link */}
      <section className="py-20 bg-surface text-center">
        <div className="max-w-xl mx-auto px-gutter">
          <h3 className="text-2xl font-bold font-display text-primary mb-3">
            Meet the Executive Roster
          </h3>
          <p className="text-sm text-on-surface-variant mb-6">
            Explore the team of directors and branch CEOs steering Ravan Technologies, Tech Park, and Film Studio.
          </p>
          <Link
            to="/team"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded font-semibold text-xs tracking-widest uppercase hover:bg-primary-container transition-colors shadow-md"
          >
            <span>VIEW EXECUTIVE ROSTER</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </Layout>
  );
};
