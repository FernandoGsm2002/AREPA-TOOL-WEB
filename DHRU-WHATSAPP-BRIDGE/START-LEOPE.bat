@echo off
title DHRU LeoPe-Gsm WhatsApp Bridge
color 0A

echo ============================================
echo    DHRU LeoPe-Gsm - WhatsApp Bridge
echo ============================================
echo.
echo [1/2] Iniciando servicio WhatsApp...
start "WhatsApp-Bot" /D "%~dp0whatsapp-service" cmd /k "node whatsapp-bot.js"

echo [2/2] Iniciando servidor DHRU Bridge...
timeout /t 3 /nobreak > nul
cd /d "%~dp0"
python dhru-whatsapp.py
pause
