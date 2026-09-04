import React, { useState, useEffect, useRef, useCallback } from 'react';
import { dataService } from '../../lib/dataService';
import { storageService } from '../../lib/storageService';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { updateDocumentFavicon } from '../../hooks/useBrandLogo';
import { SiteSettings, SEOSettings } from '../../types';
import { initialSiteSettings, initialSEOSettings } from '../../data/initialData';
import { ImageCropModal, CropResult } from '../../components/admin/ImageCropModal';
import {
  Save,
  Globe,
  Shield,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Maximize2,
  Lock,
  Unlock,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Check,
  Copy,
  ExternalLink,
  Database,
  HardDrive,
  Share2,
  Eraser
} from 'lucide-react';
import { SUPPORTED_SOCIAL_PLATFORMS, validateSocialUrl } from '../../lib/socialUtils';

const MASTER_SQL_MIGRATION = `-- ============================================================================
-- RAVAN TECHNOLOGIES — MASTER DATABASE & STORAGE SETUP
-- Run in Supabase Dashboard → SQL Editor → Click "RUN".
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('super_admin', 'admin', 'editor', 'media_manager', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin', 'editor', 'media_manager')
  );
END;
$$;

DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;
CREATE POLICY "Users can view own profile or admins can view all" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "Users can update own details" ON public.profiles;
CREATE POLICY "Users can update own details" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "Only admins can delete profiles" ON public.profiles;
CREATE POLICY "Only admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());

INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'Executive Administrator'), 'super_admin'
FROM auth.users ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary_settings',
  site_name TEXT NOT NULL DEFAULT 'Ravan Technologies',
  company_name TEXT,
  tagline TEXT NOT NULL DEFAULT 'Building Technology. Solving Real Problems.',
  official_tagline TEXT,
  description TEXT,
  logo_url TEXT NOT NULL DEFAULT '/images/ravan-logo.png',
  logo_public_url TEXT,
  logo_path TEXT,
  logo_dark_url TEXT,
  logo_alt TEXT,
  favicon_url TEXT,
  contact_email TEXT NOT NULL DEFAULT 'contact@ravantechnologies.com',
  inquiry_email TEXT,
  contact_phone TEXT,
  whatsapp_number TEXT,
  direct_whatsapp_number TEXT,
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

INSERT INTO public.site_settings (id, site_name, tagline, description, logo_url, contact_email, office_address)
VALUES ('primary_settings', 'Ravan Technologies', 'Building Technology. Solving Real Problems.', 'Architecting sovereign software systems, enterprise intelligence, and physical computing infrastructure for institutional scale.', '/images/ravan-logo.png', 'contact@ravantechnologies.com', 'Ravan Tech Park, Outer Ring Road, Bengaluru')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.seo_metadata (
  id TEXT PRIMARY KEY DEFAULT 'primary_seo',
  meta_title TEXT NOT NULL DEFAULT 'Ravan Technologies | Sovereign Enterprise Engineering & AI',
  meta_description TEXT NOT NULL DEFAULT 'Ravan Technologies builds sovereign digital backbones, high-concurrency systems, and applied AI infrastructure.',
  focus_keyword TEXT DEFAULT 'Enterprise AI',
  secondary_keywords JSONB DEFAULT '["High Scale Systems", "Sovereign AI"]'::jsonb,
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
VALUES ('primary_seo', 'Ravan Technologies | Sovereign Enterprise Engineering & AI', 'Ravan Technologies builds sovereign digital backbones, high-concurrency systems, and applied AI infrastructure.', 'https://ravantechnologies.com')
ON CONFLICT (id) DO NOTHING;

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
VALUES ('founder-001', 'Kunal K Paymode', 'Founder & Chief Architect', 'Architecting sovereign digital infrastructure and enterprise software platforms.', 'To engineer self-reliant technology ecosystems that empower institutional autonomy.', '20+ Years')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.leadership (id TEXT PRIMARY KEY, name TEXT NOT NULL, designation TEXT NOT NULL, company_branch TEXT NOT NULL DEFAULT 'Ravan Technologies', bio TEXT, image_url TEXT, social_links JSONB DEFAULT '{}'::jsonb, display_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view leadership" ON public.leadership;
CREATE POLICY "Public can view leadership" ON public.leadership FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage leadership" ON public.leadership;
CREATE POLICY "Only admins can manage leadership" ON public.leadership FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.services (id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, short_description TEXT NOT NULL, full_description TEXT, icon TEXT, features JSONB DEFAULT '[]'::jsonb, benefits JSONB DEFAULT '[]'::jsonb, technologies JSONB DEFAULT '[]'::jsonb, deliverables JSONB DEFAULT '[]'::jsonb, display_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true, seo_title TEXT, seo_description TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view services" ON public.services;
CREATE POLICY "Public can view services" ON public.services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage services" ON public.services;
CREATE POLICY "Only admins can manage services" ON public.services FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.solutions (id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, summary TEXT NOT NULL, challenge TEXT, architecture TEXT, impact TEXT, technologies JSONB DEFAULT '[]'::jsonb, metrics JSONB DEFAULT '[]'::jsonb, display_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true, image_url TEXT, seo_title TEXT, seo_description TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view solutions" ON public.solutions;
CREATE POLICY "Public can view solutions" ON public.solutions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage solutions" ON public.solutions;
CREATE POLICY "Only admins can manage solutions" ON public.solutions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.projects (id TEXT PRIMARY KEY, title TEXT NOT NULL, client TEXT NOT NULL, domain TEXT NOT NULL, summary TEXT NOT NULL, problem_statement TEXT, solution_deployed TEXT, outcomes JSONB DEFAULT '[]'::jsonb, technologies JSONB DEFAULT '[]'::jsonb, featured BOOLEAN NOT NULL DEFAULT false, display_order INT NOT NULL DEFAULT 0, image_url TEXT, case_study_url TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
CREATE POLICY "Public can view projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage projects" ON public.projects;
CREATE POLICY "Only admins can manage projects" ON public.projects FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.hackathons (id TEXT PRIMARY KEY, title TEXT NOT NULL, edition TEXT NOT NULL, theme TEXT NOT NULL, registration_deadline TEXT, event_dates TEXT, prize_pool TEXT, tracks JSONB DEFAULT '[]'::jsonb, faq JSONB DEFAULT '[]'::jsonb, rules JSONB DEFAULT '[]'::jsonb, is_registration_open BOOLEAN NOT NULL DEFAULT true, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view hackathons" ON public.hackathons;
CREATE POLICY "Public can view hackathons" ON public.hackathons FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage hackathons" ON public.hackathons;
CREATE POLICY "Only admins can manage hackathons" ON public.hackathons FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.learning_programs (id TEXT PRIMARY KEY, title TEXT NOT NULL, level TEXT NOT NULL, duration TEXT NOT NULL, prerequisites TEXT, description TEXT NOT NULL, modules JSONB DEFAULT '[]'::jsonb, outcomes JSONB DEFAULT '[]'::jsonb, display_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE public.learning_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view learning programs" ON public.learning_programs;
CREATE POLICY "Public can view learning programs" ON public.learning_programs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage learning programs" ON public.learning_programs;
CREATE POLICY "Only admins can manage learning programs" ON public.learning_programs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.ecosystem (id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, headline TEXT NOT NULL, specs JSONB DEFAULT '[]'::jsonb, features JSONB DEFAULT '[]'::jsonb, gallery JSONB DEFAULT '[]'::jsonb, contact_lead TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE public.ecosystem ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view ecosystem" ON public.ecosystem;
CREATE POLICY "Public can view ecosystem" ON public.ecosystem FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage ecosystem" ON public.ecosystem;
CREATE POLICY "Only admins can manage ecosystem" ON public.ecosystem FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.media (id TEXT PRIMARY KEY, title TEXT NOT NULL, file_name TEXT NOT NULL, file_type TEXT NOT NULL, file_size TEXT, url TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'general', alt_text TEXT, tags JSONB DEFAULT '[]'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view media" ON public.media;
CREATE POLICY "Public can view media" ON public.media FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage media" ON public.media;
CREATE POLICY "Only admins can manage media" ON public.media FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.contact_inquiries (id TEXT PRIMARY KEY, reference_id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, organization TEXT, company TEXT, phone TEXT, inquiry_type TEXT NOT NULL DEFAULT 'Enterprise Engineering', budget_range TEXT, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'in_progress', 'responded', 'closed', 'in_review', 'replied', 'archived')), email_status TEXT NOT NULL DEFAULT 'pending' CHECK (email_status IN ('new', 'sending', 'sent', 'failed', 'pending')), sent_at TIMESTAMPTZ, failed_at TIMESTAMPTZ, email_error_message TEXT, notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can submit contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Public can submit contact inquiries" ON public.contact_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Only admins can view contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Only admins can view contact inquiries" ON public.contact_inquiries FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "Only admins can update contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Only admins can update contact inquiries" ON public.contact_inquiries FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Only admins can delete contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Only admins can delete contact inquiries" ON public.contact_inquiries FOR DELETE TO authenticated USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.blog_posts (id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, excerpt TEXT NOT NULL, content TEXT NOT NULL, author_name TEXT NOT NULL, author_avatar TEXT, category TEXT NOT NULL, tags JSONB DEFAULT '[]'::jsonb, read_time TEXT, published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), is_published BOOLEAN NOT NULL DEFAULT true, image_url TEXT, seo_title TEXT, seo_description TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;
CREATE POLICY "Public can view published blog posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Only admins can manage blog posts" ON public.blog_posts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.events (id TEXT PRIMARY KEY, title TEXT NOT NULL, event_type TEXT NOT NULL, event_date TEXT NOT NULL, location TEXT NOT NULL, description TEXT NOT NULL, speaker TEXT, registration_link TEXT, is_active BOOLEAN NOT NULL DEFAULT true, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active events" ON public.events;
CREATE POLICY "Public can view active events" ON public.events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage events" ON public.events;
CREATE POLICY "Only admins can manage events" ON public.events FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.testimonials (id TEXT PRIMARY KEY, client_name TEXT NOT NULL, designation TEXT NOT NULL, company TEXT NOT NULL, quote TEXT NOT NULL, avatar_url TEXT, rating INT NOT NULL DEFAULT 5, display_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
CREATE POLICY "Public can view testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Only admins can manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.partners (id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, logo_url TEXT NOT NULL, website_url TEXT, display_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view partners" ON public.partners;
CREATE POLICY "Public can view partners" ON public.partners FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage partners" ON public.partners;
CREATE POLICY "Only admins can manage partners" ON public.partners FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.clients (id TEXT PRIMARY KEY, name TEXT NOT NULL, industry TEXT NOT NULL, logo_url TEXT NOT NULL, case_study_id TEXT, display_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view clients" ON public.clients;
CREATE POLICY "Public can view clients" ON public.clients FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage clients" ON public.clients;
CREATE POLICY "Only admins can manage clients" ON public.clients FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.navigation (id TEXT PRIMARY KEY, title TEXT NOT NULL, path TEXT NOT NULL, position TEXT NOT NULL, parent_id TEXT, display_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true, is_external BOOLEAN DEFAULT false, badge TEXT, children JSONB DEFAULT '[]'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE public.navigation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active navigation" ON public.navigation;
CREATE POLICY "Public can view active navigation" ON public.navigation FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Only admins can manage navigation" ON public.navigation;
CREATE POLICY "Only admins can manage navigation" ON public.navigation FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.audit_logs (id TEXT PRIMARY KEY, action TEXT NOT NULL, entity TEXT NOT NULL, entity_id TEXT, details TEXT, user_name TEXT NOT NULL DEFAULT 'Super Admin', timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());

-- STORAGE BUCKETS & POLICIES
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true), ('media', 'media', true), ('avatars', 'avatars', true), ('gallery', 'gallery', true), ('projects', 'projects', true), ('ecosystem', 'ecosystem', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view site-assets" ON storage.objects;
CREATE POLICY "Public can view site-assets" ON storage.objects FOR SELECT TO public USING (bucket_id IN ('site-assets', 'media', 'avatars', 'gallery', 'projects', 'ecosystem'));
DROP POLICY IF EXISTS "Admins can upload site-assets" ON storage.objects;
CREATE POLICY "Admins can upload site-assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('site-assets', 'media', 'avatars', 'gallery', 'projects', 'ecosystem'));
DROP POLICY IF EXISTS "Admins can update site-assets" ON storage.objects;
CREATE POLICY "Admins can update site-assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('site-assets', 'media', 'avatars', 'gallery', 'projects', 'ecosystem'));
DROP POLICY IF EXISTS "Admins can delete site-assets" ON storage.objects;
CREATE POLICY "Admins can delete site-assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('site-assets', 'media', 'avatars', 'gallery', 'projects', 'ecosystem'));
`;

