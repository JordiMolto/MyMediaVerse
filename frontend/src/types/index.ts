// Define aquí las interfaces para tus datos
// Basado en tu estructura de datos MySQL

export interface Usuario {
  id?: number; // Opcional si es autoincremental y no lo envías al crear
  nombre: string;
  email: string;
  password?: string; // Solo para envío, no para mostrar
}

export type TipoEntrada = 'película' | 'serie' | 'anime';
export type EstadoEntrada = 'pendiente' | 'viendo' | 'completado' | 'droppeado';

export interface Entrada {
  id?: number;
  titulo: string;
  tipo: TipoEntrada;
  estado: EstadoEntrada;
  nota?: string; // text puede ser string
  puntuacion?: number | null; // int (1-10)
  fecha_inicio?: string | null; // date (YYYY-MM-DD)
  fecha_fin?: string | null; // date (YYYY-MM-DD)
  favorito?: boolean;
  usuario_id?: number; // FK, lo necesitarás cuando tengas usuarios
  // etiquetas?: Etiqueta[]; // Para la relación N:M
  // citas?: CitaDestacada[];
}

// Puedes crear interfaces específicas si quieres diferenciar
export interface Movie extends Entrada {
  tipo: 'película';
}
export interface Serie extends Entrada {
  tipo: 'serie';
}
export interface Anime extends Entrada {
  tipo: 'anime';
}


export interface Etiqueta {
  id?: number;
  nombre: string;
  usuario_id?: number;
}

export interface CitaDestacada {
  id?: number;
  contenido: string;
  entrada_id: number;
} 