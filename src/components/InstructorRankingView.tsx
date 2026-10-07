import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Flame,
  Calendar,
  MapPin,
  TrendingUp,
  Users,
  Search,
  CheckCircle2,
  ChevronRight,
  Filter,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { Student } from '../types';
import { READINGS_DATA } from '../data/readings';
import { getUserInitials } from './TopHeader';

interface InstructorRankingViewProps {
  students: Student[];
  isSuperAdmin: boolean;
  instructorWard: string;
  onSelectStudent?: (student: Student) => void;
}

type WeekOption = 'all' | 1 | 2 | 3 | 4;
type RankingSubTab = 'students' | 'wards' | 'daily_matrix';

const WEEKS_INFO = [
  {
    week: 1 as const,
    title: 'Semana 1 · Fe y Consagración',
    dates: '28 SEP – 4 OCT',
    days: [1, 2, 3, 4, 5, 6, 7],
    patriarch: 'Abraham',
    color: '#1cb0f6',
  },
  {
    week: 2 as const,
    title: 'Semana 2 · Amistad y Redención',
    dates: '5 OCT – 11 OCT',
    days: [8, 9, 10, 11, 12, 13, 14],
    patriarch: 'Isaac',
    color: '#58cc02',
  },
  {
    week: 3 as const,
    title: 'Semana 3 · Integridad y Valor',
    dates: '12 OCT – 18 OCT',
    days: [15, 16, 17, 18, 19, 20, 21],
    patriarch: 'Jacob',
    color: '#a560f0',
  },
  {
    week: 4 as const,
    title: 'Semana 4 · Cierre con Jesucristo',
    dates: '19 OCT – 28 OCT',
    days: [22, 23, 24, 25, 26, 27, 28, 29, 30],
    patriarch: 'Jesucristo',
    color: '#ff9600',
  },
];

