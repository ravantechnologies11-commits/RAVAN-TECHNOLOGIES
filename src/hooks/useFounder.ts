import { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';
import { Founder } from '../types';

/**
 * Global Founder Hook: Single source of truth for the Ravan Technologies Founder Profile.
 * Subscribes to realtime updates so changes in Admin CMS reflect instantly everywhere.
 * Initializes to null with loading=true to prevent flashing stale mock data on initial load.
 */
export function useFounder() {
  const [founders, setFounders] = useState<Founder[]>(() => dataService.getFoundersSync());
  const [founder, setFounder] = useState<Founder | null>(() => {
    const list = dataService.getFoundersSync();
    const published = list.filter(f => f.status === 'published');
    return published[0] || null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const refreshFounders = () => {
      dataService.getFounders(true).then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) {
            setFounders(data);
            const published = data.filter(f => f.status === 'published');
            setFounder(published[0] || null);
          }
        }
      }).catch(() => {});
    };

    // 1. Background revalidation from canonical dataService
    dataService.getFounders().then((data) => {
      if (isMounted) {
        if (Array.isArray(data)) {
          setFounders(data);
          const published = data.filter(f => f.status === 'published');
          setFounder(published[0] || null);
        }
      }
    }).catch(() => {});

    // 2. Real-time event listener for live founder broadcasts
    const handleFounderUpdate = (e: CustomEvent<Founder>) => {
      if (isMounted && e.detail) {
        if (e.detail.status === 'published') {
          setFounder(e.detail);
        } else {
          refreshFounders();
        }
      }
    };

    const handleFoundersUpdate = (e: CustomEvent<Founder[]>) => {
      if (isMounted && Array.isArray(e.detail)) {
        setFounders(e.detail);
        const published = e.detail.filter(f => f.status === 'published');
        setFounder(published[0] || null);
      }
    };

    const handleDataUpdated = (e: any) => {
      const entity = e?.detail?.entity;
      if (!entity || entity === 'founder' || entity === 'founders') {
        refreshFounders();
      }
    };

    window.addEventListener('ravan_founder_updated' as any, handleFounderUpdate);
    window.addEventListener('ravan_founders_updated' as any, handleFoundersUpdate);
    window.addEventListener('ravan_data_updated', handleDataUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('ravan_founder_updated' as any, handleFounderUpdate);
      window.removeEventListener('ravan_founders_updated' as any, handleFoundersUpdate);
      window.removeEventListener('ravan_data_updated', handleDataUpdated);
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
