-- Fix Leadership Table Schema to match Frontend Interface
ALTER TABLE public.leadership 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Safely add display_order if missing
DO  
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leadership' AND column_name='display_order') THEN
    ALTER TABLE public.leadership ADD COLUMN display_order INT NOT NULL DEFAULT 0;
  END IF;
END ;

-- Drop obsolete is_active column if it exists (since frontend uses 'status' now)
DO  
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leadership' AND column_name='is_active') THEN
    ALTER TABLE public.leadership DROP COLUMN is_active;
  END IF;
END ;
