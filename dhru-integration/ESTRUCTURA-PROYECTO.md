# 📁 ESTRUCTURA DEL PROYECTO - INTEGRACIÓN DHRU

## 🗂️ ARCHIVOS CREADOS

```
TT-Tool/AREPA-TOOL-PANEL/
│
├── api/                                    → APIs de Vercel
│   ├── dhru-service.js                    → ⭐ API principal (Dhru → ArepaTool)
│   └── dhru-bypass.js                     → ⭐ API bypass (ArepaTool → Dhru)
│
├── dhru-integration/                       → Documentación y configuración
│   ├── README.md                          → 📖 Guía completa
│   ├── INSTALACION-RAPIDA.md              → ⚡ Guía rápida (5 min)
│   ├── CONFIGURACION-DHRU.md              → ⚙️ Configurar en Dhru Fusion
│   ├── ESTRUCTURA-PROYECTO.md             → 📁 Este archivo
│   ├── setup-database.sql                 → 🗄️ SQL para Supabase
│   ├── .env.example                       → 🔐 Ejemplo de variables
│   ├── package.json                       → 📦 Dependencias
│   └── test-api.sh                        → 🧪 Script de pruebas
│
├── app.js                                  → ⚠️ Actualizar función approveBypass()
├── hide.html                               → Panel admin (ya existe)
├── index.html                              → Landing (ya existe)
├── vercel.json                             → Configuración Vercel
└── package.json                            → Dependencias del proyecto

```

---

## 📝 DESCRIPCIÓN DE ARCHIVOS

### 🔵 APIs (Carpeta `/api`)

#### `dhru-service.js` ⭐ PRINCIPAL
**Propósito**: API que Dhru Fusion llama cuando hay una nueva orden de licencia

**Endpoints**:
- `POST /api/dhru-service?action=placeorder` - Crear usuario
- `POST /api/dhru-service?action=status` - Verificar estado
- `POST /api/dhru-service?action=getbalance` - Obtener balance

**Flujo**:
```
Cliente compra en Dhru
    ↓
Dhru llama a esta API
    ↓
API crea usuario en Supabase
    ↓
Retorna credenciales a Dhru
    ↓
Dhru envía email al cliente
```

#### `dhru-bypass.js`
**Propósito**: API para enviar bypass aprobados a Dhru Fusion

**Endpoint**:
- `POST /api/dhru-bypass` - Enviar bypass a Dhru

**Flujo**:
```
Usuario registra SN en ArepaTool
    ↓
Aparece en tu panel
    ↓
Tú apruebas
    ↓
app.js llama a esta API
    ↓
API envía a Dhru
```

---

### 📚 Documentación (Carpeta `/dhru-integration`)

#### `README.md` 📖
Guía completa con:
- Estructura de archivos
- Instalación paso a paso
- Flujos de integración
- Testing
- Troubleshooting

#### `INSTALACION-RAPIDA.md` ⚡
Guía express de 5 minutos:
- Comandos rápidos
- Configuración mínima
- Test básico

#### `CONFIGURACION-DHRU.md` ⚙️
Guía específica para Dhru Fusion:
- Crear API en Dhru
- Configurar parámetros
- Asignar a servicio
- Template de email

#### `setup-database.sql` 🗄️
Script SQL para preparar Supabase:
- Agregar columna `dhru_order_id`
- Crear índices
- Tabla de logs (opcional)

#### `.env.example` 🔐
Ejemplo de variables de entorno:
- DHRU_API_KEY
- DHRU_API_URL
- DHRU_API_SECRET
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

#### `test-api.sh` 🧪
Script bash para probar APIs:
- Test placeorder
- Test getbalance
- Test bypass

#### `package.json` 📦
Dependencias y scripts:
- @supabase/supabase-js
- Scripts de deploy y test

---

## 🔄 FLUJO COMPLETO

### LICENCIAS (Automático)

```
┌─────────────────────────────────────────┐
│  1. Cliente compra en Dhru Fusion       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  2. Dhru llama a:                       │
│     POST /api/dhru-service              │
│     { action: "placeorder" }            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  3. API genera credenciales             │
│     - Username: user_abc                │
│     - Password: pass123                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  4. API crea usuario en Supabase        │
│     tabla: users                        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  5. API responde a Dhru                 │
│     { status: "SUCCESS", code: "..." }  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  6. Dhru marca orden completada         │
│     y envía email al cliente            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  7. Cliente recibe email con            │
│     credenciales y puede usar ArepaTool │
└─────────────────────────────────────────┘
```

### BYPASS (Semi-automático)

```
┌─────────────────────────────────────────┐
│  1. Usuario registra SN en ArepaTool    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  2. SN aparece en panel (hide.html)     │
│     Status: pending                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  3. TÚ APRUEBAS manualmente             │
│     Click en "Approve"                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  4. app.js llama a:                     │
│     POST /api/dhru-bypass               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  5. API envía a Dhru Fusion             │
│     Registra orden completada           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  6. Tu hermano ve el registro en Dhru   │
└─────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Preparación
- [ ] Leer `INSTALACION-RAPIDA.md`
- [ ] Tener acceso a Vercel
- [ ] Tener acceso a Supabase
- [ ] Tener API Key de Dhru

### Fase 2: Instalación
- [ ] Instalar dependencias: `npm install`
- [ ] Ejecutar `setup-database.sql` en Supabase
- [ ] Configurar variables de entorno en Vercel
- [ ] Desplegar: `vercel --prod`

### Fase 3: Configuración Dhru
- [ ] Crear API en Dhru (ver `CONFIGURACION-DHRU.md`)
- [ ] Asignar API al servicio
- [ ] Configurar Auto Reply

### Fase 4: Testing
- [ ] Ejecutar `test-api.sh`
- [ ] Hacer orden de prueba en Dhru
- [ ] Verificar usuario en Supabase
- [ ] Verificar email recibido

### Fase 5: Bypass
- [ ] Actualizar `app.js` (función approveBypass)
- [ ] Probar aprobación de bypass
- [ ] Verificar envío a Dhru

---

## 🎯 PRÓXIMOS PASOS

1. **Leer** `INSTALACION-RAPIDA.md`
2. **Ejecutar** comandos de instalación
3. **Configurar** en Dhru Fusion
4. **Probar** con orden de prueba
5. **Monitorear** logs primeras 24h

---

## 📞 SOPORTE

- Ver logs: `vercel logs --follow`
- Ver Supabase Dashboard
- Ver Dhru API Logs
- Contactar a tu hermano (admin Dhru)

---

## 🎉 ¡TODO LISTO!

Todos los archivos están creados y organizados.
Sigue la guía de instalación y en 5-10 minutos estará funcionando.
