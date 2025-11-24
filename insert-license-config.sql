-- ============================================
-- INSERTAR CONFIGURACIÓN DE LICENCIA
-- ============================================
-- Ejecuta SOLO este script si la tabla ya existe

-- Insertar o actualizar configuración
INSERT INTO public.app_config (key, value) VALUES
('app_enabled', 'true'),
('app_minimum_version', '1.0.0'),
('app_disabled_message', 'Esta versión de AREPA-TOOL ha sido desactivada.

Por favor descarga la última versión desde el panel de administración')
ON CONFLICT (key) 
DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW();

-- Verificar que se insertó correctamente
SELECT * FROM public.app_config ORDER BY key;
