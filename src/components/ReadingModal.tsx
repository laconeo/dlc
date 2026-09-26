import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, CheckCircle, Clock, Heart, Share2, UserPlus, Flame, Sparkles } from 'lucide-react';
import { DayReading, Student } from '../types';
import { CHURCH_OT_URL } from '../data/readings';

interface ReadingModalProps {
  reading: DayReading | null;
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete: (day: number, note?: string) => Promise<void>;
}

/* Pillar colors in Duolingo tokens */
const PILLAR_CONFIG: Record<string, { color: string; bg: string; border: string; Icon: React.ElementType }> = {
  Amar:      { color: '#ff4b4b', bg: '#fff0f0', border: '#ffc8c8', Icon: Heart },
  Compartir: { color: '#1cb0f6', bg: '#e8f7ff', border: '#a0dcfc', Icon: Share2 },
  Invitar:   { color: '#58cc02', bg: '#e8f9d9', border: '#a4e060', Icon: UserPlus },
};
const defaultPillar = { color: '#ff4b4b', bg: '#fff0f0', border: '#ffc8c8', Icon: Heart };

export const ReadingModal: React.FC<ReadingModalProps> = ({
  reading,
  student,
  isOpen,
  onClose,
  onToggleComplete,
}) => {
  if (!isOpen || !reading) return null;

  const isCompleted = student?.completedDays?.includes(reading.day) || false;
  const initialNote = student?.notes?.[reading.day] || '';
  const [note, setNote] = useState(initialNote);
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const pillar = PILLAR_CONFIG[reading.pillar] || defaultPillar;
  const PillarIcon = pillar.Icon;

  const handleToggle = async () => {
    setLoading(true);
    try {
      const willComplete = !isCompleted;
      await onToggleComplete(reading.day, note);
      if (willComplete) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2400);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col bg-white overflow-hidden animate-fadeIn"
    >
      <div className="relative flex flex-col h-full">
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
            <label
              htmlFor="student-reflection-input"
              style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#3c3c3c', marginBottom: 6 }}
            >
              Tu reflexión personal (opcional)
            </label>
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
          </div>
        </div>

        {/* ── Footer Action ── */}
        <div style={{ padding: '12px 16px 16px', borderTop: '2px solid #f0f0f0', background: '#ffffff' }}>
          <button
            id="toggle-reading-status-btn"
            onClick={handleToggle}
            disabled={loading}
            className="font-display w-full flex items-center justify-center gap-2"
            style={{
              height: 56,
              borderRadius: 16,
              fontSize: 16,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.1s ease',
              ...(isCompleted
                ? { background: '#58cc02', borderBottom: '4px solid #46a302', color: '#ffffff' }
                : { background: '#58cc02', borderBottom: '4px solid #46a302', color: '#ffffff' }),
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
