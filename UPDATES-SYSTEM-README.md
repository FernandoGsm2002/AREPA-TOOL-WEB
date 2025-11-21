# 🚀 Sistema de Actualizaciones Automáticas y Anuncios - AREPA-TOOL

## 📋 Descripción General

Este sistema permite gestionar actualizaciones de la aplicación y enviar anuncios en tiempo real a todos los usuarios desde el panel de administración web.

## 🎯 Características

### ✨ Actualizaciones Automáticas
- ✅ Verificación automática cada 30 minutos
- ✅ Actualizaciones obligatorias o opcionales
- ✅ Descarga e instalación automática
- ✅ Changelog detallado
- ✅ Control de versiones (X.Y.Z)
- ✅ Tracking de actualizaciones por usuario

### 📢 Anuncios en Tiempo Real
- ✅ Verificación automática cada 5 minutos
- ✅ Diferentes tipos: Info, Warning, Error, Success
- ✅ Sistema de prioridades
- ✅ Segmentación por tipo de usuario (All, Active, Pending)
- ✅ Programación de fechas de inicio/fin
- ✅ Activación/desactivación instantánea

## 🛠️ Instalación

### Paso 1: Configurar Base de Datos

Ejecuta el script SQL en tu proyecto de Supabase:

```bash
# Abre Supabase Dashboard → SQL Editor
# Copia y pega el contenido de: supabase-updates-setup.sql
# Ejecuta el script
```

Este script creará:
- Tabla `app_versions` - Versiones de la aplicación
- Tabla `announcements` - Anuncios para usuarios
- Tabla `user_updates` - Tracking de actualizaciones
- Funciones RPC para consultas optimizadas
- Políticas de seguridad (RLS)

### Paso 2: Integrar en la Aplicación C#

El sistema ya está integrado en tu aplicación. Solo necesitas inicializarlo en `Form1.cs` o `Program.cs`:

```csharp
// En Form1_Load o después del login exitoso
private async void Form1_Load(object sender, EventArgs e)
{
    // Iniciar sistema de actualizaciones
    var updateManager = UpdateManager.Instance;
    
    // Configurar eventos
    updateManager.OnUpdateAvailable += (s, args) =>
    {
        // Se ejecuta cuando hay una actualización disponible
        this.Invoke((MethodInvoker)delegate
        {
            updateManager.ShowUpdateDialog(new Database.AppVersion
            {
                Version = args.Version,
                DownloadUrl = args.DownloadUrl,
                Changelog = args.Changelog,
                IsMandatory = args.IsMandatory,
                ReleaseDate = args.ReleaseDate
            });
        });
    };
    
    updateManager.OnNewAnnouncement += (s, args) =>
    {
        // Se ejecuta cuando hay un nuevo anuncio
        this.Invoke((MethodInvoker)delegate
        {
            var icon = args.Type switch
            {
                "warning" => MessageBoxIcon.Warning,
                "error" => MessageBoxIcon.Error,
                "success" => MessageBoxIcon.Information,
                _ => MessageBoxIcon.Information
            };
            
            MessageBox.Show(args.Message, args.Title, MessageBoxButtons.OK, icon);
        });
    };
    
    // Iniciar verificaciones automáticas
    updateManager.StartAutoUpdateCheck(30); // Cada 30 minutos
    updateManager.StartAnnouncementCheck(5); // Cada 5 minutos
}

// Al cerrar la aplicación
private void Form1_FormClosing(object sender, FormClosingEventArgs e)
{
    UpdateManager.Instance.Stop();
}
```

## 📱 Uso del Panel de Administración

### Gestionar Actualizaciones

1. **Accede al panel web**: `index.html`
2. **Ve a la sección "Updates"**
3. **Crear nueva versión**:
   - Click en "Add New Version"
   - Ingresa el número de versión (ej: 1.0.1)
   - Pega la URL de descarga (GitHub Release, Dropbox, etc.)
   - Escribe el changelog (opcional pero recomendado)
   - Marca "Mandatory Update" si quieres forzar la actualización
   - Click en "Create Version"

4. **Gestionar versiones existentes**:
   - **Activate**: Hace que la versión esté disponible para descarga
   - **Deactivate**: Oculta la versión (útil para rollback)
   - **Delete**: Elimina permanentemente la versión

### Crear Anuncios

1. **Ve a la sección "Announcements"**
2. **Click en "Create Announcement"**
3. **Completa el formulario**:
   - **Title**: Título del anuncio (ej: "Mantenimiento Programado")
   - **Message**: Mensaje completo
   - **Type**: 
     - `Info` - Información general (azul)
     - `Warning` - Advertencia (amarillo)
     - `Error` - Error crítico (rojo)
     - `Success` - Éxito/Buenas noticias (verde)
   - **Priority**: 0-100 (mayor número = mayor prioridad)
   - **Target Users**:
     - `All Users` - Todos los usuarios
     - `Active Only` - Solo usuarios activos
     - `Pending Only` - Solo usuarios pendientes
   - **Start Date**: Cuándo empezar a mostrar (opcional)
   - **End Date**: Cuándo dejar de mostrar (opcional)

4. **Click en "Create Announcement"**

### Ejemplos de Uso

