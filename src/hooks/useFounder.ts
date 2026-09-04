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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial fetch from canonical dataService (reads from Supabase / cache)
    dataService.getFounder().then((data) => {
      if (isMounted) {
        if (data) {
          setFounder(data);
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

    window.addEventListener('ravan_founder_updated' as any, handleFounderUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('ravan_founder_updated' as any, handleFounderUpdate);
    };
  }, []);

  return {
    founder,
    loading,
    founderName: founder?.name || 'Founder',
    founderDesignation: founder?.designation || 'Founder & Chief Architect',
  };
}
