export interface SocialLinks {
  linkedin?: string;
  youtube?: string;
  instagram?: string;
  twitter?: string;
  github?: string;
  facebook?: string;
  website?: string;
  whatsapp?: string;
  email?: string;
  [key: string]: any;
}

export interface ProfileEducation {
  id: string;
  degree: string;
  institution: string;
  field?: string;
  start_year: string;
  end_year?: string;
  description?: string;
}

export interface ProfileProject {
  id: string;
  title: string;
  short_description: string;
  role?: string;
  technologies: string[];
  status: 'Completed' | 'In Progress' | 'Production' | 'Live' | 'Archived' | string;
  start_date?: string;
  end_date?: string;
  project_url?: string;
  github_url?: string;
  image_url?: string;
  featured?: boolean;
  display_order?: number;
  is_published?: boolean;
}

export interface ProfileExperience {
  id: string;
  organization: string;
  role: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  responsibilities?: string[];
  contributions?: string[];
}

export type SkillCategory = 
  | 'Programming'
  | 'AI / ML'
  | 'Web Development'
  | 'Mobile Development'
  | 'Cloud'
  | 'Database'
  | 'DevOps'
  | 'Hardware'
  | 'Embedded Systems'
  | 'Design'
  | 'Management'
  | 'Other';

export interface ProfileSkill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | string;
  display_order?: number;
}

export interface Founder {
  id: string;
  name: string;
  designation: string;
  company_branch?: 'Ravan Technologies' | 'Ravan Tech Park' | 'Ravan Film Studio';
  bio: string;
  image_url: string;
  display_order?: number;
  status?: 'draft' | 'published' | 'archived';
  slug?: string;
  short_intro?: string;
  vision?: string;
  quote?: string;
  quote_author_tag?: string;
  focus_areas?: string[];
  tenure_years?: string;
  achievements?: string[];
  custom_sections?: { id: string; title: string; content: string }[];
  
  // Structured Corporate Profile Data
  education?: ProfileEducation[];
  projects?: ProfileProject[];
  experience_records?: ProfileExperience[];
  structured_skills?: ProfileSkill[];

  // Official Contact & Social
  public_email?: string;
  public_phone?: string;
  social_links?: SocialLinks;

  // SEO Metadata
  seo_title?: string;
  seo_description?: string;
  canonical_url?: string;
  og_image?: string;

  created_at?: string;
  updated_at: string;
}

export interface LeadershipMember {
  id: string;
  name: string;
  designation: string;
  company_branch: 'Ravan Technologies' | 'Ravan Tech Park' | 'Ravan Film Studio';
  bio: string;
  image_url: string;
  display_order: number;
  status: 'draft' | 'published' | 'archived';
  slug?: string;
  short_intro?: string;
  
  // Structured Corporate Profile Data
  education?: ProfileEducation[];
  projects?: ProfileProject[];
  experience_records?: ProfileExperience[];
  structured_skills?: ProfileSkill[];

  // Legacy / Unstructured fallbacks
  responsibilities?: string[];
  contributions?: string[];
  major_projects?: string[];
  skills?: string[];
  achievements?: string[];
  experience?: string;
  importance?: string;
  
  // Official Contact & Social
  public_email?: string;
  public_phone?: string;
  social_links?: SocialLinks;

  // SEO Metadata
  seo_title?: string;
  seo_description?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;

  created_at?: string;
  updated_at?: string;
}

export interface ServiceFeature {
  title: string;
  description: string;
  icon?: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  code: string;
  short_description: string;
  full_description: string;
  icon: string;
  image_url: string;
  metric_value?: string;
  metric_label?: string;
  features: ServiceFeature[];
  technologies: string[];
  benefits?: string[];
  cta_text?: string;
  cta_url?: string;
  display_order: number;
  status: 'draft' | 'published' | 'archived';
  seo_title?: string;
  seo_description?: string;
  deliverables?: any;
}

export interface SolutionItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  architecture_details: string;
  benefits: string[];
  image_url: string;
  icon?: string;
  problem?: string;
  solution?: string;
  technologies?: string[];
  cta_text?: string;
  cta_url?: string;
  display_order: number;
  status: 'draft' | 'published' | 'archived';
  seo_title?: string;
  seo_description?: string;
  metrics?: any;
}

