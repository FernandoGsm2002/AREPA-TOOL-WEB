# 🔧 Configuración de Supabase: Paso a Paso con Imágenes

## 📋 ANTES DE EMPEZAR

**Necesitas:**
- ✅ Acceso a tu proyecto de Supabase
- ✅ Tu dominio de Vercel desplegado
- ✅ 5 minutos de tiempo

**URL de tu proyecto:**
```
https://supabase.com/dashboard/project/lumhpjfndlqhexnjmvtu
```

---

## 🎯 PASO 1: Configurar URLs de Redirección

### 1.1 Acceder a Authentication

```
1. Abre tu proyecto en Supabase Dashboard
2. En el menú lateral izquierdo, busca "Authentication"
3. Click en "Authentication"
```

### 1.2 Ir a URL Configuration

```
1. Dentro de Authentication, busca "URL Configuration"
2. Click en "URL Configuration"
```

### 1.3 Configurar Site URL

**Ubicación:** Primera sección "Site URL"

**ANTES (incorrecto):**
```
http://localhost:3000
```

**DESPUÉS (correcto):**
```
https://arepa-tool-panel.vercel.app
```

**⚠️ IMPORTANTE:**
- Reemplaza `arepa-tool-panel.vercel.app` con TU dominio de Vercel
- NO incluyas `/` al final
- Debe empezar con `https://`

### 1.4 Configurar Redirect URLs

**Ubicación:** Segunda sección "Redirect URLs"

**Agregar estas URLs (una por línea):**
```
https://arepa-tool-panel.vercel.app/reset-password
https://arepa-tool-panel.vercel.app/hide.html
http://localhost:3000/reset-password
```

**⚠️ IMPORTANTE:**
- Reemplaza `arepa-tool-panel.vercel.app` con TU dominio
- La última línea (localhost) es para desarrollo local
- Cada URL en una línea separada

### 1.5 Guardar Cambios

```
1. Scroll hasta abajo
2. Click en el botón verde "Save"
3. Espera confirmación: "Successfully updated settings"
```

---

## 📧 PASO 2: Configurar Email Template

### 2.1 Acceder a Email Templates

```
1. En el menú "Authentication" (mismo del paso anterior)
2. Busca "Email Templates"
3. Click en "Email Templates"
```

### 2.2 Seleccionar Template de Reset Password

```
1. Verás una lista de templates
2. Busca "Change Email Password" o "Reset Password"
3. Click en ese template
```

### 2.3 Actualizar el Template

**Ubicación:** Editor de texto grande

**BORRAR TODO** el contenido actual y reemplazar con:

```html
<h2>Recuperar Contraseña - AREPA-TOOL</h2>

<p>Hola,</p>

<p>Recibimos una solicitud para cambiar tu contraseña de AREPA-TOOL.</p>

<p>Haz click en el siguiente botón para cambiar tu contraseña:</p>

<p>
  <a href="{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery" 
     style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
    Cambiar Contraseña
  </a>
</p>

<p>O copia y pega este link en tu navegador:</p>
<p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
  {{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery
</p>

<p><strong>⚠️ Este link expira en 1 hora.</strong></p>

<p>Si no solicitaste este cambio, puedes ignorar este email de forma segura.</p>

<hr>

<p style="color: #666; font-size: 12px;">
  Saludos,<br>
  Equipo AREPA-TOOL
</p>
```

**⚠️ IMPORTANTE:**
- NO cambies `{{ .SiteURL }}`, `{{ .Token }}` - son variables de Supabase
- Mantén exactamente: `?token={{ .Token }}&type=recovery`
- Puedes personalizar los textos y colores

### 2.4 Guardar Template

```
1. Scroll hasta abajo
2. Click en "Save"
3. Espera confirmación
```

---

## ✅ PASO 3: Verificar Configuración

### 3.1 Verificar Site URL

```
1. Vuelve a "URL Configuration"
2. Verifica que Site URL sea tu dominio de Vercel
3. NO debe ser localhost
```

**Correcto ✅:**
```
https://arepa-tool-panel.vercel.app
```

**Incorrecto ❌:**
```
http://localhost:3000
http://localhost:54321
```

### 3.2 Verificar Redirect URLs

```
1. En "Redirect URLs"
2. Debe haber al menos 2 URLs:
   - https://tu-dominio.vercel.app/reset-password
   - https://tu-dominio.vercel.app/hide.html
```

### 3.3 Verificar Email Template

```
1. Vuelve a "Email Templates" → "Reset Password"
2. Busca esta línea en el template:
   {{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery
3. Debe estar exactamente así
```

---

## 🧪 PASO 4: Probar la Configuración

### 4.1 Enviar Email de Prueba

```
1. Abre tu panel admin: https://tu-dominio.vercel.app/hide.html
2. Ve a la sección "Users"
3. Busca un usuario de prueba
4. Click en "Reset Password"
5. Confirma el envío
```

### 4.2 Verificar Email Enviado

**Opción A: Revisar Logs en Supabase**
```
1. En Supabase Dashboard
2. Authentication → Logs
3. Busca el evento más reciente
4. Debe decir: "Password recovery email sent"
```

**Opción B: Revisar Email del Usuario**
```
1. Abre el email del usuario de prueba
2. Busca email de: noreply@mail.app.supabase.io
3. Revisa spam si no aparece
```

### 4.3 Probar el Link

```
1. Abre el email recibido
2. Click en el botón "Cambiar Contraseña"
3. Debe abrir: https://tu-dominio.vercel.app/reset-password?token=...
4. NO debe abrir localhost
```

