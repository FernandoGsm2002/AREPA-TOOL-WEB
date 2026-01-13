# 📋 RustA12+ Bypass - Análisis de Payloads

## Fecha de Análisis

**2026-01-12**

---

## 🎯 Objetivo

Documentar la estructura exacta de los payloads generados por el servidor original de RustA12+ para poder replicarlos en nuestro servidor.

---

## 📊 Estructura del Servidor Original

### Endpoint

```
https://codex-r1nderpest-a12.ru/rust.php?prd={model}&guid={guid}&sn={serial}&ios_version={ios}
```

### Respuesta JSON

```json
{
  "success": true,
  "parameters": {
    "prd": "iPhone12,3",
    "guid": "B3A9BC8C-AB88-40A6-B240-D22C79789838",
    "sn": "F18ZL87HN6XW"
  },
  "links": {
    "step1_fixedfile": "https://codex.../cache/{hash}/firststp/fixedfile",
    "step2_bldatabase": "https://codex.../cache/{hash}/2ndd/belliloveu.png",
    "step3_final": "https://codex.../cache/{hash}/last/apllefuckedhhh.png"
  },
  "debug": {
    "cache_hash": "{sha256_hash}",
    "plist_used": "/Maker/iPhone12-3/{ios_version}/com.apple.MobileGestalt.plist",
    "plist_size": 8523
  }
}
```

### ⚠️ DIFERENCIA CRÍTICA

El servidor original organiza los plists por **versión de iOS**:

```
/Maker/iPhone12-3/18.6.2/com.apple.MobileGestalt.plist
```

Nuestro servidor usa:

```
/Maker/iPhone12-3/com.apple.MobileGestalt.plist
```

---

## 📦 Archivos Generados

### Step1: fixedfile (1,297 bytes)

- **Formato**: ZIP (EPUB-like)
- **Contenido**:
  - `Caches/mimetype`
  - `Caches/com.apple.MobileGestalt.plist` ← Plist específico para el modelo/iOS

### Step2: belliloveu.png (36,864 bytes)

- **Formato**: SQLite database
- **Nombre real**: `BLDatabaseManager.sqlite`
- **Contiene**: Assets de la biblioteca de libros

### Step3: apllefuckedhhh.png (122,880 bytes)

- **Formato**: SQLite database
- **Nombre real**: `downloads.28.sqlitedb`
- **Este es el payload principal que se sube al dispositivo**

---

## 🗄️ Estructura de downloads.28.sqlitedb

### Tablas

```
application_id, asset, download, download_policy, download_state,
finished_download, persistent_download, persistent_manager,
persistent_manager_kind, preorder, canceled_preorder, client,
purchase, purchase_manager, application_workspace_state, trnsaction
```

### Tabla `asset` - 4 Registros

#### Asset 1 (Descarga BLDatabaseManager.sqlite)

| Campo               | Valor                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| pid                 | 1234567890                                                                                               |
| download_id         | 6936249076851270150                                                                                      |
| asset_type          | media                                                                                                    |
| **url**             | `https://codex.../2ndd/belliloveu.png`                                                                   |
| **local_path**      | `/private/var/containers/Shared/SystemGroup/{GUID}/Documents/BLDatabaseManager/BLDatabaseManager.sqlite` |
| path_extension      | epub                                                                                                     |
| retry_count         | 6                                                                                                        |
| http_method         | GET                                                                                                      |
| is_external         | 1                                                                                                        |
| timeout_interval    | 60.0                                                                                                     |
| download_token      | 466440000                                                                                                |
| **hash_array**      | bplist + MD5 del plist (`6a8381da01ddbc939e73d110062bfc5f`)                                              |
| url_session_task_id | 1                                                                                                        |

#### Asset 2 (Crea sqlite-shm)

