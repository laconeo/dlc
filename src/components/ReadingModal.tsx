import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, CheckCircle, Clock, Heart, Share2, UserPlus, Flame, Sparkles, AlertCircle, Shield } from 'lucide-react';
import { DayReading, Student, isUserInstructor } from '../types';
import { CHURCH_OT_URL } from '../data/readings';

interface ReadingModalProps {
  reading: DayReading | null;
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete: (day: number, note?: string) => Promise<void>;
  onSaveNote?: (day: number, note: string) => Promise<void>;
}

/* Pillar colors in Duolingo tokens */
const PILLAR_CONFIG: Record<string, { color: string; bg: string; border: string; Icon: React.ElementType }> = {
  Amar:      { color: '#ff4b4b', bg: '#fff0f0', border: '#ffc8c8', Icon: Heart },
  Compartir: { color: '#1cb0f6', bg: '#e8f7ff', border: '#a0dcfc', Icon: Share2 },
  Invitar:   { color: '#58cc02', bg: '#e8f9d9', border: '#a4e060', Icon: UserPlus },
};
const defaultPillar = { color: '#ff4b4b', bg: '#fff0f0', border: '#ffc8c8', Icon: Heart };

/**
 * Calcula la diferencia en días calendario completos entre la fecha de lectura y hoy.
 * > 0 : fecha en el futuro (adelantados)
 * = 0 : fecha de hoy (se puede marcar)
 * < 0 : fecha ya transcurrida (pasó el día)
 */
