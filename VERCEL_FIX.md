# 🚨 SOLUCIÓN RÁPIDA - Error Vercel "vue-cli-service: command not found"

## El Problema
Vercel está detectando automáticamente el proyecto como Vue CLI, pero usas **Vite**.

## ✅ SOLUCIÓN (Paso a Paso)

### 1. Ve a tu proyecto en Vercel Dashboard

### 2. Settings → General

Busca la sección **"Build & Development Settings"** y configura:

```
Framework Preset: Other
Root Directory: frontend
Build Command: cd frontend && npm run build
Output Directory: frontend/dist
Install Command: cd frontend && npm install
```

**IMPORTANTE:** 
- Framework Preset debe ser **"Other"** (NO "Vite" ni "Vue.js")
- Todos los comandos deben incluir `cd frontend &&` porque el root del repo no es la carpeta frontend

### 3. Settings → Environment Variables

Añade estas variables (si no las has añadido):

```
VITE_SUPABASE_URL = https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc...
```

### 4. Deployments → Redeploy

- Ve a la pestaña "Deployments"
- Click en el último deployment fallido
- Click en "..." (tres puntos)
- Click "Redeploy"

---

## Alternativa: Usar Vercel CLI

Si prefieres deployar desde la terminal:

```bash
cd frontend
npm install -g vercel
vercel
```

Cuando te pregunte:
- Set up and deploy? → **Yes**
- Which scope? → Tu cuenta
- Link to existing project? → **Yes** (si ya existe) o **No** (para crear nuevo)
- What's your project's name? → `mymediaverse`
- In which directory is your code located? → `./`
- Want to override settings? → **Yes**
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Development Command: `npm run dev`

---

## ¿Por qué falla?

Vercel detecta automáticamente frameworks, pero a veces se equivoca:
- ❌ Detectó: Vue CLI (usa `vue-cli-service build`)
- ✅ Real: Vite (usa `vite build`)

Al cambiar a "Other" y especificar comandos manualmente, Vercel usa exactamente lo que le dices.

---

## Verificación Post-Deploy

Una vez que el deploy sea exitoso:

1. ✅ Verás "Build Successful" en verde
2. ✅ Accede a tu URL de Vercel
3. ✅ Deberías ver la pantalla de Login
4. ✅ Inicia sesión y verifica que funcione

---

## Troubleshooting Adicional

**Si sigue fallando:**

1. Verifica que `package.json` tenga:
   ```json
   "scripts": {
     "build": "vue-tsc && vite build"
   }
   ```

2. Intenta cambiar el build command a:
   ```
   cd frontend && npm install && npm run build
   ```

3. Asegúrate de que el Root Directory sea exactamente `frontend` (sin `/` al final)
