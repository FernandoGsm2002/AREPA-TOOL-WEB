# ⚡ INSTALACIÓN RÁPIDA - 5 MINUTOS

## 🚀 PASOS RÁPIDOS

### 1️⃣ Instalar Dependencias (1 min)

```bash
cd TT-Tool/AREPA-TOOL-PANEL
npm install @supabase/supabase-js
```

### 2️⃣ Configurar Base de Datos (1 min)

1. Ir a Supabase SQL Editor
2. Copiar contenido de `setup-database.sql`
3. Ejecutar
4. ✓ Listo

### 3️⃣ Configurar Variables de Entorno (2 min)

En Vercel Dashboard → Settings → Environment Variables:

```
DHRU_API_KEY=Q85-F15-4ZF-NFS-FBE-MRT-SFR-KTW
DHRU_API_URL=https://www.leope-gsm.com/api/endpoint
DHRU_API_SECRET=genera-key-segura-aqui
NEXT_PUBLIC_SUPABASE_URL=https://lumhpjfndlqhexnjmvtu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

**Generar API Secret:**
```bash
# En terminal
openssl rand -hex 32
```

### 4️⃣ Desplegar (1 min)

```bash
vercel --prod
```

Anotar la URL: `https://tu-app.vercel.app`

### 5️⃣ Configurar en Dhru (2 min)

1. Ir a Settings → API Settings
2. Add New API:
   - Name: ArepaTool API
   - URL: `https://tu-app.vercel.app/api/dhru-service`
   - Key: [tu-dhru-api-secret]
3. Asignar API al servicio "ArepaTool MultiTool..."
4. ✓ Listo

---

## ✅ VERIFICAR QUE FUNCIONA

### Test Rápido:

```bash
curl -X POST https://tu-app.vercel.app/api/dhru-service \
  -H "Content-Type: application/json" \
  -d '{
    "key": "tu-api-secret",
    "action": "getbalance"
  }'
```

**Debe responder:**
```json
{
  "status": "SUCCESS",
  "balance": 999999
}
```

---

## 🎉 ¡LISTO!

Ahora cuando alguien compre en Dhru:
1. Se crea usuario automáticamente
2. Se envía email con credenciales
3. Cliente puede usar ArepaTool

---

## 📚 MÁS INFORMACIÓN

- Ver `README.md` para guía completa
- Ver `CONFIGURACION-DHRU.md` para detalles de Dhru
- Ver `test-api.sh` para más tests
