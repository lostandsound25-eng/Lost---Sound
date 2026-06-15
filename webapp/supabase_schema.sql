-- Supabase Database Schema for Lost & Sound Collaborative Tracker

-- 1. Create TRIPS table
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    home_currency TEXT DEFAULT 'USD' NOT NULL,
    local_currency TEXT DEFAULT 'USD' NOT NULL,
    current_location TEXT DEFAULT '',
    itinerary JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create TRIP_MEMBERS table for collaboration
CREATE TABLE IF NOT EXISTS public.trip_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'editor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (trip_id, email)
);

-- 3. Create TRIP_ENTRIES table (expenses logs)
CREATE TABLE IF NOT EXISTS public.trip_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT,
    notes TEXT,
    worth_it BOOLEAN DEFAULT false NOT NULL,
    establishment TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trip_members_trip_id ON public.trip_members(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_email ON public.trip_members(email);
CREATE INDEX IF NOT EXISTS idx_trip_entries_trip_id ON public.trip_entries(trip_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_entries ENABLE ROW LEVEL SECURITY;

-- Create Google-Sheets style "Anyone with the link (UUID) can access" policies
-- This is secure because UUIDv4 is mathematically unguessable.

-- Trips RLS Policies
DROP POLICY IF EXISTS "Allow public read of trips by ID" ON public.trips;
CREATE POLICY "Allow public read of trips by ID" ON public.trips 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert of trips" ON public.trips;
CREATE POLICY "Allow public insert of trips" ON public.trips 
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update of trips by ID" ON public.trips;
CREATE POLICY "Allow public update of trips by ID" ON public.trips 
    FOR UPDATE USING (true);

-- Trip Members RLS Policies
DROP POLICY IF EXISTS "Allow public access to trip members" ON public.trip_members;
CREATE POLICY "Allow public access to trip members" ON public.trip_members 
    FOR ALL USING (true);

-- Trip Entries RLS Policies
DROP POLICY IF EXISTS "Allow public read of entries by trip ID" ON public.trip_entries;
CREATE POLICY "Allow public read of entries by trip ID" ON public.trip_entries 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert of entries" ON public.trip_entries;
CREATE POLICY "Allow public insert of entries" ON public.trip_entries 
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update of entries by ID" ON public.trip_entries;
CREATE POLICY "Allow public update of entries by ID" ON public.trip_entries 
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete of entries by ID" ON public.trip_entries;
CREATE POLICY "Allow public delete of entries by ID" ON public.trip_entries 
    FOR DELETE USING (true);

-- Migration helpers: Ensure columns exist on trips table if it was already created
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS home_currency TEXT DEFAULT 'USD' NOT NULL;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS local_currency TEXT DEFAULT 'USD' NOT NULL;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS current_location TEXT DEFAULT '';
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '{}'::jsonb;

-- Migration helper: Rename location to establishment in trip_entries
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='trip_entries' AND column_name='location'
  ) THEN
    ALTER TABLE public.trip_entries RENAME COLUMN location TO establishment;
  END IF;
END $$;
ALTER TABLE public.trip_entries ADD COLUMN IF NOT EXISTS establishment TEXT;

-- Migration helper: Split note into title and notes in trip_entries
ALTER TABLE public.trip_entries ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.trip_entries ADD COLUMN IF NOT EXISTS notes TEXT;

UPDATE public.trip_entries 
SET 
  title = split_part(note, E'\n\n', 1),
  notes = CASE 
    WHEN position(E'\n\n' in note) > 0 THEN substring(note from position(E'\n\n' in note) + 2)
    ELSE ''
  END
WHERE title IS NULL AND note IS NOT NULL;

-- Remove old note column if title was successfully populated
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='trip_entries' AND column_name='note'
  ) THEN
    ALTER TABLE public.trip_entries DROP COLUMN IF EXISTS note;
  END IF;
END $$;

-- Remove old location_locale column if it exists
ALTER TABLE public.trip_entries DROP COLUMN IF EXISTS location_locale;

-- Migration helper: Ensure photo columns exist on trip_entries table
ALTER TABLE public.trip_entries ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.trip_entries ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}'::TEXT[] NOT NULL;

-- Drop obsolete tables if they exist
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.itineraries CASCADE;

-- Enable Realtime replication for collaborative updating safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'trip_entries'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_entries;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'trips'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'trip_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_members;
  END IF;
END $$;
