# ⚡ GUÍA RÁPIDA: Configurar Password Reset en 5 Minutos

## 🎯 OBJETIVO
Permitir que los usuarios recuperen su contraseña cuando la olvidan.

---

## ✅ PASO 1: Subir Archivos Nuevos (2 minutos)

Sube estos archivos a tu proyecto en Vercel/GitHub:

```
AREPA-TOOL-PANEL/
├── reset-password.html          ← NUEVO (página de cambio de contraseña)
├── hide.html                    ← ACTUALIZADO (botón Reset Password)
├── app.js                       ← ACTUALIZADO (función sendPasswordResetEmail)
└── fix-password-reset-config.sql ← NUEVO (documentación SQL)
```

**Cómo subir:**
```bash
# Si usas Git
git add .
git commit -m "Add password reset functionality"
git push

# Vercel desplegará automáticamente
```

---

## ✅ PASO 2: Configurar Supabase (3 minutos)

### A) Configurar URLs de Redirección

1. Ve a: https://supabase.com/dashboard/project/lumhpjfndlqhexnjmvtu
2. Click en **Authentication** (menú izquierdo)
3. Click en **URL Configuration**
4. Configura:

```
Site URL:
https://arepa-tool-panel.vercel.app

Redirect URLs (agregar estas líneas):
https://arepa-tool-panel.vercel.app/reset-password
https://arepa-tool-panel.vercel.app/hide.html
```

5. Click **Save**

### B) Actualizar Email Template

1. En el mismo menú **Authentication**
2. Click en **Email Templates**
3. Selecciona **Reset Password** (Change Email Password)
4. Reemplaza el contenido con:

```html
<h2>Recuperar Contraseña - AREPA-TOOL</h2>

<p>Hola,</p>

<p>Recibimos una solicitud para cambiar tu contraseña de AREPA-TOOL.</p>

<p>Haz click en el siguiente botón para cambiar tu contraseña:</p>

<p>
  <a href="{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery" 
     style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
    Cambiar Contraseña
  </a>
</p>

<p>O copia y pega este link en tu navegador:</p>
<p>{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery</p>

<p><strong>Este link expira en 1 hora.</strong></p>

<p>Si no solicitaste este cambio, puedes ignorar este email de forma segura.</p>

<p>Saludos,<br>Equipo AREPA-TOOL</p>
```

5. Click **Save**

---

## ✅ PASO 3: Probar el Sistema (1 minuto)

### Opción A: Desde el Panel Admin

1. Abre: https://arepa-tool-panel.vercel.app/hide.html
2. Ve a la sección **Users**
3. Busca un usuario de prueba
4. Click en el botón **🔑 Reset Password**
5. Confirma el envío
6. Revisa el email del usuario

### Opción B: Desde la App C#

1. Abre AREPA-TOOL
2. Click en **"Forgot your password?"**
3. Sigue las instrucciones para contactar al admin
4. El admin envía el email desde el panel (Opción A)

---

## 🎉 ¡LISTO!

Ahora el flujo completo funciona:

```
Usuario olvida contraseña
    ↓
Admin envía email de reset desde panel
    ↓
Usuario recibe email con link
    ↓
Usuario hace click en el link
    ↓
Se abre: reset-password.html
    ↓
Usuario ingresa nueva contraseña
    ↓
Contraseña actualizada ✅
    ↓
Redirige al login
```

---

## 🔍 VERIFICAR QUE TODO FUNCIONA

### Test 1: Enviar Email de Reset
```
1. Panel Admin → Users → Click "Reset Password"
2. Debe mostrar: "Password reset email sent to [email]"
3. Revisa el email del usuario
```

### Test 2: Cambiar Contraseña
```
1. Abre el link del email
2. Debe cargar: reset-password.html
3. Ingresa nueva contraseña
4. Click "Reset Password"
5. Debe mostrar: "Password Changed Successfully!"
6. Redirige al login automáticamente
```

### Test 3: Login con Nueva Contraseña
```
1. Abre AREPA-TOOL
2. Ingresa username y nueva contraseña
3. Debe hacer login correctamente ✅
```

---

## ❌ TROUBLESHOOTING

### Problema: "Invalid or Expired Link"
**Solución:**
- El link expira en 1 hora
- Solo se puede usar 1 vez
- Solicita un nuevo link desde el panel

### Problema: "Email no llega"
**Solución:**
1. Revisa spam/correo no deseado
2. Verifica que el email esté correcto en la BD
3. Ve a Supabase → Authentication → Logs para ver si se envió
4. Considera configurar SMTP personalizado

### Problema: "Redirect a localhost"
**Solución:**
- Verifica que Site URL en Supabase sea tu dominio de Vercel
- NO debe ser http://localhost:3000
- Debe ser: https://tu-dominio.vercel.app

### Problema: "Token inválido"
**Solución:**
- Asegúrate de que el email template use:
  `{{ .Token }}` (no `{{ .ConfirmationURL }}`)
- El parámetro debe ser: `?token={{ .Token }}&type=recovery`

---

## 📝 NOTAS IMPORTANTES

### Seguridad
- ✅ Los tokens expiran en 1 hora
- ✅ Solo se pueden usar una vez
- ✅ Supabase hashea las contraseñas automáticamente
- ✅ Rate limiting: máximo 4 emails por hora por dirección

### Emails en Producción
Para mejorar la entrega de emails, configura SMTP personalizado:

1. Ve a: Settings → Auth → SMTP Settings
2. Opciones recomendadas:
   - **SendGrid** (gratis hasta 100 emails/día)
   - **AWS SES** (muy barato)
   - **Gmail SMTP** (para testing)

### Personalización
Puedes personalizar:
- El diseño de `reset-password.html`
- El template del email en Supabase
- El mensaje en la app C# (LoginForm.cs)

---

## 🚀 MEJORAS FUTURAS

1. **Confirmación de Email al Registrarse**
   - Settings → Auth → Enable email confirmations

2. **Autenticación de Dos Factores (2FA)**
   - Agregar TOTP o SMS

3. **Historial de Cambios de Contraseña**
   - Crear tabla `password_changes` en Supabase

4. **Notificación de Cambio de Contraseña**
   - Enviar email cuando se cambia la contraseña

---

## 📞 SOPORTE

Si algo no funciona:

1. **Revisa los logs:**
   - Supabase Dashboard → Authentication → Logs

2. **Verifica la configuración:**
   - Site URL debe ser tu dominio de Vercel
   - Redirect URLs deben incluir /reset-password

3. **Prueba el email template:**
   - Envía un test desde el panel admin

4. **Contacta al desarrollador:**
   - Proporciona screenshots de los errores
   - Incluye los logs de Supabase

---

## ✅ CHECKLIST FINAL

Antes de considerar que está listo, verifica:

- [ ] Archivos subidos a Vercel/GitHub
- [ ] Site URL configurado en Supabase
- [ ] Redirect URLs agregadas
- [ ] Email template actualizado
- [ ] Test de envío de email exitoso
- [ ] Test de cambio de contraseña exitoso
- [ ] Test de login con nueva contraseña exitoso
- [ ] Documentación actualizada

---

**¡Felicidades! 🎉 Tu sistema de recuperación de contraseña está listo.**

