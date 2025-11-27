# 🔐 SOLUCIÓN: Cambio de Contraseña en Supabase

## ❌ PROBLEMA IDENTIFICADO

Cuando un usuario solicita cambiar su contraseña en Supabase, el email de recuperación redirige a `localhost` en lugar de tu dominio real. Esto sucede porque:

1. **Supabase Auth** está configurado con URLs de redirección por defecto
2. No tienes una página de recuperación de contraseña en tu panel web
3. La configuración de `Site URL` en Supabase apunta a localhost

---

## ✅ SOLUCIÓN COMPLETA

### 1️⃣ CONFIGURAR SUPABASE (Dashboard)

Ve a tu proyecto de Supabase: https://lumhpjfndlqhexnjmvtu.supabase.co

#### A) Configurar Authentication URLs

1. Ve a **Authentication** → **URL Configuration**
2. Configura las siguientes URLs:

```
Site URL: https://tu-dominio-vercel.vercel.app
Redirect URLs: 
  - https://tu-dominio-vercel.vercel.app/reset-password
  - https://tu-dominio-vercel.vercel.app/hide.html
```

#### B) Configurar Email Templates

1. Ve a **Authentication** → **Email Templates**
2. Selecciona **Reset Password**
3. Cambia el template para que use tu URL:

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery">Reset Password</a></p>
```

---

### 2️⃣ CREAR PÁGINA DE RESET PASSWORD

He creado el archivo `reset-password.html` que debes subir a tu proyecto.

**Características:**
- ✅ Valida el token de recuperación
- ✅ Permite cambiar la contraseña
- ✅ Diseño consistente con tu panel
- ✅ Manejo de errores
- ✅ Redirección automática al login

---

### 3️⃣ ACTUALIZAR PANEL DE ADMINISTRACIÓN

He actualizado `hide.html` para agregar:
- Sección de gestión de usuarios con opción de **Reset Password**
- Botón para enviar email de recuperación manualmente

---

### 4️⃣ AGREGAR FUNCIÓN EN APP.JS

He agregado funciones para:
- Enviar email de recuperación desde el panel admin
- Manejar el reset de contraseña

---

## 📋 PASOS DE IMPLEMENTACIÓN

### Paso 1: Actualizar Supabase Dashboard
```
1. Ir a: https://supabase.com/dashboard/project/lumhpjfndlqhexnjmvtu
2. Authentication → URL Configuration
3. Cambiar Site URL a tu dominio de Vercel
4. Agregar Redirect URLs
5. Guardar cambios
```

### Paso 2: Subir Archivos Nuevos
```bash
# Subir a tu repositorio o Vercel
- reset-password.html (NUEVO)
- hide.html (ACTUALIZADO)
- app.js (ACTUALIZADO)
```

### Paso 3: Probar el Flujo
```
1. Usuario hace click en "Forgot Password" en LoginForm
2. Ingresa su email
3. Recibe email con link a: https://tu-dominio.vercel.app/reset-password?token=...
4. Cambia su contraseña
5. Redirige al login
```

---

## 🔧 ALTERNATIVA: RESET MANUAL DESDE ADMIN

Si prefieres que **solo el admin** pueda resetear contraseñas:

### Opción A: Enviar Email de Reset
```javascript
// En el panel admin, botón "Send Reset Email"
await sendPasswordResetEmail(userEmail);
```

### Opción B: Cambiar Contraseña Directamente
```javascript
// Requiere Service Role Key (más peligroso)
await adminUpdateUserPassword(userId, newPassword);
```

---

## 📝 NOTAS IMPORTANTES

### Seguridad
- ✅ Los tokens de recuperación expiran en 1 hora
- ✅ Solo se puede usar 1 vez
- ✅ Supabase hashea las contraseñas automáticamente
- ⚠️ NO uses Service Role Key en el frontend

### Emails
- Los emails se envían desde: `noreply@mail.app.supabase.io`
- Puedes personalizar el remitente en Supabase → Settings → Auth
- Considera usar un servicio SMTP personalizado para producción

### Testing
- En desarrollo, puedes ver los emails en: Supabase Dashboard → Authentication → Logs
- Los links de reset funcionan solo 1 vez

---

## 🚀 MEJORAS FUTURAS

1. **Email Personalizado**: Configurar SMTP propio (Gmail, SendGrid, etc.)
2. **Verificación de Email**: Activar confirmación de email al registrarse
3. **2FA**: Agregar autenticación de dos factores
4. **Rate Limiting**: Limitar intentos de reset por IP

---

## 📞 SOPORTE

Si tienes problemas:
1. Verifica que las URLs en Supabase coincidan con tu dominio
2. Revisa los logs en Supabase Dashboard → Authentication → Logs
3. Verifica que el email del usuario exista en la tabla `auth.users`

