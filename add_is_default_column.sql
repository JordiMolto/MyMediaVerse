-- Add is_default column to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false;

-- Mark existing default categories for users who already have them seeded
-- (optional: run this if you want to flag existing defaults by name)
UPDATE categories
SET is_default = true
WHERE nombre IN ('Películas', 'Series', 'Libros', 'Videojuegos', 'Juegos de Mesa');
