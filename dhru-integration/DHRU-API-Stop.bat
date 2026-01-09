@echo off
title Detener DHRU API Server
color 0C

echo ============================================================
echo   Deteniendo servicios DHRU API...
echo ============================================================
echo.

:: Matar proceso Python (dhru-server)
echo [1/2] Deteniendo servidor Python...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq DHRU*" 2>nul
taskkill /F /IM python.exe 2>nul

:: Matar proceso cloudflared
echo [2/2] Deteniendo Cloudflare Tunnel...
taskkill /F /IM cloudflared.exe 2>nul

echo.
echo ============================================================
echo   Todos los servicios han sido detenidos
echo ============================================================
echo.

timeout /t 3

exit
