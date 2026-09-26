export type MinisteringPillar = 'Amar' | 'Compartir' | 'Invitar';

export interface SpecialBadge {
  id: string;
  name: string;
  patriarch: string;
  tier: 'silver' | 'gold';
  weekNumber: number;
  unlockedAtDay: number;
  title: string;
  quote: string;
  description: string;
  colorGradient: string;
  accentColor: string;
}

export interface DayReading {
  day: number;
  dateStr: string;
  calendarDate: string; // e.g. "2026-09-28"
  character: string;
  scriptureRef: string;
  scriptureUrl: string;
  theme: string;
  connectionThought: string; // 3-minute connection with Jesus Christ
  pillar: MinisteringPillar;
  dailyAction: string; // Amar, Compartir o Invitar action
  week: number;
  isWeekMilestone?: boolean;
  milestoneBadge?: SpecialBadge;
  isFinalMilestone?: boolean;
}

export type UserRole = 'alumno' | 'instructor';

export const SUPERADMIN_EMAIL = 'laconeo@gmail.com';

export function isUserInstructor(student: Student | null | undefined): boolean {
  if (!student) return false;
  const email = (student.email || '').toLowerCase().trim();
  if (email === SUPERADMIN_EMAIL) return true;
  return student.role === 'instructor';
}

export interface Student {
  id: string;
  email: string;
  name: string;
  role?: UserRole;        // 'alumno' (default) o 'instructor'
  firstName?: string;
  lastName?: string;
  password?: string;
  ward?: string;          // Rama o Barrio de la Iglesia
  seminaryClass?: string; // Clase de Seminario
  avatarSeed?: string;
  completedDays: number[];
  currentStreak: number;
  highestStreak: number;
  unlockedBadgeIds: string[];
  lastCompletedDate?: string;
  notes?: Record<number, string>; // daily reflections
  createdAt: string;
  updatedAt: string;
}

export interface InstructorStats {
  totalStudents: number;
  activeToday: number;
  averageStreak: number;
  completed30DaysCount: number;
  totalDaysRead: number;
}

