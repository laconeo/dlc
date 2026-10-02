-- ============================================================
-- FUNCIÓN RPC Y POLÍTICAS PARA QUE EL MAESTRO MARQUE DÍAS LEÍDOS
-- Ejecutar en Supabase -> SQL Editor -> Run
-- ============================================================

-- 1. Función RPC con privilegios elevados (SECURITY DEFINER)
-- Permite a un maestro marcar o desmarcar la lectura de un alumno
-- (ejemplo: si el alumno leyó en clase o en papel sin celular).
CREATE OR REPLACE FUNCTION public.instructor_toggle_student_day(
  p_student_id UUID,
  p_day SMALLINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_is_instructor BOOLEAN;
  v_already_completed BOOLEAN;
BEGIN
  -- A. Verificar si el usuario que ejecuta la acción es Instructor o Superadmin
  SELECT (
    coalesce(auth.jwt()->>'email', '') = 'laconeo@gmail.com'
    OR EXISTS (SELECT 1 FROM public.instructors WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.students WHERE id = auth.uid() AND role = 'instructor')
  ) INTO v_caller_is_instructor;

  IF NOT coalesce(v_caller_is_instructor, false) THEN
    RAISE EXCEPTION 'No tienes permisos de maestro para registrar lecturas de alumnos.';
  END IF;

  -- B. Verificar si el día ya estaba completado
  SELECT EXISTS (
    SELECT 1 FROM public.student_completed_days
    WHERE student_id = p_student_id AND day = p_day
  ) INTO v_already_completed;

  IF v_already_completed THEN
    -- Desmarcar
    DELETE FROM public.student_completed_days
    WHERE student_id = p_student_id AND day = p_day;
  ELSE
    -- Marcar
    INSERT INTO public.student_completed_days (student_id, day)
    VALUES (p_student_id, p_day)
    ON CONFLICT DO NOTHING;

    -- Actualizar last_completed_date
    UPDATE public.students
    SET last_completed_date = CURRENT_DATE::text,
        updated_at = now()
    WHERE id = p_student_id;
  END IF;

  -- C. Recalcular racha y estadísticas del estudiante
  PERFORM public.recalculate_student_stats(p_student_id);

  RETURN jsonb_build_object(
    'success', true,
    'student_id', p_student_id,
    'day', p_day,
    'completed', NOT v_already_completed
  );
END;
$$;

-- Permisos de ejecución para la función
GRANT EXECUTE ON FUNCTION public.instructor_toggle_student_day(UUID, SMALLINT) TO authenticated, anon;

-- 2. Políticas RLS adicionales en student_completed_days para que los maestros
-- también puedan hacer insert y delete directamente si no usan el RPC.
DROP POLICY IF EXISTS "completed_days: instructor insert" ON public.student_completed_days;
CREATE POLICY "completed_days: instructor insert"
  ON public.student_completed_days FOR INSERT
  WITH CHECK (
    auth.uid() = student_id
    OR EXISTS (SELECT 1 FROM public.instructors WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.students WHERE id = auth.uid() AND role = 'instructor')
  );

DROP POLICY IF EXISTS "completed_days: instructor delete" ON public.student_completed_days;
CREATE POLICY "completed_days: instructor delete"
  ON public.student_completed_days FOR DELETE
  USING (
    auth.uid() = student_id
    OR EXISTS (SELECT 1 FROM public.instructors WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.students WHERE id = auth.uid() AND role = 'instructor')
  );
