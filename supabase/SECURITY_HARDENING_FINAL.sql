-- ============================================================================
-- RAVAN TECHNOLOGIES — PRODUCTION SECURITY HARDENING & RLS POLICY AUDIT
-- File: supabase/SECURITY_HARDENING_FINAL.sql
-- Verified strictly against live Supabase production database schema
-- Safe, idempotent, transaction-safe — does NOT assume non-existent columns
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. HARDEN is_admin() SECURITY DEFINER FUNCTION
-- Strictly authorizes users with super_admin or admin role in public.profiles.
-- Security Definer prevents RLS recursion and search_path protects against injection.
-- Returns FALSE for anonymous callers and non-admin roles (viewer).
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 2. PROFILES TABLE RLS
-- Users can view and edit their own identity; admins have full governance
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;
CREATE POLICY "Users can view own profile or admins can view all" 
ON public.profiles FOR SELECT TO authenticated 
USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own details" ON public.profiles;
CREATE POLICY "Users can update own details" 
ON public.profiles FOR UPDATE TO authenticated 
USING (id = auth.uid() OR public.is_admin()) 
WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Service role only can insert profiles" ON public.profiles;
CREATE POLICY "Service role only can insert profiles" 
ON public.profiles FOR INSERT TO authenticated 
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete profiles" ON public.profiles;
CREATE POLICY "Only admins can delete profiles" 
ON public.profiles FOR DELETE TO authenticated 
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. AUDIT LOGS RLS
-- Remove public/anon insertion; protect against log flooding and forgery
-- ----------------------------------------------------------------------------
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs" 
ON public.audit_logs FOR INSERT TO authenticated 
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_logs FOR SELECT TO authenticated 
USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete audit logs" ON public.audit_logs;
CREATE POLICY "Only admins can delete audit logs" 
ON public.audit_logs FOR DELETE TO authenticated 
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. CONTACT INQUIRIES RLS
-- Public can submit inquiries with strict field validation; admins manage
-- ----------------------------------------------------------------------------
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Public can submit contact inquiries" 
ON public.contact_inquiries FOR INSERT TO anon, authenticated 
WITH CHECK (
  name IS NOT NULL AND name <> '' AND 
  email IS NOT NULL AND email LIKE '%@%' AND 
  message IS NOT NULL AND message <> ''
);

DROP POLICY IF EXISTS "Only admins can view contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Only admins can view contact inquiries" 
ON public.contact_inquiries FOR SELECT TO authenticated 
USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can update contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Only admins can update contact inquiries" 
ON public.contact_inquiries FOR UPDATE TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Only admins can delete contact inquiries" 
ON public.contact_inquiries FOR DELETE TO authenticated 
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. ALWAYS-PUBLIC METADATA & CONTENT TABLES (No draft column in live schema)
-- Public read access; full CRUD restricted exclusively to is_admin()
-- ----------------------------------------------------------------------------

-- Site Settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Only admins can modify site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin modify site_settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can modify site settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Founders
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view founder profile" ON public.founders;
DROP POLICY IF EXISTS "Public read founders" ON public.founders;
DROP POLICY IF EXISTS "Only admins can modify founder profile" ON public.founders;
DROP POLICY IF EXISTS "Admin modify founders" ON public.founders;
CREATE POLICY "Public can view founder profile" ON public.founders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can modify founder profile" ON public.founders FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Media Assets
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view media library" ON public.media;
DROP POLICY IF EXISTS "Only admins can manage media" ON public.media;
CREATE POLICY "Public can view media library" ON public.media FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage media" ON public.media FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SEO Metadata
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view SEO settings" ON public.seo_metadata;
DROP POLICY IF EXISTS "Only admins can manage SEO" ON public.seo_metadata;
CREATE POLICY "Public can view SEO settings" ON public.seo_metadata FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage SEO" ON public.seo_metadata FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Projects (Live columns: id, title, summary, technologies, image_url, featured, display_order, updated_at)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
DROP POLICY IF EXISTS "Public read projects" ON public.projects;
DROP POLICY IF EXISTS "Only admins can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Admin modify projects" ON public.projects;
CREATE POLICY "Public can view published projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can modify projects" ON public.projects FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Ecosystem (Live columns: id, name, category, features, gallery, updated_at)
ALTER TABLE public.ecosystem ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view ecosystem entities" ON public.ecosystem;
DROP POLICY IF EXISTS "Only admins can manage ecosystem" ON public.ecosystem;
CREATE POLICY "Public can view ecosystem entities" ON public.ecosystem FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Only admins can manage ecosystem" ON public.ecosystem FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. CMS CONTENT TABLES WITH VERIFIED VISIBILITY / ACTIVE FLAGS
-- Matches the EXACT existing column names and data types in the production DB
-- ----------------------------------------------------------------------------

