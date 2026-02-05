# DHRU WhatsApp Bridge

Sistema de notificaciones para DHRU que envía pedidos a WhatsApp y permite gestionarlos respondiendo en el chat.

## 📁 Estructura

```
DHRU-WHATSAPP-BRIDGE/
├── dhru-whatsapp.py      # Servidor DHRU principal (Python)
├── .env                   # Configuración
├── orders_db.json         # Base de datos local
├── START-BRIDGE.bat       # Iniciar servidor DHRU
├── whatsapp-service/      # Servicio de WhatsApp (Node.js)
│   ├── whatsapp-bot.js    # Bot de WhatsApp
│   ├── package.json       # Dependencias
│   └── START-WHATSAPP.bat # Iniciar WhatsApp
```

## 🚀 Instalación

### 1. Instalar dependencias de Python

```bash
pip install requests python-dotenv
```

### 2. Instalar dependencias de WhatsApp

```bash
cd whatsapp-service
npm install
```

## ▶️ Uso

### Paso 1: Iniciar WhatsApp (PRIMERO)

1. Ejecuta `whatsapp-service/START-WHATSAPP.bat`
2. Escanea el código QR con tu teléfono
3. Espera a que diga "WhatsApp Bot LISTO!"

### Paso 2: Iniciar el servidor DHRU

1. Ejecuta `START-BRIDGE.bat`
2. Verás: "✅ WhatsApp: ACTIVO"

### Paso 3: Configurar grupo de WhatsApp

Por defecto busca un grupo llamado "DHRU Pedidos". Si tu grupo tiene otro nombre:

- Cambia `TARGET_GROUP_NAME` en `whatsapp-bot.js`
- O usa la API: POST http://localhost:3001/set-group con {"groupName": "NombreDelGrupo"}

## 📱 Uso en WhatsApp

Cuando llegue un pedido, el bot enviará algo como:

```
🚨 NUEVO PEDIDO RECIBIDO
--------------------------------
📦 Servicio: 🇨🇴 CLARO COLOMBIA
📱 IMEI: 123456789012345
🆔 Ref: 1769729411
--------------------------------
✅ Estado: Aceptado y En Proceso
```

Para responder:

1. **Responde al mensaje** (con Reply/Cita)
2. Escribe: `DONE`, `LISTO` o `OK` para completar
3. Escribe: `REJECT` o `RECHAZAR` para rechazar

## ⚙️ Configuración (.env)

| Variable               | Descripción                              |
| ---------------------- | ---------------------------------------- |
| `PORT`                 | Puerto del servidor DHRU (default: 8095) |
| `WHATSAPP_ENABLED`     | true/false - Activa WhatsApp             |
| `WHATSAPP_SERVICE_URL` | URL del servicio Node.js                 |
| `TELEGRAM_ENABLED`     | true/false - Activa Telegram como backup |
| `DHRU_CALLBACK_URL`    | URL de tu panel DHRU para callbacks      |

## 🔧 Cambiar de WhatsApp a Telegram

En `.env`:

```
WHATSAPP_ENABLED=false
TELEGRAM_ENABLED=true
```

## ❓ Problemas comunes

### "WhatsApp: Servicio no disponible"

- Ejecuta `START-WHATSAPP.bat` primero
- Verifica que el QR fue escaneado

### "No group configured"

- Crea un grupo de WhatsApp y añade el número
- El nombre del grupo debe contener "DHRU Pedidos" (o cambia la config)

### "DHRU no actualiza el estado"

- Verifica que el cron de DHRU está activo
- Revisa `DHRU_CALLBACK_URL` en .env
