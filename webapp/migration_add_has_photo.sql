-- Run this in your Supabase SQL Editor to add has_photo column and backfill existing entries
ALTER TABLE public.trip_entries ADD COLUMN IF NOT EXISTS has_photo BOOLEAN DEFAULT false NOT NULL;

UPDATE public.trip_entries 
SET has_photo = COALESCE(
  (photo_url IS NOT NULL AND photo_url != '') OR 
  (photo_urls IS NOT NULL AND cardinality(photo_urls) > 0), 
  false
);
