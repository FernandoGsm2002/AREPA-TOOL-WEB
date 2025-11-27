-- =====================================================
-- QUERIES DE VERIFICACIÓN - PASSWORD RESET
-- =====================================================
-- IMPORTANTE: Ejecuta cada query POR SEPARADO en Supabase SQL Editor
-- Copia y pega UNA query a la vez

-- =====================================================
-- QUERY 1: Ver todos los usuarios en auth.users
-- =====================================================
-- Esta query muestra los usuarios registrados en Supabase Auth
-- Copia y ejecuta solo esta query:

SELECT 
    id,
    email,
    created_at,
    confirmed_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;


-- =====================================================
-- QUERY 2: Ver usuarios que NO están sincronizados
-- =====================================================
-- Esta query muestra usuarios en public.users que NO están en auth.users
-- Si aparecen usuarios aquí, necesitas recrearlos con SignUp
-- Copia y ejecuta solo esta query:

SELECT 
    u.id,
    u.username,
    u.email,
    u.status
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id::uuid
WHERE au.id IS NULL;


-- =====================================================
-- QUERY 3: Ver todos los usuarios con información completa
-- =====================================================
-- Esta query combina información de public.users y auth.users
-- Copia y ejecuta solo esta query:

SELECT 
    u.username,
    u.email,
    u.status,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id::uuid
ORDER BY u.created_at DESC;


-- =====================================================
-- QUERY 4: Ver políticas de seguridad de la tabla users
-- =====================================================
-- Esta query muestra las políticas RLS configuradas
-- Copia y ejecuta solo esta query:

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';


-- =====================================================
-- QUERY 5: Ver logs de auditoría de password reset
-- =====================================================
-- Esta query muestra los resets de contraseña enviados
-- Copia y ejecuta solo esta query:

SELECT 
    al.created_at,
    u.username,
    u.email,
    al.action,
    al.details
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.action = 'password_reset_sent'
ORDER BY al.created_at DESC
LIMIT 20;


-- =====================================================
-- QUERY 6: Contar usuarios por estado
-- =====================================================
-- Esta query muestra estadísticas de usuarios
-- Copia y ejecuta solo esta query:

SELECT 
    status,
    COUNT(*) as total
FROM public.users
GROUP BY status
ORDER BY total DESC;


-- =====================================================
-- QUERY 7: Ver usuarios activos con sesiones
-- =====================================================
-- Esta query muestra usuarios que tienen sesiones activas
-- Copia y ejecuta solo esta query:

SELECT 
    u.username,
    u.email,
    u.status,
    u.last_validation,
    u.current_machine_id
FROM public.users u
WHERE u.status = 'active'
    AND u.last_validation IS NOT NULL
ORDER BY u.last_validation DESC;


-- =====================================================
-- QUERY 8: Buscar usuario específico por email
-- =====================================================
-- Reemplaza 'usuario@ejemplo.com' con el email que buscas
-- Copia y ejecuta solo esta query:

SELECT 
    u.id,
    u.username,
    u.email,
    u.status,
    u.created_at,
    u.activated_at,
    u.subscription_end,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id::uuid
WHERE u.email = 'usuario@ejemplo.com';


-- =====================================================
-- FUNCIÓN: Enviar password reset (placeholder)
-- =====================================================
-- Esta función es solo informativa
-- El envío real se hace desde el frontend con:
-- supabase.auth.resetPasswordForEmail(email)
-- Copia y ejecuta solo esta query:

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


-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
/*

1. CÓMO USAR ESTAS QUERIES:
   - Abre Supabase SQL Editor
   - Copia UNA query a la vez
   - Pega en el editor
   - Click en "Run" o presiona Ctrl+Enter
   - Revisa los resultados

2. SI UNA QUERY DA ERROR:
   - Verifica que copiaste la query completa
   - Asegúrate de no copiar comentarios (líneas con --)
   - Ejecuta solo el SELECT, sin comentarios

3. QUERIES MÁS ÚTILES:
   - QUERY 1: Ver usuarios registrados
   - QUERY 2: Ver usuarios sin sincronizar
   - QUERY 3: Ver información completa de usuarios
   - QUERY 5: Ver historial de password resets

4. PARA DEBUGGING:
   - Si un usuario no puede hacer reset, usa QUERY 8
   - Verifica que el email exista en auth.users
   - Verifica que el usuario esté en public.users

5. LOGS DE SUPABASE:
   - Para ver emails enviados: Dashboard → Authentication → Logs
   - Para ver errores: Dashboard → Logs → Error Logs

*/

-- =====================================================
-- EJEMPLOS DE USO
-- =====================================================

-- Ejemplo 1: Buscar usuario por username
-- SELECT * FROM public.users WHERE username = 'nombre_usuario';

-- Ejemplo 2: Ver últimos 10 usuarios registrados
-- SELECT username, email, status, created_at 
-- FROM public.users 
-- ORDER BY created_at DESC 
-- LIMIT 10;

-- Ejemplo 3: Ver usuarios con suscripción expirada
-- SELECT username, email, subscription_end 
-- FROM public.users 
-- WHERE subscription_end < NOW() 
-- AND status = 'active';

-- Ejemplo 4: Ver sesiones activas de un usuario
-- SELECT * FROM sessions 
-- WHERE user_id = 'UUID_DEL_USUARIO' 
-- ORDER BY last_activity DESC;