export interface ProjectItem {
  id: string;
  slug: string;
  project_number: string;
  title: string;
  category: string;
  problem: string;
  solution: string;
  technologies: string[];
  outcome_metric: string;
  outcome_label: string;
  image_url: string;
  gallery?: string[];
  featured: boolean;
  display_order: number;
  status: 'draft' | 'published' | 'archived';
}

export interface HackathonTrack {
  id: string;
  track_number: string;
  title: string;
  description: string;
  image_url: string;
  teams_registered: number;
  badge_color?: string;
}

export interface ProblemStatement {
  title: string;
  domain: string;
  description: string;
}

export interface WinningSolution {
  rank: string;
  project_name: string;
  team_name: string;
  description: string;
}

export interface HackathonItem {
  id: string;
  title: string;
  edition: string;
  event_date: string;
  status: 'upcoming' | 'live' | 'completed';
  focus_statement: string;
  description: string;
  image_url: string;
  solutions_deployed_count: string;
  tracks: HackathonTrack[];
  problem_statements: ProblemStatement[];
  winning_solutions: WinningSolution[];
}

export interface CurriculumModule {
  id: string;
  title: string;
  level: string;
  duration: string;
  topics: string[];
}

export interface LearningProgram {
  id: string;
  slug: string;
  title: string;
  track_name: string;
  badge: string;
  description: string;
  enrolled_count: string;
  image_url: string;
  methodology_phase: string;
  curriculum: CurriculumModule[];
  prerequisites: string[];
  display_order: number;
  status: 'draft' | 'published' | 'archived';
}

export interface EcosystemMetric {
  value: string;
  label: string;
  sublabel?: string;
}

export interface EcosystemFeature {
  title: string;
  description: string;
  icon: string;
}

export interface EcosystemItem {
  id: string;
  name: string;
  type: 'hub' | 'studio';
  tagline: string;
  description: string;
  image_url: string;
  metrics: EcosystemMetric;
  features: EcosystemFeature[];
  specifications: string[];
  status_badge: string;
}

export interface FilmProject {
  id: string;
  title: string;
  genre: string;
  format: string;
  poster_url: string;
  banner_url: string;
  synopsis: string;
  stills: string[];
  trailer_url?: string;
  awards: string[];
  credits: { role: string; name: string }[];
  status: 'published' | 'draft';
  display_order: number;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image_url: string;
  category: 'campus' | 'events' | 'production' | 'hackathon' | 'general';
  items_count?: number;
  status: 'published' | 'draft';
  display_order: number;
}

export interface GalleryItem {
  id: string;
  album_id: string;
  title: string;
  image_url: string;
  caption?: string;
  display_order: number;
}

export interface MediaItem {
  id: string;
  name: string;
  category: 'founder' | 'leadership' | 'services' | 'projects' | 'hackathons' | 'ecosystem' | 'gallery' | 'brand' | 'documents' | 'general';
  alt_text?: string;
  file_type: 'image' | 'video' | 'document';
  file_size: string;
  url: string;
  storage_path?: string;
  dimensions?: string;
  tags: string[];
  created_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  author_name: string;
  author_avatar?: string;
  tags: string[];
  read_time_minutes: number;
  status: 'published' | 'draft' | 'archived';
  published_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  event_type: 'summit' | 'keynote' | 'webinar' | 'workshop';
  event_date: string;
  location: string;
  description: string;
  image_url: string;
  registration_link?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author_name: string;
  author_designation: string;
  author_company: string;
  avatar_url?: string;
  display_order: number;
  status: 'published' | 'draft';
}

export interface PartnerItem {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  category: 'technology' | 'academic' | 'enterprise';
  display_order: number;
  status: 'published' | 'draft';
}

export interface ClientItem {
  id: string;
  name: string;
  logo_url: string;
  industry: string;
  display_order: number;
  status: 'published' | 'draft';
}

export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  position: 'header' | 'footer_company' | 'footer_core' | 'footer_innovation' | 'footer_ecosystem';
  parent_id?: string;
  display_order: number;
  is_active: boolean;
  is_external?: boolean;
  badge?: string;
  children?: NavigationItem[];
}

