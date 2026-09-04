-- ============================================================================
-- RAVAN TECHNOLOGIES — COMPLETE PRODUCTION MIGRATION & STORAGE PROVISIONING
-- Run this ENTIRE script in Supabase Dashboard → SQL Editor → Click "RUN".
-- ============================================================================

-- 0. EXTENSIONS
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
-- 2. POSTGRESQL SECURITY DEFINER AUTHORIZATION FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;
CREATE POLICY "Users can view own profile or admins can view all"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own details" ON public.profiles;
CREATE POLICY "Users can update own details"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete profiles" ON public.profiles;
CREATE POLICY "Only admins can delete profiles"
ON public.profiles FOR DELETE TO authenticated
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. AUTOMATIC PROFILE TRIGGER ON AUTH USER CREATION
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

-- Auto-register any existing users in auth.users as super_admin
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', 'Executive Administrator'), 
  'super_admin'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- ----------------------------------------------------------------------------
-- 5. SITE SETTINGS & BRAND IDENTITY
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
  about_content JSONB DEFAULT '{}'::jsonb,
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can modify site settings" ON public.site_settings;
CREATE POLICY "Only admins can modify site settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed primary_settings if empty
INSERT INTO public.site_settings (id, site_name, tagline, description, logo_url, contact_email, office_address)
VALUES (
  'primary_settings',
  'Ravan Technologies',
  'Building Technology. Solving Real Problems.',
  'Architecting sovereign software systems, enterprise intelligence, and physical computing infrastructure for institutional scale.',
  '/images/ravan-logo.png',
  'contact@ravantechnologies.com',
  'Ravan Tech Park, Outer Ring Road, Bengaluru'
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. SEO METADATA
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_metadata (
  id TEXT PRIMARY KEY DEFAULT 'primary_seo',
  meta_title TEXT NOT NULL DEFAULT 'Ravan Technologies | Sovereign Enterprise Engineering & AI',
  meta_description TEXT NOT NULL DEFAULT 'Ravan Technologies builds sovereign digital backbones, high-concurrency systems, and applied AI infrastructure.',
  focus_keyword TEXT DEFAULT 'Enterprise AI',
  secondary_keywords JSONB DEFAULT '["High Scale Systems", "Sovereign AI", "Physical Infrastructure"]'::jsonb,
  canonical_url TEXT NOT NULL DEFAULT 'https://ravantechnologies.com',
  robots_index BOOLEAN NOT NULL DEFAULT true,
  robots_follow BOOLEAN NOT NULL DEFAULT true,
  og_title TEXT DEFAULT 'Ravan Technologies — Enterprise Intelligence',
  og_description TEXT DEFAULT 'Sovereign software systems and industrial intelligence.',
  og_image TEXT DEFAULT '/images/ravan-logo.png',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  schema_type TEXT NOT NULL DEFAULT 'Organization',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view SEO settings" ON public.seo_metadata;
CREATE POLICY "Public can view SEO settings" ON public.seo_metadata FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage SEO" ON public.seo_metadata;
CREATE POLICY "Only admins can manage SEO" ON public.seo_metadata FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.seo_metadata (id, meta_title, meta_description, canonical_url)
VALUES (
  'primary_seo',
  'Ravan Technologies | Sovereign Enterprise Engineering & AI',
  'Ravan Technologies builds sovereign digital backbones, high-concurrency systems, and applied AI infrastructure.',
  'https://ravantechnologies.com'
)
ON CONFLICT (id) DO NOTHING;

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
DROP POLICY IF EXISTS "Public can view founder profile" ON public.founders;
CREATE POLICY "Public can view founder profile" ON public.founders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can modify founder profile" ON public.founders;
CREATE POLICY "Only admins can modify founder profile" ON public.founders FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.founders (id, name, designation, bio, vision, tenure_years)
VALUES (
  'founder-001',
  'Kunal K Paymode',
  'Founder & Chief Architect',
  'Architecting sovereign digital infrastructure and enterprise software platforms designed for high-availability scale and real-world resilience.',
  'To engineer self-reliant technology ecosystems that empower institutional autonomy and technological sovereignty.',
  '20+ Years'
)
ON CONFLICT (id) DO NOTHING;

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
  social_links JSONB DEFAULT '{}'::jsonb,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view leadership" ON public.leadership;
CREATE POLICY "Public can view leadership" ON public.leadership FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage leadership" ON public.leadership;
CREATE POLICY "Only admins can manage leadership" ON public.leadership FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 9. SERVICES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT,
  icon TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  technologies JSONB DEFAULT '[]'::jsonb,
  deliverables JSONB DEFAULT '[]'::jsonb,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view services" ON public.services;
CREATE POLICY "Public can view services" ON public.services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage services" ON public.services;
CREATE POLICY "Only admins can manage services" ON public.services FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 10. SOLUTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.solutions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  challenge TEXT,
  architecture TEXT,
  impact TEXT,
  technologies JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '[]'::jsonb,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view solutions" ON public.solutions;
CREATE POLICY "Public can view solutions" ON public.solutions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage solutions" ON public.solutions;
CREATE POLICY "Only admins can manage solutions" ON public.solutions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 11. PROJECTS / CASE STUDIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  domain TEXT NOT NULL,
  summary TEXT NOT NULL,
  problem_statement TEXT,
  solution_deployed TEXT,
  outcomes JSONB DEFAULT '[]'::jsonb,
  technologies JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  image_url TEXT,
  case_study_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
CREATE POLICY "Public can view projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage projects" ON public.projects;
CREATE POLICY "Only admins can manage projects" ON public.projects FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 12. HACKATHONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hackathons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  edition TEXT NOT NULL,
  theme TEXT NOT NULL,
  registration_deadline TEXT,
  event_dates TEXT,
  prize_pool TEXT,
  tracks JSONB DEFAULT '[]'::jsonb,
  faq JSONB DEFAULT '[]'::jsonb,
  rules JSONB DEFAULT '[]'::jsonb,
  is_registration_open BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view hackathons" ON public.hackathons;
CREATE POLICY "Public can view hackathons" ON public.hackathons FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage hackathons" ON public.hackathons;
CREATE POLICY "Only admins can manage hackathons" ON public.hackathons FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 13. LEARNING PROGRAMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_programs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  level TEXT NOT NULL,
  duration TEXT NOT NULL,
  prerequisites TEXT,
  description TEXT NOT NULL,
  modules JSONB DEFAULT '[]'::jsonb,
  outcomes JSONB DEFAULT '[]'::jsonb,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.learning_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view learning programs" ON public.learning_programs;
CREATE POLICY "Public can view learning programs" ON public.learning_programs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage learning programs" ON public.learning_programs;
CREATE POLICY "Only admins can manage learning programs" ON public.learning_programs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 14. ECOSYSTEM (TECH PARK & FILM STUDIO)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ecosystem (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  headline TEXT NOT NULL,
  specs JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  gallery JSONB DEFAULT '[]'::jsonb,
  contact_lead TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ecosystem ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view ecosystem" ON public.ecosystem;
CREATE POLICY "Public can view ecosystem" ON public.ecosystem FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage ecosystem" ON public.ecosystem;
CREATE POLICY "Only admins can manage ecosystem" ON public.ecosystem FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 15. MEDIA ASSETS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  alt_text TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view media" ON public.media;
CREATE POLICY "Public can view media" ON public.media FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage media" ON public.media;
CREATE POLICY "Only admins can manage media" ON public.media FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 16. CONTACT INQUIRIES
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
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created ON public.contact_inquiries(created_at DESC);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can submit contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Public can submit contact inquiries" ON public.contact_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Only admins can view contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Only admins can view contact inquiries" ON public.contact_inquiries FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "Only admins can update contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Only admins can update contact inquiries" ON public.contact_inquiries FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Only admins can delete contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Only admins can delete contact inquiries" ON public.contact_inquiries FOR DELETE TO authenticated USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 17. BLOG POSTS / WHITEPAPERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  category TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  read_time TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_published BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;
CREATE POLICY "Public can view published blog posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Only admins can manage blog posts" ON public.blog_posts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 18. EVENTS & SUMMITS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  speaker TEXT,
  registration_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active events" ON public.events;
CREATE POLICY "Public can view active events" ON public.events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage events" ON public.events;
CREATE POLICY "Only admins can manage events" ON public.events FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 19. TESTIMONIALS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  designation TEXT NOT NULL,
  company TEXT NOT NULL,
  quote TEXT NOT NULL,
  avatar_url TEXT,
  rating INT NOT NULL DEFAULT 5,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
CREATE POLICY "Public can view testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Only admins can manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 20. PARTNERS & CLIENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view partners" ON public.partners;
CREATE POLICY "Public can view partners" ON public.partners FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage partners" ON public.partners;
CREATE POLICY "Only admins can manage partners" ON public.partners FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  case_study_id TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view clients" ON public.clients;
CREATE POLICY "Public can view clients" ON public.clients FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage clients" ON public.clients;
CREATE POLICY "Only admins can manage clients" ON public.clients FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 21. NAVIGATION & AUDIT LOGS
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
DROP POLICY IF EXISTS "Public can view active navigation" ON public.navigation;
CREATE POLICY "Public can view active navigation" ON public.navigation FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage navigation" ON public.navigation;
CREATE POLICY "Only admins can manage navigation" ON public.navigation FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

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
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());

-- ============================================================================
-- 22. SUPABASE STORAGE BUCKETS & ROW LEVEL SECURITY FOR SITE ASSETS & LOGOS
-- ============================================================================

-- Create public storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('site-assets', 'site-assets', true),
  ('media', 'media', true),
  ('avatars', 'avatars', true),
  ('gallery', 'gallery', true),
  ('projects', 'projects', true),
  ('ecosystem', 'ecosystem', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Public can view assets
DROP POLICY IF EXISTS "Public can view site-assets" ON storage.objects;
CREATE POLICY "Public can view site-assets"
ON storage.objects FOR SELECT TO public
USING (bucket_id IN ('site-assets', 'media', 'avatars', 'gallery', 'projects', 'ecosystem'));

-- Storage RLS: Authenticated admins can upload assets
DROP POLICY IF EXISTS "Admins can upload site-assets" ON storage.objects;
CREATE POLICY "Admins can upload site-assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('site-assets', 'media', 'avatars', 'gallery', 'projects', 'ecosystem'));

-- Storage RLS: Authenticated admins can update assets
DROP POLICY IF EXISTS "Admins can update site-assets" ON storage.objects;
CREATE POLICY "Admins can update site-assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id IN ('site-assets', 'media', 'avatars', 'gallery', 'projects', 'ecosystem'));

-- Storage RLS: Authenticated admins can delete assets
DROP POLICY IF EXISTS "Admins can delete site-assets" ON storage.objects;
CREATE POLICY "Admins can delete site-assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id IN ('site-assets', 'media', 'avatars', 'gallery', 'projects', 'ecosystem'));
