import { 
  Founder, 
  LeadershipMember, 
  ServiceItem, 
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
  AIMLModel
} from '../types';

export const initialFounder: Founder = {
  id: 'founder-001',
  name: 'V ABISHEK',
  designation: 'Founder of RAVAN TECHNOLOGIES',
  company_branch: 'Ravan Technologies',
  bio: 'Architecting sovereign digital infrastructure and enterprise software platforms.',
  vision: 'To engineer self-reliant technology ecosystems that empower institutional autonomy.',
  quote: 'We are not merely building software; we are constructing the digital infrastructure that will dictate the next century of enterprise efficiency. Sovereign Intelligence is the mandate.',
  quote_author_tag: 'Executive Address',
  image_url: 'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/avatars/founder/1788068046599_4p0eqd.jpg',
  display_order: 1,
  status: 'published',
  slug: 'v-abishek',
  short_intro: 'Architecting sovereign digital infrastructure and enterprise software platforms.',
  focus_areas: [
    'Enterprise Architecture',
    'Sovereign AI Models',
    'Global Tech Strategy',
    'Decentralized Infrastructure'
  ],
  tenure_years: '2 Years',
  achievements: [
    'Pioneered Sovereign Intelligence framework for enterprise AI model governance.',
    'Established Ravan Tech Park spanning dedicated R&D infrastructure.',
    'Founded Ravan Hackathon series engaging engineering builders globally.'
  ],
  custom_sections: [
    {
      id: 'custom-1788551949892',
      title: 'SKILLS',
      content: '• Programming Languages – Python, JavaScript, C, C++\n• Web Development – HTML, CSS, JavaScript\n• Machine Learning – ML Models, Data Processing\n• Artificial Intelligence – AI Applications, LLM Integration\n• Full-Stack Development – Frontend & Backend\n• Database – MySQL, Firebase, Supabase\n• API Development – REST APIs, API Integration\n• Project Development – Real-World Projects & Applications\n• Git & GitHub – Version Control & Collaboration\n• Deployment – Vercel, Hosting & Deployment\n• UI/UX – Web Interface Design\n• Problem Solving – Debugging & Optimization'
    }
  ],
  education: [],
  projects: [],
  experience_records: [],
  structured_skills: [],
  public_email: 'ravantechnologies11@gmail.com',
  social_links: {
    linkedin: 'https://www.linkedin.com/in/abishek-v-a984a6382?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    instagram: 'https://www.instagram.com/abishek_creator_/?hl=en',
    email: 'ravantechnologies11@gmail.com'
  },
  seo_title: 'V ABISHEK — Founder & Architect | Ravan Technologies',
  seo_description: 'Discover the visionary leadership and engineering philosophy behind Ravan Technologies.',
  canonical_url: '/team/v-abishek',
  og_image: 'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/avatars/founder/1788068046599_4p0eqd.jpg',
  updated_at: new Date().toISOString()
};

export const initialFounders: Founder[] = [initialFounder];

export const initialLeadership: LeadershipMember[] = [
  {
    id: 'lead-001',
    name: 'A. BERRY SUGANDH SURYA',
    designation: 'Co-Founder & Chief Operating Officer',
    company_branch: 'Ravan Technologies',
    bio: 'Oversees engineering execution, edge computing, distributed software architectures, and institutional partnerships.',
    image_url: 'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/avatars/leadership/1788499006162_o6z64q.jpg',
    display_order: 1,
    status: 'published',
    slug: 'berry-sugandh-surya',
    social_links: {
      linkedin: 'https://linkedin.com/in/berrysugandh-surya-a-68650b396',
      github: 'https://github.com/Berry1924',
      twitter: 'https://x.com/BerrySugandh19',
      whatsapp: 'https://wa.me/916380698291'
    }
  },
  {
    id: 'lead-002',
    name: 'SIBI RAJ U',
    designation: 'CEO — Ravan Technologies',
    company_branch: 'Ravan Tech Park',
    bio: 'Drives enterprise software strategy, core platform delivery, and high-concurrency client architectures.',
    image_url: 'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/avatars/leadership/1788253631161_ho62j1.jpg',
    display_order: 2,
    status: 'published',
    slug: 'sibi-raj-u',
    social_links: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com'
    }
  },
  {
    id: 'lead-003',
    name: 'V.VINOTHKUMAR',
    designation: 'MANAGER',
    company_branch: 'Ravan Technologies',
    bio: 'Leads physical campus innovation, advanced supercomputing clusters, hardware testbeds, and university R&D partnerships.',
    image_url: 'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/avatars/leadership/1788492358087_n1lya4.jpg',
    display_order: 3,
    status: 'published',
    slug: 'vinothkumar',
    social_links: {
      linkedin: 'https://www.linkedin.com/in/vinoth-kumar-396180382'
    }
  },
  {
    id: 'lead-004',
    name: 'MITHRA.S',
    designation: 'MANAGER',
    company_branch: 'Ravan Technologies',
    bio: 'Pioneering real-time virtual production pipelines, generative media workflows, and cinematic storytelling.',
    image_url: 'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/avatars/leadership/1788515381289_jbldgw.jpg',
    display_order: 4,
    status: 'published',
    slug: 'mithra-s',
    social_links: {
      linkedin: 'https://www.linkedin.com/in/mithra-s-engg-592708382'
    }
  }
];

export const initialServices: ServiceItem[] = [];

export const initialSolutions: SolutionItem[] = [];

export const initialProjects: ProjectItem[] = [];

