# MyMediaVerse - Plan Frontend

## Stack Tecnológico

- **Framework**: Vue 3 (Composition API + `<script setup>`)
- **Lenguaje**: TypeScript
- **Enrutamiento**: Vue Router
- **Gestión de Estado**: Pinia
- **Build Tool**: Vite
- **Estilos**: CSS3 personalizado (mobile-first)
- **Iconos**: Font Awesome (CDN)
- **HTTP Client**: Axios
- **Persistencia Local**: IndexedDB (librería `idb`)

---

## Estructura de Carpetas Propuesta

```
src/
├── assets/
│   ├── styles/
│   │   ├── main.css          # Estilos globales
│   │   ├── variables.css     # Variables CSS (colores, espaciados)
│   │   └── components.css    # Estilos de componentes reutilizables
│   └── images/
├── components/
│   ├── common/
│   │   ├── AppButton.vue
│   │   ├── AppInput.vue
│   │   ├── AppModal.vue
│   │   ├── AppCard.vue
│   │   └── AppTabs.vue
│   ├── items/
│   │   ├── ItemCard.vue      # Tarjeta de item (pendiente/hecho)
│   │   ├── ItemList.vue      # Lista de items
│   │   ├── ItemForm.vue      # Formulario crear/editar
│   │   └── ItemDetail.vue    # Vista detalle de item
│   ├── notes/
│   │   ├── NoteCard.vue
│   │   ├── NoteList.vue
│   │   └── NoteForm.vue
│   └── layout/
│       ├── AppHeader.vue
│       ├── AppNav.vue
│       └── AppBottomNav.vue  # Para mobile
├── views/
│   ├── HomeView.vue          # Dashboard principal
│   ├── PendingView.vue       # Lista de pendientes
│   ├── CompletedView.vue     # Lista de completados
│   ├── ItemDetailView.vue    # Detalle de un item
│   └── SearchView.vue        # Búsqueda global
├── stores/
│   ├── items.ts              # Store de items (Pinia)
│   ├── notes.ts              # Store de notas (Pinia)
│   └── ui.ts                 # Store de UI (modales, filtros, etc.)
├── services/
│   ├── api.ts                # Configuración Axios + interceptors
│   ├── itemsService.ts       # Llamadas API para items
│   ├── notesService.ts       # Llamadas API para notas
│   └── authService.ts        # Autenticación (Fase 3)
├── types/
│   ├── item.ts               # Tipos TypeScript para Item
│   ├── note.ts               # Tipos TypeScript para Note
│   └── enums.ts              # Enums (ItemType, ItemStatus, etc.)
├── utils/
│   ├── db.ts                 # Helpers para IndexedDB
│   ├── filters.ts            # Funciones de filtrado
│   └── validators.ts         # Validaciones de formularios
├── router/
│   └── index.ts              # Configuración Vue Router
├── App.vue
└── main.ts
```

---

## Tipos TypeScript Base

### `types/enums.ts`

```typescript
export enum ItemType {
  MOVIE = 'movie',
  SERIES = 'series',
  ANIME = 'anime',
  BOOK = 'book',
  VIDEOGAME = 'videogame',
  BOARDGAME = 'boardgame'
}

export enum ItemStatus {
  PENDING = 'pendiente',
  IN_PROGRESS = 'en_progreso',
  COMPLETED = 'completado',
  ABANDONED = 'abandonado'
}

export enum Priority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3
}
```

### `types/item.ts`

```typescript
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
  // Campos opcionales para futuras fases
  imagen?: string
  descripcion?: string
}
```

### `types/note.ts`

```typescript
export interface Note {
  id: string
  itemId: string
  texto: string
  fecha: Date
  spoilers?: boolean
}
```

---

## Rutas (Vue Router)

```typescript
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/pendiente',
    name: 'pending',
    component: PendingView
  },
  {
    path: '/hecho',
    name: 'completed',
    component: CompletedView
  },
  {
    path: '/item/:id',
    name: 'item-detail',
    component: ItemDetailView
  },
  {
    path: '/buscar',
    name: 'search',
    component: SearchView
  }
]
```

---

## Stores Pinia

### `stores/items.ts`

**Responsabilidades:**
- CRUD de items
- Filtrado por tipo, estado, prioridad
- Búsqueda
- Sincronización con backend (Fase 2+)
- Persistencia local con IndexedDB (Fase 1)

**Acciones principales:**
- `fetchItems()`
- `createItem(item: Item)`
- `updateItem(id: string, data: Partial<Item>)`
- `deleteItem(id: string)`
- `changeStatus(id: string, status: ItemStatus)`
- `filterByType(type: ItemType)`
- `searchItems(query: string)`

### `stores/notes.ts`

**Responsabilidades:**
- CRUD de notas
- Obtener notas por itemId
- Sincronización con backend

