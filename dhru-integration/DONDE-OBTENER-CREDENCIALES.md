# 🔑 DÓNDE OBTENER LAS CREDENCIALES

## 📸 BASADO EN LA IMAGEN DEL PANEL DHRU

Veo que estás en: **Settings → API Settings**

---

## 1️⃣ DHRU_API_KEY (Ya la tienes)

```
DHRU_API_KEY=Q85-F15-4ZF-NFS-FBE-MRT-SFR-KTW
```

✅ **Ya la tienes**: Tu hermano te la proporcionó.

**Ubicación en Dhru**:
- Settings → API Settings → **Tu API Key personal**
- O en: Settings → **Cron Settings** (a veces aparece ahí)

---

## 2️⃣ DHRU_API_URL

```
DHRU_API_URL=https://www.leope-gsm.com/api/v2/
```

**Cómo obtenerla**:

### Opción A: Desde el Panel (Recomendado)
1. En Dhru, ir a: **Settings → API Settings**
2. Buscar sección: **"API Documentation"** o **"API Endpoint"**
3. Debería mostrar algo como:
   ```
   API Endpoint: https://www.leope-gsm.com/api/v2/
   ```

### Opción B: URLs Comunes de Dhru Fusion
```
https://www.leope-gsm.com/api/v2/
https://www.leope-gsm.com/api/
https://www.leope-gsm.com/includes/api.php
```

### Opción C: Preguntar a tu hermano
Pregúntale: "¿Cuál es la URL de la API para hacer peticiones externas?"

---

## 3️⃣ DHRU_API_SECRET (Tú lo generas)

```
DHRU_API_SECRET=genera-una-key-super-segura-aqui
```

❗ **IMPORTANTE**: Esta NO viene de Dhru. **TÚ la generas**.

**Propósito**: Proteger tu API para que solo Dhru pueda llamarla.

**Cómo generarla**:

### Opción A: PowerShell (Windows)
```powershell
# Generar key aleatoria de 32 caracteres
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Opción B: Online
1. Ir a: https://randomkeygen.com/
2. Copiar una "Fort Knox Password"
3. Ejemplo: `Kx9mP2nQ7wR5tY8uI3oL6aS4dF1gH0jZ`

### Opción C: Manual
Crear una contraseña larga y aleatoria:
```
Ejemplo: ArepaTool_2025_SecureKey_X9mK2pL7qW3nR8
```

**Dónde usarla**:
1. **En Vercel**: Variable de entorno `DHRU_API_SECRET`
2. **En Dhru**: Cuando crees la API, en el campo "API Key" o "Secret"

---

## 📋 RESUMEN COMPLETO

### Variables que YA TIENES:

```bash
# De tu hermano
DHRU_API_KEY=Q85-F15-4ZF-NFS-FBE-MRT-SFR-KTW

# De Supabase (ya las tienes en .env.local)
NEXT_PUBLIC_SUPABASE_URL=https://lumhpjfndlqhexnjmvtu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Variables que NECESITAS OBTENER:

```bash
# 1. Preguntar a tu hermano o buscar en Dhru
DHRU_API_URL=https://www.leope-gsm.com/api/v2/

# 2. Generar tú mismo (ver arriba)
DHRU_API_SECRET=tu-key-generada-aqui
```

---

## 🎯 PASOS PARA OBTENER DHRU_API_URL

### En el Panel de Dhru:

1. **Ir a**: Settings → **API Settings**
2. **Buscar sección**: "API Documentation" o "Developer"
3. **Debería mostrar**:
   ```
   API Endpoint: https://www.leope-gsm.com/api/v2/
   Documentation: [link]
   ```

### Si no encuentras la URL:

**Pregunta a tu hermano**:
```
"Hola, necesito la URL de la API de Dhru para hacer peticiones.
¿Cuál es el endpoint? ¿Es /api/v2/ o /api/ o /includes/api.php?"
```

### URLs Típicas de Dhru Fusion:

```
Versión 2: https://dominio.com/api/v2/
Versión 1: https://dominio.com/api/
Clásica:   https://dominio.com/includes/api.php
```

---

## 🔍 CÓMO VERIFICAR LA URL CORRECTA

Una vez que tengas una URL candidata, pruébala:

```powershell
# Test rápido
$body = @{
    key = 'Q85-F15-4ZF-NFS-FBE-MRT-SFR-KTW'
    action = 'getbalance'
}

Invoke-WebRequest -Uri "https://www.leope-gsm.com/api/v2/" `
  -Method POST -Body $body -TimeoutSec 10
```

**Si responde con JSON** → ✅ URL correcta
**Si da 404** → ❌ URL incorrecta

---

## 📝 EJEMPLO COMPLETO DE .env

```bash
# ============= DHRU FUSION =============
# Key que tu hermano te dio
DHRU_API_KEY=Q85-F15-4ZF-NFS-FBE-MRT-SFR-KTW

# URL de la API (preguntar a tu hermano)
DHRU_API_URL=https://www.leope-gsm.com/api/v2/

# Secret que TÚ generas (usar generador)
DHRU_API_SECRET=Kx9mP2nQ7wR5tY8uI3oL6aS4dF1gH0jZ

# ============= SUPABASE =============
NEXT_PUBLIC_SUPABASE_URL=https://lumhpjfndlqhexnjmvtu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bWhwamZuZGxxaGV4bmptdnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NjY1NjcsImV4cCI6MjA3OTA0MjU2N30.oXVYUjnSpDDQphLZJzglGaDSQTjuGzYgD-LMC5FwDHw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bWhwamZuZGxxaGV4bmptdnR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ2NjU2NywiZXhwIjoyMDc5MDQyNTY3fQ.8EGhQmddj46oO-qkBOrAiohGx3d0aFOXK10YSv4-qNM
```

---

## 🎯 ACCIÓN INMEDIATA

### 1. Generar DHRU_API_SECRET ahora:

```powershell
# Ejecutar en PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Resultado ejemplo**: `Kx9mP2nQ7wR5tY8uI3oL6aS4dF1gH0jZ`

### 2. Preguntar a tu hermano:

```
"¿Cuál es la URL de la API de Dhru para hacer peticiones?
Necesito el endpoint completo, por ejemplo:
https://www.leope-gsm.com/api/v2/"
```

### 3. Configurar en Vercel:

Una vez tengas ambas, ir a Vercel y agregar las 3 variables.

---

## ✅ CHECKLIST

- [x] DHRU_API_KEY - Ya la tienes
- [ ] DHRU_API_URL - Preguntar a tu hermano
- [ ] DHRU_API_SECRET - Generar ahora mismo
- [x] SUPABASE_URL - Ya la tienes
- [x] SUPABASE_SERVICE_ROLE_KEY - Ya la tienes

---

¿Necesitas ayuda para generar el DHRU_API_SECRET o para contactar a tu hermano?
