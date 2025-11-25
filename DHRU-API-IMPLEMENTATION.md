# 🔌 IMPLEMENTACIÓN API PARA DHRU FUSION

## 📸 ANÁLISIS DE LA IMAGEN

Basado en la configuración de Dhru Fusion que veo:

### Servicio Creado
- **Nombre**: ArepaTool MultiTool Fix Yape, Bypass And More (1 Years)
- **Tipo**: API Server + Auto Reply (Digital Inventory)
- **Estado**: Sin conectar (manual)

### Opciones de Conexión
- API Connection (Primary)
- Lista de APIs disponibles en Dhru
- Drag and Drop para cambiar orden

---

## 🎯 SOLUCIÓN: CREAR API PERSONALIZADA PARA DHRU

Dhru Fusion permite conectar APIs externas. Necesitamos crear una API que Dhru pueda consumir.

### ARQUITECTURA

```
Cliente compra en Dhru
    ↓
Dhru llama a TU API (Vercel)
    ↓
Tu API crea usuario en Supabase
    ↓
Tu API responde a Dhru con credenciales
    ↓
Dhru envía email al cliente
```

---

## 📝 IMPLEMENTACIÓN

### PASO 1: Crear API Compatible con Dhru

Dhru Fusion espera un formato específico de respuesta. Voy a crear una API que cumpla con ese formato.

#### Archivo: `/api/dhru-service.js`

```javascript
/**
 * API para Dhru Fusion
 * Endpoint que Dhru llamará cuando haya una nueva orden
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Dhru envía peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      status: 'ERROR'
    });
  }

  try {
    // Parámetros que Dhru envía
    const {
      key,           // API Key para autenticación
      action,        // Acción a realizar
      service,       // ID del servicio
      imei,          // IMEI/Serial (puede ser email del cliente)
      email,         // Email del cliente
      orderid        // ID de la orden en Dhru
    } = req.body;

    // Verificar API Key
    if (key !== process.env.DHRU_API_SECRET) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Invalid API Key'
      });
    }

    // Manejar diferentes acciones
    switch (action) {
      case 'placeorder':
        return await handlePlaceOrder(req.body, res);
      
      case 'status':
        return await handleCheckStatus(req.body, res);
      
      case 'getbalance':
        return await handleGetBalance(res);
      
      default:
        return res.status(400).json({
          status: 'ERROR',
          message: 'Invalid action'
        });
    }

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
}

/**
 * Manejar nueva orden (crear usuario)
 */
async function handlePlaceOrder(data, res) {
  const { service, email, orderid } = data;

  try {
    // Generar credenciales
    const username = generateUsername(email);
    const password = generatePassword();
    const subscription_end = calculateExpiration(service);

    // Crear usuario en Supabase
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username: username,
        email: email,
        password_hash: await hashPassword(password),
        status: 'active',
        subscription_end: subscription_end,
        dhru_order_id: orderid,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Respuesta en formato Dhru
    return res.status(200).json({
      status: 'SUCCESS',
      orderid: orderid,
      message: 'Account created successfully',
      code: username,
      // Dhru mostrará esto al cliente
      details: {
        username: username,
        password: password,
        expires: subscription_end,
        download: 'https://tu-url.com/download'
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: 'ERROR',
      orderid: orderid,
      message: error.message
    });
  }
}

/**
 * Verificar estado de orden
 */
async function handleCheckStatus(data, res) {
  const { orderid } = data;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('dhru_order_id', orderid)
      .single();

    if (error || !user) {
      return res.status(200).json({
        status: 'PENDING',
        orderid: orderid,
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      status: 'COMPLETED',
      orderid: orderid,
      code: user.username,
      message: 'Account active'
    });

  } catch (error) {
    return res.status(500).json({
      status: 'ERROR',
      orderid: orderid,
      message: error.message
    });
  }
}

/**
 * Obtener balance (créditos disponibles)
 */
async function handleGetBalance(res) {
  // Puedes implementar un sistema de créditos
  // Por ahora, retornar balance ilimitado
  return res.status(200).json({
    status: 'SUCCESS',
    balance: 999999,
    currency: 'USD'
  });
}

// Funciones auxiliares
function generateUsername(email) {
  const base = email.split('@')[0].toLowerCase();
  const random = crypto.randomBytes(2).toString('hex');
  return `${base}_${random}`;
}

function generatePassword() {
  return crypto.randomBytes(8).toString('hex');
}

function calculateExpiration(service) {
  // service puede ser el ID del servicio en Dhru
  // Ajustar según tus servicios
  const days = service.includes('1year') || service.includes('365') ? 365 : 30;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

async function hashPassword(password) {
  // Implementar hash real (bcrypt)
  const bcrypt = require('bcryptjs');
  return await bcrypt.hash(password, 10);
}
```

---

### PASO 2: Configurar en Dhru Fusion

#### En el Panel de Dhru:

