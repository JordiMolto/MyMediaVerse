# MyMediaVerse - Frontend

Tu universo personal de entretenimiento. Registra y planifica películas, series, anime, libros, videojuegos y juegos de mesa.

## 🚀 Stack Tecnológico

- **Framework**: Vue 3 (Composition API + `<script setup>`)
- **Lenguaje**: TypeScript
- **Enrutamiento**: Vue Router
- **Gestión de Estado**: Pinia
- **Build Tool**: Vite
- **Estilos**: CSS3 personalizado (mobile-first)
- **Iconos**: Font Awesome 6
- **Fuentes**: Google Fonts (Inter)
- **Persistencia**: IndexedDB (librería `idb`)

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de la build de producción
npm run preview
```

## 🏗️ Estructura del Proyecto

```
src/
├── assets/
│   └── styles/          # CSS global y variables
├── components/          # Componentes Vue (pendiente)
├── router/             # Configuración de rutas
├── stores/             # Stores de Pinia
│   ├── items.ts        # Gestión de items
│   ├── notes.ts        # Gestión de notas
│   └── ui.ts           # Estado de UI
├── types/              # Tipos TypeScript
│   ├── enums.ts        # Enums (ItemType, ItemStatus, Priority)
│   ├── item.ts         # Interface Item
│   └── note.ts         # Interface Note
├── utils/              # Utilidades
│   └── db.ts           # IndexedDB helpers
├── views/              # Vistas principales
│   ├── HomeView.vue
│   ├── PendingView.vue
│   ├── CompletedView.vue
│   ├── ItemDetailView.vue
│   └── SearchView.vue
├── App.vue
└── main.ts
```

## 🎯 Funcionalidades Actuales

### ✅ Implementado

- ✅ Configuración completa del proyecto (Vite + Vue 3 + TypeScript)
- ✅ Sistema de tipos TypeScript (Item, Note, Enums)
- ✅ IndexedDB para persistencia local
- ✅ Pinia stores con CRUD completo
- ✅ Vue Router configurado
- ✅ Sistema de diseño CSS (variables, estilos globales)
- ✅ Vista Home (Dashboard con estadísticas)
- ✅ Vista Pendientes (con filtros por tipo)
- ✅ Vista Completados (con ratings)

### 🚧 En Progreso

- 🚧 Componentes base (AppButton, AppCard, AppModal, etc.)
- 🚧 Vista de detalle de items
- 🚧 Vista de búsqueda
- 🚧 Formularios para crear/editar items
- 🚧 Sistema de notas

### 📋 Pendiente (Fase 2)

- Sistema de tags
- Filtros avanzados
- Estadísticas detalladas
- Exportar/Importar datos (JSON)
- PWA (Progressive Web App)

### 🔮 Futuro (Fase 3)

- Integración con backend (Supabase)
- Autenticación de usuarios
- Sincronización multi-dispositivo
- Importación desde APIs externas (TMDB, Google Books, IGDB)

## 🎨 Diseño

El diseño sigue estos principios:

- **Mobile-first**: Diseñado primero para móvil
- **Dark mode**: Tema oscuro por defecto con colores vibrantes
- **Glassmorphism**: Efectos de cristal y transparencias
- **Micro-animaciones**: Transiciones suaves en interacciones
- **Tipografía grande**: Legibilidad óptima
- **Espaciado generoso**: Mucho aire entre elementos

## 📱 Tipos de Contenido

- 🎬 **Películas** (movie)
- 📺 **Series** (series)
- 🐉 **Anime** (anime)
- 📚 **Libros** (book)
- 🎮 **Videojuegos** (videogame)
- 🎲 **Juegos de Mesa** (boardgame)

## 📊 Estados de Items

- ⏳ **Pendiente** (pendiente)
- ▶️ **En Progreso** (en_progreso)
- ✅ **Completado** (completado)
- ❌ **Abandonado** (abandonado)

## 🔧 Desarrollo

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor en http://localhost:5173

# Build
npm run build        # Compila TypeScript + construye para producción

# Preview
npm run preview      # Vista previa de la build de producción
```

### Tecnologías Clave

- **Vue 3**: Framework reactivo con Composition API
- **TypeScript**: Tipado estático para mayor seguridad
- **Pinia**: State management moderno para Vue
- **IndexedDB**: Base de datos local del navegador
- **Vite**: Build tool ultra-rápido

## 📝 Próximos Pasos

1. Crear componentes base reutilizables
2. Implementar formularios de creación/edición
3. Completar vista de detalle de items
4. Implementar sistema de notas
5. Añadir funcionalidad de búsqueda
6. Testing y validación

## 📄 Licencia

Proyecto personal - MyMediaVerse

---

**Estado**: 🚧 En desarrollo activo (Fase 1 - MVP Local)
