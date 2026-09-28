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
  TrendingUp,
  Trash2,
  Edit2,
  Save,
} from 'lucide-react';
import { Student, InstructorStats, UserRole, SUPERADMIN_EMAIL, isUserInstructor } from '../types';
import { fetchInstructorData, toggleStudentDay, updateStudentRole, deleteStudent, updateStudentProfile } from '../utils/api';
import { SPECIAL_BADGES, READINGS_DATA } from '../data/readings';
import { getUserInitials } from './TopHeader';

const SEMINARY_CLASSES = [
  'Seminario - Antiguo Testamento',
  'Seminario - Nuevo Testamento',
  'Seminario - Libro de Mormón',
  'Seminario - Doctrina y Convenios',
  'Otra clase de Seminario',
];

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
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'instructors' | 'students'>('all');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editWard, setEditWard] = useState('');
  const [editClass, setEditClass] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleOpenEditProfile = (s: Student) => {
    setEditingStudent(s);
    setEditFirstName(s.firstName || s.name.split(' ')[0] || '');
    setEditLastName(s.lastName || s.name.split(' ').slice(1).join(' ') || '');
    setEditWard(s.ward || '');
    setEditClass(s.seminaryClass || 'Seminario - Antiguo Testamento');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!editFirstName.trim()) {
      alert('El nombre es obligatorio.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const updated = await updateStudentProfile(editingStudent.id, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        ward: editWard.trim(),
        seminaryClass: editClass.trim(),
      });

      setStudents((prev) =>
        prev.map((s) => (s.id === editingStudent.id ? updated : s))
      );

      if (currentStudent && currentStudent.id === editingStudent.id && onStudentUpdated) {
        onStudentUpdated();
      }

      setActionMessage(`¡Perfil de ${updated.name} actualizado con éxito!`);
      setTimeout(() => setActionMessage(null), 3000);
      setEditingStudent(null);
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err);
      alert(`Error al guardar: ${err.message || err}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

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

  const handleDeleteStudent = async (targetStudent: Student) => {
    const isTargetSuper = (targetStudent.email || '').toLowerCase().trim() === SUPERADMIN_EMAIL;
    if (isTargetSuper) {
      alert('La cuenta de Superadministrador (laconeo@gmail.com) no puede ser eliminada.');
      return;
    }

    if (currentStudent && currentStudent.id === targetStudent.id) {
      alert('No puedes eliminar tu propia cuenta desde este panel.');
      return;
    }

    const confirmMsg = `¿Eliminar permanentemente a este usuario?\n\n• Nombre: ${targetStudent.name}\n• Email: ${targetStudent.email}\n\n⚠️ Esta acción eliminará su registro, días completados, notas y cuenta. No se puede deshacer.`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setDeletingId(targetStudent.id);
    try {
      await deleteStudent(targetStudent.id);
      setStudents((prev) => prev.filter((s) => s.id !== targetStudent.id));
      setActionMessage(`Usuario "${targetStudent.name}" eliminado correctamente.`);
      setTimeout(() => setActionMessage(null), 3500);
      if (onStudentUpdated) onStudentUpdated();
    } catch (err: any) {
      console.error('Error al eliminar estudiante:', err);
      alert(`Error al eliminar: ${err?.message || 'Error desconocido'}`);
    } finally {
      setDeletingId(null);
    }
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
    if (selectedFilter === 'students') return !isUserInstructor(s);
    return true;
  });

  const instructorsCount = students.filter(isUserInstructor).length;
  const studentsOnlyCount = students.filter((s) => !isUserInstructor(s)).length;

  const FILTERS = [
    { id: 'all' as const, label: `Todos (${students.length})`, color: '#3c3c3c', bg: '#3c3c3c' },
    { id: 'instructors' as const, label: `Instructores (${instructorsCount})`, color: '#ff9600', bg: '#ff9600' },
    { id: 'students' as const, label: `Alumnos (${studentsOnlyCount})`, color: '#1cb0f6', bg: '#1cb0f6' },
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
      className="w-full h-full overflow-y-auto no-scrollbar bg-[#f7f7f7] animate-fadeIn flex flex-col"
      style={{ WebkitOverflowScrolling: 'touch' }}
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

          {(() => {
            // Calcular el día actual del desafío según el calendario
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const todayReading = READINGS_DATA.find((r) => r.calendarDate === todayStr);
            const challengeDay = todayReading?.day ?? '—';

            // Estadísticas dinámicas según búsqueda / filtro
            const isFiltered = searchQuery.trim().length > 0 || selectedFilter !== 'all';
            const totalAll = students.length;
            const totalFiltered = filteredStudents.length;

            const activeFiltered = filteredStudents.filter((s) => s.completedDays.length > 0).length;
            const inactiveFiltered = totalFiltered - activeFiltered;
            const pctActivos = totalFiltered > 0 ? Math.round((activeFiltered / totalFiltered) * 100) : 0;
            const pctNoIniciado = totalFiltered > 0 ? 100 - pctActivos : 0;

            const avgStreak = totalFiltered > 0
              ? Math.round((filteredStudents.reduce((acc, s) => acc + s.currentStreak, 0) / totalFiltered) * 10) / 10
              : 0;

            const goldCardsCount = filteredStudents.filter((s) => s.completedDays.length >= 30).length;

            // Donut SVG
            const r = 30;
            const circ = 2 * Math.PI * r;
            const activosArc = totalFiltered > 0 ? (activeFiltered / totalFiltered) * circ : 0;

            return (
              <>
                {/* ── Stats Row ── */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 8,
                    padding: '12px 14px',
                    background: '#f7f7f7',
                    borderBottom: '2px solid #e5e5e5',
                  }}
                >
                  <StatCard
                    icon={Users}
                    iconColor="#1cb0f6"
                    iconBg="#e8f7ff"
                    label={isFiltered ? 'Alumnos (Filtro)' : 'Alumnos'}
                    value={isFiltered ? `${totalFiltered} de ${totalAll}` : (stats?.totalStudents || totalAll)}
                  />
                  <StatCard
                    icon={Flame}
                    iconColor="#ff9600"
                    iconBg="#fff3e0"
                    label="Racha Prom."
                    value={`${isFiltered ? avgStreak : (stats?.averageStreak ?? avgStreak)}d`}
                  />
                  <StatCard
                    icon={Award}
                    iconColor="#ffc800"
                    iconBg="#fffbe0"
                    label="Carta Dorada"
                    value={isFiltered ? goldCardsCount : (stats?.completed30DaysCount ?? goldCardsCount)}
                  />
                  <StatCard
                    icon={TrendingUp}
                    iconColor="#58cc02"
                    iconBg="#e8f9d9"
                    label="Día Actual"
                    value={`${challengeDay}/30`}
                  />
                </div>

                {/* ── Search + Filter ── */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderBottom: '2px solid #e5e5e5',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
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

                {/* ── Toast ── */}
                {actionMessage && (
                  <div
                    className="animate-fadeIn"
                    style={{ background: '#58cc02', color: '#ffffff', fontWeight: 700, fontSize: 14, padding: '8px 20px', textAlign: 'center' }}
                  >
                    {actionMessage}
                  </div>
                )}

                {/* ── Participation Chart (Dinámico según búsqueda / barrio) ── */}
                {!loading && (
                  <div
                    style={{
                      padding: '12px 14px',
                      background: '#ffffff',
                      borderBottom: '2px solid #e5e5e5',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 15 }}>📊</span>
                        <p className="font-display font-bold" style={{ fontSize: 13, color: '#3c3c3c' }}>
                          {isFiltered ? (
                            <>
                              Participación: <span style={{ color: '#1cb0f6' }}>{searchQuery.trim() ? `«${searchQuery.trim()}»` : 'filtro'}</span>
                              <span style={{ color: '#777', fontWeight: 500, fontSize: 12 }}> ({totalFiltered} {totalFiltered === 1 ? 'alumno' : 'alumnos'})</span>
                            </>
                          ) : (
                            <>Participación del grupo <span style={{ color: '#777', fontWeight: 500, fontSize: 12 }}>({totalAll} alumnos)</span></>
                          )}
                        </p>
                      </div>

                      {isFiltered && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontSize: 11,
                              color: '#0284c7',
                              background: '#e0f2fe',
                              border: '1px solid #bae6fd',
                              borderRadius: 6,
                              padding: '2px 8px',
                              fontWeight: 700,
                            }}
                          >
                            Filtrado dinámico
                          </span>
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedFilter('all');
                            }}
                            style={{
                              fontSize: 11,
                              color: '#777',
                              background: '#f0f0f0',
                              border: 'none',
                              borderRadius: 6,
                              padding: '2px 8px',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                            title="Restablecer búsqueda"
                          >
                            Limpiar
                          </button>
                        </div>
                      )}
                    </div>

                    {totalFiltered === 0 ? (
                      <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: 12, border: '2px dashed #e5e5e5', textAlign: 'center', color: '#777', fontSize: 13 }}>
                        No se encontraron alumnos para <strong>«{searchQuery}»</strong>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* Donut chart */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <svg width="80" height="80" viewBox="0 0 80 80">
                            {/* fondo */}
                            <circle cx="40" cy="40" r={r} fill="none" stroke="#e5e5e5" strokeWidth="12" />
                            {/* activos (verde) */}
                            <circle
                              cx="40" cy="40" r={r}
                              fill="none"
                              stroke="#58cc02"
                              strokeWidth="12"
                              strokeDasharray={`${activosArc} ${circ - activosArc}`}
                              strokeDashoffset={circ / 4}
                              strokeLinecap="round"
                              style={{ transition: 'stroke-dasharray 0.5s ease' }}
                            />
                          </svg>
                          <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: '#3c3c3c', lineHeight: 1 }}>{pctActivos}%</span>
                            <span style={{ fontSize: 9, color: '#777', fontWeight: 700, textTransform: 'uppercase' }}>activos</span>
                          </div>
                        </div>

                        {/* Barras de detalle */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {/* Activos */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#58cc02' }}>
                                ✅ Avanzando ({activeFiltered})
                              </span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#46a302' }}>{pctActivos}%</span>
                            </div>
                            <div style={{ height: 8, background: '#e5e5e5', borderRadius: 100, overflow: 'hidden' }}>
                              <div style={{
                                height: '100%',
                                width: `${pctActivos}%`,
                                background: '#58cc02',
                                borderRadius: 100,
                                transition: 'width 0.5s ease',
                              }} />
                            </div>
                          </div>

                          {/* No iniciados */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#ff9600' }}>
                                ⏳ Sin reportar ({inactiveFiltered})
                              </span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#e08600' }}>{pctNoIniciado}%</span>
                            </div>
                            <div style={{ height: 8, background: '#e5e5e5', borderRadius: 100, overflow: 'hidden' }}>
                              <div style={{
                                height: '100%',
                                width: `${pctNoIniciado}%`,
                                background: '#ff9600',
                                borderRadius: 100,
                                transition: 'width 0.5s ease',
                              }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          })()}

        {/* ── Student Roster ── */}
        <div style={{ padding: '10px 12px 60px 12px', background: '#f7f7f7' }}>
          {loading ? (
            <div className="text-center py-12">
              <span className="text-4xl animate-spin inline-block mb-3">⏳</span>
              <p style={{ fontSize: 14, color: '#777777' }}>Cargando usuarios...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div
              className="rounded-2xl text-center"
              style={{ padding: '36px 20px', background: '#ffffff', border: '2px solid #e5e5e5' }}
            >
              <Users style={{ width: 44, height: 44, color: '#afafaf', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: '#3c3c3c' }}>
                {searchQuery || selectedFilter !== 'all'
                  ? 'No se encontraron usuarios con ese criterio de búsqueda'
                  : 'No hay más usuarios registrados aún'}
              </p>
              <p style={{ fontSize: 13, color: '#777777', marginTop: 6, maxWidth: 320, marginInline: 'auto' }}>
                {searchQuery || selectedFilter !== 'all'
                  ? 'Prueba borrando la búsqueda o cambiando el filtro seleccionado.'
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

                        <button
                          style={{ color: '#afafaf', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                          aria-label={isExpanded ? 'Contraer' : 'Expandir'}
                        >
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
                          background: '#f8fafc',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                        }}
                      >
                        {/* 1. 📍 Información del Barrio y Alumno */}
                        <div
                          className="rounded-2xl p-3.5"
                          style={{ background: '#ffffff', border: '2px solid #e5e5e5' }}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-100">
                            <span className="font-display font-bold text-xs uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                              <MapPin style={{ width: 14, height: 14, color: '#0369a1' }} />
                              Información del Barrio
                            </span>
                            <span
                              className="font-display font-bold text-[11px] rounded-full px-2.5 py-0.5"
                              style={{
                                background: isTargetSuper ? '#222222' : isTargetInstructor ? '#3c3c3c' : '#f0f0f0',
                                color: isTargetSuper ? '#ffc800' : isTargetInstructor ? '#ffc800' : '#555555',
                              }}
                            >
                              {isTargetSuper ? 'Superadministrador 👑' : isTargetInstructor ? 'Instructor 🛡️' : 'Alumno 📖'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Barrio / Rama</p>
                              <p className="font-bold text-slate-800 text-sm mt-0.5">
                                {student.ward || <span className="text-slate-400 font-normal italic">Sin barrio registrado</span>}
                              </p>
                            </div>

                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Clase de Seminario</p>
                              <p className="font-bold text-slate-800 text-sm mt-0.5 truncate">
                                {student.seminaryClass || 'Seminario - Antiguo Testamento'}
                              </p>
                            </div>

                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Correo Electrónico</p>
                              <p className="font-semibold text-slate-700 truncate mt-0.5">
                                {student.email}
                              </p>
                            </div>

                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Última Lectura Registrada</p>
                              <p className="font-semibold text-slate-700 mt-0.5">
                                {student.lastCompletedDate || 'Aún no ha completado lecturas'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 2. 🏆 Cartas Desbloqueadas */}
                        <div
                          className="rounded-2xl p-3.5"
                          style={{ background: '#ffffff', border: '2px solid #e5e5e5' }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-display font-bold text-xs uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                              <Award style={{ width: 15, height: 15, color: '#ffc800' }} />
                              Cartas Desbloqueadas ({student.unlockedBadgeIds.length})
                            </span>
                            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                              Premios y Patriarcas
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {Object.values(SPECIAL_BADGES).map((badge) => {
                              const won = student.unlockedBadgeIds.includes(badge.id);
                              return (
                                <div
                                  key={badge.id}
                                  className="font-bold flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs"
                                  style={{
                                    background: won
                                      ? (badge.tier === 'gold' ? '#fffbe0' : '#f5eeff')
                                      : '#f8fafc',
                                    border: `2px solid ${won ? (badge.tier === 'gold' ? '#ffc800' : '#a560f0') : '#e2e8f0'}`,
                                    color: won ? '#3c3c3c' : '#94a3b8',
                                  }}
                                >
                                  <span>{won ? '✓' : '🔒'}</span>
                                  <span>{badge.patriarch}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 3. 🔥 Días de Racha de Lectura */}
                        <div
                          className="rounded-2xl p-3.5"
                          style={{ background: '#ffffff', border: '2px solid #e5e5e5' }}
                        >
                          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 flex-wrap gap-2">
                            <span className="font-display font-bold text-xs uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                              <Flame style={{ width: 15, height: 15, color: '#ff9600' }} />
                              Días de Racha de Lectura
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-extrabold text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                                🔥 Racha: {student.currentStreak} días
                              </span>
                              <span className="font-display font-bold text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                                ⭐ Máx: {student.highestStreak}d
                              </span>
                              <span className="font-display font-bold text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                                📖 {student.completedDays.length}/30 días ({percent}%)
                              </span>
                            </div>
                          </div>

                          <div className="mb-2">
                            <p className="text-[11px] font-bold text-slate-500 mb-1.5">
                              Matriz de Lecturas (toca para marcar o desmarcar):
                            </p>
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
                                      height: 32,
                                      borderRadius: 8,
                                      fontSize: 12,
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

                          {/* Student notes */}
                          {student.notes && Object.keys(student.notes).length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100">
                              <p className="font-bold text-xs text-slate-600 mb-1.5">
                                Reflexiones del alumno ({Object.keys(student.notes).length}):
                              </p>
                              <div
                                className="no-scrollbar flex flex-col gap-1.5 max-h-28 overflow-y-auto"
                              >
                                {Object.entries(student.notes).map(([d, txt]) => (
                                  <div
                                    key={d}
                                    className="rounded-xl p-2 text-xs bg-slate-50 border border-slate-200"
                                  >
                                    <span className="font-bold text-purple-700">Día {d}: </span>
                                    <span className="text-slate-700 italic">«{txt}»</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 4. 🛠️ BOTONES DE ACCIÓN AL FINAL */}
                        <div
                          className="rounded-2xl p-3.5 flex flex-col gap-2 mt-1"
                          style={{ background: '#ffffff', border: '2px solid #e5e5e5' }}
                        >
                          <p className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider mb-0.5">
                            Acciones para {student.firstName || student.name.split(' ')[0]}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* 1. Recordatorio por WhatsApp */}
                            <button
                              id={`whatsapp-reminder-btn-${student.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInviteWhatsApp(student);
                              }}
                              className="w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl py-2.5 px-3 active:scale-95 transition-all text-xs"
                              style={{
                                background: '#25D366',
                                borderBottom: '3px solid #1aab52',
                                color: '#ffffff',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 17, height: 17, flexShrink: 0 }}>
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              <span>Recordatorio por WhatsApp</span>
                            </button>

                            {/* 2. Convertir en instructor */}
                            {!isTargetSuper && (
                              <button
                                id={`toggle-role-btn-${student.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleRole(student);
                                }}
                                className="w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl py-2.5 px-3 active:scale-95 transition-all text-xs"
                                style={{
                                  background: isTargetInstructor ? '#3c3c3c' : '#7e22ce',
                                  borderBottom: isTargetInstructor ? '3px solid #222222' : '3px solid #581c87',
                                  color: '#ffffff',
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                <Shield style={{ width: 16, height: 16, color: '#ffc800' }} />
                                <span>{isTargetInstructor ? 'Quitar Instructor (Hacer Alumno)' : 'Convertir en Instructor'}</span>
                              </button>
                            )}

                            {/* 3. Modificar perfil */}
                            <button
                              id={`edit-profile-btn-${student.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditProfile(student);
                              }}
                              className="w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl py-2.5 px-3 active:scale-95 transition-all text-xs"
                              style={{
                                background: '#1cb0f6',
                                borderBottom: '3px solid #1899d6',
                                color: '#ffffff',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <Edit2 style={{ width: 15, height: 15 }} />
                              <span>Modificar Perfil</span>
                            </button>

                            {/* 4. Borrar usuario */}
                            {!isTargetSuper && (
                              <button
                                id={`delete-user-btn-${student.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteStudent(student);
                                }}
                                disabled={deletingId === student.id}
                                className="w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl py-2.5 px-3 active:scale-95 transition-all text-xs"
                                style={{
                                  background: '#fff1f2',
                                  border: '2px solid #fecdd3',
                                  color: '#e11d48',
                                  cursor: deletingId === student.id ? 'wait' : 'pointer',
                                }}
                              >
                                <Trash2 style={{ width: 15, height: 15 }} />
                                <span>{deletingId === student.id ? 'Borrando...' : 'Borrar Usuario'}</span>
                              </button>
                            )}
                          </div>
                        </div>
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

        {/* ── Modal Flotante: Modificar Perfil de Alumno ── */}
        {editingStudent && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setEditingStudent(null)}
          >
            <div
              className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 animate-scaleUp"
              onClick={(e) => e.stopPropagation()}
              style={{ border: '3px solid #e5e5e5' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                    <Edit2 style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-800 text-base leading-tight">
                      Modificar Perfil
                    </h3>
                    <p className="text-xs text-slate-400 truncate max-w-[180px]">
                      {editingStudent.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingStudent(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  aria-label="Cerrar"
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    required
                    placeholder="Ej. Juan"
                    className="w-full px-3 py-2 rounded-xl text-sm border-2 border-slate-200 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Ej. Pérez"
                    className="w-full px-3 py-2 rounded-xl text-sm border-2 border-slate-200 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Barrio o Rama
                  </label>
                  <input
                    type="text"
                    value={editWard}
                    onChange={(e) => setEditWard(e.target.value)}
                    placeholder="Ej. Barrio Belgrano"
                    className="w-full px-3 py-2 rounded-xl text-sm border-2 border-slate-200 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Clase de Seminario
                  </label>
                  <select
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border-2 border-slate-200 focus:border-sky-500 outline-none bg-white"
                  >
                    {SEMINARY_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-1">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="flex-1 py-2.5 rounded-xl font-display font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex-1 py-2.5 rounded-xl font-display font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors text-sm shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Save style={{ width: 16, height: 16 }} />
                    <span>{isSavingProfile ? 'Guardando...' : 'Guardar'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
};
