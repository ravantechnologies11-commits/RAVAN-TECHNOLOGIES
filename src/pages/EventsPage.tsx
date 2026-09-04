import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/common/SEOHead';
import { SmartImage } from '../components/common/SmartImage';
import { dataService } from '../lib/dataService';
import { EventItem } from '../types';
import { initialEvents } from '../data/initialData';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    dataService.getEvents().then((data) => {
      if (isMounted) {
        setEvents(data);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    const handleUpdate = () => {
      dataService.getEvents().then((data) => {
        if (isMounted) setEvents(data);
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
        title="Events & Summits — Ravan Technologies"
        description="Global summits, architecture symposia, and pitch days hosted at Ravan Tech Park."
        canonical="/events"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Events & Summits", path: "/events" }]}
      />

      <section className="w-full max-w-container-max mx-auto px-gutter pt-24 pb-16">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
            GLOBAL SUMMITS
          </span>
          <div className="h-[1px] w-12 bg-secondary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold font-display text-primary mb-6 leading-tight max-w-4xl">
          Technical Summits & Pitch Days.
        </h1>
      </section>

      <section className="w-full max-w-container-max mx-auto px-gutter pb-28 space-y-10">
        {loading || !events ? (
          <div className="space-y-8" aria-busy="true">
            {[1, 2].map(i => (
              <div key={i} className="p-8 md:p-12 rounded-2xl bg-surface border border-outline-variant animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4">
                  <div className="h-4 w-40 bg-slate-700/60 rounded" />
                  <div className="h-8 w-3/4 bg-slate-800 rounded" />
                  <div className="h-4 w-full bg-slate-800/60 rounded" />
                </div>
                <div className="lg:col-span-4 h-48 bg-slate-800/50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 rounded-2xl bg-surface border border-outline-variant text-center max-w-xl mx-auto my-12">
            <Calendar className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold font-display text-primary mb-2">No Upcoming Events</h3>
            <p className="text-xs text-on-surface-variant">There are currently no scheduled public summits or pitch days.</p>
          </div>
        ) : (
          events.map(evt => (
            <div key={evt.id} className="p-8 md:p-12 rounded-2xl bg-surface border border-outline-variant shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="flex items-center gap-4 text-xs font-bold text-secondary uppercase tracking-widest mb-2">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {evt.event_date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {evt.location}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-primary mb-3">
                  {evt.title}
                </h2>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  {evt.description}
                </p>
                <Link
                  to={evt.registration_link || '/contact'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded font-semibold text-xs tracking-widest uppercase hover:bg-primary-container transition-colors shadow"
                >
                  <span>REGISTER DIRECTIVE</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="lg:col-span-4 h-56 rounded-xl overflow-hidden border border-outline-variant shadow">
                <SmartImage
                  src={evt.image_url}
                  alt={evt.title}
                  containerClassName="w-full h-full"
                  fallbackText={evt.title}
                />
              </div>
            </div>
          ))
        )}
      </section>
    </Layout>
  );
};
