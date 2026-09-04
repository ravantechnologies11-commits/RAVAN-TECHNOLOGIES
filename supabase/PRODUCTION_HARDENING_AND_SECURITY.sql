-- ==============================================================================
-- RAVAN TECHNOLOGIES — PRODUCTION HARDENING, TARGETED CLEANUP & SECURITY POLICIES
-- ==============================================================================
-- Non-destructive: Does NOT drop tables, does NOT drop columns, does NOT truncate.
-- Preserves authentic production data:
--   - Founder: V ABISHEK (founder-001)
--   - CEO: SIBI RAJ U (lead-002)
--   - Primary Site Settings (branding/ravan-logo.png)
--   - Canonical SEO Settings
-- ==============================================================================

BEGIN;

-- 1. CLEAN IDENTIFIABLE DEMO/TEST LEADERSHIP RECORDS
-- Targets only the 4 Unsplash placeholder seed records, preserving real CEO Sibi Raj U (lead-002).
DELETE FROM public.leadership 
WHERE id IN ('lead-001', 'lead-003', 'lead-004', 'lead-005') 
  AND image_url LIKE '%images.unsplash.com%';

-- 2. ENSURE AUTHENTIC CEO RECORD IS ACCURATE IN PUBLIC.LEADERSHIP
INSERT INTO public.leadership (
  id,
  name,
  designation,
  company_branch,
  bio,
  image_url,
  display_order,
  status,
  social_links,
  created_at,
  updated_at
) VALUES (
  'lead-002',
  'SIBI RAJ U',
  'CEO — Ravan Technologies',
  'Ravan Tech Park',
  'Drives enterprise software strategy, core platform delivery, and high-concurrency client architectures.',
  'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/avatars/leadership/1788253631161_ho62j1.jpg',
  1,
  'published',
  '{"linkedin": "https://linkedin.com", "twitter": "https://twitter.com"}'::jsonb,
  timezone('utc'::text, now()),
  timezone('utc'::text, now())
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  designation = EXCLUDED.designation,
  company_branch = EXCLUDED.company_branch,
  bio = EXCLUDED.bio,
  image_url = EXCLUDED.image_url,
  display_order = 1,
  status = 'published',
  updated_at = timezone('utc'::text, now());

-- 3. ENSURE AUTHENTIC FOUNDER RECORD IS ACCURATE IN PUBLIC.FOUNDERS
INSERT INTO public.founders (
  id,
  name,
  designation,
  bio,
  vision,
  quote,
  quote_author_tag,
  image_url,
  focus_areas,
  tenure_years,
  achievements,
  social_links,
  seo_title,
  seo_description,
  updated_at
) VALUES (
  'founder-001',
  'V ABISHEK',
  'Founder of RAVAN TECHNOLOGIES',
  'Architecting sovereign digital infrastructure and enterprise software platforms.',
  'To engineer self-reliant technology ecosystems that empower institutional autonomy.',
  'We are not merely building software; we are constructing the digital infrastructure that will dictate the next century of enterprise efficiency. Sovereign Intelligence is the mandate.',
  'Executive Address',
  'https://iecesxahkbkkafzmzwcd.supabase.co/storage/v1/object/public/avatars/founder/1788068046599_4p0eqd.jpg',
  ARRAY['Enterprise Architecture', 'Sovereign AI Models', 'Global Tech Strategy', 'Decentralized Infrastructure'],
  '2 Years',
  ARRAY[
    'Pioneered Sovereign Intelligence framework for enterprise AI model governance.',
    'Established Ravan Tech Park spanning dedicated R&D infrastructure.',
    'Founded Ravan Hackathon series engaging engineering builders globally.'
  ],
  '{"linkedin": "https://linkedin.com/company/ravantechnologies", "twitter": "https://twitter.com/ravantech", "email": "founder@ravantechnologies.com"}'::jsonb,
  'V ABISHEK — Founder & Architect | Ravan Technologies',
  'Discover the visionary leadership and engineering philosophy behind Ravan Technologies.',
  timezone('utc'::text, now())
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  designation = EXCLUDED.designation,
  image_url = EXCLUDED.image_url,
  updated_at = timezone('utc'::text, now());

-- 4. HARDEN STORAGE BUCKET ROW-LEVEL SECURITY
-- Public can READ assets, but ONLY verified admins (via public.is_admin()) can INSERT, UPDATE, or DELETE
DO $$
BEGIN
  -- avatars bucket
  DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
  CREATE POLICY "Public can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

  DROP POLICY IF EXISTS "Admins can upload avatars" ON storage.objects;
  CREATE POLICY "Admins can upload avatars" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND public.is_admin());

  DROP POLICY IF EXISTS "Admins can update avatars" ON storage.objects;
  CREATE POLICY "Admins can update avatars" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND public.is_admin());

  DROP POLICY IF EXISTS "Admins can delete avatars" ON storage.objects;
  CREATE POLICY "Admins can delete avatars" ON storage.objects
    FOR DELETE USING (bucket_id = 'avatars' AND public.is_admin());

  -- site-assets bucket
  DROP POLICY IF EXISTS "Public can view site assets" ON storage.objects;
  CREATE POLICY "Public can view site assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'site-assets');

  DROP POLICY IF EXISTS "Admins can upload site assets" ON storage.objects;
  CREATE POLICY "Admins can upload site assets" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());

  DROP POLICY IF EXISTS "Admins can update site assets" ON storage.objects;
  CREATE POLICY "Admins can update site assets" ON storage.objects
    FOR UPDATE USING (bucket_id = 'site-assets' AND public.is_admin());

  DROP POLICY IF EXISTS "Admins can delete site assets" ON storage.objects;
  CREATE POLICY "Admins can delete site assets" ON storage.objects
    FOR DELETE USING (bucket_id = 'site-assets' AND public.is_admin());
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Storage policy update notice: %', SQLERRM;
END $$;

COMMIT;
