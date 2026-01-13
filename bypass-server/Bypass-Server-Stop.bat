@echo off
title Detener Bypass Server
color 0C

echo ============================================================
echo   DETENIENDO BYPASS SERVER
echo ============================================================
echo.

:: Detener servidor Python de bypass
echo [1/2] Deteniendo servidor Python...
taskkill /F /FI "WINDOWTITLE eq Bypass Server*" 2>NUL
for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq bypass-server.py" /FO LIST ^| find "PID:"') do taskkill /PID %%a /F 2>NUL

:: Nota: No detenemos cloudflared porque puede estar siendo usado por DHRU tambien
echo [2/2] Cloudflare Tunnel no se detiene (puede ser usado por DHRU API)
echo.

echo ============================================================
echo   BYPASS SERVER DETENIDO
echo ============================================================
echo.

timeout /t 3
