# ============================================
# TEST API DHRU LICENSE - Activación de Licencias
# ============================================
# Ejecutar: .\test-dhru-license.ps1
# ============================================

$ErrorActionPreference = "Stop"

# Configuración - CAMBIAR ESTOS VALORES
$API_URL = "https://TU-VERCEL-APP.vercel.app/api/dhru-license"
$API_SECRET = "tu-api-secret-aqui"
$LOCAL_URL = "http://localhost:3000/api/dhru-license"

Write-Host @"
============================================
 TEST API DHRU LICENSE - ArepaTool
============================================
 Flujo:
 1. Usuario se registra en arepa-tool-web.vercel.app
 2. Usuario compra licencia en DHRU (solo email)
 3. API busca email → si existe: activa
                    → si no existe: error
============================================
"@ -ForegroundColor Cyan

# Preguntar qué servidor usar
$useLocal = Read-Host "¿Usar servidor local? (s/n)"
if ($useLocal -eq "s" -or $useLocal -eq "S") {
    $targetUrl = $LOCAL_URL
} else {
    $customUrl = Read-Host "URL de la API (Enter para usar default)"
    if ($customUrl) {
        $targetUrl = $customUrl
    } else {
        $targetUrl = $API_URL
    }
}

Write-Host "URL Target: $targetUrl" -ForegroundColor Yellow
Write-Host ""

# ============================================
# TEST 1: Email que NO existe (debería fallar)
# ============================================
function Test-EmailNotFound {
    param (
        [string]$Email = "noexiste_$(Get-Random -Maximum 99999)@test.com"
    )
    
    Write-Host "--------------------------------------------" -ForegroundColor Gray
    Write-Host "TEST: Email que NO existe en la base de datos" -ForegroundColor Yellow
    Write-Host "Email: $Email" -ForegroundColor White
    Write-Host "Esperado: ERROR - Correo no encontrado" -ForegroundColor White
    Write-Host ""
    
    $orderId = "TEST_NOTFOUND_$(Get-Random -Maximum 99999)"
    
    $body = @{
        key = $API_SECRET
        action = "placeorder"
        service = "arepatool_1year"
        Mail = $Email
        orderid = $orderId
    }
    
    try {
        $response = Invoke-RestMethod -Uri $targetUrl -Method POST -Body $body -ContentType "application/x-www-form-urlencoded"
        
        if ($response.status -eq "ERROR" -and $response.code -eq "NOT_FOUND") {
            Write-Host "✅ CORRECTO: Error esperado" -ForegroundColor Green
            Write-Host "Mensaje: $($response.message)" -ForegroundColor Cyan
        } else {
            Write-Host "⚠️ Respuesta inesperada:" -ForegroundColor Yellow
            $response | ConvertTo-Json -Depth 5 | Write-Host
        }
        
        return $response
    }
    catch {
        Write-Host "❌ ERROR de conexión:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $null
    }
}

# ============================================
# TEST 2: Email que SÍ existe (debería activar)
# ============================================
function Test-ActivateLicense {
    param (
        [string]$Email
    )
    
    if (-not $Email) {
        $Email = Read-Host "Ingresa un email que YA EXISTE en Supabase"
    }
    
    Write-Host "--------------------------------------------" -ForegroundColor Gray
    Write-Host "TEST: Activar licencia para usuario existente" -ForegroundColor Green
    Write-Host "Email: $Email" -ForegroundColor White
    Write-Host "Esperado: SUCCESS - Licencia activada" -ForegroundColor White
    Write-Host ""
    
    $orderId = "ACTIVATE_$(Get-Random -Maximum 99999)"
    
    $body = @{
        key = $API_SECRET
        action = "placeorder"
        service = "arepatool_1year"
        Mail = $Email
        orderid = $orderId
    }
    
    try {
        $response = Invoke-RestMethod -Uri $targetUrl -Method POST -Body $body -ContentType "application/x-www-form-urlencoded"
        
        Write-Host "RESPUESTA:" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 5 | Write-Host
        
        if ($response.status -eq "SUCCESS") {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host " ¡LICENCIA ACTIVADA EXITOSAMENTE!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host " Usuario: $($response.code)" -ForegroundColor Cyan
            Write-Host " Mensaje: $($response.message)" -ForegroundColor Cyan
            if ($response.details.expires) {
                Write-Host " Expira: $($response.details.expires)" -ForegroundColor Cyan
            }
            Write-Host "========================================" -ForegroundColor Green
        }
        
        return $response
    }
    catch {
        Write-Host "❌ ERROR:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        }
        return $null
    }
}

