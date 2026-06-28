/**
 * Converts a string to a URL-friendly slug.
 * "One Piece" → "one-piece"
 * "L'Étranger" → "l-etranger"
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Builds the URL for a collection page.
 * "Juegos de Mesa" → "/coleccion/juegos-de-mesa"
 */
export function collectionPath(nombre: string): string {
  return `/coleccion/${slugify(nombre)}`;
}

/**
 * Builds the semantic URL for an item inside a collection.
 * categoria: "Películas", titulo: "Interstellar", id: "abc123"
 * → "/coleccion/peliculas/interstellar--abc123"
 */
export function collectionItemPath(categoria: string, titulo: string, id: string): string {
  return `/coleccion/${slugify(categoria)}/${slugify(titulo)}--${id}`;
}

/**
 * @deprecated Use collectionItemPath instead.
 */
export function itemPath(categoria: string, titulo: string, id: string): string {
  return collectionItemPath(categoria, titulo, id);
}

/**
 * Extracts the item ID from a semantic slug param.
 * "one-piece--abc123" → "abc123"
 */
export function extractIdFromSlug(slug: string): string {
  const parts = slug.split("--");
  return parts[parts.length - 1];
}
