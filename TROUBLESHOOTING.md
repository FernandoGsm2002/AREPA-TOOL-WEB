# 🔧 Troubleshooting - Sistema de Licencias

## ❌ Error: "APLICACIÓN DESACTIVADA"

### Causa Probable:
La tabla `app_config` no existe en Supabase o no tiene datos.

### Solución:

#### Paso 1: Verificar si la tabla existe
```sql
-- Ejecutar en Supabase SQL Editor
SELECT * FROM public.app_config;
```

**Si da error "table does not exist":**
- Ejecuta el script `supabase-license-setup.sql` completo

**Si retorna 0 filas:**
- La tabla existe pero está vacía
- Ejecuta solo la parte de INSERT del script

**Si retorna 3 filas:**
- ✅ La tabla está correcta
- El problema es otro (ver abajo)

#### Paso 2: Insertar configuración inicial

```sql
-- Ejecutar en Supabase SQL Editor
INSERT INTO public.app_config (key, value) VALUES
('app_enabled', 'true'),
('app_minimum_version', '1.0.0'),
('app_disabled_message', 'Esta versión de AREPA-TOOL ha sido desactivada.

Por favor descarga la última versión desde:
https://www.leope-gsm.com/')
ON CONFLICT (key) DO NOTHING;
```

#### Paso 3: Verificar que se insertó correctamente

```sql
SELECT * FROM public.app_config ORDER BY key;
```

**Deberías ver:**
```
key                    | value
-----------------------|-------
app_disabled_message   | Esta versión...
app_enabled            | true
app_minimum_version    | 1.0.0
```

#### Paso 4: Verificar la función

```sql
-- Ejecutar en Supabase SQL Editor
SELECT * FROM get_license_config();
```

**Deberías ver:**
```
enabled | message                          | minimum_version
--------|----------------------------------|----------------
true    | Esta versión de AREPA-TOOL...   | 1.0.0
```

#### Paso 5: Probar la app

1. Cierra AREPA-TOOL completamente
2. Abre AREPA-TOOL de nuevo
3. Debería iniciar normalmente

---

## 🔍 Otros Problemas Comunes

### Problema: "Error al verificar la licencia"

**Causa**: Error de conexión a Supabase

**Solución**:
1. Verifica tu conexión a internet
2. Verifica las credenciales en `SupabaseConfig.cs`:
   - `Url`: https://lumhpjfndlqhexnjmvtu.supabase.co
   - `AnonKey`: eyJhbGci...

### Problema: "Versión desactualizada"

**Causa**: `app_minimum_version` es mayor que `1.0.0`

**Solución**:
```sql
-- Cambiar versión mínima a 1.0.0
UPDATE public.app_config 
SET value = '1.0.0' 
WHERE key = 'app_minimum_version';
```

### Problema: App se bloquea inmediatamente

**Causa**: `app_enabled` está en `false`

**Solución**:
```sql
-- Habilitar la app
UPDATE public.app_config 
SET value = 'true' 
WHERE key = 'app_enabled';
```

---

## ✅ Checklist de Verificación

- [ ] Tabla `app_config` existe
- [ ] Tabla tiene 3 filas (app_enabled, app_minimum_version, app_disabled_message)
- [ ] Función `get_license_config()` existe
- [ ] `app_enabled` = 'true'
- [ ] `app_minimum_version` = '1.0.0'
- [ ] Conexión a internet funciona
- [ ] Credenciales de Supabase son correctas

---

## 📊 Configuración Actual Recomendada

Para la versión **1.0.0** de AREPA-TOOL:

```sql
-- Configuración recomendada
UPDATE public.app_config SET value = 'true' WHERE key = 'app_enabled';
UPDATE public.app_config SET value = '1.0.0' WHERE key = 'app_minimum_version';
UPDATE public.app_config SET value = 'Esta versión de AREPA-TOOL ha sido desactivada.

Por favor descarga la última versión desde:
https://www.leope-gsm.com/' WHERE key = 'app_disabled_message';
```

---

## 🚀 Comandos Rápidos

### Ver configuración actual
```sql
SELECT * FROM public.app_config ORDER BY key;
```

### Habilitar app
```sql
UPDATE public.app_config SET value = 'true' WHERE key = 'app_enabled';
```

### Deshabilitar app
```sql
UPDATE public.app_config SET value = 'false' WHERE key = 'app_enabled';
```

### Cambiar versión mínima
```sql
UPDATE public.app_config SET value = '1.1.0' WHERE key = 'app_minimum_version';
```

### Resetear todo a valores por defecto
```sql
DELETE FROM public.app_config;

INSERT INTO public.app_config (key, value) VALUES
('app_enabled', 'true'),
('app_minimum_version', '1.0.0'),
('app_disabled_message', 'Esta versión de AREPA-TOOL ha sido desactivada.

Por favor descarga la última versión desde:
https://www.leope-gsm.com/');
```

---

**Si el problema persiste**, contacta con soporte técnico con:
1. Screenshot del error
2. Resultado de `SELECT * FROM public.app_config;`
3. Resultado de `SELECT * FROM get_license_config();`
