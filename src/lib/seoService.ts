import { Founder, LeadershipMember, SiteSettings, SEOSettings } from '../types/index';
import { initialSiteSettings } from '../data/initialData';
import { isDisplayableSocialUrl } from './socialUtils';

export const PRODUCTION_DOMAIN = 'https://ravantechnologies.in';

/**
 * Generates an absolute, canonical URL ensuring the authoritative production domain (ravantechnologies.in)
 * and no trailing slashes.
 */
export function buildCanonicalUrl(path: string = ''): string {
  if (!path) return PRODUCTION_DOMAIN;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const urlObj = new URL(path);
      const cleanPath = urlObj.pathname.replace(/\/+$/, '');
      return cleanPath ? `${PRODUCTION_DOMAIN}${cleanPath}` : PRODUCTION_DOMAIN;
    } catch {
      // If parsing fails, fall through
    }
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/') return PRODUCTION_DOMAIN;
  return `${PRODUCTION_DOMAIN}${cleanPath}`.replace(/\/+$/, '');
}

export const CANONICAL_LEADERSHIP_SLUGS: Record<string, string> = {
  'lead-001': 'berry-sugandh-surya',
  'lead-002': 'sibi-raj-u',
  'lead-003': 'vinothkumar',
  'lead-004': 'mithra-s',
};

/**
 * Builds the authoritative Organization Entity Schema.
 * Uses Schema.org "Corporation" / "Organization" with stable @id.
 * Connects Founder (V ABISHEK), Co-Founder (A. BERRY SUGANDH SURYA), and real Team Members.
 */
export function buildOrganizationSchema(
  site?: SiteSettings | null, 
  seo?: SEOSettings, 
  coFounder?: LeadershipMember | null,
  teamMembers?: LeadershipMember[] | null
) {
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

  const coFounderId = `${PRODUCTION_DOMAIN}/team/berry-sugandh-surya#person`;

  const otherEmployees = (teamMembers || [])
    .filter(m => m.id !== 'lead-001' && m.status === 'published')
    .map(m => {
      const slug = m.slug || CANONICAL_LEADERSHIP_SLUGS[m.id] || m.id;
      return { '@id': `${PRODUCTION_DOMAIN}/team/${slug}#person` };
    });

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
    email: activeSite.contact_email || 'ravantechnologies11@gmail.com',
    ...(activeSite.contact_phone ? { telephone: activeSite.contact_phone } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: activeSite.office_address || 'Ravan Technologies, Karapallam, Nayudumangalam',
      addressLocality: activeSite.hq_city || 'Tiruvannamalai',
      addressRegion: activeSite.hq_state || 'Tamil Nadu',
      postalCode: '606804',
      addressCountry: activeSite.hq_country || 'IN'
    },
    sameAs: sameAsLinks,
    founder: {
      '@id': `${PRODUCTION_DOMAIN}/#founder`
    },
    employee: [
      {
        '@id': coFounderId
      },
      ...otherEmployees
    ],
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
  const founderPageUrl = `${PRODUCTION_DOMAIN}/team/v-abishek`;
  const realFounderImage = founder.image_url || 'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/avatars/founder/1788068046599_4p0eqd.jpg';

  const sameAsLinks = [
    founder.social_links?.linkedin,
    founder.social_links?.instagram,
    founder.social_links?.twitter,
    founder.social_links?.github,
    founder.social_links?.youtube,
    founder.social_links?.facebook,
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
    image: realFounderImage,
    url: founderPageUrl,
    sameAs: sameAsLinks,
    description: founder.vision || founder.bio || 'Founder and Chief Architect steering sovereign digital infrastructure and enterprise AI at Ravan Technologies.',
    knowsAbout: founder.focus_areas && founder.focus_areas.length > 0 
      ? founder.focus_areas 
      : ['Enterprise Architecture', 'Sovereign AI Systems', 'Distributed Systems']
  };
}

/**
 * Builds the authoritative Co-Founder (Person) Schema.
 * Uses Schema.org "Person" with stable @id linked to the Organization.
 */