**Acciones principales:**
- `fetchNotesByItem(itemId: string)`
- `createNote(note: Note)`
- `updateNote(id: string, texto: string)`
- `deleteNote(id: string)`

### `stores/ui.ts`

**Responsabilidades:**
- Estado de modales
- Filtros activos
- Vista actual (grid/list)
- Loading states

---

## Vistas Principales

### 1. **HomeView.vue** (Dashboard)

**Elementos:**
- Resumen de estadísticas:
  - Total pendientes
  - Total completados
  - En progreso
  - Últimos añadidos
- 2 botones grandes: "Ver Pendientes" / "Ver Completados"
- Buscador global
- Acceso rápido a "Añadir nuevo item"

### 2. **PendingView.vue**

**Elementos:**
- Tabs por tipo de contenido (Películas, Series, Anime, Libros, Videojuegos, Juegos de mesa)
- Filtros:
  - Por prioridad
  - Orden: Prioridad / Fecha añadido / Alfabético
- Grid/Lista de `ItemCard`
- Cada tarjeta muestra:
  - Título
  - Tipo (icono)
  - Prioridad (estrellas)
  - Botones rápidos: "Marcar en progreso" / "Marcar completado"
- Botón flotante: "Añadir nuevo"

### 3. **CompletedView.vue**

**Elementos:**
- Tabs por tipo
- Filtros:
  - Con/sin notas
  - Este mes / Este año / Todo
  - Por rating
- Grid/Lista de `ItemCard`
- Cada tarjeta muestra:
  - Título + tipo
  - Rating (estrellas)
  - Preview última nota
  - Botón: "Añadir nota"

### 4. **ItemDetailView.vue**

**Elementos:**
- Header con título + tipo
- Info básica:
  - Estado actual
  - Fechas (inicio/fin)
  - Rating (si completado)
  - Tags
- Acciones:
  - Cambiar estado
  - Editar rating
  - Editar item
  - Eliminar item
- Sección de notas:
  - Lista de notas en orden cronológico
  - Botón "Añadir nota"

### 5. **SearchView.vue**

**Elementos:**
- Buscador grande
- Filtros rápidos por tipo
- Resultados en tiempo real
- Vista de tarjetas con resultados

---

## Componentes Clave

### `ItemCard.vue`

**Props:**
- `item: Item`
- `variant: 'pending' | 'completed'`

**Funcionalidad:**
- Muestra info según variante
- Acciones rápidas contextuales
- Click → navega a detalle

### `ItemForm.vue`

**Props:**
- `item?: Item` (para edición)
- `mode: 'create' | 'edit'`

**Funcionalidad:**
- Formulario reactivo
- Validaciones
- Campos condicionales según estado
- Emit: `@save`, `@cancel`

### `NoteCard.vue`

**Props:**
- `note: Note`

**Funcionalidad:**
- Muestra texto de nota
- Fecha formateada
- Indicador de spoilers
- Acciones: editar/eliminar

### `AppModal.vue`

**Props:**
- `isOpen: boolean`
- `title: string`

**Slots:**
- `default` (contenido)
- `footer` (acciones)

---

## Estilos y Diseño

### Variables CSS (`variables.css`)