| Campo               | Valor                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| pid                 | 1234567891                                                                                                   |
| download_id         | 6936249076851270151                                                                                          |
| **url**             | `http://codex.../badfile.plist` (URL inválida intencionalmente)                                              |
| **local_path**      | `/private/var/containers/Shared/SystemGroup/{GUID}/Documents/BLDatabaseManager/BLDatabaseManager.sqlite-shm` |
| download_token      | 466440000                                                                                                    |
| url_session_task_id | -1                                                                                                           |

#### Asset 3 (Crea sqlite-wal)

| Campo               | Valor                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| pid                 | 1234567892                                                                                                   |
| download_id         | 6936249076851270152                                                                                          |
| **url**             | `http://codex.../badfile.plist`                                                                              |
| **local_path**      | `/private/var/containers/Shared/SystemGroup/{GUID}/Documents/BLDatabaseManager/BLDatabaseManager.sqlite-wal` |
| download_token      | 466440000                                                                                                    |
| url_session_task_id | -1                                                                                                           |

#### Asset 4 (Crea iTunesMetadata.plist)

| Campo               | Valor                                                                  |
| ------------------- | ---------------------------------------------------------------------- |
| pid                 | 1234567893                                                             |
| download_id         | 6936249076851270153                                                    |
| **url**             | `http://codex.../badfile.plist`                                        |
| **local_path**      | `/private/var/mobile/Media/iTunes_Control/iTunes/iTunesMetadata.plist` |
| download_token      | 466440000                                                              |
| url_session_task_id | -1                                                                     |

---

## 🔑 Claves para Replicar

### 1. GUID en local_path

El GUID del dispositivo DEBE estar incrustado en los `local_path`:

```
/SystemGroup/{GUID}/Documents/BLDatabaseManager/...
```

### 2. download_token

Valor fijo: `466440000`

### 3. hash_array

Binary plist que contiene el MD5 del `com.apple.MobileGestalt.plist`:

```
bplist00í\u0001_\u0010 {MD5_HASH}
```

### 4. Plists por Versión iOS

El servidor original tiene plists organizados por versión:

```
/Maker/iPhone12-3/18.6.2/com.apple.MobileGestalt.plist
/Maker/iPhone12-3/18.5/com.apple.MobileGestalt.plist
/Maker/iPhone12-3/17.7/com.apple.MobileGestalt.plist
```

### 5. URL de badfile

Las URLs `http://codex.../badfile.plist` son intencionalmente inválidas (HTTP, no HTTPS) para que el download falle pero el archivo local se cree.

---

## 📁 Archivos de Referencia

Los payloads capturados están en:

```
C:\Users\Fernando\Desktop\ArepaToolV2\AREPA-TOOL-PANEL\bypass-server\public\analysis\
```

Cada carpeta contiene:

- `INFO.txt` - Datos del dispositivo
- `response.json` - Respuesta del servidor original
- `step1_fixedfile.bin` - Archivo EPUB/ZIP
- `step2_bldatabase.bin` - BLDatabaseManager.sqlite
- `step3_downloads.28.sqlitedb` - Payload final

---

## ✅ TODO para Mejorar Nuestro Servidor

1. [ ] Organizar plists por versión de iOS (`/Maker/{model}/{ios_version}/`)
2. [ ] Generar hash_array con MD5 del plist usado
3. [ ] Verificar que los local_path incluyan el GUID correcto
4. [ ] Asegurar que se generen los 4 assets exactamente como el original
5. [ ] Implementar generación del hash de cache con SHA256

---

## 📝 Notas Adicionales

- El bypass funciona correctamente con el servidor original
- El modo proxy permite capturar y cachear payloads
- Los payloads cacheados funcionan para el mismo GUID
- Diferentes reinicios generan diferentes GUIDs, por lo que cada vez se necesita un nuevo payload

---

## 📷 Problema de Cámara Negra

### Síntoma

- La app **Cámara nativa** de Apple muestra pantalla negra
- Apps de terceros (ProCam, etc) funcionan correctamente
- Las apps descargan lento desde App Store

### ⚠️ NOTA IMPORTANTE

