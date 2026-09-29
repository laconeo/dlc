import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Award,
  BookOpen,
  Share2,
  LogOut,
  Shield,
  MapPin,
  ArrowLeft,
  Edit2,
  CheckCircle2,
  Save,
  X,
  AlertCircle,
  School,
} from 'lucide-react';
import { Student, isUserInstructor, isUserSuperAdmin, SUPERADMIN_EMAIL } from '../types';
import { SPECIAL_BADGES } from '../data/readings';
import { updateStudentProfile } from '../utils/api';
import { getUserInitials } from './TopHeader';

interface StudentProfileModalProps {
  student: Student | null;
  isOpen?: boolean;
  onClose: () => void;
  onSwitchAccount: () => void;
  onLogout?: () => void;
  onOpenAdmin: () => void;
  onStudentUpdated?: (student: Student) => void;
}

const SEMINARY_CLASSES = [
  'Seminario - Antiguo Testamento',
  'Seminario - Nuevo Testamento',
  'Seminario - Libro de Mormón',
  'Seminario - Doctrina y Convenios',
  'Otra clase de Seminario',
];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  isOpen = true,
  onClose,
  onSwitchAccount,
  onLogout,
  onOpenAdmin,
  onStudentUpdated,
}) => {
  if (isOpen === false) return null;

  const isInstructor = isUserInstructor(student);
  const isSuperAdmin = isUserSuperAdmin(student);
  const completedDays = student?.completedDays || [];
  const currentStreak = student?.currentStreak || 0;
  const highestStreak = student?.highestStreak || 0;
  const badgesCount = student?.unlockedBadgeIds?.length || 0;

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [ward, setWard] = useState('');
  const [seminaryClass, setSeminaryClass] = useState('Seminario - Antiguo Testamento');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state with current student
  useEffect(() => {
    if (student) {
      const parts = (student.name || '').trim().split(' ');
      setFirstName(student.firstName || parts[0] || '');
      setLastName(student.lastName || parts.slice(1).join(' ') || '');
      setWard(student.ward || '');
      setSeminaryClass(student.seminaryClass || 'Seminario - Antiguo Testamento');
    }
  }, [student]);

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `📖 ¡Hola! Estoy en el desafío «Detente, Lee, Conecta» de Seminario.\n🔥 Racha actual: ${currentStreak} días con Jesucristo.\n⭐ ${completedDays.length} de 30 lecturas del Antiguo Testamento.\n¡Únete tú también! 👇\nhttps://laconeo.github.io/dlc/`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };


  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    if (!firstName.trim()) {
      setErrorMsg('El nombre es obligatorio.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      const updated = await updateStudentProfile(student.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ward: ward.trim(),
        seminaryClass: seminaryClass.trim(),
      });
      if (onStudentUpdated) {
        onStudentUpdated(updated);
      }
      setSuccessMsg('¡Tus datos han sido actualizados con éxito!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al actualizar tus datos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden animate-fadeIn">
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

          {/* Edit trigger button in top right */}
          <button
            id="edit-profile-btn"
            onClick={() => {
              setIsEditing(!isEditing);
              setErrorMsg(null);
            }}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: isEditing ? '#ffffff' : 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.35)',
              borderRadius: 12,
              padding: '0 12px',
              height: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              color: isEditing ? '#a560f0' : '#ffffff',
              fontWeight: 700,
              fontSize: 13,
            }}
            aria-label="Editar perfil"
          >
            {isEditing ? (
              <>
                <X style={{ width: 16, height: 16 }} />
                <span>Cancelar</span>
              </>
            ) : (
              <>
                <Edit2 style={{ width: 16, height: 16 }} />
                <span>Editar</span>
              </>
            )}
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
              fontSize: 28,
              letterSpacing: '1px',
              color: isInstructor ? '#ffc800' : '#3c3c3c',
            }}
          >
            {getUserInitials(student) || <User style={{ width: 40, height: 40 }} />}
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
              {isSuperAdmin ? 'Superadministrador' : isInstructor ? 'Maestro' : 'Alumno'}
            </span>

            {student?.ward ? (
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
            ) : null}

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
              <School style={{ width: 12, height: 12 }} />
              {student?.seminaryClass || 'Seminario - Antiguo Testamento'}
            </span>
          </div>
        </div>

        {/* ── Success Toast ── */}
        {successMsg && (
          <div
            className="mx-4 mt-4 p-3.5 rounded-2xl flex items-center gap-2.5 border-2 border-[#bbf7d0] animate-fadeIn"
            style={{ background: '#f0fdf4' }}
          >
            <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0" />
            <p className="text-xs font-bold text-[#15803d] font-display">
              {successMsg}
            </p>
          </div>
        )}

        {/* ── EDIT FORM MODAL CARD ── */}
        {isEditing ? (
          <div className="p-4 animate-fadeIn">
            <form
              onSubmit={handleSaveProfile}
              className="rounded-3xl p-5 border-2 border-[#a560f0]/30 shadow-md"
              style={{ background: '#faf5ff' }}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e9d5ff]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#f3e8ff] flex items-center justify-center text-[#9333ea]">
                    <Edit2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-base text-[#581c87]">
                    Editar Mis Datos
                  </h3>
                </div>
                <span className="text-xs font-medium text-[#7e22ce]">
                  Perfil de Alumno
                </span>
              </div>

              {errorMsg && (
                <div className="mb-3 p-3 rounded-xl bg-[#ffeeee] border border-[#ff4b4b] flex items-center gap-2 text-xs text-[#d32f2f] font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-3 mb-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#3c3c3c] mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-[#e5e5e5] bg-white text-sm font-medium focus:border-[#a560f0] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3c3c3c] mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Tu apellido"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-[#e5e5e5] bg-white text-sm font-medium focus:border-[#a560f0] outline-none"
                    required
                  />
                </div>
              </div>

              {/* Barrio o Rama */}
              <div className="mb-3.5">
                <label className="block text-xs font-bold text-[#3c3c3c] mb-1">
                  Barrio o Rama (Iglesia)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#a560f0] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="Ej. Barrio Central, Barrio Palermo, Rama Belgrano"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-[#e5e5e5] bg-white text-sm font-medium focus:border-[#a560f0] outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#777777] mt-1">
                  Tu congregación o unidad local de La Iglesia de Jesucristo.
                </p>
              </div>

              {/* Clase de Seminario */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-[#3c3c3c] mb-1">
                  Clase de Seminario
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-[#a560f0] absolute left-3 top-3.5" />
                  <select
                    value={seminaryClass}
                    onChange={(e) => setSeminaryClass(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-[#e5e5e5] bg-white text-sm font-medium focus:border-[#a560f0] outline-none appearance-none cursor-pointer"
                  >
                    {SEMINARY_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex items-center gap-2.5 pt-2 border-t border-[#e9d5ff]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="btn-duo-ghost flex-1 py-3 text-sm font-display font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-duo-green flex-1 py-3 text-sm font-display font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {/* ── Stats & Details ── */}
        <div style={{ padding: '16px 16px 32px', flex: 1 }}>

          {/* Quick edit banner if ward or class is empty */}
          {!student?.ward && !isEditing && (
            <div
              className="rounded-2xl p-3.5 mb-4 border-2 border-[#fed7aa] flex items-center justify-between gap-3"
              style={{ background: '#fff7ed' }}
            >
              <div>
                <p className="font-display font-bold text-xs text-[#9a3412]">
                  ¿A qué barrio o rama perteneces?
                </p>
                <p className="text-[11px] text-[#c2410c] mt-0.5">
                  Completa tu barrio y clase para que tus maestros te identifiquen.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="shrink-0 font-display font-bold text-xs px-3 py-1.5 rounded-xl text-white shadow-sm"
                style={{ background: '#ea580c' }}
              >
                Completar
              </button>
            </div>
          )}

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
                <span>Panel del Maestro</span>
              </button>
            )}

            {/* Version label */}
            <p
              style={{
                textAlign: 'center',
                fontSize: 11,
                color: '#afafaf',
                fontWeight: 600,
                marginTop: -4,
                marginBottom: -4,
                letterSpacing: '0.04em',
              }}
            >
              Detente, Lee, Conecta · v{__APP_VERSION__}
            </p>

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