# ============================================
# TEST 3: Simular petición exacta de DHRU
# ============================================
function Test-DhruFormat {
    param (
        [string]$Email
    )
    
    if (-not $Email) {
        $Email = Read-Host "Email (formato DHRU)"
    }
    
    Write-Host "--------------------------------------------" -ForegroundColor Gray
    Write-Host "TEST: Formato exacto como lo envía DHRU" -ForegroundColor Magenta
    Write-Host "Email: $Email" -ForegroundColor White
    Write-Host ""
    
    # DHRU puede enviar el campo como 'Mail', 'mail', 'email', etc.
    $orderId = "DHRU_$(Get-Random -Maximum 99999)"
    
    # Simular exactamente como DHRU envía los datos
    $bodyString = "key=$API_SECRET&action=placeorder&service=ArepaTool+1+Year&Mail=$Email&orderid=$orderId"
    
    Write-Host "Body (raw): $bodyString" -ForegroundColor Gray
    Write-Host ""
    
    try {
        $response = Invoke-WebRequest -Uri $targetUrl -Method POST -Body $bodyString -ContentType "application/x-www-form-urlencoded"
        $jsonResponse = $response.Content | ConvertFrom-Json
        
        Write-Host "Status HTTP: $($response.StatusCode)" -ForegroundColor Cyan
        Write-Host "RESPUESTA:" -ForegroundColor Cyan
        $jsonResponse | ConvertTo-Json -Depth 5 | Write-Host
        
        return $jsonResponse
    }
    catch {
        Write-Host "❌ ERROR:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $null
    }
}

# ============================================
# TEST 4: Verificar estado de orden
# ============================================
function Test-OrderStatus {
    param (
        [string]$OrderId
    )
    
    if (-not $OrderId) {
        $OrderId = Read-Host "Order ID a verificar"
    }
    
    Write-Host "--------------------------------------------" -ForegroundColor Gray
    Write-Host "TEST: Verificar estado de orden" -ForegroundColor Blue
    Write-Host "Order ID: $OrderId" -ForegroundColor White
    Write-Host ""
    
    $body = @{
        key = $API_SECRET
        action = "status"
        orderid = $OrderId
    }
    
    try {
        $response = Invoke-RestMethod -Uri $targetUrl -Method POST -Body $body -ContentType "application/x-www-form-urlencoded"
        
        Write-Host "RESPUESTA:" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 5 | Write-Host
        return $response
    }
    catch {
        Write-Host "❌ ERROR:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $null
    }
}

# ============================================
# TEST 5: API Key inválida
# ============================================
function Test-InvalidKey {
    Write-Host "--------------------------------------------" -ForegroundColor Gray
    Write-Host "TEST: API Key inválida (debe rechazar)" -ForegroundColor Yellow
    Write-Host ""
    
    $body = @{
        key = "clave-incorrecta-12345"
        action = "placeorder"
        service = "arepatool_1year"
        Mail = "test@example.com"
        orderid = "INVALID_KEY_TEST"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $targetUrl -Method POST -Body $body -ContentType "application/x-www-form-urlencoded"
        Write-Host "⚠️ Respuesta (debería haber sido error 401):" -ForegroundColor Yellow
        $response | ConvertTo-Json | Write-Host
        return $response
    }
    catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 401) {
            Write-Host "✅ CORRECTO: Rechazado con 401 Unauthorized" -ForegroundColor Green
        } else {
            Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        }
        return $null
    }
}

# ============================================
# MENÚ PRINCIPAL
# ============================================
function Show-Menu {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host " SELECCIONA UN TEST:" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host " 1. Test email que NO existe (debe dar error)"
    Write-Host " 2. Activar licencia (email que SÍ existe)"
    Write-Host " 3. Test formato exacto de DHRU"
    Write-Host " 4. Verificar estado de orden"
    Write-Host " 5. Test API Key inválida"
    Write-Host " 6. Tests automáticos (todos los escenarios)"
    Write-Host " 0. Salir"
    Write-Host ""
}

# ============================================
# EJECUCIÓN
# ============================================

do {
    Show-Menu
    $choice = Read-Host "Opción"
    
    switch ($choice) {
        "1" {
            Test-EmailNotFound
        }
        "2" {
            Test-ActivateLicense
        }
        "3" {
            Test-DhruFormat
        }
        "4" {
            Test-OrderStatus
        }
        "5" {
            Test-InvalidKey
        }
        "6" {
            Write-Host ""
            Write-Host "EJECUTANDO TESTS AUTOMÁTICOS..." -ForegroundColor Cyan
            Write-Host ""
            
            # Test 1: Email no existe
            Test-EmailNotFound
            Start-Sleep -Seconds 1
            
            # Test 2: API Key inválida
            Test-InvalidKey
            Start-Sleep -Seconds 1
            
            Write-Host ""
            Write-Host "============================================" -ForegroundColor Cyan
            Write-Host " TESTS AUTOMÁTICOS COMPLETADOS" -ForegroundColor Cyan
            Write-Host "============================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Para probar activación real, usa opción 2" -ForegroundColor Yellow
            Write-Host "con un email que ya esté registrado en Supabase" -ForegroundColor Yellow
        }
        "0" {
            Write-Host "¡Hasta luego!" -ForegroundColor Green
        }
        default {
            Write-Host "Opción no válida" -ForegroundColor Red
        }
    }
    
    if ($choice -ne "0") {
        Write-Host ""
        Read-Host "Presiona Enter para continuar..."
    }
    
} while ($choice -ne "0")