Este problema es **inherente al bypass RustA12+ en general**, no es específico de nuestro servidor.
Incluso usando el servidor original de codex-r1nderpest-a12.ru, el problema persiste.

### Posibles Causas Técnicas

#### 1. MobileGestalt.plist incompleto o incorrecto

El servidor original usa plists **por versión de iOS**:

```
/Maker/iPhone12-3/18.6.2/com.apple.MobileGestalt.plist  (8,523 bytes)
```

Nuestro source local tiene:

```
/Maker/iPhone12-3/com.apple.MobileGestalt.plist  (10,478 bytes)
```

**Diferencia de ~2KB** - pueden faltar o sobrar keys.

#### 2. Keys de MobileGestalt relacionadas con cámara

El plist de MobileGestalt contiene datos del hardware. Keys potenciales:

- `CameraInfo` / `FrontCameraInfo`
- `AVCaptureDevices`
- Keys relacionadas con FaceTime/FaceID

#### 3. CacheData binario

El `CacheData` dentro del plist es un blob binario de 6,210 bytes que contiene los valores reales.
El servidor original puede generar este blob de manera diferente.

### Áreas a Investigar para Fork

1. **Comparar plists**:

   - Descargar el plist del servidor original (está en step1_fixedfile.bin → ZIP → `Caches/com.apple.MobileGestalt.plist`)
   - Comparar byte a byte con el nuestro

2. **Extraer y analizar CacheData**:

   - El formato parece ser propietario de Apple
   - Buscar documentación de MobileGestalt cache format

3. **Probar con bypass que SÍ funciona cámara**:
   - Capturar su payload
   - Comparar MobileGestalt.plist

### Archivos Relevantes

| Archivo                     | Ubicación                                                          |
| --------------------------- | ------------------------------------------------------------------ |
| Plist del source            | `bypass-server/public/Maker/{model}/com.apple.MobileGestalt.plist` |
| Plist del servidor original | Dentro de `step1_fixedfile.bin` (ZIP)                              |
| Step1 capturado             | `public/analysis/{device}/step1_fixedfile.bin`                     |

### Script para Extraer Plist del Servidor Original

```python
import zipfile
import io
import os

analysis_dir = r"public\analysis\iPhone12-3_B3A9BC8C"
step1_path = os.path.join(analysis_dir, "step1_fixedfile.bin")

with open(step1_path, 'rb') as f:
    data = f.read()

zf = zipfile.ZipFile(io.BytesIO(data))
plist_content = zf.read('Caches/com.apple.MobileGestalt.plist')
print(f"Original server plist size: {len(plist_content)} bytes")

# Save for comparison
with open('original_server_plist.plist', 'wb') as f:
    f.write(plist_content)
```

---

## 🔬 Investigación de Otros Bypasses

### Estado del Mercado (2024-2026)

Según investigación, la mayoría de bypasses A12+ tienen limitaciones similares:

| Tool            | Cámara           | App Store   | Celular      | Notas       |
| --------------- | ---------------- | ----------- | ------------ | ----------- |
| Checkm8/iRemove | ❓ No confirmado | ✅ Funciona | ❌ No Signal | Más popular |
| iRemoval Pro    | ❓ No confirmado | ✅ Funciona | ❌ No Signal | iOS 18+     |
| RustA12+        | ❌ Cámara negra  | ⚠️ Lento    | ❌ No Signal | Open source |

### Limitaciones Comunes

1. **No Signal**: Ningún bypass A12+ actual permite llamadas/SMS (modo solo WiFi)
2. **Cámara**: No se ha encontrado un bypass A12+ que garantice cámara funcionando
3. **App Store**: Funciona pero puede ser lento

### Áreas de Investigación para Mejorar

1. **Analizar herramientas de pago**:

   - Obtener trial/demo de iRemove o CheckM8
   - Capturar tráfico de red para ver qué hacen diferente
   - Comparar payloads

