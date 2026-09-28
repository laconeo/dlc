-- ============================================================
-- FUNCIÓN RPC Y POLÍTICAS PARA ELIMINAR ESTUDIANTES / USUARIOS
-- Ejecutar en Supabase -> SQL Editor -> Run
-- ============================================================

-- 1. Función RPC con privilegios elevados (SECURITY DEFINER)
--    Elimina el estudiante de public.students, sus datos relacionados (días, notas, insignias)
--    y también su cuenta en auth.users para no dejar usuarios huérfanos.
CREATE OR REPLACE FUNCTION public.delete_student(p_student_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_is_instructor BOOLEAN;
  v_target_email TEXT;
BEGIN
  -- A. Verificar si el usuario que ejecuta la acción es Instructor o Superadmin
  SELECT (
    coalesce(auth.jwt()->>'email', '') = 'laconeo@gmail.com'
    OR EXISTS (SELECT 1 FROM public.instructors WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.students WHERE id = auth.uid() AND role = 'instructor')
  ) INTO v_caller_is_instructor;

  IF NOT coalesce(v_caller_is_instructor, false) THEN
    RAISE EXCEPTION 'No tienes permisos de instructor para eliminar usuarios.';
  END IF;

  -- B. Proteger la cuenta del Superadministrador
  SELECT email INTO v_target_email FROM public.students WHERE id = p_student_id;
  
  IF lower(coalesce(v_target_email, '')) = 'laconeo@gmail.com' THEN
    RAISE EXCEPTION 'No se puede eliminar la cuenta principal de Superadministrador (laconeo@gmail.com).';
  END IF;

  -- C. Eliminar datos asociados explícitamente (por seguridad además del CASCADE)
  DELETE FROM public.student_completed_days WHERE student_id = p_student_id;
  DELETE FROM public.student_notes WHERE student_id = p_student_id;
  DELETE FROM public.student_unlocked_badges WHERE student_id = p_student_id;
  DELETE FROM public.instructors WHERE user_id = p_student_id;

  -- D. Eliminar de public.students
  DELETE FROM public.students WHERE id = p_student_id;

  -- E. Eliminar de auth.users si existe (libera el correo para volver a usarse si se desea)
  BEGIN
    DELETE FROM auth.users WHERE id = p_student_id;
  EXCEPTION WHEN OTHERS THEN
    -- Si auth.users tiene restricciones de FK adicionales, no abortar la eliminación en students
    RAISE NOTICE 'No se pudo eliminar de auth.users: %', SQLERRM;
  END;

  RETURN jsonb_build_object('success', true, 'deleted_id', p_student_id);
END;
$$;

-- Otorgar permisos de ejecución a authenticated y anon
GRANT EXECUTE ON FUNCTION public.delete_student(UUID) TO authenticated, anon;

-- 2. Política RLS directa de respaldo para DELETE en public.students
DROP POLICY IF EXISTS "students: instructor delete" ON public.students;
DROP POLICY IF EXISTS "students: delete" ON public.students;

CREATE POLICY "students: delete"
  ON public.students FOR DELETE
  TO authenticated, anon
  USING (
    exists (select 1 from public.instructors where instructors.user_id = auth.uid())
    or exists (select 1 from public.students where students.id = auth.uid() and students.role = 'instructor')
    or auth.jwt()->>'email' = 'laconeo@gmail.com'
  );

-- ============================================================
-- OPCIONAL: Si deseas limpiar múltiples cuentas de prueba de una vez por SQL,
-- puedes descomentar y ajustar la siguiente consulta:
--
-- SELECT public.delete_student(id)
-- FROM public.students
-- WHERE (lower(email) LIKE '%test%'
--    OR lower(email) LIKE '%prueba%'
--    OR email LIKE '%@seminario.org')
--    AND lower(email) != 'laconeo@gmail.com';
-- ============================================================
