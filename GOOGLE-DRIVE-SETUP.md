# 📦 Configuración de Google Drive para Actualizaciones

## 🎯 Objetivo

Usar Google Drive como servidor de descarga para las actualizaciones de AREPA-TOOL.

## 📋 Pasos para Configurar

### 1. Subir el Archivo de Actualización a Google Drive

1. **Comprime tu aplicación actualizada** en un archivo ZIP:
   ```
   AREPA-TOOL-v1.0.1.zip
   ```

2. **Sube el archivo a Google Drive**:
   - Ve a [Google Drive](https://drive.google.com)
   - Crea una carpeta llamada "AREPA-TOOL-Updates" (opcional pero recomendado)
   - Sube el archivo ZIP

3. **Obtén el enlace de descarga directa**:
   - Haz clic derecho en el archivo → "Obtener enlace"
   - Cambia los permisos a "Cualquier persona con el enlace"
   - Copia el enlace

### 2. Convertir el Enlace de Google Drive a Descarga Directa

Google Drive te da un enlace como este:
```
https://drive.google.com/file/d/1ABC123XYZ456/view?usp=sharing
```

**Necesitas convertirlo a formato de descarga directa:**

#### Opción A: Formato de Descarga Directa de Google Drive
```
https://drive.google.com/uc?export=download&id=1ABC123XYZ456
```

#### Opción B: Usar un Servicio de Conversión
Usa este servicio: https://sites.google.com/site/gdocs2direct/

1. Pega tu enlace de Google Drive
2. Obtén el enlace de descarga directa
3. Copia el enlace generado

### 3. Crear la Versión en el Panel de Administración

1. **Abre el panel web**: `index.html`
2. **Ve a la sección "Updates"**
3. **Click en "Add New Version"**
4. **Completa el formulario**:

```
Version Number: 1.0.1

Download URL: https://drive.google.com/uc?export=download&id=TU_ID_AQUI

Changelog:
🐛 Bug Fixes:
- Fixed crash when disconnecting device
- Improved stability in Magisk Patch

✨ Improvements:
- Faster ADB operations
- Better error messages

Mandatory Update: ☐ (desmarcado para opcional)
                  ☑ (marcado para obligatoria)
```

5. **Click en "Create Version"**

## 🔄 Flujo de Actualización

```
1. Usuario abre AREPA-TOOL
   ↓
2. LoginForm verifica versión en Supabase
   ↓
3. Si hay nueva versión:
   ├─ Muestra diálogo con changelog
   └─ Usuario acepta
   ↓
4. Abre navegador con enlace de Google Drive
   ↓
5. Usuario descarga el ZIP
   ↓
6. Usuario extrae y ejecuta nueva versión
```

## 📝 Ejemplo Completo

### Paso 1: Preparar el Archivo

```bash
# Estructura del ZIP
AREPA-TOOL-v1.0.1.zip
├── AREPA-TOOL.exe
├── Resources/
├── Tools/
└── README.txt
```

### Paso 2: Subir a Google Drive

1. Sube `AREPA-TOOL-v1.0.1.zip` a Google Drive
2. Obtén el ID del archivo (ejemplo: `1ABC123XYZ456`)
3. Construye la URL de descarga:
   ```
   https://drive.google.com/uc?export=download&id=1ABC123XYZ456
   ```

### Paso 3: Crear Versión en Panel

```javascript
Version: 1.0.1
Download URL: https://drive.google.com/uc?export=download&id=1ABC123XYZ456
Changelog: (tu changelog aquí)
Mandatory: NO
```

## 🎨 Tipos de Actualizaciones

### Actualización Opcional
```
Mandatory: ☐ NO

Comportamiento:
- Usuario ve diálogo "¿Deseas actualizar?"
- Puede elegir "Sí" o "No"
- Si elige "Sí", abre el navegador
- Si elige "No", continúa con la versión actual
```

### Actualización Obligatoria
```
Mandatory: ☑ SÍ

Comportamiento:
- Usuario ve diálogo "DEBES actualizar"
- Solo botón "OK"
- Abre el navegador automáticamente
- Cierra la aplicación
- Usuario debe descargar e instalar para continuar
```

## 🔐 Permisos de Google Drive

**IMPORTANTE**: El archivo debe tener permisos públicos:

1. Clic derecho en el archivo
2. "Compartir" → "Obtener enlace"
3. Cambiar a: **"Cualquier persona con el enlace"**
4. Rol: **"Lector"**

## 🚨 Solución de Problemas

### Problema: "No se puede descargar el archivo"

**Solución**:
1. Verifica que el enlace sea de descarga directa
2. Verifica que los permisos sean públicos
3. Prueba el enlace en un navegador de incógnito

### Problema: "Descarga un archivo HTML en lugar del ZIP"

**Causa**: El enlace no es de descarga directa

**Solución**: Usa el formato correcto:
```
❌ MAL: https://drive.google.com/file/d/ID/view
✅ BIEN: https://drive.google.com/uc?export=download&id=ID
```

### Problema: "Archivo muy grande (>100MB)"

**Solución**: Google Drive tiene límites para descargas directas de archivos grandes.

**Alternativas**:
1. Comprimir más el archivo
2. Dividir en partes más pequeñas
3. Usar Dropbox o MEGA como alternativa

## 📊 Alternativas a Google Drive

Si Google Drive no funciona bien, puedes usar:

### Dropbox
```
1. Sube el archivo a Dropbox
2. Obtén el enlace compartido
3. Cambia ?dl=0 por ?dl=1 al final
   Ejemplo: https://www.dropbox.com/s/abc123/file.zip?dl=1
```

### MEGA
```
1. Sube el archivo a MEGA
2. Obtén el enlace público
3. Usa el enlace directamente
```

### GitHub Releases (Recomendado para proyectos públicos)
```
1. Crea un release en GitHub
2. Adjunta el ZIP como asset
3. Usa la URL del asset
   Ejemplo: https://github.com/user/repo/releases/download/v1.0.1/AREPA-TOOL-v1.0.1.zip
```

## 🎓 Mejores Prácticas

1. **Nombra los archivos consistentemente**:
   ```
   AREPA-TOOL-v1.0.0.zip
   AREPA-TOOL-v1.0.1.zip
   AREPA-TOOL-v1.0.2.zip
   ```

2. **Mantén un changelog claro**:
   ```
   ✨ Nuevas características
   🐛 Correcciones de bugs
   ⚡ Mejoras de rendimiento
   🔒 Actualizaciones de seguridad
   ```

3. **Prueba el enlace antes de publicar**:
   - Abre el enlace en un navegador de incógnito
   - Verifica que descargue el archivo correcto
   - Verifica que el ZIP no esté corrupto

4. **Usa actualizaciones obligatorias solo para**:
   - Correcciones de seguridad críticas
   - Cambios en la base de datos
   - Incompatibilidades con versiones anteriores

## 📞 Soporte

Si tienes problemas:
1. Verifica que el enlace funcione en un navegador
2. Revisa los permisos del archivo en Google Drive
3. Verifica que el formato del enlace sea correcto
4. Prueba con un archivo más pequeño primero

---

**Desarrollado para AREPA-TOOL** 🛠️
