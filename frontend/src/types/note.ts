export enum HitoType {
  NONE = 'none',
  START = 'start',
  HALF = 'half',
  END = 'end',
  REWATCH = 'rewatch'
}

export interface Note {
  id: string
  itemId: string
  contenido: string
  esSpoiler: boolean
  fechaCreacion: Date
  tipoHito?: HitoType
}
