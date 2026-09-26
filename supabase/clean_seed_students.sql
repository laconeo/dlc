-- ==============================================================
-- LIMPIAR ESTUDIANTES DEMO / SEMILLA DEL PANEL DE INSTRUCTOR
-- Ejecuta este script en el SQL Editor de Supabase
-- ==============================================================

-- 1. Eliminar insignias de usuarios demo (usando casteo ::text o subconsulta segura)
DELETE FROM public.student_unlocked_badges
WHERE student_id IN (
  SELECT id FROM public.students
  WHERE email LIKE '%@seminario.org' OR id::text LIKE '11111111%'
);

-- 2. Eliminar notas de reflexión de usuarios demo
DELETE FROM public.student_notes
WHERE student_id IN (
  SELECT id FROM public.students
  WHERE email LIKE '%@seminario.org' OR id::text LIKE '11111111%'
);

-- 3. Eliminar días completados de usuarios demo
DELETE FROM public.student_completed_days
WHERE student_id IN (
  SELECT id FROM public.students
  WHERE email LIKE '%@seminario.org' OR id::text LIKE '11111111%'
);

-- 4. Eliminar los registros de la tabla students
DELETE FROM public.students
WHERE email LIKE '%@seminario.org'
   OR id::text LIKE '11111111%';

-- 5. Comprobar que solo queden tus estudiantes reales
SELECT id, email, first_name, last_name, role, current_streak, created_at
FROM public.students_full
ORDER BY created_at DESC;
