# 🔐 Sistema de Licencias - AREPA-TOOL

## 📋 Descripción

Sistema de control de licencias centralizado que permite habilitar/deshabilitar la aplicación remotamente desde Supabase, **independiente** del sistema de usuarios y actualizaciones.

## 🎯 Características

- ✅ Control global de activación/desactivación de la app
- ✅ Verificación de versión mínima requerida
- ✅ Mensajes personalizados para usuarios
- ✅ Fecha de expiración opcional
- ✅ **NO interfiere con usuarios existentes**
- ✅ Cambios instantáneos sin necesidad de actualizar la app

## 🔄 Migración desde GitHub

### Antes (GitHub)
```
https://raw.githubusercontent.com/.../license.json
```

### Ahora (Supabase)
```
Tabla: app_config
Función: get_license_config()
```

## 🛠️ Instalación

### Paso 1: Ejecutar Script SQL

Abre Supabase Dashboard → SQL Editor y ejecuta:

```sql
-- Contenido de: supabase-license-setup.sql
```

Esto creará:
- Tabla `app_config` con configuración global
- Función `get_license_config()` para leer configuración
- Políticas de seguridad (RLS)

### Paso 2: Verificar Datos Iniciales

La tabla `app_config` se crea con estos valores por defecto:

| Key | Value | Descripción |
|-----|-------|-------------|
| `app_enabled` | `true` | App habilitada |
| `app_message` | "AREPA-TOOL está funcionando..." | Mensaje cuando está habilitada |
| `app_disabled_message` | "Esta versión ha sido desactivada..." | Mensaje cuando está bloqueada |
| `app_welcome_message` | "Bienvenido a AREPA-TOOL v1.0" | Mensaje de bienvenida |
| `app_expiration_date` | `""` | Sin expiración |
| `app_minimum_version` | `1.0.0` | Versión mínima |
| `app_update_url` | `https://www.leope-gsm.com/` | URL de actualizaciones |

### Paso 3: Código C# Ya Actualizado

El `LicenseManager.cs` ya está configurado para usar Supabase:

```csharp
// Antes (GitHub)
private const string LICENSE_URL = "https://raw.githubusercontent.com/.../license.json";

// Ahora (Supabase)
var response = await supabase.Rpc("get_license_config", null);
```

## 📱 Uso del Panel Web

### Acceder a License Config

1. Abre `index.html` en tu navegador
2. Ve a la sección **"License Config"** en el menú lateral
3. Verás el formulario de configuración

### Opciones Disponibles

#### 1. App Status
```
✅ ENABLED  → La app funciona normalmente
❌ DISABLED → La app se bloquea para todos
```

#### 2. Minimum Version Required
```
Ejemplo: 1.0.0

Si un usuario tiene versión 0.9.0, será bloqueado
```

#### 3. Welcome Message
```
Mensaje que se muestra al iniciar la app
Ejemplo: "Bienvenido a AREPA-TOOL v1.0"
```

#### 4. Enabled Message
```
Mensaje interno cuando la app está habilitada
(No se muestra al usuario, solo para logs)
```

#### 5. Disabled Message
```
Mensaje que verá el usuario si la app está deshabilitada
Ejemplo: "Esta versión ha sido desactivada. Descarga la nueva desde LeoPE-GSM.COM"
```

#### 6. Expiration Date (Opcional)
```
Fecha en que la app dejará de funcionar
Dejar vacío = sin expiración
```

#### 7. Update URL
```
URL donde los usuarios pueden descargar actualizaciones
Ejemplo: https://www.leope-gsm.com/
```

## 🔄 Flujo de Verificación

```
Usuario abre AREPA-TOOL
    ↓
Form1_Load() ejecuta
    ↓
LicenseManager.VerificarLicencia()
    ↓
Conecta a Supabase
    ↓
Llama función get_license_config()
    ↓
¿App habilitada?
    ├─ NO → Muestra mensaje de error y cierra app
    └─ SÍ → Continúa
        ↓
        ¿Versión válida?
        ├─ NO → Muestra mensaje de actualización y cierra
        └─ SÍ → Continúa
            ↓
            ¿Expirada?
            ├─ SÍ → Muestra mensaje de expiración y cierra
            └─ NO → ✅ App inicia correctamente
```

## 🎨 Ejemplos de Uso

### Ejemplo 1: Deshabilitar la App Temporalmente

**Escenario**: Mantenimiento del servidor

```javascript
// En el panel web:
App Status: ❌ DISABLED
Disabled Message: "Mantenimiento programado. 
La app estará disponible en 2 horas. 
Disculpa las molestias."
```

**Resultado**: Todos los usuarios verán el mensaje y no podrán usar la app.

