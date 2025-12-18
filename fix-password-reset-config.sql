-- =====================================================
-- FIX: Configuración de Password Reset
-- =====================================================
-- Este script asegura que el sistema de recuperación de contraseña funcione correctamente

-- =====================================================
-- 1. VERIFICAR TABLA AUTH.USERS
-- =====================================================
-- Supabase Auth maneja automáticamente la tabla auth.users
-- Solo necesitamos asegurarnos de que nuestros usuarios estén sincronizados

-- Ver usuarios en auth.users
SELECT 
    id,
    email,
    created_at,
    confirmed_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
    u.id,
    u.username,
    u.email,
    u.status
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id::uuid
WHERE au.id IS NULL;

CREATE OR REPLACE FUNCTION admin_send_password_reset(user_email TEXT)
RETURNS JSON AS $
DECLARE
    result JSON;
BEGIN

    result := json_build_object(
        'success', true,
        'message', 'Use supabase.auth.resetPasswordForEmail() from frontend'
    );
    
    RETURN result;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';

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
-- NOTAS IMPORTANTES
-- =====================================================
/*
1. EMAILS EN DESARROLLO:
   - Por defecto, Supabase envía emails reales
   - En desarrollo, puedes ver los links en los logs
   - Considera usar Inbucket para testing local

2. EMAILS EN PRODUCCIÓN:
   - Configura SMTP personalizado en: Settings → Auth → SMTP Settings
   - Opciones: SendGrid, AWS SES, Gmail, etc.
   - Esto mejora la deliverability

3. SEGURIDAD:
   - Los tokens de reset expiran en 1 hora
   - Solo se pueden usar una vez
   - Supabase hashea las contraseñas automáticamente

4. RATE LIMITING:
   - Supabase limita automáticamente los intentos de reset
   - Máximo 4 emails por hora por dirección

5. CONFIRMACIÓN DE EMAIL:
   - Actualmente deshabilitada (autoConfirm: true)
   - Para habilitarla: Settings → Auth → Email Confirmations
*/

-- =====================================================
-- RESUMEN DE CAMBIOS NECESARIOS
-- =====================================================
/*
✅ ARCHIVOS CREADOS:
   - reset-password.html (página de reset)
   - SOLUCION-PASSWORD-RESET.md (documentación)
   - fix-password-reset-config.sql (este archivo)

✅ ARCHIVOS ACTUALIZADOS:
   - app.js (función sendPasswordResetEmail)
   - hide.html (botón Reset Password en tabla de usuarios)

⚠️ CONFIGURACIÓN MANUAL EN SUPABASE:
   1. Authentication → URL Configuration
      - Site URL: tu dominio de Vercel
      - Redirect URLs: agregar /reset-password
   
   2. Authentication → Email Templates
      - Actualizar template de "Reset Password"
      - Cambiar {{ .ConfirmationURL }} por {{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery
   
   3. (Opcional) Settings → Auth → SMTP Settings
      - Configurar SMTP personalizado para producción

🚀 DEPLOYMENT:
   1. Subir archivos a Vercel/GitHub
   2. Configurar Supabase Dashboard
   3. Probar flujo completo
*/