function getDayDifference(calendarDateStr: string): number {
  if (!calendarDateStr) return 0;
  const [rYear, rMonth, rDay] = calendarDateStr.split('-').map(Number);
  const readingDateMidnight = new Date(rYear, rMonth - 1, rDay, 0, 0, 0, 0);

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const diffMs = readingDateMidnight.getTime() - todayMidnight.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export const ReadingModal: React.FC<ReadingModalProps> = ({
  reading,
  student,
  isOpen,
  onClose,
  onToggleComplete,
  onSaveNote,
}) => {
  if (!isOpen || !reading) return null;

  const isCompleted = student?.completedDays?.includes(reading.day) || false;
  const initialNote = student?.notes?.[reading.day] || '';
  const [note, setNote] = useState(initialNote);
  const [loading, setLoading] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Sincronizar nota si cambia la lectura seleccionada
  useEffect(() => {
    setNote(student?.notes?.[reading?.day ?? 0] || '');
    setNoteSavedFeedback(false);
  }, [reading?.day, student?.notes]);

  const pillar = PILLAR_CONFIG[reading.pillar] || defaultPillar;
  const PillarIcon = pillar.Icon;

  // Verificaciones de fecha y roles
  const isInstructor = isUserInstructor(student);
  const diffDays = getDayDifference(reading.calendarDate);
  const isToday = diffDays === 0;
  const isFuture = diffDays > 0;
  const isPast = diffDays < 0;

  const handleToggle = async () => {
    // Si no es instructor, no está completado y no es el día de hoy, impedir marcar
    if (!isInstructor && !isCompleted && !isToday) {
      return;
    }

    setLoading(true);
    try {
      const willComplete = !isCompleted;
      await onToggleComplete(reading.day, note);
      if (willComplete) {
        setShowCelebration(true);
        setTimeout(() => {
          setShowCelebration(false);
          onClose();
        }, 2400);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNoteOnly = async () => {
    if (!onSaveNote) return;
    setSavingNote(true);
    try {
      await onSaveNote(reading.day, note);
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 3000);
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col bg-white overflow-hidden animate-fadeIn"
    >
      <div className="relative flex flex-col h-full flex-1 min-h-0">
        {/* ── Header — solid Duolingo blue ── */}
        <div
          style={{
            background: '#1cb0f6',
            borderBottom: '3px solid #1899d6',
            padding: '20px 20px 18px',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <button
            id="close-reading-modal-btn"
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{ background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)' }}
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Day + pillar pill */}
          <div className="flex items-center gap-2 mb-2 flex-wrap" style={{ paddingLeft: 44 }}>
            <span
              className="font-display font-bold rounded-full px-3"
              style={{ background: '#ffc800', color: '#3c3c3c', fontSize: 12, height: 26, display: 'inline-flex', alignItems: 'center' }}
            >
              Día {reading.day} · {reading.dateStr}
            </span>
            <span
              className="font-display font-bold rounded-full px-3 flex items-center gap-1.5"
              style={{ background: pillar.bg, color: pillar.color, border: `2px solid ${pillar.border}`, fontSize: 12, height: 26 }}
            >
              <PillarIcon style={{ width: 13, height: 13 }} />
              {reading.pillar}
            </span>
          </div>

          <h1
            className="font-display font-bold text-white leading-tight"
            style={{ fontSize: 26 }}
          >
            {reading.character}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
            {reading.theme}
          </p>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '16px 16px 0' }}>

          {/* Scripture link card */}
          <div
            className="rounded-2xl p-4 mb-4"
            style={{ background: '#fffbe0', border: '2px solid #ffc800' }}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Clock style={{ width: 16, height: 16, color: '#e5a400' }} />
                <span className="font-bold uppercase" style={{ fontSize: 12, color: '#a07000', letterSpacing: '0.05em' }}>
                  Lectura de 3 Minutos
                </span>
              </div>
              <span
                className="font-display font-bold rounded-lg px-2"
                style={{ background: '#ffc800', color: '#3c3c3c', fontSize: 13, height: 26, display: 'inline-flex', alignItems: 'center' }}
              >
                {reading.scriptureRef}
              </span>
            </div>

            <p style={{ fontSize: 13, color: '#5c4a00', lineHeight: 1.5, marginBottom: 12 }}>
              Toma 3 minutos para detenerte, leer y conectar con Jesucristo.
            </p>

            <a
              id="open-official-scriptures-link"
              href={reading.scriptureUrl || CHURCH_OT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-duo-blue font-display w-full flex items-center justify-center gap-2"
              style={{ height: 48, borderRadius: 14, textDecoration: 'none', fontSize: 15 }}
            >
              <span>Abrir Escritura Oficial</span>
              <ExternalLink style={{ width: 18, height: 18 }} />
            </a>

            <div className="mt-2 text-center">
              <a
                href={CHURCH_OT_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: '#1899d6', fontWeight: 600, textDecoration: 'none' }}
              >
                Ver biblioteca completa del Antiguo Testamento →
              </a>
            </div>
          </div>

          {/* Connection thought */}
          <div
            className="rounded-2xl p-4 mb-4"
            style={{ background: '#f7f7f7', border: '2px solid #e5e5e5' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles style={{ width: 17, height: 17, color: '#a560f0' }} />
              <span className="font-display font-bold uppercase" style={{ fontSize: 12, color: '#777777', letterSpacing: '0.05em' }}>
                Conecta con Jesucristo
              </span>
            </div>
            <p
              className="italic"
              style={{
                fontSize: 14,
                color: '#3c3c3c',
                lineHeight: 1.6,
                background: '#ffffff',
                border: '2px solid #e5e5e5',
                borderRadius: 12,
                padding: '10px 12px',
              }}
            >
              «{reading.connectionThought}»
            </p>
          </div>

          {/* Ministering action */}
          <div
            className="rounded-2xl p-4 mb-4"
            style={{ background: pillar.bg, border: `2px solid ${pillar.border}` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <PillarIcon style={{ width: 17, height: 17, color: pillar.color }} />
              <span className="font-display font-bold uppercase" style={{ fontSize: 12, color: pillar.color, letterSpacing: '0.05em' }}>
                Desafío de Ministración: {reading.pillar}
              </span>
            </div>
            <p style={{ fontSize: 14, color: '#3c3c3c', lineHeight: 1.6 }}>
              {reading.dailyAction}
            </p>
          </div>

          {/* Personal note */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="student-reflection-input"
                style={{ fontSize: 14, fontWeight: 700, color: '#3c3c3c' }}
              >
                Tu reflexión personal (opcional)
              </label>
              {noteSavedFeedback && (
                <span className="text-xs font-bold text-[#58cc02] flex items-center gap-1 animate-fadeIn">
                  <CheckCircle style={{ width: 14, height: 14 }} /> ¡Reflexión guardada!
                </span>
              )}
            </div>
            <textarea
              id="student-reflection-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="¿Qué aprendiste hoy o cómo conectaste con Jesucristo?..."
              rows={2}
              style={{
                width: '100%',
                fontSize: 15,
                padding: '12px 14px',
                border: '2px solid #e5e5e5',
                borderRadius: 12,
                outline: 'none',
                resize: 'none',
                background: '#f7f7f7',
                color: '#3c3c3c',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#1cb0f6'; e.target.style.background = '#ffffff'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e5e5e5'; e.target.style.background = '#f7f7f7'; }}
            />
            {note !== initialNote && onSaveNote && (
              <div className="mt-2 flex justify-end">
                <button
                  id="save-reflection-only-btn"
                  onClick={handleSaveNoteOnly}
                  disabled={savingNote}
                  className="font-display text-xs font-bold py-1.5 px-3 rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform"
                  style={{
                    background: '#1cb0f6',
                    borderBottom: '3px solid #1899d6',
                    color: '#ffffff',
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span>{savingNote ? 'Guardando...' : 'Guardar reflexión'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer Action / Alerts según fecha y rol ── */}
        <div style={{ padding: '12px 16px 16px', borderTop: '2px solid #f0f0f0', background: '#ffffff', flexShrink: 0 }}>
          {isInstructor ? (
            /* ── MODO INSTRUCTOR: Siempre tiene habilitado el botón para marcar o desmarcar ── */
            <div className="flex flex-col gap-2">
              {!isToday && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200">
                  <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                    <Shield style={{ width: 14, height: 14, color: '#0284c7' }} />
                    Modo Instructor: {isFuture ? `Lectura del ${reading.dateStr} (adelantada)` : `Lectura del ${reading.dateStr} (pasada)`}
                  </span>
                  <span className="text-[11px] font-bold text-sky-600 uppercase">Habilitado</span>
                </div>
              )}

              <button
                id="toggle-reading-status-btn"
                onClick={handleToggle}
                disabled={loading}
                className="font-display w-full flex items-center justify-center gap-2 active:scale-98 transition-all"
                style={{
                  height: 56,
                  borderRadius: 16,
                  fontSize: 16,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: isCompleted ? '#58cc02' : '#58cc02',
                  borderBottom: '4px solid #46a302',
                  color: '#ffffff',
                }}
              >
                {loading ? (
                  <span style={{ fontSize: 24 }}>⏳</span>
                ) : isCompleted ? (
                  <>
                    <CheckCircle style={{ width: 22, height: 22 }} />
                    <span>¡Completado! (Desmarcar)</span>
                  </>
                ) : (
                  <>
                    <Flame style={{ width: 22, height: 22, color: '#ffc800' }} />
                    <span>Marcar como Leído +1 Racha 🔥</span>
                  </>
                )}
              </button>
            </div>
          ) : isCompleted ? (
            /* ── ALUMNO: Ya está marcada como completada ── */
            <div
              id="reading-completed-alert"
              className="rounded-2xl p-4 flex flex-col gap-2 animate-fadeIn"
              style={{
                background: '#f0fdf4',
                border: '2px solid #58cc02',
              }}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle style={{ width: 22, height: 22, color: '#58cc02', flexShrink: 0 }} />
                <span
                  className="font-display font-bold"
                  style={{ fontSize: 16, color: '#276e00', lineHeight: 1.3 }}
                >
                  Esta lectura ya está marcada como completada
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#4b7a2b', margin: 0, paddingLeft: 30, lineHeight: 1.4 }}>
                ¡Excelente trabajo! Has completado tu lectura de las escrituras y tu acción de ministración del Día {reading.day}.
              </p>

              {/* Opción para desmarcar disponible para el alumno solo el mismo día */}
              {isToday && (
                <div className="pt-2 mt-1 border-t border-dashed" style={{ borderColor: '#bbf7d0', textAlign: 'center' }}>
                  <button
                    id="unmark-reading-btn"
                    onClick={handleToggle}
                    disabled={loading}
                    className="text-xs font-bold transition-colors"
                    style={{
                      color: '#16a34a',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {loading ? 'Actualizando...' : 'Desmarcar esta lectura'}
                  </button>
                </div>
              )}
            </div>
          ) : isFuture ? (
            /* ── ALUMNO: El día no ha llegado (estamos adelantados) ── */
            <div
              id="reading-ahead-alert"
              className="rounded-2xl p-4 flex flex-col gap-2 animate-fadeIn"
              style={{
                background: '#e8f7ff',
                border: '2px solid #1cb0f6',
              }}
            >
              <div className="flex items-center gap-2.5">
                <Clock style={{ width: 22, height: 22, color: '#1cb0f6', flexShrink: 0 }} />
                <span
                  className="font-display font-bold"
                  style={{ fontSize: 16, color: '#0c7ab8', lineHeight: 1.3 }}
                >
                  {diffDays === 1
                    ? 'Aún falta 1 día para poder marcar esta lectura.'
                    : `Aún faltan ${diffDays} días para poder marcar esta lectura.`}
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#0369a1', margin: 0, paddingLeft: 30, lineHeight: 1.4 }}>
                Esta lección corresponde al <strong>{reading.dateStr}</strong>. Puedes leer las escrituras y meditar con calma, pero solo podrás marcarla completada el día correspondiente.
              </p>
            </div>
          ) : isPast ? (
            /* ── ALUMNO: El día ya pasó y no se leyó ── */
            <div
              id="reading-passed-alert"
              className="rounded-2xl p-4 flex flex-col gap-2 animate-fadeIn"
              style={{
                background: '#fff3e0',
                border: '2px solid #ff9600',
              }}
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle style={{ width: 22, height: 22, color: '#ff9600', flexShrink: 0 }} />
                <span
                  className="font-display font-bold"
                  style={{ fontSize: 16, color: '#c2410c', lineHeight: 1.3 }}
                >
                  El día de lectura pasó, pero no te preocupes: puedes continuar con el día de hoy
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#9a3412', margin: 0, paddingLeft: 30, lineHeight: 1.4 }}>
                Lo importante es perseverar y mantener tu conexión viva con Jesucristo. ¡Continúa con la lectura programada para hoy!
              </p>
            </div>
          ) : (
            /* ── ALUMNO: ¡Es el día de hoy y aún no está completada! ── */
            <button
              id="toggle-reading-status-btn"
              onClick={handleToggle}
              disabled={loading}
              className="font-display w-full flex items-center justify-center gap-2 active:scale-98 transition-all"
              style={{
                height: 56,
                borderRadius: 16,
                fontSize: 16,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: '#58cc02',
                borderBottom: '4px solid #46a302',
                color: '#ffffff',
              }}
            >
              {loading ? (
                <span style={{ fontSize: 24 }}>⏳</span>
              ) : (
                <>
                  <Flame style={{ width: 22, height: 22, color: '#ffc800' }} />
                  <span>Marcar como Leído +1 Racha 🔥</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* ── Celebration Overlay ── */}
        {showCelebration && (
          <div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center text-white p-6 animate-fadeIn"
            style={{ background: 'rgba(0,0,0,0.85)' }}
          >
            <div className="text-7xl animate-bounce mb-4">🔥</div>
            <h3
              className="font-display font-bold text-center"
              style={{ fontSize: 28, color: '#ffc800' }}
            >
              ¡Día {reading.day} Completado!
            </h3>
            <p style={{ fontSize: 15, color: '#e0e0e0', textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>
              Tu racha sigue ardiendo. ¡Sigue conectando con Jesucristo cada día!
            </p>
            <div
              className="font-display font-bold rounded-full px-5 mt-5"
              style={{ background: '#ffc800', color: '#3c3c3c', height: 40, display: 'flex', alignItems: 'center', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              +1 Día de Racha
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
