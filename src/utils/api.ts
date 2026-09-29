/**
 * api.ts – DLC (Detente, Lee, Conecta)
 *
 * Todas las operaciones de datos ahora usan Supabase directamente.
 * El servidor Express (api-router.ts) ya no es necesario para estas llamadas.
 *
 * Lógica de fallback local conservada para modo offline.
 */

import { supabase } from './supabase';
import { Student, InstructorStats, UserRole, SUPERADMIN_EMAIL, isUserInstructor, isUserSuperAdmin } from '../types';

// ── Tipos auxiliares ──────────────────────────────────────────────────────────

export interface RegisterParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  ward?: string;
  seminaryClass?: string;
}

// ── LocalStorage helpers ──────────────────────────────────────────────────────

const LOCAL_STORAGE_KEY = 'detente_lee_conecta_current_student';
const LOCAL_INSTRUCTOR_STUDENTS_KEY = 'detente_lee_conecta_instructor_students';
const LOCAL_SUPERUSERS_KEY = 'detente_lee_conecta_superusers';

export function getLocalSuperuserEmails(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_SUPERUSERS_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const normalized = list.map((e) => e.toLowerCase().trim());
    if (!normalized.includes(SUPERADMIN_EMAIL)) {
      normalized.push(SUPERADMIN_EMAIL);
    }
    return normalized;
  } catch {
    return [SUPERADMIN_EMAIL];
  }
}

export function getLocalStudent(): Student | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalStudent(student: Student): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(student));
  } catch (err) {
    console.error('Failed to save student locally', err);
  }
}

export function clearLocalStudent(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear student locally', err);
  }
}

// ── Row mapper ────────────────────────────────────────────────────────────────

/**
 * Convierte una fila de `students_full` (vista Supabase) al tipo Student de TS.
 */
