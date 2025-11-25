# =====================================================
# SCRIPT PARA PROBAR INTEGRACIÓN CON DHRU
# =====================================================

Write-Host "=============================================="
Write-Host "TEST DHRU INTEGRATION" -ForegroundColor Cyan
Write-Host "=============================================="
Write-Host ""

# Cargar variables de entorno desde .env.local
$envPath = Join-Path $PSScriptRoot ".." ".env.local"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "✓ Variables de entorno cargadas" -ForegroundColor Green
}
else {
    Write-Host "✗ No se encontró .env.local" -ForegroundColor Red
    exit 1
}

$DHRU_API_URL = $env:DHRU_API_URL
$DHRU_API_KEY = $env:DHRU_API_KEY

Write-Host ""
Write-Host "Configuración:" -ForegroundColor Yellow
Write-Host "  DHRU URL: $DHRU_API_URL"
Write-Host "  API Key: $($DHRU_API_KEY.Substring(0,10))..."
Write-Host ""

# =====================================================
# Test 1: Verificar Balance
# =====================================================
Write-Host "Test 1: Verificar Balance en DHRU" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

$body = @{
    key = $DHRU_API_KEY
    action = "getbalance"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $DHRU_API_URL -Method Post -Body $body -ContentType "application/json"
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
    if ($response.status -eq "SUCCESS") {
        Write-Host "✓ Test 1 PASSED - Balance: $($response.balance)" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Test 1 FAILED" -ForegroundColor Red
    }
}
catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# =====================================================
# Test 2: Obtener Servicios Disponibles
# =====================================================
Write-Host "Test 2: Obtener Servicios Disponibles" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

$body = @{
    key = $DHRU_API_KEY
    action = "getservices"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $DHRU_API_URL -Method Post -Body $body -ContentType "application/json"
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
    if ($response.status -eq "SUCCESS") {
        Write-Host "✓ Test 2 PASSED - Servicios encontrados: $($response.services.Count)" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Test 2 FAILED" -ForegroundColor Red
    }
}
catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=============================================="
Write-Host "TESTS COMPLETADOS" -ForegroundColor Cyan
Write-Host "=============================================="
Write-Host ""
Write-Host "NOTAS:" -ForegroundColor Yellow
Write-Host "- Si los tests fallan, verifica las credenciales en .env.local"
Write-Host "- Contacta a tu hermano si hay problemas con la API Key"
Write-Host "- La URL debe ser exactamente como la proporcionó tu hermano"
