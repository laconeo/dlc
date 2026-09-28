-- ============================================================
-- DIAGNÓSTICO: julyetamilagroszarate@gmail.com
-- Ejecutar en Supabase SQL Editor para entender por qué
-- tiene last_completed_date pero current_streak = 0
-- ============================================================

-- 1. Ver el perfil completo de la alumna
SELECT
  s.id,
  s.email,
  s.first_name,
  s.last_name,
  s.current_streak,
  s.highest_streak,
  s.last_completed_date,
  s.created_at,
  s.updated_at
FROM public.students s
WHERE s.email = 'julyetamilagroszarate@gmail.com';

-- 2. Ver sus días completados
SELECT day, completed_at
FROM public.student_completed_days
WHERE student_id = (
  SELECT id FROM public.students WHERE email = 'julyetamilagroszarate@gmail.com'
)
ORDER BY day;

-- 3. Ver sus notas/reflexiones
SELECT day, note, updated_at
FROM public.student_notes
WHERE student_id = (
  SELECT id FROM public.students WHERE email = 'julyetamilagroszarate@gmail.com'
)
ORDER BY day;

-- 4. Ver desde students_full (la vista que usa la app)
SELECT
  id, email, first_name, last_name,
  current_streak, highest_streak,
  last_completed_date,
  completed_days,
  notes,
  unlocked_badge_ids
FROM public.students_full
WHERE email = 'julyetamilagroszarate@gmail.com';

-- 5. REPARAR: Recalcular racha para esta alumna específicamente
DO $$
DECLARE v_id uuid;
BEGIN
  SELECT id INTO v_id FROM public.students WHERE email = 'julyetamilagroszarate@gmail.com';
  IF v_id IS NOT NULL THEN
    PERFORM public.recalculate_student_stats(v_id);
    RAISE NOTICE 'Racha recalculada para student_id: %', v_id;
  ELSE
    RAISE NOTICE 'Alumna no encontrada en public.students';
  END IF;
END;
$$;

-- 6. Verificar resultado después del recálculo
SELECT
  email,
  first_name || ' ' || last_name AS nombre,
  current_streak,
  highest_streak,
  last_completed_date,
  (SELECT array_agg(day ORDER BY day)
   FROM public.student_completed_days
   WHERE student_id = s.id) AS dias_completados
FROM public.students s
WHERE email = 'julyetamilagroszarate@gmail.com';
