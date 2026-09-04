-- ============================================================================
-- RAVAN TECHNOLOGIES — PRODUCTION DATABASE & SECURITY HARDENING
-- Run this in your Supabase Dashboard SQL Editor (click "RUN")
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. AUTHORIZED ADMINISTRATOR ACCESS FUNCTION (Strict Non-Generic RBAC)
-- Only verified admin roles and authorized administrative emails can modify CMS data.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin')
    AND LOWER(email) IN (
      'founder@ravantechnologies.com',
      'admin@ravantechnologies.com',
      'ceo@ravantechnologies.com',
      'contact@ravantechnologies.com'
    )
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. SYNCHRONIZE TABLE COLUMNS
-- ----------------------------------------------------------------------------

-- site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS official_tagline TEXT,
ADD COLUMN IF NOT EXISTS logo_public_url TEXT,
ADD COLUMN IF NOT EXISTS logo_path TEXT,
ADD COLUMN IF NOT EXISTS inquiry_email TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS direct_whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS office_address TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS hero_image_alt TEXT,
ADD COLUMN IF NOT EXISTS hero_image_focal_x INT DEFAULT 50,
ADD COLUMN IF NOT EXISTS hero_image_focal_y INT DEFAULT 50,
ADD COLUMN IF NOT EXISTS hero_badge_text TEXT,
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- leadership
ALTER TABLE public.leadership 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leadership' AND column_name='display_order') THEN
    ALTER TABLE public.leadership ADD COLUMN display_order INT NOT NULL DEFAULT 0;
  END IF;
END $$;

-- projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published',
ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;

-- services
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- solutions
ALTER TABLE public.solutions
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS technologies JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS problem TEXT,
ADD COLUMN IF NOT EXISTS solution TEXT,
ADD COLUMN IF NOT EXISTS cta_text TEXT,
ADD COLUMN IF NOT EXISTS cta_url TEXT,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- ----------------------------------------------------------------------------
-- 3. PROVISION STORAGE BUCKETS WITH SECURE RLS (Admin Only Mutations)
-- ----------------------------------------------------------------------------

-- site-assets bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete site-assets" ON storage.objects;

CREATE POLICY "Public Access site-assets" ON storage.objects 
  FOR SELECT USING (bucket_id = 'site-assets');

CREATE POLICY "Admin Insert site-assets" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());

CREATE POLICY "Admin Update site-assets" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'site-assets' AND public.is_admin());

CREATE POLICY "Admin Delete site-assets" ON storage.objects 
  FOR DELETE USING (bucket_id = 'site-assets' AND public.is_admin());

-- avatars bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete avatars" ON storage.objects;

CREATE POLICY "Public Access avatars" ON storage.objects 
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Admin Insert avatars" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND public.is_admin());

CREATE POLICY "Admin Update avatars" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'avatars' AND public.is_admin());

CREATE POLICY "Admin Delete avatars" ON storage.objects 
  FOR DELETE USING (bucket_id = 'avatars' AND public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. HARDEN ROW-LEVEL SECURITY POLICIES ACROSS ALL CMS TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin modify site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin modify site_settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read founders" ON public.founders;
DROP POLICY IF EXISTS "Admin modify founders" ON public.founders;
CREATE POLICY "Public read founders" ON public.founders FOR SELECT USING (true);
CREATE POLICY "Admin modify founders" ON public.founders FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read leadership" ON public.leadership;
DROP POLICY IF EXISTS "Admin modify leadership" ON public.leadership;
CREATE POLICY "Public read leadership" ON public.leadership FOR SELECT USING (true);
CREATE POLICY "Admin modify leadership" ON public.leadership FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read services" ON public.services;
DROP POLICY IF EXISTS "Admin modify services" ON public.services;
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admin modify services" ON public.services FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read solutions" ON public.solutions;
DROP POLICY IF EXISTS "Admin modify solutions" ON public.solutions;
CREATE POLICY "Public read solutions" ON public.solutions FOR SELECT USING (true);
CREATE POLICY "Admin modify solutions" ON public.solutions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read projects" ON public.projects;
DROP POLICY IF EXISTS "Admin modify projects" ON public.projects;
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admin modify projects" ON public.projects FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. SEED AUTHORIZED ADMINISTRATOR PROFILES
-- Guarantees Founder and CEO profiles exist with super_admin privileges.
-- ----------------------------------------------------------------------------
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'Executive Administrator'), 'super_admin'
FROM auth.users
WHERE LOWER(email) IN ('founder@ravantechnologies.com', 'admin@ravantechnologies.com', 'ceo@ravantechnologies.com')
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
