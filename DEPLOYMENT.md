# MyMediaVerse - Deployment Guide

## 🚀 Deploy to Vercel

### Configuración del Proyecto en Vercel

1. **Importa el repositorio en Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Click en "Add New Project"
   - Importa tu repositorio de GitHub

2. **Configuración del Build:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Variables de Entorno:**
   En la sección "Environment Variables" añade:
   ```
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

4. **Deploy:**
   - Click en "Deploy"
   - Espera a que termine el build

### Configuración Automática

El archivo `vercel.json` ya está configurado con:
- ✅ Build command correcto para Vite
- ✅ Output directory `dist`
- ✅ Rewrites para SPA routing (Vue Router)

### Comandos Git para Deploy

```bash
cd frontend
git add .
git commit -m "feat: Add Vercel configuration"
git push
```

Vercel detectará el push y desplegará automáticamente.

### Troubleshooting

**Error: "vue-cli-service: command not found"**
- ✅ Solucionado con `vercel.json`
- Asegúrate de que el Root Directory sea `frontend`

**Error: "404 on page reload"**
- ✅ Solucionado con rewrites en `vercel.json`

**Variables de entorno no funcionan**
- Asegúrate de que empiecen con `VITE_`
- Configúralas en el dashboard de Vercel
- Redeploy después de añadirlas

### Estructura del Proyecto

```
MyMediaVerse/
├── frontend/          ← Root Directory en Vercel
│   ├── dist/         ← Output después del build
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json   ← Configuración de Vercel
└── supabase_schema.sql
```

### Verificación Post-Deploy

1. Accede a tu URL de Vercel
2. Deberías ver la pantalla de login
3. Inicia sesión con tus credenciales de Supabase
4. Verifica que la navegación funcione (recarga de página)
5. Crea un item para verificar que Supabase funciona

### Redeploy Manual

Si necesitas forzar un redeploy:
```bash
vercel --prod
```

O desde el dashboard de Vercel: "Deployments" → "..." → "Redeploy"
