-- Migration: Add favorite functionality to items
-- Run this in your Supabase SQL Editor

ALTER TABLE items
ADD COLUMN IF NOT EXISTS favorito BOOLEAN DEFAULT FALSE;

-- Add index for performance in Favorites view
CREATE INDEX IF NOT EXISTS idx_items_favorito ON items(favorito) WHERE favorito = TRUE;

COMMENT ON COLUMN items.favorito IS 'Flag to mark an item as favorite';
