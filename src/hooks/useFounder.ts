import { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';
import { Founder } from '../types';

/**
 * Global Founder Hook: Single source of truth for the Ravan Technologies Founder Profile.
 * Subscribes to realtime updates so changes in Admin CMS reflect instantly everywhere.
 * Initializes to null with loading=true to prevent flashing stale mock data on initial load.
 */
export function useFounder() {
  const [founder, setFounder] = useState<Founder | null>(null);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial fetch from canonical dataService (reads from Supabase / cache)
    dataService.getFounders().then((data) => {
      if (isMounted) {
        if (Array.isArray(data) && data.length > 0) {
          setFounders(data);
          setFounder(data[0]);
        }
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    // 2. Real-time event listener for live founder broadcasts
    const handleFounderUpdate = (e: CustomEvent<Founder>) => {
      if (isMounted && e.detail) {
        setFounder(e.detail);
      }
    };

    const handleFoundersUpdate = (e: CustomEvent<Founder[]>) => {
      if (isMounted && Array.isArray(e.detail)) {
        setFounders(e.detail);
        if (e.detail.length > 0) {
          setFounder(e.detail[0]);
        }
      }
    };

    window.addEventListener('ravan_founder_updated' as any, handleFounderUpdate);
    window.addEventListener('ravan_founders_updated' as any, handleFoundersUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('ravan_founder_updated' as any, handleFounderUpdate);
      window.removeEventListener('ravan_founders_updated' as any, handleFoundersUpdate);
    };
  }, []);

  return {
    founder,
    founders,
    loading,
    founderName: founder?.name || 'Founder',
    founderDesignation: founder?.designation || 'Founder & Chief Architect',
  };
}

export function useFounders() {
  const { founders, loading } = useFounder();
  return { founders, loading };
}
