import React, { useEffect, useState } from 'react';
import { updateDocumentFavicon, useBrandLogo } from '../../hooks/useBrandLogo';
import { buildCanonicalUrl, buildPageJsonLdGraph, PRODUCTION_DOMAIN } from '../../lib/seoService';
import { dataService } from '../../lib/dataService';
import { Founder } from '../../types';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  favicon?: string;
  noindex?: boolean;
  breadcrumbs?: { name: string; path: string }[];
  mainEntity?: Record<string, any>;
  additionalEntities?: Record<string, any>[];
  customSchema?: Record<string, any>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ 
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  favicon,
  noindex = false,
  breadcrumbs,
  mainEntity,
  additionalEntities,
  customSchema
}) => {
  const { site, logoUrl, siteName, tagline } = useBrandLogo();
  const [founder, setFounder] = useState<Founder | null>(null);
  const [seo, setSeo] = useState<any | null>(null);

  // Load authoritative Founder profile and SEO settings from database
  useEffect(() => {
    let isMounted = true;
    dataService.getFounder().then(f => { if (isMounted) setFounder(f); }).catch(() => {});
    dataService.getSEOSettings().then(s => { if (isMounted) setSeo(s); }).catch(() => {});

    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.key === 'seo' || e.detail.key === 'site_settings' || e.detail.key === 'founder') {
        dataService.getSEOSettings(true).then(s => { if (isMounted) setSeo(s); }).catch(() => {});
        dataService.getFounder(true).then(f => { if (isMounted) setFounder(f); }).catch(() => {});
      }
    };
    window.addEventListener('ravan_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('ravan_data_updated', handleUpdate);
    };
  }, []);

  const cleanCanonical = canonical ? (canonical.startsWith('http') ? canonical : buildCanonicalUrl(canonical)) : PRODUCTION_DOMAIN;
  const finalTitle = title || seo?.meta_title || `${siteName || 'Ravan Technologies'} — ${tagline || 'Building Technology. Solving Real Problems.'}`;
  const finalDescription = description || seo?.meta_description || site?.description || tagline || 'Engineering sovereign digital infrastructure and enterprise AI.';
  const rawImage = ogImage || seo?.og_image || logoUrl || '/images/ravan-logo.png';
  const finalOgImage = rawImage.startsWith('http') ? rawImage : `${PRODUCTION_DOMAIN}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
  const finalFavicon = favicon || site?.favicon_url || logoUrl || '/images/ravan-logo.png';

  useEffect(() => {
    // 1. Document Title
    document.title = finalTitle;

    // 2. Favicon
    if (finalFavicon) {
      updateDocumentFavicon(finalFavicon);
    }
    
    // 3. Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', finalDescription);

    // 4. Canonical Tag
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', cleanCanonical);

    // 5. Robots / Noindex Directive
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.setAttribute('name', 'robots');
      document.head.appendChild(robotsTag);
    }
    if (noindex) {
      robotsTag.setAttribute('content', 'noindex, nofollow, noarchive');
    } else {
      robotsTag.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // 6. OpenGraph Meta Tags
    const setOg = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setOg('og:title', finalTitle);
    setOg('og:description', finalDescription);
    setOg('og:image', finalOgImage);
    setOg('og:url', cleanCanonical);
    setOg('og:type', ogType);
    setOg('og:site_name', siteName || 'Ravan Technologies');
    setOg('og:locale', 'en_IN');

    // 7. Twitter Card Meta Tags
    const setTwitter = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setTwitter('twitter:card', 'summary_large_image');
    setTwitter('twitter:title', finalTitle);
    setTwitter('twitter:description', finalDescription);
    setTwitter('twitter:image', finalOgImage);

    // 8. Authoritative JSON-LD Entity Graph Structured Data
    let scriptTag = document.getElementById('json-ld-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-schema';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }

    const jsonLdGraph = customSchema || buildPageJsonLdGraph({
      site,
      founder,
      currentPath: cleanCanonical.replace(PRODUCTION_DOMAIN, '') || '/',
      pageTitle: finalTitle,
      pageDescription: finalDescription,
      breadcrumbs,
      mainEntity,
      additionalEntities
    });

    scriptTag.textContent = JSON.stringify(jsonLdGraph);
  }, [
    finalTitle, 
    finalDescription, 
    cleanCanonical, 
    finalOgImage, 
    ogType, 
    noindex, 
    breadcrumbs, 
    mainEntity, 
    additionalEntities, 
    customSchema, 
    siteName, 
    site, 
    founder, 
    finalFavicon
  ]);

  return null;
};
