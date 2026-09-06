-- ============================================================================
-- RAVAN TECHNOLOGIES — MASTER DATABASE SCHEMA & PRODUCTION RBAC AUTHORIZATION
-- Enforces server-level authorization, public.profiles table, and Row Level Security.
-- ============================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. USER PROFILES & ROLE-BASED ACCESS CONTROL (RBAC)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('super_admin', 'admin', 'editor', 'media_manager', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. POSTGRESQL SECURITY DEFINER AUTHORIZATION HELPER FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller's authenticated UID has an active administrative role in public.profiles
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin', 'editor', 'media_manager')
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. PROFILES RLS POLICIES
-- ----------------------------------------------------------------------------
-- A user can view their own profile; admins can view all profiles
CREATE POLICY "Users can view own profile or admins can view all"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.is_admin());

-- A user can update their own profile details (full_name, avatar_url), but NOT role
CREATE POLICY "Users can update own details"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (id = auth.uid() OR public.is_admin());

-- Only admins can delete profiles
CREATE POLICY "Only admins can delete profiles"
ON public.profiles FOR DELETE TO authenticated
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. AUTOMATIC PROFILE CREATION TRIGGER (ON NEW AUTH USER)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'viewer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 5. CONTACT INQUIRIES & AUTOMATED DIRECTIVES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id TEXT PRIMARY KEY,
  reference_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  company TEXT,
  phone TEXT,
  inquiry_type TEXT NOT NULL DEFAULT 'Enterprise Engineering',
  budget_range TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'in_progress', 'responded', 'closed', 'in_review', 'replied', 'archived')),
  email_status TEXT NOT NULL DEFAULT 'pending' CHECK (email_status IN ('new', 'sending', 'sent', 'failed', 'pending')),
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  email_error_message TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_ref ON public.contact_inquiries(reference_id);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON public.contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email_status ON public.contact_inquiries(email_status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created ON public.contact_inquiries(created_at DESC);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit contact inquiries"
ON public.contact_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Only admins can view contact inquiries"
ON public.contact_inquiries FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can update contact inquiries"
ON public.contact_inquiries FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete contact inquiries"
ON public.contact_inquiries FOR DELETE TO authenticated
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. SITE SETTINGS & BRAND IDENTITY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary_settings',
  site_name TEXT NOT NULL DEFAULT 'Ravan Technologies',
  tagline TEXT NOT NULL DEFAULT 'Building Technology. Solving Real Problems.',
  description TEXT,
  logo_url TEXT NOT NULL DEFAULT '/images/ravan-logo.png',
  logo_dark_url TEXT,
  logo_alt TEXT,
  favicon_url TEXT,
  contact_email TEXT NOT NULL DEFAULT 'contact@ravantechnologies.com',
  contact_phone TEXT,
  whatsapp_number TEXT,
  office_address TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  footer_text TEXT,
  copyright_text TEXT,
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can modify site settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. FOUNDER PROFILE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.founders (
  id TEXT PRIMARY KEY DEFAULT 'founder-001',
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  bio TEXT NOT NULL,
  vision TEXT,
  quote TEXT,
  quote_author_tag TEXT,
  image_url TEXT,
  focus_areas JSONB DEFAULT '[]'::jsonb,
  tenure_years TEXT,
  achievements JSONB DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  custom_sections JSONB DEFAULT '[]'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view founder profile" ON public.founders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can modify founder profile" ON public.founders FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. LEADERSHIP TEAM
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leadership (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  company_branch TEXT NOT NULL DEFAULT 'Ravan Technologies',
  bio TEXT,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leadership_order ON public.leadership(display_order);
ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published leadership" ON public.leadership FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage leadership" ON public.leadership FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 9. SERVICES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  code TEXT,
  short_description TEXT,
  full_description TEXT,
  icon TEXT,
  image_url TEXT,
  metric_value TEXT,
  metric_label TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  technologies JSONB DEFAULT '[]'::jsonb,
  cta_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_order ON public.services(display_order);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published services" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage services" ON public.services FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 10. SOLUTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.solutions (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  architecture_details TEXT,
  benefits JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solutions_order ON public.solutions(display_order);
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published solutions" ON public.solutions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage solutions" ON public.solutions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 11. CASE STUDY PROJECTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  project_number TEXT,
  title TEXT NOT NULL,
  category TEXT,
  problem TEXT,
  solution TEXT,
  technologies JSONB DEFAULT '[]'::jsonb,
  outcome_metric TEXT,
  outcome_label TEXT,
  image_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_order ON public.projects(display_order);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage projects" ON public.projects FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 12. HACKATHONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hackathons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  edition TEXT,
  subtitle TEXT,
  event_date TEXT,
  time TEXT,
  location TEXT,
  registration_url TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'draft')),
  focus_statement TEXT,
  description TEXT,
  image_url TEXT,
  banner_url TEXT,
  additional_images JSONB DEFAULT '[]'::jsonb,
  solutions_deployed_count TEXT,
  tracks JSONB DEFAULT '[]'::jsonb,
  problem_statements JSONB DEFAULT '[]'::jsonb,
  rules JSONB DEFAULT '[]'::jsonb,
  prizes JSONB DEFAULT '[]'::jsonb,
  eligibility TEXT,
  contact_info TEXT,
  display_order INT DEFAULT 0,
  winning_solutions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view hackathons" ON public.hackathons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage hackathons" ON public.hackathons FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 13. LEARNING PROGRAMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_programs (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  track_name TEXT,
  badge TEXT,
  description TEXT,
  enrolled_count TEXT,
  image_url TEXT,
  methodology_phase TEXT,
  curriculum JSONB DEFAULT '[]'::jsonb,
  prerequisites JSONB DEFAULT '[]'::jsonb,
  display_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_order ON public.learning_programs(display_order);
ALTER TABLE public.learning_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published learning programs" ON public.learning_programs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage learning programs" ON public.learning_programs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 14. ECOSYSTEM (TECH PARK & FILM STUDIO)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ecosystem (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hub', 'studio')),
  tagline TEXT,
  description TEXT,
  image_url TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '[]'::jsonb,
  status_badge TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ecosystem ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view ecosystem entities" ON public.ecosystem FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage ecosystem" ON public.ecosystem FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 15. MEDIA ASSETS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  alt_text TEXT,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
  file_size TEXT,
  url TEXT NOT NULL,
  storage_path TEXT,
  dimensions TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_created ON public.media(created_at DESC);
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view media library" ON public.media FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage media" ON public.media FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 16. GALLERY ALBUMS & ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery_albums (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  items_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view gallery albums" ON public.gallery_albums FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage gallery albums" ON public.gallery_albums FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 17. BLOG & ENGINEERING WHITEPAPERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  read_time_minutes INT DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published_at DESC);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published blog posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage blog posts" ON public.blog_posts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 18. EVENTS & SUMMITS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('summit', 'keynote', 'webinar', 'workshop')),
  event_date TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  registration_link TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view events" ON public.events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage events" ON public.events FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 19. TESTIMONIALS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY,
  quote TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_designation TEXT,
  author_company TEXT,
  avatar_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 20. PARTNERS & CLIENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  category TEXT NOT NULL DEFAULT 'technology',
  display_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  industry TEXT,
  display_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published partners" ON public.partners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage partners" ON public.partners FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Public can view published clients" ON public.clients FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage clients" ON public.clients FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 21. NAVIGATION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.navigation (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  path TEXT NOT NULL,
  position TEXT NOT NULL,
  parent_id TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_external BOOLEAN DEFAULT false,
  badge TEXT,
  children JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.navigation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active navigation" ON public.navigation FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage navigation" ON public.navigation FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 22. SEO METADATA
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_metadata (
  id TEXT PRIMARY KEY DEFAULT 'primary_seo',
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  focus_keyword TEXT,
  secondary_keywords JSONB DEFAULT '[]'::jsonb,
  canonical_url TEXT NOT NULL,
  robots_index BOOLEAN NOT NULL DEFAULT true,
  robots_follow BOOLEAN NOT NULL DEFAULT true,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  schema_type TEXT NOT NULL DEFAULT 'Organization',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view SEO settings" ON public.seo_metadata FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage SEO" ON public.seo_metadata FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 23. ROLES & PERMISSIONS (METADATA TABLE)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view roles" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can manage roles" ON public.roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 24. AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  user_name TEXT NOT NULL DEFAULT 'Super Admin',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
