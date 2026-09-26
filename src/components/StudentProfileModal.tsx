import React from 'react';
import { User, Mail, Award, BookOpen, Share2, LogOut, Shield, MapPin, ArrowLeft } from 'lucide-react';
import { Student, isUserInstructor, SUPERADMIN_EMAIL } from '../types';
import { SPECIAL_BADGES } from '../data/readings';

interface StudentProfileModalProps {
  student: Student | null;
  isOpen?: boolean;
  onClose: () => void;
  onSwitchAccount: () => void;
  onLogout?: () => void;
  onOpenAdmin: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  isOpen = true,
  onClose,
  onSwitchAccount,
  onLogout,
  onOpenAdmin,
}) => {
  if (isOpen === false) return null;

  const isInstructor = isUserInstructor(student);
  const isSuperAdmin = (student?.email || '').toLowerCase().trim() === SUPERADMIN_EMAIL;
  const completedDays = student?.completedDays || [];
  const currentStreak = student?.currentStreak || 0;
  const highestStreak = student?.highestStreak || 0;
  const badgesCount = student?.unlockedBadgeIds?.length || 0;

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `📖 ¡Hola! Estoy en el desafío «Detente, Lee, Conecta» de Seminario.\n🔥 Racha actual: ${currentStreak} días con Jesucristo.\n⭐ ${completedDays.length} de 30 lecturas del Antiguo Testamento.\n¡Únete tú también!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div
      className="w-full h-full flex flex-col bg-white overflow-hidden animate-fadeIn"
    >
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto no-scrollbar">
        {/* ── Header: Duolingo purple ── */}
        <div
          style={{
            background: '#a560f0',
            borderBottom: '3px solid #8a40d0',
            padding: '20px 20px 24px',
            textAlign: 'center',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* Back button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.35)',
              borderRadius: 12,
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
            }}
            aria-label="Volver"
          >
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          {/* Avatar */}
          <div
            className="mx-auto mb-3 font-display font-bold text-white flex items-center justify-center shadow-md"
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: isInstructor ? '#3c3c3c' : '#ffc800',
              border: `4px solid ${isInstructor ? '#ffc800' : 'rgba(255,255,255,0.5)'}`,
              fontSize: 36,
              color: isInstructor ? '#ffc800' : '#3c3c3c',
            }}
          >
            {student?.name ? student.name.charAt(0).toUpperCase() : <User style={{ width: 40, height: 40 }} />}
          </div>

          <h1
            className="font-display font-bold text-white"
            style={{ fontSize: 24, lineHeight: 1.2 }}
          >
            {student?.name || 'Joven de Seminario'}
          </h1>

          <div
            className="flex items-center justify-center gap-1.5 mt-1"
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}
          >
            <Mail style={{ width: 14, height: 14 }} />
            <span>{student?.email || '—'}</span>
          </div>

          {/* Role + Ward + Seminary Class pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5">
            {/* Role pill */}
            <span
              className="inline-flex items-center gap-1.5 font-display font-bold rounded-full px-3"
              style={{
                fontSize: 12,
                color: isInstructor ? '#ffc800' : '#ffffff',
                background: isInstructor ? '#222222' : 'rgba(255,255,255,0.22)',
                border: `2px solid ${isInstructor ? '#ffc800' : 'rgba(255,255,255,0.4)'}`,
                height: 28,
              }}
            >
              <Shield style={{ width: 13, height: 13 }} />
              {isSuperAdmin ? 'Superadministrador' : isInstructor ? 'Instructor' : 'Alumno'}
            </span>

            {student?.ward && (
              <span
                className="inline-flex items-center gap-1.5 font-bold rounded-full px-3"
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.95)',
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.35)',
                  height: 28,
                }}
              >
                <MapPin style={{ width: 12, height: 12 }} />
                {student.ward}
              </span>
            )}
            <span
              className="inline-flex items-center gap-1.5 font-bold rounded-full px-3"
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.9)',
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.25)',
                height: 28,
              }}
            >
              <BookOpen style={{ width: 12, height: 12 }} />
              {student?.seminaryClass || 'Seminario – Antiguo Testamento'}
            </span>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ padding: '16px 16px 32px', flex: 1 }}>

          {/* Streak cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {/* Current streak */}
            <div
              className="rounded-2xl text-center"
              style={{ padding: '14px 10px', background: '#fff3e0', border: '2px solid #ff9600' }}
            >
              <span style={{ fontSize: 30 }}>🔥</span>
              <p
                className="font-display font-bold"
                style={{ fontSize: 22, color: '#ff9600', marginTop: 2 }}
              >
                {currentStreak}
              </p>
              <p className="font-bold uppercase" style={{ fontSize: 11, color: '#cc7700', letterSpacing: '0.05em' }}>
                Racha Actual
              </p>
            </div>

            {/* Max streak */}
            <div
              className="rounded-2xl text-center"
              style={{ padding: '14px 10px', background: '#e8f7ff', border: '2px solid #1cb0f6' }}
            >
              <span style={{ fontSize: 30 }}>⚡</span>
              <p
                className="font-display font-bold"
                style={{ fontSize: 22, color: '#1cb0f6', marginTop: 2 }}
              >
                {highestStreak}
              </p>
              <p className="font-bold uppercase" style={{ fontSize: 11, color: '#1899d6', letterSpacing: '0.05em' }}>
                Racha Máxima
              </p>
            </div>
          </div>

          {/* Days progress */}
          <div
            className="rounded-2xl mb-4"
            style={{ padding: '14px', background: '#f7f7f7', border: '2px solid #e5e5e5' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen style={{ width: 18, height: 18, color: '#58cc02' }} />
                <span className="font-bold" style={{ fontSize: 14, color: '#3c3c3c' }}>Días leídos</span>
              </div>
              <span className="font-display font-bold" style={{ fontSize: 16, color: '#46a302' }}>
                {completedDays.length}/30
              </span>
            </div>
            <div
              className="rounded-full overflow-hidden"
              style={{ height: 12, background: '#e5e5e5', border: '2px solid #d0d0d0' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.round((completedDays.length / 30) * 100))}%`,
                  background: '#58cc02',
                }}
              />
            </div>
          </div>

          {/* Badges grid */}
          <div
            className="rounded-2xl mb-4"
            style={{ padding: '14px', background: '#f7f7f7', border: '2px solid #e5e5e5' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award style={{ width: 18, height: 18, color: '#a560f0' }} />
                <span className="font-bold" style={{ fontSize: 14, color: '#3c3c3c' }}>Cartas y Distintivos</span>
              </div>
              <span className="font-display font-bold" style={{ fontSize: 15, color: '#a560f0' }}>
                {badgesCount}/4
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {Object.values(SPECIAL_BADGES).map((b) => {
                const unlocked = student?.unlockedBadgeIds?.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className="rounded-xl text-center"
                    style={{
                      padding: '8px 4px',
                      background: unlocked
                        ? (b.tier === 'gold' ? '#fffbe0' : '#f5eeff')
                        : '#efefef',
                      border: `2px solid ${unlocked ? (b.tier === 'gold' ? '#ffc800' : '#a560f0') : '#d0d0d0'}`,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{unlocked ? (b.tier === 'gold' ? '🏅' : '✓') : '🔒'}</span>
                    <p
                      className="font-bold truncate mt-1"
                      style={{
                        fontSize: 10,
                        color: unlocked ? '#3c3c3c' : '#afafaf',
                      }}
                    >
                      {b.patriarch.split(' ')[0]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Share WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="btn-duo-green font-display w-full flex items-center justify-center gap-2"
              style={{ height: 52, borderRadius: 16, fontSize: 15 }}
            >
              <Share2 style={{ width: 20, height: 20 }} />
              <span>Compartir mi Racha en WhatsApp</span>
            </button>

            {/* Instructor panel (solo para instructores) */}
            {isInstructor && (
              <button
                onClick={onOpenAdmin}
                className="font-display w-full flex items-center justify-center gap-2 active:scale-95 transition-transform"
                style={{
                  height: 52,
                  borderRadius: 16,
                  fontSize: 15,
                  fontWeight: 700,
                  background: '#3c3c3c',
                  borderBottom: '4px solid #222222',
                  color: '#ffc800',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
              >
                <Shield style={{ width: 20, height: 20 }} />
                <span>Panel de Instructor</span>
              </button>
            )}

            {/* Logout */}
            <button
              onClick={() => { if (onLogout) onLogout(); else onSwitchAccount(); }}
              className="font-display w-full flex items-center justify-center gap-2"
              style={{
                height: 52,
                borderRadius: 16,
                fontSize: 15,
                fontWeight: 700,
                background: '#ffffff',
                border: '2px solid #e5e5e5',
                borderBottom: '4px solid #c8c8c8',
                color: '#ff4b4b',
                cursor: 'pointer',
              }}
            >
              <LogOut style={{ width: 20, height: 20 }} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
