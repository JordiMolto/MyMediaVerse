-- Migration: Create Categories Table
-- Execute this in your Supabase SQL Editor

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  icono VARCHAR(50) DEFAULT 'fa-folder',
  color VARCHAR(7) DEFAULT '#FF5722',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
CREATE POLICY "Users can view their own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Add Trigger for updated_at (if not already exists from items)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Insert default categories for the user (Optional: you can run this for existing users)
-- INSERT INTO categories (user_id, nombre, icono, color)
-- VALUES 
--   (auth.uid(), 'Películas', 'fa-film', '#A855F7'),
--   (auth.uid(), 'Series', 'fa-tv', '#A855F7'),
--   (auth.uid(), 'Libros', 'fa-book', '#4CAF50'),
--   (auth.uid(), 'Videojuegos', 'fa-gamepad', '#00F5FF'),
--   (auth.uid(), 'Juegos de Mesa', 'fa-dice', '#FFC107');
