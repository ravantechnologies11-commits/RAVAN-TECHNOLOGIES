import { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';
import { SiteSettings } from '../types';

/**
 * Dynamically updates the browser tab favicon in the document <head>.
 * Supports SVG, PNG, and ICO formats with automatic cache-busting.
 */
export function updateDocumentFavicon(url: string) {
  if (typeof document === 'undefined' || !url) return;

  try {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    const isSvg = url.toLowerCase().includes('.svg');
    link.type = isSvg ? 'image/svg+xml' : 'image/png';
    // Append timestamp version if not already present to prevent stale browser tab icon caching
    const versioned = url.includes('?') ? url : `${url}?v=${Date.now()}`;
    link.href = versioned;
  } catch (err) {
    if (import.meta.env.DEV) console.warn('Favicon update note:', err);
  }
}

/**
 * Global Brand Hook: Single source of truth for Ravan Technologies logo, company coordinates, and favicon.
 */
export function useBrandLogo() {
  const [site, setSite] = useState<SiteSettings>(() => dataService.getSiteSettingsSync());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Initial favicon update from synchronous cache
    const initialFav = site?.favicon_url || site?.logo_url;
    if (initialFav) {
      updateDocumentFavicon(initialFav);
    }

    // Background revalidation from database / SWR cache
    dataService.getSiteSettings().then((settings) => {
      if (isMounted && settings) {
        setSite(settings);
        const targetFavicon = settings?.favicon_url || settings?.logo_url;
        if (targetFavicon) {
          updateDocumentFavicon(targetFavicon);
        }
      }
    }).catch(() => {});

    // 2. Real-time event listener for live branding broadcasts
    const handleBrandUpdate = (e: CustomEvent<SiteSettings>) => {
      if (isMounted && e.detail) {
        setSite(e.detail);
        const targetFavicon = e.detail.favicon_url || e.detail.logo_url;
        if (targetFavicon) {
          updateDocumentFavicon(targetFavicon);
        }
      }
    };

    window.addEventListener('ravan_site_settings_updated' as any, handleBrandUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('ravan_site_settings_updated' as any, handleBrandUpdate);
    };
  }, []);

  return {
    site,
    logoUrl: site?.logo_url || site?.logo_public_url || '',
    logoAlt: site?.logo_alt || 'Ravan Technologies Official Logo',
    siteName: site?.site_name || site?.company_name || 'Ravan Technologies',
    tagline: site?.tagline || site?.official_tagline || 'Building Technology. Solving Real Problems.',
    faviconUrl: site?.favicon_url || site?.logo_url || '',
    loading
  };
}
