export type CategoryViewMode = "grid" | "list" | "compact";

export interface Category {
  id: string;
  userId: string;
  nombre: string;
  icono?: string;
  color?: string;
  oculto?: boolean;
  viewMode?: CategoryViewMode;
  createdAt?: Date;
  updatedAt?: Date;
}
