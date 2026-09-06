-- ============================================================================
-- RAVAN TECHNOLOGIES — PRODUCTION CMS COLUMNS & STORAGE MIGRATION
-- Migration: 00003_production_cms_columns_and_tables.sql
-- Safe, idempotent script for PostgreSQL / Supabase SQL Editor
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. HACKATHONS: Ensure all modern columns and constraints exist
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hackathons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  edition TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS event_date TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS registration_url TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming';
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS focus_statement TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS solutions_deployed_count TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS tracks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS problem_statements JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS rules JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS prizes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS eligibility TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS contact_info TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS winning_solutions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS theme TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS registration_deadline TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS event_dates TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS prize_pool TEXT;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS is_registration_open BOOLEAN DEFAULT true;

-- Update constraint on status to permit 'draft', 'upcoming', 'live', 'completed'
ALTER TABLE public.hackathons DROP CONSTRAINT IF EXISTS hackathons_status_check;
ALTER TABLE public.hackathons ADD CONSTRAINT hackathons_status_check CHECK (status IN ('upcoming', 'live', 'completed', 'draft'));

ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view hackathons" ON public.hackathons;
CREATE POLICY "Public can view hackathons" ON public.hackathons FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage hackathons" ON public.hackathons;
CREATE POLICY "Only admins can manage hackathons" ON public.hackathons FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. LEARNING PROGRAMS: Add missing columns
-- ----------------------------------------------------------------------------
ALTER TABLE public.learning_programs ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.learning_programs ADD COLUMN IF NOT EXISTS track_name TEXT;
ALTER TABLE public.learning_programs ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE public.learning_programs ADD COLUMN IF NOT EXISTS enrolled_count TEXT;
ALTER TABLE public.learning_programs ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.learning_programs ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.learning_programs ADD COLUMN IF NOT EXISTS external_url TEXT;
ALTER TABLE public.learning_programs ADD COLUMN IF NOT EXISTS instructor_info TEXT;
ALTER TABLE public.learning_programs ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.learning_programs ADD COLUMN IF NOT EXISTS methodology_phase TEXT;
ALTER TABLE public.learning_programs ADD COLUMN IF NOT EXISTS curriculum JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.learning_programs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.learning_programs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ----------------------------------------------------------------------------
-- 3. PROJECTS: Add missing columns
-- ----------------------------------------------------------------------------
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS live_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS case_study JSONB;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ----------------------------------------------------------------------------
-- 4. SOLUTIONS: Add missing columns
-- ----------------------------------------------------------------------------
ALTER TABLE public.solutions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.solutions ADD COLUMN IF NOT EXISTS architecture_details TEXT;
ALTER TABLE public.solutions ADD COLUMN IF NOT EXISTS benefits JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.solutions ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.solutions ADD COLUMN IF NOT EXISTS solution_delivered TEXT;
ALTER TABLE public.solutions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.solutions ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.solutions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ----------------------------------------------------------------------------
-- 5. EVENTS: Add missing columns
-- ----------------------------------------------------------------------------
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_time TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS capacity TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ----------------------------------------------------------------------------
-- 6. BLOG POSTS: Add missing columns
-- ----------------------------------------------------------------------------
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_role TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ----------------------------------------------------------------------------
-- 7. CLIENTS: Add missing columns
-- ----------------------------------------------------------------------------
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ----------------------------------------------------------------------------
-- 8. TESTIMONIALS: Add missing columns
-- ----------------------------------------------------------------------------
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ----------------------------------------------------------------------------
-- 9. NAVIGATION: Add missing columns
-- ----------------------------------------------------------------------------
ALTER TABLE public.navigation ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE public.navigation ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ----------------------------------------------------------------------------
-- 10. MEDIA: Add missing columns
-- ----------------------------------------------------------------------------
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS dimensions TEXT;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ----------------------------------------------------------------------------
-- 11. ECOSYSTEM: Add missing columns
-- ----------------------------------------------------------------------------
ALTER TABLE public.ecosystem ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.ecosystem ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.ecosystem ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE public.ecosystem ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.ecosystem ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.ecosystem ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE public.ecosystem ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.ecosystem ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ----------------------------------------------------------------------------
-- 12. GALLERY ALBUMS: Create table if not exists
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery_albums (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  cover_image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  display_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published gallery albums" ON public.gallery_albums;
CREATE POLICY "Public can view published gallery albums" ON public.gallery_albums FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage gallery albums" ON public.gallery_albums;
CREATE POLICY "Only admins can manage gallery albums" ON public.gallery_albums FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 13. PROVISION STORAGE BUCKETS & RLS POLICIES
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('site-assets', 'site-assets', true),
  ('avatars', 'avatars', true),
  ('media', 'media', true),
  ('gallery', 'gallery', true),
  ('projects', 'projects', true),
  ('ecosystem', 'ecosystem', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Public Read
DROP POLICY IF EXISTS "Public Access site-assets" ON storage.objects;
CREATE POLICY "Public Access site-assets" ON storage.objects FOR SELECT USING (bucket_id IN ('site-assets', 'avatars', 'media', 'gallery', 'projects', 'ecosystem'));

-- Storage Admin Full Manage
DROP POLICY IF EXISTS "Admin Manage All Storage" ON storage.objects;
CREATE POLICY "Admin Manage All Storage" ON storage.objects FOR ALL TO authenticated USING (
  bucket_id IN ('site-assets', 'avatars', 'media', 'gallery', 'projects', 'ecosystem') AND public.is_admin()
) WITH CHECK (
  bucket_id IN ('site-assets', 'avatars', 'media', 'gallery', 'projects', 'ecosystem') AND public.is_admin()
);
