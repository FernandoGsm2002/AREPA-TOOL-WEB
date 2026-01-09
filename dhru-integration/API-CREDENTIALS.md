# 🔧 ArepaTool License API - Credenciales de Integración

## Información General

| Campo              | Valor                              |
| ------------------ | ---------------------------------- |
| **Nombre de API**  | ArepaTool License API              |
| **Versión**        | 2025.6                             |
| **Tipo de Script** | Other Script 84 / Other Script 101 |

---

## 🔐 Credenciales de Conexión

```
API URL:      https://api.arepatool.com
Username:     arepatool
API Key:      e7f8474a35b264bc688502f348cacb04fc9424251a77da53e217c4c08bccbea4
Currency:     USD (Auto)
```

---

## 📋 Configuración en DHRU Fusion

### Paso 1: Crear nueva API

1. Ve a **Settings** → **IMEI / Server Service** → **API Settings**
2. Click en **"Add New API"**
3. Selecciona **"Other Script 84"** o **"Other Script 101"**

### Paso 2: Completar los campos

| Campo                        | Valor                                                              |
| ---------------------------- | ------------------------------------------------------------------ |
| **Name**                     | `ArepaTool License`                                                |
| **API KEY**                  | `e7f8474a35b264bc688502f348cacb04fc9424251a77da53e217c4c08bccbea4` |
| **Username**                 | `arepatool`                                                        |
| **API url**                  | `https://api.arepatool.com`                                        |
| **Currency**                 | `Auto`                                                             |
| **Maximum Send Try**         | `3`                                                                |
| **Failed order Resend Time** | `60`                                                               |

### Paso 3: Guardar y Sincronizar

1. Click en **"Save"**
2. Click en **"Synchronize"**

---

## 📦 Servicio Disponible

| Servicio                                     | Precio | Descripción                     |
| -------------------------------------------- | ------ | ------------------------------- |
| ArepaToolV2 - Active User (12 month licence) | $14.99 | Licencia anual para ArepaToolV2 |

---

## 📝 Campo Personalizado Requerido

Al crear una orden, se requiere el siguiente campo:

| Campo    | Tipo | Descripción                                                | Requerido |
| -------- | ---- | ---------------------------------------------------------- | --------- |
| **Mail** | Text | Email del cliente (debe estar registrado en arepatool.com) | ✅ Sí     |

---

## ⚠️ Requisitos Importantes

1. **El cliente DEBE registrarse primero** en https://arepatool.com antes de comprar la licencia
2. El email usado en la orden debe coincidir con el email registrado en ArepaTool
3. Las licencias se activan **automáticamente** al procesar la orden

---

## 🔄 Flujo de Activación

```
1. Cliente se registra en arepatool.com (status: PENDING)
         ↓
2. Distribuidor crea orden en DHRU con el email del cliente
         ↓
3. API procesa la orden automáticamente
         ↓
4. Licencia activada (status: ACTIVE) por 12 meses
         ↓
5. Cliente puede usar ArepaToolV2
```

---

## 📞 Soporte

- **Sitio Web:** https://arepatool.com
- **Contacto:** Distribuidores oficiales en la página principal

---

## 🔒 Notas de Seguridad

- La API Key es confidencial - no compartir públicamente
- Cada distribuidor puede tener su propia API Key si es necesario
- Las credenciales pueden ser revocadas en caso de uso indebido

---

_Documento generado: Enero 2026_
_ArepaToolV2 © 2026_
