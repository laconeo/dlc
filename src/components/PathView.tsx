import React from 'react';
import { Check, Lock, Sparkles, Award, BookOpen } from 'lucide-react';
import { DayReading, Student, SpecialBadge } from '../types';
import { READINGS_DATA, SPECIAL_BADGES } from '../data/readings';

interface PathViewProps {
  student: Student | null;
  onSelectReading: (reading: DayReading) => void;
  onOpenBadgeDetail: (badge: SpecialBadge) => void;
}

// Duolingo exact colors per week unit
const WEEK_CONFIGS = [
  {
    week: 1,
    title: 'Fe y Consagración',
    dateRange: '28 SEP – 4 OCT',
    color: '#1cb0f6',     // Duolingo blue
    darkColor: '#1899d6',
    bgColor: '#e8f7ff',
    badge: 'abraham',
  },
  {
    week: 2,
    title: 'Amistad y Redención',
    dateRange: '5 OCT – 11 OCT',
    color: '#58cc02',     // Duolingo green
    darkColor: '#46a302',
    bgColor: '#e8f9d9',
    badge: 'isaac',
  },
  {
    week: 3,
    title: 'Integridad y Valor',
    dateRange: '12 OCT – 18 OCT',
    color: '#a560f0',     // Duolingo purple
    darkColor: '#8a40d0',
    bgColor: '#f5eeff',
    badge: 'jacob',
  },
  {
    week: 4,
    title: 'Cierre con Jesucristo',
    dateRange: '19 OCT – 28 OCT',
    color: '#ff9600',     // Duolingo orange
    darkColor: '#e08600',
    bgColor: '#fff3e0',
    badge: 'jesucristo',
  },
];

const getOffset = (index: number) => {
  const wave = Math.sin(index * 0.95);
  return Math.round(wave * 52);
};

