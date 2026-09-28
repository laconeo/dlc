import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Search,
  Users,
  Flame,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Mail,
  Sparkles,
  UserCheck,
  ArrowLeft,
  MapPin,
} from 'lucide-react';
import { Student, InstructorStats, UserRole, SUPERADMIN_EMAIL, isUserInstructor } from '../types';
import { fetchInstructorData, toggleStudentDay, updateStudentRole } from '../utils/api';
import { SPECIAL_BADGES } from '../data/readings';
import { getUserInitials } from './TopHeader';

interface AdminInstructorModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onStudentUpdated?: () => void;
  currentStudent?: Student | null;
}

/* Reusable stat card */
function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string | number;
}) {
  return (
    <div
      className="rounded-2xl text-center"
      style={{ padding: '12px 8px', background: '#ffffff', border: '2px solid #e5e5e5' }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-1"
        style={{ background: iconBg }}
      >
        <Icon style={{ width: 18, height: 18, color: iconColor }} />
      </div>
      <p className="font-display font-bold" style={{ fontSize: 20, color: '#3c3c3c' }}>
        {value}
      </p>
      <p className="font-bold uppercase" style={{ fontSize: 10, color: '#777777', letterSpacing: '0.04em' }}>
        {label}
      </p>
    </div>
  );
}

export const AdminInstructorModal: React.FC<AdminInstructorModalProps> = ({
  isOpen,
  onClose,
  onStudentUpdated,
  currentStudent,
}) => {
  if (!isOpen) return null;

  // Protección: los alumnos no pueden ver esta vista
  const hasAccess = isUserInstructor(currentStudent);

  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'instructors' | 'streak7' | 'completed' | 'recent'>('all');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchInstructorData();
      setStudents(data.students || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error('Error fetching instructor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      loadData();
    }
  }, [hasAccess]);

  const handleRefreshData = async () => {
    setActionMessage('Actualizando lista de estudiantes reales...');
    await loadData();
    setActionMessage('Lista actualizada.');
    setTimeout(() => setActionMessage(null), 2500);
    if (onStudentUpdated) onStudentUpdated();
  };

  const handleToggleDayForStudent = async (studentId: string, day: number) => {
    try {
      const updated = await toggleStudentDay(studentId, day);
      setStudents((prev) => prev.map((s) => (s.id === studentId ? updated : s)));
      if (onStudentUpdated) onStudentUpdated();
      setActionMessage(`Día ${day} actualizado para ${updated.name}`);
      setTimeout(() => setActionMessage(null), 2500);
    } catch {
      alert('Error al actualizar el día');
    }
  };

  const handleToggleRole = async (targetStudent: Student) => {
    const isTargetSuper = (targetStudent.email || '').toLowerCase().trim() === SUPERADMIN_EMAIL;
    if (isTargetSuper) {
      alert('El rol del Superadministrador laconeo@gmail.com no puede ser modificado.');
      return;
    }

    const currentRole = targetStudent.role === 'instructor' ? 'instructor' : 'alumno';
    const nextRole: UserRole = currentRole === 'instructor' ? 'alumno' : 'instructor';
    const actionDesc = nextRole === 'instructor' ? 'promover a INSTRUCTOR' : 'cambiar a rol ALUMNO';

    if (confirm(`¿Deseas ${actionDesc} a ${targetStudent.name} (${targetStudent.email})?`)) {
      try {
        await updateStudentRole(targetStudent.id, nextRole);
        setStudents((prev) =>
          prev.map((s) => (s.id === targetStudent.id ? { ...s, role: nextRole } : s))
        );
        setActionMessage(
          `Rol de ${targetStudent.name} cambiado a ${nextRole === 'instructor' ? 'Instructor 🛡️' : 'Alumno 📖'}`
        );
        setTimeout(() => setActionMessage(null), 3000);
        if (onStudentUpdated) onStudentUpdated();
      } catch {
        alert('Error al actualizar rol del usuario');
      }
    }
  };

  const handleInviteWhatsApp = (s: Student) => {
    const nombre = s.firstName || s.name.split(' ')[0] || s.name;
    const dias = s.completedDays.length;
    let mensaje = '';
    if (dias === 0) {
      mensaje = `📖 ¡Hola ${nombre}! Te escribo porque aún estás a tiempo de unirte al desafío «Detente, Lee, Conecta» de Seminario. ¡Solo 3 minutos al día con Jesucristo! 🔥 Ingresa aquí y comienza hoy 👇\nhttps://laconeo.github.io/dlc/`;
    } else {
      mensaje = `📖 ¡Hola ${nombre}! Vi que llevas ${dias} ${dias === 1 ? 'día' : 'días'} en el desafío «Detente, Lee, Conecta» de Seminario. ¡Vas muy bien! 🔥 Recuerda seguir leyendo cada día, aún tienes tiempo de completar el desafío. ¡Ánimo! 👇\nhttps://laconeo.github.io/dlc/`;
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const exportReport = () => {
    const lines = [
      'REPORTE – «DETENTE, LEE, CONECTA»',
      `Fecha: ${new Date().toLocaleDateString('es-ES')}`,
      `Total: ${students.length} usuarios`,
      '---',
      ...students.map(
        (s) =>
          `• [${s.role || 'alumno'}] ${s.name} (${s.email}) | Barrio/Rama: ${s.ward || '—'} | Clase: ${s.seminaryClass || '—'} | Racha: ${s.currentStreak}d | Días: ${s.completedDays.length}/30 | Cartas: ${s.unlockedBadgeIds.length}`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredStudents = students.filter((s) => {
    // 1. Filtro de búsqueda por texto (Barrio/Rama, nombre, apellido, correo, clase, rol)
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const match =
        (s.name || '').toLowerCase().includes(q) ||
        (s.firstName || '').toLowerCase().includes(q) ||
        (s.lastName || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.ward || '').toLowerCase().includes(q) ||
        (s.seminaryClass || '').toLowerCase().includes(q) ||
        (s.role || 'alumno').toLowerCase().includes(q);

      if (!match) return false;
    }

    // 2. Filtro por estado / categoría
    if (selectedFilter === 'instructors') return isUserInstructor(s);
    if (selectedFilter === 'streak7') return s.currentStreak >= 7;
    if (selectedFilter === 'completed') return s.completedDays.length >= 30;
    if (selectedFilter === 'recent') return s.completedDays.length > 0;
    return true;
  });

  const instructorsCount = students.filter(isUserInstructor).length;

  const FILTERS = [
    { id: 'all' as const, label: `Todos (${students.length})`, color: '#3c3c3c', bg: '#3c3c3c' },
    { id: 'instructors' as const, label: `Instructores (${instructorsCount})`, color: '#ff9600', bg: '#222222' },
    { id: 'streak7' as const, label: 'Racha ≥7', color: '#ff9600', bg: '#ff9600' },
    { id: 'completed' as const, label: 'Meta 30d', color: '#58cc02', bg: '#58cc02' },
    { id: 'recent' as const, label: 'Con lecturas', color: '#1cb0f6', bg: '#1cb0f6' },
  ];

  if (isOpen === false) return null;

  if (!hasAccess) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-white animate-fadeIn text-center">
        <div className="w-16 h-16 rounded-full bg-[#ffeeee] border-2 border-[#ff4b4b] flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-[#ff4b4b]" />
        </div>
        <h3 className="font-display font-bold text-xl text-[#3c3c3c] mb-2">Acceso Restringido</h3>
        <p className="text-sm text-[#777777] mb-6">
          Esta sección es exclusiva para <strong>Instructores</strong>. Tu cuenta tiene rol de <strong>Alumno</strong>.
        </p>
        <button
          onClick={onClose}
          className="btn-duo-green w-full font-display font-bold py-3 rounded-xl"
        >
          Volver a la App
        </button>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col bg-white overflow-hidden animate-fadeIn"
    >
      {/* ── Header: dark, Duolingo instructor style ── */}
      <div
        style={{
          background: '#3c3c3c',
          borderBottom: '3px solid #222222',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div className="flex items-center gap-3">
          <button
            id="close-instructor-admin-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)' }}
            aria-label="Volver al camino"
          >
            <ArrowLeft style={{ width: 18, height: 18, color: '#ffffff' }} />
          </button>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: '#ffc800' }}
          >
            <Shield style={{ width: 22, height: 22, color: '#3c3c3c' }} />
          </div>
          <div>
            <h2
              className="font-display font-bold text-white"
              style={{ fontSize: 18, lineHeight: 1.2 }}
            >
              Panel del Instructor
            </h2>
            <p style={{ fontSize: 12, color: '#afafaf' }}>
              Lecturas · Rachas · Cartas ganadas
            </p>
          </div>
        </div>
      </div>

        {/* ── Stats Row ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            padding: '12px 14px',
            background: '#f7f7f7',
            borderBottom: '2px solid #e5e5e5',
            flexShrink: 0,
          }}
        >
          <StatCard icon={Users}    iconColor="#1cb0f6" iconBg="#e8f7ff" label="Alumnos"       value={stats?.totalStudents || students.length} />
          <StatCard icon={Flame}    iconColor="#ff9600" iconBg="#fff3e0" label="Racha Prom."   value={`${stats?.averageStreak || 0}d`} />
          <StatCard icon={Award}    iconColor="#ffc800" iconBg="#fffbe0" label="Carta Dorada"  value={stats?.completed30DaysCount || 0} />
          <StatCard icon={BookOpen} iconColor="#58cc02" iconBg="#e8f9d9" label="Total Días"    value={stats?.totalDaysRead || 0} />
        </div>

        {/* ── Toast ── */}
        {actionMessage && (
          <div
            className="animate-fadeIn"
            style={{ background: '#58cc02', color: '#ffffff', fontWeight: 700, fontSize: 14, padding: '8px 20px', textAlign: 'center', flexShrink: 0 }}
          >
            {actionMessage}
          </div>
        )}

        {/* ── Search + Filter ── */}
        <div
          style={{
            padding: '12px 14px',
            borderBottom: '2px solid #e5e5e5',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            flexShrink: 0,
            background: '#ffffff',
          }}
        >
          {/* Search bar */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#afafaf' }} />
            <input
              id="instructor-search-students"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por barrio/rama, nombre, clase, correo..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 42px',
                fontSize: 14,
                fontFamily: 'inherit',
                background: '#f7f7f7',
                border: '2px solid #e5e5e5',
                borderRadius: 12,
                outline: 'none',
                color: '#3c3c3c',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#1cb0f6'; e.target.style.background = '#fff'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e5e5e5'; e.target.style.background = '#f7f7f7'; }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#e5e5e5',
                  border: 'none',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  cursor: 'pointer',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#777777',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {FILTERS.map((f) => {
              const active = selectedFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className="font-display font-bold whitespace-nowrap transition-all active:scale-95"
                  style={{
                    height: 34,
                    paddingLeft: 14,
                    paddingRight: 14,
                    borderRadius: 100,
                    fontSize: 13,
                    border: active ? 'none' : '2px solid #e5e5e5',
                    background: active ? f.bg : '#ffffff',
                    color: active ? '#ffffff' : '#777777',
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Student Roster ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '10px 12px', background: '#f7f7f7' }}>
          {loading ? (
            <div className="text-center py-12">
              <span className="text-4xl animate-spin inline-block mb-3">⏳</span>
              <p style={{ fontSize: 14, color: '#777777' }}>Cargando alumnos...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div
              className="rounded-2xl text-center"
              style={{ padding: '36px 20px', background: '#ffffff', border: '2px solid #e5e5e5' }}
            >
              <Users style={{ width: 44, height: 44, color: '#afafaf', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: '#3c3c3c' }}>
                {searchQuery || selectedWard !== 'all'
                  ? 'No se encontraron alumnos con ese criterio de búsqueda'
                  : 'No hay más alumnos registrados aún'}
              </p>
              <p style={{ fontSize: 13, color: '#777777', marginTop: 6, maxWidth: 320, marginInline: 'auto' }}>
                {searchQuery || selectedWard !== 'all'
                  ? 'Prueba borrando la búsqueda o cambiando el filtro de Barrio/Rama seleccionado.'
                  : 'Tu panel está limpio. Cuando los alumnos reales se registren con su cuenta, aparecerán automáticamente en esta lista.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredStudents.map((student) => {
                const isExpanded = expandedStudentId === student.id;
                const percent = Math.round((student.completedDays.length / 30) * 100);
                const isTargetSuper = (student.email || '').toLowerCase().trim() === SUPERADMIN_EMAIL;
                const isTargetInstructor = isUserInstructor(student);
                const initials = getUserInitials(student);

                return (
                  <div
                    key={student.id}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: '#ffffff', border: '2px solid #e5e5e5' }}
                  >
                    {/* Row summary */}
                    <div
                      onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                      className="flex items-center gap-3 cursor-pointer"
                      style={{ padding: '12px 14px' }}
                    >
                      {/* Avatar with 2 initials */}
                      <div
                        className="font-display font-bold text-white flex items-center justify-center shrink-0"
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: '50%',
                          background: isTargetInstructor ? '#3c3c3c' : '#1cb0f6',
                          color: isTargetInstructor ? '#ffc800' : '#ffffff',
                          border: isTargetInstructor ? '2px solid #ffc800' : 'none',
                          fontSize: 14,
                          letterSpacing: '0.5px',
                        }}
                      >
                        {initials}
                      </div>

                      {/* Name + email + role */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4
                            className="font-display font-bold truncate"
                            style={{ fontSize: 15, color: '#3c3c3c' }}
                          >
                            {student.name}
                          </h4>
                          {student.completedDays.length >= 30 && (
                            <span title="Completó el desafío">👑</span>
                          )}

                          {/* Role badge */}
                          {isTargetSuper ? (
                            <span
                              className="font-display font-bold rounded-full px-2 py-0.5 inline-flex items-center gap-1"
                              style={{
                                fontSize: 10,
                                background: '#222222',
                                color: '#ffc800',
                                border: '1px solid #ffc800',
                              }}
                            >
                              Superadmin
                            </span>
                          ) : isTargetInstructor ? (
                            <span
                              className="font-display font-bold rounded-full px-2 py-0.5 inline-flex items-center gap-1"
                              style={{
                                fontSize: 10,
                                background: '#3c3c3c',
                                color: '#ffc800',
                              }}
                            >
                              <Shield style={{ width: 10, height: 10 }} />
                              Instructor
                            </span>
                          ) : (
                            <span
                              className="font-display font-bold rounded-full px-2 py-0.5"
                              style={{
                                fontSize: 10,
                                background: '#f0f0f0',
                                color: '#777777',
                              }}
                            >
                              Alumno
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <p
                            className="truncate flex items-center gap-1"
                            style={{ fontSize: 12, color: '#777777' }}
                          >
                            <Mail style={{ width: 12, height: 12, flexShrink: 0 }} />
                            {student.email}
                          </p>

                          {student.ward && (
                            <span
                              className="inline-flex items-center gap-1 font-semibold rounded-md px-1.5 py-0.5"
                              style={{
                                fontSize: 11,
                                background: '#f0f9ff',
                                color: '#0369a1',
                                border: '1px solid #bae6fd',
                              }}
                              title={`Barrio/Rama: ${student.ward}`}
                            >
                              <MapPin style={{ width: 10, height: 10 }} />
                              <span className="truncate max-w-[130px]">{student.ward}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Streak + progress + toggle */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div
                          className="font-display font-bold flex items-center gap-1 rounded-xl px-2"
                          style={{ height: 28, background: '#fff3e0', border: '2px solid #ff9600', color: '#ff9600', fontSize: 13 }}
                        >
                          <span>🔥</span>
                          <span>{student.currentStreak}d</span>
                        </div>

                        <div className="hidden sm:block text-right">
                          <span className="font-display font-bold" style={{ fontSize: 14, color: '#3c3c3c' }}>
                            {student.completedDays.length}/30
                          </span>
                          <div
                            className="rounded-full overflow-hidden mt-1"
                            style={{ width: 64, height: 8, background: '#e5e5e5' }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${Math.min(100, percent)}%`, background: '#58cc02' }}
                            />
                          </div>
                        </div>

                        <button style={{ color: '#afafaf', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                          {isExpanded
                            ? <ChevronUp style={{ width: 20, height: 20 }} />
                            : <ChevronDown style={{ width: 20, height: 20 }} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div
                        className="animate-fadeIn"
                        style={{
                          padding: '14px',
                          borderTop: '2px solid #f0f0f0',
                          background: '#f7f7f7',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                        }}
                      >
                        {/* 🛡️ Role Management section */}
                        <div
                          className="rounded-xl flex items-center justify-between gap-3 p-3"
                          style={{
                            background: '#ffffff',
                            border: '2px solid #e5e5e5',
                          }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                background: isTargetInstructor ? '#3c3c3c' : '#f0f0f0',
                                color: isTargetInstructor ? '#ffc800' : '#777777',
                              }}
                            >
                              <Shield style={{ width: 18, height: 18 }} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-display font-bold" style={{ fontSize: 13, color: '#3c3c3c' }}>
                                Rol: {isTargetSuper ? 'Superadministrador 👑' : isTargetInstructor ? 'Instructor 🛡️' : 'Alumno 📖'}
                              </p>
                              <p className="truncate" style={{ fontSize: 11, color: '#777777' }}>
                                {isTargetSuper
                                  ? 'Cuenta principal (laconeo@gmail.com). Permisos totales.'
                                  : isTargetInstructor
                                  ? 'Acceso al panel instructor y cambio de roles.'
                                  : 'Acceso solo a lecturas, cartas y racha propia.'}
                              </p>
                            </div>
                          </div>

                          {!isTargetSuper && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleRole(student);
                              }}
                              className="font-display font-bold shrink-0 rounded-xl px-3 py-1.5 transition-all active:scale-95 shadow-sm"
                              style={{
                                fontSize: 12,
                                background: isTargetInstructor ? '#ff4b4b' : '#3c3c3c',
                                color: isTargetInstructor ? '#ffffff' : '#ffc800',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                              title={isTargetInstructor ? 'Quitar rol de instructor' : 'Asignar rol de instructor'}
                            >
                              {isTargetInstructor ? 'Quitar Instructor' : 'Hacer Instructor'}
                            </button>
                          )}
                        </div>

                        {/* Meta info */}
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8,
                            fontSize: 13,
                            color: '#3c3c3c',
                            paddingBottom: 10,
                            borderBottom: '2px solid #e5e5e5',
                          }}
                        >
                          {student.ward && (
                            <span><strong>Rama/Barrio:</strong> {student.ward}</span>
                          )}
                          <span><strong>Clase:</strong> {student.seminaryClass || 'Seminario Antiguo Testamento'}</span>
                          <span><strong>Racha máx.:</strong> {student.highestStreak}d</span>
                          <span><strong>Última lectura:</strong> {student.lastCompletedDate || '—'}</span>
                        </div>

                        {/* Badges earned */}
                        <div>
                          <p className="font-bold mb-2" style={{ fontSize: 13, color: '#3c3c3c' }}>
                            Cartas obtenidas:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Object.values(SPECIAL_BADGES).map((badge) => {
                              const won = student.unlockedBadgeIds.includes(badge.id);
                              return (
                                <div
                                  key={badge.id}
                                  className="font-bold flex items-center gap-1 rounded-xl px-2.5"
                                  style={{
                                    height: 28,
                                    fontSize: 12,
                                    background: won
                                      ? (badge.tier === 'gold' ? '#fffbe0' : '#f5eeff')
                                      : '#efefef',
                                    border: `2px solid ${won ? (badge.tier === 'gold' ? '#ffc800' : '#a560f0') : '#e0e0e0'}`,
                                    color: won ? '#3c3c3c' : '#afafaf',
                                  }}
                                >
                                  <span>{won ? '✓' : '🔒'}</span>
                                  <span>{badge.patriarch}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Day matrix */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold" style={{ fontSize: 13, color: '#3c3c3c' }}>
                              Matriz de Lecturas (clic para marcar/desmarcar):
                            </p>
                          </div>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(7, 1fr)',
                              gap: 5,
                            }}
                          >
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                              const done = student.completedDays.includes(day);
                              return (
                                <button
                                  key={day}
                                  onClick={() => handleToggleDayForStudent(student.id, day)}
                                  title={`Día ${day}: ${done ? 'Completado' : 'Pendiente'}`}
                                  className="font-display font-bold flex items-center justify-center transition-all active:scale-95"
                                  style={{
                                    height: 34,
                                    borderRadius: 10,
                                    fontSize: 13,
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: done ? '#58cc02' : '#e5e5e5',
                                    color: done ? '#ffffff' : '#777777',
                                  }}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* WhatsApp invite button */}
                        <button
                          id={`invite-whatsapp-btn-${student.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInviteWhatsApp(student);
                          }}
                          className="w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl active:scale-95 transition-all"
                          style={{
                            height: 44,
                            fontSize: 14,
                            background: '#25D366',
                            borderBottom: '4px solid #1aab52',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20, flexShrink: 0 }}>
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          <span>Invitar por WhatsApp</span>
                        </button>

                        {/* Student notes */}
                        {student.notes && Object.keys(student.notes).length > 0 && (
                          <div>
                            <p className="font-bold mb-2" style={{ fontSize: 13, color: '#3c3c3c' }}>
                              Reflexiones del alumno:
                            </p>
                            <div
                              className="no-scrollbar"
                              style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 120, overflowY: 'auto' }}
                            >
                              {Object.entries(student.notes).map(([d, txt]) => (
                                <div
                                  key={d}
                                  className="rounded-xl"
                                  style={{ padding: '8px 10px', background: '#ffffff', border: '2px solid #e5e5e5', fontSize: 13 }}
                                >
                                  <span className="font-bold" style={{ color: '#a560f0' }}>Día {d}: </span>
                                  <span style={{ color: '#3c3c3c', fontStyle: 'italic' }}>«{txt}»</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div
          className="flex items-center justify-between flex-wrap gap-2"
          style={{
            padding: '12px 14px',
            borderTop: '2px solid #e5e5e5',
            background: '#ffffff',
            flexShrink: 0,
          }}
        >
          <button
            id="instructor-refresh-students-btn"
            onClick={handleRefreshData}
            disabled={loading}
            className="flex items-center gap-2 font-display font-bold rounded-xl active:scale-95 transition-transform"
            style={{
              height: 40,
              paddingLeft: 14,
              paddingRight: 14,
              fontSize: 14,
              background: '#f7f7f7',
              border: '2px solid #e5e5e5',
              color: '#3c3c3c',
              cursor: 'pointer',
            }}
          >
            <RotateCcw style={{ width: 16, height: 16 }} />
            <span>Actualizar Lista</span>
          </button>

          <button
            onClick={exportReport}
            className="flex items-center gap-2 font-display font-bold rounded-xl"
            style={{
              height: 40,
              paddingLeft: 16,
              paddingRight: 16,
              fontSize: 14,
              background: '#3c3c3c',
              border: '3px solid #222222',
              color: '#ffc800',
              cursor: 'pointer',
            }}
          >
            <Download style={{ width: 16, height: 16 }} />
            Exportar Reporte
          </button>
        </div>
      </div>
  );
};
