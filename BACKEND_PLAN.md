# MyMediaVerse - Plan Backend

## Stack Tecnológico

- **Plataforma**: Node.js (v18+)
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Base de Datos**: Supabase (PostgreSQL)
- **ORM**: Supabase Client (o Prisma como alternativa)
- **Autenticación**: JWT + Supabase Auth
- **Validación**: Zod o Joi
- **Variables de Entorno**: dotenv
- **Logging**: Winston o Pino
- **Testing**: Jest + Supertest

---

## Arquitectura Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts       # Configuración Supabase
│   │   ├── env.ts            # Variables de entorno
│   │   └── logger.ts         # Configuración de logs
│   ├── middleware/
│   │   ├── auth.ts           # Middleware JWT
│   │   ├── errorHandler.ts  # Manejo de errores
│   │   ├── validator.ts     # Validación de requests
│   │   └── cors.ts          # Configuración CORS
│   ├── routes/
│   │   ├── index.ts         # Router principal
│   │   ├── auth.routes.ts   # Rutas de autenticación
│   │   ├── items.routes.ts  # Rutas de items
│   │   └── notes.routes.ts  # Rutas de notas
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── items.controller.ts
│   │   └── notes.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── items.service.ts
│   │   └── notes.service.ts
│   ├── models/
│   │   ├── item.model.ts    # Tipos y validaciones
│   │   └── note.model.ts
│   ├── utils/
│   │   ├── jwt.ts           # Helpers JWT
│   │   ├── validators.ts    # Validadores personalizados
│   │   └── errors.ts        # Clases de error personalizadas
│   ├── types/
│   │   ├── express.d.ts     # Extensiones de tipos Express
│   │   └── index.ts         # Tipos compartidos
│   ├── app.ts               # Configuración Express
│   └── server.ts            # Punto de entrada
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Base de Datos (Supabase)

### Tablas

#### 1. **users** (gestionada por Supabase Auth)

Supabase Auth gestiona automáticamente esta tabla. Campos principales:
- `id` (UUID, PK)
- `email`
- `created_at`
- `updated_at`

#### 2. **items**

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('movie', 'series', 'anime', 'book', 'videogame', 'boardgame')),
  titulo VARCHAR(255) NOT NULL,
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'abandonado')),
  prioridad SMALLINT CHECK (prioridad BETWEEN 1 AND 3),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_inicio TIMESTAMP WITH TIME ZONE,
  fecha_fin TIMESTAMP WITH TIME ZONE,
  rating SMALLINT CHECK (rating BETWEEN 0 AND 10),
  tags TEXT[], -- Array de strings
  imagen TEXT,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_tipo ON items(tipo);
CREATE INDEX idx_items_estado ON items(estado);
CREATE INDEX idx_items_tags ON items USING GIN(tags);
```

#### 3. **notes**

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  spoilers BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notes_item_id ON notes(item_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
```

### Row Level Security (RLS)

Supabase permite definir políticas de seguridad a nivel de fila:

```sql
-- Habilitar RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Políticas para items
CREATE POLICY "Users can view their own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas similares para notes
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);
```

---

## API Endpoints

### Autenticación

#### `POST /api/auth/register`
**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```
**Response:**
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "token": "jwt_token"
}
```

#### `POST /api/auth/login`
**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```
**Response:**
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "token": "jwt_token"
}
```

#### `POST /api/auth/logout`
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "message": "Logout successful"
}
```

#### `GET /api/auth/me`
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com"
}
```

---

### Items

#### `GET /api/items`
**Headers:** `Authorization: Bearer <token>`
**Query Params:**
- `tipo`: movie | series | anime | book | videogame | boardgame
- `estado`: pendiente | en_progreso | completado | abandonado
- `prioridad`: 1 | 2 | 3
- `tags`: tag1,tag2
- `search`: texto de búsqueda

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "tipo": "movie",
      "titulo": "Inception",
      "estado": "completado",
      "rating": 9,
      "tags": ["sci-fi", "thriller"],
      "fecha_creacion": "2026-01-15T10:00:00Z",
      "fecha_fin": "2026-01-20T20:00:00Z"
    }
  ],
  "total": 1
}
```

#### `GET /api/items/:id`
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "id": "uuid",
  "tipo": "movie",
  "titulo": "Inception",
  "estado": "completado",
  "rating": 9,
  "tags": ["sci-fi", "thriller"],
  "fecha_creacion": "2026-01-15T10:00:00Z",
  "fecha_fin": "2026-01-20T20:00:00Z"
}
```