```css
:root {
  /* Colores principales */
  --color-primary: hsl(220, 90%, 56%);
  --color-secondary: hsl(280, 70%, 60%);
  --color-success: hsl(140, 60%, 50%);
  --color-warning: hsl(40, 90%, 60%);
  --color-danger: hsl(0, 70%, 60%);
  
  /* Backgrounds */
  --bg-primary: hsl(220, 20%, 10%);
  --bg-secondary: hsl(220, 18%, 15%);
  --bg-card: hsl(220, 16%, 18%);
  
  /* Texto */
  --text-primary: hsl(0, 0%, 95%);
  --text-secondary: hsl(0, 0%, 70%);
  
  /* Espaciados */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  
  /* Bordes */
  --radius-sm: 0.5rem;
  --radius-md: 1rem;
  --radius-lg: 1.5rem;
  
  /* Sombras */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Principios de Diseño

1. **Mobile-first**: Diseñar primero para móvil, luego desktop
2. **Espaciado generoso**: Mucho aire entre elementos
3. **Tipografía grande**: Mínimo 16px base, títulos grandes
4. **Glassmorphism**: Fondos con blur y transparencia
5. **Micro-animaciones**: Transiciones suaves en hover/click
6. **Gradientes sutiles**: En botones y cards
7. **Dark mode por defecto**: Colores vibrantes sobre fondo oscuro

---

## Persistencia Local (Fase 1)

### IndexedDB con `idb`

**Base de datos:** `MyMediaVerseDB`

**Object Stores:**
1. `items` (keyPath: `id`)
2. `notes` (keyPath: `id`, index: `itemId`)

**Operaciones en `utils/db.ts`:**
- `initDB()`: Inicializar BD
- `getAllItems()`: Obtener todos los items
- `getItemById(id)`: Obtener item por ID
- `addItem(item)`: Añadir item
- `updateItem(item)`: Actualizar item
- `deleteItem(id)`: Eliminar item
- Similar para notas

---

## Fases de Implementación

### **Fase 1: MVP Local** (Solo tú, sin backend)

**Tareas:**
1. ✅ Setup proyecto Vite + Vue 3 + TypeScript
2. ✅ Configurar Vue Router
3. ✅ Configurar Pinia
4. ✅ Crear tipos TypeScript
5. ✅ Implementar IndexedDB (utils/db.ts)
6. ✅ Crear componentes base (AppButton, AppInput, AppCard, AppModal)
7. ✅ Crear stores (items, notes, ui)
8. ✅ Implementar vistas principales (Home, Pending, Completed, Detail)
9. ✅ Implementar CRUD de items
10. ✅ Implementar CRUD de notas
11. ✅ Implementar búsqueda y filtros
12. ✅ Estilos y diseño responsive
13. ✅ Testing manual

**Resultado:** App funcional 100% local, sin autenticación

---

### **Fase 2: Mejoras UX**

**Tareas:**
1. ✅ Sistema de tags
2. ✅ Mejoras en filtros (múltiples tags, rangos de rating)
3. ✅ Ordenación avanzada
4. ✅ Estadísticas más detalladas en Home
5. ✅ Exportar/Importar datos (JSON)
6. ✅ PWA (manifest.json, service worker)

**Resultado:** App instalable, más funcionalidades

---

### **Fase 3: Backend + Sync**

**Tareas:**
1. ✅ Integrar Axios
2. ✅ Crear services (itemsService, notesService, authService)
3. ✅ Conectar stores con backend
4. ✅ Implementar autenticación JWT
5. ✅ Sincronización online/offline
6. ✅ Gestión de conflictos
7. ✅ Importar desde APIs externas (TMDB, Google Books)

**Resultado:** App multi-dispositivo con sync

---

## Checklist Inicial (Fase 1)

### Setup
- [ ] Crear proyecto con `npm create vite@latest`
- [ ] Instalar dependencias: `vue-router`, `pinia`, `idb`, `axios`
- [ ] Configurar TypeScript
- [ ] Añadir Font Awesome (CDN en index.html)

### Estructura
- [ ] Crear estructura de carpetas
- [ ] Crear tipos TypeScript (enums, item, note)
- [ ] Configurar Vue Router
- [ ] Configurar Pinia

### Persistencia
- [ ] Implementar `utils/db.ts` con IndexedDB
- [ ] Crear funciones CRUD para items
- [ ] Crear funciones CRUD para notas

### Componentes Base
- [ ] `AppButton.vue`
- [ ] `AppInput.vue`
- [ ] `AppCard.vue`
- [ ] `AppModal.vue`
- [ ] `AppTabs.vue`

### Stores
- [ ] `stores/items.ts` (CRUD + filtros)
- [ ] `stores/notes.ts` (CRUD)
- [ ] `stores/ui.ts` (estado UI)

### Componentes Específicos
- [ ] `ItemCard.vue`
- [ ] `ItemList.vue`
- [ ] `ItemForm.vue`
- [ ] `ItemDetail.vue`
- [ ] `NoteCard.vue`
- [ ] `NoteList.vue`
- [ ] `NoteForm.vue`

### Vistas
- [ ] `HomeView.vue` (Dashboard)
- [ ] `PendingView.vue` (Pendientes)
- [ ] `CompletedView.vue` (Completados)
- [ ] `ItemDetailView.vue` (Detalle)
- [ ] `SearchView.vue` (Búsqueda)

### Estilos
- [ ] `variables.css` (colores, espaciados)
- [ ] `main.css` (estilos globales)
- [ ] Estilos responsive (mobile-first)
- [ ] Micro-animaciones

### Testing
- [ ] Probar CRUD items
- [ ] Probar CRUD notas
- [ ] Probar filtros y búsqueda
- [ ] Probar en móvil
- [ ] Probar en desktop

---

## Notas Importantes

1. **Mobile-first**: Diseña primero para móvil, usa media queries para desktop
2. **Accesibilidad**: Usa etiquetas semánticas, ARIA labels donde sea necesario
3. **Performance**: Lazy loading de vistas, virtualización si hay muchos items
4. **UX**: Una acción principal por pantalla, feedback visual inmediato
5. **Consistencia**: Usa componentes base para mantener coherencia visual

---

## Recursos y Referencias

- **Vue 3 Docs**: https://vuejs.org/
- **Pinia Docs**: https://pinia.vuejs.org/
- **Vue Router Docs**: https://router.vuejs.org/
- **IndexedDB (idb)**: https://github.com/jakearchibald/idb
- **Font Awesome**: https://fontawesome.com/
- **Vite Docs**: https://vitejs.dev/

---

**¡Listo para empezar con la Fase 1!** 🚀
