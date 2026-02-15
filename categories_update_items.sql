-- Migration: Update items table to use category_id instead of tipo string
-- Execute this AFTER categories_migration.sql

-- Step 1: Add new column for category reference
ALTER TABLE items ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Step 2: Remove the CHECK constraint on tipo column
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_tipo_check;

-- Step 3: Modify tipo column to allow any string (for backward compatibility during migration)
ALTER TABLE items ALTER COLUMN tipo TYPE VARCHAR(100);

-- Step 4: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);

-- Note: After this migration, you should:
-- 1. Update existing items to link them to the new categories by matching tipo with category name
-- 2. Eventually, you can deprecate the 'tipo' column and use only 'category_id'
-- 
-- Example update query (run after creating default categories):
-- UPDATE items SET category_id = (
--   SELECT id FROM categories 
--   WHERE LOWER(nombre) = LOWER(items.tipo) 
--   AND user_id = items.user_id
--   LIMIT 1
-- );
