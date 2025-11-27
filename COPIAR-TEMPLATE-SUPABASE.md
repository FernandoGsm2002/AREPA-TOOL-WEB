# 📋 COPIAR TEMPLATE A SUPABASE - Paso a Paso

## 🎯 LO QUE VEO EN TU PANTALLA

Estás en el lugar correcto: **Supabase → Authentication → Email Templates → Reset Password**

Pero veo que el template tiene algunas variables incorrectas.

---

## ✅ PASOS PARA CORREGIR

### 1️⃣ BORRAR TODO EL CONTENIDO ACTUAL

En el editor de Supabase:
1. Presiona `Ctrl + A` (seleccionar todo)
2. Presiona `Delete` (borrar)
3. El editor debe quedar completamente vacío

---

### 2️⃣ COPIAR EL TEMPLATE CORRECTO

**Abre el archivo:** `TEMPLATE-SUPABASE-CORRECTO.html`

**O copia directamente desde aquí:**

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

### 3️⃣ PEGAR EN SUPABASE

1. Copia TODO el código de arriba
2. Ve al editor de Supabase (donde estás ahora)
3. Pega con `Ctrl + V`
4. Verifica que se vea bien

---

### 4️⃣ VERIFICAR VARIABLES IMPORTANTES

Asegúrate de que estas líneas estén EXACTAMENTE así:

**Línea del botón:**
```html
<a href="{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery"
```

**Línea del link de texto:**
```html
{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery
```

**⚠️ IMPORTANTE:**
- Debe ser `{{ .Token }}` (con punto)
- NO debe ser `{{ Token }}` (sin punto)
- NO debe ser `{{ .TokenHash }}`
- NO debe ser `{{ .ConfirmationURL }}`

---

### 5️⃣ GUARDAR

1. Click en el botón verde **"Save changes"** (abajo a la derecha)
2. Espera la confirmación
3. ¡Listo!

---

## 🧪 PROBAR EL TEMPLATE

### Después de guardar:

1. Ve a tu panel: https://arepa-tool-web.vercel.app/hide.html
2. Click en **Users**
3. Click en **🔑 Reset Password** de un usuario
4. Revisa el email
5. El link debe ser: `https://arepa-tool-web.vercel.app/reset-password?token=XXXXXX&type=recovery`

**El token debe ser LARGO** (no solo números cortos como `57117713`)

---

## 🔍 VERIFICAR QUE ESTÁ CORRECTO

### ✅ CORRECTO:

**Link en el email:**
```
https://arepa-tool-web.vercel.app/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&type=recovery
```

**Características:**
- ✅ Empieza con tu dominio: `arepa-tool-web.vercel.app`
- ✅ Token es LARGO (100+ caracteres)
- ✅ Tiene `&type=recovery` al final

### ❌ INCORRECTO:

**Link en el email:**
```
http://localhost:3000/reset-password?token=57117713&type=recovery
```

**Problemas:**
- ❌ Apunta a localhost
- ❌ Token es muy corto (solo números)

---

## 🐛 SI EL TOKEN ES MUY CORTO

Si el token sigue siendo corto (como `57117713`), significa que estás usando la variable incorrecta.

**Verifica en el template:**
```html
<!-- INCORRECTO ❌ -->
{{ .TokenHash }}

<!-- CORRECTO ✅ -->
{{ .Token }}
```

---

## 📞 AYUDA ADICIONAL

### Ver el template actual en Supabase:

1. Authentication → Email Templates
2. Reset Password
3. Verifica que diga exactamente: `{{ .Token }}`

### Ver logs de emails enviados:

1. Authentication → Logs
2. Busca: "Password recovery email sent"
3. Verifica el link generado

---

## ✅ CHECKLIST FINAL

Antes de probar:

- [ ] Template copiado completamente
- [ ] Variables correctas: `{{ .SiteURL }}` y `{{ .Token }}`
- [ ] Guardado con "Save changes"
- [ ] Vercel terminó de desplegar (1-2 minutos)
- [ ] Site URL configurado: `https://arepa-tool-web.vercel.app`

---

**¡Listo! Ahora el sistema de password reset funcionará correctamente.** 🚀