function rowToStudent(row: any, superuserEmails: string[] = []): Student {
  const cleanEmail = (row.email ?? '').toLowerCase().trim();
  const superList = superuserEmails.length > 0 ? superuserEmails : getLocalSuperuserEmails();
  const isSuper = cleanEmail === SUPERADMIN_EMAIL || superList.includes(cleanEmail) || Boolean(row.is_superuser);
  const role: UserRole = isSuper ? 'instructor' : (row.role === 'instructor' ? 'instructor' : 'alumno');

  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    name: row.name ?? `${row.first_name} ${row.last_name}`,
    role,
    isSuperuser: isSuper,
    ward: row.ward ?? '',
    seminaryClass: row.seminary_class ?? 'Seminario - Antiguo Testamento',
    avatarSeed: row.avatar_seed ?? row.first_name,
    completedDays: (row.completed_days ?? []).map(Number),
    currentStreak: row.current_streak ?? 0,
    highestStreak: row.highest_streak ?? 0,
    unlockedBadgeIds: row.unlocked_badge_ids ?? [],
    lastCompletedDate: row.last_completed_date ?? undefined,
    notes: row.notes ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── REGISTER ─────────────────────────────────────────────────────────────────

export async function registerStudent(params: RegisterParams): Promise<Student> {
  const { email, password, firstName, lastName, ward, seminaryClass } = params;
  const cleanEmail = email.trim().toLowerCase();
  const cleanFirst = firstName.trim();
  const cleanLast = lastName.trim();
  const role: UserRole = cleanEmail === SUPERADMIN_EMAIL ? 'instructor' : 'alumno';

  try {
    // 1. Crear usuario en Supabase Auth pasando metadata para triggers
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password.trim(),
      options: {
        data: {
          first_name: cleanFirst,
          last_name: cleanLast,
          name: `${cleanFirst} ${cleanLast}`,
          role,
          ward: ward?.trim() ?? '',
          seminary_class: seminaryClass?.trim() ?? 'Seminario - Antiguo Testamento',
        },
      },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered')) {
        throw new Error('Este correo ya está registrado. Por favor ve a la pestaña "Iniciar Sesión".');
      }
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario en Supabase.');
    }

    const userId = authData.user.id;

    // 2. Insertar / Actualizar perfil en public.students (upsert resiliente)
    const { data: insertedData, error: insertError } = await supabase
      .from('students')
      .upsert(
        {
          id: userId,
          email: cleanEmail,
          first_name: cleanFirst,
          last_name: cleanLast,
          role,
          ward: ward?.trim() ?? '',
          seminary_class: seminaryClass?.trim() ?? 'Seminario - Antiguo Testamento',
          avatar_seed: cleanFirst,
        },
        { onConflict: 'id' }
      )
      .select()
      .maybeSingle();

    if (insertError) {
      console.warn('Advertencia al insertar perfil en students (puede haberlo creado el trigger):', insertError.message);
    }

    // Si es superadmin o instructor, asegurar que esté en la tabla instructors
    if (role === 'instructor') {
      try {
        await supabase.from('instructors').upsert({ user_id: userId }, { onConflict: 'user_id' });
      } catch {}
    }

    // 2b. Auto-login inmediato para garantizar sesión activa en Supabase
    if (!authData.session) {
      try {
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password.trim(),
        });
      } catch (loginErr) {
        console.warn('Auto-login post-registro notice:', loginErr);
      }
    }

    // 3. Cargar perfil desde students_full o construirlo
    let student: Student;
    try {
      const { data: fullData } = await supabase
        .from('students_full')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fullData) {
        student = rowToStudent(fullData);
        student.password = password.trim();
      } else {
        student = rowToStudent({
          ...(insertedData || {}),
          id: userId,
          email: cleanEmail,
          first_name: cleanFirst,
          last_name: cleanLast,
          role,
          ward: ward?.trim() ?? '',
          seminary_class: seminaryClass?.trim() ?? 'Seminario - Antiguo Testamento',
          completed_days: [],
          notes: {},
          unlocked_badge_ids: [],
        });
        student.password = password.trim();
      }
    } catch {
      student = rowToStudent({
        ...(insertedData || {}),
        id: userId,
        email: cleanEmail,
        first_name: cleanFirst,
        last_name: cleanLast,
        role,
        ward: ward?.trim() ?? '',
        seminary_class: seminaryClass?.trim() ?? 'Seminario - Antiguo Testamento',
        completed_days: [],
        notes: {},
        unlocked_badge_ids: [],
      });
      student.password = password.trim();
    }

    saveLocalStudent(student);
    return student;

  } catch (err: any) {
    // Si es error de negocio (credenciales, ya existe, etc.) lo lanzamos directamente a la UI
    if (
      err.message?.includes('ya está registrado') ||
      err.message?.includes('contraseña') ||
      err.message?.includes('Password') ||
      err.message?.includes('valid')
    ) {
      throw err;
    }

    console.warn('Supabase register error, falling back to local:', err);

    // Fallback local
    const localStudent: Student = {
      id: 'stud-local-' + Date.now(),
      email: cleanEmail,
      password: password.trim(),
      firstName: cleanFirst,
      lastName: cleanLast,
      name: `${cleanFirst} ${cleanLast}`,
      role,
      ward: ward?.trim() ?? '',
      seminaryClass: seminaryClass?.trim() ?? 'Seminario - Antiguo Testamento',
      avatarSeed: cleanFirst,
      completedDays: [],
      currentStreak: 0,
      highestStreak: 0,
      unlockedBadgeIds: [],
      notes: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveLocalStudent(localStudent);
    return localStudent;
  }
}

// ── SESSION ───────────────────────────────────────────────────────────────────

export async function getCurrentSessionStudent(): Promise<Student | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data, error } = await supabase
        .from('students_full')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (data && !error) {
        const student = rowToStudent(data);
        saveLocalStudent(student);
        return student;
      }
    }
  } catch (err) {
    console.warn('Could not get session from Supabase:', err);
  }
  return null;
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────

