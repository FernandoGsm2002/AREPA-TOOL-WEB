-- ============================================
-- AREPA-TOOL: Control Global de Licencias
-- ============================================
-- EJECUTAR DESPUÉS DE supabase-setup.sql
-- Este script agrega control global ON/OFF de la app

-- Tabla de configuración global
CREATE TABLE IF NOT EXISTS public.app_config (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuración inicial (versión actual: 1.0.0)
INSERT INTO public.app_config (key, value) VALUES
('app_enabled', 'true'),
('app_minimum_version', '1.0.0'),
('app_disabled_message', 'Esta versión de AREPA-TOOL ha sido desactivada.

Por favor descarga la última versión desde:
https://www.leope-gsm.com/')
ON CONFLICT (key) DO NOTHING;

-- Función para verificar licencia global
CREATE OR REPLACE FUNCTION get_license_config()
RETURNS TABLE (
    enabled BOOLEAN,
    message TEXT,
    minimum_version TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT value::BOOLEAN FROM public.app_config WHERE key = 'app_enabled'),
        (SELECT value FROM public.app_config WHERE key = 'app_disabled_message'),
        (SELECT value FROM public.app_config WHERE key = 'app_minimum_version');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: Todos pueden leer (necesario para verificar licencia)
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read app_config" ON public.app_config
    FOR SELECT USING (true);

CREATE POLICY "Allow update app_config" ON public.app_config
    FOR UPDATE USING (true);

-- Índice
CREATE INDEX IF NOT EXISTS idx_app_config_key ON public.app_config(key);

-- ============================================
-- CÓMO USAR:
-- ============================================
/*
DESHABILITAR LA APP GLOBALMENTE:
UPDATE public.app_config 
SET value = 'false' 
WHERE key = 'app_enabled';

HABILITAR LA APP:
UPDATE public.app_config 
SET value = 'true' 
WHERE key = 'app_enabled';

CAMBIAR VERSIÓN MÍNIMA:
UPDATE public.app_config 
SET value = '1.1.0' 
WHERE key = 'app_minimum_version';

CAMBIAR MENSAJE:
UPDATE public.app_config 
SET value = 'Mantenimiento en curso. Disponible en 2 horas.' 
WHERE key = 'app_disabled_message';
*/
