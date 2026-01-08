# 🔌 CONFIGURACIÓN DHRU - Server Service para Activar Licencias

## 📋 FLUJO DE ACTIVACIÓN

```
┌─────────────────────────────────────────────────────────────────┐
│  1. CLIENTE SE REGISTRA                                         │
│     └─→ arepa-tool-web.vercel.app                               │
│         Estado: PENDING                                         │
│                                                                 │
│  2. CLIENTE COMPRA EN DHRU                                      │
│     └─→ Ingresa su correo                                       │
│                                                                 │
│  3. DHRU LLAMA TU API                                           │
│     └─→ /api/dhru-license                                       │
│                                                                 │
│  4. API BUSCA CORREO EN DATABASE                                │
│     ├─→ ❌ NO EXISTE: "Correo no encontrado, registrate primero"│
│     └─→ ✅ SÍ EXISTE: Cambia pending→active                     │
│                       "¡Licencia activada!"                     │
│                                                                 │
│  5. CLIENTE PUEDE USAR AREPATOOL                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 CONFIGURACIÓN EN DHRU FUSION

### PASO 1: Crear Server Service

1. **Admin Panel** → **Settings** → **API Settings**
2. Click en **"Add API"** o **"Manage APIs"**
3. Seleccionar tipo: **Server Service**

> ⚠️ **IMPORTANTE**: Es "Server Service", NO "IMEI Service"

### PASO 2: Configurar la API

| Campo               | Valor                                               |
| ------------------- | --------------------------------------------------- |
| **API Name**        | `ArepaTool License Activation`                      |
| **API URL**         | `https://TU-VERCEL-APP.vercel.app/api/dhru-license` |
| **Request Method**  | `POST`                                              |
| **Response Format** | `JSON`                                              |

### PASO 3: Configurar Custom Fields

Basándome en tu captura, configura así:

```
┌──────────────────────────────────────────────────────────────────────┐
│ Custom Fields [** Dropdown Will Not Display On App]                  │
├───────────┬──────────┬─────────────┬──────────┬──────────┬──────────┤
│ Field Type│ Name     │ Description │ Validation│ Required │ Action  │
├───────────┼──────────┼─────────────┼──────────┼──────────┼──────────┤
│ Text      │ Mail     │ Email       │          │ ✓        │          │
└───────────┴──────────┴─────────────┴──────────┴──────────┴──────────┘
```

**Configuración del campo:**

- **Field Type**: `Text`
- **Name**: `Mail` (o `email`)
- **Description**: `Correo electrónico del cliente`
- **Required**: ✅ Sí
- **Allow Qnt**: ❌ No

### PASO 4: Mapeo de Parámetros

DHRU enviará estos parámetros a tu API:

```
key = [TU_API_SECRET]
action = placeorder
service = {SERVICE_ID}
Mail = {MAIL}           ← El correo que ingresa el cliente
orderid = {ORDERID}
```

### PASO 5: Configurar Response Mapping

Tu API retorna:

**Caso ÉXITO (usuario encontrado y activado):**

```json
{
  "status": "SUCCESS",
  "orderid": "12345",
  "code": "usuario123",
  "message": "¡Licencia activada! Usuario: usuario123 - Válida hasta: 08/01/2027",
  "details": {
    "username": "usuario123",
    "email": "cliente@email.com",
    "expires": "08/01/2027"
  }
}
```

**Caso ERROR (usuario no existe):**

```json
{
  "status": "ERROR",
  "orderid": "12345",
  "code": "NOT_FOUND",
  "message": "Correo no encontrado. Crea una cuenta primero desde la aplicación: https://arepa-tool-web.vercel.app",
  "details": {
    "error": "USER_NOT_FOUND",
    "registration_url": "https://arepa-tool-web.vercel.app"
  }
}
```

**Mapear en DHRU:**
| Campo DHRU | Campo API |
|------------|-----------|
| Status | `status` |
| Order ID | `orderid` |
| Reply/Code | `message` |

---

## 🔗 ASIGNAR AL SERVICIO

### En Services → Manage Services

