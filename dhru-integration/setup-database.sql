-- =====================================================
-- PREPARAR SUPABASE PARA INTEGRACIÓN CON DHRU
-- =====================================================

-- 1. Agregar columna para tracking de órdenes de Dhru
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS dhru_order_id TEXT;

-- 2. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_users_dhru_order_id 
ON public.users(dhru_order_id);

-- 3. Agregar columna para tracking en bypass_registrations
ALTER TABLE public.bypass_registrations 
ADD COLUMN IF NOT EXISTS dhru_order_id TEXT;

-- 4. Crear índice
CREATE INDEX IF NOT EXISTS idx_bypass_dhru_order_id 
ON public.bypass_registrations(dhru_order_id);

-- 5. Verificar que las tablas existen
SELECT 'users table' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'bypass_registrations table', COUNT(*) FROM public.bypass_registrations;

-- =====================================================
-- OPCIONAL: Crear tabla de logs para debugging
-- =====================================================

CREATE TABLE IF NOT EXISTS public.dhru_api_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    request_data JSONB,
    response_data JSONB,
    status TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_dhru_logs_created 
ON public.dhru_api_logs(created_at DESC);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver estructura de tabla users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver estructura de tabla bypass_registrations
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bypass_registrations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- LISTO!
-- =====================================================
-- Ahora puedes usar la integración con Dhru Fusion
