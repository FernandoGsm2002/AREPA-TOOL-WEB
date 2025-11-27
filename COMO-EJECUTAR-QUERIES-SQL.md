# 📝 Cómo Ejecutar Queries SQL en Supabase

## ❌ ERROR COMÚN

**El error que estás viendo:**
```
Error: Failed to run sql query: ERROR: 42601: syntax error at or near "u"
```

**Causa:**
Estás intentando ejecutar **múltiples queries al mismo tiempo** sin separarlas correctamente.

---

## ✅ SOLUCIÓN: Ejecutar UNA Query a la Vez

### Método Correcto

1. **Abre Supabase SQL Editor**
   ```
   https://supabase.com/dashboard/project/lumhpjfndlqhexnjmvtu
   → SQL Editor (menú izquierdo)
   → New Query
   ```

2. **Copia SOLO UNA query**
   - Abre el archivo: `queries-verificacion-password-reset.sql`
   - Busca la query que necesitas
   - Copia SOLO el SELECT (sin comentarios)

3. **Pega en el editor**
   - Pega la query en Supabase SQL Editor
   - Verifica que no haya comentarios al inicio

4. **Ejecuta**
   - Click en "Run" (botón verde)
   - O presiona `Ctrl + Enter` (Windows) / `Cmd + Enter` (Mac)

---

## 📋 EJEMPLO PASO A PASO

### ❌ INCORRECTO (causa error)

```sql
-- Ver usuarios en auth.users
SELECT id, email FROM auth.users;
-- Ver usuarios en public.users
SELECT username, email FROM public.users;
```

**Problema:** Dos queries juntas

### ✅ CORRECTO

**Paso 1:** Ejecuta la primera query
```sql
SELECT id, email FROM auth.users;
```

**Paso 2:** Espera los resultados

**Paso 3:** Ejecuta la segunda query
```sql
SELECT username, email FROM public.users;
```

---

## 🎯 QUERIES MÁS ÚTILES (Copia y Pega)

### Query 1: Ver todos los usuarios registrados
```sql
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
```

### Query 2: Ver usuarios en public.users
```sql
SELECT 
    username,
    email,
    status,
    created_at
FROM public.users
ORDER BY created_at DESC;
```

### Query 3: Ver usuarios NO sincronizados
```sql
SELECT 
    u.id,
    u.username,
    u.email,
    u.status
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id::uuid
WHERE au.id IS NULL;
```

### Query 4: Buscar usuario por email
```sql
SELECT 
    u.username,
    u.email,
    u.status,
    au.last_sign_in_at
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id::uuid
WHERE u.email = 'usuario@ejemplo.com';
```
**⚠️ Reemplaza** `usuario@ejemplo.com` con el email real

### Query 5: Ver historial de password resets
```sql
SELECT 
    al.created_at,
    u.username,
    u.email,
    al.details
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.action = 'password_reset_sent'
ORDER BY al.created_at DESC
LIMIT 20;
```

---

## 🔧 CREAR LA FUNCIÓN DE PASSWORD RESET

Si necesitas crear la función, ejecuta esto **una sola vez**:

```sql
CREATE OR REPLACE FUNCTION admin_send_password_reset(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    result := json_build_object(
        'success', true,
        'message', 'Use supabase.auth.resetPasswordForEmail() from frontend'
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Nota:** Esta función es solo informativa. El envío real de emails se hace desde el panel web con JavaScript.

---

## 🐛 TROUBLESHOOTING

### Error: "syntax error at or near"

**Causa:** Múltiples queries o comentarios mal formateados

**Solución:**
1. Copia SOLO el SELECT
2. No copies las líneas con `--`
3. Ejecuta una query a la vez

### Error: "relation does not exist"

**Causa:** La tabla no existe o el nombre está mal escrito

**Solución:**
1. Verifica que la tabla exista: `SELECT * FROM information_schema.tables WHERE table_name = 'users';`
2. Verifica el schema: `public.users` o `auth.users`

### Error: "permission denied"

**Causa:** No tienes permisos para acceder a esa tabla

**Solución:**
1. Usa el SQL Editor de Supabase (tiene permisos de admin)
2. No uses el cliente de JavaScript para queries de admin

### No aparecen resultados

**Causa:** La tabla está vacía o el filtro es muy restrictivo

**Solución:**
1. Ejecuta sin WHERE: `SELECT * FROM users;`
2. Verifica que haya datos: `SELECT COUNT(*) FROM users;`

---

## 📊 VERIFICAR QUE TODO FUNCIONA

### Test 1: Verificar usuarios en auth.users
```sql
SELECT COUNT(*) as total_auth_users FROM auth.users;
```
**Resultado esperado:** Número > 0

### Test 2: Verificar usuarios en public.users
```sql
SELECT COUNT(*) as total_public_users FROM public.users;
```
**Resultado esperado:** Número > 0

### Test 3: Verificar sincronización
```sql
SELECT 
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM public.users) as public_users,
    (SELECT COUNT(*) FROM public.users u 
     LEFT JOIN auth.users au ON u.id = au.id::uuid 
     WHERE au.id IS NULL) as not_synced;
```
**Resultado esperado:** `not_synced` debe ser 0

---

## 💡 TIPS ÚTILES

### Tip 1: Guardar queries frecuentes
En Supabase SQL Editor:
1. Escribe tu query
2. Click en "Save" (arriba a la derecha)
3. Dale un nombre: "Ver usuarios activos"
4. Ahora puedes reutilizarla fácilmente

### Tip 2: Usar límites en queries grandes
```sql
SELECT * FROM users LIMIT 10;
```
Esto evita que se carguen miles de resultados

### Tip 3: Formatear queries para mejor lectura
```sql
SELECT 
    username,
    email,
    status
FROM users
WHERE status = 'active'
ORDER BY created_at DESC;
```

### Tip 4: Comentar queries para recordar qué hacen
```sql
-- Esta query busca usuarios activos con suscripción válida
SELECT username, email 
FROM users 
WHERE status = 'active' 
    AND subscription_end > NOW();
```

---

## 🎯 RESUMEN RÁPIDO

1. ✅ **Abre SQL Editor** en Supabase
2. ✅ **Copia UNA query** del archivo
3. ✅ **Pega en el editor**
4. ✅ **Click en Run** o Ctrl+Enter
5. ✅ **Revisa resultados**
6. ✅ **Repite** para otras queries

**NO hagas:**
- ❌ Copiar múltiples queries juntas
- ❌ Copiar comentarios (líneas con --)
- ❌ Ejecutar todo el archivo de una vez

---

## 📞 AYUDA ADICIONAL

Si sigues teniendo problemas:

1. **Copia el error completo**
   - Incluye el número de línea
   - Incluye el mensaje completo

2. **Verifica la query**
   - Asegúrate de que esté completa
   - Verifica que no falten paréntesis o comillas

3. **Prueba una query simple primero**
   ```sql
   SELECT 1;
   ```
   Si esto funciona, el problema está en tu query específica

4. **Revisa los logs de Supabase**
   - Dashboard → Logs → Error Logs
   - Busca errores recientes

---

**¡Listo! Ahora puedes ejecutar queries SQL correctamente en Supabase.** 🎉

