import express from 'express';
import path from 'path';
import fs from 'fs';
import { Student } from './src/types.ts';

export const apiApp = express();
apiApp.use(express.json());

const DATA_DIR = path.join(process.cwd(), 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial realistic seed students for the Seminary teacher
export const SEED_STUDENTS: Student[] = [
  {
    id: 'stud-1',
    email: 'lucas.romero@seminario.org',
    password: 'seminario123',
    firstName: 'Lucas',
    lastName: 'Romero',
    name: 'Lucas Romero',
    seminaryClass: 'Clase Matutina - Barrio Central',
    avatarSeed: 'Lucas',
    completedDays: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    currentStreak: 14,
    highestStreak: 14,
    unlockedBadgeIds: ['badge-abraham', 'badge-isaac'],
    lastCompletedDate: '2026-10-11',
    notes: {
      1: 'Sentí mucho valor al leer Josué 1.',
      7: 'Hermosa experiencia con la oración de Ana.',
    },
    createdAt: '2026-09-28T07:15:00.000Z',
    updatedAt: '2026-10-11T20:30:00.000Z',
  },
  {
    id: 'stud-2',
    email: 'valentina.silva@seminario.org',
    password: 'seminario123',
    firstName: 'Valentina',
    lastName: 'Silva',
    name: 'Valentina Silva',
    seminaryClass: 'Clase Vespertina - Estaca Sur',
    avatarSeed: 'Valentina',
    completedDays: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    currentStreak: 21,
    highestStreak: 21,
    unlockedBadgeIds: ['badge-abraham', 'badge-isaac', 'badge-jacob'],
    lastCompletedDate: '2026-10-18',
    notes: {
      18: 'Ester me inspiró a ser más valiente en el colegio.',
    },
    createdAt: '2026-09-28T08:00:00.000Z',
    updatedAt: '2026-10-18T19:45:00.000Z',
  },
  {
    id: 'stud-3',
    email: 'mateo.gomez@seminario.org',
    password: 'seminario123',
    firstName: 'Mateo',
    lastName: 'Gómez',
    name: 'Mateo Gómez',
    seminaryClass: 'Clase Matutina - Barrio Central',
    avatarSeed: 'Mateo',
    completedDays: [1, 2, 3, 4, 5, 6, 7],
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
    password: 'seminario123',
    firstName: 'Sofía',
    lastName: 'Morales',
    name: 'Sofía Morales',
    seminaryClass: 'Clase Temprana - Barrio Norte',
    avatarSeed: 'Sofia',
    completedDays: [1, 2, 3, 4, 5],
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
    password: 'seminario123',
    firstName: 'Benjamín',
    lastName: 'Castro',
    name: 'Benjamín Castro',
    seminaryClass: 'Clase Vespertina - Estaca Sur',
    avatarSeed: 'Benjamin',
    completedDays: [1, 2, 3],
    currentStreak: 3,
    highestStreak: 3,
    unlockedBadgeIds: [],
    lastCompletedDate: '2026-09-30',
    notes: {},
    createdAt: '2026-09-28T11:00:00.000Z',
    updatedAt: '2026-09-30T17:30:00.000Z',
  },
];

function loadStudents(): Student[] {
  try {
    if (fs.existsSync(STUDENTS_FILE)) {
      const data = fs.readFileSync(STUDENTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading students file:', err);
  }
  saveStudents(SEED_STUDENTS);
  return SEED_STUDENTS;
}

function saveStudents(students: Student[]) {
  try {
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving students file:', err);
  }
}

function recalculateStudentStats(student: Student): Student {
  const completed = Array.from(new Set(student.completedDays)).sort((a, b) => a - b);
  student.completedDays = completed;

  let streak = 0;
  for (let d = 1; d <= 31; d++) {
    if (completed.includes(d)) {
      streak++;
    } else {
      break;
    }
  }

  student.currentStreak = streak;
  if (streak > student.highestStreak) {
    student.highestStreak = streak;
  }

  const badges: string[] = [];
  const hasW1 = [1, 2, 3, 4, 5, 6, 7].every(d => completed.includes(d));
  const hasW2 = Array.from({ length: 14 }, (_, i) => i + 1).every(d => completed.includes(d));
  const hasW3 = Array.from({ length: 21 }, (_, i) => i + 1).every(d => completed.includes(d));
  const hasW4 = Array.from({ length: 30 }, (_, i) => i + 1).every(d => completed.includes(d));

  if (hasW1) badges.push('badge-abraham');
  if (hasW2) badges.push('badge-isaac');
  if (hasW3) badges.push('badge-jacob');
  if (hasW4 || completed.includes(31)) badges.push('badge-jesucristo');

  student.unlockedBadgeIds = badges;
  student.updatedAt = new Date().toISOString();
  return student;
}

let studentsCache = loadStudents();

// API ROUTES
apiApp.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

apiApp.get('/api/students', (req, res) => {
  const students = studentsCache;
  const totalStudents = students.length;
  const totalDaysRead = students.reduce((acc, s) => acc + s.completedDays.length, 0);
  const averageStreak = totalStudents > 0
    ? Math.round((students.reduce((acc, s) => acc + s.currentStreak, 0) / totalStudents) * 10) / 10
    : 0;
  const completed30DaysCount = students.filter(s => s.completedDays.length >= 30).length;

  res.json({
    students,
    stats: {
      totalStudents,
      activeToday: students.filter(s => s.completedDays.length > 0).length,
      averageStreak,
      completed30DaysCount,
      totalDaysRead,
    },
  });
});

// POST Register new student (email, password, firstName, lastName, seminaryClass)
apiApp.post('/api/students/register', (req, res) => {
  const { email, password, firstName, lastName, seminaryClass, ward } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Por favor ingresa un correo electrónico válido.' });
  }

  if (!password || typeof password !== 'string' || password.trim().length < 4) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres.' });
  }

  if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio.' });
  }

  if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
    return res.status(400).json({ error: 'El apellido es obligatorio.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanFirst = firstName.trim();
  const cleanLast = lastName.trim();
  const fullName = `${cleanFirst} ${cleanLast}`;

  const existing = studentsCache.find(s => s.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'Este correo electrónico ya está registrado. Por favor inicia sesión.' });
  }

  const newStudent: Student = {
    id: 'stud-' + Date.now(),
    email: cleanEmail,
    password: password.trim(),
    firstName: cleanFirst,
    lastName: cleanLast,
    name: fullName,
    ward: ward?.trim() || '',
    seminaryClass: seminaryClass?.trim() || 'Seminario - Antiguo Testamento',
    avatarSeed: cleanFirst,
    completedDays: [],
    currentStreak: 0,
    highestStreak: 0,
    unlockedBadgeIds: [],
    notes: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  studentsCache.unshift(newStudent);
  saveStudents(studentsCache);

  res.status(201).json({ student: newStudent, message: '¡Registro exitoso!' });
});

// POST Student login (email, password)
apiApp.post('/api/students/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'El correo electrónico es requerido.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const student = studentsCache.find(s => s.email.toLowerCase() === cleanEmail);

  if (!student) {
    return res.status(404).json({ error: 'No se encontró ninguna cuenta con este correo. Por favor regístrate.' });
  }

  // If student has a password, check it
  if (student.password && password) {
    if (student.password !== password.trim()) {
      return res.status(401).json({ error: 'Contraseña incorrecta. Por favor verifica tus datos.' });
    }
  } else if (student.password && !password) {
    return res.status(400).json({ error: 'Por favor ingresa tu contraseña.' });
  } else if (!student.password && password) {
    // If legacy student without password, set it
    student.password = password.trim();
    saveStudents(studentsCache);
  }

  res.json({ student });
});

