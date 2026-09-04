-- ============================================================================
-- MASTER SUPABASE FIX
-- Run this in your Supabase SQL Editor to synchronize the schema with the frontend
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FIX SITE SETTINGS TABLE
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 2. FIX LEADERSHIP TABLE
-- ----------------------------------------------------------------------------
ALTER TABLE public.leadership 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leadership' AND column_name='display_order') THEN
    ALTER TABLE public.leadership ADD COLUMN display_order INT NOT NULL DEFAULT 0;
  END IF;
END $$$;

-- ----------------------------------------------------------------------------
-- 3. PROVISION STORAGE BUCKET: site-assets
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies for site-assets
DROP POLICY IF EXISTS "Public Access site-assets" ON storage.objects;
CREATE POLICY "Public Access site-assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "Admin Insert site-assets" ON storage.objects;
CREATE POLICY "Admin Insert site-assets" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'site-assets' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admin Update site-assets" ON storage.objects;
CREATE POLICY "Admin Update site-assets" ON storage.objects FOR UPDATE USING (
  bucket_id = 'site-assets' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admin Delete site-assets" ON storage.objects;
CREATE POLICY "Admin Delete site-assets" ON storage.objects FOR DELETE USING (
  bucket_id = 'site-assets' AND auth.role() = 'authenticated'
);

-- ----------------------------------------------------------------------------
-- 4. PROVISION STORAGE BUCKET: avatars
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies for avatars
DROP POLICY IF EXISTS "Public Access avatars" ON storage.objects;
CREATE POLICY "Public Access avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Admin Insert avatars" ON storage.objects;
CREATE POLICY "Admin Insert avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admin Update avatars" ON storage.objects;
CREATE POLICY "Admin Update avatars" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admin Delete avatars" ON storage.objects;
CREATE POLICY "Admin Delete avatars" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.role() = 'authenticated'
);
