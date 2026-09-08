-- ============================================================================
-- POST-EXECUTION VERIFICATION SCRIPT
-- Run in Supabase SQL Editor after running SECURITY_HARDENING_FINAL.sql
-- ============================================================================

-- 1. Check that RLS is ENABLED on all tables
SELECT 
  tablename, 
  rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'profiles', 'audit_logs', 'contact_inquiries', 'site_settings', 
    'founders', 'leadership', 'services', 'solutions', 'projects', 
    'learning_programs', 'blog_posts', 'testimonials', 'partners', 
    'clients', 'hackathons', 'events', 'navigation', 'ecosystem', 
    'media', 'seo_metadata'
  )
ORDER BY tablename;

-- 2. Verify all policies created across public tables
SELECT 
  tablename, 
  policyname, 
  cmd, 
  roles,
  qual AS using_expression
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Verify storage.objects policies
SELECT 
  policyname, 
  cmd, 
  roles,
  qual AS using_expression
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 4. Verify admin accounts in profiles
SELECT 
  id, 
  email, 
  role, 
  updated_at 
FROM public.profiles 
WHERE role IN ('super_admin', 'admin')
ORDER BY email;
