# Test DHRU Integration
Write-Host "=============================================="
Write-Host "TEST DHRU INTEGRATION" -ForegroundColor Cyan
Write-Host "=============================================="
Write-Host ""

# Load environment variables
$envPath = Join-Path (Join-Path $PSScriptRoot "..") ".env.local"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "OK - Environment variables loaded" -ForegroundColor Green
}
else {
    Write-Host "ERROR - .env.local not found" -ForegroundColor Red
    exit 1
}

$DHRU_API_URL = $env:DHRU_API_URL
$DHRU_API_KEY = $env:DHRU_API_KEY
$DHRU_USERNAME = $env:DHRU_USERNAME

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  DHRU URL: $DHRU_API_URL"
Write-Host "  Username: $DHRU_USERNAME"
Write-Host "  API Key: $($DHRU_API_KEY.Substring(0,10))..."
Write-Host ""

# Test 1: Get Balance
Write-Host "Test 1: Get Balance" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

$body = @{
    username = $DHRU_USERNAME
    api_key = $DHRU_API_KEY
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $DHRU_API_URL -Method Post -Body $body -ContentType "application/json"
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
    if ($response.status -eq "SUCCESS") {
        Write-Host "OK - Test 1 PASSED - Balance: $($response.balance)" -ForegroundColor Green
    }
    else {
        Write-Host "FAIL - Test 1 FAILED" -ForegroundColor Red
    }
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Get Services
Write-Host "Test 2: Get Services" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

$body = @{
    username = $DHRU_USERNAME
    api_key = $DHRU_API_KEY
    action = "services"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $DHRU_API_URL -Method Post -Body $body -ContentType "application/json"
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
    if ($response.status -eq "SUCCESS") {
        Write-Host "OK - Test 2 PASSED - Services found: $($response.services.Count)" -ForegroundColor Green
    }
    else {
        Write-Host "FAIL - Test 2 FAILED" -ForegroundColor Red
    }
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=============================================="
Write-Host "TESTS COMPLETED" -ForegroundColor Cyan
Write-Host "=============================================="
