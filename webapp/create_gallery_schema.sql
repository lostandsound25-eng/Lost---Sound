-- ==========================================
-- Lost & Sound: Travel Mosaic Gallery Schema
-- ==========================================

-- 1. Create the gallery_entries table
CREATE TABLE IF NOT EXISTS public.gallery_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    notes TEXT,
    tags TEXT[] DEFAULT '{}'::text[],
    dominant_color TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on the table
ALTER TABLE public.gallery_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (safeguard)
DROP POLICY IF EXISTS "Allow public read on gallery_entries" ON public.gallery_entries;
DROP POLICY IF EXISTS "Allow admin insert on gallery_entries" ON public.gallery_entries;
DROP POLICY IF EXISTS "Allow admin update on gallery_entries" ON public.gallery_entries;
DROP POLICY IF EXISTS "Allow admin delete on gallery_entries" ON public.gallery_entries;

-- Public read access
CREATE POLICY "Allow public read on gallery_entries" 
ON public.gallery_entries 
FOR SELECT 
USING (true);

-- Authenticated Admin write access (restricts to your account email)
CREATE POLICY "Allow admin insert on gallery_entries" 
ON public.gallery_entries 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.jwt() ->> 'email' = 'lostandsound25@gmail.com');

CREATE POLICY "Allow admin update on gallery_entries" 
ON public.gallery_entries 
FOR UPDATE 
TO authenticated 
USING (auth.jwt() ->> 'email' = 'lostandsound25@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'lostandsound25@gmail.com');

CREATE POLICY "Allow admin delete on gallery_entries" 
ON public.gallery_entries 
FOR DELETE 
TO authenticated 
USING (auth.jwt() ->> 'email' = 'lostandsound25@gmail.com');


-- 2. Setup the public 'gallery' Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery', 'gallery', true) 
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects (usually enabled by default in Supabase)
-- Apply policies for our specific bucket 'gallery'
DROP POLICY IF EXISTS "Allow public read on gallery storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin insert on gallery storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update on gallery storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete on gallery storage" ON storage.objects;

-- Public read access to files
CREATE POLICY "Allow public read on gallery storage" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'gallery');

-- Authenticated Admin write access to files
CREATE POLICY "Allow admin insert on gallery storage" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'gallery' AND (auth.jwt() ->> 'email' = 'lostandsound25@gmail.com'));

CREATE POLICY "Allow admin update on gallery storage" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'gallery' AND (auth.jwt() ->> 'email' = 'lostandsound25@gmail.com'));

CREATE POLICY "Allow admin delete on gallery storage" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'gallery' AND (auth.jwt() ->> 'email' = 'lostandsound25@gmail.com'));
