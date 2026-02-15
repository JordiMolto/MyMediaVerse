# Diagnóstico de Problemas con Items y Categorías

## Problema reportado

Los items creados no aparecen en las vistas de Pendiente, En Progreso o Completado.

## Pasos para diagnosticar:

### 1. Verifica que ejecutaste los SQLs en Supabase

Debes haber ejecutado estos dos archivos en el SQL Editor de Supabase:

- ✅ `categories_migration.sql` - Crea la tabla de categorías
- ✅ `categories_update_items.sql` - Actualiza la tabla items para soportar categorías dinámicas

### 2. Abre la consola del navegador (F12)

Cuando intentes crear un item, busca:

- ❌ **Errores en rojo**: Indica que algo falló al guardar
- ⚠️ **Warnings en amarillo**: Puede indicar problemas de validación
- ℹ️ **Logs de red**: Ve a la pestaña "Network" y busca llamadas a Supabase que fallen

### 3. Errores comunes:

#### Error: "new row violates check constraint"

**Causa**: No ejecutaste `categories_update_items.sql`
**Solución**: Ejecuta el SQL que elimina la restricción CHECK de la columna `tipo`

#### Error: "relation 'categories' does not exist"

**Causa**: No ejecutaste `categories_migration.sql`
**Solución**: Ejecuta el SQL que crea la tabla de categorías

#### Los items se crean pero no aparecen

**Causa**: Problema con el filtrado por estado
**Solución**: Verifica que el estado del item sea exactamente 'pending', 'in_progress' o 'completed'

### 4. Verifica en Supabase directamente

1. Ve a tu dashboard de Supabase
2. Abre "Table Editor"
3. Selecciona la tabla `items`
4. ¿Ves los items que creaste?
   - **SÍ**: El problema está en el frontend (filtros o carga)
   - **NO**: El problema está en el guardado

### 5. Verifica la autenticación

1. Abre la consola del navegador
2. Escribe: `localStorage.getItem('supabase.auth.token')`
3. ¿Hay un token?
   - **SÍ**: Estás autenticado
   - **NO**: Necesitas hacer login de nuevo

## Solución rápida

Si nada funciona, ejecuta esto en la consola del navegador:

```javascript
// Ver el estado actual del store
const itemsStore = window.$nuxt?.$pinia?.state?.value?.items;
console.log("Items en el store:", itemsStore?.items);
console.log("Pending:", itemsStore?.pendingItems);
console.log("Loading:", itemsStore?.loading);
console.log("Error:", itemsStore?.error);
```

## Contacto

Si sigues teniendo problemas, comparte:

1. Captura de pantalla de la consola (F12)
2. Captura de la tabla `items` en Supabase
3. El mensaje de error exacto
