# 🔐 BYPASS REGISTRATIONS SYSTEM - GUÍA DE IMPLEMENTACIÓN

## 📋 RESUMEN
Sistema completo de registro y gestión de Serial Numbers (SN) para Bypass iOS 12+ con actualización en tiempo real entre la aplicación C# y el panel web administrativo.

---

## 🗄️ PASO 1: CONFIGURAR BASE DE DATOS

### 1.1 Ejecutar SQL en Supabase
1. Ir a tu proyecto Supabase: https://supabase.com/dashboard
2. Ir a **SQL Editor**
3. Abrir el archivo: `bypass-registrations-setup.sql`
4. Copiar todo el contenido y ejecutarlo
5. Verificar que la tabla se creó correctamente:
   ```sql
   SELECT * FROM public.bypass_registrations;
   ```

### 1.2 Habilitar Realtime
1. Ir a **Database** → **Replication**
2. Buscar la tabla `bypass_registrations`
3. Activar el toggle para habilitar Realtime
4. Guardar cambios

---

## 💻 PASO 2: COMPILAR APLICACIÓN C#

### 2.1 Archivos Nuevos Creados
- ✅ `Managers/BypassManager.cs` - Maneja comunicación con Supabase
- ✅ `Forms/BypassStatusForm.cs` - Ventana de estado en tiempo real
- ✅ `Brands/AppleOperations.cs` - Actualizado con lógica de registro

### 2.2 Compilar Proyecto
```bash
cd TT-Tool/TT-Tool
dotnet build --configuration Release
```

O desde Visual Studio:
- Build → Build Solution (Ctrl+Shift+B)

### 2.3 Verificar Credenciales Supabase
Asegúrate que `Config/SupabaseConfig.cs` tenga las credenciales correctas:
```csharp
public static string SupabaseUrl = "https://tu-proyecto.supabase.co";
public static string SupabaseAnonKey = "tu-anon-key";
```

---

## 🌐 PASO 3: CONFIGURAR PANEL WEB

### 3.1 Archivos Actualizados
- ✅ `hide.html` - Nueva pestaña "Bypass Registrations"
- ✅ `app.js` - Funciones de gestión y realtime

### 3.2 Verificar Conexión Supabase
En `app.js`, verifica que las credenciales sean correctas:
```javascript
const supabase = createClient(
    'https://tu-proyecto.supabase.co',
    'tu-anon-key'
);
```

### 3.3 Probar Panel Web
1. Abrir `hide.html` en navegador
2. Iniciar sesión como admin
3. Ir a la pestaña "Bypass Registrations"
4. Debería cargar la tabla vacía

---

## 🚀 PASO 4: PROBAR EL SISTEMA

### 4.1 Desde la Aplicación C#
1. Abrir AREPA-TOOL
2. Ir al botón **Qualcomm** (ahora muestra Apple Operations)
3. Pestaña **BYPASS 12+**
4. Ingresar un Serial Number de prueba: `TEST123456789`
5. Click en **Register**
6. Debería mostrar: "✅ Registration Successful!"

### 4.2 Verificar en Panel Web
1. En `hide.html`, ir a **Bypass Registrations**
2. Debería aparecer el registro automáticamente (realtime)
3. Estado: **Pending** (amarillo)
4. Badge en sidebar muestra contador de pending

### 4.3 Aprobar/Rechazar desde Panel
1. Click en **Approve** o **Reject**
2. Ingresar notas (opcional para approve, obligatorio para reject)
3. El estado cambia inmediatamente

### 4.4 Ver Estado en Tiempo Real (App C#)
1. En la app, ingresar el mismo SN: `TEST123456789`
2. Click en **🔍 Check Registration Status**
3. Se abre ventana con estado actual
4. La ventana se actualiza automáticamente cada 10 segundos
5. Cuando cambies el estado en el panel web, se verá reflejado en la app

---

## 🔄 FLUJO COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO EN APP C#                        │
│  1. Ingresa Serial Number                                   │
│  2. Click "Register"                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE DATABASE                          │
│  - Tabla: bypass_registrations                             │
│  - Status: pending                                          │
│  - Realtime enabled                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  PANEL WEB (hide.html)                      │
│  - Recibe notificación realtime                            │
│  - Muestra nuevo registro                                   │
│  - Admin puede aprobar/rechazar                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              USUARIO VERIFICA ESTADO                        │
│  - Click "Check Registration Status"                       │
│  - Ve estado actualizado en tiempo real                    │
│  - Auto-refresh cada 10 segundos                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 CARACTERÍSTICAS IMPLEMENTADAS

### ✅ Aplicación C# (AppleOperations)
- [x] Campo de texto para ingresar SN
- [x] Botón "Register" con validación
- [x] Envío a Supabase con username y email
- [x] Detección de SN duplicados
- [x] Botón "Check Registration Status"
- [x] Ventana modal con estado en tiempo real
- [x] Auto-refresh cada 10 segundos
- [x] Indicadores visuales por estado (pending/approved/rejected)

### ✅ Panel Web (hide.html)
- [x] Nueva pestaña "Bypass Registrations"
- [x] Tabla con todos los registros
- [x] Filtros: All/Pending/Approved/Rejected
- [x] Contadores por estado
- [x] Badge en sidebar con pending count
- [x] Botones: Approve, Reject, View, Delete
- [x] Actualización en tiempo real (Realtime)
- [x] Notificaciones de nuevos registros

### ✅ Base de Datos (Supabase)
- [x] Tabla `bypass_registrations`
- [x] Campos: SN, username, email, status, notes, timestamps
- [x] Índices para performance
- [x] Row Level Security (RLS)
- [x] Trigger para updated_at automático
- [x] Realtime habilitado

---

## 🔧 TROUBLESHOOTING

### Problema: No se envía el registro
**Solución:**
- Verificar credenciales Supabase en `SupabaseConfig.cs`
- Verificar que la tabla existe en Supabase
- Revisar logs en la app C#

### Problema: Panel web no muestra registros
**Solución:**
- Verificar credenciales en `app.js`
- Abrir consola del navegador (F12) y buscar errores
- Verificar que el usuario admin tiene permisos

### Problema: Realtime no funciona
**Solución:**
- Verificar que Realtime está habilitado en Supabase
- Verificar que la tabla está en la publicación `supabase_realtime`
- Recargar la página del panel web

### Problema: "Serial number already registered"
**Solución:**
- Es normal, el SN ya existe en la base de datos
- Usar otro SN o eliminar el registro desde el panel

---

## 📝 PRÓXIMOS PASOS (OPCIONAL)

### Mejoras Sugeridas:
1. **Validación de formato de SN** - Regex para validar formato correcto
2. **Historial de cambios** - Tabla audit para tracking
3. **Notificaciones push** - Notificar al usuario cuando se aprueba
4. **Exportar a Excel** - Botón para descargar registros
5. **Búsqueda avanzada** - Filtrar por username, fecha, etc.
6. **Estadísticas** - Gráficos de registros por día/semana
7. **Notas del usuario** - Campo para que el usuario agregue info adicional

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisar logs en la app C# (txtLogs)
2. Revisar consola del navegador (F12)
3. Verificar que Supabase está funcionando
4. Revisar que las credenciales son correctas

---

## ✨ CRÉDITOS

Sistema desarrollado para ArepaTool V1.0.1
By ArepaTool Team

---

**¡SISTEMA LISTO PARA USAR!** 🎉
