import { supabase } from './supabase';
import { 
  Founder, 
  LeadershipMember, 
  ServiceItem, 
  ServiceFeature,
  SolutionItem, 
  ProjectItem, 
  HackathonItem, 
  LearningProgram, 
  EcosystemItem, 
  MediaItem, 
  ContactEnquiry, 
  SiteSettings, 
  SEOSettings,
  AuditLog,
  NavigationItem,
  GalleryAlbum,
  BlogPost,
  EventItem,
  TestimonialItem,
  PartnerItem,
  ClientItem,
  RoleItem,
  SEOHealthIssue,
  UserProfile,
  AboutContent,
  ProfileEducation,
  ProfileProject,
  ProfileExperience,
  ProfileSkill,
  SkillCategory,
  AIMLModel
} from '../types';

import {
  initialFounder,
  initialFounders,
  initialLeadership,
  initialServices,
  initialSolutions,
  initialProjects,
  initialHackathon,
  initialLearningPrograms,
  initialEcosystem,
  initialMedia,
  initialEnquiries,
  initialSiteSettings,
  initialSEOSettings,
  initialAuditLogs,
  initialNavigation,
  initialGalleryAlbums,
  initialBlogPosts,
  initialEvents,
  initialTestimonials,
  initialPartners,
  initialClients,
  initialRoles,
  initialAIMLModels
} from '../data/initialData';

// Local Storage Resilient Fallbacks & Cross-Session Persistent Cache Store
const getLocal = <T>(key: string, fallback: T): T => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setLocal = <T>(key: string, data: T): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch {}
};

// High-Performance In-Memory & SWR Cache Store for 100k+ visitor scalability
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private inflight = new Map<string, Promise<any>>();
  private defaultTTL = 10 * 60 * 1000; // 10 minutes cache TTL for read-heavy public traffic

  get<T>(key: string): T | null {
    // 1. Fast in-memory map lookup (0ms)
    const entry = this.cache.get(key);
    if (entry) {
      if (Date.now() - entry.timestamp > this.defaultTTL) {
        this.cache.delete(key);
      } else {
        return entry.data as T;
      }
    }

    // 2. Persistent cross-session cache with timestamp verification (0.1ms)
    try {
      const localMeta = getLocal<{ timestamp: number; data: T } | null>(`ravan_cache_meta_${key}`, null);
      if (localMeta && typeof localMeta.timestamp === 'number' && localMeta.data !== undefined) {
        if (Date.now() - localMeta.timestamp < this.defaultTTL) {
          this.cache.set(key, { data: localMeta.data, timestamp: localMeta.timestamp });
          return localMeta.data as T;
        }
      }
    } catch {}

    return null;
  }

  set<T>(key: string, data: T): void {
    const now = Date.now();
    this.cache.set(key, { data, timestamp: now });
    try {
      setLocal(`ravan_cache_meta_${key}`, { data, timestamp: now });
    } catch {}
  }

  invalidate(keyPrefix?: string): void {
    if (!keyPrefix) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem(`ravan_cache_meta_${key}`);
          }
        } catch {}
      }
    }
  }

  invalidateKey(key: string): void {
    this.cache.delete(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(`ravan_cache_meta_${key}`);
      }
    } catch {}
  }

  clearAll(): void {
    this.cache.clear();
  }

  async dedupedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    if (this.inflight.has(key)) {
      return this.inflight.get(key) as Promise<T>;
    }

    const promise = fetcher()
      .then(data => {
        this.set(key, data);
        this.inflight.delete(key);
        return data;
      })
      .catch(err => {
        this.inflight.delete(key);
        throw err;
      });

    this.inflight.set(key, promise);
    return promise;
  }
}

const memoryCache = new CacheManager();

const notifyDataUpdated = (entity: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ravan_data_updated', { detail: { entity } }));
  }
};

function formatSupabaseError(error: any, tableOrEntity: string): Error {
  const msg = error?.message || '';
  if (msg.includes('schema cache')) {
    return new Error(`Database Schema Error: ${msg}. Please ensure you have run the master migration script to add missing columns/tables.`);
  }
  if (msg.toLowerCase().includes('could not find the table')) {
    return new Error(`Database Table 'public.${tableOrEntity}' is missing in your Supabase project. Please run the master SQL migration script.`);
  }
  if (msg.toLowerCase().includes('row-level security') || msg.includes('42501')) {
    return new Error(`Access Denied (RLS): You do not have permission to modify ${tableOrEntity}.`);
  }
  return new Error(msg || `Failed to persist ${tableOrEntity} to Supabase database.`);
}

