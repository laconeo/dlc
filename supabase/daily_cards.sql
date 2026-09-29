-- ============================================================
-- TABLA Y POLÍTICAS PARA CARTAS DIARIAS DEL DESAFÍO (30 DÍAS)
-- Ejecutar en Supabase -> SQL Editor para que las cartas
-- subidas por el superadmin/maestros sean visibles para todos los alumnos.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.daily_cards (
  day INT PRIMARY KEY,
  image_url TEXT NOT NULL,
  character TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.daily_cards ENABLE ROW LEVEL SECURITY;

-- 1. Cualquiera (autenticado o anónimo) puede consultar y ver las cartas del día
DROP POLICY IF EXISTS "daily_cards: read" ON public.daily_cards;
CREATE POLICY "daily_cards: read"
  ON public.daily_cards FOR SELECT
  TO authenticated, anon
  USING (true);

-- 2. Guardar, actualizar o eliminar cartas (controlado por la interfaz para Maestros y Superadmin)
DROP POLICY IF EXISTS "daily_cards: instructor modify" ON public.daily_cards;
DROP POLICY IF EXISTS "daily_cards: modify" ON public.daily_cards;
CREATE POLICY "daily_cards: modify"
  ON public.daily_cards FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