export interface ContactEnquiry {
  id: string;
  reference_id: string;
  name: string;
  email: string;
  organization?: string;
  company?: string;
  phone?: string;
  inquiry_type: 'Enterprise Engineering' | 'Applied AI & ML' | 'Hackathon Partnership' | 'Tech Park Lease' | 'Film Studio Production' | 'General Business' | string;
  budget_range?: string;
  message: string;
  status: 'new' | 'read' | 'in_progress' | 'responded' | 'closed' | 'in_review' | 'replied' | 'archived';
  email_status: 'new' | 'sending' | 'sent' | 'failed' | 'pending';
  sent_at?: string;
  failed_at?: string;
  email_error_message?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface SiteSettings {
  id?: string;
  site_name: string;
  company_name?: string;
  tagline: string;
  official_tagline?: string;
  description: string;
  logo_url: string;
  logo_public_url?: string;
  logo_path?: string;
  logo_dark_url?: string;
  logo_alt?: string;
  favicon_url?: string;
  contact_email: string;
  inquiry_email?: string;
  contact_phone?: string;
  whatsapp_number?: string;
  direct_whatsapp_number?: string;
  office_address?: string;
  social_links: SocialLinks;
  footer_text?: string;
  copyright_text?: string;
  maintenance_mode: boolean;
  hero_image_url?: string;
  hero_image_path?: string;
  hero_image_alt?: string;
  hero_image_focal_x?: number;
  hero_image_focal_y?: number;
  hero_image_zoom?: number;
  hero_badge_text?: string;
  hero_title?: string;
  hero_subtitle?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AboutCompanyOverview {
  heading: string;
  short_intro: string;
  detailed_description?: string;
  image_url?: string;
  display_order?: number;
  is_published: boolean;
}

export interface AboutVision {
  title: string;
  description: string;
  image_url?: string;
  display_order?: number;
  is_published: boolean;
}

export interface AboutMission {
  title: string;
  description: string;
  image_url?: string;
  display_order?: number;
  is_published: boolean;
}

export interface AboutCoreValue {
  id: string;
  title: string;
  short_description: string;
  icon?: string;
  image_url?: string;
  display_order: number;
  is_published: boolean;
}

export interface AboutTimelinePhase {
  id: string;
  phase_label: string; // e.g. "Phase I"
  title: string;
  short_description: string;
  detailed_description?: string;
  date_or_year?: string;
  image_url?: string;
  icon?: string;
  display_order: number;
  is_published: boolean;
}

export interface AboutMilestone {
  id: string;
  title: string;
  year_or_date: string;
  description?: string;
  metric_value?: string;
  metric_label?: string;
  display_order: number;
  is_published: boolean;
}

export interface AboutCapability {
  id: string;
  title: string;
  description: string;
  icon?: string;
  display_order: number;
  is_published: boolean;
}

export interface AboutSEO {
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
}

export interface AboutContent {
  // Legacy fields for 100% backward compatibility
  mandate: string;
  phase1_title: string;
  phase1_text: string;
  phase2_title: string;
  phase2_text: string;

  // Modern structured sections
  overview?: AboutCompanyOverview;
  vision?: AboutVision;
  mission?: AboutMission;
  core_values?: AboutCoreValue[];
  timeline?: AboutTimelinePhase[];
  milestones?: AboutMilestone[];
  capabilities?: AboutCapability[];
  seo?: AboutSEO;
}

export interface SEOSettings {
  meta_title: string;
  meta_description: string;
  focus_keyword?: string;
  secondary_keywords?: string[];
  canonical_url: string;
  robots_index: boolean;
  robots_follow: boolean;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  schema_type: 'Organization' | 'Person' | 'Service' | 'CreativeWork' | 'Event' | 'Article';
}

export interface RoleItem {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'editor' | 'media_manager' | 'viewer';
  avatar_url?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'super_admin' | 'admin' | 'editor' | 'media_manager' | 'viewer';
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entity_id?: string;
  details: string;
  user_name: string;
  timestamp: string;
}

export interface SEOHealthIssue {
  severity: 'error' | 'warning' | 'info';
  page_route: string;
  issue: string;
  recommendation: string;
}
