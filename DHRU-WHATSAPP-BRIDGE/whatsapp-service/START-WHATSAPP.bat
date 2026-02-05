@echo off
title DHRU WhatsApp Service
color 0A

echo =========================================
echo   DHRU WhatsApp Bot Service
echo =========================================
echo.

cd /d "%~dp0"

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo [1/2] Instalando dependencias...
    npm install
    echo.
)

echo [2/2] Iniciando bot de WhatsApp...
echo.
echo IMPORTANTE: 
echo   - Escanea el codigo QR con tu telefono
echo   - Una vez conectado, el bot estara listo
echo.

node whatsapp-bot.js

pause