export async function loginStudent(email: string, password?: string): Promise<Student> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    if (!password) throw new Error('Por favor ingresa tu contraseña.');

    // 1. Auth con Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password.trim(),
    });

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes('email not confirmed')) {
        throw new Error('Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada o desmarca "Confirm email" en el panel de Supabase.');
      }
      if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
        throw new Error('Correo o contraseña incorrectos. Si aún no te has registrado en Supabase, haz clic en "Crear Cuenta".');
      }
      throw new Error(authError.message);
    }

    if (!authData.user) throw new Error('No se pudo iniciar sesión.');

    const userId = authData.user.id;

    // 2. Cargar perfil completo desde la vista students_full
    const { data, error } = await supabase
      .from('students_full')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data && !error) {
      const student = rowToStudent(data);
      saveLocalStudent(student);
      return student;
    }

    // 3. Auto-reparación: si el usuario existe en auth pero aún no tiene fila en students
    const meta = authData.user.user_metadata || {};
    const firstName = meta.first_name || cleanEmail.split('@')[0];
    const lastName = meta.last_name || 'Seminario';
    const role: UserRole = cleanEmail === SUPERADMIN_EMAIL ? 'instructor' : (meta.role || 'alumno');

    const { data: newRow } = await supabase
      .from('students')
      .upsert(
        {
          id: userId,
          email: cleanEmail,
          first_name: firstName,
          last_name: lastName,
          role,
          ward: meta.ward || '',
          seminary_class: meta.seminary_class || 'Seminario - Antiguo Testamento',
          avatar_seed: firstName,
        },
        { onConflict: 'id' }
      )
      .select()
      .maybeSingle();

    if (role === 'instructor') {
      try {
        await supabase.from('instructors').upsert({ user_id: userId }, { onConflict: 'user_id' });
      } catch {}
    }

    const fallbackStudent = rowToStudent({
      ...(newRow || {}),
      id: userId,
      email: cleanEmail,
      first_name: firstName,
      last_name: lastName,
      role,
      completed_days: [],
      notes: {},
      unlocked_badge_ids: [],
    });

    saveLocalStudent(fallbackStudent);
    return fallbackStudent;

  } catch (err: any) {
    // Re-lanzar errores de negocio (no de red)
    if (!err.message?.includes('fetch') && !err.message?.includes('network')) {
      throw err;
    }

    // Fallback offline
    console.warn('Supabase login failed (offline), trying local:', err);
    const local = getLocalStudent();
    if (local && local.email.toLowerCase() === cleanEmail) {
      if (local.password && password && local.password !== password.trim()) {
        throw new Error('Contraseña incorrecta.');
      }
      return local;
    }

    throw new Error('No se encontró el alumno o no hay conexión con el servidor.');
  }
}

// ── RECUPERACIÓN DE CONTRASEÑA ────────────────────────────────────────────────

export async function requestPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('Por favor ingresa tu correo electrónico.');
  }

  // URL base actual sin hashes ni parámetros
  const redirectUrl = `${window.location.origin}${window.location.pathname}`;

  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: redirectUrl,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('rate limit') || msg.includes('too many requests')) {
      throw new Error('Has solicitado demasiados correos en poco tiempo. Espera un momento antes de volver a intentar.');
    }
    throw new Error(error.message || 'No se pudo enviar el correo de recuperación.');
  }
}

export async function updateUserPassword(newPassword: string): Promise<Student> {
  const cleanPass = newPassword.trim();
  if (cleanPass.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
  }

  const { data: authData, error: authError } = await supabase.auth.updateUser({
    password: cleanPass,
  });

  if (authError) {
    throw new Error(authError.message || 'No se pudo actualizar la contraseña.');
  }

  if (!authData.user) {
    throw new Error('No se encontró una sesión activa para restablecer la contraseña.');
  }

  const userId = authData.user.id;

  // Cargar perfil actualizado
  const { data, error } = await supabase
    .from('students_full')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  let student: Student;
  if (data && !error) {
    student = rowToStudent(data);
  } else {
    const meta = authData.user.user_metadata || {};
    const cleanEmail = (authData.user.email || '').toLowerCase().trim();
    student = {
      id: userId,
      name: meta.first_name ? `${meta.first_name} ${meta.last_name || ''}`.trim() : cleanEmail.split('@')[0],
      firstName: meta.first_name || '',
      lastName: meta.last_name || '',
      email: cleanEmail,
      ward: meta.ward || '',
      seminaryClass: meta.seminary_class || '',
      streak: 0,
      completedDays: 0,
      totalReadings: 0,
      readings: [],
      lastCompletedDate: null,
      earnedBadges: [],
    };
  }

  student.password = cleanPass;
  saveLocalStudent(student);
  return student;
}

