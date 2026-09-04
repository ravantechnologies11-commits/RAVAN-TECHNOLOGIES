import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { SmartImage } from '../components/common/SmartImage';
import { dataService } from '../lib/dataService';
import { AboutContent } from '../types';
import { useFounder } from '../hooks/useFounder';
import { FounderSpotlight } from '../components/home/FounderSpotlight';
import { 
  Shield, 
  Target, 
  Cpu, 
  Server, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  ChevronRight,
  Layers,
  Award,
  Sparkles,
  Globe,
  Compass,
  Eye,
  Calendar,
  Zap,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const renderDynamicIcon = (name?: string, className: string = 'w-6 h-6') => {
  switch (name?.toLowerCase()) {
    case 'shield': return <Shield className={className} />;
    case 'cpu': return <Cpu className={className} />;
    case 'server': return <Server className={className} />;
    case 'target': return <Target className={className} />;
    case 'award': return <Award className={className} />;
    case 'sparkles': return <Sparkles className={className} />;
    case 'layers': return <Layers className={className} />;
    case 'globe': return <Globe className={className} />;
    case 'eye': return <Eye className={className} />;
    case 'compass': return <Compass className={className} />;
    case 'zap': return <Zap className={className} />;
    default: return <CheckCircle2 className={className} />;
  }
};

export const AboutPage: React.FC = () => {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { founder } = useFounder();

  useEffect(() => {
    let isMounted = true;
    dataService.getAboutContent().then((data) => {
      if (isMounted) {
        setContent(data);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    const handleUpdate = () => {
      dataService.getAboutContent(true).then((data) => {
        if (isMounted) setContent(data);
      });
    };

    window.addEventListener('ravan_data_updated', handleUpdate);
    window.addEventListener('ravan_about_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('ravan_data_updated', handleUpdate);
      window.removeEventListener('ravan_about_updated', handleUpdate);
    };
  }, []);

  if (loading || !content) {
    return (
      <Layout>
        <SEOHead 
          title="About Us — The Enterprise Mandate | Ravan Technologies"
          description="Engineering the infrastructure of tomorrow with sovereign intelligence and structural integrity."
          canonical="/about"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'About Us', path: '/about' }
          ]}
        />
        {/* Skeleton Hero */}
        <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden bg-surface py-24 border-b border-outline-variant animate-pulse" aria-busy="true">
          <div className="max-w-container-max mx-auto px-gutter w-full space-y-6">
            <div className="h-3 w-36 bg-slate-700/60 rounded" />
            <div className="h-14 md:h-20 w-4/5 bg-slate-800 rounded" />
            <div className="h-5 w-3/5 bg-slate-800/60 rounded" />
          </div>
        </section>

        {/* Skeleton Genesis */}
        <section className="py-24 bg-surface-container-lowest border-y border-outline-variant animate-pulse">
          <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-4">
              <div className="h-3 w-28 bg-slate-700/60 rounded" />
              <div className="h-8 w-48 bg-slate-800 rounded" />
            </div>
            <div className="lg:col-span-8 space-y-12">
              <div className="h-44 bg-slate-800/40 rounded-xl border border-outline-variant" />
              <div className="h-44 bg-slate-800/40 rounded-xl border border-outline-variant" />
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const overview = content.overview;
  const isOverviewPublished = overview?.is_published !== false;

  const vision = content.vision;
  const isVisionPublished = Boolean(vision && vision.is_published !== false && (vision.title || vision.description));

  const mission = content.mission;
  const isMissionPublished = Boolean(mission && mission.is_published !== false && (mission.title || mission.description));

  const coreValues = (content.core_values || [])
    .filter(v => v.is_published !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const timelinePhases = (content.timeline || [])
    .filter(p => p.is_published !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const milestones = (content.milestones || [])
    .filter(m => m.is_published !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const capabilities = (content.capabilities || [])
    .filter(c => c.is_published !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const seoTitle = content.seo?.meta_title || 'About Us — The Enterprise Mandate | Ravan Technologies';
  const seoDesc = content.seo?.meta_description || overview?.short_intro || content.mandate;
  const canonicalUrl = content.seo?.canonical_url || '/about';
  const ogImg = content.seo?.og_image || overview?.image_url || '/images/ravan-logo.png';

  return (
    <Layout>
      <SEOHead 
        title={seoTitle}
        description={seoDesc}
        canonical={canonicalUrl}
        ogImage={ogImg}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'About Us', path: '/about' }
        ]}
      />

      {/* ============================================================ */}
      {/* 1. HERO / COMPANY OVERVIEW                                   */}
      {/* ============================================================ */}
      {isOverviewPublished && (
        <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden bg-surface py-20 md:py-28 border-b border-outline-variant">
          <div className="absolute inset-0 z-0 bg-grid-pattern opacity-10 pointer-events-none" />

          <div className="relative z-10 max-w-container-max mx-auto px-gutter w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className={overview?.image_url ? 'lg:col-span-7 flex flex-col items-start' : 'lg:col-span-10 flex flex-col items-start'}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-10 bg-secondary" />
                <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
                  {overview?.heading || 'THE ENTERPRISE MANDATE'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-primary max-w-4xl mb-6 leading-tight break-words">
                {overview?.short_intro || content.mandate}
              </h1>

              {overview?.detailed_description && (
                <p className="text-base sm:text-lg md:text-xl font-body text-on-surface-variant max-w-2xl leading-relaxed">
                  {overview.detailed_description}
                </p>
              )}
            </div>

            {overview?.image_url && (
              <div className="lg:col-span-5">
                <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-outline-variant/80 hover:border-secondary/50 transition-all duration-700 ease-out">
                  <SmartImage
                    src={overview.image_url}
                    alt={overview.heading || 'Ravan Technologies Headquarters'}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    fallbackText="Ravan Technologies"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 2. VISION & MISSION DUAL CARDS                               */}
      {/* ============================================================ */}
      {(isVisionPublished || isMissionPublished) && (
        <section className="py-20 bg-surface-container-low border-b border-outline-variant">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Vision Card */}
              {isVisionPublished && (
                <div className="p-8 md:p-10 rounded-2xl bg-surface border border-outline-variant shadow-sm flex flex-col justify-between hover:border-secondary/40 transition-colors">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary mb-6 shadow-sm">
                      <Target className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-secondary block mb-2">
                      OUR CORPORATE VISION
                    </span>
                    <h2 className="text-2xl font-bold font-display text-primary mb-4">
                      {vision?.title}
                    </h2>
                    <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
                      {vision?.description}
                    </p>
                  </div>
                  {vision?.image_url && (
                    <div className="mt-6 aspect-video rounded-xl overflow-hidden border border-outline-variant">
                      <SmartImage
                        src={vision.image_url}
                        alt={vision.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Mission Card */}
              {isMissionPublished && (
                <div className="p-8 md:p-10 rounded-2xl bg-surface border border-outline-variant shadow-sm flex flex-col justify-between hover:border-secondary/40 transition-colors">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 shadow-sm">
                      <Shield className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-secondary block mb-2">
                      OUR ENGINEERING MISSION
                    </span>
                    <h2 className="text-2xl font-bold font-display text-primary mb-4">
                      {mission?.title}
                    </h2>
                    <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
                      {mission?.description}
                    </p>
                  </div>
                  {mission?.image_url && (
                    <div className="mt-6 aspect-video rounded-xl overflow-hidden border border-outline-variant">
                      <SmartImage
                        src={mission.image_url}
                        alt={mission.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 3. GENESIS & EVOLUTION / TIMELINE PHASES                      */}
      {/* ============================================================ */}
      {timelinePhases.length > 0 && (
        <section className="py-24 bg-surface-container-lowest border-b border-outline-variant">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Sticky Sidebar Header */}
              <div className="lg:col-span-4 lg:sticky lg:top-28">
                <span className="text-xs font-semibold uppercase tracking-widest text-secondary mb-2 block">
                  OUR TRAJECTORY
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-display text-primary mb-4">
                  Genesis & Evolution
                </h2>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  Forged from the necessity of rigorous, secure, and infinitely scalable systems capable of surviving chaotic real-world conditions.
                </p>
                <div className="p-4 rounded-xl bg-surface-container border border-outline-variant text-xs text-on-surface-variant flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0 font-bold font-mono">
                    {timelinePhases.length}
                  </div>
                  <span>Documented architectural evolution phases</span>
                </div>
              </div>

              {/* Repeating Timeline Cards */}
              <div className="lg:col-span-8 flex flex-col gap-12">
                {timelinePhases.map((phase, pIdx) => {
                  const isEven = pIdx % 2 === 1;

                  return (
                    <div 
                      key={phase.id || pIdx}
                      className="group grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-6 sm:p-8 bg-surface rounded-2xl border border-outline-variant hover:border-secondary/40 shadow-sm transition-all duration-500"
                    >
                      {/* Text Column */}
                      <div className={`md:col-span-7 ${isEven ? 'md:order-2' : 'md:order-1'} space-y-3`}>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-secondary/10 border border-secondary/30 text-[10px] font-bold uppercase tracking-wider text-secondary">
                            {phase.phase_label || `PHASE ${pIdx + 1}`}
                          </span>
                          {phase.date_or_year && (
                            <span className="text-xs font-mono text-on-surface-variant flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{phase.date_or_year}</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-2xl font-bold font-display text-primary">
                          {phase.title}
                        </h3>

                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {phase.short_description}
                        </p>

                        {phase.detailed_description && (
                          <p className="text-xs text-on-surface-variant/80 leading-relaxed pt-2 border-t border-outline-variant/60">
                            {phase.detailed_description}
                          </p>
                        )}
                      </div>

                      {/* Visual Presentation Column — DARK IMAGE BUG PERMANENTLY FIXED */}
                      <div className={`md:col-span-5 ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                        {phase.image_url ? (
                          <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-md border border-outline-variant group-hover:border-secondary/50 transition-all duration-700 ease-out">
                            <SmartImage
                              src={phase.image_url}
                              alt={phase.title}
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                              fallbackText={phase.title}
                            />
                          </div>
                        ) : (
                          /* Polished Fallback Graphic Card with Perfect Contrast (Zero Dark Boxes) */
                          <div className="aspect-[4/3] bg-gradient-to-br from-surface-container via-surface-container to-surface-container-high rounded-xl overflow-hidden border border-outline-variant flex flex-col items-center justify-center p-6 text-center shadow-inner group-hover:border-secondary/40 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary mb-3 shadow-sm group-hover:scale-110 transition-transform duration-500">
                              {renderDynamicIcon(phase.icon, 'w-6 h-6')}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-primary font-display line-clamp-1">
                              {phase.title}
                            </span>
                            <span className="text-[10px] text-on-surface-variant font-mono mt-1 line-clamp-1">
                              {phase.phase_label} // Structural Milestone
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 4. CORE VALUES / AXIOMS                                      */}
      {/* ============================================================ */}
      {coreValues.length > 0 && (
        <section className="py-24 bg-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-grid-pattern pointer-events-none" />

          <div className="max-w-container-max mx-auto px-gutter relative z-10">
            <div className="max-w-2xl mb-16">
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary-fixed mb-2 block">
                IMMUTABLE PRINCIPLES
              </span>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-white mb-4">
                Core Axioms & Values
              </h2>
              <p className="text-sm md:text-base text-white/80 leading-relaxed">
                The foundational principles that govern our engineering philosophy and define our sovereign approach.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {coreValues.map((val, idx) => (
                <div 
                  key={val.id || idx}
                  className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-secondary-fixed/50 transition-all duration-500 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-secondary-fixed mb-6 shadow-inner">
                      {renderDynamicIcon(val.icon, 'w-6 h-6')}
                    </div>
                    <h3 className="text-xl font-bold font-display text-white mb-3">
                      {val.title}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {val.short_description}
                    </p>
                  </div>
                  {val.image_url && (
                    <div className="mt-6 aspect-video rounded-lg overflow-hidden border border-white/10">
                      <SmartImage
                        src={val.image_url}
                        alt={val.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 5. MILESTONES & ACHIEVEMENTS (IF CONFIGURED)                 */}
      {/* ============================================================ */}
      {milestones.length > 0 && (
        <section className="py-20 bg-surface border-b border-outline-variant">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary mb-2 block">
                HISTORICAL ACHIEVEMENTS
              </span>
              <h2 className="text-3xl font-bold font-display text-primary">
                Corporate Milestones
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {milestones.map((ms, idx) => (
                <div 
                  key={ms.id || idx}
                  className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm hover:border-secondary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-secondary">{ms.year_or_date}</span>
                    {ms.metric_value && (
                      <span className="px-2 py-0.5 bg-secondary/15 text-secondary text-[10px] font-bold rounded">
                        {ms.metric_value}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold font-display text-primary mb-2">
                    {ms.title}
                  </h3>
                  {ms.description && (
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {ms.description}
                    </p>
                  )}
                  {ms.metric_label && (
                    <span className="text-[10px] uppercase font-bold text-slate-400 mt-3 block">
                      {ms.metric_label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 6. CAPABILITIES & TECHNOLOGY FOCUS (IF CONFIGURED)           */}
      {/* ============================================================ */}
      {capabilities.length > 0 && (
        <section className="py-20 bg-surface-container-low border-b border-outline-variant">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary mb-2 block">
                CORE CAPABILITIES
              </span>
              <h2 className="text-3xl font-bold font-display text-primary">
                Technology Focus
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {capabilities.map((cap, idx) => (
                <div 
                  key={cap.id || idx}
                  className="p-6 rounded-xl bg-surface border border-outline-variant shadow-sm hover:border-secondary/40 transition-colors flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary shrink-0">
                    {renderDynamicIcon(cap.icon, 'w-5 h-5')}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-display text-primary mb-1">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {cap.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 7. FOUNDER SPOTLIGHT (AUTHENTIC DATABASE SOURCE)             */}
      {/* ============================================================ */}
      {founder && <FounderSpotlight founder={founder} />}

      {/* ============================================================ */}
      {/* 8. EXECUTIVE GOVERNANCE / LEADERSHIP DIRECTORY BANNER        */}
      {/* ============================================================ */}
      <section className="py-16 bg-surface border-b border-outline-variant">
        <div className="max-w-container-max mx-auto px-gutter flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-primary">Executive Governance & Architecture Roster</h3>
              <p className="text-xs text-on-surface-variant">Meet the branch directors and principal engineers steering Ravan Technologies.</p>
            </div>
          </div>
          <Link
            to="/team"
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface-container text-primary hover:text-secondary rounded-lg font-bold text-xs uppercase tracking-wider border border-outline-variant hover:border-secondary transition-all shadow-sm shrink-0"
          >
            <span>EXPLORE LEADERSHIP TEAM</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </Layout>
  );
};
