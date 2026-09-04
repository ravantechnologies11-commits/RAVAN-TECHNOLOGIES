import { Founder, LeadershipMember, SiteSettings, SEOSettings } from '../types/index';
import { initialSiteSettings } from '../data/initialData';
import { isDisplayableSocialUrl } from './socialUtils';

export const PRODUCTION_DOMAIN = 'https://ravantechnologies.com';

/**
 * Generates an absolute, canonical URL ensuring no trailing slashes or localhost in production.
 */
export function buildCanonicalUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/') return PRODUCTION_DOMAIN;
  return `${PRODUCTION_DOMAIN}${cleanPath}`.replace(/\/+$/, '');
}

/**
 * Builds the authoritative Organization Entity Schema.
 * Uses Schema.org "Corporation" / "Organization" with stable @id.
 */
export function buildOrganizationSchema(site?: SiteSettings | null, seo?: SEOSettings) {
  const activeSite = site || initialSiteSettings;
  const orgId = `${PRODUCTION_DOMAIN}/#organization`;
  const logoUrl = activeSite?.logo_public_url || activeSite?.logo_url || '/images/ravan-logo.png';
  const fullLogoUrl = logoUrl.startsWith('http') ? logoUrl : `${PRODUCTION_DOMAIN}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;

  const sameAsLinks = [
    activeSite?.social_links?.linkedin,
    activeSite?.social_links?.twitter,
    activeSite?.social_links?.github,
    activeSite?.social_links?.youtube,
    activeSite?.social_links?.instagram,
    activeSite?.social_links?.facebook,
    activeSite?.social_links?.whatsapp,
    activeSite?.social_links?.website
  ].filter((url): url is string => Boolean(url && isDisplayableSocialUrl(url)));

  return {
    '@type': 'Corporation',
    '@id': orgId,
    name: activeSite?.company_name || activeSite?.site_name || 'Ravan Technologies',
    legalName: 'Ravan Technologies Private Limited',
    alternateName: ['Ravan', 'Ravan Tech'],
    url: PRODUCTION_DOMAIN,
    logo: {
      '@type': 'ImageObject',
      '@id': `${PRODUCTION_DOMAIN}/#logo`,
      url: fullLogoUrl,
      contentUrl: fullLogoUrl,
      caption: `${activeSite.site_name || 'Ravan Technologies'} Corporate Logo`
    },
    image: fullLogoUrl,
    description: activeSite.description || 'Ravan Technologies engineers sovereign intelligence infrastructure, high-concurrency enterprise software, and advanced research campuses.',
    email: activeSite.inquiry_email || activeSite.contact_email || 'contact@ravantechnologies.com',
    ...(activeSite.contact_phone ? { telephone: activeSite.contact_phone } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: activeSite.office_address || 'Ravan Tech Park, Outer Ring Road',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      postalCode: '560103',
      addressCountry: 'IN'
    },
    sameAs: sameAsLinks,
    founder: {
      '@id': `${PRODUCTION_DOMAIN}/#founder`
    },
    department: [
      {
        '@type': 'Organization',
        name: 'Ravan Tech Park',
        description: 'High-density enterprise computing campus and GPU research datacenter.'
      },
      {
        '@type': 'Organization',
        name: 'Ravan Film Studio',
        description: 'Virtual production LED volume soundstage and cinematic systems.'
      }
    ],
    knowsAbout: [
      'Enterprise Software Architecture',
      'Sovereign Artificial Intelligence',
      'Distributed Systems',
      'High-Concurrency Computing',
      'Applied Machine Learning'
    ]
  };
}

/**
 * Builds the authoritative Founder (Person) Schema.
 * Uses Schema.org "Person" with stable @id linked to the Organization.
 */
export function buildFounderPersonSchema(founder: Founder) {
  const founderId = `${PRODUCTION_DOMAIN}/#founder`;
  const founderPageUrl = `${PRODUCTION_DOMAIN}/founder`;

  const sameAsLinks = [
    founder.social_links?.linkedin,
    founder.social_links?.youtube,
    founder.social_links?.instagram,
    founder.social_links?.twitter,
    founder.social_links?.github,
    founder.social_links?.facebook,
    founder.social_links?.whatsapp,
    founder.social_links?.website
  ].filter((url): url is string => Boolean(url && isDisplayableSocialUrl(url)));

  return {
    '@type': 'Person',
    '@id': founderId,
    name: founder.name || 'V ABISHEK',
    jobTitle: founder.designation || 'Founder of RAVAN TECHNOLOGIES',
    worksFor: {
      '@id': `${PRODUCTION_DOMAIN}/#organization`
    },
    image: founder.image_url || undefined,
    url: founderPageUrl,
    sameAs: sameAsLinks,
    description: founder.vision || founder.bio || 'Founder and Chief Architect steering sovereign digital infrastructure and enterprise AI at Ravan Technologies.',
    knowsAbout: founder.focus_areas && founder.focus_areas.length > 0 
      ? founder.focus_areas 
      : ['Enterprise Architecture', 'Sovereign AI Systems', 'Distributed Systems']
  };
}