-- Leadership (Verified columns: has both is_active (boolean) AND status (text))
ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published leadership" ON public.leadership;
DROP POLICY IF EXISTS "Public read leadership" ON public.leadership;
DROP POLICY IF EXISTS "Only admins can manage leadership" ON public.leadership;
DROP POLICY IF EXISTS "Admin modify leadership" ON public.leadership;
CREATE POLICY "Public can view published leadership" ON public.leadership FOR SELECT TO anon, authenticated USING (is_active = true AND status = 'published');
CREATE POLICY "Only admins can manage leadership" ON public.leadership FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Services (Verified columns: is_active is boolean; NO status column)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published services" ON public.services;
DROP POLICY IF EXISTS "Public read services" ON public.services;
DROP POLICY IF EXISTS "Only admins can manage services" ON public.services;
DROP POLICY IF EXISTS "Admin modify services" ON public.services;
CREATE POLICY "Public can view published services" ON public.services FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Only admins can manage services" ON public.services FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Solutions (Verified columns: is_active is boolean; NO status column)
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published solutions" ON public.solutions;
DROP POLICY IF EXISTS "Public read solutions" ON public.solutions;
DROP POLICY IF EXISTS "Only admins can manage solutions" ON public.solutions;
DROP POLICY IF EXISTS "Admin modify solutions" ON public.solutions;
CREATE POLICY "Public can view published solutions" ON public.solutions FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Only admins can manage solutions" ON public.solutions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Learning Programs (Verified columns: is_active is boolean; NO status column)
ALTER TABLE public.learning_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published learning programs" ON public.learning_programs;
DROP POLICY IF EXISTS "Only admins can manage learning programs" ON public.learning_programs;
CREATE POLICY "Public can view published learning programs" ON public.learning_programs FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Only admins can manage learning programs" ON public.learning_programs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Blog Posts (Verified columns: is_published is boolean; NO status column)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Only admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Public can view published blog posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Only admins can manage blog posts" ON public.blog_posts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Testimonials (Verified columns: is_active is boolean; NO status column)
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Only admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Public can view published testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Only admins can manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Partners (Verified columns: is_active is boolean; NO status column)
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published partners" ON public.partners;
DROP POLICY IF EXISTS "Only admins can manage partners" ON public.partners;
CREATE POLICY "Public can view published partners" ON public.partners FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Only admins can manage partners" ON public.partners FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Clients (Verified columns: is_active is boolean; NO status column)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published clients" ON public.clients;
DROP POLICY IF EXISTS "Only admins can manage clients" ON public.clients;
CREATE POLICY "Public can view published clients" ON public.clients FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Only admins can manage clients" ON public.clients FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Events (Verified columns: is_active is boolean; NO status column)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view events" ON public.events;
DROP POLICY IF EXISTS "Only admins can manage events" ON public.events;
CREATE POLICY "Public can view events" ON public.events FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Only admins can manage events" ON public.events FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Navigation (Verified columns: is_active is boolean; NO status column)
ALTER TABLE public.navigation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active navigation" ON public.navigation;
DROP POLICY IF EXISTS "Only admins can manage navigation" ON public.navigation;
CREATE POLICY "Public can view active navigation" ON public.navigation FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Only admins can manage navigation" ON public.navigation FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Hackathons (Verified columns: is_registration_open is boolean; metadata stored in faq jsonb; NO top-level status column)
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view hackathons" ON public.hackathons;
DROP POLICY IF EXISTS "Only admins can manage hackathons" ON public.hackathons;
CREATE POLICY "Public can view hackathons" ON public.hackathons FOR SELECT TO anon, authenticated USING ((faq->>'status') IS NULL OR (faq->>'status') <> 'draft');
CREATE POLICY "Only admins can manage hackathons" ON public.hackathons FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. STORAGE BUCKET POLICIES
-- Strict Admin Mutations, Public Read for production buckets
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('site-assets', 'site-assets', true),
  ('avatars', 'avatars', true),
  ('media', 'media', true),
  ('gallery', 'gallery', true),
  ('projects', 'projects', true),
  ('ecosystem', 'ecosystem', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read all assets" ON storage.objects;
CREATE POLICY "Public read all assets" ON storage.objects 
FOR SELECT 
USING (bucket_id IN ('site-assets', 'avatars', 'media', 'gallery', 'projects', 'ecosystem'));

DROP POLICY IF EXISTS "Admin insert all assets" ON storage.objects;
CREATE POLICY "Admin insert all assets" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (
  bucket_id IN ('site-assets', 'avatars', 'media', 'gallery', 'projects', 'ecosystem') 
  AND public.is_admin()
);

DROP POLICY IF EXISTS "Admin update all assets" ON storage.objects;
CREATE POLICY "Admin update all assets" ON storage.objects 
FOR UPDATE TO authenticated 
USING (
  bucket_id IN ('site-assets', 'avatars', 'media', 'gallery', 'projects', 'ecosystem') 
  AND public.is_admin()
);

DROP POLICY IF EXISTS "Admin delete all assets" ON storage.objects;
CREATE POLICY "Admin delete all assets" ON storage.objects 
FOR DELETE TO authenticated 
USING (
  bucket_id IN ('site-assets', 'avatars', 'media', 'gallery', 'projects', 'ecosystem') 
  AND public.is_admin()
);

-- ----------------------------------------------------------------------------
-- 8. SEED & ELEVATE AUTHORIZED ADMIN PROFILES (Idempotent)
-- Authorizes existing Supabase Auth accounts (Gmail & executive emails) as super_admin
-- ----------------------------------------------------------------------------
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
