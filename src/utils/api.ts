/**
 * api.ts – DLC (Detente, Lee, Conecta)
 *
 * Todas las operaciones de datos ahora usan Supabase directamente.
 * El servidor Express (api-router.ts) ya no es necesario para estas llamadas.
 *
 * Lógica de fallback local conservada para modo offline.
 */

import { supabase } from './supabase';
import { Student, InstructorStats, UserRole, SUPERADMIN_EMAIL, isUserInstructor } from '../types';

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToStudent(row: any): Student {
  const cleanEmail = (row.email ?? '').toLowerCase().trim();
  const isSuperAdmin = cleanEmail === SUPERADMIN_EMAIL;
  const role: UserRole = isSuperAdmin ? 'instructor' : (row.role === 'instructor' ? 'instructor' : 'alumno');

  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    name: row.name ?? `${row.first_name} ${row.last_name}`,
    role,
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

    const seeds = getStoredInstructorStudents();
    const matched = seeds.find(s => s.email.toLowerCase() === cleanEmail);
    if (matched) {
      saveLocalStudent(matched);
      return matched;
    }

    throw new Error('No se encontró el alumno o no hay conexión con el servidor.');
  }
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
    await supabase.rpc('recalculate_student_stats', { p_student_id: studentId });

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
    await supabase
      .from('student_notes')
      .upsert({ student_id: studentId, day, note: note.trim() }, { onConflict: 'student_id,day' });

    const { data, error } = await supabase
      .from('students_full')
      .select('*')
      .eq('id', studentId)
      .single();

    if (!error && data) {
      const student = rowToStudent(data);
      saveLocalStudent(student);
      return student;
    }
  } catch (err) {
    console.warn('saveStudentNote Supabase fallback:', err);
  }

  const local = getLocalStudent();
  if (local && local.id === studentId) {
    if (!local.notes) local.notes = {};
    local.notes[day] = note.trim();
    saveLocalStudent(local);
    return local;
  }
  throw new Error('No se pudo guardar la nota.');
}

// ── INSTRUCTOR DATA ───────────────────────────────────────────────────────────

