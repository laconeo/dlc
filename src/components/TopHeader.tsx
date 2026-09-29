import React from 'react';
import { Flame, BookOpen, User, Shield } from 'lucide-react';
import { Student, isUserInstructor } from '../types';

interface TopHeaderProps {
  student: Student | null;
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
}

export function getUserInitials(student: Student | null): string {
  if (!student) return '';
  const first = student.firstName?.trim();
  const last = student.lastName?.trim();
  if (first && last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }
  const cleanName = (student.name || '').trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
  }
  if (student.email) {
    const prefix = student.email.split('@')[0].replace(/[^a-zA-Z]/g, '');
    if (prefix.length >= 2) return prefix.slice(0, 2).toUpperCase();
    if (prefix.length === 1) return prefix.toUpperCase();
  }
  return 'AL';
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  student,
  onOpenAdmin,
  onOpenProfile,
}) => {
  const streak = student?.currentStreak || 0;
  const completedCount = student?.completedDays?.length || 0;
  const canAccessAdmin = isUserInstructor(student);
  const initials = getUserInitials(student);

  return (
    <header
      className="shrink-0 w-full bg-white border-b-2 border-[#e5e5e5] px-3 z-30"
      style={{ paddingTop: 'max(10px, env(safe-area-inset-top))', paddingBottom: '10px' }}
    >
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">

        {/* 🔥 Streak */}
        <div
          id="streak-indicator"
          className="pill-duo border-[#ff9600] bg-[#fff3e0]"
          style={{ color: '#ff9600' }}
          title="Tu racha de lectura diaria"
        >
          <Flame className="w-5 h-5 fill-[#ff9600]" />
          <span className="text-base font-display font-bold">{streak}</span>
        </div>

        {/* Center: Días leídos */}
        <div
          className="pill-duo border-[#58cc02] bg-[#e8f9d9]"
          style={{ color: '#46a302' }}
          title="Días leídos"
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-display font-bold">{completedCount}/30</span>
        </div>

        {/* Right: Admin (solo instructores) + Avatar */}
        <div className="flex items-center gap-2">
          {canAccessAdmin && (
            <button
              id="instructor-admin-btn"
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 rounded-xl bg-[#3c3c3c] text-white active:scale-95 transition-transform shadow-sm"
              style={{ height: 40, fontSize: 13, fontWeight: 700 }}
              title="Panel del Maestro"
            >
              <Shield className="w-4 h-4 text-[#ffc800]" />
              <span className="font-display">Maestro</span>
            </button>
          )}

          <button
            id="student-profile-btn"
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-full text-white flex items-center justify-center font-display font-bold text-sm shadow-sm active:scale-95 transition-transform border-2 border-[#1899d6]"
            style={{ background: '#1cb0f6', letterSpacing: '0.5px' }}
            title={student?.name || 'Mi Perfil'}
          >
            {initials ? initials : <User className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
