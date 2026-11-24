-- ==============================================================================
-- SEGURIDAD Y ROW LEVEL SECURITY (RLS) PARA SUPABASE
-- Proyecto: Calendary (Control de Jornadas y Horarios)
-- ==============================================================================

-- 1. Habilitar extensión UUID si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Activar Row Level Security en todas las tablas
ALTER TABLE shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_entries ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- POLÍTICAS PARA SHIFT_TEMPLATES (Plantillas de turno del usuario)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can only view their own shift templates" ON shift_templates;
CREATE POLICY "Users can only view their own shift templates"
    ON shift_templates FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own shift templates" ON shift_templates;
CREATE POLICY "Users can create their own shift templates"
    ON shift_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own shift templates" ON shift_templates;
CREATE POLICY "Users can update their own shift templates"
    ON shift_templates FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own shift templates" ON shift_templates;
CREATE POLICY "Users can delete their own shift templates"
    ON shift_templates FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- POLÍTICAS PARA WORK_ENTRIES (Registros de jornada de trabajo)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can only view their own work entries" ON work_entries;
CREATE POLICY "Users can only view their own work entries"
    ON work_entries FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own work entries" ON work_entries;
CREATE POLICY "Users can create their own work entries"
    ON work_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own work entries" ON work_entries;
CREATE POLICY "Users can update their own work entries"
    ON work_entries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own work entries" ON work_entries;
CREATE POLICY "Users can delete their own work entries"
    ON work_entries FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- POLÍTICAS PARA HOLIDAYS (Festivos nacionales públicos o locales del usuario)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view public holidays and their own" ON holidays;
CREATE POLICY "Users can view public holidays and their own"
    ON holidays FOR SELECT
    USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own custom holidays" ON holidays;
CREATE POLICY "Users can insert their own custom holidays"
    ON holidays FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own custom holidays" ON holidays;
CREATE POLICY "Users can manage their own custom holidays"
    ON holidays FOR ALL
    USING (auth.uid() = user_id);
