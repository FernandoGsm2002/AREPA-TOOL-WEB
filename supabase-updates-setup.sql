-- =====================================================
-- AREPA-TOOL: Sistema de Actualizaciones y Anuncios
-- =====================================================

-- Tabla para versiones de la aplicación
CREATE TABLE IF NOT EXISTS app_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(20) NOT NULL UNIQUE,
    release_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    download_url TEXT NOT NULL,
    changelog TEXT,
    is_mandatory BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    min_required_version VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Tabla para anuncios en tiempo real
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info', -- info, warning, error, success
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Mayor número = mayor prioridad
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    target_users VARCHAR(20) DEFAULT 'all', -- all, active, pending
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Tabla para tracking de actualizaciones por usuario
CREATE TABLE IF NOT EXISTS user_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    device_id TEXT,
    UNIQUE(user_id, version)
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_app_versions_active ON app_versions(is_active, release_date DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, priority DESC, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_updates_user ON user_updates(user_id, updated_at DESC);

-- Función para obtener la última versión disponible
CREATE OR REPLACE FUNCTION get_latest_version()
RETURNS TABLE (
    version VARCHAR(20),
    download_url TEXT,
    changelog TEXT,
    is_mandatory BOOLEAN,
    release_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        av.version,
        av.download_url,
        av.changelog,
        av.is_mandatory,
        av.release_date
    FROM app_versions av
    WHERE av.is_active = true
    ORDER BY av.release_date DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener anuncios activos
CREATE OR REPLACE FUNCTION get_active_announcements(p_user_status VARCHAR DEFAULT 'all')
RETURNS TABLE (
    id UUID,
    title VARCHAR(200),
    message TEXT,
    type VARCHAR(20),
    priority INTEGER,
    start_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.message,
        a.type,
        a.priority,
        a.start_date
    FROM announcements a
    WHERE a.is_active = true
        AND (a.start_date IS NULL OR a.start_date <= NOW())
        AND (a.end_date IS NULL OR a.end_date >= NOW())
        AND (a.target_users = 'all' OR a.target_users = p_user_status)
    ORDER BY a.priority DESC, a.start_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar actualización de usuario
CREATE OR REPLACE FUNCTION log_user_update(
    p_user_id UUID,
    p_version VARCHAR(20),
    p_device_id TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_updates (user_id, version, device_id, updated_at)
    VALUES (p_user_id, p_version, p_device_id, NOW())
    ON CONFLICT (user_id, version) 
    DO UPDATE SET updated_at = NOW(), device_id = p_device_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS (Row Level Security)
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_updates ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad: Todos pueden leer versiones y anuncios activos
CREATE POLICY "Anyone can read active versions"
    ON app_versions FOR SELECT
    USING (is_active = true);

CREATE POLICY "Anyone can read active announcements"
    ON announcements FOR SELECT
    USING (is_active = true);

-- Solo usuarios autenticados pueden registrar sus actualizaciones
CREATE POLICY "Users can log their own updates"
    ON user_updates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own updates"
    ON user_updates FOR SELECT
    USING (auth.uid() = user_id);

-- Insertar versión inicial
INSERT INTO app_versions (version, download_url, changelog, is_mandatory, is_active)
VALUES (
    '1.0.0',
    'https://github.com/FernandoGsm2002/AREPA-TOOL/releases/download/v1.0.0/AREPA-TOOL-v1.0.0.zip',
    '🎉 Versión inicial de AREPA-TOOL
    
✨ Características principales:
- Operaciones Samsung (Odin, Magisk, KG Operations)
- Operaciones Android (ADB, App Manager, PM Root, MDM)
    
🔧 Herramientas incluidas:
- Fix Apps Bancarias 2025
- Samsung KG Bypass Universal (Adb necessary)
-Bypass Premium Dns (CLARO/TECEL/TIGO)
- Magisk Auto Patch
- Y mucho más...',
    false,
    true
);

-- Insertar anuncio de bienvenida
INSERT INTO announcements (title, message, type, priority, target_users)
VALUES (
    '🎉 Bienvenido a AREPA-TOOL',
    'Gracias por usar AREPA-TOOL.  Si tienes algún problema, contacta al administrador.',
    'info',
    100,
    'all'
);

COMMENT ON TABLE app_versions IS 'Almacena información de versiones de la aplicación';
COMMENT ON TABLE announcements IS 'Almacena anuncios para mostrar a los usuarios';
COMMENT ON TABLE user_updates IS 'Tracking de actualizaciones por usuario';
