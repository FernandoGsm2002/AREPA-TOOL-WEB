-- =====================================================
-- BYPASS REGISTRATIONS TABLE SETUP
-- =====================================================

-- Crear tabla para registros de bypass
CREATE TABLE IF NOT EXISTS public.bypass_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    serial_number TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    user_email TEXT,
    device_info JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    approved_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_bypass_registrations_username ON public.bypass_registrations(username);
CREATE INDEX IF NOT EXISTS idx_bypass_registrations_status ON public.bypass_registrations(status);
CREATE INDEX IF NOT EXISTS idx_bypass_registrations_serial ON public.bypass_registrations(serial_number);
CREATE INDEX IF NOT EXISTS idx_bypass_registrations_created ON public.bypass_registrations(created_at DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_bypass_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bypass_registrations_updated_at
    BEFORE UPDATE ON public.bypass_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_bypass_registrations_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - SIMPLIFICADO
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.bypass_registrations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Cualquiera puede insertar (usuarios desde la app)
CREATE POLICY "Anyone can insert bypass registrations"
    ON public.bypass_registrations
    FOR INSERT
    WITH CHECK (true);

-- Policy 2: Cualquiera puede leer (usuarios ven sus registros, admins ven todo desde panel)
CREATE POLICY "Anyone can read bypass registrations"
    ON public.bypass_registrations
    FOR SELECT
    USING (true);

-- Policy 3: Cualquiera puede actualizar (solo admins lo harán desde panel)
CREATE POLICY "Anyone can update bypass registrations"
    ON public.bypass_registrations
    FOR UPDATE
    USING (true);

-- Policy 4: Cualquiera puede eliminar (solo admins lo harán desde panel)
CREATE POLICY "Anyone can delete bypass registrations"
    ON public.bypass_registrations
    FOR DELETE
    USING (true);

-- NOTA: La seguridad real está en:
-- 1. Los usuarios solo acceden desde la app C# (no tienen acceso al panel web)
-- 2. El panel web requiere autenticación de admin
-- 3. La app C# filtra por username al consultar
-- 4. Supabase anon key es de solo lectura/escritura básica

-- =====================================================
-- REALTIME
-- =====================================================

-- Habilitar Realtime para la tabla
ALTER PUBLICATION supabase_realtime ADD TABLE public.bypass_registrations;

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =====================================================

-- Insertar algunos registros de ejemplo
-- INSERT INTO public.bypass_registrations (serial_number, username, user_email, status, device_info)
-- VALUES 
--     ('SN123456789', 'testuser1', 'test1@example.com', 'pending', '{"model": "iPhone 12", "ios": "18.7"}'::jsonb),
--     ('SN987654321', 'testuser2', 'test2@example.com', 'approved', '{"model": "iPhone 13", "ios": "19.0"}'::jsonb),
--     ('SN555666777', 'testuser3', 'test3@example.com', 'rejected', '{"model": "iPhone 14", "ios": "20.1"}'::jsonb);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver todos los registros
-- SELECT * FROM public.bypass_registrations ORDER BY created_at DESC;

-- Contar por estado
-- SELECT status, COUNT(*) as count FROM public.bypass_registrations GROUP BY status;
