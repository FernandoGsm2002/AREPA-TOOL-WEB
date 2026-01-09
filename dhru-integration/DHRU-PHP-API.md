# 🐘 DHRU API - Versión PHP Pura

## ⚠️ Por qué PHP y no JavaScript

DHRU Fusion es **PHP 5.x legacy** y tiene problemas con:

- ❌ `json_decode()` sin flags modernos
- ❌ No valida headers correctamente
- ❌ Rompe con booleanos en JSON (`true`/`false`)
- ❌ Rompe con objetos anidados complejos
- ❌ No soporta estructuras modernas de JavaScript

**Solución: Usar PHP puro para la API.**

---

## 📁 Archivo: `dhru-api.php`

Este archivo es 100% compatible con DHRU Fusion.

---

## 🚀 Opciones de Hosting GRATIS

### Opción 1: 000webhost.com

1. Crear cuenta en https://www.000webhost.com/
2. Crear nuevo sitio
3. Subir `dhru-api.php` a la carpeta `public_html`
4. URL: `https://tu-sitio.000webhostapp.com/dhru-api.php`

### Opción 2: InfinityFree

1. Crear cuenta en https://infinityfree.net/
2. Crear nuevo sitio
3. Subir `dhru-api.php` vía File Manager
4. URL: `https://tu-sitio.epizy.com/dhru-api.php`

### Opción 3: Tu propio servidor

Si tienes VPS o hosting compartido, solo sube el archivo.

---

## ⚙️ Configuración

Edita las variables al inicio de `dhru-api.php`:

```php
// Tu API Key (la misma que configuras en DHRU)
$API_KEY = 'e7f8474a35b264bc688502f348cacb04fc9424251a77da53e217c4c08bccbea4';

// Supabase
$SUPABASE_URL = 'https://lumhpjfndlqhexnjmvtu.supabase.co';
$SUPABASE_KEY = 'TU_SERVICE_ROLE_KEY_AQUI'; // ⚠️ REEMPLAZAR
```

---

## 🔗 Configurar en DHRU

En DHRU → Settings → API Settings → Other Script 84:

| Campo        | Valor                                                              |
| ------------ | ------------------------------------------------------------------ |
| **Name**     | `ArepaTool License`                                                |
| **API KEY**  | `e7f8474a35b264bc688502f348cacb04fc9424251a77da53e217c4c08bccbea4` |
| **Username** | `arepatool`                                                        |
| **API url**  | `https://TU-HOSTING.com/dhru-api.php`                              |

---

## 🧪 Probar la API

```bash
# Test accountinfo
curl -X POST https://TU-HOSTING.com/dhru-api.php \
  -d "action=accountinfo&key=TU_API_KEY"

# Test servicelist
curl -X POST https://TU-HOSTING.com/dhru-api.php \
  -d "action=imeiservicelist&key=TU_API_KEY"
```

---

## 📋 Respuestas esperadas

### accountinfo

```json
{
  "SUCCESS": [
    {
      "message": "Your Accout Info",
      "AccoutInfo": {
        "credit": 999999,
        "mail": "ArepaToolAPI",
        "currency": "USD"
      }
    }
  ]
}
```

### imeiservicelist

```json
{
  "SUCCESS": [{
    "MESSAGE": "IMEI Service List",
    "LIST": {
      "ArepaToolV2 (Server Service)": {
        "GROUPNAME": "ArepaToolV2 (Server Service)",
        "GROUPTYPE": "SERVER",
        "SERVICES": {
          "1": {
            "SERVICEID": 1,
            "SERVICETYPE": "SERVER",
            "SERVICENAME": "ArepaToolV2 - Active User (12 month licence)",
            "CREDIT": 14.99,
            ...
          }
        }
      }
    }
  }]
}
```

---

## ✅ Flujo completo

```
1. Cliente se registra en arepa-tool-web.vercel.app
   └─→ Usuario creado en Supabase (status: pending)

2. Cliente compra licencia en DHRU
   └─→ Ingresa su email

3. DHRU llama dhru-api.php
   └─→ action=placeimeiorder, email=cliente@email.com

4. PHP busca en Supabase
   ├─→ ❌ No existe: "Email not found. Register first."
   └─→ ✅ Existe: Activa licencia, cambia status a active

5. DHRU muestra: "License activated! User: xxx - Valid until: xx/xx/xxxx"
```

---

## 🔒 Seguridad

- ⚠️ **NUNCA** subas el archivo con el `SUPABASE_KEY` a GitHub público
- Usa variables de entorno si tu hosting lo soporta
- Cambia el API_KEY regularmente