// ── TOGGLE DAY ────────────────────────────────────────────────────────────────

export async function toggleStudentDay(studentId: string, day: number, note?: string): Promise<Student> {
  try {
    // 1. ¿Existe ya el día completado?
    const { data: existing } = await supabase
      .from('student_completed_days')
      .select('id')
      .eq('student_id', studentId)
      .eq('day', day)
      .maybeSingle();

    if (existing) {
      // Desmarcar
      await supabase
        .from('student_completed_days')
        .delete()
        .eq('student_id', studentId)
        .eq('day', day);
    } else {
      // Marcar
      await supabase
        .from('student_completed_days')
        .insert({ student_id: studentId, day });

      // Actualizar last_completed_date
      await supabase
        .from('students')
        .update({ last_completed_date: new Date().toISOString().split('T')[0] })
        .eq('id', studentId);
    }

    // 2. Guardar nota si viene
    if (note !== undefined && note !== '') {
      await supabase
        .from('student_notes')
        .upsert({ student_id: studentId, day, note }, { onConflict: 'student_id,day' });
    }

    // 3. Recalcular estadísticas y badges via función SQL
    const { error: rpcError } = await supabase.rpc('recalculate_student_stats', { p_student_id: studentId });

    // Si el RPC falla, calcular racha localmente y actualizar directamente en students
    if (rpcError) {
      console.warn('RPC recalculate_student_stats failed, computing locally:', rpcError.message);
      // Leer días completados actuales
      const { data: daysRows } = await supabase
        .from('student_completed_days')
        .select('day')
        .eq('student_id', studentId)
        .order('day');
      const completedDays = (daysRows || []).map((r: any) => Number(r.day)).sort((a, b) => a - b);
      let streak = 0;
      for (let d = 1; d <= 31; d++) {
        if (completedDays.includes(d)) streak++;
        else break;
      }
      await supabase
        .from('students')
        .update({ current_streak: streak, highest_streak: streak, updated_at: new Date().toISOString() })
        .eq('id', studentId);
    }

    // 4. Leer el perfil actualizado
    const { data, error } = await supabase
      .from('students_full')
      .select('*')
      .eq('id', studentId)
      .single();

    if (error || !data) throw new Error('Error al recargar el perfil.');

    const student = rowToStudent(data);
    saveLocalStudent(student);
    return student;

  } catch (err) {
    console.warn('Supabase toggleDay failed, using local fallback:', err);

    // Fallback local (mismo algoritmo que antes)
    const local = getLocalStudent();
    if (local && local.id === studentId) {
      const idx = local.completedDays.indexOf(day);
      if (idx > -1) {
        local.completedDays.splice(idx, 1);
      } else {
        local.completedDays.push(day);
        local.lastCompletedDate = new Date().toISOString().split('T')[0];
      }
      local.completedDays.sort((a, b) => a - b);

      // Racha
      let streak = 0;
      for (let d = 1; d <= 31; d++) {
        if (local.completedDays.includes(d)) streak++;
        else break;
      }
      local.currentStreak = streak;
      if (streak > local.highestStreak) local.highestStreak = streak;

      // Badges
      const badges: string[] = [];
      if ([1,2,3,4,5,6,7].every(d => local.completedDays.includes(d))) badges.push('badge-abraham');
      if (Array.from({ length: 14 }, (_, i) => i + 1).every(d => local.completedDays.includes(d))) badges.push('badge-isaac');
      if (Array.from({ length: 21 }, (_, i) => i + 1).every(d => local.completedDays.includes(d))) badges.push('badge-jacob');
      if (Array.from({ length: 30 }, (_, i) => i + 1).every(d => local.completedDays.includes(d)) || local.completedDays.includes(31)) badges.push('badge-jesucristo');
      local.unlockedBadgeIds = badges;

      if (note) {
        if (!local.notes) local.notes = {};
        local.notes[day] = note;
      }
      local.updatedAt = new Date().toISOString();
      saveLocalStudent(local);
      return local;
    }
    throw err;
  }
}

