-- ============================================================
-- TABLA Y POLÍTICAS PARA CARTAS DIARIAS DEL DESAFÍO (30 DÍAS)
-- Ejecutar en Supabase -> SQL Editor (Opcional para sincronización en la nube)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.daily_cards (
  day INT PRIMARY KEY,
  image_url TEXT NOT NULL,
  character TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.daily_cards ENABLE ROW LEVEL SECURITY;

-- 1. Cualquiera (autenticado o anónimo) puede ver las cartas del día
DROP POLICY IF EXISTS "daily_cards: read" ON public.daily_cards;
CREATE POLICY "daily_cards: read"
  ON public.daily_cards FOR SELECT
  TO authenticated, anon
  USING (true);

-- 2. Solo instructores y superadmin pueden insertar, actualizar o eliminar
DROP POLICY IF EXISTS "daily_cards: instructor modify" ON public.daily_cards;
CREATE POLICY "daily_cards: instructor modify"
  ON public.daily_cards FOR ALL
  TO authenticated, anon
  USING (
    exists (select 1 from public.instructors where instructors.user_id = auth.uid())
    or exists (select 1 from public.students where students.id = auth.uid() and students.role = 'instructor')
    or auth.jwt()->>'email' = 'laconeo@gmail.com'
  );
