import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  ChevronRight,
  Mail,
  Sparkles,
  UserCheck,
  ArrowLeft,
  MapPin,
  TrendingUp,
  Trash2,
  Edit2,
  Save,
  Crown,
  Check,
  Trophy,
} from 'lucide-react';
import { Student, InstructorStats, UserRole, SUPERADMIN_EMAIL, isUserInstructor, isUserSuperAdmin, SpecialBadge } from '../types';
import { fetchInstructorData, toggleStudentDay, updateStudentRole, deleteStudent, updateStudentProfile, toggleStudentSuperuser } from '../utils/api';
import { SPECIAL_BADGES, READINGS_DATA } from '../data/readings';
import { getUserInitials } from './TopHeader';
import { PrizeCardModal } from './PrizeCardModal';
import { InstructorRankingView } from './InstructorRankingView';
import { getStoredPrizeCards, fetchRemotePrizeCards } from '../utils/prizeCardsStorage';

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

  // Rol del usuario actual y su barrio asignado
  const isSuperAdmin = isUserSuperAdmin(currentStudent);
  const instructorWard = (currentStudent?.ward || '').trim();

  // Fechas y lectura del desafío correspondientes al día de hoy
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const todayReading = useMemo(() => {
    return READINGS_DATA.find((r) => r.calendarDate === todayStr) || READINGS_DATA[0];
  }, [todayStr]);

  const challengeDay = todayReading?.day ?? 1;

  // Determinar si un estudiante ha completado la lectura del día de hoy
  const isStudentDoneToday = (s: Student): boolean => {
    if (typeof challengeDay === 'number' && s.completedDays.includes(challengeDay)) {
      return true;
    }
    return Boolean(s.lastCompletedDate && s.lastCompletedDate === todayStr && s.completedDays.includes(challengeDay));
  };

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending_today' | 'completed_today' | 'instructors' | 'students'>('all');
  const [selectedStudentDetailId, setSelectedStudentDetailId] = useState<string | null>(null);
  const selectedStudentDetail = useMemo(
    () => students.find((s) => s.id === selectedStudentDetailId) || null,
    [students, selectedStudentDetailId]
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editWard, setEditWard] = useState('');
  const [panelTab, setPanelTab] = useState<'roster' | 'ranking'>('roster');
  const [activePrizeBadge, setActivePrizeBadge] = useState<SpecialBadge | null>(null);
  const [prizeCardsMap, setPrizeCardsMap] = useState<Record<number, string>>(() => getStoredPrizeCards());

  useEffect(() => {
    fetchRemotePrizeCards().then(setPrizeCardsMap);
  }, []);

  const handleOpenEditProfile = (s: Student) => {
    setEditingStudent(s);
    setEditFirstName(s.firstName || s.name.split(' ')[0] || '');
    setEditLastName(s.lastName || s.name.split(' ').slice(1).join(' ') || '');
    setEditWard(s.ward || '');
    setEditClass(s.seminaryClass || 'Seminario - Antiguo Testamento');
  };

  // Cerrar modales con la tecla Escape
  useEffect(() => {
    if (!selectedStudentDetailId && !editingStudent) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingStudent) {
          setEditingStudent(null);
        } else if (selectedStudentDetailId) {
          setSelectedStudentDetailId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStudentDetailId, editingStudent]);

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
      const isDoneNow = updated.completedDays.includes(day);
      setActionMessage(
        isDoneNow
          ? `✓ Día ${day} marcado como leído para ${updated.name}`
          : `Día ${day} desmarcado para ${updated.name}`
      );
      setTimeout(() => setActionMessage(null), 2500);
    } catch {
      alert('Error al actualizar el día');
    }
  };

  const handleToggleRole = async (targetStudent: Student) => {
    const isTargetSuper = isUserSuperAdmin(targetStudent);
    if (isTargetSuper) {
      alert('El rol de un Superadministrador no puede ser cambiado a alumno directamente. Primero revoca sus permisos de Superuser.');
      return;
    }

    const currentRole = targetStudent.role === 'instructor' ? 'instructor' : 'alumno';
    const nextRole: UserRole = currentRole === 'instructor' ? 'alumno' : 'instructor';
    const actionDesc = nextRole === 'instructor' ? 'promover a MAESTRO' : 'cambiar a rol ALUMNO';

    if (confirm(`¿Deseas ${actionDesc} a ${targetStudent.name} (${targetStudent.email})?`)) {
      try {
        await updateStudentRole(targetStudent.id, nextRole);
        setStudents((prev) =>
          prev.map((s) => (s.id === targetStudent.id ? { ...s, role: nextRole } : s))
        );
        setActionMessage(
          `Rol de ${targetStudent.name} cambiado a ${nextRole === 'instructor' ? 'Maestro 🛡️' : 'Alumno 📖'}`
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
    const isDone = isStudentDoneToday(s);
    let mensaje = '';
    if (!isDone) {
      mensaje = `📖 ¡Hola ${nombre}! Te escribo para recordarte la lectura de hoy en Seminario (Día ${challengeDay}${todayReading ? `: ${todayReading.character} - ${todayReading.scriptureRef}` : ''}). ¡Solo te tomará 3 minutos conectar con el Salvador hoy! 🔥👇\nhttps://laconeo.github.io/dlc/`;
    } else {
      const dias = s.completedDays.length;
      mensaje = `📖 ¡Hola ${nombre}! Vi que ya completaste la lectura de hoy en Seminario. ¡Llevas ${dias} ${dias === 1 ? 'día' : 'días'} completados! 🔥 Sigue así, fortaleciendo tu conexión con el Salvador. 👇\nhttps://laconeo.github.io/dlc/`;
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const handleToggleSuperuser = async (targetStudent: Student) => {
    if (!isSuperAdmin) {
      alert('Solo un Superuser tiene permisos para nombrar o revocar a otro Superuser.');
      return;
    }

    const cleanEmail = (targetStudent.email || '').toLowerCase().trim();
    if (cleanEmail === SUPERADMIN_EMAIL) {
      alert('El Superadministrador principal fundador (laconeo@gmail.com) no puede ser modificado.');
      return;
    }

    const willBeSuperuser = !isUserSuperAdmin(targetStudent);
    const confirmMsg = willBeSuperuser
      ? `👑 ¿Deseas convertir a ${targetStudent.name} (${targetStudent.email}) en SUPERUSER?\n\n• Tendrá acceso total a TODOS los barrios y alumnos de la estaca.\n• Podrá ver el selector global de barrios.\n• Podrá convertir a otros maestros en Superuser.`
      : `⚠️ ¿Deseas revocar los permisos de Superuser a ${targetStudent.name}?\n\n• Volverá a tener rol de Maestro regular y solo podrá ver a los alumnos de su propio barrio.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await toggleStudentSuperuser(targetStudent.id, targetStudent.email, willBeSuperuser);

      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === targetStudent.id) {
            return {
              ...s,
              isSuperuser: willBeSuperuser,
              role: willBeSuperuser ? 'instructor' : s.role,
            };
          }
          return s;
        })
      );

      setActionMessage(
        willBeSuperuser
          ? `¡${targetStudent.name} ahora es Superuser 👑!`
          : `Permisos de Superuser revocados para ${targetStudent.name}.`
      );
      setTimeout(() => setActionMessage(null), 3500);

      if (onStudentUpdated) onStudentUpdated();
    } catch (err: any) {
      console.error('Error al modificar permisos de superuser:', err);
      alert(`Error: ${err?.message || 'No se pudo actualizar el estado de superuser.'}`);
    }
  };

  const handleDeleteStudent = async (targetStudent: Student) => {
    const isTargetSuper = isUserSuperAdmin(targetStudent);
    if (isTargetSuper) {
      alert('Una cuenta con permisos de Superadministrador no puede ser eliminada desde aquí.');
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

  // Lista de todos los barrios únicos registrados en el sistema (ordenados alfabéticamente)
  const availableWards = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      const w = (s.ward || '').trim();
      if (w) set.add(w);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [students]);

  // Ámbito de estudiantes según el rol del usuario que consulta:
  // - Superadmin: puede ver todos o filtrar por un barrio específico con el selector
  // - Instructor común: ve única y exclusivamente los alumnos de su propio barrio
  const scopedStudents = useMemo(() => {
    if (isSuperAdmin) {
      if (selectedWard && selectedWard !== 'all') {
        return students.filter(
          (s) => (s.ward || '').trim().toLowerCase() === selectedWard.toLowerCase()
        );
      }
      return students;
    }

    // Para un instructor regular sin barrio configurado en su perfil
    if (!instructorWard) {
      return [];
    }

    // Para instructor regular: filtrado estricto por su barrio/rama
    return students.filter(
      (s) => (s.ward || '').trim().toLowerCase() === instructorWard.toLowerCase()
    );
  }, [students, isSuperAdmin, selectedWard, instructorWard]);

  const exportReport = () => {
    const wardLabel = isSuperAdmin
      ? (selectedWard === 'all' ? 'Todos los Barrios' : `Barrio: ${selectedWard}`)
      : `Barrio: ${instructorWard || 'Sin asignar'}`;

    const lines = [
      'REPORTE – «DETENTE, LEE, CONECTA»',
      `Fecha: ${new Date().toLocaleDateString('es-ES')}`,
      `Unidad: ${wardLabel}`,
      `Total: ${scopedStudents.length} usuarios`,
      '---',
      ...scopedStudents.map(
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

  const filteredStudents = scopedStudents.filter((s) => {
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
    if (selectedFilter === 'pending_today') return !isStudentDoneToday(s);
    if (selectedFilter === 'completed_today') return isStudentDoneToday(s);
    if (selectedFilter === 'instructors') return isUserInstructor(s);
    if (selectedFilter === 'students') return !isUserInstructor(s);
    return true;
  });

  const pendingTodayCount = scopedStudents.filter((s) => !isStudentDoneToday(s)).length;
  const completedTodayCount = scopedStudents.filter(isStudentDoneToday).length;
  const instructorsCount = scopedStudents.filter(isUserInstructor).length;
  const studentsOnlyCount = scopedStudents.filter((s) => !isUserInstructor(s)).length;

  const FILTERS = [
    { id: 'all' as const, label: `Todos (${scopedStudents.length})`, color: '#3c3c3c', bg: '#3c3c3c' },
    { id: 'pending_today' as const, label: `⏳ Pendientes Hoy (${pendingTodayCount})`, color: '#ea580c', bg: '#ea580c' },
    { id: 'completed_today' as const, label: `✅ Leyeron Hoy (${completedTodayCount})`, color: '#16a34a', bg: '#16a34a' },
    { id: 'students' as const, label: `Alumnos (${studentsOnlyCount})`, color: '#1cb0f6', bg: '#1cb0f6' },
    { id: 'instructors' as const, label: `Maestros (${instructorsCount})`, color: '#ff9600', bg: '#ff9600' },
  ];

  if (!isOpen) return null;

  if (!hasAccess) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-white animate-fadeIn text-center">
        <div className="w-16 h-16 rounded-full bg-[#ffeeee] border-2 border-[#ff4b4b] flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-[#ff4b4b]" />
        </div>
        <h3 className="font-display font-bold text-xl text-[#3c3c3c] mb-2">Acceso Restringido</h3>
        <p className="text-sm text-[#777777] mb-6">
          Esta sección es exclusiva para <strong>Maestros</strong>. Tu cuenta tiene rol de <strong>Alumno</strong>.
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
              Panel del Maestro
            </h2>
            <p style={{ fontSize: 12, color: '#afafaf' }}>
              Lecturas · Rachas · Cartas ganadas
            </p>
          </div>
        </div>

        {/* Badge superior derecho de rol y barrio */}
        <div className="flex items-center gap-2">
          {isSuperAdmin ? (
            <span
              className="font-display font-bold text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm"
              style={{ background: '#222222', color: '#ffc800', border: '1.5px solid #ffc800' }}
            >
              <span>👑</span>
              <span className="hidden sm:inline">Superadministrador</span>
              <span className="sm:hidden">Superadmin</span>
            </span>
          ) : (
            <span
              className="font-display font-bold text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 text-white shadow-sm"
              style={{
                background: instructorWard ? 'rgba(255,255,255,0.15)' : 'rgba(239,68,68,0.25)',
                border: `1.5px solid ${instructorWard ? 'rgba(255,255,255,0.3)' : 'rgba(239,68,68,0.5)'}`,
              }}
              title={instructorWard ? `Barrio asignado: ${instructorWard}` : 'Sin barrio asignado en tu perfil'}
            >
              <MapPin style={{ width: 13, height: 13, color: instructorWard ? '#ffc800' : '#f87171' }} />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {instructorWard || 'Sin Barrio'}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* ── Tabs del Panel del Maestro: Alumnos vs Ranking ── */}
      <div className="bg-[#2d2d2d] px-3 py-2 flex items-center justify-between border-b border-[#222] shrink-0 gap-2">
        <div className="flex items-center gap-1.5 bg-[#1e1e1e] p-1 rounded-xl border border-white/10">
          <button
            id="instructor-tab-roster"
            type="button"
            onClick={() => setPanelTab('roster')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-display font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              panelTab === 'roster'
                ? 'bg-[#ffc800] text-[#1e293b] shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Alumnos ({scopedStudents.length})</span>
          </button>

          <button
            id="instructor-tab-ranking"
            type="button"
            onClick={() => setPanelTab('ranking')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-display font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              panelTab === 'ranking'
                ? 'bg-[#ffc800] text-[#1e293b] shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Ranking y Barrios</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setActivePrizeBadge(SPECIAL_BADGES.abraham)}
          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>🏆</span>
          <span className="hidden sm:inline">Cartas Premio</span>
        </button>
      </div>

      {panelTab === 'ranking' ? (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <InstructorRankingView
            students={scopedStudents}
            isSuperAdmin={isSuperAdmin}
            instructorWard={instructorWard}
            onSelectStudent={(s) => setSelectedStudentDetailId(s.id)}
          />
        </div>
      ) : (
        <>
          {(() => {
            // Calcular el día actual del desafío según el calendario
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const todayReading = READINGS_DATA.find((r) => r.calendarDate === todayStr);
            const challengeDay = todayReading?.day ?? '—';

            // Estadísticas dinámicas según barrio / búsqueda / filtro
            const isFiltered = searchQuery.trim().length > 0 || selectedFilter !== 'all' || (isSuperAdmin && selectedWard !== 'all');
            const totalAll = scopedStudents.length;
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
                {/* ── Aviso amigable si el Instructor no tiene Barrio asignado ── */}
                {!isSuperAdmin && !instructorWard && (
                  <div
                    className="mx-3.5 my-3 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn"
                    style={{ background: '#fffbeb', border: '2px solid #fde68a' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#fef3c7' }}>
                        <MapPin style={{ width: 22, height: 22, color: '#d97706' }} />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm" style={{ color: '#92400e' }}>
                          No tienes un Barrio o Rama asignado
                        </h4>
                        <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>
                          Para visualizar exclusivamente a los alumnos de tu unidad, asigna tu Barrio en tu perfil.
                        </p>
                      </div>
                    </div>
                    {currentStudent && (
                      <button
                        onClick={() => handleOpenEditProfile(currentStudent)}
                        className="font-display font-bold text-xs px-4 py-2 rounded-xl transition-transform active:scale-95 shrink-0"
                        style={{ background: '#ffc800', color: '#3c3c3c', border: '2px solid #e5a000' }}
                      >
                        Asignar mi Barrio
                      </button>
                    )}
                  </div>
                )}

                {/* ── Banner de Control del Día de Hoy ── */}
                <div
                  className="mx-3.5 mt-3 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fadeIn"
                  style={{
                    background: '#ffffff',
                    border: '2px solid #e5e5e5',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        background: pendingTodayCount > 0 ? '#fff7ed' : '#f0fdf4',
                        border: `2px solid ${pendingTodayCount > 0 ? '#fed7aa' : '#bbf7d0'}`,
                      }}
                    >
                      <Clock style={{ width: 22, height: 22, color: pendingTodayCount > 0 ? '#ea580c' : '#16a34a' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-bold text-sm text-[#3c3c3c]">
                          Lectura de Hoy: Día {challengeDay} {todayReading ? `· ${todayReading.character}` : ''}
                        </h4>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f0f0f0] text-[#777777]">
                          {todayReading?.dateStr || 'Hoy'}
                        </span>
                      </div>
                      <p className="text-xs text-[#777777] mt-0.5">
                        {pendingTodayCount === 0 ? (
                          <span className="text-[#16a34a] font-bold">🎉 ¡Todos los alumnos completaron el desafío de hoy!</span>
                        ) : (
                          <>
                            Hay <strong className="text-[#ea580c]">{pendingTodayCount} {pendingTodayCount === 1 ? 'alumno pendiente' : 'alumnos pendientes'}</strong> de reportar hoy ({completedTodayCount} ya completaron).
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={() => setActivePrizeBadge(SPECIAL_BADGES.abraham)}
                      className="font-display font-bold text-xs px-3.5 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-xs"
                      style={{
                        background: '#fefce8',
                        color: '#854d0e',
                        border: '1.5px solid #fde047',
                        cursor: 'pointer',
                      }}
                      title="Subir o gestionar las cartas premio de las 4 semanas"
                    >
                      <span>🏆</span>
                      <span>Cartas Premio</span>
                    </button>
                    <button
                      onClick={() => setSelectedFilter(selectedFilter === 'pending_today' ? 'all' : 'pending_today')}
                      className="font-display font-bold text-xs px-3.5 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-xs"
                      style={{
                        background: selectedFilter === 'pending_today' ? '#ea580c' : '#fff7ed',
                        color: selectedFilter === 'pending_today' ? '#ffffff' : '#c2410c',
                        border: '1.5px solid #fdba74',
                        cursor: 'pointer',
                      }}
                    >
                      <span>⏳</span>
                      <span>{selectedFilter === 'pending_today' ? 'Ver Todos' : `Ver ${pendingTodayCount} Pendientes`}</span>
                    </button>
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
                  }}
                >
                  <StatCard
                    icon={Users}
                    iconColor="#1cb0f6"
                    iconBg="#e8f7ff"
                    label={isFiltered ? 'Alumnos (Filtro)' : 'Alumnos'}
                    value={isFiltered ? `${totalFiltered} de ${totalAll}` : totalAll}
                  />
                  <StatCard
                    icon={Clock}
                    iconColor="#ea580c"
                    iconBg="#fff7ed"
                    label="Pendientes Hoy"
                    value={pendingTodayCount}
                  />
                  <StatCard
                    icon={CheckCircle}
                    iconColor="#16a34a"
                    iconBg="#f0fdf4"
                    label="Leyeron Hoy"
                    value={completedTodayCount}
                  />
                  <StatCard
                    icon={TrendingUp}
                    iconColor="#58cc02"
                    iconBg="#e8f9d9"
                    label="Día Actual"
                    value={`Día ${challengeDay}/30`}
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
                  {/* Selector de Barrio para el Superadministrador */}
                  {isSuperAdmin && (
                    <div
                      className="flex items-center gap-2 p-2.5 rounded-2xl"
                      style={{ background: '#f0f9ff', border: '2px solid #bae6fd' }}
                    >
                      <MapPin style={{ width: 16, height: 16, color: '#0284c7', flexShrink: 0 }} />
                      <span className="text-xs font-bold text-[#0369a1] whitespace-nowrap">
                        Filtrar por Barrio:
                      </span>
                      <select
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        className="text-xs font-bold rounded-xl px-2.5 py-1.5 text-[#0369a1] outline-none flex-1 font-display cursor-pointer"
                        style={{ background: '#ffffff', border: '1.5px solid #7dd3fc' }}
                      >
                        <option value="all">🌐 Todos los Barrios ({students.length})</option>
                        {availableWards.map((w) => {
                          const count = students.filter(
                            (s) => (s.ward || '').trim().toLowerCase() === w.toLowerCase()
                          ).length;
                          return (
                            <option key={w} value={w}>
                              📍 {w} ({count})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

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
                          {/* Hoy: Pendientes vs Leyeron */}
                          <div className="pb-2 border-b border-slate-100">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#ea580c' }}>
                                ⏳ Pendientes hoy: {pendingTodayCount}
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>
                                ✅ Leyeron hoy: {completedTodayCount}
                              </span>
                            </div>
                            <div style={{ height: 8, background: '#fed7aa', borderRadius: 100, overflow: 'hidden', display: 'flex' }}>
                              <div style={{
                                height: '100%',
                                width: `${totalAll > 0 ? (completedTodayCount / totalAll) * 100 : 0}%`,
                                background: '#16a34a',
                                transition: 'width 0.5s ease',
                              }} />
                            </div>
                          </div>

                          {/* General: Activos */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#58cc02' }}>
                                🚀 Con lecturas acumuladas ({activeFiltered})
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#46a302' }}>{pctActivos}%</span>
                            </div>
                            <div style={{ height: 6, background: '#e5e5e5', borderRadius: 100, overflow: 'hidden' }}>
                              <div style={{
                                height: '100%',
                                width: `${pctActivos}%`,
                                background: '#58cc02',
                                borderRadius: 100,
                                transition: 'width 0.5s ease',
                              }} />
                            </div>
                          </div>

                          {/* General: Sin iniciar */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#777777' }}>
                                ⚪ Sin iniciar aún ({inactiveFiltered})
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#777777' }}>{pctNoIniciado}%</span>
                            </div>
                            <div style={{ height: 6, background: '#e5e5e5', borderRadius: 100, overflow: 'hidden' }}>
                              <div style={{
                                height: '100%',
                                width: `${pctNoIniciado}%`,
                                background: '#94a3b8',
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
            (() => {
              const getEmptyDetails = () => {
                if (selectedFilter === 'pending_today') {
                  return {
                    title: '🎉 ¡Ningún alumno pendiente hoy!',
                    desc: `Todos los alumnos de ${instructorWard || 'tu unidad'} han completado la lectura del Día ${challengeDay}.`,
                  };
                }
                if (selectedFilter === 'completed_today') {
                  return {
                    title: 'Aún no hay lecturas reportadas hoy',
                    desc: `Ningún alumno ha marcado la lectura del Día ${challengeDay} todavía hoy.`,
                  };
                }
                if (searchQuery || selectedFilter !== 'all') {
                  return {
                    title: 'No se encontraron usuarios con ese criterio de búsqueda',
                    desc: 'Prueba borrando la búsqueda o cambiando el filtro seleccionado.',
                  };
                }
                if (!isSuperAdmin && !instructorWard) {
                  return {
                    title: 'Aún no tienes un Barrio asignado en tu perfil',
                    desc: 'Haz clic en "Asignar mi Barrio" arriba para comenzar a ver a los alumnos de tu unidad.',
                  };
                }
                if (!isSuperAdmin && instructorWard) {
                  return {
                    title: `No hay alumnos registrados en ${instructorWard} aún`,
                    desc: `Cuando los alumnos del barrio ${instructorWard} se registren en la app, aparecerán automáticamente en tu panel.`,
                  };
                }
                if (isSuperAdmin && selectedWard !== 'all') {
                  return {
                    title: `No hay alumnos registrados en el barrio "${selectedWard}"`,
                    desc: 'Prueba seleccionando otro barrio o la opción de "Todos los Barrios".',
                  };
                }
                return {
                  title: 'No hay más usuarios registrados aún',
                  desc: 'Tu panel está limpio. Cuando los alumnos reales se registren con su cuenta, aparecerán automáticamente en esta lista.',
                };
              };
              const details = getEmptyDetails();
              return (
                <div
                  className="rounded-2xl text-center"
                  style={{ padding: '36px 20px', background: '#ffffff', border: '2px solid #e5e5e5' }}
                >
                  <Users style={{ width: 44, height: 44, color: '#afafaf', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#3c3c3c' }}>
                    {details.title}
                  </p>
                  <p style={{ fontSize: 13, color: '#777777', marginTop: 6, maxWidth: 360, marginInline: 'auto' }}>
                    {details.desc}
                  </p>
                </div>
              );
            })()
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredStudents.map((student) => {
                const percent = Math.round((student.completedDays.length / 30) * 100);
                const isTargetSuper = isUserSuperAdmin(student);
                const isTargetInstructor = isUserInstructor(student);
                const initials = getUserInitials(student);

                return (
                  <div
                    key={student.id}
                    className="rounded-2xl overflow-hidden hover:border-sky-300 transition-colors"
                    style={{ background: '#ffffff', border: '2px solid #e5e5e5' }}
                  >
                    {/* Row summary — compact single-row feel */}
                    <div
                      onClick={() => setSelectedStudentDetailId(student.id)}
                      className="flex items-center gap-2.5 cursor-pointer"
                      style={{ padding: '10px 12px' }}
                      title="Haz clic para ver detalles y gestionar al alumno"
                    >
                      {/* Avatar with 2 initials */}
                      <div
                        className="font-display font-bold text-white flex items-center justify-center shrink-0"
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: isTargetInstructor ? '#3c3c3c' : '#1cb0f6',
                          color: isTargetInstructor ? '#ffc800' : '#ffffff',
                          border: isTargetInstructor ? '2px solid #ffc800' : 'none',
                          fontSize: 13,
                          letterSpacing: '0.5px',
                        }}
                      >
                        {initials}
                      </div>

                      {/* Name + info */}
                      <div className="flex-1 min-w-0">
                        {/* Línea 1: Nombre + edit + rol */}
                        <div className="flex items-center gap-1 flex-wrap">
                          <h4
                            className="font-display font-bold truncate"
                            style={{ fontSize: 14, color: '#3c3c3c', maxWidth: '55%' }}
                          >
                            {student.name}
                          </h4>
                          {student.completedDays.length >= 30 && (
                            <span title="Completó el desafío" style={{ fontSize: 12 }}>👑</span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditProfile(student);
                            }}
                            className="p-0.5 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                            title={`Editar perfil de ${student.name}`}
                          >
                            <Edit2 style={{ width: 11, height: 11 }} />
                          </button>

                          {/* Role badge */}
                          {isTargetSuper ? (
                            <span
                              className="font-display font-bold rounded-full px-1.5 py-px inline-flex items-center gap-0.5"
                              style={{ fontSize: 9, background: '#222222', color: '#ffc800', border: '1px solid #ffc800' }}
                            >
                              Superadmin
                            </span>
                          ) : isTargetInstructor ? (
                            <span
                              className="font-display font-bold rounded-full px-1.5 py-px inline-flex items-center gap-0.5"
                              style={{ fontSize: 9, background: '#3c3c3c', color: '#ffc800' }}
                            >
                              <Shield style={{ width: 9, height: 9 }} />
                              Maestro
                            </span>
                          ) : null}
                        </div>

                        {/* Línea 2: Email + barrio + indicador HOY */}
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <p
                            className="truncate flex items-center gap-1"
                            style={{ fontSize: 11, color: '#999999', maxWidth: '45%' }}
                          >
                            <Mail style={{ width: 10, height: 10, flexShrink: 0 }} />
                            {student.email}
                          </p>

                          {student.ward && (
                            <span
                              className="inline-flex items-center gap-0.5 font-semibold rounded-md px-1 py-px"
                              style={{ fontSize: 10, background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}
                              title={`Barrio/Rama: ${student.ward}`}
                            >
                              <MapPin style={{ width: 9, height: 9 }} />
                              <span className="truncate max-w-[90px]">{student.ward}</span>
                            </span>
                          )}

                          {/* Indicador de estado de HOY (solo visual) */}
                          {isStudentDoneToday(student) ? (
                            <span
                              className="inline-flex items-center gap-0.5 font-bold rounded-full px-1.5 py-px text-[9px] shrink-0"
                              style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
                              title={`Completó la lectura de hoy (Día ${challengeDay})`}
                            >
                              <CheckCircle style={{ width: 9, height: 9 }} />
                              Hoy ✓
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-0.5 font-bold rounded-full px-1.5 py-px text-[9px] shrink-0"
                              style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}
                              title={`Aún no ha leído hoy (Día ${challengeDay})`}
                            >
                              <Clock style={{ width: 9, height: 9 }} />
                              Pendiente
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right side: Streak + chevron */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div
                          className="font-display font-bold flex items-center gap-0.5 rounded-lg px-1.5"
                          style={{ height: 26, background: '#fff3e0', border: '2px solid #ff9600', color: '#ff9600', fontSize: 12 }}
                        >
                          <span>🔥</span>
                          <span>{student.currentStreak}d</span>
                        </div>

                        <div className="text-right hidden sm:block">
                          <span className="font-display font-bold" style={{ fontSize: 12, color: '#3c3c3c' }}>
                            {student.completedDays.length}/30
                          </span>
                          <div
                            className="rounded-full overflow-hidden mt-0.5"
                            style={{ width: 50, height: 6, background: '#e5e5e5' }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${Math.min(100, percent)}%`, background: '#58cc02' }}
                            />
                          </div>
                        </div>

                        <div
                          style={{ color: '#afafaf', display: 'flex', alignItems: 'center' }}
                          title="Ver detalles del alumno"
                        >
                          <ChevronRight style={{ width: 18, height: 18 }} />
                        </div>
                      </div>
                    </div>
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
        </>
      )}

        {/* ── Modal Flotante: Detalles Completos del Alumno (Portal al body) ── */}
        {selectedStudentDetail && typeof document !== 'undefined' && createPortal(
          <div
            className="fixed inset-0 z-[9990] bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
            onClick={() => setSelectedStudentDetailId(null)}
          >
            <div
              className="w-full max-w-lg bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 animate-scaleUp max-h-[90vh] overflow-y-auto no-scrollbar relative"
              onClick={(e) => e.stopPropagation()}
              style={{ border: '3px solid #e5e5e5' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="font-display font-bold text-white flex items-center justify-center shrink-0"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: isUserInstructor(selectedStudentDetail) ? '#3c3c3c' : '#1cb0f6',
                      color: isUserInstructor(selectedStudentDetail) ? '#ffc800' : '#ffffff',
                      border: isUserInstructor(selectedStudentDetail) ? '2px solid #ffc800' : 'none',
                      fontSize: 15,
                    }}
                  >
                    {getUserInitials(selectedStudentDetail)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-display font-bold text-slate-800 text-lg leading-tight truncate">
                        {selectedStudentDetail.name}
                      </h3>
                      {selectedStudentDetail.completedDays.length >= 30 && (
                        <span title="Completó el desafío">👑</span>
                      )}
                      {isUserSuperAdmin(selectedStudentDetail) ? (
                        <span className="font-display font-bold text-[10px] bg-[#222222] text-[#ffc800] border border-[#ffc800] rounded-full px-2 py-0.5">
                          Superadmin
                        </span>
                      ) : isUserInstructor(selectedStudentDetail) ? (
                        <span className="font-display font-bold text-[10px] bg-[#3c3c3c] text-[#ffc800] rounded-full px-2 py-0.5 flex items-center gap-1">
                          <Shield style={{ width: 10, height: 10 }} />
                          Maestro
                        </span>
                      ) : (
                        <span className="font-display font-bold text-[10px] bg-[#f0f0f0] text-[#777777] rounded-full px-2 py-0.5">
                          Alumno
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {selectedStudentDetail.email}
                      {selectedStudentDetail.ward ? ` · ${selectedStudentDetail.ward}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStudentDetailId(null)}
                  className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                  aria-label="Cerrar detalles"
                >
                  <X style={{ width: 18, height: 18 }} />
                </button>
              </div>

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
                      background: isUserSuperAdmin(selectedStudentDetail)
                        ? '#222222'
                        : isUserInstructor(selectedStudentDetail)
                        ? '#3c3c3c'
                        : '#f0f0f0',
                      color: isUserSuperAdmin(selectedStudentDetail)
                        ? '#ffc800'
                        : isUserInstructor(selectedStudentDetail)
                        ? '#ffc800'
                        : '#555555',
                    }}
                  >
                    {isUserSuperAdmin(selectedStudentDetail)
                      ? 'Superadministrador 👑'
                      : isUserInstructor(selectedStudentDetail)
                      ? 'Maestro 🛡️'
                      : 'Alumno 📖'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Barrio / Rama</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {selectedStudentDetail.ward || <span className="text-slate-400 font-normal italic">Sin barrio registrado</span>}
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Clase de Seminario</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5 truncate">
                      {selectedStudentDetail.seminaryClass || 'Seminario - Antiguo Testamento'}
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Correo Electrónico</p>
                    <p className="font-semibold text-slate-700 truncate mt-0.5">
                      {selectedStudentDetail.email}
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Última Lectura Registrada</p>
                    <p className="font-semibold text-slate-700 mt-0.5">
                      {selectedStudentDetail.lastCompletedDate || 'Aún no ha completado lecturas'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. 📖 Asistencia y Lectura de Hoy en Clase */}
              <div
                className="p-3.5 rounded-2xl flex items-center justify-between gap-3"
                style={{
                  background: isStudentDoneToday(selectedStudentDetail) ? '#f0fdf4' : '#eff6ff',
                  border: `2px solid ${isStudentDoneToday(selectedStudentDetail) ? '#86efac' : '#93c5fd'}`,
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-xs text-[#3c3c3c]">
                    Lectura de Hoy (Día {challengeDay}{todayReading ? `: ${todayReading.character}` : ''})
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isStudentDoneToday(selectedStudentDetail)
                      ? '✓ Marcado como leído (alumno o maestro en clase).'
                      : '¿El alumno leyó en clase o en papel sin celular? Márcalo aquí:'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof challengeDay === 'number') {
                      handleToggleDayForStudent(selectedStudentDetail.id, challengeDay);
                    }
                  }}
                  className="font-display font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  style={{
                    background: isStudentDoneToday(selectedStudentDetail) ? '#dcfce7' : '#1cb0f6',
                    color: isStudentDoneToday(selectedStudentDetail) ? '#15803d' : '#ffffff',
                    border: `2px solid ${isStudentDoneToday(selectedStudentDetail) ? '#86efac' : '#1899d6'}`,
                  }}
                >
                  {isStudentDoneToday(selectedStudentDetail) ? (
                    <>
                      <CheckCircle style={{ width: 15, height: 15 }} />
                      <span>Leído ✓ (Desmarcar)</span>
                    </>
                  ) : (
                    <>
                      <Check style={{ width: 15, height: 15 }} strokeWidth={3} />
                      <span>Marcar Leído en Clase</span>
                    </>
                  )}
                </button>
              </div>

              {/* 3. 🔥 Días de Racha y Matriz de Lectura */}
              <div
                className="rounded-2xl p-3.5"
                style={{ background: '#ffffff', border: '2px solid #e5e5e5' }}
              >
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 flex-wrap gap-2">
                  <span className="font-display font-bold text-xs uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Flame style={{ width: 15, height: 15, color: '#ff9600' }} />
                    Progreso y Racha
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                      🔥 Racha: {selectedStudentDetail.currentStreak} días
                    </span>
                    <span className="font-display font-bold text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                      ⭐ Máx: {selectedStudentDetail.highestStreak}d
                    </span>
                    <span className="font-display font-bold text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                      📖 {selectedStudentDetail.completedDays.length}/30 días ({Math.round((selectedStudentDetail.completedDays.length / 30) * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="mb-2">
                  <p className="text-[11px] font-bold text-slate-500 mb-1.5">
                    Matriz de Lecturas (toca cualquier día para marcar o desmarcar si leyó en papel):
                  </p>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: 5,
                    }}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                      const done = selectedStudentDetail.completedDays.includes(day);
                      const isTodayDay = day === challengeDay;
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleDayForStudent(selectedStudentDetail.id, day)}
                          title={`Día ${day}${isTodayDay ? ' (HOY)' : ''}: ${done ? 'Completado' : 'Pendiente'}`}
                          className="font-display font-bold flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                          style={{
                            height: 34,
                            borderRadius: 8,
                            fontSize: 12,
                            border: isTodayDay ? '2px solid #ffc800' : 'none',
                            background: done ? '#58cc02' : '#e5e5e5',
                            color: done ? '#ffffff' : '#777777',
                            boxShadow: isTodayDay ? '0 0 0 2px rgba(255,200,0,0.4)' : 'none',
                          }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Student notes */}
                {selectedStudentDetail.notes && Object.keys(selectedStudentDetail.notes).length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100">
                    <p className="font-bold text-xs text-slate-600 mb-1.5">
                      Reflexiones del alumno ({Object.keys(selectedStudentDetail.notes).length}):
                    </p>
                    <div className="no-scrollbar flex flex-col gap-1.5 max-h-28 overflow-y-auto">
                      {Object.entries(selectedStudentDetail.notes).map(([d, txt]) => (
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

              {/* 4. 🏆 Cartas Desbloqueadas */}
              <div
                className="rounded-2xl p-3.5"
                style={{ background: '#ffffff', border: '2px solid #e5e5e5' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-xs uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Award style={{ width: 15, height: 15, color: '#ffc800' }} />
                    Cartas Desbloqueadas ({selectedStudentDetail.unlockedBadgeIds.length})
                  </span>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Premios y Patriarcas
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.values(SPECIAL_BADGES).map((badge) => {
                    const won = selectedStudentDetail.unlockedBadgeIds.includes(badge.id);
                    return (
                      <button
                        key={badge.id}
                        type="button"
                        onClick={() => setActivePrizeBadge(badge)}
                        className="font-bold flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs active:scale-95 transition-all cursor-pointer"
                        style={{
                          background: won
                            ? (badge.tier === 'gold' ? '#fffbe0' : '#f5eeff')
                            : '#f8fafc',
                          border: `2px solid ${won ? (badge.tier === 'gold' ? '#ffc800' : '#a560f0') : '#e2e8f0'}`,
                          color: won ? '#3c3c3c' : '#94a3b8',
                        }}
                        title={`Toca para ver o gestionar la Carta Premio de ${badge.patriarch}`}
                      >
                        <span>{won ? '✓' : '🔒'}</span>
                        <span>{badge.patriarch}</span>
                        <span className="text-[10px] text-blue-500">👁️</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. 🛠️ BOTONES DE ACCIÓN */}
              <div
                className="rounded-2xl p-3.5 flex flex-col gap-2"
                style={{ background: '#ffffff', border: '2px solid #e5e5e5' }}
              >
                <p className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider mb-0.5">
                  Acciones para {selectedStudentDetail.firstName || selectedStudentDetail.name.split(' ')[0]}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Recordatorio WhatsApp */}
                  <button
                    id={`whatsapp-reminder-btn-${selectedStudentDetail.id}`}
                    onClick={() => handleInviteWhatsApp(selectedStudentDetail)}
                    className="w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl py-2.5 px-3 active:scale-95 transition-all text-xs cursor-pointer shadow-xs"
                    style={{
                      background: '#25D366',
                      borderBottom: '3px solid #1aab52',
                      color: '#ffffff',
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 17, height: 17, flexShrink: 0 }}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>Recordatorio por WhatsApp</span>
                  </button>

                  {/* Modificar perfil */}
                  <button
                    id={`edit-profile-btn-${selectedStudentDetail.id}`}
                    onClick={() => handleOpenEditProfile(selectedStudentDetail)}
                    className="w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl py-2.5 px-3 active:scale-95 transition-all text-xs cursor-pointer shadow-xs"
                    style={{
                      background: '#1cb0f6',
                      borderBottom: '3px solid #1899d6',
                      color: '#ffffff',
                    }}
                  >
                    <Edit2 style={{ width: 15, height: 15 }} />
                    <span>Modificar Perfil</span>
                  </button>

                  {/* Convertir en instructor */}
                  {!isUserSuperAdmin(selectedStudentDetail) && (
                    <button
                      id={`toggle-role-btn-${selectedStudentDetail.id}`}
                      onClick={() => handleToggleRole(selectedStudentDetail)}
                      className="w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl py-2.5 px-3 active:scale-95 transition-all text-xs cursor-pointer shadow-xs"
                      style={{
                        background: isUserInstructor(selectedStudentDetail) ? '#3c3c3c' : '#7e22ce',
                        borderBottom: isUserInstructor(selectedStudentDetail) ? '3px solid #222222' : '3px solid #581c87',
                        color: '#ffffff',
                      }}
                    >
                      <Shield style={{ width: 16, height: 16, color: '#ffc800' }} />
                      <span>{isUserInstructor(selectedStudentDetail) ? 'Quitar Maestro (Hacer Alumno)' : 'Convertir en Maestro'}</span>
                    </button>
                  )}

                  {/* Borrar usuario */}
                  {!isUserSuperAdmin(selectedStudentDetail) && (
                    <button
                      id={`delete-user-btn-${selectedStudentDetail.id}`}
                      onClick={() => {
                        const s = selectedStudentDetail;
                        setSelectedStudentDetailId(null);
                        handleDeleteStudent(s);
                      }}
                      disabled={deletingId === selectedStudentDetail.id}
                      className="w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl py-2.5 px-3 active:scale-95 transition-all text-xs cursor-pointer shadow-xs"
                      style={{
                        background: '#fff1f2',
                        border: '2px solid #fecdd3',
                        color: '#e11d48',
                      }}
                    >
                      <Trash2 style={{ width: 15, height: 15 }} />
                      <span>{deletingId === selectedStudentDetail.id ? 'Borrando...' : 'Borrar Usuario'}</span>
                    </button>
                  )}

                  {/* Superuser */}
                  {isSuperAdmin && isUserInstructor(selectedStudentDetail) && (
                    <button
                      id={`toggle-superuser-btn-${selectedStudentDetail.id}`}
                      onClick={() => handleToggleSuperuser(selectedStudentDetail)}
                      className="w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl py-2.5 px-3 active:scale-95 transition-all text-xs col-span-1 sm:col-span-2 cursor-pointer shadow-xs"
                      style={{
                        background: isUserSuperAdmin(selectedStudentDetail) ? '#222222' : '#ffc800',
                        borderBottom: isUserSuperAdmin(selectedStudentDetail) ? '3px solid #000000' : '3px solid #d99b00',
                        color: isUserSuperAdmin(selectedStudentDetail) ? '#ffc800' : '#222222',
                        border: isUserSuperAdmin(selectedStudentDetail) ? '1.5px solid #ffc800' : 'none',
                      }}
                      disabled={(selectedStudentDetail.email || '').toLowerCase().trim() === SUPERADMIN_EMAIL}
                    >
                      <Crown style={{ width: 16, height: 16, color: isUserSuperAdmin(selectedStudentDetail) ? '#ffc800' : '#222222' }} />
                      <span>
                        {isUserSuperAdmin(selectedStudentDetail)
                          ? (selectedStudentDetail.email || '').toLowerCase().trim() === SUPERADMIN_EMAIL
                            ? 'Superadmin Principal 👑'
                            : 'Quitar Superuser (Volver a Maestro regular)'
                          : '👑 Convertir a Maestro en Superuser'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Cerrar modal button */}
              <button
                type="button"
                onClick={() => setSelectedStudentDetailId(null)}
                className="w-full py-3 rounded-2xl font-display font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-sm cursor-pointer mt-1"
              >
                Cerrar
              </button>
            </div>
          </div>,
          document.body
        )}

        {/* ── Modal Flotante: Modificar Perfil de Alumno (Portal al body para máxima visibilidad al frente) ── */}
        {editingStudent && typeof document !== 'undefined' && createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setEditingStudent(null)}
          >
            <div
              className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 animate-scaleUp relative"
              onClick={(e) => e.stopPropagation()}
              style={{ border: '3px solid #e5e5e5' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
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
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
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
                    className="flex-1 py-2.5 rounded-xl font-display font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex-1 py-2.5 rounded-xl font-display font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save style={{ width: 16, height: 16 }} />
                    <span>{isSavingProfile ? 'Guardando...' : 'Guardar'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* ── Modal de Carta Premio para el Instructor ── */}
        {activePrizeBadge && (
          <PrizeCardModal
            isOpen={Boolean(activePrizeBadge)}
            onClose={() => setActivePrizeBadge(null)}
            badge={activePrizeBadge}
            student={currentStudent || null}
            prizeCardsMap={prizeCardsMap}
            onCardUpdated={(week, img) => setPrizeCardsMap((prev) => ({ ...prev, [week]: img }))}
            onCardDeleted={(week) =>
              setPrizeCardsMap((prev) => {
                const n = { ...prev };
                delete n[week];
                return n;
              })
            }
          />
        )}
      </div>
  );
};