### 4.4 Cambiar Contraseña

```
1. En la página de reset-password.html
2. Ingresa una nueva contraseña
3. Confirma la contraseña
4. Click "Reset Password"
5. Debe mostrar: "Password Changed Successfully!"
6. Redirige automáticamente al login
```

### 4.5 Probar Login

```
1. Abre AREPA-TOOL (app C#)
2. Ingresa username y la NUEVA contraseña
3. Click "Login"
4. Debe entrar correctamente ✅
```

---

## 🔍 TROUBLESHOOTING

### Problema 1: Email no llega

**Síntomas:**
- Click en "Reset Password" pero no llega email
- Han pasado más de 5 minutos

**Solución:**
```
1. Revisar spam/correo no deseado
2. Verificar que el email del usuario sea correcto:
   - Panel Admin → Users → Ver email
3. Revisar logs en Supabase:
   - Authentication → Logs
   - Buscar errores
4. Verificar que el usuario exista en auth.users:
   - SQL Editor → SELECT * FROM auth.users WHERE email = 'email@ejemplo.com'
```

### Problema 2: Link redirige a localhost

**Síntomas:**
- Click en link del email
- Abre: http://localhost:3000/reset-password
- Error: "No se puede acceder"

**Solución:**
```
1. Verificar Site URL en Supabase:
   - Authentication → URL Configuration
   - Site URL debe ser tu dominio de Vercel
   - NO debe ser localhost

2. Verificar Email Template:
   - Authentication → Email Templates → Reset Password
   - Debe usar: {{ .SiteURL }}/reset-password
   - NO debe tener localhost hardcodeado

3. Guardar cambios y probar de nuevo
```

### Problema 3: "Invalid or Expired Link"

**Síntomas:**
- Click en link del email
- Página muestra: "Invalid or Expired Link"

**Solución:**
```
1. Verificar que el link tenga estos parámetros:
   - ?token=XXXXXX
   - &type=recovery

2. Verificar que no hayan pasado más de 1 hora

3. Verificar que no se haya usado antes (solo 1 uso)

4. Solicitar nuevo link desde el panel admin
```

### Problema 4: Error al cambiar contraseña

**Síntomas:**
- Ingresa nueva contraseña
- Click "Reset Password"
- Muestra error

**Solución:**
```
1. Verificar que la contraseña tenga al menos 6 caracteres

2. Verificar que ambas contraseñas coincidan

3. Abrir consola del navegador (F12):
   - Ver errores en rojo
   - Copiar el error completo

4. Verificar que el token sea válido:
   - No debe haber expirado (1 hora)
   - No debe haberse usado antes
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

Antes de considerar que está configurado correctamente:

### Configuración de Supabase
- [ ] Site URL configurado con dominio de Vercel
- [ ] Redirect URLs agregadas (al menos 2)
- [ ] Email template actualizado con nuevo formato
- [ ] Cambios guardados (botón "Save" clickeado)

### Pruebas Funcionales
- [ ] Email de reset se envía correctamente
- [ ] Email llega a la bandeja (o spam)
- [ ] Link del email abre reset-password.html
- [ ] Link NO redirige a localhost
- [ ] Página de reset carga correctamente
- [ ] Cambio de contraseña funciona
- [ ] Redirige al login después de cambiar
- [ ] Login con nueva contraseña funciona

### Documentación
- [ ] Equipo informado del nuevo proceso
- [ ] Documentación guardada en repositorio
- [ ] Proceso documentado para futuros admins

---

## 📝 NOTAS ADICIONALES

### Personalización del Email

Puedes personalizar:

**Colores:**
```html
<!-- Cambiar color del botón -->
style="background-color: #TU_COLOR; ..."
```

**Textos:**
```html
<!-- Cambiar cualquier texto -->
<p>Tu mensaje personalizado aquí</p>
```

**Logo:**
```html
<!-- Agregar logo al inicio -->
<img src="https://tu-dominio.com/logo.png" alt="Logo" style="width: 150px;">
```

### SMTP Personalizado (Opcional)

Para mejorar la entrega de emails:

```
1. Settings → Auth → SMTP Settings
2. Configurar con:
   - SendGrid (gratis hasta 100/día)
   - AWS SES (muy barato)
   - Gmail SMTP (para testing)
```

**Beneficios:**
- ✅ Mejor deliverability
- ✅ Menos probabilidad de spam
- ✅ Email personalizado (tu@tudominio.com)
- ✅ Estadísticas de envío

---

## 🎯 RESUMEN VISUAL

```
┌─────────────────────────────────────────┐
│  SUPABASE DASHBOARD                     │
├─────────────────────────────────────────┤
│                                         │
│  Authentication                         │
│  ├─ URL Configuration                   │
│  │  ├─ Site URL: tu-dominio.vercel.app │
│  │  └─ Redirect URLs:                  │
│  │     ├─ /reset-password              │
│  │     └─ /hide.html                   │
│  │                                      │
│  └─ Email Templates                     │
│     └─ Reset Password                   │
│        └─ {{ .SiteURL }}/reset-password│
│           ?token={{ .Token }}           │
│           &type=recovery                │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ CONFIGURACIÓN COMPLETADA

Si seguiste todos los pasos:

1. ✅ Supabase está configurado correctamente
2. ✅ Emails se envían al dominio correcto
3. ✅ Los usuarios pueden recuperar su contraseña
4. ✅ El sistema es seguro y funcional

**¡Felicidades! 🎉**

Tu sistema de recuperación de contraseña está listo para producción.

