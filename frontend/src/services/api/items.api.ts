import { supabase } from '@/config/supabase'
import { Item, ItemType, ItemStatus, Priority } from '@/types'

/**
 * Supabase API for items
 * All functions require authentication
 */

export async function fetchItems(): Promise<Item[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('fecha_creacion', { ascending: false })

  if (error) throw error

  return data.map(mapSupabaseItemToLocal)
}

export async function getItemById(id: string): Promise<Item | null> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error

  return data ? mapSupabaseItemToLocal(data) : null
}

export async function createItem(item: Omit<Item, 'id' | 'fechaCreacion'>): Promise<Item> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const supabaseItem = {
    user_id: user.id,
    tipo: item.tipo,
    titulo: item.titulo,
    estado: item.estado,
    prioridad: item.prioridad,
    rating: item.rating,
    descripcion: item.descripcion,
    tags: item.tags,
    fecha_inicio: item.fechaInicio,
    fecha_fin: item.fechaFin,
    imagen: item.imagen,
    duracion: item.duracion,
    progreso_temporadas: item.progresoTemporadas,
    progreso_lectura: item.progresoLectura,
    plataforma: item.plataforma,
    director: item.director,
    autor: item.autor,
    editorial: item.editorial,
    genero: item.genero,
    reparto: item.reparto,
    developer: item.developer,
    tiempo_estimado: item.tiempoEstimado,
    veces_consumido: item.vecesConsumido,
    ultima_vez: item.ultimaVez,
    mini_reseña: item.miniReseña,
    archivos: item.archivos,
    // TMDB Enhanced Fields
    trailer: item.trailer,
    streaming_platforms: item.streamingPlatforms,
    backdrop_image: item.backdropImage,
    number_of_seasons: item.numberOfSeasons,
    number_of_episodes: item.numberOfEpisodes,
    tagline: item.tagline
  }

  const { data, error } = await supabase
    .from('items')
    .insert(supabaseItem)
    .select()
    .single()

  if (error) throw error

  return mapSupabaseItemToLocal(data)
}

export async function updateItem(id: string, updates: Partial<Item>): Promise<Item> {
  if (!supabase) throw new Error('Supabase not configured')

  const supabaseUpdates: any = {}

  if (updates.tipo) supabaseUpdates.tipo = updates.tipo
  if (updates.titulo) supabaseUpdates.titulo = updates.titulo
  if (updates.estado) supabaseUpdates.estado = updates.estado
  if (updates.prioridad !== undefined) supabaseUpdates.prioridad = updates.prioridad
  if (updates.rating !== undefined) supabaseUpdates.rating = updates.rating
  if (updates.descripcion !== undefined) supabaseUpdates.descripcion = updates.descripcion
  if (updates.tags !== undefined) supabaseUpdates.tags = updates.tags
  if (updates.fechaInicio !== undefined) supabaseUpdates.fecha_inicio = updates.fechaInicio
  if (updates.fechaFin !== undefined) supabaseUpdates.fecha_fin = updates.fechaFin
  if (updates.imagen !== undefined) supabaseUpdates.imagen = updates.imagen
  if (updates.duracion !== undefined) supabaseUpdates.duracion = updates.duracion
  if (updates.progresoTemporadas !== undefined) supabaseUpdates.progreso_temporadas = updates.progresoTemporadas
  if (updates.progresoLectura !== undefined) supabaseUpdates.progreso_lectura = updates.progresoLectura
  if (updates.plataforma !== undefined) supabaseUpdates.plataforma = updates.plataforma
  if (updates.director !== undefined) supabaseUpdates.director = updates.director
  if (updates.autor !== undefined) supabaseUpdates.autor = updates.autor
  if (updates.editorial !== undefined) supabaseUpdates.editorial = updates.editorial
  if (updates.genero !== undefined) supabaseUpdates.genero = updates.genero
  if (updates.reparto !== undefined) supabaseUpdates.reparto = updates.reparto
  if (updates.developer !== undefined) supabaseUpdates.developer = updates.developer
  if (updates.tiempoEstimado !== undefined) supabaseUpdates.tiempo_estimado = updates.tiempoEstimado
  if (updates.vecesConsumido !== undefined) supabaseUpdates.veces_consumido = updates.vecesConsumido
  if (updates.ultimaVez !== undefined) supabaseUpdates.ultima_vez = updates.ultimaVez
  if (updates.miniReseña !== undefined) supabaseUpdates.mini_reseña = updates.miniReseña
  if (updates.archivos !== undefined) supabaseUpdates.archivos = updates.archivos
  // TMDB Enhanced Fields
  if (updates.trailer !== undefined) supabaseUpdates.trailer = updates.trailer
  if (updates.streamingPlatforms !== undefined) supabaseUpdates.streaming_platforms = updates.streamingPlatforms
  if (updates.backdropImage !== undefined) supabaseUpdates.backdrop_image = updates.backdropImage
  if (updates.numberOfSeasons !== undefined) supabaseUpdates.number_of_seasons = updates.numberOfSeasons
  if (updates.numberOfEpisodes !== undefined) supabaseUpdates.number_of_episodes = updates.numberOfEpisodes
  if (updates.tagline !== undefined) supabaseUpdates.tagline = updates.tagline

  const { data, error } = await supabase
    .from('items')
    .update(supabaseUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return mapSupabaseItemToLocal(data)
}

export async function deleteItem(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Map Supabase item (snake_case) to local Item (camelCase)
 */
function mapSupabaseItemToLocal(supabaseItem: any): Item {
  return {
    id: supabaseItem.id,
    tipo: supabaseItem.tipo as ItemType,
    titulo: supabaseItem.titulo,
    estado: supabaseItem.estado as ItemStatus,
    prioridad: supabaseItem.prioridad as Priority | undefined,
    rating: supabaseItem.rating,
    descripcion: supabaseItem.descripcion,
    tags: supabaseItem.tags,
    fechaCreacion: new Date(supabaseItem.fecha_creacion),
    fechaInicio: supabaseItem.fecha_inicio ? new Date(supabaseItem.fecha_inicio) : undefined,
    fechaFin: supabaseItem.fecha_fin ? new Date(supabaseItem.fecha_fin) : undefined,
    imagen: supabaseItem.imagen,
    duracion: supabaseItem.duracion,
    progresoTemporadas: supabaseItem.progreso_temporadas,
    progresoLectura: supabaseItem.progreso_lectura,
    plataforma: supabaseItem.plataforma,
    director: supabaseItem.director,
    autor: supabaseItem.autor,
    editorial: supabaseItem.editorial,
    genero: supabaseItem.genero,
    reparto: supabaseItem.reparto,
    developer: supabaseItem.developer,
    tiempoEstimado: supabaseItem.tiempo_estimado,
    vecesConsumido: supabaseItem.veces_consumido,
    ultimaVez: supabaseItem.ultima_vez ? new Date(supabaseItem.ultima_vez) : undefined,
    miniReseña: supabaseItem.mini_reseña,
    archivos: supabaseItem.archivos,
    // TMDB Enhanced Fields
    trailer: supabaseItem.trailer,
    streamingPlatforms: supabaseItem.streaming_platforms,
    backdropImage: supabaseItem.backdrop_image,
    numberOfSeasons: supabaseItem.number_of_seasons,
    numberOfEpisodes: supabaseItem.number_of_episodes,
    tagline: supabaseItem.tagline
  }
}