#### `POST /api/items`
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "tipo": "movie",
  "titulo": "Inception",
  "estado": "pendiente",
  "prioridad": 3,
  "tags": ["sci-fi", "thriller"]
}
```
**Response:**
```json
{
  "id": "uuid",
  "tipo": "movie",
  "titulo": "Inception",
  "estado": "pendiente",
  "prioridad": 3,
  "tags": ["sci-fi", "thriller"],
  "fecha_creacion": "2026-02-06T12:00:00Z"
}
```

#### `PUT /api/items/:id`
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "estado": "completado",
  "rating": 9,
  "fecha_fin": "2026-02-06T12:00:00Z"
}
```
**Response:**
```json
{
  "id": "uuid",
  "tipo": "movie",
  "titulo": "Inception",
  "estado": "completado",
  "rating": 9,
  "fecha_fin": "2026-02-06T12:00:00Z"
}
```

#### `DELETE /api/items/:id`
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "message": "Item deleted successfully"
}
```

---

### Notes

#### `GET /api/notes?itemId=:itemId`
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "notes": [
    {
      "id": "uuid",
      "item_id": "uuid",
      "texto": "Gran película, me encantó el final",
      "spoilers": false,
      "created_at": "2026-02-06T12:00:00Z"
    }
  ],
  "total": 1
}
```

#### `POST /api/notes`
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "item_id": "uuid",
  "texto": "Gran película, me encantó el final",
  "spoilers": false
}
```
**Response:**
```json
{
  "id": "uuid",
  "item_id": "uuid",
  "texto": "Gran película, me encantó el final",
  "spoilers": false,
  "created_at": "2026-02-06T12:00:00Z"
}
```

#### `PUT /api/notes/:id`
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "texto": "Actualización: después de verla de nuevo, es aún mejor",
  "spoilers": true
}
```
**Response:**
```json
{
  "id": "uuid",
  "texto": "Actualización: después de verla de nuevo, es aún mejor",
  "spoilers": true,
  "updated_at": "2026-02-06T13:00:00Z"
}
```

#### `DELETE /api/notes/:id`
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "message": "Note deleted successfully"
}
```

---

## Configuración Supabase

### 1. Crear Proyecto en Supabase

1. Ir a https://supabase.com
2. Crear nuevo proyecto
3. Guardar:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **API Key (anon)**: Para requests públicos
   - **API Key (service_role)**: Para operaciones admin (NO exponer en frontend)

### 2. Variables de Entorno (`.env`)

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT (si usas JWT propio en lugar de Supabase Auth)
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173

# Logging
LOG_LEVEL=debug
```

### 3. Inicializar Supabase Client (`config/database.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'
import { config } from './env'

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
)

export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
)
```

---

## Middleware de Autenticación

### `middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/database'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.substring(7)

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = {
      id: user.id,
      email: user.email!
    }

    next()
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' })
  }
}
```

---

## Servicios

### `services/items.service.ts`

```typescript
import { supabase } from '../config/database'
import { Item, ItemFilters } from '../types'

export class ItemsService {
  async getAll(userId: string, filters?: ItemFilters): Promise<Item[]> {
    let query = supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)

    if (filters?.tipo) {
      query = query.eq('tipo', filters.tipo)
    }

    if (filters?.estado) {
      query = query.eq('estado', filters.estado)
    }

    if (filters?.prioridad) {
      query = query.eq('prioridad', filters.prioridad)
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags)
    }

    if (filters?.search) {
      query = query.ilike('titulo', `%${filters.search}%`)
    }

    const { data, error } = await query.order('fecha_creacion', { ascending: false })

    if (error) throw error

    return data as Item[]
  }

  async getById(id: string, userId: string): Promise<Item | null> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error

    return data as Item
  }

  async create(item: Partial<Item>, userId: string): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .insert({ ...item, user_id: userId })
      .select()
      .single()

    if (error) throw error

    return data as Item
  }

  async update(id: string, updates: Partial<Item>, userId: string): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return data as Item
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  }
}
```

---

## Controladores

### `controllers/items.controller.ts`

```typescript
import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { ItemsService } from '../services/items.service'

const itemsService = new ItemsService()

export class ItemsController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const filters = {
        tipo: req.query.tipo as string,
        estado: req.query.estado as string,
        prioridad: req.query.prioridad ? Number(req.query.prioridad) : undefined,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        search: req.query.search as string
      }

      const items = await itemsService.getAll(userId, filters)

      res.json({ items, total: items.length })
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch items' })
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const item = await itemsService.getById(id, userId)

      if (!item) {
        return res.status(404).json({ error: 'Item not found' })
      }

      res.json(item)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch item' })
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const item = await itemsService.create(req.body, userId)

      res.status(201).json(item)
    } catch (error) {
      res.status(500).json({ error: 'Failed to create item' })
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const item = await itemsService.update(id, req.body, userId)

      res.json(item)
    } catch (error) {
      res.status(500).json({ error: 'Failed to update item' })
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      await itemsService.delete(id, userId)

      res.json({ message: 'Item deleted successfully' })
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete item' })
    }
  }
}
```

---

## Rutas

### `routes/items.routes.ts`

```typescript
import { Router } from 'express'
import { ItemsController } from '../controllers/items.controller'
import { authenticate } from '../middleware/auth'

