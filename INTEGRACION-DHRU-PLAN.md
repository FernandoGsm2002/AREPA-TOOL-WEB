# 🔄 PLAN DE INTEGRACIÓN: ArepaTool ↔ Dhru Fusion

## 📋 CONTEXTO ACTUAL

### Tu Sistema (ArepaTool)
- **Panel Web**: Vercel (hide.html)
- **Base de Datos**: Supabase
- **Tablas**:
  - `users` - Usuarios registrados
  - `bypass_registrations` - Serial Numbers de iPhone
- **Proceso Actual**: MANUAL
  1. Usuario se registra en la tool
  2. Aparece en tu panel web
  3. Tú apruebas manualmente
  4. Usuario puede usar la tool

### Sistema de tu Hermano (Dhru Fusion)
- **URL**: https://www.leope-gsm.com/
- **API Key**: Q85-F15-4ZF-NFS-FBE-MRT-SFR-KTW
- **Función**: Vender servicios GSM (licencias, bypass, etc.)

---

## 🎯 OBJETIVO: AUTOMATIZACIÓN BIDIRECCIONAL

### FLUJO 1: Dhru → ArepaTool (Licencias)
```
Cliente compra licencia en Dhru
    ↓
Cronjob detecta nueva orden
    ↓
Crea usuario en Supabase automáticamente
    ↓
Envía email con credenciales
    ↓
Cliente usa ArepaTool
```

### FLUJO 2: ArepaTool → Dhru (Bypass iPhone)
```
Usuario registra SN en ArepaTool
    ↓
Aparece en tu panel (hide.html)
    ↓
Tú apruebas en el panel
    ↓
Automáticamente se registra en Dhru
    ↓
Tu hermano ve el registro completado
```

---

## 🛠️ ARQUITECTURA PROPUESTA

### Componentes Necesarios

#### 1. **Vercel Serverless Functions** (Ya tienes Vercel)
```
/api
  ├── dhru-webhook.js       → Enviar bypass aprobados a Dhru
  ├── dhru-sync-users.js    → Sincronizar usuarios desde Dhru
  └── dhru-cron.js          → Cronjob para licencias
```

#### 2. **Supabase Database Triggers**
```sql
-- Trigger cuando se aprueba un bypass
CREATE TRIGGER on_bypass_approved
  AFTER UPDATE ON bypass_registrations
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status != 'approved')
  EXECUTE FUNCTION notify_dhru_bypass();
```

#### 3. **Cronjob en Vercel** (Vercel Cron Jobs)
```json
// vercel.json
{
  "crons": [{
    "path": "/api/dhru-cron",
    "schedule": "*/5 * * * *"  // Cada 5 minutos
  }]
}
```

---

## 📝 IMPLEMENTACIÓN DETALLADA

### PASO 1: Crear API en Vercel para Dhru

#### Archivo: `/api/dhru-webhook.js`
```javascript
// Enviar bypass aprobado a Dhru Fusion
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { serial_number, username, email } = req.body;
  const DHRU_API_KEY = process.env.DHRU_API_KEY;
  const DHRU_API_URL = process.env.DHRU_API_URL;

  try {
    // Enviar a Dhru Fusion
    const response = await fetch(DHRU_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        key: DHRU_API_KEY,
        action: 'addorder',
        service: '201', // ID del servicio "iPhone Bypass" en Dhru
        imei: serial_number,
        email: email,
        username: username
      })
    });

    const data = await response.json();
    
    return res.status(200).json({ 
      success: true, 
      dhru_order_id: data.orderid 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
```

#### Archivo: `/api/dhru-cron.js`
```javascript
// Cronjob: Sincronizar licencias desde Dhru
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Verificar que es llamado por Vercel Cron
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const DHRU_API_KEY = process.env.DHRU_API_KEY;
  const DHRU_API_URL = process.env.DHRU_API_URL;

  try {
    // 1. Obtener órdenes pendientes de Dhru
    const response = await fetch(DHRU_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        key: DHRU_API_KEY,
        action: 'getorders',
        status: 'Pending'
      })
    });

    const orders = await response.json();
    let processed = 0;

    // 2. Procesar cada orden
    for (const order of orders) {
      // Solo procesar licencias (service_id 101 o 102)
      if ([101, 102].includes(order.service_id)) {
        
        // Generar credenciales
        const username = generateUsername(order.email);
        const password = generatePassword();
        const subscription_end = calculateExpiration(order.service_id);

        // Crear usuario en Supabase
        const { error } = await supabase
          .from('users')
          .insert({
            username: username,
            email: order.email,
            password_hash: await hashPassword(password),
            status: 'active',
            subscription_end: subscription_end,
            created_at: new Date().toISOString()
          });

        if (!error) {
          // Enviar email con credenciales
          await sendCredentialsEmail(order.email, username, password);

          // Marcar orden como completada en Dhru
          await fetch(DHRU_API_URL, {
            method: 'POST',
            body: new URLSearchParams({
              key: DHRU_API_KEY,
              action: 'updateorder',
              orderid: order.id,
              status: 'Completed'
            })
          });

          processed++;
        }
      }
    }

    return res.status(200).json({ 
      success: true, 
      processed: processed 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

function generateUsername(email) {
  return email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 4);
}

function generatePassword() {
  return Math.random().toString(36).slice(-10);
}

function calculateExpiration(service_id) {
  const days = service_id === 101 ? 30 : 365; // 1 mes o 1 año
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

async function hashPassword(password) {
  // Implementar hash (bcrypt, etc.)
  return password; // Placeholder
}

async function sendCredentialsEmail(email, username, password) {
  // Implementar envío de email (SendGrid, Resend, etc.)
  console.log(`Email sent to ${email}`);
}
```

