-- ============================================
-- FIX: Agregar función para actualizar machine_id
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase

-- Crear o reemplazar la función de actualización
CREATE OR REPLACE FUNCTION update_machine_validation(
    p_user_id UUID,
    p_machine_id VARCHAR
)
RETURNS void AS $$
BEGIN
    UPDATE public.users 
    SET current_machine_id = p_machine_id,
        last_validation = NOW()
    WHERE id = p_user_id;
    
    -- Log para debugging
    RAISE NOTICE 'Updated user % with machine_id %', p_user_id, p_machine_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que la función existe
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'update_machine_validation';

-- Probar la función (reemplaza con tu user_id real)
-- SELECT update_machine_validation('tu-user-id-aqui'::UUID, 'TEST_MACHINE_ID');

-- Verificar el resultado
-- SELECT id, username, current_machine_id, last_validation 
-- FROM public.users 
-- WHERE username = 'FernandoGsm2002';

-- ============================================
-- LIMPIAR DATOS DE PRUEBA (OPCIONAL)
-- ============================================
-- Ejecuta esto si quieres empezar de cero

-- Limpiar current_machine_id y last_validation
-- UPDATE public.users 
-- SET current_machine_id = NULL, 
--     last_validation = NULL
-- WHERE username = 'FernandoGsm2002';

-- Eliminar sesiones antiguas
-- DELETE FROM public.sessions 
-- WHERE user_id = (SELECT id FROM public.users WHERE username = 'FernandoGsm2002');

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Ver estado actual del usuario
SELECT 
    id,
    username,
    status,
    current_machine_id,
    last_validation,
    subscription_end
FROM public.users 
WHERE username = 'FernandoGsm2002';

-- Ver sesiones activas
SELECT 
    s.id,
    u.username,
    s.device_id,
    s.ip_address,
    s.last_activity,
    s.created_at
FROM public.sessions s
JOIN public.users u ON s.user_id = u.id
WHERE u.username = 'FernandoGsm2002'
ORDER BY s.last_activity DESC;
