-- Run this in your Supabase SQL Editor to add photo_urls_full column and copy existing photo_urls data
ALTER TABLE public.trip_entries ADD COLUMN IF NOT EXISTS photo_urls_full TEXT[] DEFAULT '{}'::TEXT[] NOT NULL;

UPDATE public.trip_entries 
SET photo_urls_full = photo_urls
WHERE photo_urls_full = '{}'::TEXT[] OR photo_urls_full IS NULL;