// ── SAVE NOTE ONLY ────────────────────────────────────────────────────────────

export async function saveStudentNote(studentId: string, day: number, note: string): Promise<Student> {
  try {
    // Usar el ID del usuario autenticado para respetar RLS (auth.uid() = student_id)
    const { data: { user } } = await supabase.auth.getUser();
    const uid = user?.id ?? studentId;

    // Intentar upsert; si falla por constraint faltante, hacer insert o update por separado
    const { error: upsertError } = await supabase
      .from('student_notes')
      .upsert({ student_id: uid, day, note: note.trim() }, { onConflict: 'student_id,day' });

    if (upsertError) {
      // Fallback: intentar insert; si ya existe, hacer update
      const { error: insertError } = await supabase
        .from('student_notes')
        .insert({ student_id: uid, day, note: note.trim() });

      if (insertError) {
        // Ya existe — hacer update directo
        const { error: updateError } = await supabase
          .from('student_notes')
          .update({ note: note.trim() })
          .eq('student_id', uid)
          .eq('day', day);

        if (updateError) throw new Error(updateError.message);
      }
    }

    const { data, error } = await supabase
      .from('students_full')
      .select('*')
      .eq('id', uid)
      .single();

    if (!error && data) {
      const student = rowToStudent(data);
      saveLocalStudent(student);
      return student;
    }
  } catch (err) {
    console.warn('saveStudentNote Supabase fallback:', err);
  }

  // Fallback local: al menos guardar en localStorage para esta sesión
  const local = getLocalStudent();
  if (local && (local.id === studentId)) {
    if (!local.notes) local.notes = {};
    local.notes[day] = note.trim();
    saveLocalStudent(local);
    return local;
  }
  throw new Error('No se pudo guardar la nota.');
}

// ── UPDATE STUDENT PROFILE ───────────────────────────────────────────────────

export interface UpdateProfileParams {
  firstName?: string;
  lastName?: string;
  ward?: string;
  seminaryClass?: string;
}

