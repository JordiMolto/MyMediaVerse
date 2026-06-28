export interface TemplateBlocks {
  // Hero
  hero: boolean;
  heroTagline: boolean;
  heroMeta: boolean;
  heroGeneros: boolean;
  // Sidebar
  poster: boolean;
  acciones: boolean;
  progreso: boolean;
  plataformasStreaming: boolean;
  trailer: boolean;
  detalles: boolean;
  // Columna principal
  estado: boolean;
  sinopsis: boolean;
  reparto: boolean;
  diario: boolean;
}

export interface DetailTemplate {
  id: string;
  userId: string;
  nombre: string;
  tipoAsociado?: string | null;
  esPredeterminada: boolean;
  bloques: TemplateBlocks;
  createdAt?: Date;
  updatedAt?: Date;
}
