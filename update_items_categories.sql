-- Actualizar items existentes para que coincidan con los nombres de tus categorías personalizadas
-- Ejecuta esto en Supabase SQL Editor

-- Mapeo de valores antiguos a nuevos nombres de categorías
UPDATE items SET tipo = 'Películas2' WHERE tipo IN ('movie', 'Película', 'Películas');
UPDATE items SET tipo = 'Series' WHERE tipo IN ('series', 'Serie');
UPDATE items SET tipo = 'Libros' WHERE tipo IN ('book', 'Libro');
UPDATE items SET tipo = 'Videojuegos' WHERE tipo IN ('videogame', 'Videojuego');
UPDATE items SET tipo = 'Juegos de Mesa 2' WHERE tipo IN ('boardgame', 'Juego de Mesa', 'Juegos de Mesa');

-- Verificar los cambios
SELECT tipo, COUNT(*) as cantidad
FROM items
GROUP BY tipo
ORDER BY cantidad DESC;
