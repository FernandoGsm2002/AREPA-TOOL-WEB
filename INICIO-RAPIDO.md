# ⚡ INICIO RÁPIDO - Password Reset para AREPA-TOOL

## 🎯 TU SITUACIÓN ACTUAL

**Dominio:** `arepa-tool-web.vercel.app`

**Problema encontrado:**
```html
<!-- Template INCORRECTO actual -->
<a href="{{ .ConfirmationURL }}">Reset Password</a>
```

**Por qué está mal:**
- `{{ .ConfirmationURL }}` es para **confirmación de email**, NO para reset de contraseña
- Redirige a localhost en lugar de tu dominio
- Los usuarios no pueden recuperar su contraseña

---

## ✅ SOLUCIÓN EN 3 PASOS (5 MINUTOS)

### 📍 PASO 1: Configurar Site URL (1 minuto)

1. Abre: https://supabase.com/dashboard/project/lumhpjfndlqhexnjmvtu
2. Click: **Authentication** → **URL Configuration**
3. Cambia **Site URL** a:
   ```
   https://arepa-tool-web.vercel.app
   ```
4. En **Redirect URLs**, agrega estas 3 líneas:
   ```
   https://arepa-tool-web.vercel.app/reset-password
   https://arepa-tool-web.vercel.app/hide.html
   http://localhost:3000/reset-password
   ```
5. Click: **Save**

---

### 📧 PASO 2: Actualizar Email Template (2 minutos)

1. En el mismo menú: **Authentication** → **Email Templates**
2. Selecciona: **"Change Email Password"** o **"Reset Password"**
3. **BORRA TODO** el contenido actual
4. **COPIA** este template completo:

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

5. **PEGA** en el editor de Supabase
6. Click: **Save**

---

### 📤 PASO 3: Subir Archivos (2 minutos)

Los archivos ya están creados, solo súbelos:

```bash
git add .
git commit -m "Add password reset system"
git push
```

Vercel desplegará automáticamente en: `https://arepa-tool-web.vercel.app`

---

## 🧪 PROBAR QUE FUNCIONA (1 minuto)

### Test Rápido:

1. Abre: https://arepa-tool-web.vercel.app/hide.html
2. Ve a **Users**
3. Click en **🔑 Reset Password** de cualquier usuario
4. Revisa el email del usuario
5. El link debe ser: `https://arepa-tool-web.vercel.app/reset-password?token=...`
6. **NO debe ser:** `http://localhost:3000/...` ❌

---

## ✅ VERIFICACIÓN RÁPIDA

### ¿Está configurado correctamente?

**Verifica en Supabase:**
- [ ] Site URL = `https://arepa-tool-web.vercel.app`
- [ ] Redirect URLs tiene 3 URLs
- [ ] Email template usa `{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery`
- [ ] Email template NO usa `{{ .ConfirmationURL }}`

**Verifica en Vercel:**
- [ ] Archivo `reset-password.html` está desplegado
- [ ] Archivo `hide.html` actualizado
- [ ] Archivo `app.js` actualizado

**Prueba funcional:**
- [ ] Email se envía
- [ ] Link abre tu dominio (no localhost)
- [ ] Cambio de contraseña funciona
- [ ] Login con nueva contraseña funciona

---

## 🐛 SI ALGO NO FUNCIONA

### Email no llega
→ Revisa spam, espera 2-3 minutos

### Link abre localhost
→ Verifica Site URL en Supabase (debe ser `arepa-tool-web.vercel.app`)

### "Invalid Link"
→ Token expiró (1h) o ya se usó, solicita nuevo

### Error al cambiar contraseña
→ Verifica que `reset-password.html` esté en Vercel

---

## 📚 DOCUMENTACIÓN COMPLETA

Si necesitas más detalles:

1. **CONFIGURACION-FINAL-AREPA-TOOL.md** - Tu configuración específica
2. **EMAIL-TEMPLATE-RESET-PASSWORD.html** - Template completo con notas
3. **README-PASSWORD-RESET.md** - Índice de toda la documentación

---

## 🎉 ¡LISTO!

Si completaste los 3 pasos:

✅ Tu sistema de password reset está **FUNCIONAL**
✅ Los emails redirigen a **tu dominio** (no localhost)
✅ Los usuarios pueden **recuperar su contraseña**

**Tiempo total:** ~5 minutos ⚡

---

## 📞 AYUDA RÁPIDA

**Ver logs de emails:**
```
Supabase Dashboard → Authentication → Logs
```

**Verificar usuario:**
```sql
SELECT * FROM auth.users WHERE email = 'usuario@ejemplo.com';
```

**Ver resets enviados:**
```sql
SELECT * FROM audit_logs 
WHERE action = 'password_reset_sent' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

**¡Tu configuración para `arepa-tool-web.vercel.app` está lista!** 🚀