const router = Router()
const itemsController = new ItemsController()

router.use(authenticate)

router.get('/', itemsController.getAll)
router.get('/:id', itemsController.getById)
router.post('/', itemsController.create)
router.put('/:id', itemsController.update)
router.delete('/:id', itemsController.delete)

export default router
```

---

## Fases de Implementación Backend

### **Fase 1: Setup Básico**

**Tareas:**
1. ✅ Inicializar proyecto Node.js + TypeScript
2. ✅ Configurar Express
3. ✅ Configurar Supabase client
4. ✅ Crear tablas en Supabase (items, notes)
5. ✅ Configurar RLS policies
6. ✅ Implementar middleware de autenticación
7. ✅ Implementar middleware de errores
8. ✅ Configurar CORS

**Resultado:** Backend base funcional

---

### **Fase 2: CRUD Items**

**Tareas:**
1. ✅ Crear service de items
2. ✅ Crear controller de items
3. ✅ Crear rutas de items
4. ✅ Implementar validaciones (Zod)
5. ✅ Testing con Postman/Thunder Client

**Resultado:** CRUD completo de items

---

### **Fase 3: CRUD Notes**

**Tareas:**
1. ✅ Crear service de notes
2. ✅ Crear controller de notes
3. ✅ Crear rutas de notes
4. ✅ Implementar validaciones
5. ✅ Testing

**Resultado:** CRUD completo de notas

---

### **Fase 4: Autenticación**

**Tareas:**
1. ✅ Implementar registro (Supabase Auth)
2. ✅ Implementar login
3. ✅ Implementar logout
4. ✅ Implementar refresh token
5. ✅ Testing de autenticación

**Resultado:** Sistema de autenticación completo

---

### **Fase 5: Mejoras y Optimización**

**Tareas:**
1. ✅ Paginación en listados
2. ✅ Búsqueda full-text
3. ✅ Logging con Winston
4. ✅ Rate limiting
5. ✅ Compresión de responses
6. ✅ Testing automatizado (Jest)

**Resultado:** Backend optimizado y robusto

---

### **Fase 6: Integraciones Externas** (Opcional)

**Tareas:**
1. ✅ Integrar TMDB API (películas/series)
2. ✅ Integrar Google Books API
3. ✅ Integrar IGDB API (videojuegos)
4. ✅ Endpoint para importar datos

**Resultado:** Importación automática de datos

---

## Checklist Inicial

### Setup
- [ ] Crear carpeta `backend/`
- [ ] `npm init -y`
- [ ] Instalar dependencias: `express`, `@supabase/supabase-js`, `typescript`, `@types/node`, `@types/express`, `dotenv`, `cors`, `zod`
- [ ] Configurar `tsconfig.json`
- [ ] Crear `.env` y `.env.example`
- [ ] Configurar scripts en `package.json` (dev, build, start)

### Supabase
- [ ] Crear proyecto en Supabase
- [ ] Crear tabla `items`
- [ ] Crear tabla `notes`
- [ ] Configurar RLS policies
- [ ] Guardar credenciales en `.env`

### Estructura
- [ ] Crear estructura de carpetas
- [ ] Configurar `config/database.ts`
- [ ] Configurar `config/env.ts`
- [ ] Crear tipos TypeScript

### Middleware
- [ ] `middleware/auth.ts`
- [ ] `middleware/errorHandler.ts`
- [ ] `middleware/cors.ts`

### Items
- [ ] `services/items.service.ts`
- [ ] `controllers/items.controller.ts`
- [ ] `routes/items.routes.ts`
- [ ] Testing CRUD items

### Notes
- [ ] `services/notes.service.ts`
- [ ] `controllers/notes.controller.ts`
- [ ] `routes/notes.routes.ts`
- [ ] Testing CRUD notes

### Auth
- [ ] `services/auth.service.ts`
- [ ] `controllers/auth.controller.ts`
- [ ] `routes/auth.routes.ts`
- [ ] Testing autenticación

### Testing
- [ ] Probar todos los endpoints con Postman
- [ ] Verificar autenticación
- [ ] Verificar RLS policies
- [ ] Testing de errores

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Testing
npm test

# Linting
npm run lint
```

---

## Seguridad

1. **Nunca exponer `SUPABASE_SERVICE_ROLE_KEY` en frontend**
2. **Usar HTTPS en producción**
3. **Validar todos los inputs**
4. **Implementar rate limiting**
5. **Usar RLS policies en Supabase**
6. **Sanitizar datos antes de guardar**
7. **Logging de accesos y errores**

---

## Recursos

- **Supabase Docs**: https://supabase.com/docs
- **Express Docs**: https://expressjs.com/
- **TypeScript Docs**: https://www.typescriptlang.org/
- **Zod Docs**: https://zod.dev/

---

**¡Backend listo para conectar con el frontend!** 🚀