export async function updateStudentProfile(
  studentId: string,
  params: UpdateProfileParams
): Promise<Student> {
  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData?.user?.id;
  const targetId = studentId || currentUserId;

  const payload: any = {
    updated_at: new Date().toISOString(),
  };
  if (params.firstName !== undefined) payload.first_name = params.firstName.trim();
  if (params.lastName !== undefined) payload.last_name = params.lastName.trim();
  if (params.ward !== undefined) payload.ward = params.ward.trim();
  if (params.seminaryClass !== undefined) payload.seminary_class = params.seminaryClass.trim();

  // 1. Sincronizar metadatos en Supabase Auth solo si es la propia cuenta
  if (authData?.user && targetId === currentUserId) {
    try {
      await supabase.auth.updateUser({
        data: {
          first_name: payload.first_name,
          last_name: payload.last_name,
          name: payload.first_name && payload.last_name ? `${payload.first_name} ${payload.last_name}` : undefined,
          ward: payload.ward,
          seminary_class: payload.seminary_class,
        },
      });
    } catch (authErr) {
      console.warn('Could not update Supabase Auth user metadata:', authErr);
    }
  }

  // 2. Actualizar en la tabla public.students
  try {
    const { data: updatedRows, error: updateError } = await supabase
      .from('students')
      .update(payload)
      .eq('id', targetId)
      .select();

    if (updateError) {
      console.warn('Update en public.students falló, intentando upsert:', updateError);
      // Si la fila no existía o falló update, intentar upsert con los campos requeridos
      const { error: upsertErr } = await supabase
        .from('students')
        .upsert({
          id: targetId,
          email: authData?.user?.email || undefined,
          avatar_seed: payload.first_name || 'student',
          ...payload,
        }, { onConflict: 'id' });

      if (upsertErr) {
        throw new Error(updateError.message || upsertErr.message);
      }
    } else if (!updatedRows || updatedRows.length === 0) {
      // Si update afectó 0 filas (por RLS o porque aún no existía en students)
      const { error: upsertErr } = await supabase
        .from('students')
        .upsert({
          id: targetId,
          email: authData?.user?.email || undefined,
          avatar_seed: payload.first_name || 'student',
          ...payload,
        }, { onConflict: 'id' });

      if (upsertErr) {
        throw new Error(upsertErr.message);
      }
    }

    // 3. Obtener datos actualizados desde students_full
    const { data: fullRow } = await supabase
      .from('students_full')
      .select('*')
      .eq('id', targetId)
      .maybeSingle();

    if (fullRow) {
      const updatedStudent = rowToStudent(fullRow);
      if (targetId === currentUserId) {
        saveLocalStudent(updatedStudent);
      }
      return updatedStudent;
    }
  } catch (err: any) {
    console.error('Error al guardar en Supabase:', err);
    // Si hay error en la base de datos, lanzamos el error para que la UI lo informe claramente
    throw new Error(err.message || 'No se pudo guardar la información en Supabase.');
  }

  // Fallback local sincronizado
  const local = getLocalStudent();
  if (local) {
    if (params.firstName !== undefined) local.firstName = params.firstName.trim();
    if (params.lastName !== undefined) local.lastName = params.lastName.trim();
    if (local.firstName || local.lastName) {
      local.name = `${local.firstName || ''} ${local.lastName || ''}`.trim();
    }
    if (params.ward !== undefined) local.ward = params.ward.trim();
    if (params.seminaryClass !== undefined) local.seminaryClass = params.seminaryClass.trim();
    saveLocalStudent(local);
    return local;
  }

  throw new Error('No se pudo guardar la información del perfil.');
}

// ── INSTRUCTOR DATA ───────────────────────────────────────────────────────────

export async function fetchInstructorData(): Promise<{ students: Student[]; stats: InstructorStats }> {
  try {
    // 1. Leer todos los alumnos reales (requiere que el usuario sea instructor en RLS)
    const { data: rows, error } = await supabase
      .from('students_full')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // 2. Obtener lista de superusuarios registrados (Supabase + localStorage)
    let superuserEmails = getLocalSuperuserEmails();
    try {
      const { data: superRows } = await supabase.from('superusers').select('email, user_id');
      if (superRows && superRows.length > 0) {
        const fromDb = superRows.map((r: any) => (r.email || '').toLowerCase().trim()).filter(Boolean);
        superuserEmails = Array.from(new Set([...superuserEmails, ...fromDb]));
        try {
          localStorage.setItem(LOCAL_SUPERUSERS_KEY, JSON.stringify(superuserEmails));
        } catch {}
      }
    } catch {
      // Fallback local silencioso si la tabla aún no existe en Supabase
    }

    // 3. Filtrar estrictamente solo estudiantes reales (descartar IDs o correos de prueba)
    const rawStudents = (rows ?? []).map((r) => rowToStudent(r, superuserEmails));
    const students = rawStudents.filter((s) => {
      const email = (s.email || '').toLowerCase().trim();
      const id = (s.id || '').trim();
      const isDemo =
        email.endsWith('@seminario.org') ||
        id.startsWith('11111111-') ||
        id.startsWith('stud-');
      return !isDemo;
    });

    // Limpiar cualquier caché local obsoleta de demos
    try {
      localStorage.removeItem(LOCAL_INSTRUCTOR_STUDENTS_KEY);
    } catch {}

    // 4. Estadísticas calculadas exclusivamente con estudiantes reales
    const totalStudents = students.length;
    const totalDaysRead = students.reduce((acc, s) => acc + s.completedDays.length, 0);
    const averageStreak =
      totalStudents > 0
        ? Math.round((students.reduce((acc, s) => acc + s.currentStreak, 0) / totalStudents) * 10) / 10
        : 0;

    return {
      students,
      stats: {
        totalStudents,
        activeToday: students.filter((s) => s.completedDays.length > 0).length,
        averageStreak,
        completed30DaysCount: students.filter((s) => s.completedDays.length >= 30).length,
        totalDaysRead,
      },
    };
  } catch (err) {
    console.warn('Supabase fetchInstructorData fallback:', err);
    return fetchInstructorDataLocal();
  }
}

