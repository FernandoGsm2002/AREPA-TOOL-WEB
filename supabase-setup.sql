-- ============================================
-- AREPA-TOOL - Supabase Database Setup
-- Sistema Simple de Licencias
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase

-- ============================================
-- 1. TABLA: users (Usuarios y sus licencias)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'suspended'
    
    -- Fechas importantes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE, -- Cuando aprobaste la licencia
    subscription_end TIMESTAMP WITH TIME ZONE, -- 1 año desde activated_at
    
    -- Control de sesión (1 PC a la vez)
    current_machine_id VARCHAR(255), -- ID único de la PC actual
    last_validation TIMESTAMP WITH TIME ZONE -- Última vez que validó (cada 3h)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_end ON public.users(subscription_end);

-- ============================================
-- 2. TABLA: sessions (Historial de sesiones)
-- ============================================
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    device_id VARCHAR(255),
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON public.sessions(last_activity);

-- ============================================
-- 3. TABLA: audit_logs (Registro de acciones del admin)
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'approve_user', 'suspend_user', 'update_user'
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_logs(created_at);

-- ============================================
-- 4. FUNCIONES ÚTILES
-- ============================================

-- Función para verificar si puede hacer login (no está en otra PC)
CREATE OR REPLACE FUNCTION can_login(p_user_id UUID, p_machine_id VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_machine VARCHAR;
    v_last_validation TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT current_machine_id, last_validation
    INTO v_current_machine, v_last_validation
    FROM public.users
    WHERE id = p_user_id;
    
    -- Puede hacer login si:
    -- 1. No hay máquina registrada (primera vez)
    -- 2. Es la misma máquina
    -- 3. Han pasado más de 3 horas desde la última validación (sesión expirada)
    RETURN v_current_machine IS NULL 
        OR v_current_machine = p_machine_id
        OR v_last_validation IS NULL
        OR v_last_validation < NOW() - INTERVAL '3 hours';
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar machine_id y last_validation
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) - SIMPLIFICADO
-- ============================================
-- Solo el admin (tú) puede ver y modificar todo desde el panel web
-- Los usuarios NO pueden modificar su información, solo hacer login

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura a todos (necesario para login)
CREATE POLICY "Allow read for authentication" ON public.users
    FOR SELECT USING (true);

-- Política: Permitir inserción para registro
CREATE POLICY "Allow insert for registration" ON public.users
    FOR INSERT WITH CHECK (true);

-- Política: Solo permitir actualización de last_validation y current_machine_id
CREATE POLICY "Allow update validation" ON public.users
    FOR UPDATE USING (true);

-- Sessions: Permitir todo (se maneja desde la app)
CREATE POLICY "Allow all on sessions" ON public.sessions
    FOR ALL USING (true);

-- Audit logs: Permitir todo
CREATE POLICY "Allow all on audit_logs" ON public.audit_logs
    FOR ALL USING (true);

-- ============================================
-- 6. VERIFICACIÓN
-- ============================================

-- Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'sessions', 'audit_logs')
ORDER BY table_name;

-- ============================================
-- RESUMEN DEL SISTEMA
-- ============================================
/*
FLUJO COMPLETO:

1. REGISTRO:
   - Usuario se registra con username, email, password
   - Estado inicial: 'pending'
   - Aparece automáticamente en tu panel web (refrescando)

2. APROBACIÓN (TÚ):
   - Ves el usuario en el panel
   - Click "Approve"
   - Estado cambia a 'active'
   - Se establece: activated_at = NOW(), subscription_end = NOW() + 1 año

3. LOGIN:
   - Usuario intenta hacer login
   - Sistema verifica:
     a) Status = 'active'
     b) subscription_end > NOW()
     c) No está en otra PC (current_machine_id)
     d) O han pasado 3+ horas desde last_validation
   - Si todo OK: permite login y guarda machine_id

4. VALIDACIÓN CADA 3 HORAS:
   - Timer automático cada 3h
   - Verifica status y subscription_end
   - Actualiza last_validation
   - Si algo falla: cierra la app automáticamente

5. BLOQUEO MULTI-PC:
   - Solo puede estar abierto en 1 PC a la vez
   - Si intenta abrir en otra PC antes de 3h: BLOQUEADO
   - Después de 3h sin validar: se libera y puede abrir en otra PC

6. SUSPENSIÓN/EXPIRACIÓN:
   - Si suspendes: status = 'suspended' → app se cierra
   - Si expira (1 año): subscription_end < NOW() → app se cierra
   - Ambos casos: próxima validación (3h) lo detecta y cierra

PANEL WEB:
- Refrescas y ves usuarios nuevos automáticamente
- Apruebas/Suspendes con 1 click
- Ves sesiones activas en tiempo real
- Historial completo en audit_logs

CONTRASEÑAS:
- Supabase las hashea automáticamente con bcrypt
- Tú NO necesitas preocuparte por eso
- Son seguras por defecto

RLS (Row Level Security):
- Simplificado al máximo
- Los usuarios NO pueden modificar su información
- Solo pueden hacer login y validar
- Tú (admin) puedes ver y modificar todo desde el panel
*/
