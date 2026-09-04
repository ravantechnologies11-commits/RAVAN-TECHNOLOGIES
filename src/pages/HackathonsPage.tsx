import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { SmartImage } from '../components/common/SmartImage';
import { dataService } from '../lib/dataService';
import { HackathonItem } from '../types';
import { initialHackathon } from '../data/initialData';
import { Calendar, Trophy, Users, ArrowRight, Code2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HackathonsPage: React.FC = () => {
  const [hackathon, setHackathon] = useState<HackathonItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    dataService.getHackathon().then((data) => {
      if (isMounted) {
        setHackathon(data);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    const handleUpdate = () => {
      dataService.getHackathon().then((data) => {
        if (isMounted) setHackathon(data);
      });
    };
    window.addEventListener('ravan_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('ravan_data_updated', handleUpdate);
    };
  }, []);

  if (loading || !hackathon) {
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
                {hackathon.edition} REGISTRATION OPEN
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold font-display text-primary mb-6 leading-tight">
              {hackathon.title}
            </h1>

            <p className="text-base md:text-lg font-body text-on-surface-variant max-w-xl leading-relaxed mb-8">
              {hackathon.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-primary mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" />
                <span>{hackathon.event_date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-secondary" />
                <span>{hackathon.solutions_deployed_count} Solutions Deployed</span>
              </div>
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded font-semibold text-xs tracking-widest uppercase hover:bg-primary-container transition-colors shadow-lg"
            >
              <span>REGISTER YOUR TEAM</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-outline-variant bg-slate-900">
              <SmartImage
                src={hackathon.image_url}
                alt={hackathon.title}
                containerClassName="w-full h-full"
                fallbackText={hackathon.title}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="w-full max-w-container-max mx-auto px-gutter py-16 border-t border-outline-variant">
        <div className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary block mb-2">
            COMPETITION TRACKS
          </span>
          <h2 className="text-3xl font-bold font-display text-primary">
            Selected Problem Domains
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {hackathon.tracks?.map(track => (
            <div key={track.id} className="p-8 rounded-2xl bg-surface border border-outline-variant shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-2 block">
                  {track.track_number}
                </span>
                <h3 className="text-xl font-bold font-display text-primary mb-3">
                  {track.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                  {track.description}
                </p>
              </div>
              <div className="pt-4 border-t border-outline-variant flex items-center justify-between text-xs text-on-surface-variant font-semibold">
                <span>{track.teams_registered || 30}+ Teams Registered</span>
                <span className="text-secondary font-bold uppercase text-[10px]">ACTIVE</span>
              </div>
            </div>
          ))}
        </div>
      </section>

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
