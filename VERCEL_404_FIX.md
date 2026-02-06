# 🚨 SOLUCIÓN DEFINITIVA - 404 NOT_FOUND en Vercel

## El Problema

Tu código está en `frontend/` pero Vercel busca en la raíz del repositorio.

---

## ✅ SOLUCIÓN PASO A PASO

### 1. Ve a tu Proyecto en Vercel Dashboard

Accede a: https://vercel.com/dashboard

### 2. Settings → General

Busca la sección **"Build & Development Settings"**

### 3. Configura EXACTAMENTE así:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**IMPORTANTE:** 
- ✅ Root Directory debe ser **`frontend`** (sin `/` al final)
- ✅ Output Directory debe ser **`dist`** (NO `frontend/dist`)
- ✅ Framework Preset debe ser **`Vite`**

### 4. Guarda los Cambios

Click en **"Save"** al final de la sección

### 5. Redeploy

- Ve a la pestaña **"Deployments"**
- Click en el último deployment
- Click en los **tres puntos (...)** 
- Click en **"Redeploy"**
- Marca la opción **"Use existing Build Cache"** como **OFF**
- Click en **"Redeploy"**

---

## 📸 Configuración Visual

Tu configuración debe verse así:

```
┌─────────────────────────────────────────┐
│ Build & Development Settings           │
├─────────────────────────────────────────┤
│ Framework Preset                        │
│ [Vite                              ▼]  │
│                                         │
│ Root Directory                          │
│ [frontend                          ]   │
│                                         │
│ Build Command                           │
│ [npm run build                     ]   │
│                                         │
│ Output Directory                        │
│ [dist                              ]   │
│                                         │
│ Install Command                         │
│ [npm install                       ]   │
│                                         │
│                         [Save]          │
└─────────────────────────────────────────┘
```

---

## 🔍 Verificación

Después de redeploy, en los logs deberías ver:

```
✓ Cloning github.com/JordiMolto/MyMediaVerse
✓ Detected root directory: frontend
✓ Installing dependencies...
✓ Running build command: npm run build
✓ vite v6.0.7 building for production...
✓ built in XXXms
✓ Build completed
✓ Uploading build outputs
✓ Deployment ready
```

---

## ⚠️ Si Sigue Fallando

### Opción Alternativa: Mover el código a la raíz

Si Vercel no respeta el Root Directory:

```bash
# Desde la raíz del repo
cd MyMediaVerse
mv frontend/* .
mv frontend/.* . 2>/dev/null || true
rm -rf frontend
git add .
git commit -m "fix: Move frontend to root for Vercel"
git push
```

Luego en Vercel Settings:
```
Root Directory: (vacío)
Output Directory: dist
```

---

## 📝 Variables de Entorno

No olvides en **Settings → Environment Variables**:

```
VITE_SUPABASE_URL = https://hxlyhnalbhtqhsfztoxl.supabase.co
VITE_SUPABASE_ANON_KEY = tu_anon_key
```

Aplica para: **Production**, **Preview**, y **Development**

---

## 🎯 Checklist Final

- [ ] Root Directory configurado como `frontend`
- [ ] Framework Preset es `Vite`
- [ ] Output Directory es `dist`
- [ ] Variables de entorno configuradas
- [ ] Redeploy forzado (sin cache)
- [ ] Build logs muestran éxito
- [ ] URL de Vercel muestra la app (no 404)

---

## 💡 Tip

Si quieres ver exactamente qué está haciendo Vercel:

1. Ve al deployment
2. Click en "View Build Logs"
3. Busca líneas que digan:
   - `Detected root directory: frontend` ✅
   - `Command "npm run build" exited with 0` ✅
   - `Build completed` ✅

Si ves errores, cópialos y los revisamos.
