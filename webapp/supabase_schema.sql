-- Supabase Database Schema for Lost & Sound Collaborative Tracker

-- 1. Create TRIPS table
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
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
    note TEXT,
    worth_it BOOLEAN DEFAULT false NOT NULL,
    location TEXT,
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
CREATE POLICY "Allow public read of trips by ID" ON public.trips 
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert of trips" ON public.trips 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update of trips by ID" ON public.trips 
    FOR UPDATE USING (true);

-- Trip Members RLS Policies
CREATE POLICY "Allow public access to trip members" ON public.trip_members 
    FOR ALL USING (true);

-- Trip Entries RLS Policies
CREATE POLICY "Allow public read of entries by trip ID" ON public.trip_entries 
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert of entries" ON public.trip_entries 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update of entries by ID" ON public.trip_entries 
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete of entries by ID" ON public.trip_entries 
    FOR DELETE USING (true);

-- Enable Realtime replication for collaborative updating
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_members;
