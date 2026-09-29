-- ============================================================
-- ACTUALIZAR O REPARAR RACHA DE UN ALUMNO POR EMAIL
-- Ejecutar en Supabase: Dashboard → SQL Editor → New query
-- ============================================================

-- ------------------------------------------------------------
-- PASO 1: DIAGNÓSTICO (Reemplaza con el email de la alumna)
-- ------------------------------------------------------------
SELECT 
  s.id,
  s.email,
  s.name,
  s.current_streak,
  s.highest_streak,
  s.last_completed_date,
  COALESCE(
    (SELECT array_agg(scd.day ORDER BY scd.day) 
     FROM public.student_completed_days scd 
     WHERE scd.student_id = s.id), 
    '{}'
  ) AS dias_completados
FROM public.students s
WHERE s.email = 'correo_de_la_alumna@ejemplo.com';


-- ------------------------------------------------------------
-- PASO 2 (OPCIÓN RÁPIDA): FORZAR EL NÚMERO DE RACHA DIRECTAMENTE
-- Si sabes cuántos días de racha le corresponden (ej. 3, 5, etc.):
-- ------------------------------------------------------------
UPDATE public.students
SET 
  current_streak = 3,  -- <-- CAMBIA ESTE NÚMERO POR LA RACHA REAL
  highest_streak = GREATEST(COALESCE(highest_streak, 0), 3),
  last_completed_date = COALESCE(last_completed_date, CURRENT_DATE::text),
  updated_at = NOW()
WHERE email = 'correo_de_la_alumna@ejemplo.com';  -- <-- CAMBIA EL EMAIL


-- ------------------------------------------------------------
-- PASO 3 (OPCIONAL): SI TIENE DÍAS LEÍDOS PERO NO SE RECALCULÓ
-- Ejecuta esto para que la base de datos recalcule la racha 
-- y sus cartas desbloqueadas a partir de sus días registrados:
-- ------------------------------------------------------------
DO $$
DECLARE
  v_student_id uuid;
BEGIN
  SELECT id INTO v_student_id 
  FROM public.students 
  WHERE email = 'correo_de_la_alumna@ejemplo.com';

  IF v_student_id IS NOT NULL THEN
    PERFORM public.recalculate_student_stats(v_student_id);
    RAISE NOTICE 'Estadísticas y racha recalculadas exitosamente para: %', v_student_id;
  ELSE
    RAISE NOTICE 'No se encontró ningún estudiante con ese email.';
  END IF;
END;
$$;


-- ------------------------------------------------------------
-- PASO 4 (OPCIONAL): REGISTRARLE DÍAS ESPECÍFICOS SI NO LOS TENÍA
-- Si por ejemplo leyó los días 1, 2 y 3 pero no estaban guardados:
-- ------------------------------------------------------------
/*
INSERT INTO public.student_completed_days (student_id, day, completed_at)
SELECT id, unnest(ARRAY[1, 2, 3]), NOW()
FROM public.students
WHERE email = 'correo_de_la_alumna@ejemplo.com'
ON CONFLICT (student_id, day) DO NOTHING;

-- Y luego recalculas:
SELECT public.recalculate_student_stats(id)
FROM public.students
WHERE email = 'correo_de_la_alumna@ejemplo.com';
*/
