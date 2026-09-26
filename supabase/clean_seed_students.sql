-- ==============================================================
-- LIMPIAR ESTUDIANTES DEMO / SEMILLA DEL PANEL DE INSTRUCTOR
-- Ejecuta este script en el SQL Editor de tu Supabase Dashboard
-- para eliminar permanentemente los alumnos de prueba iniciales
-- (Lucas Romero, Valentina Silva, Mateo Gómez, Sofía Morales, Benjamín Castro).
-- ==============================================================

-- 1. Eliminar insignias asignadas a usuarios demo
DELETE FROM public.student_unlocked_badges
WHERE student_id LIKE '11111111-0000-0000-0000-%';

-- 2. Eliminar notas de reflexión de usuarios demo
DELETE FROM public.student_notes
WHERE student_id LIKE '11111111-0000-0000-0000-%';

-- 3. Eliminar días marcados por usuarios demo
DELETE FROM public.student_completed_days
WHERE student_id LIKE '11111111-0000-0000-0000-%';

-- 4. Eliminar los perfiles de los usuarios demo de la tabla students
DELETE FROM public.students
WHERE id LIKE '11111111-0000-0000-0000-%'
   OR email LIKE '%@seminario.org';

-- 5. Verificar que solo queden tus usuarios reales
SELECT id, email, first_name, last_name, role, current_streak, created_at
FROM public.students_full
ORDER BY created_at DESC;