export function buildCoFounderPersonSchema(coFounder?: LeadershipMember | null) {
  const coFounderProfileUrl = `${PRODUCTION_DOMAIN}/team/berry-sugandh-surya`;
  const personId = `${coFounderProfileUrl}#person`;
  const realCoFounderImage = coFounder?.image_url || 'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/avatars/leadership/1788499006162_o6z64q.jpg';

  const sameAsLinks = [
    coFounder?.social_links?.linkedin,
    coFounder?.social_links?.github,
    coFounder?.social_links?.twitter,
    coFounder?.social_links?.whatsapp,
    coFounder?.social_links?.instagram,
    coFounder?.social_links?.website
  ].filter((url): url is string => Boolean(url && isDisplayableSocialUrl(url)));

  return {
    '@type': 'Person',
    '@id': personId,
    name: coFounder?.name?.trim() || 'A. BERRY SUGANDH SURYA',
    jobTitle: coFounder?.designation || 'Co-Founder & Chief Operating Officer',
    worksFor: {
      '@id': `${PRODUCTION_DOMAIN}/#organization`
    },
    image: realCoFounderImage,
    url: coFounderProfileUrl,
    sameAs: sameAsLinks,
    description: coFounder?.short_intro || coFounder?.bio || 'Co-Founder and Chief Operating Officer overseeing engineering execution, distributed software architectures, and institutional partnerships at Ravan Technologies.',
    knowsAbout: coFounder?.skills && coFounder.skills.length > 0
      ? coFounder.skills
      : ['AI & Embedded Systems', 'Distributed Systems', 'Edge Machine Learning', 'Autonomous Systems']
  };
}

/**
 * Builds a Person Schema for a verified Executive Leadership / Team member.
 */
export function buildTeamMemberPersonSchema(member: LeadershipMember, memberSlug: string) {
  if (member.id === 'lead-001' || memberSlug === 'berry-sugandh-surya') {
    return buildCoFounderPersonSchema(member);
  }

  const memberProfileUrl = `${PRODUCTION_DOMAIN}/team/${memberSlug}`;
  const personId = `${memberProfileUrl}#person`;

  const sameAsLinks = [
    member.social_links?.linkedin,
    member.social_links?.github,
    member.social_links?.twitter,
    member.social_links?.instagram,
    member.social_links?.youtube,
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
 * Builds page-specific ProfilePage Schema connecting to its Person entity via @id reference.
 */
export function buildProfilePageSchema(
  personSchema: Record<string, any>,
  canonicalPath: string,
  pageTitle: string,
  pageDescription: string
) {
  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const personId = personSchema['@id'] || `${canonicalUrl}#person`;

  return {
    '@type': 'ProfilePage',
    '@id': `${canonicalUrl}#profilepage`,
    url: canonicalUrl,
    name: pageTitle,
    description: pageDescription,
    isPartOf: {
      '@id': `${PRODUCTION_DOMAIN}/#website`
    },
    about: {
      '@id': `${PRODUCTION_DOMAIN}/#organization`
    },
    mainEntity: {
      '@id': personId
    }
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
 * Adheres strictly to Google Search Central's interconnected graph standard.
 */
export function buildPageJsonLdGraph(params: {
  site?: SiteSettings | null;
  seo?: SEOSettings;
  founder?: Founder | null;
  coFounder?: LeadershipMember | null;
  teamMembers?: LeadershipMember[] | null;
  currentPath?: string;
  pageTitle?: string;
  pageDescription?: string;
  breadcrumbs?: { name: string; path: string }[];
  mainEntity?: Record<string, any>;
  isProfilePage?: boolean;
  additionalEntities?: Record<string, any>[];
}) {
  const {
    site,
    seo,
    founder,
    coFounder,
    teamMembers,
    currentPath = '/',
    pageTitle,
    pageDescription,
    breadcrumbs,
    mainEntity,
    isProfilePage = false,
    additionalEntities = []
  } = params;

  const canonicalUrl = buildCanonicalUrl(currentPath);
  const webPageId = `${canonicalUrl}#webpage`;

  const activeSite = site || initialSiteSettings;
  const orgSchema = buildOrganizationSchema(activeSite, seo, coFounder, teamMembers);
  const founderSchema = founder ? buildFounderPersonSchema(founder) : null;
  const coFounderSchema = coFounder ? buildCoFounderPersonSchema(coFounder) : buildCoFounderPersonSchema(null);

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

  const finalTitle = pageTitle || `${activeSite.site_name || 'Ravan Technologies'} — Sovereign Intelligence`;
  const finalDescription = pageDescription || activeSite.description || '';

  const pageSchema = isProfilePage && mainEntity
    ? buildProfilePageSchema(mainEntity, currentPath, finalTitle, finalDescription)
    : {
        '@type': 'WebPage',
        '@id': webPageId,
        url: canonicalUrl,
        name: finalTitle,
        description: finalDescription,
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

  // Check if mainEntity is already in the graph
  const knownPersonIds = new Set<string>();
  if (founderSchema?.['@id']) knownPersonIds.add(founderSchema['@id']);
  if (coFounderSchema?.['@id']) knownPersonIds.add(coFounderSchema['@id']);

  const extraPersonNodes: Record<string, any>[] = [];
  if (isProfilePage && mainEntity && mainEntity['@id'] && !knownPersonIds.has(mainEntity['@id'])) {
    extraPersonNodes.push(mainEntity);
  }

  const graph = [
    orgSchema,
    ...(founderSchema ? [founderSchema] : []),
    coFounderSchema,
    ...extraPersonNodes,
    webSiteSchema,
    pageSchema,
    ...additionalEntities
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}
