# 🔌 INTEGRACIÓN DHRU FUSION - GUÍA COMPLETA

## 📁 ESTRUCTURA DE ARCHIVOS

```
AREPA-TOOL-PANEL/
├── api/
│   ├── dhru-service.js      → API que Dhru llama (licencias)
│   └── dhru-bypass.js       → API para enviar bypass a Dhru
├── dhru-integration/
│   ├── README.md            → Esta guía
│   ├── setup-database.sql   → SQL para preparar Supabase
│   ├── test-api.sh          → Script para probar APIs
│   ├── .env.example         → Ejemplo de variables de entorno
│   └── CONFIGURACION-DHRU.md → Guía para configurar en Dhru
└── app.js                   → Actualizar función approveBypass()
```

---

## 🚀 INSTALACIÓN PASO A PASO

### PASO 1: Instalar Dependencias

```bash
cd TT-Tool/AREPA-TOOL-PANEL
npm init -y
npm install @supabase/supabase-js
```

### PASO 2: Configurar Base de Datos

Ejecutar en Supabase SQL Editor:

```bash
# Ver archivo: setup-database.sql
```

### PASO 3: Configurar Variables de Entorno

En Vercel Dashboard → Settings → Environment Variables:

```
DHRU_API_KEY=Q85-F15-4ZF-NFS-FBE-MRT-SFR-KTW
DHRU_API_URL=https://www.leope-gsm.com/api/endpoint
DHRU_API_SECRET=genera-una-key-segura-aqui
NEXT_PUBLIC_SUPABASE_URL=https://lumhpjfndlqhexnjmvtu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### PASO 4: Desplegar a Vercel

```bash
vercel --prod
```

### PASO 5: Configurar en Dhru Fusion

Ver guía detallada en: `CONFIGURACION-DHRU.md`

---

## 🔄 FLUJOS DE INTEGRACIÓN

### FLUJO 1: Licencias (Dhru → ArepaTool)

```
1. Cliente compra licencia en Dhru
   ↓
2. Dhru llama a: POST /api/dhru-service
   Body: {
     key: "api-key",
     action: "placeorder",
     service: "arepatool_1year",
     email: "cliente@email.com",
     orderid: "12345"
   }
   ↓
3. Tu API:
   - Genera username/password
   - Crea usuario en Supabase
   - Retorna credenciales
   ↓
4. Dhru:
   - Marca orden completada
   - Envía email al cliente con credenciales
```

### FLUJO 2: Bypass (ArepaTool → Dhru)

```
1. Usuario registra SN en ArepaTool
   ↓
2. Aparece en tu panel (hide.html)
   ↓
3. Tú apruebas el bypass
   ↓
4. app.js llama a: POST /api/dhru-bypass
   Body: {
     serial_number: "ABC123",
     username: "user123",
     email: "user@email.com"
   }
   ↓
5. Tu API envía a Dhru
   ↓
6. Dhru registra la orden completada
```

---

## 🧪 TESTING

### Test 1: Probar API de Licencias

```bash
curl -X POST https://tu-app.vercel.app/api/dhru-service \
  -H "Content-Type: application/json" \
  -d '{
    "key": "tu-api-secret",
    "action": "placeorder",
    "service": "arepatool_1year",
    "email": "test@example.com",
    "orderid": "TEST001"
  }'
```

**Respuesta Esperada:**
```json
{
  "status": "SUCCESS",
  "orderid": "TEST001",
  "code": "test_a1b2",
  "message": "Account created successfully",
  "details": {
    "username": "test_a1b2",
    "password": "abc123xyz",
    "expires": "25/11/2026",
    "download": "https://..."
  }
}
```

### Test 2: Probar API de Bypass

```bash
curl -X POST https://tu-app.vercel.app/api/dhru-bypass \
  -H "Content-Type: application/json" \
  -d '{
    "serial_number": "ABC123XYZ",
    "username": "testuser",
    "email": "test@example.com"
  }'
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Bypass sent to Dhru successfully",
  "dhru_order_id": "67890"
}
```

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### Preparación
- [ ] Instalar dependencias (npm install)
- [ ] Ejecutar SQL en Supabase
- [ ] Generar API Secret segura
- [ ] Obtener API Key de Dhru

### Configuración
- [ ] Configurar variables de entorno en Vercel
- [ ] Desplegar a Vercel
- [ ] Anotar URL de Vercel

### Dhru Fusion
- [ ] Crear API en Dhru (Settings → API Settings)
- [ ] Configurar parámetros de API
- [ ] Asignar API al servicio
- [ ] Probar conexión

### Testing
- [ ] Test manual con curl
- [ ] Test desde Dhru (orden de prueba)
- [ ] Verificar creación en Supabase
- [ ] Verificar email al cliente

### Panel Admin
- [ ] Actualizar app.js (función approveBypass)
- [ ] Probar aprobación de bypass
- [ ] Verificar envío a Dhru

---

## 🔧 TROUBLESHOOTING

### Error: "Invalid API Key"
- Verificar que DHRU_API_SECRET coincide en Vercel y en Dhru
- Verificar que no hay espacios extra

### Error: "Database error"
- Verificar que ejecutaste setup-database.sql
- Verificar SUPABASE_SERVICE_ROLE_KEY

### Error: "Dhru API error"
- Verificar DHRU_API_KEY
- Verificar DHRU_API_URL
- Verificar que el servicio existe en Dhru

### Bypass no se envía a Dhru
- Verificar que actualizaste app.js
- Ver logs en Vercel: `vercel logs --follow`
- Verificar que /api/dhru-bypass funciona

---

## 📞 SOPORTE

Si tienes problemas:
1. Ver logs en Vercel Dashboard
2. Ver logs en Supabase Dashboard
3. Verificar configuración en Dhru
4. Revisar variables de entorno

---

## 🎉 ¡LISTO!

Una vez completados todos los pasos, el sistema estará completamente automatizado:
- Licencias se crean automáticamente
- Bypass se registran automáticamente al aprobar
- Todo queda registrado en ambos sistemas