2. **Investigar MobileGestalt**:

   - ¿Qué keys son necesarias para cámara?
   - ¿El CacheData binario tiene información de hardware específica?

3. **Revisar logs del dispositivo**:

   - Conectar dispositivo y ejecutar `pymobiledevice3 syslog`
   - Abrir app Cámara y capturar errores
   - Buscar patrones en los logs

4. **Investigar alternativas al método BLDatabaseManager**:
   - ¿Existen otros vectores de ataque?
   - ¿Otros demonios además de itunesstored/bookassetd?

---

## 📋 Tareas Pendientes para Fork

### Prioridad Alta

- [ ] Capturar logs del dispositivo al abrir Cámara
- [ ] Identificar qué error produce la pantalla negra
- [ ] Comparar con bypass de pago si es posible

### Prioridad Media

- [ ] Documentar estructura completa del CacheData binario
- [ ] Probar diferentes versiones de MobileGestalt.plist
- [ ] Implementar generación propia de payloads

### Prioridad Baja

- [ ] Explorar métodos alternativos de bypass
- [ ] Investigar si existe solución para señal celular

---

## 🔴 Errores de Cámara Capturados (2026-01-12)

### Dispositivo de Prueba

- **Modelo**: iPhone 11 Pro (iPhone12,3)
- **iOS**: 18.6.2
- **Bypass**: RustA12+ via codex-r1nderpest-a12.ru
- **Síntoma**: Cámara nativa muestra pantalla negra

### Error Principal

```
Error Code: -12780
AVFoundationErrorDomain Code=-11800
"The operation could not be completed"
```

### Cadena de Errores en Logs

```log
1. H10ISPCaptureStreamSetProperty - Error setting VideoOutputConfigurations: -12780

2. BWFigCaptureStream: failed to set VideoOutputConfigurations (err=-12780)

3. BWMultiStreamCameraSourceNode: Fig assert "err == 0" at bail - (err=-12780)

4. FigCaptureCameraSourcePipeline: Fig assert "err == 0" at bail - (err=-12780)

5. FigCaptureSession: Error (-12780) is FATAL. Reset session running state

6. AVCaptureSession: posting AVCaptureSessionRuntimeErrorNotification
   - Error Domain=AVFoundationErrorDomain Code=-11800
   - NSLocalizedFailureReason=An unknown error occurred (-12780)

7. CAMCaptureEngine: Received a session runtime error notification during recovery
   - Error Domain=AVFoundationErrorDomain Code=-11800

8. CAMCaptureEngine: Encountered another AVCaptureSession runtime error during session recovery
```

### Errores Secundarios (Posiblemente Relacionados)

```log
ModelManagerServices[578] <Error>: Determined not eligible for domain 122
ModelManagerServices[578] <Error>: Determined not eligible for domain 123
ModelManagerServices[578] <Error>: Determined not eligible for domain 125
```

### Interpretación

| Componente                  | Significado                                              |
| --------------------------- | -------------------------------------------------------- |
| `H10ISP`                    | iPhone ISP (Image Signal Processor) - Hardware de cámara |
| `VideoOutputConfigurations` | Configuración de salida de video                         |
| `-12780`                    | Error específico de configuración de hardware            |
| `ModelManagerServices`      | Servicio de ML/AI de Apple                               |
| `domain 122/123/125`        | Dominios de capabilities no disponibles                  |

### Hipótesis

1. **MobileGestalt incompleto**: El cache de MobileGestalt no tiene las capabilities correctas del hardware de cámara

2. **Entitlements faltantes**: El bypass no restaura todos los entitlements necesarios para la cámara

3. **ISP Configuration**: El Image Signal Processor no puede configurarse porque faltan datos de hardware

### TODO: Comparar con Dispositivo Funcional

- [ ] Conectar iPhone con bypass donde cámara SÍ funciona
- [ ] Capturar logs al abrir cámara
- [ ] Comparar errores y mensajes
- [ ] Identificar qué es diferente

```

```