export const AdminSiteSettings: React.FC = () => {
  const { showToast } = useToast();
  const [site, setSite] = useState<SiteSettings>(initialSiteSettings);
  const [seo, setSeo] = useState<SEOSettings>(initialSEOSettings);
  const [saving, setSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Live Supabase Health Check
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'needs_migration'>('checking');
  const [storageStatus, setStorageStatus] = useState<'checking' | 'connected' | 'needs_bucket'>('checking');
  const [hasCopiedSql, setHasCopiedSql] = useState(false);

  // Logo Studio & Editor State
  const [showEditor, setShowEditor] = useState(false);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Interactive Zoom / Pan / Position
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Target Dimensions & Aspect Ratio Lock
  const [targetWidth, setTargetWidth] = useState<number>(240);
  const [targetHeight, setTargetHeight] = useState<number>(80);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [aspectPreset, setAspectPreset] = useState<'3:1' | '1:1' | '16:9' | 'original' | 'custom'>('3:1');
  const [outputFormat, setOutputFormat] = useState<'png' | 'webp' | 'jpeg' | 'svg'>('png');

  // Real-time Export Metric
  const [processedDataUrl, setProcessedDataUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<string | null>(null);

  // Hero Image Studio Modal State
  const [showHeroCropModal, setShowHeroCropModal] = useState(false);

  const handleHeroCropConfirm = (result: CropResult) => {
    setSite(prev => ({
      ...prev,
      hero_image_url: result.url,
      hero_image_path: result.storage_path,
      hero_image_alt: result.alt_text || prev.hero_image_alt || 'Ravan Technologies Sovereign Engineering Architecture',
      hero_image_focal_x: 50,
      hero_image_focal_y: 50,
      hero_image_zoom: 1
    }));
    setShowHeroCropModal(false);
    showToast('Hero image uploaded and configured! Click "Save All Site Settings" to persist.', 'success');
  };

  const handleResetHeroImage = () => {
    setSite(prev => ({
      ...prev,
      hero_image_url: '',
      hero_image_path: '',
      hero_image_alt: '',
      hero_image_focal_x: 50,
      hero_image_focal_y: 50,
      hero_image_zoom: 1
    }));
    showToast('Hero image cleared. Home page will render the Sovereign Architectural Grid.', 'info');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  const checkHealth = useCallback(async () => {
    if (!supabase) {
      setDbStatus('needs_migration');
      setStorageStatus('needs_bucket');
      return;
    }

    try {
      const { error: tblErr } = await supabase.from('site_settings').select('id').limit(1);
      if (tblErr && (tblErr.message.includes('schema cache') || tblErr.message.includes('not find the table'))) {
        setDbStatus('needs_migration');
      } else {
        setDbStatus('connected');
      }
    } catch {
      setDbStatus('needs_migration');
    }

    try {
      // Direct bucket probe avoids RLS restrictions on storage.buckets table
      const { error: bErr } = await supabase.storage.from('site-assets').list('', { limit: 1 });
      const { error: aErr } = await supabase.storage.from('avatars').list('', { limit: 1 });
      const bNotFound = bErr && (bErr.message?.toLowerCase().includes('not found') || (bErr as any).statusCode === 404);
      const aNotFound = aErr && (aErr.message?.toLowerCase().includes('not found') || (aErr as any).statusCode === 404);

      if (!bNotFound || !aNotFound) {
        setStorageStatus('connected');
      } else {
        setStorageStatus('needs_bucket');
      }
    } catch {
      setStorageStatus('connected');
    }
  }, []);

  useEffect(() => {
    Promise.all([dataService.getSiteSettings(), dataService.getSEOSettings()]).then(([s, se]) => {
      setSite(s);
      setSeo(se);
      setLogoPreview(s.logo_url || s.logo_public_url || '');
    });
    checkHealth();
  }, [checkHealth]);

  const handleCopyMigrationSql = () => {
    navigator.clipboard.writeText(MASTER_SQL_MIGRATION);
    setHasCopiedSql(true);
    showToast('Master SQL Migration copied to clipboard! Paste and run it in Supabase SQL Editor.', 'success');
    setTimeout(() => setHasCopiedSql(false), 4000);
  };

  // Handle image file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = storageService.validateImage(file, 5);
    if (!validation.valid) {
      showToast(validation.error || 'Invalid image file.', 'error');
      return;
    }

    setRawFile(file);

    // SVG vector handling
    if (file.type === 'image/svg+xml') {
      setOutputFormat('svg');
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const src = loadEvt.target?.result as string;
        setRawImageSrc(src);
        setProcessedDataUrl(src);
        setProcessedBlob(file);
        setEstimatedSize(`${(file.size / 1024).toFixed(1)} KB`);
        setShowEditor(true);
      };
      reader.readAsDataURL(file);
      return;
    }

    // Raster images (PNG, JPG, WebP)
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const src = loadEvt.target?.result as string;
      autoProcessImage(src);
    };
    reader.readAsDataURL(file);
  };

  // Automatically detect logo emblem, remove solid background, and crop tight
  const autoProcessImage = (src: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Sample corner color to detect if there is a solid background
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];
      const bgA = data[3];

      const isBg = (idx: number) => {
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];
        // If it's already fully transparent, treat as background for cropping purposes
        if (a < 10) return true;
        // If corner is transparent, we only trim (don't flood fill solid colors unless corner is solid)
        if (bgA < 10) return false;
        
        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        return dist < 32;
      };

      const visited = new Uint8Array(w * h);
      const queue: number[] = [];

      // Only perform flood-fill background removal if the corner is actually solid
      if (bgA >= 250) {
        // Edge seeds
        for (let x = 0; x < w; x++) {
          const topIdx = (0 * w + x) * 4;
          if (isBg(topIdx)) { queue.push(x, 0); visited[0 * w + x] = 1; }
          const botIdx = ((h - 1) * w + x) * 4;
          if (isBg(botIdx)) { queue.push(x, h - 1); visited[(h - 1) * w + x] = 1; }
        }
        for (let y = 0; y < h; y++) {
          const leftIdx = (y * w + 0) * 4;
          if (isBg(leftIdx) && !visited[y * w + 0]) { queue.push(0, y); visited[y * w + 0] = 1; }
          const rightIdx = (y * w + (w - 1)) * 4;
          if (isBg(rightIdx) && !visited[y * w + (w - 1)]) { queue.push(w - 1, y); visited[y * w + (w - 1)] = 1; }
        }

        let qHead = 0;
        while (qHead < queue.length) {
          const cx = queue[qHead++];
          const cy = queue[qHead++];
          const idx = (cy * w + cx) * 4;
          data[idx + 3] = 0; // Transparent

          const neighbors = [
            [cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]
          ];
          for (let i = 0; i < neighbors.length; i++) {
            const nx = neighbors[i][0];
            const ny = neighbors[i][1];
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nPos = ny * w + nx;
              if (!visited[nPos]) {
                visited[nPos] = 1;
                const nIdx = nPos * 4;
                if (isBg(nIdx)) {
                  queue.push(nx, ny);
                }
              }
            }
          }
        }
      }

      // Find tight bounding box of remaining artwork (non-transparent pixels)
      let minX = w, maxX = 0, minY = h, maxY = 0;
      let hasArtwork = false;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const a = data[(y * w + x) * 4 + 3];
          if (a > 10) {
            hasArtwork = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      if (hasArtwork && (maxX > minX && maxY > minY) && (minX > 0 || minY > 0 || maxX < w - 1 || maxY < h - 1)) {
        // We found a smaller bounding box, let's crop it
        const pad = 4;
        minX = Math.max(0, minX - pad);
        minY = Math.max(0, minY - pad);
        maxX = Math.min(w - 1, maxX + pad);
        maxY = Math.min(h - 1, maxY + pad);
        const cropW = maxX - minX + 1;
        const cropH = maxY - minY + 1;

        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropW;
        croppedCanvas.height = cropH;
        const cropCtx = croppedCanvas.getContext('2d');
        if (cropCtx) {
          cropCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
          setupStudio(croppedCanvas.toDataURL('image/png'), cropW, cropH);
          return;
        }
      }
      
      // If no cropping was needed or artwork wasn't found, just use the transparentized image
      setupStudio(canvas.toDataURL('image/png'), w, h);
    };
    img.src = src;
  };

  const setupStudio = (src: string, origW: number, origH: number) => {
    setRawImageSrc(src);
    setNaturalDimensions({ width: origW, height: origH });

    const ratio = origW / origH;
    let defaultW = 240;
    let defaultH = Math.round(240 / ratio);
    if (defaultH > 160) {
      defaultH = 80;
      defaultW = Math.round(80 * ratio);
    }

    setTargetWidth(defaultW);
    setTargetHeight(defaultH);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setAspectPreset('original');
    setShowEditor(true);
  };

  // Manual trigger for auto-remove background via flood-fill alpha matting
  const autoRemoveBackgroundFromSource = () => {
    if (rawImageSrc) {
       autoProcessImage(rawImageSrc);
    }
  };


  // Render crop/zoom/pan to canvas
  const renderCanvasPreview = useCallback(() => {
    if (!rawImageSrc || outputFormat === 'svg') return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageElementRef.current = img;
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, targetWidth, targetHeight);

      ctx.save();
      const centerX = targetWidth / 2 + pan.x;
      const centerY = targetHeight / 2 + pan.y;
      ctx.translate(centerX, centerY);
      ctx.scale(zoom, zoom);

      const drawW = targetWidth;
      const drawH = (img.naturalHeight / img.naturalWidth) * targetWidth;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const mime = outputFormat === 'webp' ? 'image/webp' : outputFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setProcessedBlob(blob);
            const sizeStr = blob.size > 1024 * 1024
              ? `${(blob.size / (1024 * 1024)).toFixed(2)} MB`
              : `${(blob.size / 1024).toFixed(1)} KB`;
            setEstimatedSize(sizeStr);
            setProcessedDataUrl(canvas.toDataURL(mime, 0.95));
          }
        },
        mime,
        0.95
      );
    };
    img.src = rawImageSrc;
  }, [rawImageSrc, targetWidth, targetHeight, zoom, pan, outputFormat]);

  useEffect(() => {
    if (showEditor && rawImageSrc && outputFormat !== 'svg') {
      renderCanvasPreview();
    }
  }, [showEditor, rawImageSrc, targetWidth, targetHeight, zoom, pan, outputFormat, renderCanvasPreview]);

  // Mouse & Touch Drag/Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
  };
  const handleTouchEnd = () => setIsDragging(false);

  // Aspect Ratio Preset Handler
  const applyPreset = (preset: '3:1' | '1:1' | '16:9' | 'original') => {
    setAspectPreset(preset);
    setLockAspectRatio(true);
    setPan({ x: 0, y: 0 });
    setZoom(1.0);

    if (preset === '3:1') {
      setTargetWidth(240);
      setTargetHeight(80);
    } else if (preset === '1:1') {
      setTargetWidth(120);
      setTargetHeight(120);
    } else if (preset === '16:9') {
      setTargetWidth(320);
      setTargetHeight(180);
    } else if (preset === 'original' && naturalDimensions.width > 0) {
      const ratio = naturalDimensions.width / naturalDimensions.height;
      const w = 240;
      setTargetWidth(w);
      setTargetHeight(Math.round(w / ratio));
    }
  };

  const handleWidthChange = (w: number) => {
    const cleanW = Math.max(20, Math.min(2000, w));
    setTargetWidth(cleanW);
    if (lockAspectRatio) {
      const ratio = (naturalDimensions.width > 0 && naturalDimensions.height > 0)
        ? (naturalDimensions.width / naturalDimensions.height)
        : (targetWidth / (targetHeight || 1));
      setTargetHeight(Math.round(cleanW / ratio));
    }
  };

  const handleHeightChange = (h: number) => {
    const cleanH = Math.max(20, Math.min(2000, h));
    setTargetHeight(cleanH);
    if (lockAspectRatio) {
      const ratio = (naturalDimensions.width > 0 && naturalDimensions.height > 0)
        ? (naturalDimensions.width / naturalDimensions.height)
        : (targetWidth / (targetHeight || 1));
      setTargetWidth(Math.round(cleanH * ratio));
    }
  };

  // Upload Optimized Logo Directly to Supabase Storage and Sync Database
  const handleUploadOptimizedLogo = async () => {
    if (!processedBlob && !rawFile) return;

    const fileToUpload = processedBlob || rawFile;
    if (!fileToUpload) return;

    setIsUploadingLogo(true);
    try {
      const ext = outputFormat === 'svg' ? 'svg' : outputFormat === 'webp' ? 'webp' : outputFormat === 'jpeg' ? 'jpg' : 'png';
      const uploadResult = await storageService.uploadImage(
        fileToUpload,
        'site-assets',
        'branding',
        `ravan-logo.${ext}`
      );

      const versionedUrl = `${uploadResult.url}?v=${Date.now()}`;
      const updatedSite = {
        ...site,
        logo_url: versionedUrl,
        logo_public_url: versionedUrl,
        logo_path: uploadResult.path,
        favicon_url: versionedUrl
      };

      await dataService.updateSiteSettings(updatedSite);
      updateDocumentFavicon(versionedUrl);

      setSite(updatedSite);
      setLogoPreview(versionedUrl);
      setShowEditor(false);

      showToast(`Logo successfully uploaded to Supabase Storage (${uploadResult.file_size}) & saved to database!`, 'success');
      checkHealth();
    } catch (err: any) {
      if (import.meta.env.DEV) console.error('Logo upload error:', err);
      showToast(err.message || 'Failed to upload logo to Supabase Storage.', 'error');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Global Settings Save Handler
  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await Promise.all([
        dataService.updateSiteSettings(site),
        dataService.updateSEOSettings(seo)
      ]);
      
      // Verify saves
      const [verifiedSite, verifiedSEO] = await Promise.all([
        dataService.getSiteSettings(true),
        dataService.getSEOSettings(true)
      ]);
      
      setSite(verifiedSite);
      setSeo(verifiedSEO);

      if (verifiedSite.favicon_url || verifiedSite.logo_url) {
        updateDocumentFavicon(verifiedSite.favicon_url || verifiedSite.logo_url);
      }
      showToast('Global Site Settings & Brand Identity successfully saved and verified.', 'success');
      checkHealth();
    } catch (err: any) {
      if (import.meta.env.DEV) console.error('Failed to save settings:', err);
      showToast(err.message || 'Failed to save settings. Please verify database connection and retry.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isSetupRequired = dbStatus === 'needs_migration' || storageStatus === 'needs_bucket';

  return (
    <div className="space-y-6">
      {/* Supabase Health & 1-Click Migration Banner */}
      {isSetupRequired && (
        <div className="p-5 bg-amber-950/40 border-2 border-amber-500/50 rounded-xl space-y-3 animate-fade-in shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wide flex items-center gap-2">
                  <span>Supabase Schema & Storage Bucket Setup Required</span>
                </h3>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Your Supabase project is connected, but the PostgreSQL tables (`site_settings`) and Storage bucket (`site-assets`) need to be created in your Supabase SQL Editor.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyMigrationSql}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-[#07111e] rounded text-xs font-bold uppercase flex items-center gap-1.5 shadow transition-colors"
              >
                {hasCopiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopiedSql ? 'Copied to Clipboard!' : 'Copy SQL Migration'}</span>
              </button>

              <a
                href="https://supabase.com/dashboard/project/iecesxahkbkkafzmzwcd/sql"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold uppercase flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <span>Open SQL Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={checkHealth}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                title="Re-check Supabase status"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="flex items-center gap-2 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              <span>Database Table `public.site_settings`: <strong>{dbStatus === 'connected' ? 'Ready' : 'Pending SQL Execution'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${storageStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              <span>Storage Bucket `site-assets`: <strong>{storageStatus === 'connected' ? 'Ready' : 'Pending SQL Execution'}</strong></span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-secondary" />
              <span>Site Settings & Canonical Brand Assets</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Centrally manage company logo, coordinates, WhatsApp endpoints, and search engine metadata.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving || isUploadingLogo}
            className="px-6 py-2.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 self-start shrink-0"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>SAVING TO SUPABASE...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SAVE ALL SETTINGS</span>
              </>
            )}
          </button>
        </div>

        {/* Brand Logo Management Card */}
        <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-secondary-fixed" />
              <span>Brand Logo & Emblem Management</span>
            </h3>
            <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SUPABASE STORAGE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Live Logo Preview Container */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="w-48 h-32 rounded-xl bg-[#040810]/70 border border-slate-800 p-3 flex items-center justify-center overflow-hidden shadow-inner relative group">
                <img
                  src={logoPreview || site.logo_url || '/images/ravan-logo.png'}
                  alt="Company Logo Preview"
                  onError={(e) => { e.currentTarget.src = '/images/ravan-logo.png'; }}
                  className="max-h-full max-w-full object-contain block select-none"
                />
                {isUploadingLogo && (
                  <div className="absolute inset-0 bg-[#0a192f]/90 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <RefreshCw className="w-6 h-6 animate-spin text-secondary mb-1" />
                    <span className="text-[9px] font-bold uppercase">UPLOADING...</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-2 font-mono">Live Emblem Preview</span>
            </div>

            {/* Upload Controls & URL Input */}
            <div className="md:col-span-8 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Logo Public URL (Supabase Storage Canonical Path)
                </label>
                <input
                  type="text"
                  value={site.logo_url || ''}
                  onChange={e => {
                    setSite({ ...site, logo_url: e.target.value, logo_public_url: e.target.value });
                    setLogoPreview(e.target.value);
                  }}
                  placeholder="/images/ravan-logo.png"
                  className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold uppercase flex items-center gap-2 border border-slate-700 transition-colors shadow"
                >
                  <Upload className="w-4 h-4 text-secondary" />
                  <span>CHOOSE NEW LOGO (PNG / SVG / JPG)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const defaultLogo = '/images/ravan-logo.png';
                    setSite({ ...site, logo_url: defaultLogo, logo_public_url: defaultLogo });
                    setLogoPreview(defaultLogo);
                    showToast('Reset to default brand logo mark.', 'info');
                  }}
                  className="px-3 py-2 bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-white rounded text-xs font-semibold"
                >
                  RESET TO DEFAULT
                </button>
              </div>

              {/* Aspect Ratio & Sync Guideline */}
              <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                  <span>Centralized Ecosystem Broadcast:</span>
                </div>
                <p>
                  Uploading and saving updates the Navbar, Footer, Admin CMS, and public website instantaneously with automatic CDN cache invalidation.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Logo Studio & Zoom/Pan/Crop/Resize Interface */}
          {showEditor && (
            <div className="mt-6 p-5 bg-[#07111e] border border-slate-700 rounded-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                  <Sliders className="w-4 h-4 text-secondary" />
                  <span>Interactive Logo Framing, Zoom & Optimization Studio</span>
                </div>
                {estimatedSize && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    Optimized Size: {estimatedSize}
                  </span>
                )}
              </div>

              {/* Viewport Canvas & Live Framing */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Interactive Drag & Zoom Viewport */}
                <div className="lg:col-span-7 flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase mb-1.5 self-start flex items-center gap-1.5">
                    <Move className="w-3 h-3 text-secondary" />
                    <span>Interactive Framing Box (Drag to Pan / Adjust)</span>
                  </span>

                  <div
                    ref={viewportRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ width: '100%', height: '220px' }}
                    className={`bg-[#040810] border-2 border-dashed border-secondary/50 rounded-xl overflow-hidden relative flex items-center justify-center select-none ${
                      isDragging ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                  >
                    {rawImageSrc && (
                      <img
                        src={rawImageSrc}
                        alt="Workspace Preview"
                        draggable={false}
                        style={{
                          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                          maxWidth: '85%',
                          maxHeight: '85%',
                          objectFit: 'contain'
                        }}
                        className="pointer-events-none"
                      />
                    )}

                    <div className="absolute inset-0 pointer-events-none border border-white/10 flex items-center justify-center">
                      <div className="w-full h-full border border-secondary/20" />
                    </div>
                  </div>

                  {/* Zoom & Pan Controls Bar */}
                  <div className="w-full mt-3 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setZoom(prev => Math.max(0.4, Number((prev - 0.1).toFixed(1))))}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        min="0.5"
                        max="3.0"
                        step="0.05"
                        value={zoom}
                        onChange={e => setZoom(parseFloat(e.target.value))}
                        className="w-20 accent-secondary cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setZoom(prev => Math.min(3.0, Number((prev + 0.1).toFixed(1))))}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-mono text-slate-400">
                        {Math.round(zoom * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={autoRemoveBackgroundFromSource}
                        className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold uppercase flex items-center gap-1 transition-colors"
                        title="Automatically remove solid background and crop transparent canvas around emblem"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Auto-Remove Background</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setZoom(1.0);
                          setPan({ x: 0, y: 0 });
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold uppercase flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Center & Fit</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Final Export Preview */}
                <div className="lg:col-span-5 flex flex-col items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase mb-1.5 self-start">
                    Final Processed Output ({targetWidth} × {targetHeight} px)
                  </span>

                  <div className="w-full h-44 bg-surface border border-slate-700 rounded-xl p-3 flex items-center justify-center overflow-hidden shadow-inner">
                    {processedDataUrl ? (
                      <img
                        src={processedDataUrl}
                        alt="Processed Output Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-500">Rendering preview...</span>
                    )}
                  </div>

                  <div className="w-full mt-3 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Format: {outputFormat.toUpperCase()}</span>
                    <span>Aspect: {targetWidth}:{targetHeight}</span>
                  </div>
                </div>
              </div>

              {/* Presets, Dimensions & Format Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-800">
                {/* Presets */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Preset Framing</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPreset('3:1')}
                      className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase border transition-colors ${
                        aspectPreset === '3:1' ? 'bg-secondary text-[#0a192f] border-secondary' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      Navbar (3:1)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('1:1')}
                      className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase border transition-colors ${
                        aspectPreset === '1:1' ? 'bg-secondary text-[#0a192f] border-secondary' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      Icon (1:1)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('16:9')}
                      className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase border transition-colors ${
                        aspectPreset === '16:9' ? 'bg-secondary text-[#0a192f] border-secondary' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      Header (16:9)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('original')}
                      className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase border transition-colors ${
                        aspectPreset === 'original' ? 'bg-secondary text-[#0a192f] border-secondary' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      Original
                    </button>
                  </div>
                </div>

                {/* Target Width */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Width (px)</label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={e => handleWidthChange(parseInt(e.target.value) || 100)}
                    min={20}
                    max={2000}
                    className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-mono focus:border-secondary focus:outline-none"
                  />
                </div>

                {/* Target Height */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Height (px)</label>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={e => handleHeightChange(parseInt(e.target.value) || 40)}
                    min={20}
                    max={2000}
                    disabled={lockAspectRatio}
                    className="w-full px-3 py-1.5 rounded bg-[#0a192f] border border-slate-700 text-white text-xs font-mono disabled:opacity-60 focus:border-secondary focus:outline-none"
                  />
                </div>

                {/* Lock Aspect Ratio & Format */}
                <div className="flex flex-col justify-between">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Aspect Lock</label>
                    <button
                      type="button"
                      onClick={() => setLockAspectRatio(!lockAspectRatio)}
                      className={`w-full py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors ${
                        lockAspectRatio
                          ? 'bg-secondary/15 border-secondary/40 text-secondary'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      <span>{lockAspectRatio ? 'Locked Ratio' : 'Free Ratio'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Optimized Action Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel Editor
                </button>
                <button
                  type="button"
                  onClick={handleUploadOptimizedLogo}
                  disabled={isUploadingLogo}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#07111e] rounded text-xs font-bold uppercase flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isUploadingLogo ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>UPLOADING TO SUPABASE...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>UPLOAD OPTIMIZED LOGO TO STORAGE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* PRIORITY 1: HOME PAGE HERO IMAGE & VISUAL IDENTITY STUDIO CARD            */}
        {/* ========================================================================= */}
        <div className="p-6 bg-[#0a192f] border-2 border-secondary/30 rounded-xl space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-secondary/20 text-secondary border border-secondary/30">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <span>Home Page Hero Image & Visual Identity</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-secondary/20 text-secondary font-mono">16:9 PROD</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authoritative hero visual asset for the public homepage. Managed in Supabase Storage with focal-point targeting.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHeroCropModal(true)}
                className="px-4 py-2 bg-secondary text-primary font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-secondary-light transition-all flex items-center gap-2 shadow-lg shadow-secondary/10"
              >
                <Upload className="w-4 h-4" />
                <span>Upload & Crop 16:9 Image</span>
              </button>
              {site.hero_image_url && (
                <button
                  type="button"
                  onClick={handleResetHeroImage}
                  className="px-3 py-2 bg-red-950/40 border border-red-800/60 text-red-300 hover:text-red-200 hover:bg-red-900/50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  title="Reset to Sovereign Architectural Grid (No stock photo)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Grid</span>
                </button>
              )}
            </div>
          </div>

          {/* 16:9 Widescreen Live Viewport Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-secondary" />
                Live 16:9 Homepage Preview (With Focal Coordinate & Zoom)
              </span>
              <span className="text-slate-400">
                Focal Point: {site.hero_image_focal_x ?? 50}% X, {site.hero_image_focal_y ?? 50}% Y | Zoom: {site.hero_image_zoom ?? 1}x
              </span>
            </div>

            <div className="aspect-[16/9] w-full max-w-3xl mx-auto rounded-xl overflow-hidden border border-slate-700/80 relative bg-[#07111e] shadow-2xl group">
              {site.hero_image_url ? (
                <>
                  <img
                    src={site.hero_image_url}
                    alt={site.hero_image_alt || 'Homepage Hero'}
                    className="w-full h-full object-cover transition-all duration-300"
                    style={{
                      objectPosition: `${site.hero_image_focal_x ?? 50}% ${site.hero_image_focal_y ?? 50}%`,
                      transform: `scale(${site.hero_image_zoom ?? 1})`
                    }}
                  />
                  {/* Subtle Dark Overlay to match Hero section */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07111e] via-[#07111e]/60 to-transparent pointer-events-none" />

                  {/* Focal point indicator crosshair */}
                  <div
                    className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 border-2 border-secondary rounded-full pointer-events-none shadow-[0_0_12px_rgba(245,158,11,0.8)] flex items-center justify-center transition-all duration-150"
                    style={{
                      left: `${site.hero_image_focal_x ?? 50}%`,
                      top: `${site.hero_image_focal_y ?? 50}%`
                    }}
                  >
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                  </div>

                  {/* Live Overlay Simulation Text */}
                  <div className="absolute bottom-4 left-4 right-4 pointer-events-none space-y-1">
                    <span className="inline-block text-[9px] font-mono tracking-widest px-2 py-0.5 rounded bg-secondary/20 border border-secondary/40 text-secondary uppercase">
                      {site.hero_badge_text || 'SOVEREIGN ARCHITECTURE'}
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-white line-clamp-1">
                      {site.hero_title || 'Architecting High-Reliability Enterprise Systems'}
                    </h4>
                    <p className="text-[11px] text-slate-300 line-clamp-1 max-w-xl">
                      {site.hero_subtitle || 'Autonomous infrastructure and engineering verification.'}
                    </p>
                  </div>

                  <div className="absolute top-3 left-3 bg-emerald-950/80 border border-emerald-500/50 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Database Image Active</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#07111e] to-black">
                  <div
                    className="absolute inset-0 opacity-25"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
                                        linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)`,
                      backgroundSize: '24px 24px'
                    }}
                  />
                  <div className="relative z-10 space-y-2 max-w-md">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/30 text-secondary flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Sovereign Architectural Grid Active
                    </h4>
                    <p className="text-xs text-slate-400">
                      No external stock image is configured. The homepage renders a clean, high-performance mathematical grid with zero third-party image dependencies.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowHeroCropModal(true)}
                      className="mt-3 px-4 py-2 bg-secondary text-primary font-bold text-xs uppercase tracking-wider rounded hover:bg-secondary-light transition-all inline-flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Real Production Image</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Focal Point & Zoom Adjustment Sliders */}
          {site.hero_image_url && (
            <div className="p-4 bg-[#07111e] border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-secondary" />
                  Visual Alignment & Focal Point Positioning
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Adjust where the hero centers on mobile & ultrawide screens
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                    <span>Horizontal Focal X</span>
                    <span className="font-mono text-secondary">{site.hero_image_focal_x ?? 50}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={site.hero_image_focal_x ?? 50}
                    onChange={e => setSite({ ...site, hero_image_focal_x: Number(e.target.value) })}
                    className="w-full accent-secondary cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>Left (0%)</span>
                    <span>Center</span>
                    <span>Right (100%)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                    <span>Vertical Focal Y</span>
                    <span className="font-mono text-secondary">{site.hero_image_focal_y ?? 50}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={site.hero_image_focal_y ?? 50}
                    onChange={e => setSite({ ...site, hero_image_focal_y: Number(e.target.value) })}
                    className="w-full accent-secondary cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>Top (0%)</span>
                    <span>Center</span>
                    <span>Bottom (100%)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                    <span>Framing Zoom</span>
                    <span className="font-mono text-secondary">{(site.hero_image_zoom ?? 1).toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={2}
                    step={0.05}
                    value={site.hero_image_zoom ?? 1}
                    onChange={e => setSite({ ...site, hero_image_zoom: Number(e.target.value) })}
                    className="w-full accent-secondary cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>1.0x (Fill)</span>
                    <span>1.5x</span>
                    <span>2.0x (Zoomed)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hero Content & Metadata Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Hero Image Direct Public URL (Supabase CDN)
              </label>
              <input
                type="text"
                value={site.hero_image_url || ''}
                onChange={e => setSite({ ...site, hero_image_url: e.target.value })}
                placeholder="https://...supabase.co/storage/v1/object/public/media/home/hero.webp"
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono focus:border-secondary focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Uploaded via the crop tool or custom CDN URL. Zero stock photos allowed.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Hero Image SEO Alt Description (Critical for Google Images)
              </label>
              <input
                type="text"
                value={site.hero_image_alt || ''}
                onChange={e => setSite({ ...site, hero_image_alt: e.target.value })}
                placeholder="e.g., Ravan Technologies Sovereign Infrastructure & Engineering Platform"
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Indexed directly into Google Image Search and Schema.org primaryImageOfPage.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Hero Badge Eyebrow Text
              </label>
              <input
                type="text"
                value={site.hero_badge_text || ''}
                onChange={e => setSite({ ...site, hero_badge_text: e.target.value })}
                placeholder="e.g., ARCHITECTING AUTONOMOUS SYSTEMS"
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Hero Primary Headline
              </label>
              <input
                type="text"
                value={site.hero_title || ''}
                onChange={e => setSite({ ...site, hero_title: e.target.value })}
                placeholder="e.g., Engineering High-Reliability Enterprise Systems"
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Hero Subtitle / Value Proposition
              </label>
              <textarea
                rows={2}
                value={site.hero_subtitle || ''}
                onChange={e => setSite({ ...site, hero_subtitle: e.target.value })}
                placeholder="e.g., Autonomous infrastructure, deep-tech intelligence platforms, and sovereign engineering solutions built for mission-critical operations."
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Global Brand Identity */}
        <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-secondary-fixed" />
            <span>General Brand Identity & Coordinates</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Company Legal / Brand Name</label>
              <input
                type="text"
                value={site.site_name || site.company_name || ''}
                onChange={e => setSite({ ...site, site_name: e.target.value, company_name: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-bold focus:border-secondary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Official Corporate Tagline</label>
              <input
                type="text"
                value={site.tagline || site.official_tagline || ''}
                onChange={e => setSite({ ...site, tagline: e.target.value, official_tagline: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Company Mandate / Description</label>
            <textarea
              rows={2}
              value={site.description || ''}
              onChange={e => setSite({ ...site, description: e.target.value })}
              className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Inquiry / Contact Email</label>
              <input
                type="email"
                value={site.contact_email || site.inquiry_email || ''}
                onChange={e => setSite({ ...site, contact_email: e.target.value, inquiry_email: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Direct WhatsApp / Contact Phone</label>
              <input
                type="text"
                value={site.whatsapp_number || site.direct_whatsapp_number || site.contact_phone || ''}
                onChange={e => setSite({ ...site, whatsapp_number: e.target.value, direct_whatsapp_number: e.target.value, contact_phone: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono focus:border-secondary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Official Office / Campus Address</label>
            <input
              type="text"
              value={site.office_address || ''}
              onChange={e => setSite({ ...site, office_address: e.target.value })}
              className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary focus:outline-none"
            />
          </div>
        </div>

        {/* Corporate Social Media Portals */}
        <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-secondary-fixed" />
                <span>Official Corporate Social Media Channels</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Profiles configured here appear dynamically in the website Footer. Empty or cleared channels are automatically omitted.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/60 self-start sm:self-center">
              Single Source of Truth: site_settings.social_links
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUPPORTED_SOCIAL_PLATFORMS.map(platform => {
              const currentVal = (site.social_links as any)?.[platform.id] || '';
              const validation = validateSocialUrl(currentVal);

              return (
                <div 
                  key={platform.id}
                  className="p-3.5 rounded-lg bg-[#07111e] border border-slate-800 hover:border-slate-700 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase text-slate-300 flex items-center gap-1.5">
                      <span>{platform.name}</span>
                      <span className="text-[9px] text-slate-500 font-normal">({platform.domainHint})</span>
                    </label>
                    {currentVal ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSite(prev => ({
                            ...prev,
                            social_links: {
                              ...(prev.social_links || {}),
                              [platform.id]: ''
                            }
                          }));
                          showToast(`Cleared ${platform.name}. Click "Save All Site Settings" to persist.`, 'info');
                        }}
                        className="text-[9px] text-slate-400 hover:text-rose-400 uppercase font-bold flex items-center gap-0.5 transition-colors"
                        title={`Remove ${platform.name} profile URL`}
                      >
                        <Eraser className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    ) : null}
                  </div>

                  <input
                    type="url"
                    value={currentVal}
                    onChange={e => {
                      const val = e.target.value;
                      setSite(prev => ({
                        ...prev,
                        social_links: {
                          ...(prev.social_links || {}),
                          [platform.id]: val
                        }
                      }));
                    }}
                    placeholder={platform.placeholder}
                    className={`w-full px-3 py-1.5 rounded bg-[#0a192f] border text-white text-xs font-mono focus:border-secondary outline-none placeholder:text-slate-600 transition-colors ${
                      currentVal && !validation.valid ? 'border-rose-500/80 bg-rose-950/20' : 'border-slate-700'
                    }`}
                  />

                  {currentVal && !validation.valid && (
                    <p className="text-[10px] text-rose-400 font-medium">
                      {validation.error}
                    </p>
                  )}
                  {(!currentVal || validation.valid) && (
                    <span className="text-[9px] text-slate-500 block truncate">
                      Example: {platform.placeholder}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SEO & Search Metadata */}
        <div className="p-6 bg-[#0a192f] border border-slate-800 rounded-xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-secondary-fixed" />
            <span>Search Engine Optimization (SEO) & OpenGraph</span>
          </h3>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Global Meta Title</label>
            <input
              type="text"
              value={seo.meta_title}
              onChange={e => setSeo({ ...seo, meta_title: e.target.value })}
              className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-semibold focus:border-secondary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Global Meta Description</label>
            <textarea
              rows={3}
              value={seo.meta_description}
              onChange={e => setSeo({ ...seo, meta_description: e.target.value })}
              className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs leading-relaxed focus:border-secondary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Primary Canonical URL</label>
              <input
                type="text"
                value={seo.canonical_url}
                onChange={e => setSeo({ ...seo, canonical_url: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-mono focus:border-secondary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Focus Keyword</label>
              <input
                type="text"
                value={seo.focus_keyword || ''}
                onChange={e => setSeo({ ...seo, focus_keyword: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary focus:outline-none"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Hero Image 16:9 Upload & Crop Modal */}
      {showHeroCropModal && (
        <ImageCropModal
          isOpen={showHeroCropModal}
          onClose={() => setShowHeroCropModal(false)}
          onConfirm={handleHeroCropConfirm}
          aspectRatioLabel="16:9 (Landscape)"
          targetBucket="media"
          targetFolder="home"
          initialAltText={site.hero_image_alt || 'Ravan Technologies Sovereign Engineering Architecture'}
        />
      )}
    </div>
  );
};