### Ejemplo 2: Forzar Actualización

**Escenario**: Nueva versión con cambios críticos

```javascript
// En el panel web:
App Status: ✅ ENABLED
Minimum Version: 1.1.0
Disabled Message: "Tu versión está desactualizada.
Descarga la versión 1.1.0 desde:
https://www.leope-gsm.com/"
```

**Resultado**: Usuarios con versión < 1.1.0 serán bloqueados.

### Ejemplo 3: Licencia con Expiración

**Escenario**: Versión de prueba

```javascript
// En el panel web:
App Status: ✅ ENABLED
Expiration Date: 2025-12-31
Disabled Message: "El periodo de prueba ha finalizado.
Contacta con LeoPE-GSM.COM para renovar."
```

**Resultado**: Después del 31/12/2025, la app se bloqueará automáticamente.

### Ejemplo 4: Bloquear Versión Específica

**Escenario**: Bug crítico en versión 1.0.5

```javascript
// En el panel web:
App Status: ✅ ENABLED
Minimum Version: 1.0.6
Disabled Message: "La versión 1.0.5 tiene un bug crítico.
Por favor actualiza a 1.0.6 desde:
https://www.leope-gsm.com/"
```

**Resultado**: Solo versión 1.0.5 será bloqueada, otras versiones funcionan.

## 🔐 Seguridad

### Row Level Security (RLS)

```sql
-- Todos pueden LEER la configuración (necesario para verificar licencia)
CREATE POLICY "Anyone can read app config"
    ON app_config FOR SELECT
    USING (true);

-- Solo admins pueden MODIFICAR
CREATE POLICY "Only admins can update config"
    ON app_config FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE email LIKE '%@leope-gsm.com'
    ));
```

### Fail-Closed

Si hay error al verificar la licencia, la app se **BLOQUEA** por seguridad:

```csharp
catch (Exception ex)
{
    // BLOQUEAR acceso (fail-closed)
    return (false, $"Error al verificar la licencia.\n\n{ex.Message}");
}
```

## 📊 Diferencias con Sistema de Actualizaciones

| Característica | Licencias | Actualizaciones |
|---------------|-----------|-----------------|
| **Propósito** | Controlar acceso global | Notificar nuevas versiones |
| **Tabla** | `app_config` | `app_versions` |
| **Cuándo se verifica** | Al abrir app (Form1_Load) | Después del login |
| **Acción** | Bloquea o permite acceso | Muestra diálogo de actualización |
| **Usuarios afectados** | TODOS | Solo los que tienen versión antigua |

## 🚨 Solución de Problemas

### Problema: "No se pudo verificar la licencia"

**Causa**: Error de conexión a Supabase

**Solución**:
1. Verifica que el script SQL se haya ejecutado
2. Verifica las credenciales en `SupabaseConfig.cs`
3. Verifica la conexión a internet

### Problema: "La app se bloquea para todos"

**Causa**: `app_enabled` está en `false`

**Solución**:
1. Abre el panel web
2. Ve a "License Config"
3. Cambia App Status a "ENABLED"
4. Guarda cambios

### Problema: "Usuarios con versión correcta son bloqueados"

**Causa**: `app_minimum_version` está mal configurado

**Solución**:
1. Verifica el formato de versión (X.Y.Z)
2. Ajusta `app_minimum_version` en el panel
3. Guarda cambios

## 🎓 Mejores Prácticas

1. **No abuses del bloqueo global**
   - Úsalo solo para mantenimientos críticos
   - Avisa a los usuarios con anticipación

2. **Mensajes claros**
   - Explica por qué la app está bloqueada
   - Proporciona una solución (URL de descarga, fecha de disponibilidad)

3. **Versión mínima**
   - Úsala solo para cambios críticos
   - Permite que versiones antiguas funcionen si es posible

4. **Prueba antes de aplicar**
   - Verifica los mensajes en un entorno de prueba
   - Asegúrate de que la lógica de versiones funcione correctamente

5. **Backup de configuración**
   - Guarda los valores actuales antes de cambiarlos
   - Puedes revertir rápidamente si algo sale mal

## 📝 Notas Importantes

1. **Independiente de usuarios**: Este sistema NO afecta la tabla `users` ni las suscripciones individuales
2. **Cambios instantáneos**: Los cambios se aplican inmediatamente, sin necesidad de reiniciar servidores
3. **Sin caché**: La app verifica la licencia cada vez que se abre, sin caché local
4. **Fail-closed**: Si hay error, la app se bloquea por seguridad

---

**Desarrollado para AREPA-TOOL** 🛠️
**By LeoPE-GSM.COM** 🌟
