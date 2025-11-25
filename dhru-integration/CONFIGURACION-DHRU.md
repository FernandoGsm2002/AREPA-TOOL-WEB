# ⚙️ CONFIGURACIÓN EN DHRU FUSION

## 📋 GUÍA PASO A PASO

### PASO 1: Crear API en Dhru

1. **Ir a Settings → API Settings**
2. **Click en "Add New API"**
3. **Completar formulario**:

```
API Name: ArepaTool API
API Type: Custom API
API URL: https://tu-vercel-app.vercel.app/api/dhru-service
Method: POST
Content-Type: application/json
```

4. **Configurar Parámetros**:

```
key: [tu-dhru-api-secret]
action: placeorder
service: {SERVICE_ID}
imei: {EMAIL}
email: {EMAIL}
orderid: {ORDERID}
```

5. **Guardar API**

---

### PASO 2: Configurar Respuesta Esperada

Dhru necesita saber qué formato de respuesta esperar:

**Respuesta Exitosa:**
```json
{
  "status": "SUCCESS",
  "orderid": "{ORDERID}",
  "code": "username",
  "message": "Account created",
  "details": {
    "username": "user_abc",
    "password": "pass123",
    "expires": "25/11/2026"
  }
}
```

**Campos a mapear en Dhru:**
- Status Field: `status`
- Order ID Field: `orderid`
- Code Field: `code`
- Message Field: `message`

---

### PASO 3: Asignar API al Servicio

1. **Ir a Services → Manage Services**
2. **Buscar**: "ArepaTool MultiTool Fix Yape, Bypass And More (1 Years)"
3. **Click en Edit**
4. **En "API Connection (Primary)"**:
   - Seleccionar: "ArepaTool API"
   - Guardar cambios

---

### PASO 4: Configurar Auto Reply

1. **En el servicio, ir a "Auto Reply"**
2. **Habilitar**: "Send Auto Reply"
3. **Template del Email**:

```
Subject: Your ArepaTool License - Order #{ORDERID}

Hello {CUSTOMER_NAME},

Thank you for your purchase!

Your ArepaTool credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username: {CODE}
Password: {DETAILS.password}
Expires: {DETAILS.expires}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Download: {DETAILS.download}

Instructions:
1. Download ArepaTool from the link above
2. Install and run the application
3. Login with your credentials
4. Enjoy!

Support: support@arepatool.com

Best regards,
ArepaTool Team
```

4. **Guardar Template**

---

### PASO 5: Probar Conexión

1. **En Dhru, ir a "Test API"**
2. **Seleccionar**: "ArepaTool API"
3. **Ingresar datos de prueba**:
   ```
   Email: test@example.com
   Service: arepatool_1year
   ```
4. **Click en "Test"**
5. **Verificar respuesta**:
   - Status: SUCCESS
   - Code: username generado
   - Details: credenciales

---

### PASO 6: Orden de Prueba Real

1. **Crear orden manual en Dhru**:
   - Service: ArepaTool MultiTool...
   - Customer Email: tu-email@test.com
   - Price: $0.00 (prueba)

2. **Verificar**:
   - ✓ Orden se marca como "Completed"
   - ✓ Email enviado al cliente
   - ✓ Usuario creado en Supabase

3. **Probar login en ArepaTool**:
   - Usar credenciales del email
   - Verificar que funciona

---

## 🔧 CONFIGURACIÓN AVANZADA

### Múltiples Servicios

Si tienes varios servicios (1 mes, 6 meses, 1 año):

1. **Crear servicios en Dhru**:
   - ArepaTool License - 1 Month
   - ArepaTool License - 6 Months
   - ArepaTool License - 1 Year

2. **Asignar la misma API a todos**

3. **La API detectará automáticamente la duración** por el nombre del servicio

---

### Webhooks (Opcional)

Si quieres notificaciones en tiempo real:

1. **En Dhru, ir a Settings → Webhooks**
2. **Agregar Webhook**:
   ```
   URL: https://tu-vercel-app.vercel.app/api/dhru-webhook
   Events: order.completed, order.cancelled
   ```

---

## 📊 MONITOREO

### Ver Logs en Dhru

1. **Ir a API Logs**
2. **Filtrar por**: "ArepaTool API"
3. **Ver**:
   - Peticiones enviadas
   - Respuestas recibidas
   - Errores

### Ver Logs en Vercel

```bash
vercel logs --follow
```

---

## 🚨 TROUBLESHOOTING

### Error: "API Connection Failed"
- Verificar URL de Vercel
- Verificar que la API está desplegada
- Probar URL manualmente con curl

### Error: "Invalid API Key"
- Verificar DHRU_API_SECRET en Vercel
- Verificar que coincide con el configurado en Dhru

### Orden no se completa automáticamente
- Ver logs de API en Dhru
- Ver logs en Vercel
- Verificar que el servicio tiene la API asignada

### Email no se envía
- Verificar template de Auto Reply
- Verificar que está habilitado
- Ver logs de email en Dhru

---

## ✅ CHECKLIST FINAL

- [ ] API creada en Dhru
- [ ] Parámetros configurados correctamente
- [ ] API asignada al servicio
- [ ] Auto Reply configurado
- [ ] Test de conexión exitoso
- [ ] Orden de prueba completada
- [ ] Email recibido
- [ ] Login en ArepaTool funciona

---

## 📞 CONTACTO

Si tienes problemas con la configuración en Dhru:
- Contactar a tu hermano (admin de Dhru)
- Ver documentación oficial de Dhru Fusion
- Revisar logs de API

---

¡Listo! Una vez completados estos pasos, la integración estará funcionando.
