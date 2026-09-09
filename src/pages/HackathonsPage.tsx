import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { SmartImage } from '../components/common/SmartImage';
import { dataService } from '../lib/dataService';
import { HackathonItem } from '../types';
import { Calendar, Trophy, ArrowRight, Code2, Award, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sanitizeUrl } from '../lib/securityUtils';

export const HackathonsPage: React.FC = () => {
  const [hackathon, setHackathon] = useState<HackathonItem | null>(() => dataService.getCachedHackathon());
  const [loading, setLoading] = useState<boolean>(() => dataService.getCachedHackathon() === null);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    dataService.getHackathon().then((data) => {
      if (isMounted) {
        setHackathon(data);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        setLoading(false);
      }
    });

    const unsubscribe = dataService.subscribeToUpdates((entity) => {
      if (!isMounted) return;
      if (!entity || entity.includes('hackathon')) {
        dataService.getHackathon(true).then((fresh) => {
          if (isMounted) {
            setHackathon(fresh);
            setLoading(false);
          }
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Dynamically extract unique domains strictly from saved problem statements
  const domains = useMemo(() => {
    if (!hackathon?.problem_statements) return [];
    const set = new Set<string>();
    hackathon.problem_statements.forEach(p => {
      const d = (p.category || p.domain || '').trim();
      if (d) set.add(d);
    });
    return Array.from(set);
  }, [hackathon?.problem_statements]);

  // Filter statements by selected domain
  const filteredStatements = useMemo(() => {
    if (!hackathon?.problem_statements) return [];
    if (selectedDomain === 'all') return hackathon.problem_statements;
    return hackathon.problem_statements.filter(
      p => (p.category || p.domain || '').trim().toLowerCase() === selectedDomain.toLowerCase()
    );
  }, [hackathon?.problem_statements, selectedDomain]);

  if (loading) {
    return (
      <Layout>
        <SEOHead 
          title="Hackathons & Engineering Sprints — Ravan Technologies"
          description="Competitive enterprise engineering hackathons solving real-world challenges."
          canonical="/hackathons"
          breadcrumbs={[{ name: "Home", path: "/" }, { name: "Hackathons", path: "/hackathons" }]}
        />
        <section className="w-full max-w-container-max mx-auto px-gutter pt-24 pb-16 animate-pulse" aria-busy="true">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="h-6 w-48 bg-slate-700/60 rounded-full" />
              <div className="h-12 w-4/5 bg-slate-800 rounded" />
              <div className="h-20 w-full bg-slate-800/60 rounded" />
              <div className="h-12 w-52 bg-slate-800 rounded" />
            </div>
            <div className="lg:col-span-5 aspect-[4/3] rounded-2xl bg-slate-800/50" />
          </div>
        </section>
      </Layout>
    );
  }

  if (!hackathon) {
    return (
      <Layout>
        <SEOHead 
          title="Hackathons & Engineering Sprints — Ravan Technologies"
          description="Competitive enterprise engineering hackathons solving real-world challenges."
          canonical="/hackathons"
          breadcrumbs={[{ name: "Home", path: "/" }, { name: "Hackathons", path: "/hackathons" }]}
        />
        <section className="w-full max-w-container-max mx-auto px-gutter pt-24 pb-28">
          <div className="p-16 rounded-2xl bg-surface border border-outline-variant/70 text-center max-w-xl mx-auto my-12">
            <Trophy className="w-12 h-12 text-secondary/60 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-display text-primary mb-2">Upcoming Sprints Under Curation</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              Next-generation competitive engineering sprints and enterprise hackathon tracks are currently being scheduled for the upcoming cycle.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white text-xs font-semibold tracking-widest uppercase rounded hover:bg-primary-container transition-all shadow-md"
            >
              <span>GET NOTIFIED OF NEXT HACKATHON</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead 
        title={`${hackathon.title} — Ravan Technologies`}
        description={hackathon.description}
        canonical="/hackathons"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Hackathons", path: "/hackathons" }]}
      />

      {/* Hero */}
      <section className="w-full max-w-container-max mx-auto px-gutter pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-3 bg-secondary-container/20 px-3.5 py-1.5 rounded-full border border-secondary/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                {hackathon.edition || 'Official Edition'} {hackathon.status === 'completed' ? '• COMPLETED' : 'REGISTRATION OPEN'}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold font-display text-primary mb-6 leading-tight">
              {hackathon.title}
            </h1>

            {hackathon.subtitle && (
              <p className="text-sm md:text-base font-semibold text-secondary mb-4 tracking-wide">
                {hackathon.subtitle}
              </p>
            )}

            <p className="text-base md:text-lg font-body text-on-surface-variant max-w-xl leading-relaxed mb-8">
              {hackathon.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-primary mb-8">
              {hackathon.event_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-secondary" />
                  <span>{hackathon.event_date}</span>
                </div>
              )}
              {hackathon.solutions_deployed_count && (
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-secondary" />
                  <span>{hackathon.solutions_deployed_count} Solutions Deployed</span>
                </div>
              )}
            </div>

            {/* Registration CTA - Strictly Database Driven with Protocol Validation */}
            {(() => {
              const safeRegUrl = sanitizeUrl(hackathon.registration_url);
              const isExternal = /^https?:\/\//i.test(safeRegUrl);
              const isClosed = hackathon.status === 'completed';

              if (isClosed) {
                return (
                  <div className="inline-flex items-center gap-2 px-6 py-4 bg-slate-800/80 text-slate-400 rounded font-semibold text-xs tracking-widest uppercase border border-slate-700">
                    <span>SPRINT CONCLUDED • REGISTRATION CLOSED</span>
                  </div>
                );
              }

              if (safeRegUrl && isExternal) {
                return (
                  <a
                    href={safeRegUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded font-semibold text-xs tracking-widest uppercase hover:bg-primary-container transition-colors shadow-lg"
                  >
                    <span>REGISTER YOUR TEAM</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                );
              }

              const targetPath = safeRegUrl && safeRegUrl.startsWith('/') ? safeRegUrl : '/contact';
              return (
                <Link
                  to={targetPath}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded font-semibold text-xs tracking-widest uppercase hover:bg-primary-container transition-colors shadow-lg"
                >
                  <span>REGISTER YOUR TEAM</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              );
            })()}
          </div>

          {/* Authoritative 4:3 Banner Container */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-outline-variant bg-slate-900">
              <SmartImage
                src={hackathon.banner_url || hackathon.image_url}
                alt={hackathon.title}
                containerClassName="w-full h-full"
                fallbackText={hackathon.title}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Domains & Statements Section - Strictly From Database */}
      <section className="w-full max-w-container-max mx-auto px-gutter py-16 border-t border-outline-variant">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary block mb-2">
            COMPETITION CHALLENGES
          </span>
          <h2 className="text-3xl font-bold font-display text-primary">
            Selected Problem Domains
          </h2>
        </div>

        {/* Empty State when no problem statements/domains exist */}
        {(!hackathon.problem_statements || hackathon.problem_statements.length === 0) ? (
          <div className="p-12 rounded-2xl bg-surface border border-outline-variant/60 text-center max-w-xl mx-auto my-6">
            <Code2 className="w-10 h-10 text-secondary/60 mx-auto mb-3" />
            <h3 className="text-lg font-bold font-display text-primary mb-1">
              No problem domains added yet.
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Technical challenge specifications for this sprint are being curated and will be published by the engineering council.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Domain Selector Pills (Derived dynamically from saved problem statements) */}
            {domains.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDomain('all')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    selectedDomain === 'all'
                      ? 'bg-secondary text-[#0a192f] shadow-sm'
                      : 'bg-surface border border-outline-variant text-on-surface-variant hover:text-primary'
                  }`}
                >
                  All Domains ({hackathon.problem_statements.length})
                </button>
                {domains.map(d => {
                  const count = hackathon.problem_statements.filter(
                    p => (p.category || p.domain || '').trim().toLowerCase() === d.toLowerCase()
                  ).length;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDomain(d)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        selectedDomain.toLowerCase() === d.toLowerCase()
                          ? 'bg-secondary text-[#0a192f] shadow-sm'
                          : 'bg-surface border border-outline-variant text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {d} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Problem Statements Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStatements.map((prob, idx) => (
                <div
                  key={prob.id || idx}
                  className="p-8 rounded-2xl bg-surface border border-outline-variant shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                        {prob.category || prob.domain || 'Engineering Challenge'}
                      </span>
                      {prob.complexity && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            prob.complexity === 'Easy'
                              ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400'
                              : prob.complexity === 'Hard'
                              ? 'bg-rose-950/40 border border-rose-500/30 text-rose-400'
                              : 'bg-amber-950/40 border border-amber-500/30 text-amber-400'
                          }`}
                        >
                          {prob.complexity}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold font-display text-primary mb-3 group-hover:text-secondary transition-colors">
                      {prob.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {prob.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Rules & Prizes Section - Strictly Controlled by Admin */}
      {((hackathon.rules && hackathon.rules.length > 0) || (hackathon.prizes && hackathon.prizes.length > 0)) && (
        <section className="w-full max-w-container-max mx-auto px-gutter py-16 border-t border-outline-variant">
          <div className="mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary block mb-2">
              COMPETITION PROTOCOLS
            </span>
            <h2 className="text-3xl font-bold font-display text-primary">
              Rules & Award Structure
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Rules */}
            {hackathon.rules && hackathon.rules.length > 0 && (
              <div className="p-8 rounded-2xl bg-surface border border-outline-variant shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-primary">
                    Competition Rules
                  </h3>
                </div>
                <ul className="space-y-3 text-xs text-on-surface-variant">
                  {hackathon.rules.map((rule, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-surface-container text-secondary text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {rIdx + 1}
                      </span>
                      <span className="leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
                {hackathon.eligibility && (
                  <div className="pt-4 border-t border-outline-variant text-xs text-on-surface-variant">
                    <span className="font-bold text-primary block mb-1">Eligibility:</span>
                    <p className="leading-relaxed">{hackathon.eligibility}</p>
                  </div>
                )}
              </div>
            )}

            {/* Prizes */}
            {hackathon.prizes && hackathon.prizes.length > 0 && (
              <div className="p-8 rounded-2xl bg-surface border border-outline-variant shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-bold">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-primary">
                    Prizes & Recognition
                  </h3>
                </div>
                <div className="space-y-3">
                  {hackathon.prizes.map((prize, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-4 rounded-xl bg-surface-container border border-outline-variant/60 flex items-center gap-3"
                    >
                      <Award className="w-5 h-5 text-secondary shrink-0" />
                      <span className="text-xs font-semibold text-primary">{prize}</span>
                    </div>
                  ))}
                </div>
                {hackathon.contact_info && (
                  <div className="pt-4 border-t border-outline-variant text-xs text-on-surface-variant flex items-center justify-between">
                    <span className="font-bold text-primary">Official Contact:</span>
                    <a href={`mailto:${hackathon.contact_info}`} className="text-secondary font-mono hover:underline">
                      {hackathon.contact_info}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Hall of Fame / Past Winners */}
      {hackathon.winning_solutions && hackathon.winning_solutions.length > 0 && (
        <section className="w-full max-w-container-max mx-auto px-gutter py-16 pb-28 border-t border-outline-variant">
          <div className="mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary block mb-2">
              HALL OF FAME
            </span>
            <h2 className="text-3xl font-bold font-display text-primary">
              Previous Cohort Winners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {hackathon.winning_solutions.map((w, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary text-[#0a192f] font-bold flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-secondary uppercase tracking-widest">{w.rank}</div>
                  <h3 className="text-xl font-bold font-display text-primary mt-1 mb-2">{w.project_name}</h3>
                  <div className="text-xs font-semibold text-primary mb-2">By {w.team_name}</div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{w.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
};