export const InstructorRankingView: React.FC<InstructorRankingViewProps> = ({
  students,
  isSuperAdmin,
  instructorWard,
  onSelectStudent,
}) => {
  const [selectedWeek, setSelectedWeek] = useState<WeekOption>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [subTab, setSubTab] = useState<RankingSubTab>('students');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Obtener lista de barrios disponibles
  const availableWards = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      const w = (s.ward || '').trim();
      if (w) set.add(w);
    });
    return Array.from(set).sort();
  }, [students]);

  // 2. Determinar los días correspondientes según la semana seleccionada
  const activeDays = useMemo(() => {
    if (selectedWeek === 'all') {
      return Array.from({ length: 30 }, (_, i) => i + 1);
    }
    const info = WEEKS_INFO.find((w) => w.week === selectedWeek);
    return info ? info.days : [];
  }, [selectedWeek]);

  // 3. Filtrar alumnos según barrio y búsqueda
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Filtro de barrio
      if (selectedWard !== 'all') {
        const w = (s.ward || '').trim().toLowerCase();
        if (w !== selectedWard.toLowerCase()) return false;
      }
      // Filtro de búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (s.name || '').toLowerCase().includes(q);
        const matchesEmail = (s.email || '').toLowerCase().includes(q);
        const matchesWard = (s.ward || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesWard) return false;
      }
      return true;
    });
  }, [students, selectedWard, searchQuery]);

  // 4. Calcular puntaje y orden del ranking de alumnos para la semana/período
  const rankedStudents = useMemo(() => {
    return filteredStudents
      .map((student) => {
        // Días leídos que caen dentro del período seleccionado
        const daysInPeriod = (student.completedDays || []).filter((d) => activeDays.includes(d));
        const daysCount = daysInPeriod.length;
        const totalTarget = activeDays.length;
        const isPerfect = totalTarget > 0 && daysCount === totalTarget;

        return {
          student,
          daysCount,
          totalTarget,
          isPerfect,
          currentStreak: student.currentStreak || 0,
          highestStreak: student.highestStreak || 0,
        };
      })
      .sort((a, b) => {
        // Orden principal: más días leídos en el período
        if (b.daysCount !== a.daysCount) {
          return b.daysCount - a.daysCount;
        }
        // Desempate 1: mayor racha actual
        if (b.currentStreak !== a.currentStreak) {
          return b.currentStreak - a.currentStreak;
        }
        // Desempate 2: mayor racha histórica
        if (b.highestStreak !== a.highestStreak) {
          return b.highestStreak - a.highestStreak;
        }
        // Desempate 3: orden alfabético
        return a.student.name.localeCompare(b.student.name);
      });
  }, [filteredStudents, activeDays]);

  // 5. Estadísticas agregadas por Barrio (para "cuántos días leyó por barrio")
  const wardStats = useMemo(() => {
    const statsMap: Record<
      string,
      {
        ward: string;
        studentCount: number;
        totalDaysRead: number;
        perfectCount: number; // Alumnos con racha perfecta en la semana
        dailyCounts: Record<number, number>; // Día -> cant alumnos que leyeron
      }
    > = {};

    // Inicializar para todos los barrios conocidos
    const targetWards = selectedWard === 'all' ? (availableWards.length > 0 ? availableWards : ['Sin Barrio']) : [selectedWard];
    targetWards.forEach((w) => {
      statsMap[w] = {
        ward: w,
        studentCount: 0,
        totalDaysRead: 0,
        perfectCount: 0,
        dailyCounts: {},
      };
      activeDays.forEach((d) => {
        statsMap[w].dailyCounts[d] = 0;
      });
    });

    students.forEach((s) => {
      const w = (s.ward || 'Sin Barrio').trim();
      if (!statsMap[w]) {
        statsMap[w] = {
          ward: w,
          studentCount: 0,
          totalDaysRead: 0,
          perfectCount: 0,
          dailyCounts: {},
        };
        activeDays.forEach((d) => {
          statsMap[w].dailyCounts[d] = 0;
        });
      }

      statsMap[w].studentCount += 1;
      const completed = s.completedDays || [];
      const inPeriod = completed.filter((d) => activeDays.includes(d));
      statsMap[w].totalDaysRead += inPeriod.length;

      if (activeDays.length > 0 && inPeriod.length === activeDays.length) {
        statsMap[w].perfectCount += 1;
      }

      inPeriod.forEach((d) => {
        if (statsMap[w].dailyCounts[d] !== undefined) {
          statsMap[w].dailyCounts[d] += 1;
        }
      });
    });

    return Object.values(statsMap)
      .map((item) => {
        const avgDaysPerStudent =
          item.studentCount > 0 ? Math.round((item.totalDaysRead / item.studentCount) * 10) / 10 : 0;
        const maxPossible = item.studentCount * activeDays.length;
        const completionRate =
          maxPossible > 0 ? Math.round((item.totalDaysRead / maxPossible) * 100) : 0;

        return {
          ...item,
          avgDaysPerStudent,
          completionRate,
        };
      })
      .filter((item) => (selectedWard === 'all' ? true : item.ward.toLowerCase() === selectedWard.toLowerCase()))
      .sort((a, b) => b.totalDaysRead - a.totalDaysRead || b.completionRate - a.completionRate);
  }, [students, availableWards, selectedWard, activeDays]);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] animate-fadeIn overflow-hidden">
      {/* ── Barra Superior de Filtros: Semana y Barrio ── */}
      <div className="bg-white border-b-2 border-slate-200 p-3.5 space-y-3 shrink-0 shadow-xs">
        {/* Selector de Semana */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Ver por Semana:</span>
            </span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {selectedWeek === 'all'
                ? 'Todo el Desafío (30 Días)'
                : `Semana ${selectedWeek} (${activeDays.length} días)`}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            <button
              onClick={() => setSelectedWeek('all')}
              className={`py-1.5 px-2 rounded-xl text-xs font-display font-bold transition-all active:scale-95 ${
                selectedWeek === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🌟 Todas
            </button>
            {WEEKS_INFO.map((w) => (
              <button
                key={w.week}
                onClick={() => setSelectedWeek(w.week)}
                className={`py-1.5 px-1 rounded-xl text-xs font-display font-bold transition-all active:scale-95 flex flex-col items-center leading-tight ${
                  selectedWeek === w.week
                    ? 'text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={{
                  background: selectedWeek === w.week ? w.color : undefined,
                }}
              >
                <span>Sem {w.week}</span>
                <span className="text-[9px] opacity-85 font-normal truncate max-w-[50px]">{w.patriarch}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filtro de Barrio y Búsqueda */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Selector de Barrio */}
          <div className="flex-1 min-w-[160px] relative">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs font-display font-bold bg-slate-50 border-2 border-slate-200 text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">🌐 Todos los Barrios ({availableWards.length})</option>
              {availableWards.map((w) => (
                <option key={w} value={w}>
                  📍 {w}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-Tabs de visualización */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setSubTab('students')}
              className={`px-3 py-1 rounded-lg text-xs font-display font-bold transition-all ${
                subTab === 'students'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🏆 Alumnos
            </button>
            <button
              onClick={() => setSubTab('wards')}
              className={`px-3 py-1 rounded-lg text-xs font-display font-bold transition-all ${
                subTab === 'wards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🏘️ Barrios
            </button>
            <button
              onClick={() => setSubTab('daily_matrix')}
              className={`px-3 py-1 rounded-lg text-xs font-display font-bold transition-all ${
                subTab === 'daily_matrix'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📅 Día x Día
            </button>
          </div>
        </div>
      </div>

      {/* ── Contenido según Sub-Tab ── */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-3.5 space-y-3">
        {/* ========================================================================= */}
        {/* SUBTAB 1: RANKING DE ALUMNOS                                              */}
        {/* ========================================================================= */}
        {subTab === 'students' && (
          <div className="space-y-3">
            {/* Podio visual de los 3 mejores (Top 3) si hay al menos 3 alumnos con lecturas */}
            {rankedStudents.length >= 3 && rankedStudents[0].daysCount > 0 && (
              <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-4 border-2 border-amber-200 shadow-xs">
                <div className="text-center mb-3">
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                    👑 Cuadro de Honor · {selectedWeek === 'all' ? 'Todo el Desafío' : `Semana ${selectedWeek}`}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 items-end pt-2">
                  {/* #2 Plata */}
                  {rankedStudents[1] && (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-200 border-2 border-slate-300 flex items-center justify-center font-bold text-slate-700 shadow-sm text-base mb-1 relative">
                        🥈
                        <span className="absolute -bottom-2 bg-slate-600 text-white text-[10px] font-black rounded-full px-1.5">
                          #2
                        </span>
                      </div>
                      <p className="font-display font-bold text-xs text-slate-800 truncate max-w-[90px] mt-1.5">
                        {rankedStudents[1].student.name.split(' ')[0]}
                      </p>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {rankedStudents[1].daysCount} días
                      </span>
                    </div>
                  )}

                  {/* #1 Oro */}
                  {rankedStudents[0] && (
                    <div className="flex flex-col items-center text-center -translate-y-2">
                      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-300 to-yellow-100 border-3 border-amber-400 flex items-center justify-center font-bold text-amber-900 shadow-md text-2xl mb-1 relative animate-bounce">
                        🥇
                        <span className="absolute -bottom-2 bg-amber-500 text-white text-[11px] font-black rounded-full px-2 py-0.5 shadow">
                          #1
                        </span>
                      </div>
                      <p className="font-display font-bold text-sm text-slate-900 truncate max-w-[110px] mt-1.5">
                        {rankedStudents[0].student.name.split(' ')[0]}
                      </p>
                      <span className="text-xs text-amber-700 font-black">
                        {rankedStudents[0].daysCount} de {activeDays.length} días ⭐
                      </span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[90px]">
                        {rankedStudents[0].student.ward || 'Sin Barrio'}
                      </span>
                    </div>
                  )}

                  {/* #3 Bronce */}
                  {rankedStudents[2] && (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-200 flex items-center justify-center font-bold text-amber-800 shadow-sm text-base mb-1 relative">
                        🥉
                        <span className="absolute -bottom-2 bg-amber-700 text-white text-[10px] font-black rounded-full px-1.5">
                          #3
                        </span>
                      </div>
                      <p className="font-display font-bold text-xs text-slate-800 truncate max-w-[90px] mt-1.5">
                        {rankedStudents[2].student.name.split(' ')[0]}
                      </p>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {rankedStudents[2].daysCount} días
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Listado Completo del Ranking */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Alumno y Barrio</span>
                <span>Días Leídos ({activeDays.length} máx)</span>
              </div>

              {rankedStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No se encontraron alumnos para los filtros seleccionados.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {rankedStudents.map((item, idx) => {
                    const rank = idx + 1;
                    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

                    return (
                      <div
                        key={item.student.id}
                        onClick={() => onSelectStudent && onSelectStudent(item.student)}
                        className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        {/* Posición + Avatar + Nombre */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="font-display font-black text-sm w-7 text-center shrink-0 text-slate-500">
                            {medal || `#${rank}`}
                          </span>

                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-display font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                            {getUserInitials(item.student)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-display font-bold text-xs text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                {item.student.name}
                              </p>
                              {item.isPerfect && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full border border-emerald-300">
                                  ✓ Racha 100%
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">
                              📍 {item.student.ward || 'Sin Barrio'} · 🔥 {item.currentStreak}d racha
                            </p>
                          </div>
                        </div>

                        {/* Progreso del período */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <span className="font-display font-black text-sm text-slate-800">
                              {item.daysCount}
                              <span className="text-slate-400 text-xs font-normal">/{item.totalTarget}</span>
                            </span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, Math.round((item.daysCount / item.totalTarget) * 100))}%`,
                                  background: item.isPerfect ? '#10b981' : '#3b82f6',
                                }}
                              />
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 2: COMPARATIVA POR BARRIO (Mide cuántos días leyó por barrio)       */}
        {/* ========================================================================= */}
        {subTab === 'wards' && (
          <div className="space-y-3">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-xs text-blue-950">
                  Desempeño de Lectura por Barrio
                </h4>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  {selectedWeek === 'all'
                    ? 'Total acumulado en los 30 días del desafío.'
                    : `Lecturas registradas en la Semana ${selectedWeek}.`}
                </p>
              </div>
              <span className="text-2xl">🏘️</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {wardStats.map((item, index) => {
                const isFirst = index === 0 && item.totalDaysRead > 0;

                return (
                  <div
                    key={item.ward}
                    className="bg-white rounded-2xl p-3.5 border-2 border-slate-200 shadow-xs relative overflow-hidden"
                  >
                    {isFirst && (
                      <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 font-black text-[9px] uppercase px-2.5 py-0.5 rounded-bl-xl shadow-xs">
                        👑 Barrio Líder
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-slate-400 text-xs">
                          #{index + 1}
                        </span>
                        <h4 className="font-display font-bold text-sm text-slate-800">
                          {item.ward}
                        </h4>
                      </div>
                      <span className="font-display font-black text-sm text-blue-600">
                        {item.totalDaysRead} <span className="text-xs font-normal text-slate-400">días leídos</span>
                      </span>
                    </div>

                    {/* Barra de progreso de cumplimiento */}
                    <div className="space-y-1 mb-2.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                        <span>Cumplimiento general:</span>
                        <span className="text-slate-800 font-display">{item.completionRate}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                          style={{ width: `${Math.min(100, item.completionRate)}%` }}
                        />
                      </div>
                    </div>

                    {/* Métricas secundarias */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                      <div className="bg-slate-50 rounded-xl p-1.5">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Alumnos</p>
                        <p className="font-display font-bold text-xs text-slate-800">{item.studentCount}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-1.5">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Promedio</p>
                        <p className="font-display font-bold text-xs text-slate-800">{item.avgDaysPerStudent} d/alumno</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-1.5">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Racha 100%</p>
                        <p className="font-display font-bold text-xs text-emerald-600">{item.perfectCount} alumnos</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 3: MATRIZ DÍA POR DÍA Y BARRIO                                     */}
        {/* ========================================================================= */}
        {subTab === 'daily_matrix' && (
          <div className="space-y-3">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-xs text-amber-950">
                    Lecturas por Día y por Barrio
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Muestra cuántos alumnos de cada barrio leyeron en cada día del período.
                  </p>
                </div>
                <span className="text-2xl">📅</span>
              </div>
            </div>

            {/* Tarjetas por cada día */}
            <div className="space-y-2">
              {activeDays.map((dayNum) => {
                const reading = READINGS_DATA.find((r) => r.day === dayNum);
                const totalReadToday = students.filter((s) => (s.completedDays || []).includes(dayNum)).length;

                return (
                  <div
                    key={dayNum}
                    className="bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-display font-bold flex items-center justify-center text-xs">
                          D{dayNum}
                        </span>
                        <div>
                          <p className="font-display font-bold text-xs text-slate-800">
                            {reading?.character || `Día ${dayNum}`}
                          </p>
                          <p className="text-[10px] text-slate-400">{reading?.dateStr}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {totalReadToday} de {students.length} leyeron
                        </span>
                      </div>
                    </div>

                    {/* Desglose por barrio para este día */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
                      {wardStats.map((w) => {
                        const count = w.dailyCounts[dayNum] || 0;
                        const pct = w.studentCount > 0 ? Math.round((count / w.studentCount) * 100) : 0;

                        return (
                          <div
                            key={w.ward}
                            className="bg-slate-50 rounded-xl p-2 flex items-center justify-between border border-slate-200/60"
                          >
                            <span className="text-[11px] font-bold text-slate-700 truncate max-w-[90px]">
                              {w.ward}
                            </span>
                            <span
                              className={`text-[11px] font-bold px-1.5 py-0.2 rounded-md ${
                                count > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {count}/{w.studentCount} ({pct}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