1. **Ir a Settings → API Settings**
2. **Crear Nueva API**:
   ```
   API Name: ArepaTool API
   API URL: https://tu-vercel-app.vercel.app/api/dhru-service
   API Key: [generar-key-segura]
   Method: POST
   ```

3. **Configurar Parámetros**:
   ```
   key: [tu-api-key]
   action: placeorder
   service: {SERVICE_ID}
   imei: {IMEI}
   email: {EMAIL}
   orderid: {ORDERID}
   ```

4. **Asignar API al Servicio**:
   - Ir al servicio "ArepaTool MultiTool..."
   - En "API Connection (Primary)"
   - Seleccionar "ArepaTool API"
   - Guardar

---

### PASO 3: Configurar Variables de Entorno

```bash
# En Vercel Dashboard

DHRU_API_SECRET=tu-key-super-secreta-aqui
NEXT_PUBLIC_SUPABASE_URL=https://lumhpjfndlqhexnjmvtu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

---

### PASO 4: Actualizar Supabase

#### Agregar columna para tracking de Dhru

```sql
-- Agregar columna dhru_order_id a tabla users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS dhru_order_id TEXT;

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_users_dhru_order_id 
ON public.users(dhru_order_id);
```

---

## 🧪 TESTING

### Test 1: Probar API Manualmente

```bash
curl -X POST https://tu-vercel-app.vercel.app/api/dhru-service \
  -H "Content-Type: application/json" \
  -d '{
    "key": "tu-api-key",
    "action": "placeorder",
    "service": "arepatool_1year",
    "imei": "test@example.com",
    "email": "test@example.com",
    "orderid": "TEST123"
  }'
```

**Respuesta Esperada:**
```json
{
  "status": "SUCCESS",
  "orderid": "TEST123",
  "message": "Account created successfully",
  "code": "test_a1b2",
  "details": {
    "username": "test_a1b2",
    "password": "abc123xyz",
    "expires": "2025-11-25T...",
    "download": "https://..."
  }
}
```

### Test 2: Probar desde Dhru

1. En Dhru, ir a "Test API"
2. Seleccionar tu API
3. Ingresar datos de prueba
4. Verificar respuesta

---

## 📊 FORMATO DE RESPUESTAS DHRU

### Respuesta Exitosa
```json
{
  "status": "SUCCESS",
  "orderid": "12345",
  "code": "username_abc",
  "message": "Account created",
  "details": {
    "username": "user_abc",
    "password": "pass123",
    "expires": "2025-12-31"
  }
}
```

### Respuesta de Error
```json
{
  "status": "ERROR",
  "orderid": "12345",
  "message": "Error description"
}
```

### Respuesta Pendiente
```json
{
  "status": "PENDING",
  "orderid": "12345",
  "message": "Processing..."
}
```

---

## 🔄 FLUJO COMPLETO

```
1. Cliente compra en Dhru
   ↓
2. Dhru llama a: POST /api/dhru-service
   Body: { key, action: "placeorder", email, orderid }
   ↓
3. Tu API:
   - Verifica API key
   - Genera username/password
   - Crea usuario en Supabase
   - Retorna credenciales
   ↓
4. Dhru recibe respuesta:
   - Si SUCCESS: Marca orden completada
   - Envía email al cliente con credenciales
   - Cliente puede usar ArepaTool
   ↓
5. Cliente recibe email:
   Username: user_abc
   Password: pass123
   Download: https://...
```

---

## 🚀 DESPLIEGUE

### 1. Crear archivo API
```bash
mkdir -p TT-Tool/AREPA-TOOL-PANEL/api
# Crear dhru-service.js con el código arriba
```

### 2. Instalar dependencias
```bash
cd TT-Tool/AREPA-TOOL-PANEL
npm init -y
npm install @supabase/supabase-js bcryptjs
```

### 3. Desplegar a Vercel
```bash
vercel --prod
```

### 4. Configurar en Dhru
- Agregar API con la URL de Vercel
- Asignar al servicio
- Probar

---

## 📝 CHECKLIST

### Preparación
- [ ] Generar API Key segura
- [ ] Configurar variables de entorno en Vercel
- [ ] Agregar columna dhru_order_id en Supabase

### Desarrollo
- [ ] Crear `/api/dhru-service.js`
- [ ] Instalar dependencias
- [ ] Probar localmente

### Configuración Dhru
- [ ] Crear API en Dhru
- [ ] Configurar parámetros
- [ ] Asignar a servicio
- [ ] Probar conexión

### Testing
- [ ] Test manual con curl
- [ ] Test desde Dhru
- [ ] Verificar creación en Supabase
- [ ] Verificar email a cliente

---

## 💡 PRÓXIMOS PASOS

1. **Crear el archivo `/api/dhru-service.js`**
2. **Configurar variables de entorno**
3. **Desplegar a Vercel**
4. **Configurar en Dhru Fusion**
5. **Hacer orden de prueba**

¿Quieres que cree los archivos necesarios para implementar esto?