// ── ROLE MANAGEMENT ───────────────────────────────────────────────────────────

export async function updateStudentRole(studentId: string, newRole: UserRole): Promise<void> {
  try {
    // 1. Actualizar columna role en la tabla students
    const { error: studentErr } = await supabase
      .from('students')
      .update({ role: newRole })
      .eq('id', studentId);

    if (studentErr) {
      console.warn('No se pudo actualizar public.students.role:', studentErr.message);
    }

    // 2. Sincronizar tabla de instructores (whitelist de acceso a datos)
    if (newRole === 'instructor') {
      try {
        await supabase
          .from('instructors')
          .upsert({ user_id: studentId }, { onConflict: 'user_id' });
      } catch (insErr) {
        console.warn('No se pudo insertar en public.instructors:', insErr);
      }
    } else {
      try {
        await supabase
          .from('instructors')
          .delete()
          .eq('user_id', studentId);
      } catch (delErr) {
        console.warn('No se pudo eliminar de public.instructors:', delErr);
      }
    }
  } catch (err) {
    console.warn('Error al actualizar rol en Supabase (usando fallback local):', err);
  }

  // 3. Sincronizar caché local
  try {
    const stored = getStoredInstructorStudents();
    const idx = stored.findIndex((s) => s.id === studentId);
    if (idx !== -1) {
      stored[idx].role = newRole;
      localStorage.setItem(LOCAL_INSTRUCTOR_STUDENTS_KEY, JSON.stringify(stored));
    }
    const current = getLocalStudent();
    if (current && current.id === studentId) {
      current.role = newRole;
      saveLocalStudent(current);
    }
  } catch (err) {
    console.error('Error al actualizar rol en almacenamiento local:', err);
  }
}

// ── DELETE STUDENT ────────────────────────────────────────────────────────────

export async function deleteStudent(studentId: string): Promise<void> {
  // 1. Intentar via RPC (borra de public.students y auth.users con permisos de admin)
  const { error: rpcError } = await supabase.rpc('delete_student', { p_student_id: studentId });

  if (rpcError) {
    console.warn('delete_student RPC failed, trying direct delete:', rpcError.message);
    // 2. Fallback: borrar directamente de public.students (CASCADE elimina días, notas y badges)
    const { error: delError } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);

    if (delError) {
      throw new Error(`No se pudo eliminar el estudiante: ${delError.message}`);
    }
  }

  // 3. Limpiar de la caché local de instructores
  try {
    const stored = getStoredInstructorStudents();
    const filtered = stored.filter((s) => s.id !== studentId);
    localStorage.setItem(LOCAL_INSTRUCTOR_STUDENTS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Error al limpiar estudiante de caché local:', err);
  }
}


// ── LOGOUT ────────────────────────────────────────────────────────────────────

export async function logoutStudent(): Promise<void> {
  await supabase.auth.signOut();
  clearLocalStudent();
}

// ── LIMPIEZA DE DEMOS ─────────────────────────────────────────────────────────

export async function cleanDemoStudents(): Promise<Student[]> {
  try {
    localStorage.removeItem(LOCAL_INSTRUCTOR_STUDENTS_KEY);
  } catch {}
  const data = await fetchInstructorData();
  return data.students;
}

export async function resetSeedStudents(): Promise<Student[]> {
  return cleanDemoStudents();
}

// ── Compat (backward-compatible) ─────────────────────────────────────────────