/**
 * Builds a Person Schema for a verified Executive Leadership / Team member.
 */
export function buildTeamMemberPersonSchema(member: LeadershipMember, memberSlug: string) {
  const memberProfileUrl = `${PRODUCTION_DOMAIN}/team/${memberSlug}`;
  const personId = `${memberProfileUrl}#person`;

  const sameAsLinks = [
    member.social_links?.linkedin,
    member.social_links?.youtube,
    member.social_links?.instagram,
    member.social_links?.twitter,
    member.social_links?.github,
    member.social_links?.facebook,
    member.social_links?.whatsapp,
    member.social_links?.website
  ].filter((url): url is string => Boolean(url && isDisplayableSocialUrl(url)));

  return {
    '@type': 'Person',
    '@id': personId,
    name: member.name,
    jobTitle: member.designation,
    worksFor: {
      '@id': `${PRODUCTION_DOMAIN}/#organization`
    },
    ...(member.image_url ? { image: member.image_url } : {}),
    url: memberProfileUrl,
    sameAs: sameAsLinks,
    ...(member.bio || member.short_intro ? { description: member.short_intro || member.bio } : {}),
    ...(member.skills && member.skills.length > 0 ? { knowsAbout: member.skills } : {})
  };
}

/**
 * Builds BreadcrumbList Schema for structured navigation trails.
 */
export function buildBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: buildCanonicalUrl(item.path)
    }))
  };
}

/**
 * Builds the complete multi-entity Schema.org JSON-LD @graph.
 */
export function buildPageJsonLdGraph(params: {
  site?: SiteSettings | null;
  seo?: SEOSettings;
  founder?: Founder | null;
  currentPath?: string;
  pageTitle?: string;
  pageDescription?: string;
  breadcrumbs?: { name: string; path: string }[];
  mainEntity?: Record<string, any>;
  additionalEntities?: Record<string, any>[];
}) {
  const {
    site,
    seo,
    founder,
    currentPath = '/',
    pageTitle,
    pageDescription,
    breadcrumbs,
    mainEntity,
    additionalEntities = []
  } = params;

  const canonicalUrl = buildCanonicalUrl(currentPath);
  const webPageId = `${canonicalUrl}#webpage`;

  const activeSite = site || initialSiteSettings;
  const orgSchema = buildOrganizationSchema(activeSite, seo);
  const founderSchema = founder ? buildFounderPersonSchema(founder) : null;

  const webSiteSchema = {
    '@type': 'WebSite',
    '@id': `${PRODUCTION_DOMAIN}/#website`,
    url: PRODUCTION_DOMAIN,
    name: activeSite.site_name || 'Ravan Technologies',
    description: activeSite.description || 'Sovereign Intelligence in Enterprise Engineering',
    publisher: {
      '@id': `${PRODUCTION_DOMAIN}/#organization`
    }
  };

  const webPageSchema = {
    '@type': 'WebPage',
    '@id': webPageId,
    url: canonicalUrl,
    name: pageTitle || `${activeSite.site_name || 'Ravan Technologies'} — Sovereign Intelligence`,
    description: pageDescription || activeSite.description || '',
    isPartOf: {
      '@id': `${PRODUCTION_DOMAIN}/#website`
    },
    about: {
      '@id': `${PRODUCTION_DOMAIN}/#organization`
    },
    ...(breadcrumbs && breadcrumbs.length > 0 
      ? { breadcrumb: buildBreadcrumbSchema(breadcrumbs) } 
      : {}),
    ...(mainEntity ? { mainEntity } : {})
  };

  const graph = [
    orgSchema,
    ...(founderSchema ? [founderSchema] : []),
    webSiteSchema,
    webPageSchema,
    ...additionalEntities
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}
