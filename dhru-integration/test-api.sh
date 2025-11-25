#!/bin/bash

# =====================================================
# SCRIPT PARA PROBAR APIs DE DHRU INTEGRATION
# =====================================================

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
VERCEL_URL="https://tu-vercel-app.vercel.app"
API_SECRET="tu-dhru-api-secret"

echo "=============================================="
echo "TEST DHRU INTEGRATION APIs"
echo "=============================================="
echo ""

# Test 1: API de Licencias (placeorder)
echo -e "${YELLOW}Test 1: Crear Licencia (placeorder)${NC}"
echo "URL: $VERCEL_URL/api/dhru-service"
echo ""

response=$(curl -s -X POST "$VERCEL_URL/api/dhru-service" \
  -H "Content-Type: application/json" \
  -d "{
    \"key\": \"$API_SECRET\",
    \"action\": \"placeorder\",
    \"service\": \"arepatool_1year\",
    \"email\": \"test@example.com\",
    \"orderid\": \"TEST$(date +%s)\"
  }")

echo "Response:"
echo "$response" | jq '.' 2>/dev/null || echo "$response"
echo ""

# Verificar si fue exitoso
if echo "$response" | grep -q "SUCCESS"; then
    echo -e "${GREEN}✓ Test 1 PASSED${NC}"
else
    echo -e "${RED}✗ Test 1 FAILED${NC}"
fi
echo ""

# Test 2: API de Licencias (getbalance)
echo -e "${YELLOW}Test 2: Obtener Balance${NC}"
echo "URL: $VERCEL_URL/api/dhru-service"
echo ""

response=$(curl -s -X POST "$VERCEL_URL/api/dhru-service" \
  -H "Content-Type: application/json" \
  -d "{
    \"key\": \"$API_SECRET\",
    \"action\": \"getbalance\"
  }")

echo "Response:"
echo "$response" | jq '.' 2>/dev/null || echo "$response"
echo ""

if echo "$response" | grep -q "SUCCESS"; then
    echo -e "${GREEN}✓ Test 2 PASSED${NC}"
else
    echo -e "${RED}✗ Test 2 FAILED${NC}"
fi
echo ""

# Test 3: API de Bypass
echo -e "${YELLOW}Test 3: Enviar Bypass a Dhru${NC}"
echo "URL: $VERCEL_URL/api/dhru-bypass"
echo ""

response=$(curl -s -X POST "$VERCEL_URL/api/dhru-bypass" \
  -H "Content-Type: application/json" \
  -d "{
    \"serial_number\": \"TEST123ABC\",
    \"username\": \"testuser\",
    \"email\": \"test@example.com\",
    \"approved_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }")

echo "Response:"
echo "$response" | jq '.' 2>/dev/null || echo "$response"
echo ""

if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓ Test 3 PASSED${NC}"
else
    echo -e "${RED}✗ Test 3 FAILED${NC}"
fi
echo ""

echo "=============================================="
echo "TESTS COMPLETADOS"
echo "=============================================="
echo ""
echo "NOTAS:"
echo "- Verificar usuarios creados en Supabase"
echo "- Verificar órdenes en Dhru Fusion"
echo "- Ver logs en Vercel: vercel logs --follow"
