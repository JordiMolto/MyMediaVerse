# MyMediaVerse - Guía de Configuración de Supabase

## 🎯 Estado Actual

La aplicación está **lista para Supabase** pero funciona perfectamente sin él (solo local con IndexedDB).

## 📋 Pasos para Activar Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta (gratis)
3. Crea un nuevo proyecto
4. Espera a que el proyecto se inicialice (~2 minutos)

### 2. Ejecutar el Schema SQL

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Copia y pega el contenido de `supabase_schema.sql` (en la raíz del proyecto)
4. Ejecuta la query (botón "Run")

Esto creará:
- ✅ Tabla `items` con RLS (Row Level Security)
- ✅ Tabla `notes` con RLS
- ✅ Índices para mejor rendimiento
- ✅ Triggers para `updated_at`

### 3. Obtener Credenciales

1. En el dashboard de Supabase, ve a **Settings** > **API**
2. Copia estos dos valores:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon public key** (una clave larga que empieza con `eyJ...`)

### 4. Configurar Variables de Entorno

1. En la carpeta `frontend/`, crea un archivo `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` y pega tus credenciales:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### 5. ¡Listo!

Ahora la aplicación:
- ✅ Permite registro e inicio de sesión
- ✅ Sincroniza datos en la nube
- ✅ Funciona en múltiples dispositivos
- ✅ Sigue funcionando offline (usa IndexedDB como fallback)

## 🔄 Cómo Funciona

### Sin Autenticación
- Usa **IndexedDB** (almacenamiento local)
- Datos solo en tu navegador
- No requiere cuenta

### Con Autenticación
- Usa **Supabase** (nube)
- Datos sincronizados
- Acceso desde cualquier dispositivo

## 🚀 Nuevas Rutas Disponibles

- `/login` - Iniciar sesión
- `/register` - Crear cuenta

## 📁 Archivos Creados

### Configuración
- `src/config/supabase.ts` - Cliente de Supabase
- `.env.example` - Template de variables de entorno
- `supabase_schema.sql` - Schema de base de datos

### Stores
- `src/stores/auth.ts` - Store de autenticación

### Servicios
- `src/services/api/items.api.ts` - API de items (Supabase)
- `src/services/api/notes.api.ts` - API de notes (Supabase)
- `src/services/storage/items.storage.ts` - Abstracción IDB/Supabase
- `src/services/storage/notes.storage.ts` - Abstracción IDB/Supabase

### Vistas
- `src/views/login-view/LoginView.vue` - Vista de login
- `src/views/register-view/RegisterView.vue` - Vista de registro

## ⚠️ Importante

- **No subas el archivo `.env` a Git** (ya está en `.gitignore`)
- Las credenciales de Supabase son públicas (anon key), pero están protegidas por RLS
- Los datos de cada usuario solo son accesibles por ese usuario (RLS policies)

## 🐛 Troubleshooting

### "Supabase not configured"
- Verifica que el archivo `.env` existe
- Verifica que las variables empiezan con `VITE_`
- Reinicia el servidor de desarrollo

### "User not authenticated"
- Inicia sesión primero en `/login`
- O usa la app sin cuenta (solo local)

### Errores de RLS
- Verifica que ejecutaste el schema SQL completo
- Verifica que las policies están habilitadas

## 📞 Soporte

Si tienes problemas, revisa:
1. Consola del navegador (F12)
2. Logs de Supabase (Dashboard > Logs)
3. Variables de entorno correctas
