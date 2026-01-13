@echo off
title Bypass Server - ArepaToolV2
color 0B

echo ============================================================
echo   BYPASS SERVER - ArepaToolV2
echo   URL FIJA: https://bypass.arepatool.com
echo ============================================================
echo.

:: Verificar si cloudflared ya esta corriendo
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>NUL | find /I "cloudflared.exe">NUL
if not errorlevel 1 goto TunnelRunning

:StartTunnel
echo [1/2] Iniciando Cloudflare Tunnel (bypass.arepatool.com)...
start "Cloudflare Tunnel - bypass.arepatool.com" /D "c:\Users\Fernando\Desktop\ArepaToolV2\AREPA-TOOL-PANEL\dhru-integration" cmd /k "cloudflared tunnel --config cloudflared-config.yml run arepatool-api"
timeout /t 5 /nobreak > nul
goto StartServer

:TunnelRunning
echo [i] Cloudflare Tunnel ya esta activo (instancia compartida detectada).
echo     No es necesaria una nueva ventana de tunel.
goto StartServer

:StartServer
cd /d "c:\Users\Fernando\Desktop\ArepaToolV2\AREPA-TOOL-PANEL\bypass-server"

echo [2/2] Verificando puerto 8090...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8090" ^| find "LISTENING"') do (
    echo     Matando proceso anterior en puerto 8090 PID: %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo [2/2] Iniciando servidor Python...
echo.
echo ============================================================
echo   BYPASS URL: https://bypass.arepatool.com
echo   Esta URL es FIJA y nunca cambiara!
echo ============================================================
echo.
echo   Presiona Ctrl+C para detener el servidor
echo.

python bypass-server.py

pause
