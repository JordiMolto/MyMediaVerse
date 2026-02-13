-- MyMediaVerse Database Schema for Supabase
-- Execute this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('movie', 'series', 'anime', 'book', 'videogame', 'boardgame')),
  titulo VARCHAR(255) NOT NULL,
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('pending', 'in_progress', 'completed', 'abandoned')),
  prioridad VARCHAR(10) CHECK (prioridad IN ('low', 'medium', 'high')),
  rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
  descripcion TEXT,
  tags TEXT[],
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_inicio TIMESTAMP WITH TIME ZONE,
  fecha_fin TIMESTAMP WITH TIME ZONE,
  
  -- Adaptive Metadata
  imagen TEXT,
  duracion INTEGER,
  progreso_temporadas VARCHAR(50),
  progreso_lectura VARCHAR(50),
  plataforma VARCHAR(100),
  director VARCHAR(255),
  autor VARCHAR(255),
  editorial VARCHAR(255),
  genero TEXT[],
  reparto TEXT[],
  developer VARCHAR(255),
  tiempo_estimado VARCHAR(50),
  
  -- Personal Stats
  veces_consumido INTEGER DEFAULT 0,
  ultima_vez TIMESTAMP WITH TIME ZONE,
  mini_reseña TEXT,
  archivos TEXT[],

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contenido TEXT NOT NULL,
  es_spoiler BOOLEAN DEFAULT FALSE,
  tipo_hito VARCHAR(50) DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_estado ON items(estado);
CREATE INDEX idx_items_tipo ON items(tipo);
CREATE INDEX idx_items_tags ON items USING GIN(tags);
CREATE INDEX idx_notes_item_id ON notes(item_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);

-- Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for items
CREATE POLICY "Users can view their own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for notes
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