export const PathView: React.FC<PathViewProps> = ({
  student,
  onSelectReading,
  onOpenBadgeDetail,
}) => {
  const completedDays = student?.completedDays || [];

  // Encontrar la lectura correspondiente al día de hoy según el calendario
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayReading = READINGS_DATA.find((r) => r.calendarDate === todayStr);

  let nextActiveDay = 1;
  if (todayReading) {
    nextActiveDay = todayReading.day;
  } else {
    for (let i = 1; i <= 31; i++) {
      if (!completedDays.includes(i)) {
        nextActiveDay = i;
        break;
      }
    }
  }

  const pct = Math.round((completedDays.length / 30) * 100);

  return (
    <div className="pb-10 pt-3 px-4 max-w-md mx-auto">

      {/* ── Hero Card — clean white, Duolingo style ── */}
      <div
        className="mb-5 rounded-2xl p-4 border-2"
        style={{ borderColor: '#e5e5e5', background: '#ffffff' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: '#e8f9d9', border: '2px solid #58cc02' }}
          >
            📖
          </div>
          <div>
            <p
              className="font-display font-bold leading-tight"
              style={{ fontSize: 18, color: '#3c3c3c' }}
            >
              3 minutos con Jesucristo
            </p>
            <p style={{ fontSize: 13, color: '#777777', fontWeight: 600 }}>
              Desafío 30 días · Antiguo Testamento
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div
            className="flex-1 rounded-full overflow-hidden"
            style={{ height: 14, background: '#f0f0f0', border: '2px solid #e5e5e5' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, pct)}%`,
                background: '#58cc02',
              }}
            />
          </div>
          <span
            className="font-display font-bold shrink-0"
            style={{ fontSize: 14, color: '#46a302', minWidth: 38 }}
          >
            {pct}%
          </span>
        </div>
        <p style={{ fontSize: 12, color: '#afafaf', marginTop: 4, fontWeight: 600 }}>
          {completedDays.length} de 30 días completados
        </p>
      </div>

      {/* ── Week Sections ── */}
      {WEEK_CONFIGS.map((cfg) => {
        const badge = SPECIAL_BADGES[cfg.badge as keyof typeof SPECIAL_BADGES];
        const isBadgeUnlocked = student?.unlockedBadgeIds?.includes(badge.id);
        const weekReadings = READINGS_DATA.filter((r) => r.week === cfg.week);

        return (
          <div key={cfg.week} className="mb-10">
            {/* Week Banner — solid Duolingo color, no gradient */}
            <div
              className="rounded-2xl p-4 mb-5 flex items-center justify-between"
              style={{ background: cfg.color, border: `3px solid ${cfg.darkColor}` }}
            >
              <div>
                <p
                  className="font-display font-bold uppercase tracking-wide"
                  style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}
                >
                  SEMANA {cfg.week} · {cfg.dateRange}
                </p>
                <p
                  className="font-display font-bold leading-tight mt-0.5"
                  style={{ fontSize: 18, color: '#ffffff' }}
                >
                  {cfg.title}
                </p>
              </div>

              <button
                onClick={() => onOpenBadgeDetail(badge)}
                className="flex items-center gap-1.5 rounded-xl px-3 active:scale-95 transition-transform"
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  border: '2px solid rgba(255,255,255,0.5)',
                  height: 40,
                }}
              >
                <Award className="w-5 h-5 text-white" />
                <span
                  className="font-display font-bold text-white"
                  style={{ fontSize: 13 }}
                >
                  {badge.patriarch.split(' ')[0]}
                </span>
              </button>
            </div>

            {/* Path Nodes */}
            <div className="flex flex-col items-center gap-5 py-2">
              {weekReadings.map((reading) => {
                const isCompleted = completedDays.includes(reading.day);
                const isActive = reading.day === nextActiveDay;
                const offsetPx = getOffset(reading.day);

                return (
                  <div
                    key={reading.day}
                    className="relative flex flex-col items-center"
                    style={{ transform: `translateX(${offsetPx}px)` }}
                  >
                    {/* ¡Leer hoy! bubble */}
                    {isActive && (
                      <div className="absolute z-20 animate-bounce" style={{ top: -48 }}>
                        <div
                          className="font-display font-bold uppercase rounded-full px-3 flex items-center gap-1"
                          style={{
                            background: '#ffc800',
                            color: '#3c3c3c',
                            fontSize: 12,
                            height: 28,
                            border: '2px solid #e5a400',
                          }}
                        >
                          <span>¡LEER HOY!</span>
                          <Sparkles className="w-3 h-3" />
                        </div>
                        <div
                          className="mx-auto -mt-px"
                          style={{
                            width: 10,
                            height: 10,
                            background: '#ffc800',
                            transform: 'rotate(45deg)',
                            marginTop: -5,
                          }}
                        />
                      </div>
                    )}

                    {/* Node button */}
                    <div className="relative">
                      {isActive && (
                        <div
                          className="absolute rounded-full animate-ping pointer-events-none"
                          style={{
                            inset: -10,
                            background: `${cfg.color}30`,
                          }}
                        />
                      )}

                      <button
                        id={`reading-node-day-${reading.day}`}
                        onClick={() => onSelectReading(reading)}
                        className="rounded-full flex flex-col items-center justify-center font-display font-bold relative z-10 transition-all active:scale-95"
                        style={{
                          width: 72,
                          height: 72,
                          ...(isCompleted
                            ? {
                                background: '#58cc02',
                                borderBottom: '5px solid #46a302',
                                color: '#ffffff',
                              }
                            : isActive
                            ? {
                                background: cfg.color,
                                borderBottom: `5px solid ${cfg.darkColor}`,
                                color: '#ffffff',
                                outline: `4px solid ${cfg.color}40`,
                                outlineOffset: 3,
                              }
                            : {
                                background: '#e5e5e5',
                                borderBottom: '5px solid #c8c8c8',
                                color: '#afafaf',
                              }),
                        }}
                      >
                        {isCompleted ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <Check strokeWidth={3} style={{ width: 22, height: 22 }} />
                            <span style={{ fontSize: 10, fontWeight: 800 }}>DÍA {reading.day}</span>
                          </div>
                        ) : isActive ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <BookOpen style={{ width: 22, height: 22 }} />
                            <span style={{ fontSize: 10, fontWeight: 800 }}>DÍA {reading.day}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-0.5">
                            <Lock style={{ width: 18, height: 18, color: '#afafaf' }} />
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#afafaf' }}>
                              DÍA {reading.day}
                            </span>
                          </div>
                        )}

                        {/* Gold star on completed */}
                        {isCompleted && (
                          <span
                            className="absolute rounded-full font-bold text-white flex items-center justify-center"
                            style={{
                              top: -6,
                              right: -4,
                              background: '#ffc800',
                              border: '2px solid #ffffff',
                              width: 20,
                              height: 20,
                              fontSize: 11,
                            }}
                          >
                            ★
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Label below node */}
                    <div
                      className="text-center mt-2 cursor-pointer"
                      onClick={() => onSelectReading(reading)}
                    >
                      <p
                        className="font-display font-bold leading-tight"
                        style={{ fontSize: 13, color: '#3c3c3c', maxWidth: 100 }}
                      >
                        {reading.character}
                      </p>
                      <span
                        className="inline-block mt-0.5 rounded-full font-bold"
                        style={{
                          fontSize: 11,
                          color: '#777777',
                          background: '#f7f7f7',
                          border: '1px solid #e5e5e5',
                          padding: '1px 8px',
                        }}
                      >
                        {reading.dateStr}
                      </span>
                    </div>

                    {/* Milestone badge card */}
                    {reading.isWeekMilestone && reading.milestoneBadge && (
                      <div className="mt-5 mb-2" style={{ width: 280 }}>
                        <button
                          id={`milestone-badge-box-${reading.milestoneBadge.id}`}
                          onClick={() => onOpenBadgeDetail(reading.milestoneBadge!)}
                          className="w-full rounded-2xl p-3 flex items-center gap-3 active:scale-95 transition-all text-left"
                          style={
                            isBadgeUnlocked
                              ? {
                                  background: reading.milestoneBadge.tier === 'gold'
                                    ? '#fffbe0'
                                    : cfg.bgColor,
                                  border: `2px solid ${reading.milestoneBadge.tier === 'gold' ? '#ffc800' : cfg.color}`,
                                }
                              : {
                                  background: '#f7f7f7',
                                  border: '2px dashed #e5e5e5',
                                }
                          }
                        >
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              background: reading.milestoneBadge.tier === 'gold'
                                ? '#ffc800'
                                : cfg.color,
                            }}
                          >
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className="font-bold uppercase tracking-wide"
                                style={{ fontSize: 10, color: '#777777' }}
                              >
                                {reading.milestoneBadge.tier === 'gold'
                                  ? 'CARTA DORADA FINAL'
                                  : `SEMANA ${reading.milestoneBadge.weekNumber}`}
                              </span>
                              <span
                                className="font-bold rounded-full px-2"
                                style={{
                                  fontSize: 10,
                                  color: '#ffffff',
                                  background: isBadgeUnlocked ? '#58cc02' : '#afafaf',
                                  height: 18,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                {isBadgeUnlocked ? '¡Ganada!' : 'Bloqueada'}
                              </span>
                            </div>
                            <p
                              className="font-display font-bold truncate"
                              style={{ fontSize: 15, color: '#3c3c3c', marginTop: 1 }}
                            >
                              {reading.milestoneBadge.patriarch}
                            </p>
                            <p
                              className="truncate"
                              style={{ fontSize: 12, color: '#777777' }}
                            >
                              {reading.milestoneBadge.title}
                            </p>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Final Celebration Card */}
      <div
        className="mt-4 rounded-2xl p-5 text-center"
        style={{
          background: '#ffc800',
          border: '3px solid #e5a400',
        }}
      >
        <div className="text-5xl mb-2 animate-bounce">🏆</div>
        <p
          className="font-display font-bold"
          style={{ fontSize: 20, color: '#3c3c3c' }}
        >
          ¡30 DÍAS CON JESUCRISTO!
        </p>
        <p
          className="mt-1 mx-auto"
          style={{ fontSize: 13, color: '#5c4a00', maxWidth: 280 }}
        >
          Al completar tu racha y reunir las tres cartas de los patriarcas, recibes la Carta Dorada.
        </p>
        <button
          onClick={() => onOpenBadgeDetail(SPECIAL_BADGES.jesucristo)}
          className="mt-3 inline-flex items-center gap-2 rounded-2xl px-5 font-display font-bold active:scale-95 transition-transform"
          style={{
            background: '#3c3c3c',
            color: '#ffc800',
            height: 44,
            fontSize: 14,
            border: '3px solid #222222',
          }}
        >
          <Sparkles className="w-4 h-4" />
          <span>Ver Carta Dorada</span>
        </button>
      </div>
    </div>
  );
};
