# ArepaTool iCloud Bypass Server

Servidor PHP que genera payloads personalizados para el bypass de iCloud en dispositivos iOS.

## 📋 Requisitos

- PHP 7.4 o superior
- Extensión SQLite3 habilitada
- (Opcional) Cloudflare Tunnel para acceso remoto

## 🚀 Inicio Rápido

### Windows

```batch
# Doble clic en:
Bypass-Server-Start.bat
```

### Manual

```bash
cd bypass-server/public
php -S 192.168.x.x:8080 -t .
```

## 📡 Endpoints

### Status

```
GET /
```

Retorna el estado del servidor.

### Generar Payloads

```
GET /generate?prd=iPhone14-5&guid=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX&sn=ABCD1234
```

**Parámetros:**
| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `prd` | Tipo de producto (ProductType) | iPhone14-5, iPad13-1 |
| `guid` | GUID del SystemGroup | 2A22A82B-C342-444D-972F-5270FB5080DF |
| `sn` | Número de serie | ABCD1234 |

**Respuesta:**

```json
{
  "success": true,
  "links": {
    "step1_fixedfile": "http://server/firststp/.../fixedfile",
    "step2_bldatabase": "http://server/2ndd/.../belliloveu.png",
    "step3_final": "http://server/last/.../applefixed.png"
  }
}
```

### Listar Modelos Soportados

```
GET /models
```

## 📱 Modelos Soportados

### iPhones

- iPhone XR (iPhone11-8)
- iPhone XS / XS Max (iPhone11-2, iPhone11-6)
- iPhone 11 series (iPhone12-1, 12-3, 12-5, 12-8)
- iPhone 12 series (iPhone13-1, 13-2, 13-3, 13-4)
- iPhone 13 series (iPhone14-2, 14-3, 14-4, 14-5)
- iPhone SE 3rd Gen (iPhone14-6)
- iPhone 14 series (iPhone14-7, 14-8, iPhone15-2, 15-3)
- iPhone 15 series (iPhone15-4, 15-5, iPhone16-1, 16-2)
- iPhone 16 series (iPhone17-1, 17-2, 17-3, 17-4, 17-5)
- iPhone 17 series (iPhone18-1, 18-2, 18-3, 18-4)

### iPads

- iPad Pro (iPad8-x, iPad13-x, iPad14-x)
- iPad Air (iPad11-x, iPad13-x)
- iPad mini (iPad11-x, iPad14-x)
- iPad 10th Gen (iPad13-19)

## 🔧 Flujo de Bypass

1. **Cliente conecta dispositivo** por USB
2. **Extrae el GUID** del SystemGroup desde logs del dispositivo
3. **Solicita payloads** al servidor: `/generate?prd=...&guid=...&sn=...`
4. **Descarga step3_final** (downloads.28.sqlitedb)
5. **Sube el archivo** a `/Downloads/downloads.28.sqlitedb` via AFC
6. **Reinicia el dispositivo**
7. **Copia iTunesMetadata.plist** de `/iTunes_Control/iTunes/` a `/Books/`
8. **Reinicia nuevamente**
9. **Dispositivo activado** ✅

## 🌐 Exposición con Cloudflare Tunnel

Para exponer el servidor de forma segura:

```bash
# Crear túnel
cloudflared tunnel create bypass-server

# Configurar DNS
cloudflared tunnel route dns bypass-server bypass.arepatool.com

# Ejecutar túnel
cloudflared tunnel run --url http://localhost:8080 bypass-server
```

## ⚠️ Notas Importantes

- Los payloads se eliminan automáticamente después de 60 minutos
- El servidor crea directorios temporales: `firststp/`, `2ndd/`, `last/`
- Cada solicitud genera payloads únicos con nombres aleatorios

## 📁 Estructura de Archivos

```
bypass-server/
├── Bypass-Server-Start.bat   # Script de inicio Windows
├── README.md                  # Este archivo
├── Maker/                     # Plists por modelo (backup)
└── public/                    # Web root
    ├── index.php              # API principal
    ├── Maker/                 # Plists por modelo
    │   ├── iPhone14-5/
    │   │   └── com.apple.MobileGestalt.plist
    │   └── ...
    ├── BLDatabaseManager.png  # Template SQL (Stage 2)
    ├── downloads.28.png       # Template SQL (Stage 3)
    ├── firststp/              # Payloads temporales
    ├── 2ndd/                  # Payloads temporales
    └── last/                  # Payloads temporales
```

## 🔒 Seguridad

- El servidor está diseñado para uso en red local
- Para producción, usar HTTPS via Cloudflare Tunnel
- No exponer directamente a Internet sin autenticación
