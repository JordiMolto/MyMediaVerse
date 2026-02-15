-- Migration: Add TMDB enhanced fields to items table
-- Run this in your Supabase SQL Editor

-- Add new columns for TMDB data
ALTER TABLE items
ADD COLUMN IF NOT EXISTS trailer TEXT,
ADD COLUMN IF NOT EXISTS streaming_platforms TEXT[], -- Array of platform names
ADD COLUMN IF NOT EXISTS backdrop_image TEXT,
ADD COLUMN IF NOT EXISTS number_of_seasons INTEGER,
ADD COLUMN IF NOT EXISTS number_of_episodes INTEGER,
ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Note: genero and reparto columns should already exist as TEXT[]
-- If they don't exist, uncomment these lines:
-- ALTER TABLE items ADD COLUMN IF NOT EXISTS genero TEXT[];
-- ALTER TABLE items ADD COLUMN IF NOT EXISTS reparto TEXT[];

-- Add comment to document the migration
COMMENT ON COLUMN items.trailer IS 'YouTube trailer URL';
COMMENT ON COLUMN items.streaming_platforms IS 'Available streaming platforms (Netflix, HBO, etc.)';
COMMENT ON COLUMN items.backdrop_image IS 'TMDB backdrop image URL';
COMMENT ON COLUMN items.number_of_seasons IS 'Number of seasons (for series)';
COMMENT ON COLUMN items.number_of_episodes IS 'Total number of episodes (for series)';
COMMENT ON COLUMN items.tagline IS 'Movie/Series tagline';
