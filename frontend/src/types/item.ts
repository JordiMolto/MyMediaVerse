import { ItemType, ItemStatus, Priority } from './enums'

export interface Item {
  id: string
  tipo: ItemType | string
  titulo: string
  estado: ItemStatus
  prioridad?: Priority
  fechaCreacion: Date
  fechaInicio?: Date
  fechaFin?: Date
  rating?: number // 0-10
  tags?: string[]
  imagen?: string
  descripcion?: string
  favorito?: boolean

  // Adaptive Metadata
  duracion?: number // minutos
  progresoTemporadas?: string // e.g., "S02/05"
  progresoLectura?: string // e.g., "120/350" o "45%"
  plataforma?: string // e.g., "PC", "PS5"
  director?: string
  autor?: string
  editorial?: string
  genero?: string[] // Géneros (Acción, Drama, etc.)
  reparto?: string[] // Nombres del reparto principal
  developer?: string
  tiempoEstimado?: string // HLTB style

  // TMDB Enhanced Data
  trailer?: string // YouTube URL
  streamingPlatforms?: string[] // Netflix, HBO, etc.
  backdropImage?: string // Imagen de fondo
  numberOfSeasons?: number // Series
  numberOfEpisodes?: number // Series
  tagline?: string // Eslogan/tagline

  // Personal Stats
  vecesConsumido?: number
  ultimaVez?: Date
  miniReseña?: string
  archivos?: string[] // URLs de fotos personales (entrada cine, libro físico)
}

export interface ItemFilters {
  tipo?: ItemType
  estado?: ItemStatus
  prioridad?: Priority
  tags?: string[]
  search?: string
}
