# 🛠️ AREPA-TOOL Admin Panel

Panel de administración web para gestionar usuarios, licencias, actualizaciones y anuncios de AREPA-TOOL.

## 🚀 Características

- ✅ Gestión de usuarios (aprobar, suspender, editar)
- ✅ Control de sesiones activas
- ✅ Logs de auditoría
- ✅ Estadísticas en tiempo real
- ✅ Sistema de actualizaciones
- ✅ Anuncios en tiempo real
- ✅ Control global de licencias

## 📋 Requisitos

- Proyecto de Supabase configurado
- Credenciales de Supabase (URL y Anon Key)

## 🔧 Configuración

### 1. Configurar Supabase

Edita `app.js` y actualiza las credenciales:

```javascript
const SUPABASE_URL = 'TU_URL_DE_SUPABASE';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
```

### 2. Ejecutar Scripts SQL

En Supabase SQL Editor, ejecuta en orden:

1. `supabase-setup.sql` - Tablas de usuarios y sesiones
2. `supabase-updates-setup.sql` - Sistema de actualizaciones y anuncios
3. `supabase-license-setup.sql` - Control global de licencias
4. `fix-announcements-permissions.sql` - Permisos para crear anuncios

### 3. Desplegar en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

O conecta tu repositorio de GitHub directamente en [vercel.com](https://vercel.com)

## 📱 Uso

### Gestión de Usuarios

1. Ve a la sección "Users"
2. Filtra por estado (Pending, Active, Suspended)
3. Aprueba usuarios pendientes con un click
4. Edita suscripciones y estados

### Crear Actualizaciones

1. Ve a "Updates"
2. Click en "Add New Version"
3. Ingresa versión, URL de descarga y changelog
4. Marca como obligatoria si es necesario

### Crear Anuncios

1. Ve a "Announcements"
2. Click en "Create Announcement"
3. Completa título, mensaje, tipo y prioridad
4. Configura fechas de inicio/fin (opcional)

### Control de Licencias

1. Ve a "License Config"
2. Habilita/deshabilita la app globalmente
3. Configura versión mínima requerida
4. Personaliza mensajes

## 🔐 Seguridad

- Las credenciales de Supabase son públicas (Anon Key)
- Row Level Security (RLS) protege los datos
- Solo admins pueden modificar configuraciones críticas

## 📚 Documentación

- `UPDATES-SYSTEM-README.md` - Sistema de actualizaciones
- `LICENSE-SYSTEM-README.md` - Sistema de licencias
- `TROUBLESHOOTING.md` - Solución de problemas

## 🌐 Demo

[Tu URL de Vercel aquí]

## 📞 Soporte

Para soporte técnico, contacta al equipo de ArepaTool

---

**Desarrollado para AREPA-TOOL** 🛠️
