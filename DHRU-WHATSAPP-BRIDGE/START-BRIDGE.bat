@echo off
title DHRU WhatsApp Bridge - ArepaTool
color 0B

echo ==========================================
echo   DHRU WHATSAPP BRIDGE - INICIANDO
echo ==========================================
echo.

:: Instalar dependencias si faltan (silencioso)
echo [*] Verificando dependencias...
pip install -r requirements.txt > nul 2>&1

:: Iniciar script
echo [*] Arrancando servidor...
echo.
echo   [!] Recuerda configurar .env con tu API Key de CallMeBot
echo.

python dhru-whatsapp.py

pause
