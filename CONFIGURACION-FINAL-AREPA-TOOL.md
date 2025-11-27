# ⚡ Configuración Final para AREPA-TOOL

## 🎯 TU CONFIGURACIÓN ESPECÍFICA

**Tu dominio:** `arepa-tool-web.vercel.app`

**Template actual (INCORRECTO):**
```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

**Problema:** `{{ .ConfirmationURL }}` es para confirmación de email, NO para reset de contraseña.

---

## ✅ SOLUCIÓN EN 3 PASOS

### PASO 1: Configurar URLs en Supabase (2 minutos)

1. Ve a: https://supabase.com/dashboard/project/lumhpjfndlqhexnjmvtu
2. Click en **Authentication** (menú izquierdo)
3. Click en **URL Configuration**
4. Configura exactamente así:

```
Site URL:
https://arepa-tool-web.vercel.app

Redirect URLs (agregar estas 3 líneas):
https://arepa-tool-web.vercel.app/reset-password
https://arepa-tool-web.vercel.app/hide.html
http://localhost:3000/reset-password
```

5. Click en **Save** (botón verde abajo)

---

### PASO 2: Actualizar Email Template (2 minutos)

1. En el mismo menú **Authentication**
2. Click en **Email Templates**
3. Busca y selecciona **"Change Email Password"** o **"Reset Password"**
4. **BORRA TODO** el contenido actual
5. **COPIA Y PEGA** este template completo:

```html
<h2>🔐 Recuperar Contraseña - AREPA-TOOL</h2>

<p>Hola,</p>

<p>Recibimos una solicitud para cambiar tu contraseña de <strong>AREPA-TOOL</strong>.</p>

<p>Haz click en el siguiente botón para cambiar tu contraseña:</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery" 
     style="background-color: #667eea; 
            color: white; 
            padding: 14px 28px; 
            text-decoration: none; 
            border-radius: 8px; 
            display: inline-block; 
            font-weight: bold;
            font-size: 16px;">
    🔑 Cambiar Contraseña
  </a>
</p>

<p>O copia y pega este link en tu navegador:</p>