apiApp.post('/api/students/:id/toggle-day', (req, res) => {
  const { id } = req.params;
  const { day, note } = req.body || {};

  const dayNum = Number(day);
  if (!dayNum || dayNum < 1 || dayNum > 31) {
    return res.status(400).json({ error: 'Día inválido (debe ser entre 1 y 31).' });
  }

  const student = studentsCache.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Alumno no encontrado.' });
  }

  const index = student.completedDays.indexOf(dayNum);
  let isCompletedNow = false;

  if (index > -1) {
    student.completedDays.splice(index, 1);
    isCompletedNow = false;
  } else {
    student.completedDays.push(dayNum);
    student.lastCompletedDate = new Date().toISOString().split('T')[0];
    isCompletedNow = true;
  }

  if (note !== undefined && typeof note === 'string') {
    if (!student.notes) student.notes = {};
    student.notes[dayNum] = note;
  }

  recalculateStudentStats(student);
  saveStudents(studentsCache);

  res.json({
    student,
    isCompletedNow,
    message: isCompletedNow ? `¡Día ${dayNum} completado!` : `Día ${dayNum} desmarcado.`,
  });
});

apiApp.post('/api/students/:id/note', (req, res) => {
  const { id } = req.params;
  const { day, note } = req.body || {};
  const dayNum = Number(day);

  const student = studentsCache.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Alumno no encontrado.' });
  }

  if (!student.notes) student.notes = {};
  student.notes[dayNum] = String(note || '');
  student.updatedAt = new Date().toISOString();
  saveStudents(studentsCache);

  res.json({ success: true, notes: student.notes });
});

apiApp.post('/api/admin/reset-seeds', (req, res) => {
  studentsCache = [...SEED_STUDENTS];
  saveStudents(studentsCache);
  res.json({ success: true, message: 'Alumnos de prueba restablecidos.', students: studentsCache });
});