export const initialHackathon: HackathonItem = {
  id: 'hack-001',
  title: 'Ravan Hackathon Vol. IV',
  edition: 'Vol. IV',
  event_date: 'OCTOBER 24, 2026',
  status: 'upcoming',
  focus_statement: 'Focus: Decentralized Logistics Optimization & Sovereign Compute',
  description: 'Theory is insufficient. Our hackathon ecosystem is the crucible where theoretical engineering meets the uncompromising demands of actual enterprise bottlenecks. We convene top-tier talent to forge robust solutions under pressure.',
  image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  solutions_deployed_count: '0',
  tracks: [],
  problem_statements: [],
  rules: [],
  prizes: [],
  winning_solutions: []
};

export const initialLearningPrograms: LearningProgram[] = [];

export const initialEcosystem: EcosystemItem[] = [];

export const initialMedia: MediaItem[] = [];

export const initialEnquiries: ContactEnquiry[] = [];

export const initialSiteSettings: SiteSettings = {
  site_name: 'Ravan Technologies',
  tagline: 'Building Technology. Solving Real Problems.',
  description: 'Architecting sovereign software systems, enterprise intelligence, and physical computing infrastructure for institutional scale.',
  logo_url: 'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/site-assets/branding/ravan-logo.png?v=1788066287989',
  contact_email: 'ravantechnologies11@gmail.com',
  contact_phone: '',
  office_address: 'Ravan Technologies Headquarters, Thiruvannamalai, Tamil Nadu, India',
  hq_location: 'Thiruvannamalai, Tamil Nadu, India',
  hq_label: 'Global Headquarters',
  hq_city: 'Thiruvannamalai',
  hq_state: 'Tamil Nadu',
  hq_country: 'India',
  social_links: {
    instagram: 'https://www.instagram.com/ravan__tech?igsi=ZGEyYWU1ODljd3p0'
  },
  maintenance_mode: false,
  hero_image_url: '',
  hero_image_alt: 'Ravan Technologies Sovereign Intelligence Infrastructure',
  hero_image_focal_x: 50,
  hero_image_focal_y: 50,
  hero_image_zoom: 1,
  hero_badge_text: 'SOVEREIGN INTELLIGENCE IN ENTERPRISE ENGINEERING',
  hero_title: 'Building Technology. Solving Real Problems.',
  hero_subtitle: 'Ravan Technologies builds software, AI/ML solutions, learning platforms and innovation programs designed to solve meaningful real-world challenges.'
};

export const initialSEOSettings: SEOSettings = {
  meta_title: 'Ravan Technologies — Sovereign Intelligence in Enterprise Engineering',
  meta_description: 'Ravan Technologies engineers resilient, scalable software, applied AI/ML platforms, hackathon ecosystems, and advanced R&D campuses.',
  focus_keyword: 'Sovereign Intelligence, Enterprise Engineering',
  secondary_keywords: ['Enterprise Software', 'Applied Machine Learning', 'Ravan Tech Park'],
  og_title: 'Ravan Technologies — Building Technology. Solving Real Problems.',
  og_description: 'Sovereign Intelligence in Enterprise Engineering. Software, AI/ML, Hackathons, Tech Park & Film Studio.',
  og_image: '/images/ravan-logo.png',
  canonical_url: 'https://ravantechnologies.in',
  robots_index: true,
  robots_follow: true,
  schema_type: 'Organization'
};

export const initialAuditLogs: AuditLog[] = [];

export const initialNavigation: NavigationItem[] = [
  { id: 'nav-1', title: 'Home', path: '/', position: 'header', display_order: 1, is_active: true },
  { id: 'nav-2', title: 'About', path: '/about', position: 'header', display_order: 2, is_active: true },
  { id: 'nav-3', title: 'Services', path: '/services', position: 'header', display_order: 3, is_active: true },
  { id: 'nav-4', title: 'Solutions', path: '/solutions', position: 'header', display_order: 4, is_active: true },
  { id: 'nav-5', title: 'Hackathons', path: '/hackathons', position: 'header', display_order: 5, is_active: true, badge: 'VOL IV' },
  { id: 'nav-6', title: 'Learning', path: '/learning', position: 'header', display_order: 6, is_active: true },
  { id: 'nav-7', title: 'Projects', path: '/projects', position: 'header', display_order: 7, is_active: true },
  { id: 'nav-8', title: 'Ecosystem', path: '/ecosystem', position: 'header', display_order: 8, is_active: true },
  { id: 'nav-9', title: 'Team', path: '/team', position: 'header', display_order: 9, is_active: true },
  { id: 'nav-10', title: 'Contact', path: '/contact', position: 'header', display_order: 10, is_active: true }
];

export const initialGalleryAlbums: GalleryAlbum[] = [];

export const initialBlogPosts: BlogPost[] = [];

export const initialEvents: EventItem[] = [];

export const initialTestimonials: TestimonialItem[] = [];

export const initialPartners: PartnerItem[] = [];

export const initialClients: ClientItem[] = [];

export const initialRoles: RoleItem[] = [
  { id: 'role-1', name: 'Super Admin', description: 'Unrestricted control across database, settings, users, and audit logs.', permissions: ['*'] },
  { id: 'role-2', name: 'Admin', description: 'Manage content, media, enquiries, and SEO.', permissions: ['content.*', 'media.*', 'enquiries.*', 'seo.*'] },
  { id: 'role-3', name: 'Editor', description: 'Draft and update articles, case studies, and services.', permissions: ['content.edit', 'content.create'] },
  { id: 'role-4', name: 'Media Manager', description: 'Upload and organize media library assets and gallery albums.', permissions: ['media.*', 'gallery.*'] },
  { id: 'role-5', name: 'Viewer', description: 'Read-only access to analytics and audit reports.', permissions: ['read.only'] }
];

export const initialAIMLModels: AIMLModel[] = [];
