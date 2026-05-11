-- Run this in your Supabase SQL Editor to set up the database for Lost & Sound

-- 1. Create the 'itineraries' table
CREATE TABLE public.itineraries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  destination text NOT NULL,
  duration_days integer,
  hero_image_url text,
  description text,
  content jsonb, -- Storing the day-by-day blocks or rich text
  is_published boolean DEFAULT false,
  author_id uuid REFERENCES auth.users(id)
);

-- 2. Create the 'leads' table for "Keep in Touch"
CREATE TABLE public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  email text NOT NULL UNIQUE,
  source text DEFAULT 'Keep in Touch Footer'
);

-- 3. Set up Row Level Security (RLS)

-- Enable RLS on itineraries
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published itineraries
CREATE POLICY "Public can view published itineraries" 
ON public.itineraries FOR SELECT 
USING (is_published = true);

-- Allow authenticated admins full access to itineraries
CREATE POLICY "Admins can manage itineraries" 
ON public.itineraries FOR ALL 
USING (auth.role() = 'authenticated');

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow public to insert leads (anyone can sign up)
CREATE POLICY "Public can insert leads" 
ON public.leads FOR INSERT 
WITH CHECK (true);

-- Allow authenticated admins to view leads
CREATE POLICY "Admins can view leads" 
ON public.leads FOR SELECT 
USING (auth.role() = 'authenticated');

-- 4. Set up Storage for images
INSERT INTO storage.buckets (id, name, public) VALUES ('itinerary-images', 'itinerary-images', true);

CREATE POLICY "Public can view images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'itinerary-images');

CREATE POLICY "Admins can upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'itinerary-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'itinerary-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'itinerary-images' AND auth.role() = 'authenticated');

-- 5. Create the 'expenses' table for Nomad Tracker
CREATE TABLE public.expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  date date DEFAULT current_date NOT NULL,
  amount decimal(12,2) NOT NULL,
  category text NOT NULL,
  subcategories text[], -- Array of subcategories
  note text,
  raw_input text,
  user_id uuid REFERENCES auth.users(id) -- Optional: for authenticated users
);

-- Enable RLS on expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Allow public to manage expenses for now (or restrict to auth users later)
CREATE POLICY "Anyone can manage expenses" 
ON public.expenses FOR ALL 
USING (true)
WITH CHECK (true);
