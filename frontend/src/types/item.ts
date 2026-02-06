import { ItemType, ItemStatus, Priority } from './enums'

export interface Item {
  id: string
  tipo: ItemType
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
}

export interface ItemFilters {
  tipo?: ItemType
  estado?: ItemStatus
  prioridad?: Priority
  tags?: string[]
  search?: string
}
