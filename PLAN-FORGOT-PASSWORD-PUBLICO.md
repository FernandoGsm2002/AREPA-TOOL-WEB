# 🔐 Plan: Formulario Público de "¿Olvidaste tu Contraseña?"

## 🎯 OBJETIVO

Agregar un formulario en la landing page (`https://arepa-tool-web.vercel.app`) donde los usuarios puedan solicitar un reset de contraseña sin necesidad de contactar al admin.

---

## 📋 UBICACIÓN

**Página:** `index.html` (Landing page principal)

**Sección sugerida:** 
- Agregar un botón en el navbar: "Recuperar Contraseña"
- O agregar una sección nueva antes del footer

---

## 🎨 DISEÑO PROPUESTO

### Opción 1: Modal/Popup

**Ventajas:**
- No interrumpe el flujo de la landing page
- Diseño limpio y moderno
- Fácil de implementar

**Ubicación:**
- Botón en el navbar: "¿Olvidaste tu contraseña?"
- Click abre un modal centrado

**Contenido del Modal:**
```
┌─────────────────────────────────────┐
│  🔐 Recuperar Contraseña            │
├─────────────────────────────────────┤
│                                     │
│  Ingresa tu email registrado:       │
│  ┌───────────────────────────────┐  │
│  │ email@ejemplo.com             │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   Enviar Link de Recuperación │  │
│  └───────────────────────────────┘  │
│                                     │
│  ℹ️ Recibirás un email con un link │
│     para cambiar tu contraseña.    │
│                                     │
└─────────────────────────────────────┘
```

### Opción 2: Página Dedicada

**Ventajas:**
- Más espacio para instrucciones
- Mejor para SEO
- Más profesional

**Ubicación:**
- Crear `forgot-password.html`
- Link en el navbar y footer

**URL:**
```
https://arepa-tool-web.vercel.app/forgot-password
```

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### Archivos a Crear/Modificar:

1. **`forgot-password.html`** (si usas Opción 2)
   - Formulario con campo de email
   - Botón de envío
   - Mensajes de éxito/error
   - Diseño consistente con tu landing

2. **`forgot-password.js`** (o agregar a `app.js`)
   - Función para enviar el reset
   - Validación de email
   - Manejo de respuestas

3. **`index.html`** (modificar)
   - Agregar botón/link en navbar
   - O agregar modal si usas Opción 1

---

## 📝 FLUJO DE USUARIO

```
Usuario en Landing Page
    ↓
Click en "¿Olvidaste tu contraseña?"
    ↓
Se abre modal/página con formulario
    ↓
Usuario ingresa su email
    ↓
Click en "Enviar"
    ↓
JavaScript llama a Supabase API
    ↓
Supabase envía email con link
    ↓
Mensaje de éxito: "Revisa tu email"
    ↓
Usuario recibe email
    ↓
Click en link del email
    ↓
Abre reset-password.html
    ↓
Cambia su contraseña
    ↓
✅ Listo
```

---

## 💻 CÓDIGO NECESARIO

### 1. HTML del Formulario

**Ubicación:** Modal en `index.html` o nueva página `forgot-password.html`

**Elementos:**
- Input de email (con validación)
- Botón de envío
- Área de mensajes (éxito/error)
- Spinner de carga