1. Buscar: `"ArepaTool MultiTool Fix Yape, Bypass And More (1 Years)"`
2. Editar el servicio
3. En **API Connection**:
   - Seleccionar: `ArepaTool License Activation`
   - Tipo: `Server Service`
   - Auto Complete: ❌ NO (porque puede fallar si el correo no existe)

---

## ✉️ TEMPLATE DE RESPUESTA

### Auto Reply para ÉXITO:

```
Subject: ¡Tu Licencia ArepaTool está Activa! - Orden #{ORDERID}

Hola {CUSTOMER_NAME},

{REPLY}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TU LICENCIA AREPATOOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ya puedes iniciar sesión en ArepaTool con las credenciales
que usaste al registrarte.

📥 DESCARGA:
https://github.com/ArepaTool/releases/latest

📖 INSTRUCCIONES:
1. Descarga e instala ArepaTool
2. Inicia sesión con tu usuario y contraseña
3. ¡Disfruta todas las funciones!

Gracias por tu compra.

Saludos,
Equipo ArepaTool
```

### Auto Reply para ERROR:

Si el status es ERROR, DHRU puede mostrar el mensaje de error al cliente indicándole que primero debe registrarse.

---

## 🧪 TESTING

### Test: Usuario NO existe

```powershell
$body = @{
    key = "TU_API_SECRET"
    action = "placeorder"
    service = "arepatool_1year"
    Mail = "noexiste@test.com"
    orderid = "TEST001"
}

Invoke-RestMethod -Uri "https://TU-APP.vercel.app/api/dhru-license" -Method POST -Body $body
```

**Respuesta esperada:**

```json
{
  "status": "ERROR",
  "message": "Correo no encontrado. Crea una cuenta primero desde la aplicación: https://arepa-tool-web.vercel.app"
}
```

### Test: Usuario SÍ existe (pending)

```powershell
$body = @{
    key = "TU_API_SECRET"
    action = "placeorder"
    service = "arepatool_1year"
    Mail = "usuarioexistente@test.com"
    orderid = "TEST002"
}

Invoke-RestMethod -Uri "https://TU-APP.vercel.app/api/dhru-license" -Method POST -Body $body
```

**Respuesta esperada:**

```json
{
  "status": "SUCCESS",
  "code": "usuario123",
  "message": "¡Licencia activada! Usuario: usuario123 - Válida hasta: 08/01/2027"
}
```

---

## 🔧 VARIABLES DE ENTORNO (VERCEL)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://lumhpjfndlqhexnjmvtu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# DHRU API Secret
DHRU_API_SECRET=tu-clave-secreta-aqui
```

---

## ❓ TROUBLESHOOTING

### "Correo no encontrado"

- ✅ Esto es CORRECTO si el usuario no se registró primero
- El cliente debe ir a `arepa-tool-web.vercel.app` y crear cuenta

### "Invalid API Key"

- Verificar `DHRU_API_SECRET` en Vercel
- Verificar que coincide con el `key` en DHRU

### La orden queda en pendiente

- Verificar logs en Vercel: `vercel logs --follow`
- Verificar que el usuario existe en Supabase
- Verificar que el campo se llama `Mail` o `email`

### Usuario ya está activo

- La API extenderá la suscripción (renovación)
- Retornará: "¡Licencia renovada!"

---

## ✅ CHECKLIST FINAL

- [ ] API desplegada en Vercel
- [ ] Variables de entorno configuradas
- [ ] Server Service creado en DHRU
- [ ] Campo "Mail" configurado como requerido
- [ ] API asignada al servicio de ArepaTool
- [ ] Template de email configurado
- [ ] Test con correo que NO existe → Error correcto
- [ ] Test con correo que SÍ existe → Activación exitosa

---

## 📊 RESUMEN DEL FLUJO

| Escenario                 | Acción   | Mensaje                                         |
| ------------------------- | -------- | ----------------------------------------------- |
| Correo no existe          | Error    | Registrate primero en arepa-tool-web.vercel.app |
| Correo existe (pending)   | Activa   | ¡Licencia activada!                             |
| Correo existe (active)    | Renueva  | ¡Licencia renovada!                             |
| Correo existe (suspended) | Reactiva | ¡Licencia activada!                             |
