import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  ArrowLeft,
  Sparkles,
  Lock,
  Flame,
  Shield,
  Pizza,
  IceCream,
  Users,
  CheckCircle2,
  AlertCircle,
  Star,
  Upload,
} from 'lucide-react';
import { Student, SpecialBadge, isUserInstructor } from '../types';
import { SPECIAL_BADGES, READINGS_DATA } from '../data/readings';
import { PrizeCardModal } from './PrizeCardModal';
import {
  getStoredPrizeCards,
  fetchRemotePrizeCards,
} from '../utils/prizeCardsStorage';

interface CardsGalleryModalProps {
  student: Student | null;
  isOpen?: boolean;
  onClose: () => void;
  selectedBadge?: SpecialBadge | null;
}

export const CardsGalleryModal: React.FC<CardsGalleryModalProps> = ({
  student,
  isOpen = true,
  onClose,
  selectedBadge,
}) => {
  const [activeBadge, setActiveBadge] = useState<SpecialBadge | null>(selectedBadge || null);
  const [prizeCardsMap, setPrizeCardsMap] = useState<Record<number, string>>(() => getStoredPrizeCards());

  useEffect(() => {
    fetchRemotePrizeCards().then((remote) => {
      setPrizeCardsMap(remote);
    });
  }, []);

  useEffect(() => {
    if (selectedBadge) {
      setActiveBadge(selectedBadge);
    }
  }, [selectedBadge]);

  if (isOpen === false) return null;

  const currentStreak = student?.currentStreak || 0;
  const completedCount = student?.completedDays?.length || 0;
  const completedDays = student?.completedDays || [];
  const isInstructor = isUserInstructor(student);

  // Helper para verificar si se completaron los días de una semana específica
  const checkWeekCompleted = (weekNum: number) => {
    const days = READINGS_DATA.filter((r) => r.week === weekNum).map((r) => r.day);
    return days.length > 0 && days.every((d) => completedDays.includes(d));
  };

  const week1Done = checkWeekCompleted(1);
  const week2Done = checkWeekCompleted(2);
  const week3Done = checkWeekCompleted(3);
  const week4Done = checkWeekCompleted(4);

  const handleCardUpdated = (week: number, imageUrl: string) => {
    setPrizeCardsMap((prev) => ({
      ...prev,
      [week]: imageUrl,
    }));
  };

  const handleCardDeleted = (week: number) => {
    setPrizeCardsMap((prev) => {
      const next = { ...prev };
      delete next[week];
      return next;
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden animate-fadeIn">
      {/* ── Top Header ── */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          background: '#3c3c3c',
          borderBottom: '3px solid #222222',
          padding: '16px 20px',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            id="close-prizes-btn"
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
            <Trophy style={{ width: 22, height: 22, color: '#3c3c3c' }} />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-base leading-tight">
              Premios del Desafío
            </h2>
            <p style={{ fontSize: 12, color: '#afafaf' }}>
              Cartas de Racha y Salida de Clase
            </p>
          </div>
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 pb-8 space-y-4">

        {/* ── INTRO BANNER ── */}
        <div
          className="rounded-3xl p-4 border-2 border-[#ffc800]"
          style={{ background: 'linear-gradient(135deg, #fffbe0 0%, #ffffff 100%)' }}
        >
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-2xl">🏆</span>
            <h3 className="font-display font-bold text-base text-[#3c3c3c]">
              ¡Doble Recompensa por tu Esfuerzo!
            </h3>
          </div>
          <p className="text-xs text-[#666666] leading-relaxed">
            En «Detente, Lee, Conecta», tu constancia diaria tiene premios espirituales y momentos inolvidables para disfrutar en comunidad con tu clase de Seminario.
          </p>
        </div>

        {/* ── PREMIO 1: CARTAS DE LA SEMANA (RACHA PERFECTA) ── */}
        <div
          className="rounded-3xl p-4 border-2 border-[#1cb0f6]"
          style={{ background: '#ffffff' }}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#e8f7ff] flex items-center justify-center text-[#1cb0f6]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-xs uppercase px-2 py-0.5 rounded-md bg-[#1cb0f6] text-white">
                  Premio 1
                </span>
                <h4 className="font-display font-bold text-sm text-[#1e293b] mt-0.5">
                  La Carta Coleccionable de la Semana
                </h4>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-[#ffc800]" />
          </div>

          {/* Reglas de la Carta */}
          <div
            className="rounded-2xl p-3 my-2.5 border-2 border-[#fed7aa]"
            style={{ background: '#fff7ed' }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-4 h-4 text-[#ea580c] shrink-0" />
              <p className="font-display font-bold text-xs text-[#9a3412]">
                Regla para ganar la Carta Premio:
              </p>
            </div>
            <p className="text-xs text-[#c2410c] leading-relaxed">
              La carta premio <strong>SOLO se desbloquea al completar los 7 días leídos del desafío</strong>. Si se pierde algún día de la semana, la carta permanecerá oculta y verás el mensaje motivacional para la próxima semana.
            </p>
          </div>

          {/* Cartas a ganar (Interactivas) */}
          <div className="flex items-center justify-between mb-2">
            <p className="font-display font-bold text-xs text-[#475569] uppercase tracking-wide">
              Las 4 Cartas del Desafío:
            </p>
            <span className="text-[11px] text-blue-600 font-bold">
              Toca para ver o cargar
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Semana 1: Abraham */}
            <button
              id="prize-card-week-1"
              type="button"
              onClick={() => setActiveBadge(SPECIAL_BADGES.abraham)}
              className="rounded-2xl p-2.5 border-2 text-center flex flex-col items-center relative transition-all active:scale-95 group text-left w-full cursor-pointer hover:shadow-md"
              style={{
                background: week1Done ? '#f0fdf4' : '#f8fafc',
                borderColor: week1Done ? '#86efac' : '#e2e8f0',
              }}
            >
              {(() => {
                const img = prizeCardsMap?.[1];
                const canSee = week1Done || isInstructor;
                if (canSee && img) {
                  return (
                    <div className="w-full h-32 rounded-xl overflow-hidden shadow-md border-2 border-amber-400 bg-slate-900 mb-2 relative flex items-center justify-center">
                      <img src={img} alt="Abraham" className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 right-1.5 bg-black/60 rounded-md px-1.5 py-0.5 text-[9px] text-white font-bold backdrop-blur-xs">
                        {week1Done ? '🏆 Ganada' : '📸 Maestro'}
                      </div>
                    </div>
                  );
                }
                if (week1Done) {
                  return (
                    <div className="w-full h-32 rounded-xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-yellow-100 flex flex-col items-center justify-center p-2 mb-2 shadow-sm text-center">
                      <span className="text-3xl mb-1">🥈</span>
                      <span className="text-[11px] font-bold text-amber-900 uppercase font-display leading-tight">Abraham</span>
                      <span className="text-[9px] text-amber-700 font-bold mt-1 bg-amber-200/80 px-2 py-0.5 rounded-full">¡Ganada!</span>
                    </div>
                  );
                }
                return (
                  <div className="w-full h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 flex flex-col items-center justify-center p-2 mb-2 text-center text-slate-400">
                    <Lock className="w-6 h-6 mb-1 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase leading-tight font-display">Abraham</span>
                    <span className="text-[9px] text-slate-400 mt-1">Faltan días</span>
                  </div>
                );
              })()}

              <p className="font-display font-bold text-xs text-[#1e293b] leading-tight">
                Abraham
              </p>
              <p className="text-[10px] text-[#64748b]">
                Semana 1 · 7 días
              </p>

              <span
                className="mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block"
                style={{
                  background: week1Done ? '#58cc02' : '#e2e8f0',
                  color: week1Done ? '#ffffff' : '#64748b',
                }}
              >
                {week1Done ? '¡Desbloqueada!' : isInstructor ? 'Cargar / Ver' : 'Bloqueada 🔒'}
              </span>
            </button>

            {/* Semana 2: Isaac */}
            <button
              id="prize-card-week-2"
              type="button"
              onClick={() => setActiveBadge(SPECIAL_BADGES.isaac)}
              className="rounded-2xl p-2.5 border-2 text-center flex flex-col items-center relative transition-all active:scale-95 group text-left w-full cursor-pointer hover:shadow-md"
              style={{
                background: week2Done ? '#f0fdf4' : '#f8fafc',
                borderColor: week2Done ? '#86efac' : '#e2e8f0',
              }}
            >
              {(() => {
                const img = prizeCardsMap?.[2];
                const canSee = week2Done || isInstructor;
                if (canSee && img) {
                  return (
                    <div className="w-full h-32 rounded-xl overflow-hidden shadow-md border-2 border-amber-400 bg-slate-900 mb-2 relative flex items-center justify-center">
                      <img src={img} alt="Isaac" className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 right-1.5 bg-black/60 rounded-md px-1.5 py-0.5 text-[9px] text-white font-bold backdrop-blur-xs">
                        {week2Done ? '🏆 Ganada' : '📸 Maestro'}
                      </div>
                    </div>
                  );
                }
                if (week2Done) {
                  return (
                    <div className="w-full h-32 rounded-xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-yellow-100 flex flex-col items-center justify-center p-2 mb-2 shadow-sm text-center">
                      <span className="text-3xl mb-1">🥈</span>
                      <span className="text-[11px] font-bold text-amber-900 uppercase font-display leading-tight">Isaac</span>
                      <span className="text-[9px] text-amber-700 font-bold mt-1 bg-amber-200/80 px-2 py-0.5 rounded-full">¡Ganada!</span>
                    </div>
                  );
                }
                return (
                  <div className="w-full h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 flex flex-col items-center justify-center p-2 mb-2 text-center text-slate-400">
                    <Lock className="w-6 h-6 mb-1 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase leading-tight font-display">Isaac</span>
                    <span className="text-[9px] text-slate-400 mt-1">Faltan días</span>
                  </div>
                );
              })()}

              <p className="font-display font-bold text-xs text-[#1e293b] leading-tight">
                Isaac
              </p>
              <p className="text-[10px] text-[#64748b]">
                Semana 2 · 7 días
              </p>

              <span
                className="mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block"
                style={{
                  background: week2Done ? '#58cc02' : '#e2e8f0',
                  color: week2Done ? '#ffffff' : '#64748b',
                }}
              >
                {week2Done ? '¡Desbloqueada!' : isInstructor ? 'Cargar / Ver' : 'Bloqueada 🔒'}
              </span>
            </button>

            {/* Semana 3: Jacob */}
            <button
              id="prize-card-week-3"
              type="button"
              onClick={() => setActiveBadge(SPECIAL_BADGES.jacob)}
              className="rounded-2xl p-2.5 border-2 text-center flex flex-col items-center relative transition-all active:scale-95 group text-left w-full cursor-pointer hover:shadow-md"
              style={{
                background: week3Done ? '#f0fdf4' : '#f8fafc',
                borderColor: week3Done ? '#86efac' : '#e2e8f0',
              }}
            >
              {(() => {
                const img = prizeCardsMap?.[3];
                const canSee = week3Done || isInstructor;
                if (canSee && img) {
                  return (
                    <div className="w-full h-32 rounded-xl overflow-hidden shadow-md border-2 border-amber-400 bg-slate-900 mb-2 relative flex items-center justify-center">
                      <img src={img} alt="Jacob" className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 right-1.5 bg-black/60 rounded-md px-1.5 py-0.5 text-[9px] text-white font-bold backdrop-blur-xs">
                        {week3Done ? '🏆 Ganada' : '📸 Maestro'}
                      </div>
                    </div>
                  );
                }
                if (week3Done) {
                  return (
                    <div className="w-full h-32 rounded-xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-yellow-100 flex flex-col items-center justify-center p-2 mb-2 shadow-sm text-center">
                      <span className="text-3xl mb-1">🥈</span>
                      <span className="text-[11px] font-bold text-amber-900 uppercase font-display leading-tight">Jacob</span>
                      <span className="text-[9px] text-amber-700 font-bold mt-1 bg-amber-200/80 px-2 py-0.5 rounded-full">¡Ganada!</span>
                    </div>
                  );
                }
                return (
                  <div className="w-full h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 flex flex-col items-center justify-center p-2 mb-2 text-center text-slate-400">
                    <Lock className="w-6 h-6 mb-1 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase leading-tight font-display">Jacob</span>
                    <span className="text-[9px] text-slate-400 mt-1">Faltan días</span>
                  </div>
                );
              })()}

              <p className="font-display font-bold text-xs text-[#1e293b] leading-tight">
                Jacob
              </p>
              <p className="text-[10px] text-[#64748b]">
                Semana 3 · 7 días
              </p>

              <span
                className="mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block"
                style={{
                  background: week3Done ? '#58cc02' : '#e2e8f0',
                  color: week3Done ? '#ffffff' : '#64748b',
                }}
              >
                {week3Done ? '¡Desbloqueada!' : isInstructor ? 'Cargar / Ver' : 'Bloqueada 🔒'}
              </span>
            </button>

            {/* Día 30: Jesucristo */}
            <button
              id="prize-card-week-4"
              type="button"
              onClick={() => setActiveBadge(SPECIAL_BADGES.jesucristo)}
              className="rounded-2xl p-2.5 border-2 text-center flex flex-col items-center relative transition-all active:scale-95 group text-left w-full cursor-pointer hover:shadow-md"
              style={{
                background: week4Done ? '#fefce8' : '#fffdf0',
                borderColor: week4Done ? '#facc15' : '#fed7aa',
              }}
            >
              {(() => {
                const img = prizeCardsMap?.[4];
                const canSee = week4Done || isInstructor;
                if (canSee && img) {
                  return (
                    <div className="w-full h-32 rounded-xl overflow-hidden shadow-md border-2 border-amber-400 bg-slate-900 mb-2 relative flex items-center justify-center">
                      <img src={img} alt="Jesucristo" className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 right-1.5 bg-black/60 rounded-md px-1.5 py-0.5 text-[9px] text-white font-bold backdrop-blur-xs">
                        {week4Done ? '👑 Ganada' : '📸 Maestro'}
                      </div>
                    </div>
                  );
                }
                if (week4Done) {
                  return (
                    <div className="w-full h-32 rounded-xl border-2 border-amber-400 bg-gradient-to-b from-amber-100 to-yellow-200 flex flex-col items-center justify-center p-2 mb-2 shadow-sm text-center">
                      <span className="text-3xl mb-1">👑</span>
                      <span className="text-[11px] font-bold text-amber-950 uppercase font-display leading-tight">Jesucristo</span>
                      <span className="text-[9px] text-amber-800 font-bold mt-1 bg-amber-300/80 px-2 py-0.5 rounded-full">¡Carta Dorada!</span>
                    </div>
                  );
                }
                return (
                  <div className="w-full h-32 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/50 flex flex-col items-center justify-center p-2 mb-2 text-center text-amber-700/60">
                    <Lock className="w-6 h-6 mb-1 text-amber-600/60" />
                    <span className="text-[10px] font-bold text-amber-800 uppercase leading-tight font-display">Jesucristo</span>
                    <span className="text-[9px] text-amber-700 mt-1">30 días de racha</span>
                  </div>
                );
              })()}

              <p className="font-display font-bold text-xs text-[#78350f] leading-tight">
                Jesucristo
              </p>
              <p className="text-[10px] text-[#b45309] font-bold">
                Carta Dorada · 30 días
              </p>

              <span
                className="mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block"
                style={{
                  background: week4Done ? '#ffc800' : '#fef3c7',
                  color: week4Done ? '#1e293b' : '#92400e',
                }}
              >
                {week4Done ? '¡Desbloqueada!' : isInstructor ? 'Cargar / Ver' : 'Bloqueada 🔒'}
              </span>
            </button>
          </div>
        </div>

        {/* ── PREMIO 2: SALIDA GRUPAL A PIZZERÍA O HELADERÍA ── */}
        <div
          className="rounded-3xl p-4 border-2 border-[#58cc02]"
          style={{ background: 'linear-gradient(145deg, #f0fdf4 0%, #ffffff 100%)' }}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#dcfce7] flex items-center justify-center text-[#16a34a]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-xs uppercase px-2 py-0.5 rounded-md bg-[#58cc02] text-white">
                  Premio 2 · Para Toda la Clase
                </span>
                <h4 className="font-display font-bold text-sm text-[#14532d] mt-0.5">
                  Salida Grupal a Pizzería o Heladería 🍕🍦
                </h4>
              </div>
            </div>
          </div>

          {/* Explicación de la Salida de Clase */}
          <div
            className="rounded-2xl p-3 my-2.5 border-2 border-[#bbf7d0]"
            style={{ background: '#ffffff' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex items-center gap-1 text-xl">
                <span>🍕</span>
                <span>🍦</span>
              </div>
              <p className="font-display font-bold text-xs text-[#166534]">
                Premio por Participar y Perseverar Juntos:
              </p>
            </div>
            <p className="text-xs text-[#15803d] leading-relaxed">
              ¿Se te pasó algún día y no pudiste ganar la carta individual? <strong>¡No te preocupes ni te desanimes!</strong> Este segundo premio es <strong>por participar activamente en el desafío</strong>.
            </p>
            <p className="text-xs text-[#15803d] leading-relaxed mt-1.5">
              Al finalizar el desafío de 30 días, <strong>saldremos todos juntos como clase de Seminario a una pizzería o heladería</strong> para celebrar el esfuerzo, compartir testimonios y festejar la victoria de haber leído juntos las Escrituras.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs text-[#166534] font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
            <span>¡Lo importante es no abandonar y seguir leyendo juntos cada día!</span>
          </div>
        </div>

        {/* ── ESTADO ACTUAL DEL ALUMNO ── */}
        <div
          className="rounded-2xl p-3.5 border-2 border-[#e5e5e5] bg-[#f8fafc] flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#fff3e0] border border-[#ff9600] flex items-center justify-center text-xl shrink-0">
              🔥
            </div>
            <div>
              <p className="font-display font-bold text-xs text-[#334155]">
                Tu Racha Actual: {currentStreak} días
              </p>
              <p className="text-[11px] text-[#64748b]">
                {completedCount} de 30 lecturas completadas
              </p>
            </div>
          </div>
          <span
            className="font-display font-bold text-xs px-2.5 py-1 rounded-xl text-white shrink-0"
            style={{ background: currentStreak >= 7 ? '#58cc02' : '#ff9600' }}
          >
            {currentStreak >= 7 ? '¡Racha Imparable!' : '¡Sigue leyendo!'}
          </span>
        </div>

      </div>

      {/* ── MODAL DE CARTA PREMIO (Visualización / Carga de Instructor) ── */}
      {activeBadge && (
        <PrizeCardModal
          isOpen={Boolean(activeBadge)}
          onClose={() => setActiveBadge(null)}
          badge={activeBadge}
          student={student}
          prizeCardsMap={prizeCardsMap}
          onCardUpdated={handleCardUpdated}
          onCardDeleted={handleCardDeleted}
        />
      )}
    </div>
  );
};