---

### PASO 2: Actualizar hide.html (Panel Admin)

#### Modificar `app.js` - Función `approveBypass()`
```javascript
async function approveBypass(id) {
    const notes = prompt('Enter approval notes (optional):');
    if (notes === null) return;

    try {
        // 1. Actualizar en Supabase
        const { error } = await supabase
            .from('bypass_registrations')
            .update({
                status: 'approved',
                admin_notes: notes || 'Approved by admin',
                approved_by: 'admin',
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        // 2. 🔥 NUEVO: Enviar a Dhru automáticamente
        const registration = bypassRegistrations.find(r => r.id === id);
        
        const dhruResponse = await fetch('/api/dhru-webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                serial_number: registration.serial_number,
                username: registration.username,
                email: registration.user_email
            })
        });

        const dhruData = await dhruResponse.json();

        if (dhruData.success) {
            showNotification(`✓ Approved and sent to Dhru (Order #${dhruData.dhru_order_id})`, 'success');
        } else {
            showNotification('✓ Approved but failed to send to Dhru', 'warning');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}
```

---

### PASO 3: Configurar Variables de Entorno en Vercel

```bash
# En Vercel Dashboard → Settings → Environment Variables

DHRU_API_KEY=Q85-F15-4ZF-NFS-FBE-MRT-SFR-KTW
DHRU_API_URL=https://www.leope-gsm.com/api/endpoint
CRON_SECRET=tu-secret-aleatorio-aqui
```

---

### PASO 4: Actualizar `vercel.json`

```json
{
  "version": 2,
  "name": "arepa-tool-admin",
  "rewrites": [
    {
      "source": "/hide",
      "destination": "/hide.html"
    }
  ],
  "crons": [
    {
      "path": "/api/dhru-cron",
      "schedule": "*/5 * * * *"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

---

## 🔐 SEGURIDAD

### Variables Sensibles
- ✅ API keys en variables de entorno (no en código)
- ✅ CRON_SECRET para proteger endpoint de cronjob
- ✅ Service Role Key de Supabase (solo en servidor)

### Validaciones
- ✅ Verificar que órdenes no se procesen dos veces
- ✅ Validar formato de datos antes de insertar
- ✅ Logs de todas las transacciones

---

## 📊 MONITOREO

### Logs en Vercel
```bash
# Ver logs del cronjob
vercel logs --follow

# Ver logs de una función específica
vercel logs /api/dhru-cron
```

### Dashboard de Supabase
- Verificar inserciones en tabla `users`
- Verificar actualizaciones en `bypass_registrations`

---

## 🚀 DESPLIEGUE

### 1. Crear carpeta `/api` en tu proyecto
```bash
mkdir -p TT-Tool/AREPA-TOOL-PANEL/api
```

### 2. Crear archivos de API
- `dhru-webhook.js`
- `dhru-cron.js`

### 3. Actualizar `vercel.json`

### 4. Configurar variables de entorno en Vercel

### 5. Desplegar
```bash
cd TT-Tool/AREPA-TOOL-PANEL
vercel --prod
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Preparación
- [ ] Obtener documentación de API de Dhru Fusion
- [ ] Identificar IDs de servicios en Dhru (licencias, bypass)
- [ ] Configurar servicio de email (SendGrid, Resend)

### Desarrollo
- [ ] Crear `/api/dhru-webhook.js`
- [ ] Crear `/api/dhru-cron.js`
- [ ] Actualizar `app.js` (función approveBypass)
- [ ] Actualizar `vercel.json`

### Testing
- [ ] Probar webhook con datos de prueba
- [ ] Probar cronjob manualmente
- [ ] Verificar creación de usuarios en Supabase
- [ ] Verificar registro en Dhru

### Producción
- [ ] Configurar variables de entorno en Vercel
- [ ] Desplegar a producción
- [ ] Monitorear logs primeras 24h
- [ ] Ajustar según necesidad

---

## 💡 BENEFICIOS

### Automatización
- ✅ Sin intervención manual para licencias
- ✅ Bypass se registra automáticamente en Dhru
- ✅ Emails automáticos con credenciales

### Escalabilidad
- ✅ Puede manejar cientos de órdenes
- ✅ Cronjob cada 5 minutos
- ✅ Sin límite de procesamiento

### Trazabilidad
- ✅ Todo queda registrado en ambos sistemas
- ✅ Logs completos en Vercel
- ✅ Auditoría en Supabase

---

¿Quieres que empiece a implementar esto? Necesitaría:
1. Documentación de la API de Dhru Fusion de tu hermano
2. IDs de los servicios (licencias 1 mes, 1 año, bypass)
3. Confirmar que tienes acceso a configurar variables de entorno en Vercel