<p style="background-color: #f5f5f5; 
          padding: 12px; 
          border-radius: 5px; 
          word-break: break-all;
          font-family: monospace;
          font-size: 13px;">
  {{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery
</p>

<div style="background-color: #fff3cd; 
            border-left: 4px solid #ffc107; 
            padding: 12px; 
            margin: 20px 0;
            border-radius: 4px;">
  <p style="margin: 0; color: #856404;">
    <strong>⚠️ Importante:</strong> Este link expira en <strong>1 hora</strong> y solo se puede usar una vez.
  </p>
</div>

<p>Si no solicitaste este cambio, puedes ignorar este email de forma segura. Tu contraseña no será cambiada.</p>

<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

<p style="color: #666; font-size: 13px;">
  Saludos,<br>
  <strong>Equipo AREPA-TOOL</strong>
</p>

<p style="color: #999; font-size: 11px; margin-top: 20px;">
  Este es un email automático, por favor no respondas a este mensaje.
</p>
```

6. Click en **Save**

---

### PASO 3: Subir Archivos a Vercel (1 minuto)

Asegúrate de que estos archivos estén en tu repositorio:

```
AREPA-TOOL-PANEL/
├── reset-password.html    ← NUEVO (página de cambio de contraseña)
├── hide.html              ← ACTUALIZADO (botón Reset Password)
├── app.js                 ← ACTUALIZADO (función sendPasswordResetEmail)
└── ... (otros archivos)
```

**Subir a Vercel:**
```bash
git add .
git commit -m "Add password reset system"
git push
```

Vercel desplegará automáticamente en: `https://arepa-tool-web.vercel.app`

---

## 🧪 PROBAR EL SISTEMA

### Test 1: Enviar Email de Reset

1. Abre: https://arepa-tool-web.vercel.app/hide.html
2. Ve a la sección **Users**
3. Busca un usuario de prueba
4. Click en el botón **🔑 Reset Password**
5. Confirma el envío
6. Debe mostrar: "Password reset email sent to [email]"

### Test 2: Verificar Email

1. Abre el email del usuario
2. Busca email de: `noreply@mail.app.supabase.io`
3. Revisa spam si no aparece
4. El email debe tener:
   - Botón "🔑 Cambiar Contraseña"
   - Link que empieza con: `https://arepa-tool-web.vercel.app/reset-password?token=...`

### Test 3: Cambiar Contraseña

1. Click en el botón del email
2. Debe abrir: `https://arepa-tool-web.vercel.app/reset-password?token=...`
3. **NO debe abrir localhost** ✅
4. Ingresa nueva contraseña (mínimo 6 caracteres)
5. Confirma la contraseña
6. Click "Reset Password"
7. Debe mostrar: "Password Changed Successfully!"
8. Redirige automáticamente al login

### Test 4: Login con Nueva Contraseña

1. Abre AREPA-TOOL (app C#)
2. Ingresa username y la **nueva contraseña**
3. Click "Login"
4. Debe entrar correctamente ✅

---

## 🔍 VERIFICACIÓN VISUAL

### ✅ CORRECTO

**Email debe verse así:**
```
🔐 Recuperar Contraseña - AREPA-TOOL

Hola,

Recibimos una solicitud para cambiar tu contraseña...

[Botón azul: 🔑 Cambiar Contraseña]

O copia y pega este link:
https://arepa-tool-web.vercel.app/reset-password?token=ABC123...

⚠️ Importante: Este link expira en 1 hora...
```

**Link debe ser:**
```
https://arepa-tool-web.vercel.app/reset-password?token=ABC123...&type=recovery
```

### ❌ INCORRECTO

**Si el link es así, está MAL:**
```
http://localhost:3000/reset-password?token=...  ❌
http://localhost:54321/auth/v1/verify?token=... ❌
https://lumhpjfndlqhexnjmvtu.supabase.co/...    ❌
```

**Solución:** Verifica que Site URL en Supabase sea: `https://arepa-tool-web.vercel.app`

---

## 🐛 TROUBLESHOOTING

### Problema 1: Email no llega

**Síntomas:** Click en "Reset Password" pero no llega email

**Solución:**
1. Espera 2-3 minutos (a veces tarda)
2. Revisa spam/correo no deseado
3. Verifica el email en Supabase:
   ```
   Dashboard → Authentication → Logs
   Busca: "Password recovery email sent"
   ```
4. Verifica que el usuario exista:
   ```sql
   SELECT * FROM auth.users WHERE email = 'usuario@ejemplo.com';
   ```

### Problema 2: Link redirige a localhost

**Síntomas:** Click en link del email abre `http://localhost:3000`

**Solución:**
1. Verifica Site URL en Supabase:
   - Debe ser: `https://arepa-tool-web.vercel.app`
   - NO debe ser: `http://localhost:3000`
2. Guarda cambios y espera 1 minuto
3. Solicita nuevo email de reset

### Problema 3: "Invalid or Expired Link"

**Síntomas:** Página muestra error de link inválido

**Solución:**
1. Verifica que el link tenga `?token=...&type=recovery`
2. Verifica que no hayan pasado más de 1 hora
3. Verifica que no se haya usado antes
4. Solicita nuevo link desde el panel admin

### Problema 4: Error al cambiar contraseña

**Síntomas:** Error al hacer click en "Reset Password"

**Solución:**
1. Verifica que la contraseña tenga al menos 6 caracteres
2. Verifica que ambas contraseñas coincidan
3. Abre consola del navegador (F12) y busca errores
4. Verifica que el archivo `reset-password.html` esté desplegado

---

## 📋 CHECKLIST FINAL

Antes de considerar que está listo:

### Configuración de Supabase
- [ ] Site URL: `https://arepa-tool-web.vercel.app`
- [ ] Redirect URLs agregadas (3 URLs)
- [ ] Email template actualizado (sin `{{ .ConfirmationURL }}`)
- [ ] Cambios guardados (botón "Save")

### Archivos en Vercel
- [ ] `reset-password.html` subido
- [ ] `hide.html` actualizado
- [ ] `app.js` actualizado
- [ ] Vercel desplegó correctamente

### Pruebas
- [ ] Email se envía correctamente
- [ ] Email llega a la bandeja
- [ ] Link abre `arepa-tool-web.vercel.app/reset-password`
- [ ] Link NO abre localhost
- [ ] Cambio de contraseña funciona
- [ ] Login con nueva contraseña funciona

---

## 🎯 RESUMEN DE CAMBIOS

### ANTES ❌
```
Site URL: http://localhost:3000
Email Template: {{ .ConfirmationURL }}
Resultado: Link redirige a localhost
```

### DESPUÉS ✅
```
Site URL: https://arepa-tool-web.vercel.app
Email Template: {{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery
Resultado: Link redirige a tu dominio de Vercel
```

---

## 📞 AYUDA ADICIONAL

### Ver Logs de Supabase
```
1. Dashboard → Authentication → Logs
2. Buscar eventos de "password recovery"
3. Ver errores si los hay
```

### Verificar Usuario
```sql
-- En Supabase SQL Editor
SELECT 
    u.username,
    u.email,
    u.status,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id::uuid
WHERE u.email = 'usuario@ejemplo.com';
```

### Verificar Resets Enviados
```sql
-- En Supabase SQL Editor
SELECT 
    al.created_at,
    u.username,
    u.email,
    al.details
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.action = 'password_reset_sent'
ORDER BY al.created_at DESC
LIMIT 10;
```

---

## ✅ CONFIGURACIÓN COMPLETADA

Si seguiste todos los pasos:

1. ✅ Site URL configurado: `https://arepa-tool-web.vercel.app`
2. ✅ Email template actualizado correctamente
3. ✅ Archivos desplegados en Vercel
4. ✅ Sistema de password reset funcional

**¡Tu sistema está listo para producción!** 🎉

---

## 📝 NOTAS FINALES

### Variables de Supabase (NO cambiar)
- `{{ .SiteURL }}` = Tu dominio configurado
- `{{ .Token }}` = Token único de recuperación
- `{{ .TokenHash }}` = Hash del token (no usar)

### Variables INCORRECTAS (NO usar)
- `{{ .ConfirmationURL }}` ❌ (para confirmación de email)
- URLs hardcodeadas ❌
- Localhost ❌

### Personalización
Puedes cambiar:
- Textos del email
- Colores del botón
- Diseño de `reset-password.html`
- Logo de la empresa

**NO cambies:**
- La estructura del link: `{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery`
- Las variables de Supabase

---

**¡Listo! Tu configuración específica para `arepa-tool-web.vercel.app` está completa.** 🚀

