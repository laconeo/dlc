import React from 'react';
import { Flame, Award, BookOpen, User, Shield } from 'lucide-react';
import { Student, isUserInstructor } from '../types';

interface TopHeaderProps {
  student: Student | null;
  onOpenAdmin: () => void;
  onOpenBadges: () => void;
  onOpenProfile: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  student,
  onOpenAdmin,
  onOpenBadges,
  onOpenProfile,
}) => {
  const streak = student?.currentStreak || 0;
  const badgesCount = student?.unlockedBadgeIds?.length || 0;
  const completedCount = student?.completedDays?.length || 0;
  const canAccessAdmin = isUserInstructor(student);

  return (
    <header
      className="sticky top-0 z-30 bg-white border-b-2 border-[#e5e5e5] px-3"
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

        {/* Center: Badges & Days */}
        <div className="flex items-center gap-2">
          {/* Cartas */}
          <button
            id="badges-shortcut-btn"
            onClick={onOpenBadges}
            className="pill-duo border-[#a560f0] bg-[#f5eeff] active:scale-95 transition-transform"
            style={{ color: '#a560f0' }}
            title="Ver Cartas coleccionables"
          >
            <Award className="w-5 h-5" />
            <span className="text-base font-display font-bold">{badgesCount}/4</span>
          </button>

          {/* Días leídos */}
          <div
            className="pill-duo border-[#58cc02] bg-[#e8f9d9]"
            style={{ color: '#46a302' }}
            title="Días leídos"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-display font-bold">{completedCount}/30</span>
          </div>
        </div>

        {/* Right: Admin (solo instructores) + Avatar */}
        <div className="flex items-center gap-2">
          {canAccessAdmin && (
            <button
              id="instructor-admin-btn"
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 rounded-xl bg-[#3c3c3c] text-white active:scale-95 transition-transform shadow-sm"
              style={{ height: 40, fontSize: 13, fontWeight: 700 }}
              title="Panel de Instructor"
            >
              <Shield className="w-4 h-4 text-[#ffc800]" />
              <span className="font-display">Instructor</span>
            </button>
          )}

          <button
            id="student-profile-btn"
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-full text-white flex items-center justify-center font-display font-bold text-base shadow-sm active:scale-95 transition-transform border-2 border-[#e5e5e5]"
            style={{ background: '#1cb0f6' }}
            title={student?.name || 'Mi Perfil'}
          >
            {student?.name
              ? student.name.charAt(0).toUpperCase()
              : <User className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