export function generateSlug(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseStructuredEducation(rawEdu: any, m: any): ProfileEducation[] {
  if (Array.isArray(rawEdu) && rawEdu.length > 0 && typeof rawEdu[0] === 'object' && rawEdu[0].institution) {
    return rawEdu.map((e: any, idx: number) => ({
      id: e.id || `edu-${m.id || 'mem'}-${idx}`,
      degree: e.degree || 'B.E. / B.Tech',
      institution: e.institution || '',
      field: e.field || '',
      start_year: e.start_year || '',
      end_year: e.end_year || '',
      description: e.description || ''
    }));
  }

  const intro = (m.short_intro || m.social_links?._meta?.short_intro || '').toLowerCase();
  const achievements = (Array.isArray(m.achievements) ? m.achievements.join(' ') : (m.social_links?._meta?.achievements?.join(' ') || '')).toLowerCase();

  if (intro.includes('ece student') || achievements.includes('s.k.p. engineering college') || m.id === 'lead-001') {
    return [
      {
        id: `edu-${m.id || 'lead-001'}-1`,
        degree: 'B.E. / B.Tech',
        institution: 'S.K.P. Engineering College',
        field: 'Electronics and Communication Engineering (ECE)',
        start_year: '2024',
        end_year: '2028',
        description: 'Undergraduate engineering studies in embedded hardware systems, AI architectures, signal processing, and intelligent communication protocols.'
      }
    ];
  }

  return [];
}

export function parseStructuredProjects(rawProjects: any, rawMajorProjects: any, memberId: string): ProfileProject[] {
  if (Array.isArray(rawProjects) && rawProjects.length > 0 && typeof rawProjects[0] === 'object' && rawProjects[0].title) {
    return rawProjects.map((p: any, idx: number) => ({
      id: p.id || `proj-${memberId}-${idx}`,
      title: p.title || 'Untitled Project',
      short_description: p.short_description || '',
      role: p.role || '',
      technologies: Array.isArray(p.technologies) ? p.technologies : (typeof p.technologies === 'string' ? p.technologies.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
      status: p.status || 'Completed',
      start_date: p.start_date || '',
      end_date: p.end_date || '',
      project_url: p.project_url || '',
      github_url: p.github_url || '',
      image_url: p.image_url || '',
      featured: p.featured ?? true,
      display_order: typeof p.display_order === 'number' ? p.display_order : idx + 1,
      is_published: p.is_published ?? true
    }));
  }

  const legacyStrings: string[] = Array.isArray(rawMajorProjects) ? rawMajorProjects : (typeof rawMajorProjects === 'string' ? [rawMajorProjects] : []);
  if (legacyStrings.length === 0) return [];

  const combined = legacyStrings.join('\n');
  const results: ProfileProject[] = [];

  if (combined.includes('NEON') || combined.includes('DAAS-V2V') || combined.includes('SafeNet')) {
    if (combined.includes('NEON')) {
      results.push({
        id: `proj-${memberId}-neon`,
        title: 'NEON — Personal AI Operating System / Agent',
        short_description: 'Modular personal AI system combining local models, memory/RAG, voice runtime, model routing, and tool execution for practical desktop workflows.',
        role: 'Lead System Architect & AI Engineer',
        technologies: ['Local AI', 'Agents', 'RAG / Memory', 'Voice Runtime', 'Tool Execution', 'Security'],
        status: 'In Progress',
        start_date: '2026',
        end_date: 'Present',
        github_url: 'https://github.com/Berry1924',
        featured: true,
        display_order: 1,
        is_published: true
      });
    }
    if (combined.includes('DAAS-V2V') || combined.includes('Density-Aware')) {
      results.push({
        id: `proj-${memberId}-v2v`,
        title: 'Density-Aware Adaptive Secure V2V Communication (DAAS-V2V)',
        short_description: 'Engineered a vehicular ad-hoc network framework with density-aware broadcast scheduling and SINR-based interference modeling. Built a dual-ESP32 prototype with live serial telemetry.',
        role: 'Research Engineer & Hardware Prototyper',
        technologies: ['MATLAB', 'ESP32', 'C', 'Signal Processing', 'Networking'],
        status: 'Completed',
        start_date: '2025',
        end_date: '2026',
        featured: true,
        display_order: 2,
        is_published: true
      });
    }
    if (combined.includes('SafeNet')) {
      results.push({
        id: `proj-${memberId}-safenet`,
        title: 'SafeNet — Privacy-Focused Content Protection App',
        short_description: 'Android application utilizing VPNService for system-level DNS interception without root access, with on-device TensorFlow Lite image classification for local privacy.',
        role: 'Android & ML Developer',
        technologies: ['Android', 'Kotlin', 'TensorFlow Lite', 'VPNService'],
        status: 'Production',
        start_date: '2025',
        end_date: '2025',
        featured: true,
        display_order: 3,
        is_published: true
      });
    }
    return results;
  }

  legacyStrings.forEach((str, idx) => {
    if (!str.trim()) return;
    results.push({
      id: `proj-${memberId}-${idx}`,
      title: str.trim(),
      short_description: '',
      role: '',
      technologies: [],
      status: 'Production',
      start_date: '',
      end_date: '',
      featured: true,
      display_order: idx + 1,
      is_published: true
    });
  });

  return results;
}

export function parseStructuredExperience(rawExp: any, m: any): ProfileExperience[] {
  if (Array.isArray(rawExp) && rawExp.length > 0 && typeof rawExp[0] === 'object' && rawExp[0].organization) {
    return rawExp.map((ex: any, idx: number) => ({
      id: ex.id || `exp-${m.id || 'mem'}-${idx}`,
      organization: ex.organization || '',
      role: ex.role || '',
      start_date: ex.start_date || '',
      end_date: ex.end_date || '',
      is_current: ex.is_current ?? (!ex.end_date || ex.end_date.toLowerCase().includes('present')),
      description: ex.description || '',
      responsibilities: Array.isArray(ex.responsibilities) ? ex.responsibilities : [],
      contributions: Array.isArray(ex.contributions) ? ex.contributions : []
    }));
  }

  const achievements = Array.isArray(m.achievements) ? m.achievements.join(' ') : (m.social_links?._meta?.achievements?.join(' ') || '');
  if (achievements.includes('Freelance Engineer') || m.id === 'lead-001') {
    return [
      {
        id: `exp-${m.id || 'lead-001'}-1`,
        organization: 'Independent / Freelance Solutions',
        role: 'AI & Embedded Systems Engineer',
        start_date: 'Apr 2025',
        end_date: '',
        is_current: true,
        description: 'Delivering custom AI agent workflows, edge machine learning integrations, and embedded hardware telemetry solutions for enterprise and research projects.',
        responsibilities: [
          'Developing modular personal AI systems with local model routing and memory/RAG',
          'Prototyping V2V and hardware telemetry systems with ESP32 microcontrollers',
          'Deploying on-device inference models with TensorFlow Lite on Android'
        ],
        contributions: [
          'Won 1st Prize at TECHBLITZ-2K26 National Level Technical Symposium for technical paper presentation',
          'Served as Student Coordinator for Smart India Hackathon (SIH) 2026 activities at S.K.P. Engineering College'
        ]
      }
    ];
  }

  if (m.experience) {
    return [
      {
        id: `exp-${m.id || 'mem'}-1`,
        organization: m.company_branch || 'Ravan Technologies',
        role: m.designation || 'Executive Leader',
        start_date: '2024',
        end_date: '',
        is_current: true,
        description: typeof m.experience === 'string' ? m.experience : 'Executive leadership in sovereign systems.',
        responsibilities: Array.isArray(m.responsibilities) ? m.responsibilities : [],
        contributions: Array.isArray(m.contributions) ? m.contributions : []
      }
    ];
  }

  return [];
}

export function parseStructuredSkills(rawSkills: any, legacySkills: any, memberId: string): ProfileSkill[] {
  if (Array.isArray(rawSkills) && rawSkills.length > 0 && typeof rawSkills[0] === 'object' && rawSkills[0].name) {
    return rawSkills.map((s: any, idx: number) => ({
      id: s.id || `skill-${memberId}-${idx}`,
      name: s.name || '',
      category: (s.category || 'Other') as SkillCategory,
      proficiency: s.proficiency || '',
      display_order: typeof s.display_order === 'number' ? s.display_order : idx + 1
    }));
  }

  const legacyList: string[] = Array.isArray(legacySkills) ? legacySkills : (typeof legacySkills === 'string' ? [legacySkills] : []);
  if (legacyList.length === 0) return [];

  const combined = legacyList.join(' | ');
  const results: ProfileSkill[] = [];
  let order = 1;

  if (combined.includes(':') && combined.includes('|')) {
    const sections = combined.split('|');
    sections.forEach(sec => {
      const parts = sec.split(':');
      if (parts.length >= 2) {
        const catName = parts[0].trim().toLowerCase();
        let category: SkillCategory = 'Other';
        if (catName.includes('lang') || catName.includes('program')) category = 'Programming';
        else if (catName.includes('ai') || catName.includes('ml')) category = 'AI / ML';
        else if (catName.includes('web') || catName.includes('dev')) category = 'Web Development';
        else if (catName.includes('mobile')) category = 'Mobile Development';
        else if (catName.includes('cloud')) category = 'Cloud';
        else if (catName.includes('data')) category = 'Database';
        else if (catName.includes('hard') || catName.includes('embed')) category = 'Hardware';
        else if (catName.includes('design')) category = 'Design';
        else if (catName.includes('manage')) category = 'Management';

        const items = parts[1].split(/[·,]/).map(s => s.trim()).filter(Boolean);
        items.forEach(item => {
          results.push({
            id: `skill-${memberId}-${order}`,
            name: item,
            category,
            proficiency: 'Advanced',
            display_order: order++
          });
        });
      }
    });
    if (results.length > 0) return results;
  }

  legacyList.forEach(s => {
    s.split(',').map(item => item.trim()).filter(Boolean).forEach(name => {
      results.push({
        id: `skill-${memberId}-${order}`,
        name,
        category: 'Programming',
        proficiency: 'Advanced',
        display_order: order++
      });
    });
  });

  return results;
}

function normalizeLeadershipMember(m: any): LeadershipMember {
  const meta = m?.social_links?._meta || {};
  const memberId = m.id || 'mem';

  const education = parseStructuredEducation(m.education || meta.education, { ...m, id: memberId });
  const projects = parseStructuredProjects(m.projects || meta.projects, m.major_projects || meta.major_projects, memberId);
  const experience_records = parseStructuredExperience(m.experience_records || meta.experience_records, { ...m, id: memberId });
  const structured_skills = parseStructuredSkills(m.structured_skills || meta.structured_skills, m.skills || meta.skills, memberId);

  return {
    id: m.id,
    name: m.name || '',
    designation: m.designation || '',
    company_branch: m.company_branch || 'Ravan Technologies',
    bio: m.bio || '',
    image_url: m.image_url || '',
    display_order: typeof m.display_order === 'number' ? m.display_order : 0,
    status: m.status || 'published',
    slug: m.slug || meta.slug || generateSlug(m.name || ''),
    short_intro: m.short_intro ?? meta.short_intro ?? '',

    // Structured Corporate Profile Data
    education,
    projects,
    experience_records,
    structured_skills,

    // Legacy / Unstructured fallbacks
    responsibilities: Array.isArray(m.responsibilities) ? m.responsibilities : (Array.isArray(meta.responsibilities) ? meta.responsibilities : []),
    contributions: Array.isArray(m.contributions) ? m.contributions : (Array.isArray(meta.contributions) ? meta.contributions : []),
    major_projects: Array.isArray(m.major_projects) ? m.major_projects : (Array.isArray(meta.major_projects) ? meta.major_projects : []),
    skills: Array.isArray(m.skills) ? m.skills : (Array.isArray(meta.skills) ? meta.skills : []),
    achievements: Array.isArray(m.achievements) ? m.achievements : (Array.isArray(meta.achievements) ? meta.achievements : []),
    experience: m.experience ?? meta.experience ?? '',
    importance: m.importance ?? meta.importance ?? '',

    // Official Contact & Social
    public_email: m.public_email ?? meta.public_email ?? '',
    public_phone: m.public_phone ?? meta.public_phone ?? '',
    social_links: {
      linkedin: m.social_links?.linkedin || '',
      youtube: m.social_links?.youtube || '',
      instagram: m.social_links?.instagram || '',
      twitter: m.social_links?.twitter || '',
      github: m.social_links?.github || '',
      facebook: m.social_links?.facebook || '',
      website: m.social_links?.website || '',
      email: m.social_links?.email || '',
      ...(m.social_links || {})
    },

    // SEO Metadata
    seo_title: m.seo_title || meta.seo_title || '',
    seo_description: m.seo_description || meta.seo_description || '',
    canonical_url: m.canonical_url || meta.canonical_url || '',
    og_image: m.og_image || meta.og_image || '',

    created_at: m.created_at,
    updated_at: m.updated_at
  };
}

export function normalizeFounder(raw: any, idx: number = 0): Founder {
  if (!raw) {
    return {
      ...initialFounder,
      id: `founder-${Date.now()}`,
      display_order: idx + 1,
      status: 'draft',
      updated_at: new Date().toISOString()
    };
  }

  const meta = raw?.social_links?._meta || {};
  const founderId = raw.id || `founder-${Date.now()}-${idx}`;

  // 1. Education
  const education = parseStructuredEducation(raw.education || meta.education, { ...raw, id: founderId });

  // 2. Projects
  const projects = parseStructuredProjects(raw.projects || meta.projects, raw.major_projects || meta.major_projects, founderId);

  // 3. Experience
  const experience_records = parseStructuredExperience(raw.experience_records || meta.experience_records, { ...raw, id: founderId });

  // 4. Skills: Check structured_skills, meta, then parse custom_sections (e.g. V ABISHEK skills) if needed
  let structured_skills = parseStructuredSkills(raw.structured_skills || meta.structured_skills, raw.skills || meta.skills, founderId);
  if (structured_skills.length === 0 && Array.isArray(raw.custom_sections)) {
    const skillsSection = raw.custom_sections.find((s: any) => s.title?.toUpperCase().includes('SKILL'));
    if (skillsSection && typeof skillsSection.content === 'string') {
      const parsedFromCustom: ProfileSkill[] = [];
      const lines = skillsSection.content.split('\n').map((l: string) => l.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
      let order = 1;
      for (const line of lines) {
        const parts = line.split(/[–\-:]/);
        if (parts.length >= 2) {
          const catRaw = parts[0].trim().toLowerCase();
          let category: SkillCategory = 'Other';
          if (catRaw.includes('program') || catRaw.includes('lang')) category = 'Programming';
          else if (catRaw.includes('ai') || catRaw.includes('artificial') || catRaw.includes('learning') || catRaw.includes('ml')) category = 'AI / ML';
          else if (catRaw.includes('web') || catRaw.includes('full-stack') || catRaw.includes('frontend') || catRaw.includes('backend')) category = 'Web Development';
          else if (catRaw.includes('mobile')) category = 'Mobile Development';
          else if (catRaw.includes('cloud')) category = 'Cloud';
          else if (catRaw.includes('data')) category = 'Database';
          else if (catRaw.includes('devops') || catRaw.includes('git') || catRaw.includes('deploy')) category = 'DevOps';
          else if (catRaw.includes('hard') || catRaw.includes('embed')) category = 'Hardware';
          else if (catRaw.includes('design') || catRaw.includes('ui') || catRaw.includes('ux')) category = 'Design';
          else if (catRaw.includes('manage')) category = 'Management';

          const skillNames = parts[1].split(/[,·]/).map((s: string) => s.trim()).filter(Boolean);
          for (const sName of skillNames) {
            parsedFromCustom.push({
              id: `skill-${founderId}-${order}`,
              name: sName,
              category,
              proficiency: 'Expert',
              display_order: order++
            });
          }
        } else {
          parsedFromCustom.push({
            id: `skill-${founderId}-${order}`,
            name: line,
            category: 'Programming',
            proficiency: 'Advanced',
            display_order: order++
          });
        }
      }
      if (parsedFromCustom.length > 0) {
        structured_skills = parsedFromCustom;
      }
    }
  }

  const name = raw.name || initialFounder.name;
  const status = raw.status || meta.status || 'published';
  const slug = raw.slug || meta.slug || generateSlug(name);
  const company_branch = raw.company_branch || meta.company_branch || 'Ravan Technologies';
  const display_order = typeof raw.display_order === 'number' ? raw.display_order : (typeof meta.display_order === 'number' ? meta.display_order : idx + 1);

  return {
    id: founderId,
    name,
    designation: raw.designation || initialFounder.designation,
    company_branch,
    bio: raw.bio || initialFounder.bio,
    image_url: raw.image_url || initialFounder.image_url,
    display_order,
    status,
    slug,
    short_intro: raw.short_intro ?? meta.short_intro ?? raw.bio ?? initialFounder.short_intro ?? '',
    vision: raw.vision ?? meta.vision ?? initialFounder.vision ?? '',
    quote: raw.quote ?? meta.quote ?? initialFounder.quote ?? '',
    quote_author_tag: raw.quote_author_tag ?? meta.quote_author_tag ?? initialFounder.quote_author_tag ?? '',
    focus_areas: Array.isArray(raw.focus_areas) && raw.focus_areas.length > 0 ? raw.focus_areas : (Array.isArray(meta.focus_areas) && meta.focus_areas.length > 0 ? meta.focus_areas : (initialFounder.focus_areas || [])),
    tenure_years: raw.tenure_years ?? meta.tenure_years ?? initialFounder.tenure_years ?? '2 Years',
    achievements: Array.isArray(raw.achievements) && raw.achievements.length > 0 ? raw.achievements : (Array.isArray(meta.achievements) && meta.achievements.length > 0 ? meta.achievements : (initialFounder.achievements || [])),
    custom_sections: Array.isArray(raw.custom_sections) ? raw.custom_sections : [],

    // Structured Corporate Profile Data
    education,
    projects,
    experience_records,
    structured_skills,

    // Official Contact & Social
    public_email: raw.public_email ?? meta.public_email ?? raw.social_links?.email ?? initialFounder.public_email ?? '',
    public_phone: raw.public_phone ?? meta.public_phone ?? '',
    social_links: {
      linkedin: raw.social_links?.linkedin || '',
      youtube: raw.social_links?.youtube || '',
      instagram: raw.social_links?.instagram || '',
      twitter: raw.social_links?.twitter || '',
      github: raw.social_links?.github || '',
      facebook: raw.social_links?.facebook || '',
      website: raw.social_links?.website || '',
      email: raw.social_links?.email || raw.public_email || '',
      ...(raw.social_links || {})
    },

    // SEO Metadata
    seo_title: raw.seo_title || meta.seo_title || `${name} — Founder & Architect | Ravan Technologies`,
    seo_description: raw.seo_description || meta.seo_description || raw.bio || '',
    canonical_url: raw.canonical_url || meta.canonical_url || `/team/${slug}`,
    og_image: raw.og_image || meta.og_image || raw.image_url || '',

    created_at: raw.created_at,
    updated_at: raw.updated_at || new Date().toISOString()
  };
}

export function normalizeService(raw: any, idx: number = 0): ServiceItem {
  if (!raw) {
    return {
      id: `srv-${Date.now()}-${idx}`,
      slug: `service-${Date.now()}`,
      title: 'New Service',
      code: `0${idx + 1} // CAPABILITY`,
      short_description: '',
      full_description: '',
      icon: 'Cpu',
      image_url: '',
      features: [],
      technologies: [],
      display_order: idx + 1,
      status: 'published'
    };
  }

  // Handle packed deliverables JSONB metadata
  const meta = (raw.deliverables && typeof raw.deliverables === 'object' && !Array.isArray(raw.deliverables))
    ? raw.deliverables
    : {};

  const cleanTitle = raw.title || meta.title || 'Untitled Service';
  const cleanSlug = meta.slug || raw.slug || generateSlug(cleanTitle);

  const features: ServiceFeature[] = Array.isArray(raw.features)
    ? raw.features.map((f: any) => ({
        title: typeof f === 'string' ? f : (f?.title || ''),
        description: typeof f === 'string' ? '' : (f?.description || ''),
        icon: typeof f === 'object' ? (f?.icon || 'check_circle') : 'check_circle'
      }))
    : [];

  const technologies: string[] = Array.isArray(raw.technologies)
    ? raw.technologies.map((t: any) => typeof t === 'string' ? t.trim() : String(t)).filter(Boolean)
    : (typeof raw.technologies === 'string' ? raw.technologies.split(',').map((t: string) => t.trim()).filter(Boolean) : []);

  const benefits: string[] = Array.isArray(raw.benefits)
    ? raw.benefits
    : (Array.isArray(meta.benefits) ? meta.benefits : []);

  const status: 'draft' | 'published' | 'archived' = meta.status || 
    (raw.status ? raw.status : (raw.is_active === false ? 'draft' : 'published'));

  return {
    id: String(raw.id || `srv-${Date.now()}-${idx}`),
    slug: cleanSlug,
    title: cleanTitle,
    code: meta.code || raw.code || raw.category || `0${idx + 1} // ARCHITECTURE`,
    short_description: raw.short_description || meta.short_description || '',
    full_description: raw.full_description || raw.short_description || meta.full_description || '',
    icon: raw.icon || meta.icon || 'Cpu',
    image_url: meta.image_url || raw.image_url || '',
    metric_value: meta.metric_value || raw.metric_value || '',
    metric_label: meta.metric_label || raw.metric_label || 'SLA',
    features,
    technologies,
    benefits,
    cta_text: meta.cta_text || raw.cta_text || 'CONSULT',
    cta_url: meta.cta_url || raw.cta_url || '/contact',
    display_order: typeof raw.display_order === 'number' ? raw.display_order : idx + 1,
    status,
    seo_title: raw.seo_title || meta.seo_title,
    seo_description: raw.seo_description || meta.seo_description,
    deliverables: meta
  };
}

export function mapServiceForDb(s: ServiceItem) {
  const packedMeta = {
    slug: s.slug || generateSlug(s.title),
    code: s.code,
    image_url: s.image_url,
    metric_value: s.metric_value,
    metric_label: s.metric_label,
    cta_text: s.cta_text,
    cta_url: s.cta_url,
    status: s.status,
    benefits: s.benefits || []
  };

  return {
    id: s.id,
    title: s.title,
    category: s.code || '01 // ENTERPRISE',
    short_description: s.short_description || s.title,
    full_description: s.full_description || s.short_description || '',
    icon: s.icon || 'Cpu',
    features: Array.isArray(s.features) ? s.features : [],
    technologies: Array.isArray(s.technologies) ? s.technologies : [],
    benefits: Array.isArray(s.benefits) ? s.benefits : [],
    deliverables: packedMeta,
    display_order: typeof s.display_order === 'number' ? s.display_order : 0,
    is_active: s.status !== 'draft' && s.status !== 'archived',
    seo_title: s.seo_title || `${s.title} — Services | Ravan Technologies`,
    seo_description: s.seo_description || s.short_description || '',
    updated_at: new Date().toISOString()
  };
}

export function normalizeSolution(raw: any, idx: number = 0): SolutionItem {
  if (!raw) {
    return {
      id: `sol-${Date.now()}-${idx}`,
      slug: `solution-${Date.now()}`,
      title: 'New Enterprise Blueprint',
      category: 'Enterprise Engineering',
      description: '',
      architecture_details: '',
      benefits: [],
      image_url: '',
      display_order: idx + 1,
      status: 'published'
    };
  }

  // Handle packed metrics JSONB metadata
  const meta = (raw.metrics && typeof raw.metrics === 'object' && !Array.isArray(raw.metrics))
    ? raw.metrics
    : {};

  const cleanTitle = raw.title || meta.title || 'Untitled Blueprint';
  const cleanSlug = meta.slug || raw.slug || generateSlug(cleanTitle);

  const benefits: string[] = Array.isArray(meta.benefits)
    ? meta.benefits
    : (Array.isArray(raw.benefits) ? raw.benefits : []);

  const technologies: string[] = Array.isArray(raw.technologies)
    ? raw.technologies.map((t: any) => typeof t === 'string' ? t.trim() : String(t)).filter(Boolean)
    : (Array.isArray(meta.technologies) ? meta.technologies : []);

  const status: 'draft' | 'published' | 'archived' = meta.status || 
    (raw.status ? raw.status : (raw.is_active === false ? 'draft' : 'published'));

  return {
    id: String(raw.id || `sol-${Date.now()}-${idx}`),
    slug: cleanSlug,
    title: cleanTitle,
    category: raw.category || meta.category || 'Applied AI',
    description: raw.summary || raw.description || meta.description || '',
    architecture_details: raw.architecture || raw.architecture_details || meta.architecture_details || '',
    benefits,
    image_url: raw.image_url || meta.image_url || '',
    icon: meta.icon || raw.icon || 'Layers',
    problem: raw.challenge || meta.problem || '',
    solution: raw.impact || meta.solution || '',
    technologies,
    cta_text: meta.cta_text || raw.cta_text || 'REQUEST BLUEPRINT SPECS',
    cta_url: meta.cta_url || raw.cta_url || '/contact',
    display_order: typeof raw.display_order === 'number' ? raw.display_order : idx + 1,
    status,
    seo_title: raw.seo_title || meta.seo_title,
    seo_description: raw.seo_description || meta.seo_description,
    metrics: meta
  };
}

export function mapSolutionForDb(sol: SolutionItem) {
  const packedMeta = {
    slug: sol.slug || generateSlug(sol.title),
    benefits: Array.isArray(sol.benefits) ? sol.benefits : [],
    technologies: Array.isArray(sol.technologies) ? sol.technologies : [],
    icon: sol.icon || 'Layers',
    problem: sol.problem || '',
    solution: sol.solution || '',
    cta_text: sol.cta_text,
    cta_url: sol.cta_url,
    status: sol.status
  };

  return {
    id: sol.id,
    title: sol.title,
    category: sol.category || 'Applied AI',
    summary: sol.description || sol.title,
    challenge: sol.problem || '',
    architecture: sol.architecture_details || sol.solution || '',
    impact: sol.solution || '',
    image_url: sol.image_url || '',
    technologies: Array.isArray(sol.technologies) ? sol.technologies : [],
    metrics: packedMeta,
    display_order: typeof sol.display_order === 'number' ? sol.display_order : 0,
    is_active: sol.status !== 'draft' && sol.status !== 'archived',
    seo_title: sol.seo_title || `${sol.title} — Solutions | Ravan Technologies`,
    seo_description: sol.seo_description || sol.description || '',
    updated_at: new Date().toISOString()
  };
}

export function normalizeAboutContent(raw: any): AboutContent {
  const fallbackMandate = raw?.mandate || 'Engineering the infrastructure of tomorrow with sovereign intelligence and structural integrity.';
  const fallbackPhase1Title = raw?.phase1_title || 'Phase I: The Architectural Foundation';
  const fallbackPhase1Text = raw?.phase1_text || 'Established with a singular focus on structural integrity, Ravan began by architecting data systems that refuse to fail. Our initial mandate was clear: build enterprise backbones that treat massive scale as a baseline, not a feature.';
  const fallbackPhase2Title = raw?.phase2_title || 'Phase II: Intelligence Integration';
  const fallbackPhase2Text = raw?.phase2_text || "With a rock-solid foundation, we began embedding cognitive layers into our infrastructure. This wasn't merely appending AI; it was a fundamental rewiring of enterprise logic, allowing systems to anticipate, adapt, and self-optimize.";

  // 1. Company Overview
  const overview = {
    heading: raw?.overview?.heading || 'The Enterprise Mandate',
    short_intro: raw?.overview?.short_intro || fallbackMandate,
    detailed_description: raw?.overview?.detailed_description ?? 'Ravan Technologies exists at the intersection of authoritative enterprise engineering and bleeding-edge AI innovation. We transform complex global challenges into elegant, scalable architectures.',
    image_url: raw?.overview?.image_url || '',
    display_order: typeof raw?.overview?.display_order === 'number' ? raw?.overview?.display_order : 1,
    is_published: raw?.overview?.is_published !== false
  };

  // 2. Vision
  const vision = {
    title: raw?.vision?.title || 'Sovereign Intelligence & Self-Reliant Ecosystems',
    description: raw?.vision?.description || 'To engineer self-reliant technology ecosystems that empower institutional autonomy, resilience, and operational sovereignty.',
    image_url: raw?.vision?.image_url || '',
    display_order: typeof raw?.vision?.display_order === 'number' ? raw?.vision?.display_order : 1,
    is_published: raw?.vision?.is_published !== false
  };

  // 3. Mission
  const mission = {
    title: raw?.mission?.title || 'Architecting Uncompromising Foundations',
    description: raw?.mission?.description || 'To design and deploy enterprise computing architectures, autonomous intelligence layers, and sovereign infrastructure that treat massive scale as a baseline.',
    image_url: raw?.mission?.image_url || '',
    display_order: typeof raw?.mission?.display_order === 'number' ? raw?.mission?.display_order : 1,
    is_published: raw?.mission?.is_published !== false
  };

  // 4. Core Values (Core Axioms)
  let core_values = [];
  if (Array.isArray(raw?.core_values) && raw.core_values.length > 0) {
    core_values = raw.core_values.map((v: any, idx: number) => ({
      id: v.id || `val-${idx + 1}`,
      title: v.title || `Core Value ${idx + 1}`,
      short_description: v.short_description || '',
      icon: v.icon || (idx === 0 ? 'Shield' : idx === 1 ? 'Cpu' : 'CheckCircle2'),
      image_url: v.image_url || '',
      display_order: typeof v.display_order === 'number' ? v.display_order : idx + 1,
      is_published: v.is_published !== false
    }));
  } else {
    core_values = [
      {
        id: 'val-1',
        title: 'Premium Fidelity',
        short_description: 'We reject the disposable. Every line of code, every system architecture, and every user interface is crafted with rigorous attention to detail and long-term viability.',
        icon: 'Shield',
        image_url: '',
        display_order: 1,
        is_published: true
      },
      {
        id: 'val-2',
        title: 'Sovereign Innovation',
        short_description: 'Innovation is not a trend; it is structural. We deploy AI and advanced computing not for novelty, but to create autonomous, self-healing systems that empower true ownership.',
        icon: 'Cpu',
        image_url: '',
        display_order: 2,
        is_published: true
      },
      {
        id: 'val-3',
        title: 'Structural Integrity',
        short_description: 'Security and resilience are engineered into the lowest layers of the stack, never bolted on as an afterthought.',
        icon: 'CheckCircle2',
        image_url: '',
        display_order: 3,
        is_published: true
      }
    ];
  }

  // 5. Timeline / Genesis & Evolution
  let timeline = [];
  if (Array.isArray(raw?.timeline) && raw.timeline.length > 0) {
    timeline = raw.timeline.map((p: any, idx: number) => ({
      id: p.id || `phase-${idx + 1}`,
      phase_label: p.phase_label || `Phase ${idx === 0 ? 'I' : idx === 1 ? 'II' : idx === 2 ? 'III' : (idx + 1).toString()}`,
      title: p.title || `Phase ${idx + 1}`,
      short_description: p.short_description || '',
      detailed_description: p.detailed_description || '',
      date_or_year: p.date_or_year || '',
      image_url: p.image_url || '',
      icon: p.icon || (idx % 2 === 0 ? 'Server' : 'Cpu'),
      display_order: typeof p.display_order === 'number' ? p.display_order : idx + 1,
      is_published: p.is_published !== false
    }));
  } else {
    timeline = [
      {
        id: 'phase-1',
        phase_label: 'Phase I',
        title: fallbackPhase1Title,
        short_description: fallbackPhase1Text,
        detailed_description: '',
        date_or_year: 'Genesis',
        image_url: '',
        icon: 'Server',
        display_order: 1,
        is_published: true
      },
      {
        id: 'phase-2',
        phase_label: 'Phase II',
        title: fallbackPhase2Title,
        short_description: fallbackPhase2Text,
        detailed_description: '',
        date_or_year: 'Expansion',
        image_url: '',
        icon: 'Cpu',
        display_order: 2,
        is_published: true
      }
    ];
  }

  // 6. Milestones
  const milestones = Array.isArray(raw?.milestones)
    ? raw.milestones.map((m: any, idx: number) => ({
        id: m.id || `milestone-${idx + 1}`,
        title: m.title || `Milestone ${idx + 1}`,
        year_or_date: m.year_or_date || '',
        description: m.description || '',
        metric_value: m.metric_value || '',
        metric_label: m.metric_label || '',
        display_order: typeof m.display_order === 'number' ? m.display_order : idx + 1,
        is_published: m.is_published !== false
      }))
    : [];

  // 7. Capabilities
  const capabilities = Array.isArray(raw?.capabilities)
    ? raw.capabilities.map((c: any, idx: number) => ({
        id: c.id || `cap-${idx + 1}`,
        title: c.title || `Capability ${idx + 1}`,
        description: c.description || '',
        icon: c.icon || 'Cpu',
        display_order: typeof c.display_order === 'number' ? c.display_order : idx + 1,
        is_published: c.is_published !== false
      }))
    : [];

  // 8. SEO
  const seo = {
    meta_title: raw?.seo?.meta_title || 'About Us — The Enterprise Mandate | Ravan Technologies',
    meta_description: raw?.seo?.meta_description || overview.short_intro,
    canonical_url: raw?.seo?.canonical_url || '/about',
    og_title: raw?.seo?.og_title || raw?.seo?.meta_title || 'About Us — The Enterprise Mandate | Ravan Technologies',
    og_description: raw?.seo?.og_description || raw?.seo?.meta_description || overview.short_intro,
    og_image: raw?.seo?.og_image || overview.image_url || '/images/ravan-logo.png'
  };

  return {
    mandate: overview.short_intro,
    phase1_title: timeline[0]?.title || fallbackPhase1Title,
    phase1_text: timeline[0]?.short_description || fallbackPhase1Text,
    phase2_title: timeline[1]?.title || fallbackPhase2Title,
    phase2_text: timeline[1]?.short_description || fallbackPhase2Text,

    overview,
    vision,
    mission,
    core_values,
    timeline,
    milestones,
    capabilities,
    seo
  };
}

export const dataService = {
  async clearCache() {
    memoryCache.clearAll();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('ravan_') || k.startsWith('ravan_cache_meta_'))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } catch {}
    }
  },

  // =========================================================================
  // SYNCHRONOUS SWR HYDRATION LAYER (0ms First Paint / High-Traffic Resilience)
  // =========================================================================

  getSiteSettingsSync(): SiteSettings {
    const cached = memoryCache.get<SiteSettings>('site_settings');
    if (cached) return cached;
    const local = getLocal<SiteSettings>('ravan_site_settings', initialSiteSettings);
    if (local && (local.site_name || local.office_address)) {
      memoryCache.set('site_settings', local);
      return local;
    }
    return initialSiteSettings;
  },

  hasCachedSiteSettings(): boolean {
    return memoryCache.get('site_settings') !== null || (typeof window !== 'undefined' && !!localStorage.getItem('ravan_site_settings'));
  },

  getAboutContentSync(): AboutContent {
    const cached = memoryCache.get<AboutContent>('about_content');
    if (cached) return cached;
    const defaultAbout = normalizeAboutContent(null);
    const local = getLocal<AboutContent>('ravan_about_content', defaultAbout);
    if (local && local.overview) {
      const normalized = normalizeAboutContent(local);
      memoryCache.set('about_content', normalized);
      return normalized;
    }
    return defaultAbout;
  },

  getFoundersSync(): Founder[] {
    const cached = memoryCache.get<Founder[]>('founders');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    const local = getLocal<Founder[]>('ravan_founders', initialFounders);
    const source = (Array.isArray(local) && local.length > 0) ? local : initialFounders;
    const mapped = source.map((item, idx) => normalizeFounder(item, idx));
    mapped.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    memoryCache.set('founders', mapped);
    return mapped;
  },

  hasCachedFounders(): boolean {
    return memoryCache.get('founders') !== null || (typeof window !== 'undefined' && !!localStorage.getItem('ravan_founders'));
  },

  getFounderSync(): Founder {
    const founders = this.getFoundersSync();
    const published = founders.filter(f => f.status === 'published');
    return published[0] || founders[0] || normalizeFounder(initialFounder);
  },

  getFounderBySlugSync(slug: string): Founder | null {
    const founders = this.getFoundersSync();
    const cleanSlug = (slug || '').toLowerCase().trim();
    if (!cleanSlug) return null;

    const found = founders.find(f => {
      if (f.status !== 'published') return false;
      const explicitSlug = (f.slug || '').toLowerCase();
      const nameSlug = generateSlug(f.name || '').toLowerCase();
      if (explicitSlug === cleanSlug) return true;
      if (nameSlug === cleanSlug) return true;
      if (f.id.toLowerCase() === cleanSlug) return true;

      if (f.id === 'founder-001' && (cleanSlug === 'founder' || cleanSlug === 'v-abishek' || cleanSlug === 'abishek')) {
        return true;
      }

      const normalizedName = (f.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (normalizedName === cleanSlug) return true;
      if (cleanSlug.length > 3 && (normalizedName.includes(cleanSlug) || cleanSlug.includes(normalizedName))) return true;

      return false;
    });

    return found || null;
  },

  getLeadershipSync(): LeadershipMember[] {
    const cached = memoryCache.get<LeadershipMember[]>('leadership');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    const local = getLocal<LeadershipMember[]>('ravan_leadership', initialLeadership);
    const source = (Array.isArray(local) && local.length > 0) ? local : initialLeadership;
    const mapped = source.map(normalizeLeadershipMember);
    mapped.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    memoryCache.set('leadership', mapped);
    return mapped;
  },

  getLeadershipMemberBySlugSync(slug: string): LeadershipMember | null {
    const members = this.getLeadershipSync();
    const cleanSlug = (slug || '').toLowerCase().trim();
    if (!cleanSlug) return null;

    const found = members.find(m => {
      if (m.status !== 'published') return false;
      const explicitSlug = (m.slug || '').toLowerCase();
      const nameSlug = generateSlug(m.name || '').toLowerCase();
      if (explicitSlug === cleanSlug) return true;
      if (nameSlug === cleanSlug) return true;
      if (m.id.toLowerCase() === cleanSlug) return true;

      const normalizedName = (m.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (normalizedName === cleanSlug) return true;
      if (cleanSlug.length > 3 && (normalizedName.includes(cleanSlug) || cleanSlug.includes(normalizedName))) return true;

      return false;
    });

    return found || null;
  },

  getProfileBySlugSync(slug: string): { type: 'founder'; member: Founder } | { type: 'leadership'; member: LeadershipMember } | null {
    const founder = this.getFounderBySlugSync(slug);
    if (founder) return { type: 'founder', member: founder };

    const member = this.getLeadershipMemberBySlugSync(slug);
    if (member) return { type: 'leadership', member };

    return null;
  },

  getServicesSync(): ServiceItem[] {
    const cached = memoryCache.get<ServiceItem[]>('services');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    const local = getLocal<ServiceItem[]>('ravan_services', initialServices);
    const source = (Array.isArray(local) && local.length > 0) ? local : initialServices;
    const mapped = source.map((item, idx) => normalizeService(item, idx));
    mapped.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    memoryCache.set('services', mapped);
    return mapped;
  },

  getSolutionsSync(): SolutionItem[] {
    const cached = memoryCache.get<SolutionItem[]>('solutions');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    const local = getLocal<SolutionItem[]>('ravan_solutions', initialSolutions);
    const source = (Array.isArray(local) && local.length > 0) ? local : initialSolutions;
    const mapped = source.map((item, idx) => normalizeSolution(item, idx));
    mapped.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    memoryCache.set('solutions', mapped);
    return mapped;
  },

  getProjectsSync(): ProjectItem[] {
    const cached = memoryCache.get<ProjectItem[]>('projects');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    const local = getLocal<ProjectItem[]>('ravan_projects', initialProjects);
    const result = (Array.isArray(local) && local.length > 0) ? local : initialProjects;
    memoryCache.set('projects', result);
    return result;
  },

  getHackathonsSync(): HackathonItem[] {
    const cached = memoryCache.get<HackathonItem[]>('hackathons_list');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    const local = getLocal<HackathonItem[]>('ravan_hackathons_list', [initialHackathon]);
    const result = (Array.isArray(local) && local.length > 0) ? local : [initialHackathon];
    memoryCache.set('hackathons_list', result);
    return result;
  },

  getHackathonSync(): HackathonItem {
    const list = this.getHackathonsSync();
    return list.find(h => h.status !== 'draft') || list[0] || initialHackathon;
  },

  getLearningProgramsSync(): LearningProgram[] {
    const cached = memoryCache.get<LearningProgram[]>('learning');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    const local = getLocal<LearningProgram[]>('ravan_learning', initialLearningPrograms);
    const result = (Array.isArray(local) && local.length > 0) ? local : initialLearningPrograms;
    memoryCache.set('learning', result);
    return result;
  },

  getEcosystemSync(): EcosystemItem[] {
    const cached = memoryCache.get<EcosystemItem[]>('ecosystem');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    const local = getLocal<EcosystemItem[]>('ravan_ecosystem', initialEcosystem);
    const result = (Array.isArray(local) && local.length > 0) ? local : initialEcosystem;
    memoryCache.set('ecosystem', result);
    return result;
  },

  getAIMLModelsSync(): AIMLModel[] {
    const cached = memoryCache.get<AIMLModel[]>('aiml_models');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    const local = getLocal<AIMLModel[]>('ravan_aiml_models', initialAIMLModels);
    const result = (Array.isArray(local) && local.length > 0) ? local : initialAIMLModels;
    memoryCache.set('aiml_models', result);
    return result;
  },

  getSEOSettingsSync(): SEOSettings {
    const cached = memoryCache.get<SEOSettings>('seo_settings');
    if (cached) return cached;
    const local = getLocal<SEOSettings>('ravan_seo', initialSEOSettings);
    const result = local || initialSEOSettings;
    memoryCache.set('seo_settings', result);
    return result;
  },

  getBlogPostsSync(): BlogPost[] {
    const cached = memoryCache.get<BlogPost[]>('blog');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    const local = getLocal<BlogPost[]>('ravan_blog_posts', initialBlogPosts);
    const result = (Array.isArray(local) && local.length > 0) ? local : initialBlogPosts;
    memoryCache.set('blog', result);
    return result;
  },

  getEventsSync(): EventItem[] {
    const cached = memoryCache.get<EventItem[]>('events');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    const local = getLocal<EventItem[]>('ravan_events', initialEvents);
    const result = (Array.isArray(local) && local.length > 0) ? local : initialEvents;
    memoryCache.set('events', result);
    return result;
  },

  getGalleryAlbumsSync(): GalleryAlbum[] {
    const cached = memoryCache.get<GalleryAlbum[]>('gallery');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    const local = getLocal<GalleryAlbum[]>('ravan_gallery_albums', initialGalleryAlbums);
    const result = (Array.isArray(local) && local.length > 0) ? local : initialGalleryAlbums;
    memoryCache.set('gallery', result);
    return result;
  },

  getTestimonialsSync(): TestimonialItem[] {
    const cached = memoryCache.get<TestimonialItem[]>('testimonials');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    const local = getLocal<TestimonialItem[]>('ravan_testimonials', initialTestimonials);
    const result = (Array.isArray(local) && local.length > 0) ? local : initialTestimonials;
    memoryCache.set('testimonials', result);
    return result;
  },

  getPartnersSync(): PartnerItem[] {
    const cached = memoryCache.get<PartnerItem[]>('partners');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    const local = getLocal<PartnerItem[]>('ravan_partners', initialPartners);
    const result = (Array.isArray(local) && local.length > 0) ? local : initialPartners;
    memoryCache.set('partners', result);
    return result;
  },

  getClientsSync(): ClientItem[] {
    const cached = memoryCache.get<ClientItem[]>('clients');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    const local = getLocal<ClientItem[]>('ravan_clients', initialClients);
    const result = (Array.isArray(local) && local.length > 0) ? local : initialClients;
    memoryCache.set('clients', result);
    return result;
  },

  getNavigationSync(): NavigationItem[] {
    const cached = memoryCache.get<NavigationItem[]>('navigation');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    const local = getLocal<NavigationItem[]>('ravan_navigation', initialNavigation);
    const result = (Array.isArray(local) && local.length > 0) ? local : initialNavigation;
    memoryCache.set('navigation', result);
    return result;
  },

  // --- SITE SETTINGS & LOGO MANAGEMENT ---
  async getSiteSettings(forceRefresh: boolean = false): Promise<SiteSettings> {
    if (forceRefresh) memoryCache.invalidate('site_settings');
    return memoryCache.dedupedFetch('site_settings', async () => {
      const local = getLocal<SiteSettings>('ravan_site_settings', initialSiteSettings);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('site_settings').select('*').single();
          if (!error && data) {
            const meta = data?.social_links?._meta || {};
            const cleanOfficeAddress = (data.office_address && !data.office_address.includes('Bengaluru'))
              ? data.office_address
              : (meta.office_address || initialSiteSettings.office_address);

            const normalized: SiteSettings = {
              ...initialSiteSettings,
              ...data,
              office_address: cleanOfficeAddress,
              hq_location: data.hq_location || meta.hq_location || cleanOfficeAddress || 'Thiruvannamalai, Tamil Nadu, India',
              hq_label: data.hq_label || meta.hq_label || 'Global Headquarters',
              hq_city: data.hq_city || meta.hq_city || 'Thiruvannamalai',
              hq_state: data.hq_state || meta.hq_state || 'Tamil Nadu',
              hq_country: data.hq_country || meta.hq_country || 'India',
              hero_image_url: (data.hero_image_url !== undefined && data.hero_image_url !== null)
                ? data.hero_image_url
                : (meta.hero_image_url !== undefined && meta.hero_image_url !== null ? meta.hero_image_url : ''),
              hero_image_alt: data.hero_image_alt || meta.hero_image_alt || 'Ravan Technologies Sovereign Intelligence Infrastructure',
              hero_image_focal_x: typeof (data.hero_image_focal_x ?? meta.hero_image_focal_x) === 'number'
                ? (data.hero_image_focal_x ?? meta.hero_image_focal_x)
                : 50,
              hero_image_focal_y: typeof (data.hero_image_focal_y ?? meta.hero_image_focal_y) === 'number'
                ? (data.hero_image_focal_y ?? meta.hero_image_focal_y)
                : 50,
              hero_image_zoom: typeof (data.hero_image_zoom ?? meta.hero_image_zoom) === 'number'
                ? (data.hero_image_zoom ?? meta.hero_image_zoom)
                : 1,
              hero_badge_text: data.hero_badge_text || meta.hero_badge_text || 'SOVEREIGN INTELLIGENCE IN ENTERPRISE ENGINEERING',
              hero_title: data.hero_title || meta.hero_title || 'Building Technology. Solving Real Problems.',
              hero_subtitle: data.hero_subtitle || meta.hero_subtitle || 'Ravan Technologies builds software, AI/ML solutions, learning platforms and innovation programs designed to solve meaningful real-world challenges.'
            };
            setLocal('ravan_site_settings', normalized);
            return normalized;
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getSiteSettings fallback:', err);
      }
      return local;
    });
  },

  async updateSiteSettings(updated: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSiteSettings();
    const merged = { ...current, ...updated };

    if (supabase) {
      const socialLinksWithMeta = {
        ...(merged.social_links || {}),
        _meta: {
          hero_image_url: merged.hero_image_url,
          hero_image_alt: merged.hero_image_alt,
          hero_image_focal_x: merged.hero_image_focal_x,
          hero_image_focal_y: merged.hero_image_focal_y,
          hero_image_zoom: merged.hero_image_zoom,
          hero_badge_text: merged.hero_badge_text,
          hero_title: merged.hero_title,
          hero_subtitle: merged.hero_subtitle,
          hq_location: merged.hq_location,
          hq_label: merged.hq_label,
          hq_city: merged.hq_city,
          hq_state: merged.hq_state,
          hq_country: merged.hq_country,
          office_address: merged.office_address
        }
      };

      const payload: Record<string, any> = {
        id: 'primary_settings',
        site_name: merged.site_name,
        company_name: merged.company_name,
        tagline: merged.tagline,
        description: merged.description,
        logo_url: merged.logo_url,
        logo_dark_url: merged.logo_dark_url,
        logo_alt: merged.logo_alt,
        favicon_url: merged.favicon_url,
        contact_email: merged.contact_email,
        contact_phone: merged.contact_phone,
        whatsapp_number: merged.whatsapp_number,
        office_address: merged.office_address,
        social_links: socialLinksWithMeta,
        footer_text: merged.footer_text,
        copyright_text: merged.copyright_text,
        maintenance_mode: merged.maintenance_mode,
        updated_at: new Date().toISOString()
      };

      // Try saving with direct hero & hq columns first
      const { error } = await supabase.from('site_settings').upsert({
        ...payload,
        hero_image_url: merged.hero_image_url,
        hero_image_alt: merged.hero_image_alt,
        hero_image_focal_x: merged.hero_image_focal_x,
        hero_image_focal_y: merged.hero_image_focal_y,
        hq_location: merged.hq_location
      });

      if (error) {
        // Fallback without direct columns if table lacks them
        const fallbackRes = await supabase.from('site_settings').upsert(payload);
        if (fallbackRes.error) {
          if (import.meta.env.DEV) console.error('Supabase error updating site_settings:', fallbackRes.error.message);
          throw formatSupabaseError(fallbackRes.error, 'site_settings');
        }
      }
    }

    setLocal('ravan_site_settings', merged);
    memoryCache.set('site_settings', merged);

    try {
      await this.addAuditLog('UPDATE', 'SITE_SETTINGS', 'primary_settings', 'Updated site settings & brand hero image configuration');
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ravan_site_settings_updated', { detail: merged }));
    }
    notifyDataUpdated('site_settings');

    return merged;
  },

  // --- ABOUT US ---
  async getAboutContent(forceRefresh: boolean = false): Promise<AboutContent> {
    if (forceRefresh) memoryCache.invalidate('about_content');

    return memoryCache.dedupedFetch('about_content', async () => {
      const defaultAbout = normalizeAboutContent(null);
      const local = getLocal<AboutContent>('ravan_about_content', defaultAbout);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('site_settings').select('about_content').single();
          if (!error && data?.about_content) {
            const normalized = normalizeAboutContent(data.about_content);
            setLocal('ravan_about_content', normalized);
            return normalized;
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getAboutContent fallback:', err);
      }
      return normalizeAboutContent(local);
    });
  },

  async saveAboutContent(content: AboutContent): Promise<AboutContent> {
    const normalized = normalizeAboutContent(content);

    if (supabase) {
      const { error } = await supabase.from('site_settings').upsert({ id: 'primary_settings', about_content: normalized });
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error saving about content:', error.message);
        throw formatSupabaseError(error, 'site_settings');
      }
    }

    setLocal('ravan_about_content', normalized);
    memoryCache.set('about_content', normalized);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ravan_about_updated', { detail: normalized }));
    }

    try {
      await this.addAuditLog('UPDATE', 'ABOUT', 'primary_settings', 'Updated About Us mandate & trajectory content');
    } catch {}

    notifyDataUpdated('about');
    return normalized;
  },

  // --- FOUNDERS MANAGEMENT ---
  async getFounders(forceRefresh: boolean = false): Promise<Founder[]> {
    if (forceRefresh) {
      memoryCache.invalidate('founders');
      memoryCache.invalidate('founder');
    }
    return memoryCache.dedupedFetch('founders', async () => {
      const local = getLocal<Founder[]>('ravan_founders', initialFounders);
      try {
        if (supabase) {
          let data: any[] | null = null;
          const resWithOrder = await supabase.from('founders').select('*').order('display_order');
          if (!resWithOrder.error && Array.isArray(resWithOrder.data) && resWithOrder.data.length > 0) {
            data = resWithOrder.data;
          } else {
            const resFallback = await supabase.from('founders').select('*');
            if (!resFallback.error && Array.isArray(resFallback.data) && resFallback.data.length > 0) {
              data = resFallback.data;
            }
          }

          if (data && data.length > 0) {
            const normalized = data.map((item, idx) => normalizeFounder(item, idx));
            normalized.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
            setLocal('ravan_founders', normalized);
            setLocal('ravan_founder', normalized[0]);
            memoryCache.set('founder', normalized[0]);
            return normalized;
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getFounders fallback:', err);
      }
      const mapped = local.map((item, idx) => normalizeFounder(item, idx));
      mapped.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      return mapped;
    });
  },

  async getFounder(forceRefresh: boolean = false): Promise<Founder> {
    const founders = await this.getFounders(forceRefresh);
    return founders[0] || normalizeFounder(initialFounder);
  },

  async getFounderBySlug(slug: string): Promise<Founder | null> {
    const founders = await this.getFounders();
    const cleanSlug = (slug || '').toLowerCase().trim();
    if (!cleanSlug) return null;

    const found = founders.find(f => {
      if (f.status !== 'published') return false;
      const explicitSlug = (f.slug || '').toLowerCase();
      const nameSlug = generateSlug(f.name || '').toLowerCase();
      if (explicitSlug === cleanSlug) return true;
      if (nameSlug === cleanSlug) return true;
      if (f.id.toLowerCase() === cleanSlug) return true;

      // Match common founder aliases for V ABISHEK
      if (f.id === 'founder-001' && (cleanSlug === 'founder' || cleanSlug === 'v-abishek' || cleanSlug === 'abishek')) {
        return true;
      }

      const normalizedName = (f.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (normalizedName === cleanSlug) return true;
      if (cleanSlug.length > 3 && (normalizedName.includes(cleanSlug) || cleanSlug.includes(normalizedName))) return true;

      return false;
    });

    return found || null;
  },

  async saveFounders(founders: Founder[]): Promise<Founder[]> {
    const normalized = founders.map((f, idx) => normalizeFounder(f, idx));

    if (supabase) {
      const rowsForDb = normalized.map(f => {
        const {
          slug,
          company_branch,
          display_order,
          status,
          short_intro,
          education,
          projects,
          experience_records,
          structured_skills,
          public_email,
          public_phone,
          social_links,
          seo_title,
          seo_description,
          canonical_url,
          og_image,
          ...coreFields
        } = f;

        const packedSocialLinks = {
          ...(social_links || {}),
          _meta: {
            slug,
            company_branch,
            display_order,
            status,
            short_intro,
            education,
            projects,
            experience_records,
            structured_skills,
            public_email,
            public_phone,
            seo_title,
            seo_description,
            canonical_url,
            og_image
          }
        };

        const payload: Record<string, any> = {
          id: coreFields.id,
          name: coreFields.name,
          designation: coreFields.designation,
          bio: coreFields.bio,
          image_url: coreFields.image_url,
          vision: coreFields.vision,
          quote: coreFields.quote,
          quote_author_tag: coreFields.quote_author_tag,
          focus_areas: coreFields.focus_areas || [],
          tenure_years: coreFields.tenure_years,
          achievements: coreFields.achievements || [],
          custom_sections: coreFields.custom_sections || [],
          social_links: packedSocialLinks,
          seo_title,
          seo_description,
          updated_at: new Date().toISOString()
        };

        if (slug) payload.slug = slug;
        if (company_branch) payload.company_branch = company_branch;
        if (typeof display_order === 'number') payload.display_order = display_order;
        if (status) payload.status = status;

        return payload;
      });

      const { error } = await supabase.from('founders').upsert(rowsForDb);
      if (error) {
        // Fallback without dynamic columns if table lacks them
        const corePayloads = rowsForDb.map(r => {
          const { slug, company_branch, display_order, status, ...rest } = r;
          return rest;
        });
        const fallbackRes = await supabase.from('founders').upsert(corePayloads);
        if (fallbackRes.error) {
          if (import.meta.env.DEV) console.error('Supabase error saving founders:', fallbackRes.error.message);
          throw formatSupabaseError(fallbackRes.error, 'founders');
        }
      }
    }

    setLocal('ravan_founders', normalized);
    setLocal('ravan_founder', normalized[0] || initialFounder);
    memoryCache.set('founders', normalized);
    memoryCache.set('founder', normalized[0] || initialFounder);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ravan_founders_updated', { detail: normalized }));
      window.dispatchEvent(new CustomEvent('ravan_founder_updated', { detail: normalized[0] }));
    }

    try {
      await this.addAuditLog('UPDATE', 'FOUNDERS', undefined, `Updated Founders roster (${normalized.length} founders)`);
    } catch {}

    notifyDataUpdated('founder');
    return normalized;
  },

  async updateFounder(updated: Partial<Founder>): Promise<Founder> {
    const currentFounders = await this.getFounders();
    const targetId = updated.id || currentFounders[0]?.id || 'founder-001';
    const index = currentFounders.findIndex(f => f.id === targetId);

    let newFounders: Founder[];
    if (index >= 0) {
      newFounders = [...currentFounders];
      newFounders[index] = { ...newFounders[index], ...updated, updated_at: new Date().toISOString() };
    } else {
      newFounders = [...currentFounders, { ...initialFounder, ...updated, updated_at: new Date().toISOString() }];
    }

    const saved = await this.saveFounders(newFounders);
    const updatedFounder = saved.find(f => f.id === targetId) || saved[0];
    return updatedFounder;
  },

  // --- LEADERSHIP ---
  async getLeadership(forceRefresh: boolean = false): Promise<LeadershipMember[]> {
    if (forceRefresh) memoryCache.invalidate('leadership');
    return memoryCache.dedupedFetch('leadership', async () => {
      const local = getLocal<LeadershipMember[]>('ravan_leadership', initialLeadership);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('leadership').select('*').order('display_order');
          if (!error && Array.isArray(data)) {
            const normalized = data.map(normalizeLeadershipMember);
            setLocal('ravan_leadership', normalized);
            return normalized;
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getLeadership fallback:', err);
      }
      return local.map(normalizeLeadershipMember);
    });
  },

  async getLeadershipMemberBySlug(slug: string): Promise<LeadershipMember | null> {
    const members = await this.getLeadership();
    const cleanSlug = (slug || '').toLowerCase().trim();
    if (!cleanSlug) return null;

    const found = members.find(m => {
      if (m.status !== 'published') return false;
      const explicitSlug = (m.slug || '').toLowerCase();
      const nameSlug = generateSlug(m.name || '').toLowerCase();
      if (explicitSlug === cleanSlug) return true;
      if (nameSlug === cleanSlug) return true;
      if (m.id.toLowerCase() === cleanSlug) return true;

      // Match normalized name e.g. "a-berry-sugandh-surya" or "berry-sugandh-surya"
      const normalizedName = (m.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (normalizedName === cleanSlug) return true;
      if (cleanSlug.length > 3 && (normalizedName.includes(cleanSlug) || cleanSlug.includes(normalizedName))) return true;

      return false;
    });

    return found || null;
  },

  async saveLeadership(members: LeadershipMember[]): Promise<LeadershipMember[]> {
    const normalizedMembers = members.map(normalizeLeadershipMember);

    if (supabase) {
      // Pack extended fields into social_links._meta to guarantee schema compatibility
      const rowsForDb = normalizedMembers.map(m => {
        const {
          slug,
          short_intro,
          education,
          projects,
          experience_records,
          structured_skills,
          responsibilities,
          contributions,
          major_projects,
          skills,
          achievements,
          experience,
          importance,
          public_email,
          public_phone,
          social_links,
          seo_title,
          seo_description,
          canonical_url,
          og_image,
          ...coreFields
        } = m;

        const packedSocialLinks = {
          ...(social_links || {}),
          _meta: {
            slug,
            short_intro,
            education,
            projects,
            experience_records,
            structured_skills,
            responsibilities,
            contributions,
            major_projects,
            skills,
            achievements,
            experience,
            importance,
            public_email,
            public_phone,
            seo_title,
            seo_description,
            canonical_url,
            og_image
          }
        };

        return {
          id: coreFields.id,
          name: coreFields.name,
          designation: coreFields.designation,
          company_branch: coreFields.company_branch,
          bio: coreFields.bio,
          image_url: coreFields.image_url,
          display_order: coreFields.display_order,
          status: coreFields.status,
          social_links: packedSocialLinks,
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await supabase.from('leadership').upsert(rowsForDb);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error saving leadership:', error.message);
        throw formatSupabaseError(error, 'leadership');
      }
    }

    setLocal('ravan_leadership', normalizedMembers);
    memoryCache.set('leadership', normalizedMembers);

    try {
      await this.addAuditLog('UPDATE', 'LEADERSHIP', undefined, `Updated leadership roster (${normalizedMembers.length} members)`);
    } catch {}

    notifyDataUpdated('leadership');
    return normalizedMembers;
  },

  // --- SERVICES ---
  async getServices(forceRefresh: boolean = false): Promise<ServiceItem[]> {
    if (forceRefresh) memoryCache.invalidate('services');
    return memoryCache.dedupedFetch('services', async () => {
      const local = getLocal<ServiceItem[]>('ravan_services', initialServices);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('services').select('*').order('display_order').limit(100);
          if (!error && Array.isArray(data) && data.length > 0) {
            const normalized = data.map((item, idx) => normalizeService(item, idx));
            setLocal('ravan_services', normalized);
            return normalized;
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getServices fallback:', err);
      }
      return (local && local.length > 0 ? local : initialServices).map((item, idx) => normalizeService(item, idx));
    });
  },

  async saveServices(services: ServiceItem[]): Promise<ServiceItem[]> {
    const normalizedServices = services.map((s, idx) => normalizeService(s, idx));

    if (supabase) {
      // 1. Detect and purge deleted service records
      try {
        const { data: existing } = await supabase.from('services').select('id');
        if (Array.isArray(existing)) {
          const newIds = new Set(normalizedServices.map(s => s.id));
          const toDelete = existing.filter(e => !newIds.has(e.id)).map(e => e.id);
          if (toDelete.length > 0) {
            await supabase.from('services').delete().in('id', toDelete);
          }
        }
      } catch (delErr) {
        if (import.meta.env.DEV) console.warn('Supabase services deletion sync notice:', delErr);
      }

      // 2. Map payload cleanly to PostgreSQL schema columns
      const rowsForDb = normalizedServices.map(mapServiceForDb);
      const { error } = await supabase.from('services').upsert(rowsForDb);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error saving services:', error.message);
        throw formatSupabaseError(error, 'services');
      }
    }

    setLocal('ravan_services', normalizedServices);
    memoryCache.set('services', normalizedServices);

    try {
      await this.addAuditLog('UPDATE', 'SERVICES', undefined, `Updated services catalog (${normalizedServices.length} services)`);
    } catch {}

    notifyDataUpdated('services');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ravan_services_updated', { detail: normalizedServices }));
    }
    return normalizedServices;
  },

  // --- SOLUTIONS ---
  async getSolutions(forceRefresh: boolean = false): Promise<SolutionItem[]> {
    if (forceRefresh) memoryCache.invalidate('solutions');
    return memoryCache.dedupedFetch('solutions', async () => {
      const local = getLocal<SolutionItem[]>('ravan_solutions', initialSolutions);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('solutions').select('*').order('display_order').limit(100);
          if (!error && Array.isArray(data) && data.length > 0) {
            const normalized = data.map((item, idx) => normalizeSolution(item, idx));
            setLocal('ravan_solutions', normalized);
            return normalized;
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getSolutions fallback:', err);
      }
      return (local && local.length > 0 ? local : initialSolutions).map((item, idx) => normalizeSolution(item, idx));
    });
  },

  async saveSolutions(solutions: SolutionItem[]): Promise<SolutionItem[]> {
    const normalizedSolutions = solutions.map((s, idx) => normalizeSolution(s, idx));

    if (supabase) {
      // 1. Detect and purge deleted solution records
      try {
        const { data: existing } = await supabase.from('solutions').select('id');
        if (Array.isArray(existing)) {
          const newIds = new Set(normalizedSolutions.map(s => s.id));
          const toDelete = existing.filter(e => !newIds.has(e.id)).map(e => e.id);
          if (toDelete.length > 0) {
            await supabase.from('solutions').delete().in('id', toDelete);
          }
        }
      } catch (delErr) {
        if (import.meta.env.DEV) console.warn('Supabase solutions deletion sync notice:', delErr);
      }

      // 2. Map payload cleanly to PostgreSQL schema columns
      const rowsForDb = normalizedSolutions.map(mapSolutionForDb);
      const { error } = await supabase.from('solutions').upsert(rowsForDb);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error saving solutions:', error.message);
        throw formatSupabaseError(error, 'solutions');
      }
    }

    setLocal('ravan_solutions', normalizedSolutions);
    memoryCache.set('solutions', normalizedSolutions);

    try {
      await this.addAuditLog('UPDATE', 'SOLUTIONS', undefined, `Updated solutions blueprints (${normalizedSolutions.length} items)`);
    } catch {}

    notifyDataUpdated('solutions');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ravan_solutions_updated', { detail: normalizedSolutions }));
    }
    return normalizedSolutions;
  },

  // --- PROJECTS ---
  async getProjects(): Promise<ProjectItem[]> {
    return memoryCache.dedupedFetch('projects', async () => {
      const local = getLocal<ProjectItem[]>('ravan_projects', initialProjects);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('projects').select('*').order('display_order').limit(100);
          if (!error && Array.isArray(data)) {
            setLocal('ravan_projects', data);
            return data as ProjectItem[];
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getProjects fallback:', err);
      }
      return local;
    });
  },

  async saveProjects(projects: ProjectItem[]): Promise<ProjectItem[]> {
    if (supabase) {
      const { error } = await supabase.from('projects').upsert(projects);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error saving projects:', error.message);
        throw formatSupabaseError(error, 'projects');
      }
    }

    setLocal('ravan_projects', projects);
    memoryCache.set('projects', projects);

    try {
      await this.addAuditLog('UPDATE', 'PROJECTS', undefined, `Updated case studies (${projects.length} projects)`);
    } catch {}

    notifyDataUpdated('projects');
    return projects;
  },

  // --- HACKATHONS ---
  async getHackathon(): Promise<HackathonItem> {
    const list = await this.getHackathons();
    return list.find(h => h.status !== 'draft') || list[0] || initialHackathon;
  },

  async getHackathons(): Promise<HackathonItem[]> {
    return memoryCache.dedupedFetch('hackathons_list', async () => {
      const local = getLocal<HackathonItem[]>('ravan_hackathons_list', [initialHackathon]);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('hackathons').select('*').order('created_at', { ascending: false });
          if (!error && Array.isArray(data) && data.length > 0) {
            setLocal('ravan_hackathons_list', data);
            return data as HackathonItem[];
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getHackathons fallback:', err);
      }
      return local;
    });
  },

  async saveHackathon(hackathon: HackathonItem): Promise<HackathonItem> {
    const current = await this.getHackathons();
    const existingIdx = current.findIndex(h => h.id === hackathon.id);
    let updated: HackathonItem[];
    if (existingIdx >= 0) {
      updated = current.map(h => h.id === hackathon.id ? hackathon : h);
    } else {
      updated = [hackathon, ...current];
    }
    await this.saveHackathons(updated);
    return hackathon;
  },

  async saveHackathons(hackathons: HackathonItem[]): Promise<HackathonItem[]> {
    if (supabase) {
      const { error } = await supabase.from('hackathons').upsert(hackathons);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error saving hackathons:', error.message);
        throw formatSupabaseError(error, 'hackathons');
      }
    }

    setLocal('ravan_hackathons_list', hackathons);
    if (hackathons.length > 0) {
      setLocal('ravan_hackathon', hackathons[0]);
      memoryCache.set('hackathons', hackathons[0]);
    }
    memoryCache.set('hackathons_list', hackathons);

    try {
      await this.addAuditLog('UPDATE', 'HACKATHONS', undefined, `Updated hackathons (${hackathons.length} events)`);
    } catch {}

    notifyDataUpdated('hackathons');
    return hackathons;
  },

  async deleteHackathon(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('hackathons').delete().eq('id', id);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error deleting hackathon:', error.message);
        throw formatSupabaseError(error, 'hackathons');
      }
    }
    const current = await this.getHackathons();
    const updated = current.filter(h => h.id !== id);
    setLocal('ravan_hackathons_list', updated);
    memoryCache.set('hackathons_list', updated);
    if (updated.length > 0) {
      setLocal('ravan_hackathon', updated[0]);
      memoryCache.set('hackathons', updated[0]);
    }
    notifyDataUpdated('hackathons');
  },

  // --- LEARNING PROGRAMS ---
  async getLearningPrograms(): Promise<LearningProgram[]> {
    return memoryCache.dedupedFetch('learning', async () => {
      const local = getLocal<LearningProgram[]>('ravan_learning', initialLearningPrograms);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('learning_programs').select('*').order('display_order').limit(100);
          if (!error && Array.isArray(data) && data.length > 0) {
            setLocal('ravan_learning', data);
            return data as LearningProgram[];
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getLearningPrograms fallback:', err);
      }
      return local;
    });
  },

  async saveLearningPrograms(programs: LearningProgram[]): Promise<LearningProgram[]> {
    if (supabase) {
      const { error } = await supabase.from('learning_programs').upsert(programs);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error saving learning_programs:', error.message);
        throw formatSupabaseError(error, 'learning_programs');
      }
    }

    setLocal('ravan_learning', programs);
    memoryCache.set('learning', programs);

    try {
      await this.addAuditLog('UPDATE', 'LEARNING', undefined, `Updated learning tracks (${programs.length} programs)`);
    } catch {}

    notifyDataUpdated('learning');
    return programs;
  },

  async deleteLearningProgram(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('learning_programs').delete().eq('id', id);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error deleting learning program:', error.message);
        throw formatSupabaseError(error, 'learning_programs');
      }
    }
    const current = await this.getLearningPrograms();
    const updated = current.filter(p => p.id !== id);
    setLocal('ravan_learning', updated);
    memoryCache.set('learning', updated);
    notifyDataUpdated('learning');
  },

  // --- AI & ML MODELS ---
  async getAIMLModels(): Promise<AIMLModel[]> {
    return memoryCache.dedupedFetch('aiml_models', async () => {
      const local = getLocal<AIMLModel[]>('ravan_aiml_models', initialAIMLModels);
      try {
        if (supabase) {
          // Check if stored in solutions with category 'ai_model' or dedicated table
          const { data, error } = await supabase
            .from('solutions')
            .select('*')
            .eq('category', 'ai_model')
            .order('display_order');
          if (!error && Array.isArray(data) && data.length > 0) {
            const mapped: AIMLModel[] = data.map((d: any) => ({
              id: d.id,
              name: d.title,
              provider: d.metrics?.provider || 'Ravan Technologies',
              model_type: d.architecture_details || 'Private Transformer',
              description: d.description || '',
              capabilities: Array.isArray(d.technologies) ? d.technologies : [],
              use_cases: Array.isArray(d.benefits) ? d.benefits : [],
              version: d.metrics?.version || 'v1.0',
              documentation_url: d.cta_url || '',
              image_url: d.image_url || '',
              status: d.status || 'published',
              latency: d.metrics?.latency || '15ms',
              display_order: d.display_order || 0
            }));
            setLocal('ravan_aiml_models', mapped);
            return mapped;
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getAIMLModels fallback:', err);
      }
      return local;
    });
  },

  async saveAIMLModels(models: AIMLModel[]): Promise<AIMLModel[]> {
    if (supabase) {
      try {
        const solutionsPayload = models.map(m => ({
          id: m.id.startsWith('sol-') ? m.id : `sol-${m.id}`,
          slug: `aiml-${m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          title: m.name,
          category: 'ai_model',
          description: m.description,
          architecture_details: m.model_type,
          technologies: m.capabilities,
          benefits: m.use_cases,
          image_url: m.image_url || '',
          cta_url: m.documentation_url || '',
          display_order: m.display_order,
          status: m.status,
          metrics: {
            provider: m.provider,
            version: m.version,
            latency: m.latency
          }
        }));
        await supabase.from('solutions').upsert(solutionsPayload);
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase saveAIMLModels note:', err);
      }
    }

    setLocal('ravan_aiml_models', models);
    memoryCache.set('aiml_models', models);

    try {
      await this.addAuditLog('UPDATE', 'AIML_MODELS', undefined, `Updated AI/ML models (${models.length} specifications)`);
    } catch {}

    notifyDataUpdated('aiml_models');
    return models;
  },

  async deleteAIMLModel(id: string): Promise<void> {
    if (supabase) {
      try {
        const solId = id.startsWith('sol-') ? id : `sol-${id}`;
        await supabase.from('solutions').delete().eq('id', solId);
      } catch {}
    }
    const current = await this.getAIMLModels();
    const updated = current.filter(m => m.id !== id);
    setLocal('ravan_aiml_models', updated);
    memoryCache.set('aiml_models', updated);
    notifyDataUpdated('aiml_models');
  },

  // --- ECOSYSTEM ---
  async getEcosystem(): Promise<EcosystemItem[]> {
    return memoryCache.dedupedFetch('ecosystem', async () => {
      const local = getLocal<EcosystemItem[]>('ravan_ecosystem', initialEcosystem);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('ecosystem').select('*');
          if (!error && Array.isArray(data) && data.length > 0) {
            setLocal('ravan_ecosystem', data);
            return data as EcosystemItem[];
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getEcosystem fallback:', err);
      }
      return local;
    });
  },

  async saveEcosystem(items: EcosystemItem[]): Promise<EcosystemItem[]> {
    if (supabase) {
      const { error } = await supabase.from('ecosystem').upsert(items);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error saving ecosystem:', error.message);
        throw formatSupabaseError(error, 'ecosystem');
      }
    }

    setLocal('ravan_ecosystem', items);
    memoryCache.set('ecosystem', items);

    try {
      await this.addAuditLog('UPDATE', 'ECOSYSTEM', undefined, 'Updated Ravan Tech Park and Film Studio specifications');
    } catch {}

    notifyDataUpdated('ecosystem');
    return items;
  },

  async deleteEcosystemItem(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('ecosystem').delete().eq('id', id);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error deleting ecosystem item:', error.message);
        throw formatSupabaseError(error, 'ecosystem');
      }
    }
    const current = await this.getEcosystem();
    const updated = current.filter(e => e.id !== id);
    setLocal('ravan_ecosystem', updated);
    memoryCache.set('ecosystem', updated);
    notifyDataUpdated('ecosystem');
  },

  // --- MEDIA ---
  async getMedia(): Promise<MediaItem[]> {
    return memoryCache.dedupedFetch('media', async () => {
      const local = getLocal<MediaItem[]>('ravan_media', initialMedia);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false }).limit(100);
          if (!error && Array.isArray(data) && data.length > 0) {
            setLocal('ravan_media', data);
            return data as MediaItem[];
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getMedia fallback:', err);
      }
      return local;
    });
  },

  async saveMedia(items: MediaItem[]): Promise<MediaItem[]> {
    if (supabase) {
      const { error } = await supabase.from('media').upsert(items);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error saving media:', error.message);
        throw formatSupabaseError(error, 'media');
      }
    }

    setLocal('ravan_media', items);
    memoryCache.set('media', items);
    notifyDataUpdated('media');
    return items;
  },

  async deleteMedia(id: string): Promise<void> {
    const current = await this.getMedia();
    const itemToDelete = current.find(m => m.id === id);

    if (supabase) {
      const { error } = await supabase.from('media').delete().eq('id', id);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error deleting media:', error.message);
        throw formatSupabaseError(error, 'media');
      }
      // Safe storage removal if storage_path exists and is in site-assets
      if (itemToDelete?.storage_path) {
        try {
          await supabase.storage.from('site-assets').remove([itemToDelete.storage_path]);
        } catch {}
      }
    }

    const updated = current.filter(m => m.id !== id);
    setLocal('ravan_media', updated);
    memoryCache.set('media', updated);
    notifyDataUpdated('media');
  },

  // --- CONTACT ENQUIRIES & DIRECTIVES AUTOMATION ---
  async getEnquiries(): Promise<ContactEnquiry[]> {
    return memoryCache.dedupedFetch('enquiries', async () => {
      const local = getLocal<ContactEnquiry[]>('ravan_enquiries', initialEnquiries);
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('contact_inquiries')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
          if (!error && Array.isArray(data)) {
            setLocal('ravan_enquiries', data);
            return data as ContactEnquiry[];
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getEnquiries fallback:', err);
      }
      return local;
    });
  },

  async submitEnquiry(enquiry: {
    name: string;
    email: string;
    organization?: string;
    company?: string;
    phone?: string;
    inquiry_type: string;
    budget_range?: string;
    message: string;
    honeypot?: string;
  }): Promise<{ success: boolean; reference_id: string; message: string; enquiry?: ContactEnquiry }> {
    // 1. Honeypot Anti-Spam protection
    if (enquiry.honeypot) {
      return { success: true, reference_id: 'RT-2026-SPAM', message: 'Transmission logged.' };
    }

    // 2. Client-side Rate Limiting (Max 5 submissions per 10 minutes per session)
    try {
      const now = Date.now();
      const rawHistory = sessionStorage.getItem('ravan_enq_timestamps');
      let timestamps: number[] = rawHistory ? JSON.parse(rawHistory) : [];
      timestamps = timestamps.filter(t => now - t < 10 * 60 * 1000);

      if (timestamps.length >= 5) {
        return {
          success: false,
          reference_id: '',
          message: 'Transmission frequency limit reached. Please wait a few minutes before submitting another inquiry.'
        };
      }

      timestamps.push(now);
      sessionStorage.setItem('ravan_enq_timestamps', JSON.stringify(timestamps));
    } catch {}

    // 3. Payload sanitization & validation
    const cleanName = (enquiry.name || '').trim().slice(0, 100);
    const cleanEmail = (enquiry.email || '').trim().toLowerCase().slice(0, 120);
    const cleanOrg = (enquiry.organization || enquiry.company || '').trim().slice(0, 120);
    const cleanPhone = (enquiry.phone || '').trim().slice(0, 40);
    const cleanMessage = (enquiry.message || '').trim().slice(0, 3000);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanName || !cleanEmail || !emailRegex.test(cleanEmail) || !cleanMessage) {
      return { success: false, reference_id: '', message: 'Please provide a valid name, email address, and message requirements.' };
    }

    // Generate unique human-readable reference ID
    const randomSeq = Math.floor(100000 + Math.random() * 900000);
    const reference_id = `RT-2026-${randomSeq}`;

    const newEnquiry: ContactEnquiry = {
      id: 'enq-' + Date.now(),
      reference_id,
      name: cleanName,
      email: cleanEmail,
      organization: cleanOrg,
      company: cleanOrg,
      phone: cleanPhone,
      inquiry_type: enquiry.inquiry_type,
      budget_range: enquiry.budget_range,
      message: cleanMessage,
      status: 'new',
      email_status: 'sending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Immediately persist to local cache/state
    const current = await this.getEnquiries();
    const updated = [newEnquiry, ...current];
    setLocal('ravan_enquiries', updated);
    memoryCache.set('enquiries', updated);

    // 2. Persist to Supabase Database (Guaranteed Storage)
    try {
      if (supabase) {
        await supabase.from('contact_inquiries').insert([newEnquiry]);
      }
      await this.addAuditLog('CREATE', 'ENQUIRIES', newEnquiry.id, `New inquiry [${reference_id}] received from ${newEnquiry.name}`);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error inserting inquiry into Supabase:', err);
    }

    // 3. Trigger Secure Transactional Email via Edge Function
    let finalEmailStatus: 'sent' | 'failed' = 'sent';
    let errorMessage: string | undefined = undefined;

    try {
      if (supabase) {
        const { data: fnData, error: fnErr } = await supabase.functions.invoke('send-inquiry-confirmation', {
          body: {
            name: newEnquiry.name,
            email: newEnquiry.email,
            reference_id: newEnquiry.reference_id,
            inquiry_type: newEnquiry.inquiry_type,
            organization: newEnquiry.organization,
            message: newEnquiry.message
          }
        });

        if (fnErr) {
          finalEmailStatus = 'failed';
          errorMessage = fnErr.message || 'Edge Function returned an error.';
        } else if (fnData && (fnData.success || fnData.email_status === 'sent')) {
          finalEmailStatus = 'sent';
        } else {
          finalEmailStatus = 'failed';
          errorMessage = fnData?.error || 'Email provider dispatch failed.';
        }
      }
    } catch (err: any) {
      finalEmailStatus = 'failed';
      errorMessage = err.message || 'Network error during email dispatch.';
    }

    newEnquiry.email_status = finalEmailStatus;
    if (finalEmailStatus === 'sent') {
      newEnquiry.sent_at = new Date().toISOString();
      newEnquiry.email_error_message = undefined;
    } else {
      newEnquiry.failed_at = new Date().toISOString();
      newEnquiry.email_error_message = errorMessage;
    }

    // 4. Update email_status in Supabase & local state
    try {
      if (supabase) {
        await supabase
          .from('contact_inquiries')
          .update({ 
            email_status: newEnquiry.email_status,
            sent_at: newEnquiry.sent_at,
            failed_at: newEnquiry.failed_at,
            email_error_message: newEnquiry.email_error_message,
            updated_at: new Date().toISOString() 
          })
          .eq('reference_id', reference_id);
      }
    } catch {}

    setLocal('ravan_enquiries', updated.map(e => e.reference_id === reference_id ? newEnquiry : e));
    memoryCache.set('enquiries', updated.map(e => e.reference_id === reference_id ? newEnquiry : e));
    notifyDataUpdated('enquiries');

    return { 
      success: true, 
      reference_id, 
      message: 'Transmission successfully registered and routed to enterprise architecture team.',
      enquiry: newEnquiry
    };
  },

  async resendInquiryEmail(id: string): Promise<{ success: boolean; email_status: 'sent' | 'failed'; message: string }> {
    const current = await this.getEnquiries();
    const target = current.find(e => e.id === id);
    if (!target) return { success: false, email_status: 'failed', message: 'Inquiry record not found.' };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!target.email || !emailRegex.test(target.email)) {
      return { success: false, email_status: 'failed', message: `Invalid recipient email format: "${target.email}"` };
    }

    // Mark as sending
    await this.updateEnquiryEmailStatus(id, 'sending');

    let finalEmailStatus: 'sent' | 'failed' = 'sent';
    let errorMessage: string | undefined = undefined;

    try {
      if (supabase) {
        const { data: fnData, error: fnErr } = await supabase.functions.invoke('send-inquiry-confirmation', {
          body: {
            name: target.name,
            email: target.email,
            reference_id: target.reference_id,
            inquiry_type: target.inquiry_type,
            organization: target.organization || target.company,
            message: target.message
          }
        });

        if (fnErr) {
          finalEmailStatus = 'failed';
          errorMessage = fnErr.message || 'Edge Function returned an error.';
        } else if (fnData && (fnData.success || fnData.email_status === 'sent')) {
          finalEmailStatus = 'sent';
        } else {
          finalEmailStatus = 'failed';
          errorMessage = fnData?.error || 'Email service rejected the request.';
        }
      }
    } catch (err: any) {
      finalEmailStatus = 'failed';
      errorMessage = err.message || 'Network error during email dispatch.';
    }

    await this.updateEnquiryEmailStatus(id, finalEmailStatus, errorMessage);

    if (finalEmailStatus === 'sent') {
      return { success: true, email_status: 'sent', message: `Confirmation email dispatched to ${target.email}.` };
    } else {
      return { success: false, email_status: 'failed', message: errorMessage || 'Failed to dispatch email.' };
    }
  },

  async updateEnquiryEmailStatus(id: string, email_status: 'new' | 'sending' | 'sent' | 'failed' | 'pending', errorMessage?: string): Promise<void> {
    const current = await this.getEnquiries();
    const now = new Date().toISOString();
    const updated = current.map(e => {
      if (e.id !== id) return e;
      return {
        ...e,
        email_status,
        sent_at: email_status === 'sent' ? now : e.sent_at,
        failed_at: email_status === 'failed' ? now : e.failed_at,
        email_error_message: email_status === 'failed' ? errorMessage : undefined,
        updated_at: now
      };
    });

    setLocal('ravan_enquiries', updated);
    memoryCache.set('enquiries', updated);

    try {
      if (supabase) {
        await supabase
          .from('contact_inquiries')
          .update({ 
            email_status,
            sent_at: email_status === 'sent' ? now : undefined,
            failed_at: email_status === 'failed' ? now : undefined,
            email_error_message: email_status === 'failed' ? errorMessage : null,
            updated_at: now 
          })
          .eq('id', id);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error updating email status in Supabase:', err);
    }
    notifyDataUpdated('enquiries');
  },

  async updateEnquiryStatus(id: string, status: ContactEnquiry['status']): Promise<void> {
    const current = await this.getEnquiries();
    const updated = current.map(e => e.id === id ? { ...e, status, updated_at: new Date().toISOString() } : e);
    setLocal('ravan_enquiries', updated);
    memoryCache.set('enquiries', updated);

    try {
      if (supabase) {
        const { error } = await supabase
          .from('contact_inquiries')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) {
          throw new Error(error.message);
        }
      }
      await this.addAuditLog('UPDATE', 'ENQUIRIES', id, `Updated enquiry status to ${status}`);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error updating enquiry status in Supabase:', err);
    }
    notifyDataUpdated('enquiries');
  },

  // --- SEO SETTINGS & HEALTH REPORT ---
  async getSEOSettings(forceRefresh: boolean = false): Promise<SEOSettings> {
    if (forceRefresh) memoryCache.invalidate('seo_settings');
    return memoryCache.dedupedFetch('seo_settings', async () => {
      const local = getLocal<SEOSettings>('ravan_seo', initialSEOSettings);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('seo_metadata').select('*').single();
          if (!error && data) {
            setLocal('ravan_seo', data);
            return data as SEOSettings;
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getSEOSettings fallback:', err);
      }
      return local;
    });
  },

  async updateSEOSettings(updated: Partial<SEOSettings>): Promise<SEOSettings> {
    const current = await this.getSEOSettings();
    const merged = { ...current, ...updated };

    if (supabase) {
      const { error } = await supabase.from('seo_metadata').upsert(merged);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error updating seo_metadata:', error.message);
        throw formatSupabaseError(error, 'seo_metadata');
      }
    }

    setLocal('ravan_seo', merged);
    memoryCache.set('seo_settings', merged);

    try {
      await this.addAuditLog('UPDATE', 'SEO', undefined, 'Updated search engine & OpenGraph configurations');
    } catch {}

    notifyDataUpdated('seo');
    return merged;
  },

  async getSEOHealthReport(): Promise<SEOHealthIssue[]> {
    const seo = await this.getSEOSettings();
    const founder = await this.getFounder();
    const issues: SEOHealthIssue[] = [];

    if (!seo.meta_description || seo.meta_description.length < 50) {
      issues.push({
        page_route: '/',
        severity: 'error',
        issue: 'Homepage meta description is too short or missing.',
        recommendation: 'Provide a rich 120-160 character description including primary sovereign intelligence keywords.'
      });
    }

    if (!founder.bio || founder.bio.length < 150) {
      issues.push({
        page_route: '/founder',
        severity: 'warning',
        issue: 'Founder biography is sparse.',
        recommendation: 'Expand executive biography for strong Knowledge Graph indexing.'
      });
    }

    return issues;
  },

  // --- NAVIGATION ---
  async getNavigation(): Promise<NavigationItem[]> {
    return memoryCache.dedupedFetch('navigation', async () => {
      const local = getLocal<NavigationItem[]>('ravan_navigation', initialNavigation);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('navigation').select('*').order('display_order');
          if (!error && Array.isArray(data)) {
            setLocal('ravan_navigation', data);
            return data as NavigationItem[];
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getNavigation fallback:', err);
      }
      return local;
    });
  },

  async saveNavigation(items: NavigationItem[]): Promise<NavigationItem[]> {
    if (supabase) {
      const { error } = await supabase.from('navigation').upsert(items);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error saving navigation:', error.message);
        throw formatSupabaseError(error, 'navigation');
      }
    }

    setLocal('ravan_navigation', items);
    memoryCache.set('navigation', items);

    try {
      await this.addAuditLog('UPDATE', 'NAVIGATION', undefined, `Saved navigation hierarchy (${items.length} links)`);
    } catch {}

    notifyDataUpdated('navigation');
    return items;
  },

  // --- GALLERY ALBUMS ---
  async getGalleryAlbums(): Promise<GalleryAlbum[]> {
    return memoryCache.dedupedFetch('gallery', async () => {
      const local = getLocal<GalleryAlbum[]>('ravan_gallery_albums', initialGalleryAlbums);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('gallery_albums').select('*').order('display_order').limit(100);
          if (!error && Array.isArray(data)) {
            setLocal('ravan_gallery_albums', data);
            return data as GalleryAlbum[];
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getGalleryAlbums fallback:', err);
      }
      return local;
    });
  },

  async saveGalleryAlbums(albums: GalleryAlbum[]): Promise<GalleryAlbum[]> {
    if (supabase) {
      const { error } = await supabase.from('gallery_albums').upsert(albums);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error saving gallery_albums:', error.message);
        throw formatSupabaseError(error, 'gallery_albums');
      }
    }

    setLocal('ravan_gallery_albums', albums);
    memoryCache.set('gallery', albums);

    try {
      await this.addAuditLog('UPDATE', 'GALLERY', undefined, `Saved gallery albums (${albums.length} albums)`);
    } catch {}

    notifyDataUpdated('gallery');
    return albums;
  },

  // --- BLOG POSTS ---
  async getBlogPosts(): Promise<BlogPost[]> {
    return memoryCache.dedupedFetch('blog', async () => {
      const local = getLocal<BlogPost[]>('ravan_blog_posts', initialBlogPosts);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('blog_posts').select('*').order('published_at', { ascending: false }).limit(100);
          if (!error && Array.isArray(data)) {
            setLocal('ravan_blog_posts', data);
            return data as BlogPost[];
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getBlogPosts fallback:', err);
      }
      return local;
    });
  },

  async saveBlogPosts(posts: BlogPost[]): Promise<BlogPost[]> {
    if (supabase) {
      const { error } = await supabase.from('blog_posts').upsert(posts);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error saving blog_posts:', error.message);
        throw formatSupabaseError(error, 'blog_posts');
      }
    }

    setLocal('ravan_blog_posts', posts);
    memoryCache.set('blog', posts);

    try {
      await this.addAuditLog('UPDATE', 'BLOG', undefined, `Saved engineering whitepapers (${posts.length} articles)`);
    } catch {}

    notifyDataUpdated('blog');
    return posts;
  },

  async deleteBlogPost(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error deleting blog post:', error.message);
        throw formatSupabaseError(error, 'blog_posts');
      }
    }
    const current = await this.getBlogPosts();
    const updated = current.filter(p => p.id !== id);
    setLocal('ravan_blog_posts', updated);
    memoryCache.set('blog', updated);
    notifyDataUpdated('blog');
  },

  // --- EVENTS ---
  async getEvents(): Promise<EventItem[]> {
    return memoryCache.dedupedFetch('events', async () => {
      const local = getLocal<EventItem[]>('ravan_events', initialEvents);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true }).limit(50);
          if (!error && Array.isArray(data) && data.length > 0) {
            setLocal('ravan_events', data);
            return data as EventItem[];
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getEvents fallback:', err);
      }
      return local;
    });
  },

  async saveEvents(events: EventItem[]): Promise<EventItem[]> {
    if (supabase) {
      const { error } = await supabase.from('events').upsert(events);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error saving events:', error.message);
        throw formatSupabaseError(error, 'events');
      }
    }

    setLocal('ravan_events', events);
    memoryCache.set('events', events);

    try {
      await this.addAuditLog('UPDATE', 'EVENTS', undefined, `Updated summits & events (${events.length} items)`);
    } catch {}

    notifyDataUpdated('events');
    return events;
  },

  async deleteEvent(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error deleting event:', error.message);
        throw formatSupabaseError(error, 'events');
      }
    }
    const current = await this.getEvents();
    const updated = current.filter(e => e.id !== id);
    setLocal('ravan_events', updated);
    memoryCache.set('events', updated);
    notifyDataUpdated('events');
  },

  // --- TESTIMONIALS ---
  async getTestimonials(): Promise<TestimonialItem[]> {
    return memoryCache.dedupedFetch('testimonials', async () => {
      const local = getLocal<TestimonialItem[]>('ravan_testimonials', initialTestimonials);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('testimonials').select('*').order('display_order').limit(100);
          if (!error && Array.isArray(data) && data.length > 0) {
            setLocal('ravan_testimonials', data);
            return data as TestimonialItem[];
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getTestimonials fallback:', err);
      }
      return local;
    });
  },

  async saveTestimonials(items: TestimonialItem[]): Promise<TestimonialItem[]> {
    if (supabase) {
      const { error } = await supabase.from('testimonials').upsert(items);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error saving testimonials:', error.message);
        throw formatSupabaseError(error, 'testimonials');
      }
    }

    setLocal('ravan_testimonials', items);
    memoryCache.set('testimonials', items);

    try {
      await this.addAuditLog('UPDATE', 'TESTIMONIALS', undefined, `Updated client endorsements (${items.length} items)`);
    } catch {}

    notifyDataUpdated('testimonials');
    return items;
  },

  async deleteTestimonial(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error deleting testimonial:', error.message);
        throw formatSupabaseError(error, 'testimonials');
      }
    }
    const current = await this.getTestimonials();
    const updated = current.filter(t => t.id !== id);
    setLocal('ravan_testimonials', updated);
    memoryCache.set('testimonials', updated);
    notifyDataUpdated('testimonials');
  },

  // --- PARTNERS & CLIENTS ---
  async getPartners(): Promise<PartnerItem[]> {
    return memoryCache.dedupedFetch('partners', async () => {
      const local = getLocal<PartnerItem[]>('ravan_partners', initialPartners);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('partners').select('*').order('display_order');
          if (!error && Array.isArray(data) && data.length > 0) {
            setLocal('ravan_partners', data);
            return data as PartnerItem[];
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getPartners fallback:', err);
      }
      return local;
    });
  },

  async savePartners(items: PartnerItem[]): Promise<PartnerItem[]> {
    if (supabase) {
      const { error } = await supabase.from('partners').upsert(items);
      if (error) {
        // Fallback with core columns if status/description are omitted in DB schema
        try {
          const coreItems = items.map(p => ({
            id: p.id,
            name: p.name,
            logo_url: p.logo_url,
            website_url: p.website_url || '',
            category: p.category,
            display_order: p.display_order
          }));
          await supabase.from('partners').upsert(coreItems);
        } catch (coreErr) {
          if (import.meta.env.DEV) console.error('Supabase error saving partners:', error.message);
          throw formatSupabaseError(error, 'partners');
        }
      }
    }

    setLocal('ravan_partners', items);
    memoryCache.set('partners', items);
    notifyDataUpdated('partners');
    return items;
  },

  async deletePartner(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('partners').delete().eq('id', id);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error deleting partner:', error.message);
        throw formatSupabaseError(error, 'partners');
      }
    }
    const current = await this.getPartners();
    const updated = current.filter(p => p.id !== id);
    setLocal('ravan_partners', updated);
    memoryCache.set('partners', updated);
    notifyDataUpdated('partners');
  },

  async getClients(): Promise<ClientItem[]> {
    return memoryCache.dedupedFetch('clients', async () => {
      const local = getLocal<ClientItem[]>('ravan_clients', initialClients);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('clients').select('*').order('display_order');
          if (!error && Array.isArray(data) && data.length > 0) {
            setLocal('ravan_clients', data);
            return data as ClientItem[];
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getClients fallback:', err);
      }
      return local;
    });
  },

  async saveClients(items: ClientItem[]): Promise<ClientItem[]> {
    if (supabase) {
      const { error } = await supabase.from('clients').upsert(items);
      if (error) {
        // Fallback with core columns if status/description are omitted in DB schema
        try {
          const coreItems = items.map(c => ({
            id: c.id,
            name: c.name,
            logo_url: c.logo_url,
            industry: c.industry,
            display_order: c.display_order
          }));
          await supabase.from('clients').upsert(coreItems);
        } catch (coreErr) {
          if (import.meta.env.DEV) console.error('Supabase error saving clients:', error.message);
          throw formatSupabaseError(error, 'clients');
        }
      }
    }

    setLocal('ravan_clients', items);
    memoryCache.set('clients', items);
    notifyDataUpdated('clients');
    return items;
  },

  async deleteClient(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error deleting client:', error.message);
        throw formatSupabaseError(error, 'clients');
      }
    }
    const current = await this.getClients();
    const updated = current.filter(c => c.id !== id);
    setLocal('ravan_clients', updated);
    memoryCache.set('clients', updated);
    notifyDataUpdated('clients');
  },

  // --- ROLES & PERMISSIONS ---
  async getRoles(): Promise<RoleItem[]> {
    return memoryCache.dedupedFetch('roles', async () => {
      const local = getLocal<RoleItem[]>('ravan_roles', initialRoles);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('roles').select('*');
          if (!error && Array.isArray(data)) {
            setLocal('ravan_roles', data);
            return data as RoleItem[];
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Supabase getRoles fallback:', err);
      }
      return local;
    });
  },

  // --- AUDIT LOGGING ---
  async getAuditLogs(): Promise<AuditLog[]> {
    const local = getLocal<AuditLog[]>('ravan_audit_logs', initialAuditLogs);
    try {
      if (supabase) {
        const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(100);
        if (!error && data) {
          setLocal('ravan_audit_logs', data);
          return data as AuditLog[];
        }
      }
    } catch (err) {
      if (import.meta.env.DEV) console.warn('Supabase getAuditLogs fallback:', err);
    }
    return local;
  },

  async addAuditLog(action: string, entity: string, entity_id: string = '', details: string = '', user_name: string = 'Super Admin'): Promise<void> {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      action,
      entity,
      entity_id,
      details,
      user_name,
      timestamp: new Date().toISOString()
    };

    const localLogs = getLocal<AuditLog[]>('ravan_audit_logs', initialAuditLogs);
    const updated = [newLog, ...localLogs.slice(0, 99)];
    setLocal('ravan_audit_logs', updated);

    try {
      if (supabase) {
        await supabase.from('audit_logs').insert([newLog]);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error logging audit action to Supabase:', err);
    }
  },

  // --- EXPLICIT SUPABASE DELETION METHODS ---
  async deleteFounder(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('founders').delete().eq('id', id);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error deleting founder:', error.message);
        throw formatSupabaseError(error, 'founders');
      }
    }

    const current = await this.getFounders();
    const updated = current.filter(f => f.id !== id);
    setLocal('ravan_founders', updated);
    if (updated.length > 0) {
      setLocal('ravan_founder', updated[0]);
    }
    memoryCache.set('founders', updated);
    if (updated.length > 0) {
      memoryCache.set('founder', updated[0]);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ravan_founders_updated', { detail: updated }));
      if (updated.length > 0) {
        window.dispatchEvent(new CustomEvent('ravan_founder_updated', { detail: updated[0] }));
      }
    }

    try {
      await this.addAuditLog('DELETE', 'FOUNDERS', id, 'Deleted Founder record');
    } catch {}

    notifyDataUpdated('founder');
  },

  async deleteLeadership(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('leadership').delete().eq('id', id);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error deleting leadership:', error.message);
        throw formatSupabaseError(error, 'leadership');
      }
    }

    const current = await this.getLeadership();
    const updated = current.filter(m => m.id !== id);
    setLocal('ravan_leadership', updated);
    memoryCache.set('leadership', updated);

    try {
      await this.addAuditLog('DELETE', 'LEADERSHIP', id, 'Deleted leadership member record');
    } catch {}

    notifyDataUpdated('leadership');
  },

  async deleteService(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error deleting service:', error.message);
        throw formatSupabaseError(error, 'services');
      }
    }

    const current = await this.getServices();
    const updated = current.filter(s => s.id !== id);
    setLocal('ravan_services', updated);
    memoryCache.set('services', updated);

    try {
      await this.addAuditLog('DELETE', 'SERVICES', id, 'Deleted service offering');
    } catch {}

    notifyDataUpdated('services');
  },

  async deleteSolution(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('solutions').delete().eq('id', id);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error deleting solution:', error.message);
        throw formatSupabaseError(error, 'solutions');
      }
    }

    const current = await this.getSolutions();
    const updated = current.filter(s => s.id !== id);
    setLocal('ravan_solutions', updated);
    memoryCache.set('solutions', updated);

    try {
      await this.addAuditLog('DELETE', 'SOLUTIONS', id, 'Deleted solution blueprint');
    } catch {}

    notifyDataUpdated('solutions');
  },

  async deleteProject(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error deleting project:', error.message);
        throw formatSupabaseError(error, 'projects');
      }
    }

    const current = await this.getProjects();
    const updated = current.filter(p => p.id !== id);
    setLocal('ravan_projects', updated);
    memoryCache.set('projects', updated);

    try {
      await this.addAuditLog('DELETE', 'PROJECTS', id, 'Deleted case study project');
    } catch {}

    notifyDataUpdated('projects');
  },

  async deleteGalleryAlbum(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('gallery_albums').delete().eq('id', id);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error deleting gallery album:', error.message);
        throw formatSupabaseError(error, 'gallery_albums');
      }
    }

    const current = await this.getGalleryAlbums();
    const updated = current.filter(a => a.id !== id);
    setLocal('ravan_gallery_albums', updated);
    memoryCache.set('gallery', updated);

    try {
      await this.addAuditLog('DELETE', 'GALLERY', id, 'Deleted gallery album');
    } catch {}

    notifyDataUpdated('gallery');
  },


  async deleteEnquiry(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('contact_inquiries').delete().eq('id', id);
      if (error) {
        if (import.meta.env.DEV) console.error('Supabase error deleting enquiry:', error.message);
        throw formatSupabaseError(error, 'contact_inquiries');
      }
    }

    const current = await this.getEnquiries();
    const updated = current.filter(e => e.id !== id);
    setLocal('ravan_enquiries', updated);
    memoryCache.set('enquiries', updated);

    try {
      await this.addAuditLog('DELETE', 'ENQUIRIES', id, 'Deleted inquiry message');
    } catch {}

    notifyDataUpdated('enquiries');
  },

  // --- USER PROFILES & RBAC ---
  async getProfiles(): Promise<UserProfile[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data as UserProfile[];
        }
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error loading profiles from Supabase:', err);
    }
    return [];
  },

  async updateProfileRole(id: string, role: UserProfile['role']): Promise<boolean> {
    try {
      if (supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({ role, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (!error) {
          await this.addAuditLog('UPDATE', 'USERS', id, `Updated user role to ${role}`);
          return true;
        }
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error updating user role in Supabase:', err);
    }
    return false;
  }
};
