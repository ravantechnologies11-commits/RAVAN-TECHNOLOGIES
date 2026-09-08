-- ============================================================================
-- RAVAN TECHNOLOGIES — ELEVATE GMAIL ADMIN & HARDEN IS_ADMIN() FUNCTION
-- File: supabase/ELEVATE_GMAIL_ADMIN.sql
-- 
-- Run this script in the Supabase Dashboard -> SQL Editor
-- This script:
-- 1. Updates public.is_admin() to verify role in public.profiles dynamically (RBAC)
-- 2. Elevates the existing Supabase Auth Gmail user to super_admin in public.profiles
-- 3. Verifies the elevation result immediately
-- ============================================================================

BEGIN;

-- 1. Secure & Harden is_admin() function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2. Elevate the existing Supabase Auth admin user to super_admin
INSERT INTO public.profiles (id, email, full_name, role, updated_at)
SELECT 
  id, 
  LOWER(email), 
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1), 'Executive Administrator'), 
  'super_admin',
  NOW()
FROM auth.users
WHERE LOWER(email) LIKE '%@gmail.com'
   OR LOWER(email) IN (
     'ravantechnologies11@gmail.com',
     'founder@ravantechnologies.in', 
     'ceo@ravantechnologies.in',
     'admin@ravantechnologies.in'
   )
ON CONFLICT (id) DO UPDATE SET 
  role = 'super_admin',
  email = EXCLUDED.email,
  updated_at = NOW();

COMMIT;

-- 3. Verification Query (Displays active administrator profiles)
SELECT id, email, full_name, role, updated_at 
FROM public.profiles 
WHERE role IN ('super_admin', 'admin');