export async function fetchInstructorData(): Promise<{ students: Student[]; stats: InstructorStats }> {
  try {
    // Leer todos los alumnos (requiere que el usuario sea instructor en RLS)
    const { data: rows, error } = await supabase
      .from('students_full')
      .select('*')
      .order('current_streak', { ascending: false });

    if (error) throw new Error(error.message);

    const students = (rows ?? []).map(rowToStudent);

    // Stats calculadas en cliente (o puedes usar la vista instructor_stats)
    const totalStudents = students.length;
    const totalDaysRead = students.reduce((acc, s) => acc + s.completedDays.length, 0);
    const averageStreak = totalStudents > 0
      ? Math.round((students.reduce((acc, s) => acc + s.currentStreak, 0) / totalStudents) * 10) / 10
      : 0;

    return {
      students,
      stats: {
        totalStudents,
        activeToday: students.filter(s => s.completedDays.length > 0).length,
        averageStreak,
        completed30DaysCount: students.filter(s => s.completedDays.length >= 30).length,
        totalDaysRead,
      },
    };

  } catch (err) {
    console.warn('Supabase fetchInstructorData failed, using local fallback:', err);
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
    const idx = stored.findIndex(s => s.id === studentId);
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

// ── LOGOUT ────────────────────────────────────────────────────────────────────

export async function logoutStudent(): Promise<void> {
  await supabase.auth.signOut();
  clearLocalStudent();
}

// ── RESET SEEDS (dev only) ────────────────────────────────────────────────────

export async function resetSeedStudents(): Promise<Student[]> {
  console.warn('resetSeedStudents: en producción los seeds se manejan desde el SQL schema.');
  localStorage.setItem(LOCAL_INSTRUCTOR_STUDENTS_KEY, JSON.stringify(FALLBACK_SEED_STUDENTS));
  return FALLBACK_SEED_STUDENTS;
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

// ── FALLBACK LOCAL (offline / sin Supabase) ───────────────────────────────────

const FALLBACK_SEED_STUDENTS: Student[] = [
  {
    id: 'stud-1',
    email: 'lucas.romero@seminario.org',
    name: 'Lucas Romero',
    role: 'alumno',
    seminaryClass: 'Clase Matutina - Barrio Central',
    avatarSeed: 'Lucas',
    completedDays: [1,2,3,4,5,6,7,8,9,10,11,12,13,14],
    currentStreak: 14,
    highestStreak: 14,
    unlockedBadgeIds: ['badge-abraham','badge-isaac'],
    lastCompletedDate: '2026-10-11',
    notes: { 1: 'Sentí mucho valor al leer Josué 1.', 7: 'Hermosa experiencia con la oración de Ana.' },
    createdAt: '2026-09-28T07:15:00.000Z',
    updatedAt: '2026-10-11T20:30:00.000Z',
  },
  {
    id: 'stud-2',
    email: 'valentina.silva@seminario.org',
    name: 'Valentina Silva',
    role: 'alumno',
    seminaryClass: 'Clase Vespertina - Estaca Sur',
    avatarSeed: 'Valentina',
    completedDays: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
    currentStreak: 21,
    highestStreak: 21,
    unlockedBadgeIds: ['badge-abraham','badge-isaac','badge-jacob'],
    lastCompletedDate: '2026-10-18',
    notes: { 18: 'Ester me inspiró a ser más valiente en el colegio.' },
    createdAt: '2026-09-28T08:00:00.000Z',
    updatedAt: '2026-10-18T19:45:00.000Z',
  },
  {
    id: 'stud-3',
    email: 'mateo.gomez@seminario.org',
    name: 'Mateo Gómez',
    role: 'alumno',
    seminaryClass: 'Clase Matutina - Barrio Central',
    avatarSeed: 'Mateo',
    completedDays: [1,2,3,4,5,6,7],
    currentStreak: 7,
    highestStreak: 7,
    unlockedBadgeIds: ['badge-abraham'],
    lastCompletedDate: '2026-10-04',
    notes: {},
    createdAt: '2026-09-28T09:20:00.000Z',
    updatedAt: '2026-10-04T18:10:00.000Z',
  },
  {
    id: 'stud-4',
    email: 'sofia.morales@seminario.org',
    name: 'Sofía Morales',
    role: 'alumno',
    seminaryClass: 'Clase Temprana - Barrio Norte',
    avatarSeed: 'Sofia',
    completedDays: [1,2,3,4,5],
    currentStreak: 5,
    highestStreak: 5,
    unlockedBadgeIds: [],
    lastCompletedDate: '2026-10-02',
    notes: {},
    createdAt: '2026-09-28T10:00:00.000Z',
    updatedAt: '2026-10-02T21:00:00.000Z',
  },
  {
    id: 'stud-5',
    email: 'benjamin.castro@seminario.org',
    name: 'Benjamín Castro',
    role: 'alumno',
    seminaryClass: 'Clase Vespertina - Estaca Sur',
    avatarSeed: 'Benjamin',
    completedDays: [1,2,3],
    currentStreak: 3,
    highestStreak: 3,
    unlockedBadgeIds: [],
    lastCompletedDate: '2026-09-30',
    notes: {},
    createdAt: '2026-09-28T11:00:00.000Z',
    updatedAt: '2026-09-30T17:30:00.000Z',
  },
];

function getStoredInstructorStudents(): Student[] {
  try {
    const raw = localStorage.getItem(LOCAL_INSTRUCTOR_STUDENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return FALLBACK_SEED_STUDENTS;
}

function fetchInstructorDataLocal(): { students: Student[]; stats: InstructorStats } {
  const students = getStoredInstructorStudents();
  const current = getLocalStudent();
  if (current && !students.some(s => s.id === current.id)) {
    students.unshift(current);
  }

  const totalStudents = students.length;
  const totalDaysRead = students.reduce((acc, s) => acc + s.completedDays.length, 0);
  const averageStreak = totalStudents > 0
    ? Math.round((students.reduce((acc, s) => acc + s.currentStreak, 0) / totalStudents) * 10) / 10
    : 0;

  return {
    students,
    stats: {
      totalStudents,
      activeToday: students.filter(s => s.completedDays.length > 0).length,
      averageStreak,
      completed30DaysCount: students.filter(s => s.completedDays.length >= 30).length,
      totalDaysRead,
    },
  };
}
