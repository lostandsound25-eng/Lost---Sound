-- lostandsound_tracks_migration.sql
-- ----------------------------------------------------
-- Run this SQL in your Supabase Dashboard > SQL Editor
-- ----------------------------------------------------

-- 1. Add is_public column to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- 2. Create minimal profiles table in public schema
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  display_name TEXT,
  home_currency TEXT DEFAULT 'USD'
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS home_currency TEXT DEFAULT 'USD';

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflict
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;

-- RLS Policy: Anyone can view profiles
CREATE POLICY "Allow public read access to profiles" 
ON public.profiles FOR SELECT 
USING (true);

-- RLS Policy: Users can only edit their own profile details
CREATE POLICY "Allow users to update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 3. Trigger: Automatically create a public profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger to avoid duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RLS Policies: Allow anyone to view public trips and their expenses
DROP POLICY IF EXISTS "Allow public read access to public trips" ON trips;
DROP POLICY IF EXISTS "Allow public read access to public trip entries" ON trip_entries;

CREATE POLICY "Allow public read access to public trips" 
ON trips FOR SELECT 
USING (is_public = true);

CREATE POLICY "Allow public read access to public trip entries" 
ON trip_entries FOR SELECT 
USING (trip_id IN (SELECT id FROM trips WHERE is_public = true));
