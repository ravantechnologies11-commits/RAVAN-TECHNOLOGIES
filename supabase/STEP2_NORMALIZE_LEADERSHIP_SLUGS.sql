-- ============================================================================
-- RAVAN TECHNOLOGIES — STEP 2: NORMALIZE LEADERSHIP SLUGS IN SUPABASE
-- Run this in your Supabase SQL Editor to normalize database slug metadata.
-- Safely preserves all existing JSONB fields, skills, education, and projects.
-- ============================================================================

-- 1. Normalize Co-Founder A. BERRY SUGANDH SURYA (lead-001)
UPDATE public.leadership
SET social_links = jsonb_set(
  jsonb_set(
    COALESCE(social_links, '{}'::jsonb),
    '{_meta,slug}',
    '"berry-sugandh-surya"'
  ),
  '{_meta,canonical_url}',
  '"/team/berry-sugandh-surya"'
),
updated_at = NOW()
WHERE id = 'lead-001';

-- 2. Normalize Manager V.VINOTHKUMAR (lead-003)
UPDATE public.leadership
SET social_links = jsonb_set(
  jsonb_set(
    COALESCE(social_links, '{}'::jsonb),
    '{_meta,slug}',
    '"vinothkumar"'
  ),
  '{_meta,canonical_url}',
  '"/team/vinothkumar"'
),
updated_at = NOW()
WHERE id = 'lead-003';

-- 3. Normalize Manager MITHRA.S (lead-004)
UPDATE public.leadership
SET social_links = jsonb_set(
  jsonb_set(
    COALESCE(social_links, '{}'::jsonb),
    '{_meta,slug}',
    '"mithra-s"'
  ),
  '{_meta,canonical_url}',
  '"/team/mithra-s"'
),
updated_at = NOW()
WHERE id = 'lead-004';

-- 4. Update primary_seo canonical URL to https://ravantechnologies.in
UPDATE public.seo_metadata
SET canonical_url = 'https://ravantechnologies.in',
    updated_at = NOW()
WHERE id = 'primary_seo';

-- 5. Verification query to confirm clean state
SELECT 
  id, 
  name, 
  designation, 
  social_links->_meta->>'slug' AS normalized_slug,
  social_links->_meta->>'canonical_url' AS canonical_url
FROM public.leadership
ORDER BY display_order;