**Diseño:**
- Usar los mismos colores de tu brand (#00d9ff, #ef4444)
- Fondo oscuro (#0a0e1a)
- Tipografía Orbitron para títulos

---

### 2. JavaScript para Enviar Reset

**Ubicación:** `forgot-password.js` o agregar a `app.js`

**Funcionalidad:**
```javascript
async function sendPasswordReset(email) {
    // 1. Validar email
    // 2. Llamar a Supabase API
    // 3. Mostrar mensaje de éxito
    // 4. Manejar errores
}
```

**API a usar:**
```javascript
fetch('https://lumhpjfndlqhexnjmvtu.supabase.co/auth/v1/recover', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': 'TU_ANON_KEY'
    },
    body: JSON.stringify({
        email: email,
        options: {
            redirectTo: 'https://arepa-tool-web.vercel.app/reset-password'
        }
    })
})
```

---

### 3. Validaciones

**Email:**
- Formato válido (regex)
- No vacío
- Mostrar error si es inválido

**Seguridad:**
- Rate limiting (máximo 3 intentos por minuto)
- No revelar si el email existe o no (siempre mostrar "Email enviado")
- Usar ANON_KEY (no Service Role Key)

---

## 🎨 DISEÑO VISUAL

### Colores (de tu brand):

```css
--primary-cyan: #00d9ff;
--primary-red: #ef4444;
--bg-dark: #0a0e1a;
--text-light: #f8fafc;
--text-gray: #94a3b8;
```

### Componentes:

**Input de Email:**
```css
- Fondo: rgba(255, 255, 255, 0.05)
- Border: 2px solid rgba(255, 255, 255, 0.1)
- Focus: border-color #00d9ff
- Padding: 14px
- Border-radius: 8px
```

**Botón de Envío:**
```css
- Background: #ef4444
- Color: white
- Padding: 14px 28px
- Border-radius: 8px
- Hover: #dc2626
- Font: Orbitron, bold
```

**Mensajes:**
```css
- Éxito: background rgba(34, 197, 94, 0.1), color #86efac
- Error: background rgba(239, 68, 68, 0.1), color #fca5a5
- Border-radius: 12px
- Padding: 16px
```

---

## 📱 RESPONSIVE

**Desktop (>768px):**
- Modal: 500px de ancho
- Centrado en pantalla

**Mobile (<768px):**
- Modal: 90% del ancho
- Padding reducido
- Botón full-width

---

## 🔒 SEGURIDAD

### Consideraciones:

1. **No revelar información:**
   - Siempre mostrar "Email enviado" (aunque el email no exista)
   - No decir "Email no encontrado"

2. **Rate Limiting:**
   - Máximo 3 intentos por minuto por IP
   - Usar localStorage para tracking

3. **Validación:**
   - Validar formato de email en frontend
   - Supabase valida en backend

4. **CORS:**
   - Ya configurado en `vercel.json`
   - Permite llamadas desde tu dominio

---

## 📊 MENSAJES AL USUARIO

### Éxito:
```
✅ Email Enviado

Si existe una cuenta con este email, recibirás un link 
de recuperación en los próximos minutos.

Revisa tu bandeja de entrada y spam.
```

### Error (genérico):
```
❌ Error al Enviar

Hubo un problema al procesar tu solicitud.
Por favor intenta de nuevo en unos minutos.
```

### Validación:
```
⚠️ Email Inválido

Por favor ingresa un email válido.
```

### Rate Limit:
```
⏱️ Demasiados Intentos

Has solicitado muchos resets. 
Por favor espera 1 minuto antes de intentar de nuevo.
```

---

## 🧪 TESTING

### Casos a Probar:

1. **Email válido existente:**
   - ✅ Debe enviar email
   - ✅ Mostrar mensaje de éxito

2. **Email válido NO existente:**
   - ✅ Mostrar mensaje de éxito (no revelar que no existe)
   - ✅ No enviar email

3. **Email inválido:**
   - ✅ Mostrar error de validación
   - ✅ No llamar a la API

4. **Múltiples intentos:**
   - ✅ Bloquear después de 3 intentos
   - ✅ Mostrar mensaje de rate limit

5. **Responsive:**
   - ✅ Funciona en mobile
   - ✅ Funciona en desktop

---

## 📂 ESTRUCTURA DE ARCHIVOS

```
AREPA-TOOL-PANEL/
├── index.html                    ← Modificar (agregar botón/modal)
├── forgot-password.html          ← Crear (si usas Opción 2)
├── forgot-password.js            ← Crear (lógica del formulario)
├── reset-password.html           ← Ya existe ✅
├── app.js                        ← Modificar (o usar forgot-password.js)
├── landing.css                   ← Modificar (estilos del formulario)
└── vercel.json                   ← Ya configurado ✅
```

---

## 🚀 IMPLEMENTACIÓN PASO A PASO

### Fase 1: Diseño (30 min)
1. Decidir: ¿Modal o página dedicada?
2. Crear mockup del diseño
3. Definir textos y mensajes

### Fase 2: HTML (20 min)
1. Crear estructura del formulario
2. Agregar botón en navbar
3. Agregar estilos CSS

### Fase 3: JavaScript (30 min)
1. Crear función de envío
2. Agregar validaciones
3. Implementar rate limiting
4. Manejar respuestas

### Fase 4: Testing (20 min)
1. Probar con email válido
2. Probar con email inválido
3. Probar rate limiting
4. Probar en mobile

### Fase 5: Deploy (10 min)
1. Commit y push
2. Verificar en Vercel
3. Probar en producción

**Tiempo total estimado:** ~2 horas

---

## 💡 MEJORAS FUTURAS

1. **Captcha:**
   - Agregar reCAPTCHA para prevenir bots
   - Proteger contra spam

2. **Historial:**
   - Guardar en `audit_logs` cuando se solicita reset
   - Ver estadísticas en panel admin

3. **Notificaciones:**
   - Notificar al admin cuando hay muchos resets
   - Dashboard de actividad

4. **Personalización:**
   - Permitir al usuario elegir idioma
   - Emails en español/inglés

---

## 📞 SOPORTE

### Si algo no funciona:

1. **Verificar en consola del navegador:**
   - F12 → Console
   - Ver errores de JavaScript

2. **Verificar en Supabase:**
   - Dashboard → Authentication → Logs
   - Ver si llegó la solicitud

3. **Verificar CORS:**
   - Debe permitir tu dominio
   - Ya configurado en `vercel.json`

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

Cuando implementes, verifica:

- [ ] Formulario visible en la landing page
- [ ] Input de email con validación
- [ ] Botón de envío funcional
- [ ] Llamada a Supabase API correcta
- [ ] Mensajes de éxito/error claros
- [ ] Rate limiting implementado
- [ ] Diseño responsive (mobile + desktop)
- [ ] Colores consistentes con tu brand
- [ ] Email se envía correctamente
- [ ] Link del email funciona
- [ ] Reset de contraseña funciona
- [ ] Testing completo realizado
- [ ] Deploy en Vercel exitoso

---

## 🎯 RESULTADO FINAL

**Usuario puede:**
1. ✅ Ir a tu landing page
2. ✅ Click en "¿Olvidaste tu contraseña?"
3. ✅ Ingresar su email
4. ✅ Recibir email automáticamente
5. ✅ Cambiar su contraseña
6. ✅ Todo sin contactar al admin

**Beneficios:**
- ✅ Mejor experiencia de usuario
- ✅ Menos trabajo para el admin
- ✅ Más profesional
- ✅ Escalable (funciona con muchos usuarios)

---

**¡Listo para implementar cuando quieras!** 🚀

