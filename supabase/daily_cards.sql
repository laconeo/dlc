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

-- ════════════════════════════════════════════════════════════
-- PERMISOS A NIVEL DE TABLA (GRANT)
-- Sin estos GRANTs, RLS no es suficiente: los roles no pueden
-- acceder a la tabla aunque las políticas lo permitan.
-- ════════════════════════════════════════════════════════════
GRANT ALL ON public.daily_cards TO authenticated;
GRANT ALL ON public.daily_cards TO anon;
GRANT ALL ON public.daily_cards TO service_role;

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

-- ════════════════════════════════════════════════════════════
-- VERIFICACIÓN: Comprueba que la tabla y permisos estén correctos
-- ════════════════════════════════════════════════════════════

-- Insertar un registro de prueba para verificar que INSERT funciona
INSERT INTO public.daily_cards (day, image_url, character)
VALUES (999, 'test_image_url', 'Test')
ON CONFLICT (day) DO UPDATE SET image_url = 'test_image_url', updated_at = NOW();

-- Verificar que el SELECT funciona
SELECT * FROM public.daily_cards WHERE day = 999;

-- Limpiar el registro de prueba
DELETE FROM public.daily_cards WHERE day = 999;
