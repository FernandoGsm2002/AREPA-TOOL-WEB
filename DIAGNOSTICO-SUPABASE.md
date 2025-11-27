# 🔍 DIAGNÓSTICO: Token Corto en Password Reset

## ❌ PROBLEMA ACTUAL

**Token recibido:** `72514748` (8 dígitos)
**Token esperado:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (100+ caracteres)

---

## 🎯 CAUSA RAÍZ

Supabase está generando un token corto porque:

1. **El email template NO está usando `{{ .Token }}`**
2. **O estás usando el template incorrecto** (Confirm signup en lugar de Reset Password)
3. **O el Site URL no está configurado correctamente**

---

## ✅ SOLUCIÓN PASO A PASO

### PASO 1: Verificar que estás en el template correcto

1. Ve a: https://supabase.com/dashboard/project/lumhpjfndlqhexnjmvtu
2. Click: **Authentication** → **Email Templates**
3. Debes ver una lista de templates:
   - ✅ **"Change Email Password"** o **"Reset Password"** ← ESTE ES EL CORRECTO
   - ❌ "Confirm signup" ← NO es este
   - ❌ "Magic Link" ← NO es este
   - ❌ "Change Email Address" ← NO es este

4. **Asegúrate de estar editando "Change Email Password" o "Reset Password"**

---

### PASO 2: Verificar el contenido del template

**Abre el template correcto y busca esta línea:**

```html
<a href="{{ .ConfirmationURL }}">
```

**Si encuentras esa línea, está MAL. Debe ser:**

```html
<a href="{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery">
```

---

### PASO 3: Reemplazar TODO el template

**BORRA TODO** el contenido actual y **PEGA ESTO:**

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

---

### PASO 4: Verificar Site URL

1. En el mismo menú **Authentication**
2. Click en **URL Configuration**
3. Verifica que **Site URL** sea:
   ```
   https://arepa-tool-web.vercel.app
   ```
4. **NO debe ser:**
   - `http://localhost:3000` ❌
   - `http://localhost:54321` ❌
   - Cualquier otra URL ❌

---

### PASO 5: Guardar y Probar

1. Click en **"Save"** (botón verde)
2. Espera 10 segundos
3. Ve al panel admin: https://arepa-tool-web.vercel.app/hide.html
4. Envía un nuevo reset password
5. **El token DEBE ser largo ahora**

---

## 🔍 VERIFICACIÓN

### ✅ Token CORRECTO (después de arreglar):

```
https://arepa-tool-web.vercel.app/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzM3NTg5MjAwLCJzdWIiOiI4ZjQyYzQxZS0zYjJlLTRhNzMtOGE1Zi1kZjE2YzQwYjQwYzEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7fSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvdHAiLCJ0aW1lc3RhbXAiOjE3Mzc1ODU2MDB9XSwic2Vzc2lvbl9pZCI6IjEyMzQ1Njc4LTkwYWItY2RlZi0xMjM0LTU2Nzg5MGFiY2RlZiIsImlzX2Fub255bW91cyI6ZmFsc2V9.abcdefghijklmnopqrstuvwxyz1234567890&type=recovery
```

**Características:**
- ✅ Token es LARGO (más de 100 caracteres)
- ✅ Empieza con `eyJ`
- ✅ Tiene puntos (`.`) en el medio
- ✅ Termina con `&type=recovery`

### ❌ Token INCORRECTO (actual):

```
https://arepa-tool-web.vercel.app/reset-password?token=72514748&type=recovery
```

**Problemas:**
- ❌ Token es CORTO (solo 8 dígitos)
- ❌ Solo números
- ❌ No es un JWT válido

---

## 🐛 SI SIGUE SIN FUNCIONAR

### Opción 1: Verificar en Supabase Dashboard

1. Ve a: **Authentication** → **Users**
2. Busca el usuario
3. Click en los 3 puntos (⋮)
4. Click en **"Send password recovery"**
5. Revisa el email que llega
6. El token debe ser largo

### Opción 2: Verificar Logs

1. Ve a: **Logs** → **Auth Logs**
2. Busca eventos de "password recovery"
3. Verifica que no haya errores

### Opción 3: Recrear el Template

1. En **Email Templates**
2. Click en **"Reset to default"** (si existe)
3. Luego modifica el default con nuestro template

---

## 📸 SCREENSHOT NECESARIO

Para ayudarte mejor, necesito un screenshot de:

1. **La lista de Email Templates** (para ver cuál estás editando)
2. **El contenido del template** (las primeras 20 líneas)
3. **URL Configuration** (Site URL y Redirect URLs)

---

## 🎯 RESUMEN

**El problema es 100% del email template en Supabase.**

No es un problema de código, ni de Vercel, ni de la página de reset.

**Debes:**
1. Estar en el template correcto ("Change Email Password")
2. Usar `{{ .Token }}` (no `{{ .ConfirmationURL }}`)
3. Tener Site URL configurado correctamente

**Cuando lo arregles, el token será largo y todo funcionará.** 🚀

