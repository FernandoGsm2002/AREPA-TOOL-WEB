@echo off
title DHRU API Server - ArepaToolV2
color 0A

echo ============================================================
echo   DHRU FUSION API - ArepaToolV2
echo   URL FIJA: https://api.arepatool.com
echo ============================================================
echo.

:: Cambiar al directorio del proyecto
cd /d "c:\Users\Fernando\Desktop\ArepaToolV2\AREPA-TOOL-PANEL\dhru-integration"

:: Iniciar cloudflared con el tunel nombrado
echo [1/2] Iniciando Cloudflare Tunnel (api.arepatool.com)...
start "Cloudflare Tunnel - api.arepatool.com" cmd /k "cloudflared tunnel --config cloudflared-config.yml run arepatool-api"

:: Esperar 3 segundos para que cloudflared inicie
timeout /t 3 /nobreak > nul

:: Iniciar el servidor Python
echo [2/2] Iniciando servidor Python...
echo.
echo ============================================================
echo   API URL: https://api.arepatool.com
echo   Esta URL es FIJA y nunca cambiara!
echo ============================================================
echo.
echo   Presiona Ctrl+C para detener el servidor
echo.

python dhru-server.py

pause