export async function loginOrRegisterStudent(email: string, name?: string, seminaryClass?: string): Promise<Student> {
  try {
    return await loginStudent(email);
  } catch {
    const parts = (name || '').trim().split(' ');
    const firstName = parts[0] || email.split('@')[0];
    const lastName = parts.slice(1).join(' ') || 'Seminario';
    return await registerStudent({ email, password: 'password123', firstName, lastName, seminaryClass });
  }
}

// ── FALLBACK LOCAL (solo alumnos reales locales) ──────────────────────────────

function getStoredInstructorStudents(): Student[] {
  try {
    const raw = localStorage.getItem(LOCAL_INSTRUCTOR_STUDENTS_KEY);
    if (raw) {
      const parsed: Student[] = JSON.parse(raw);
      return parsed.filter((s) => {
        const email = (s.email || '').toLowerCase().trim();
        const id = (s.id || '').trim();
        return (
          !email.endsWith('@seminario.org') &&
          !id.startsWith('11111111-') &&
          !id.startsWith('stud-')
        );
      });
    }
  } catch {}
  return [];
}

function fetchInstructorDataLocal(): { students: Student[]; stats: InstructorStats } {
  const students = getStoredInstructorStudents();
  const current = getLocalStudent();
  if (current) {
    const email = (current.email || '').toLowerCase().trim();
    const id = (current.id || '').trim();
    const isDemo =
      email.endsWith('@seminario.org') ||
      id.startsWith('11111111-') ||
      id.startsWith('stud-');
    if (!isDemo && !students.some((s) => s.id === current.id)) {
      students.unshift(current);
    }
  }

  const totalStudents = students.length;
  const totalDaysRead = students.reduce((acc, s) => acc + s.completedDays.length, 0);
  const averageStreak =
    totalStudents > 0
      ? Math.round((students.reduce((acc, s) => acc + s.currentStreak, 0) / totalStudents) * 10) / 10
      : 0;

  return {
    students,
    stats: {
      totalStudents,
      activeToday: students.filter((s) => s.completedDays.length > 0).length,
      averageStreak,
      completed30DaysCount: students.filter((s) => s.completedDays.length >= 30).length,
      totalDaysRead,
    },
  };
}

// ── SUPERUSER MANAGEMENT ──────────────────────────────────────────────────────

export async function toggleStudentSuperuser(
  studentId: string,
  email: string,
  makeSuperuser: boolean
): Promise<void> {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (cleanEmail === SUPERADMIN_EMAIL && !makeSuperuser) {
    throw new Error('El Superadministrador principal fundador (laconeo@gmail.com) no puede ser modificado.');
  }

  // 1. Sincronizar en Supabase
  try {
    if (makeSuperuser) {
      await supabase.from('superusers').upsert(
        { user_id: studentId, email: cleanEmail },
        { onConflict: 'user_id' }
      );
      await supabase.from('instructors').upsert(
        { user_id: studentId },
        { onConflict: 'user_id' }
      );
      await supabase.from('students').update({ role: 'instructor' }).eq('id', studentId);
    } else {
      await supabase.from('superusers').delete().eq('user_id', studentId);
    }
  } catch (err) {
    console.warn('Supabase toggleStudentSuperuser fallback:', err);
  }

  // 2. Sincronizar en localStorage
  try {
    const list = getLocalSuperuserEmails();
    let updatedList: string[];
    if (makeSuperuser) {
      updatedList = Array.from(new Set([...list, cleanEmail]));
    } else {
      updatedList = list.filter((e) => e !== cleanEmail);
      if (!updatedList.includes(SUPERADMIN_EMAIL)) updatedList.push(SUPERADMIN_EMAIL);
    }
    localStorage.setItem(LOCAL_SUPERUSERS_KEY, JSON.stringify(updatedList));

    const current = getLocalStudent();
    if (current && (current.id === studentId || (current.email || '').toLowerCase().trim() === cleanEmail)) {
      current.isSuperuser = makeSuperuser;
      if (makeSuperuser) current.role = 'instructor';
      saveLocalStudent(current);
    }
  } catch (localErr) {
    console.warn('Error al guardar superuser en localStorage:', localErr);
  }
}

