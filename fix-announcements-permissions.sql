-- ============================================
-- FIX: Permisos para Anuncios y Versiones
-- ============================================
-- Ejecuta este script para permitir crear/editar/eliminar anuncios y versiones desde el panel web

-- Eliminar políticas restrictivas existentes
DROP POLICY IF EXISTS "Anyone can read active versions" ON app_versions;
DROP POLICY IF EXISTS "Anyone can read active announcements" ON announcements;

-- POLÍTICAS PARA APP_VERSIONS
-- Todos pueden leer versiones activas (necesario para la app)
CREATE POLICY "Anyone can read active versions"
    ON app_versions FOR SELECT
    USING (is_active = true);

-- Permitir todas las operaciones (INSERT, UPDATE, DELETE) desde el panel web
CREATE POLICY "Allow all operations on versions"
    ON app_versions FOR ALL
    USING (true)
    WITH CHECK (true);

-- POLÍTICAS PARA ANNOUNCEMENTS
-- Todos pueden leer anuncios activos (necesario para la app)
CREATE POLICY "Anyone can read active announcements"
    ON announcements FOR SELECT
    USING (is_active = true);

-- Permitir todas las operaciones (INSERT, UPDATE, DELETE) desde el panel web
CREATE POLICY "Allow all operations on announcements"
    ON announcements FOR ALL
    USING (true)
    WITH CHECK (true);

-- Verificar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('app_versions', 'announcements')
ORDER BY tablename, policyname;
