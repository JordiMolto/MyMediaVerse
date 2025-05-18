export type MediaType = 'película' | 'serie' | 'anime';
export type MediaStatus = 'pendiente' | 'viendo' | 'completado' | 'droppeado';

export interface MediaItem {
  id: number;
  titulo: string;
  tipo: MediaType;
  estado: MediaStatus;
  puntuacion?: number | null; // 1-10
  nota?: string | null;
  fecha_inicio?: string | null; // Formato YYYY-MM-DD
  fecha_fin?: string | null;    // Formato YYYY-MM-DD
  favorito: boolean;
  imagenUrl?: string | null; // Para la URL de la imagen
  // usuario_id: number; // Lo omitimos por ahora para el mock del frontend
} 