#### Ejemplo 1: Actualización Opcional

```
Version: 1.0.1
Download URL: https://github.com/user/repo/releases/download/v1.0.1/AREPA-TOOL-v1.0.1.zip
Changelog:
🐛 Bug Fixes:
- Fixed crash when disconnecting device
- Improved stability in Magisk Patch

✨ Improvements:
- Faster ADB operations
- Better error messages

Mandatory: NO
```

#### Ejemplo 2: Actualización Obligatoria

```
Version: 2.0.0
Download URL: https://github.com/user/repo/releases/download/v2.0.0/AREPA-TOOL-v2.0.0.zip
Changelog:
🎉 Major Update!

⚠️ BREAKING CHANGES:
- New authentication system
- Database migration required

✨ New Features:
- Real-time announcements
- Auto-update system
- Improved UI

Mandatory: YES ✓
```

#### Ejemplo 3: Anuncio de Mantenimiento

```
Title: 🔧 Mantenimiento Programado
Message: El servidor estará en mantenimiento el 25/01/2025 de 2:00 AM a 4:00 AM. Durante este tiempo no podrás iniciar sesión. Las sesiones activas no se verán afectadas.
Type: Warning
Priority: 80
Target: All Users
Start Date: 24/01/2025 18:00
End Date: 25/01/2025 06:00
```

#### Ejemplo 4: Anuncio de Nueva Característica

```
Title: 🎉 Nueva Característica: Samsung KG Bypass
Message: Ya está disponible el nuevo método AREPA para bypass de Knox Guard en dispositivos Samsung. Encuéntralo en Samsung → KG Operations.
Type: Success
Priority: 50
Target: Active Only
Start Date: (vacío - inmediato)
End Date: (vacío - permanente)
```

## 🔄 Flujo de Actualización

```
1. Usuario abre AREPA-TOOL
   ↓
2. UpdateManager verifica versión cada 30 min
   ↓
3. Si hay nueva versión:
   ├─ Opcional: Muestra diálogo "¿Actualizar?"
   └─ Obligatoria: Muestra "Debes actualizar"
   ↓
4. Usuario acepta
   ↓
5. Descarga automática con barra de progreso
   ↓
6. Extrae archivos
   ↓
7. Ejecuta instalador
   ↓
8. Cierra aplicación actual
   ↓
9. Instalador actualiza archivos
   ↓
10. Usuario abre nueva versión
```

## 📊 Tracking de Actualizaciones

El sistema registra automáticamente:
- Qué usuarios actualizaron
- A qué versión actualizaron
- Desde qué dispositivo (HWID)
- Cuándo actualizaron

Puedes ver estas estadísticas en Supabase:
```sql
SELECT 
    u.username,
    uu.version,
    uu.updated_at,
    uu.device_id
FROM user_updates uu
JOIN users u ON u.id = uu.user_id
ORDER BY uu.updated_at DESC;
```

## 🔐 Seguridad

- ✅ RLS (Row Level Security) habilitado
- ✅ Solo usuarios autenticados pueden ver versiones activas
- ✅ Solo admins pueden crear/modificar versiones
- ✅ URLs de descarga verificadas
- ✅ Validación de versiones

## 🚨 Solución de Problemas

### La actualización no se descarga

1. Verifica que la URL de descarga sea accesible
2. Verifica que el archivo sea un ZIP válido
3. Revisa los logs de la aplicación

### Los anuncios no aparecen

1. Verifica que el anuncio esté **activo**
2. Verifica las fechas de inicio/fin
3. Verifica el target de usuarios
4. Reinicia la aplicación

### Error al crear versión

1. Verifica que el número de versión sea único
2. Verifica que la URL sea válida
3. Revisa los permisos en Supabase

## 📝 Notas Importantes

1. **Formato de Versión**: Usa siempre formato X.Y.Z (ej: 1.0.0, 2.1.5)
2. **URLs de Descarga**: Usa URLs directas (no páginas de descarga)
3. **Actualizaciones Obligatorias**: Úsalas solo para cambios críticos
4. **Anuncios**: No abuses de ellos para no molestar a los usuarios
5. **Testing**: Prueba las actualizaciones en un entorno de desarrollo primero

## 🎓 Mejores Prácticas

### Para Actualizaciones

- ✅ Escribe changelogs claros y detallados
- ✅ Usa versionado semántico (MAJOR.MINOR.PATCH)
- ✅ Prueba la actualización antes de publicarla
- ✅ Mantén backups de versiones anteriores
- ✅ Usa GitHub Releases para hosting confiable

### Para Anuncios

- ✅ Sé conciso y claro
- ✅ Usa el tipo correcto (info/warning/error/success)
- ✅ Establece fechas de fin para anuncios temporales
- ✅ Usa prioridades apropiadas
- ✅ Segmenta por tipo de usuario cuando sea necesario

## 🔗 Enlaces Útiles

- [Supabase Dashboard](https://app.supabase.com)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Semantic Versioning](https://semver.org/)

## 📞 Soporte

Si tienes problemas con el sistema de actualizaciones:
1. Revisa los logs de la aplicación
2. Verifica la configuración de Supabase
3. Contacta al desarrollador

---

**Desarrollado para AREPA-TOOL** 🛠️
