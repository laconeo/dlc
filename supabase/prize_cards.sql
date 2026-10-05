-- ============================================================
-- TABLA Y POLÍTICAS PARA CARTAS PREMIO DEL DESAFÍO
-- Ejecutar en Supabase -> SQL Editor
-- Permite que los maestros suban las cartas premio de las 4 semanas
-- y que todos los alumnos puedan consultarlas.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.prize_cards (
  week INT PRIMARY KEY,
  image_url TEXT NOT NULL,
  patriarch TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.prize_cards ENABLE ROW LEVEL SECURITY;

-- 1. Cualquiera (autenticado o anónimo) puede consultar y ver las cartas premio
DROP POLICY IF EXISTS "prize_cards: read" ON public.prize_cards;
CREATE POLICY "prize_cards: read"
  ON public.prize_cards FOR SELECT
  TO authenticated, anon
  USING (true);

-- 2. Guardar, actualizar o eliminar cartas premio
DROP POLICY IF EXISTS "prize_cards: modify" ON public.prize_cards;
CREATE POLICY "prize_cards: modify"
  ON public.prize_cards FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);
