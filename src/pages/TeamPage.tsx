import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { SmartImage } from '../components/common/SmartImage';
import { dataService, generateSlug } from '../lib/dataService';
import { LeadershipMember } from '../types';
import { useFounder } from '../hooks/useFounder';
import { ArrowRight, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeamPage: React.FC = () => {
  const { founders, loading: founderLoading } = useFounder();
  const [leadership, setLeadership] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);

  const publishedFounders = (founders || []).filter(f => f.status === 'published');
  const primaryFounder = publishedFounders[0] || null;
  const coFounders = publishedFounders.slice(1);

  const fetchLeadership = async () => {
    try {
      const allMembers = await dataService.getLeadership();
      const published = allMembers
        .filter(member => member.status === 'published')
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      setLeadership(published);
    } catch {
      setLeadership([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadership();

    const handleUpdate = () => {
      fetchLeadership();
    };
    window.addEventListener('ravan_data_updated', handleUpdate);
    return () => window.removeEventListener('ravan_data_updated', handleUpdate);
  }, []);

  return (
    <Layout>
      <SEOHead 
        title="Leadership Team & Governance — Ravan Technologies"
        description="Meet the executive leadership and architects steering Ravan Technologies, Ravan Tech Park, and Ravan Film Studio."
        canonical="/team"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Team Directory', path: '/team' }
        ]}
      />

      <section className="w-full max-w-container-max mx-auto px-gutter pt-24 pb-16">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
            GOVERNANCE & LEADERSHIP
          </span>
          <div className="h-[1px] w-12 bg-secondary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold font-display text-primary mb-6 leading-tight max-w-4xl tracking-tight">
          The Leadership Steering Sovereign Intelligence.
        </h1>
        <p className="text-base md:text-lg font-body text-on-surface-variant max-w-2xl leading-relaxed">
          Executive leadership, principal architects, and branch directors guiding our physical and cognitive computing initiatives.
        </p>
      </section>

      {/* Founder Spotlight (Prominently First from Single Source of Truth) */}
      {founderLoading ? (
        <section className="w-full max-w-container-max mx-auto px-gutter pb-16 animate-pulse" aria-busy="true">
          <div className="p-8 md:p-12 rounded-2xl bg-surface-container-lowest border border-outline-variant grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 aspect-[4/5] rounded-xl bg-slate-800/60" />
            <div className="lg:col-span-8 space-y-4">
              <div className="h-4 w-32 bg-slate-700/60 rounded" />
              <div className="h-10 w-3/4 bg-slate-800 rounded" />
              <div className="h-4 w-1/2 bg-slate-700/60 rounded" />
              <div className="h-16 w-full bg-slate-800/40 rounded-xl" />
            </div>
          </div>
        </section>
      ) : primaryFounder ? (
        <section className="w-full max-w-container-max mx-auto px-gutter pb-16">
          <div className="p-8 md:p-12 rounded-2xl bg-surface-container-lowest border-2 border-secondary/40 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-4 aspect-[4/5] rounded-xl overflow-hidden shadow-md border border-outline-variant/80 bg-surface-container-lowest relative">
              {primaryFounder.image_url ? (
                <SmartImage
                  src={primaryFounder.image_url}
                  alt={primaryFounder.name}
                  priority={true}
                  className="transition-transform duration-500 w-full h-full object-cover hover:scale-105"
                  containerClassName="w-full h-full bg-transparent"
                  fallbackText={primaryFounder.name}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-surface-container text-center">
                  <div className="w-20 h-20 rounded-2xl bg-secondary/10 border-2 border-secondary/40 flex items-center justify-center text-secondary font-display text-2xl font-bold mb-2">
                    VA
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                    Founder
                  </span>
                </div>
              )}
            </div>

            <div className="lg:col-span-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-secondary text-[#0a192f] text-[10px] font-bold uppercase tracking-widest rounded shadow-sm">
                  FOUNDER & CHIEF ARCHITECT
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-primary mb-2 tracking-tight">
                {primaryFounder.name}
              </h2>
              <p className="text-sm md:text-base font-semibold text-secondary mb-4">
                {primaryFounder.designation} {primaryFounder.tenure_years && <span>— <span className="text-on-surface-variant font-normal">{primaryFounder.tenure_years} of Systems Engineering</span></span>}
              </p>
              {primaryFounder.vision && (
                <p className="text-base text-on-surface-variant leading-relaxed mb-8 italic">
                  &ldquo;{primaryFounder.vision}&rdquo;
                </p>
              )}

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/founder"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded font-semibold text-xs tracking-widest uppercase hover:bg-primary-container transition-colors shadow-md w-fit"
                >
                  <span>MEET THE FOUNDER</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to={`/team/${primaryFounder.slug || generateSlug(primaryFounder.name)}`}
                  className="inline-flex items-center gap-2 px-6 py-4 bg-surface-container text-primary hover:text-secondary rounded font-semibold text-xs tracking-widest uppercase border border-outline-variant hover:border-secondary transition-colors shadow-sm w-fit"
                >
                  <span>EXECUTIVE PROFILE</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Co-Founders Roster if multiple published founders exist */}
          {coFounders.length > 0 && (
            <div className="mt-8 pt-8 border-t border-outline-variant space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-secondary block mb-1">
                  FOUNDING PARTNERS
                </span>
                <h3 className="text-xl md:text-2xl font-bold font-display text-primary tracking-tight">
                  Co-Founders & Architectural Leadership
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coFounders.map((cf) => {
                  const cfSlug = cf.slug || generateSlug(cf.name);
                  return (
                    <div key={cf.id} className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant hover:border-secondary/40 transition-all flex flex-col sm:flex-row gap-5 items-center shadow-md">
                      <div className="w-28 aspect-[4/5] rounded-xl overflow-hidden border border-outline-variant shrink-0 relative bg-surface-container">
                        {cf.image_url ? (
                          <SmartImage
                            src={cf.image_url}
                            alt={cf.name}
                            className="w-full h-full object-cover"
                            containerClassName="w-full h-full"
                            fallbackText={cf.name}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-secondary font-bold font-display text-lg">
                            {cf.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <span className="px-2.5 py-0.5 bg-secondary/15 text-secondary text-[10px] font-bold uppercase rounded border border-secondary/30 inline-block">
                          FOUNDER
                        </span>
                        <h4 className="text-lg font-bold font-display text-primary">{cf.name}</h4>
                        <p className="text-xs font-semibold text-secondary">{cf.designation}</p>
                        <p className="text-xs text-on-surface-variant line-clamp-2">{cf.short_intro || cf.bio}</p>
                        <div className="pt-2">
                          <Link
                            to={`/team/${cfSlug}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-container hover:bg-secondary/15 text-primary hover:text-secondary rounded text-xs font-semibold uppercase tracking-wider border border-outline-variant hover:border-secondary/40 transition-colors"
                          >
                            <span>EXECUTIVE PROFILE</span>
                            <ChevronRight className="w-3.5 h-3.5 text-secondary" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      ) : null}

      {/* Leadership Grid */}
      <section className="w-full max-w-container-max mx-auto px-gutter pb-28">
        <div className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary block mb-2">
            EXECUTIVE ROSTER
          </span>
          <h3 className="text-2xl md:text-3xl font-bold font-display text-primary mb-2 tracking-tight">
            Executive Directors & Branch CEOs
          </h3>
          <p className="text-sm text-on-surface-variant max-w-xl leading-relaxed">
            Select any team member to view their verified corporate profile, contributions, and architectural focus.
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface rounded-2xl overflow-hidden border border-outline-variant/70 p-0 shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-slate-800" />
                <div className="p-6 space-y-3">
                  <div className="h-6 w-3/4 bg-slate-800 rounded" />
                  <div className="h-4 w-1/2 bg-slate-800 rounded" />
                  <div className="h-12 w-full bg-slate-800/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : leadership.length === 0 ? (
          <div className="p-16 rounded-2xl bg-surface border border-outline-variant text-center max-w-xl mx-auto my-12">
            <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold font-display text-primary mb-2">No Leaders Found</h3>
            <p className="text-xs text-on-surface-variant">There are currently no published executive members in the directory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {leadership.map(member => {
              const memberSlug = member.slug || generateSlug(member.name);
              const initials = member.name
                ? member.name
                    .split(' ')
                    .filter(Boolean)
                    .map(part => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'RT';

              return (
                <Link
                  key={member.id}
                  to={`/team/${memberSlug}`}
                  style={{ touchAction: 'manipulation' }}
                  className="group bg-surface rounded-2xl overflow-hidden border border-outline-variant/70 shadow-sm hover:shadow-2xl hover:border-secondary/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                  aria-label={`View profile of ${member.name}, ${member.designation}`}
                >
                  <div>
                    {/* Portrait Image Container */}
                    <div className="aspect-[4/3] relative overflow-hidden bg-surface-container-lowest">
                      {member.image_url ? (
                        <SmartImage
                          src={member.image_url}
                          alt={member.name}
                          className="transition-transform duration-500 w-full h-full object-cover group-hover:scale-105"
                          containerClassName="w-full h-full bg-transparent"
                          fallbackText={member.name}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-surface-container text-center">
                          <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary font-display text-xl font-bold mb-2 group-hover:scale-110 transition-transform">
                            {initials}
                          </div>
                          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                            Executive Profile
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Member Meta */}
                    <div className="p-6">
                      {member.company_branch && (
                        <span className="inline-block px-2.5 py-0.5 bg-surface-container text-[10px] font-bold uppercase tracking-wider text-secondary rounded border border-outline-variant/60 mb-2">
                          {member.company_branch}
                        </span>
                      )}
                      <h4 className="text-xl font-bold font-display text-primary mb-1 group-hover:text-secondary transition-colors">
                        {member.name}
                      </h4>
                      <p className="text-xs font-semibold text-secondary mb-3 uppercase tracking-wider">
                        {member.designation}
                      </p>
                      {member.bio && (
                        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Profile Link Footer Prompt */}
                  <div className="px-6 py-3.5 border-t border-outline-variant/60 bg-surface-container-lowest/50 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-secondary group-hover:text-primary transition-colors">
                    <span>VIEW PROFILE</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
};
