import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Clock,
  Heart,
  Share2,
  UserPlus,
  Flame,
  Sparkles,
  AlertCircle,
  Shield,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from 'lucide-react';
import { DayReading, Student, isUserInstructor } from '../types';
import { CHURCH_OT_URL } from '../data/readings';
import { SCRIPTURE_PASSAGES, SCRIPTURE_HEADERS, ScripturePassage } from '../data/scriptureTexts';

interface ReadingModalProps {
  reading: DayReading | null;
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete: (day: number, note?: string) => Promise<void>;
  onSaveNote?: (day: number, note: string) => Promise<void>;
}

/* Duolingo pillar tokens */
const PILLAR_CONFIG: Record<string, { color: string; bg: string; border: string; Icon: React.ElementType }> = {
  Amar:      { color: '#ff4b4b', bg: '#fff0f0', border: '#ffc8c8', Icon: Heart },
  Compartir: { color: '#1cb0f6', bg: '#e8f7ff', border: '#a0dcfc', Icon: Share2 },
  Invitar:   { color: '#58cc02', bg: '#e8f9d9', border: '#a4e060', Icon: UserPlus },
};
const defaultPillar = { color: '#ff4b4b', bg: '#fff0f0', border: '#ffc8c8', Icon: Heart };

type ReaderTheme = 'light' | 'sepia' | 'dark';

interface ThemeConfig {
  name: string;
  icon: string;
  bg: string;
  cardBg: string;
  text: string;
  secondaryText: string;
  border: string;
  verseColor: string;
  contextBg: string;
  contextBorder: string;
}

const THEMES: Record<ReaderTheme, ThemeConfig> = {
  light: {
    name: 'Blanco',
    icon: '⚪',
    bg: '#ffffff',
    cardBg: '#f8fafc',
    text: '#1e293b',
    secondaryText: '#64748b',
    border: '#e2e8f0',
    verseColor: '#b45309', // ámbar dorado suave
    contextBg: '#f1f5f9',
    contextBorder: '#cbd5e1',
  },
  sepia: {
    name: 'Sepia',
    icon: '📜',
    bg: '#fbf0d9',
    cardBg: '#f4e3c3',
    text: '#3b291a',
    secondaryText: '#785b42',
    border: '#e6d0af',
    verseColor: '#8c4009', // ámbar cálido
    contextBg: '#f4e8cf',
    contextBorder: '#dec39e',
  },
  dark: {
    name: 'Noche',
    icon: '🌙',
    bg: '#121214',
    cardBg: '#1b1b22',
    text: '#f4f4f5',
    secondaryText: '#a1a1aa',
    border: '#2e2e38',
    verseColor: '#fbbf24', // ámbar dorado luminoso
    contextBg: '#1a1d24',
    contextBorder: '#2b3240',
  },
};

const FONT_SIZE_STEPS = [
  { pt: '10pt', px: 13.5, label: '10pt' },
  { pt: '11pt', px: 14.5, label: '11pt' },
  { pt: '12pt', px: 16,   label: '12pt' }, // Oficial Gospel Library (default)
  { pt: '14pt', px: 18.5, label: '14pt' },
  { pt: '16pt', px: 21,   label: '16pt' },
  { pt: '18pt', px: 24,   label: '18pt' }, // +1 adicional
  { pt: '20pt', px: 27,   label: '20pt' }, // +2 adicional
];

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

  // Estados de configuración de lectura estilo Gospel Library
  const [themeKey, setThemeKey] = useState<ReaderTheme>(() => {
    return (localStorage.getItem('dlc_reader_theme') as ReaderTheme) || 'light';
  });
  const [fontSizeIndex, setFontSizeIndex] = useState<number>(() => {
    const saved = localStorage.getItem('dlc_reader_font_index');
    return saved !== null ? Number(saved) : 2; // 2 = 12pt (16px)
  });

  // Menú opcional para profundizar (Ministración y Reflexión)
  const [showDeepen, setShowDeepen] = useState(false);

  // Sincronizar nota si cambia la lectura seleccionada
  useEffect(() => {
    setNote(student?.notes?.[reading?.day ?? 0] || '');
    setNoteSavedFeedback(false);
  }, [reading?.day, student?.notes]);

  const handleThemeChange = (newTheme: ReaderTheme) => {
    setThemeKey(newTheme);
    localStorage.setItem('dlc_reader_theme', newTheme);
  };

  const handleFontSizeDecrease = () => {
    setFontSizeIndex((prev) => {
      const next = Math.max(0, prev - 1);
      localStorage.setItem('dlc_reader_font_index', String(next));
      return next;
    });
  };

  const handleFontSizeReset = () => {
    setFontSizeIndex(2); // 12pt
    localStorage.setItem('dlc_reader_font_index', '2');
  };

  const handleFontSizeIncrease = () => {
    setFontSizeIndex((prev) => {
      const next = Math.min(FONT_SIZE_STEPS.length - 1, prev + 1);
      localStorage.setItem('dlc_reader_font_index', String(next));
      return next;
    });
  };

  const pillar = PILLAR_CONFIG[reading.pillar] || defaultPillar;
  const PillarIcon = pillar.Icon;
  const theme = THEMES[themeKey];
  const currentFontSize = FONT_SIZE_STEPS[fontSizeIndex];

  // Pasaje sagrado in-app
  const passage: ScripturePassage | undefined = SCRIPTURE_PASSAGES[reading.day];

  // Verificaciones de fecha y roles
  const isInstructor = isUserInstructor(student);
  const diffDays = getDayDifference(reading.calendarDate);
  const isToday = diffDays === 0;
  const isFuture = diffDays > 0;
  const isPast = diffDays < 0;

  const handleToggle = async () => {
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
      className="w-full h-full flex flex-col overflow-hidden animate-fadeIn"
      style={{ background: theme.bg }}
    >
      <div className="relative flex flex-col h-full flex-1 min-h-0">
        {/* ── Header Principal — Azul Duolingo Compacto ── */}
        <div
          style={{
            background: '#1cb0f6',
            borderBottom: '3px solid #1899d6',
            padding: '16px 18px 14px',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <button
            id="close-reading-modal-btn"
            onClick={onClose}
            className="absolute top-3.5 left-3.5 w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{ background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)' }}
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Badges de Día y Personaje */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap" style={{ paddingLeft: 42 }}>
            <span
              className="font-display font-bold rounded-full px-3"
              style={{ background: '#ffc800', color: '#3c3c3c', fontSize: 12, height: 24, display: 'inline-flex', alignItems: 'center' }}
            >
              Día {reading.day} · {reading.dateStr}
            </span>
            <span
              className="font-display font-bold rounded-full px-2.5 flex items-center gap-1.5"
              style={{ background: pillar.bg, color: pillar.color, border: `1.5px solid ${pillar.border}`, fontSize: 11, height: 24 }}
            >
              <PillarIcon style={{ width: 12, height: 12 }} />
              {reading.pillar}
            </span>
          </div>

          <div style={{ paddingLeft: 42 }}>
            <h1
              className="font-display font-bold text-white leading-tight"
              style={{ fontSize: 22 }}
            >
              {reading.character}
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>
              {reading.theme}
            </p>
          </div>
        </div>

        {/* ── Barra de Herramientas Estilo Biblioteca del Evangelio ── */}
        <div
          className="flex items-center justify-between flex-wrap gap-2"
          style={{
            padding: '8px 14px',
            background: theme.cardBg,
            borderBottom: `2px solid ${theme.border}`,
            flexShrink: 0,
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}
        >
          {/* Selector de Temas */}
          <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl" style={{ border: `1px solid ${theme.border}` }}>
            <button
              onClick={() => handleThemeChange('light')}
              title="⚪ Blanco Clásico"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all active:scale-95"
              style={{
                background: themeKey === 'light' ? '#ffffff' : 'transparent',
                color: themeKey === 'light' ? '#1e293b' : theme.secondaryText,
                boxShadow: themeKey === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span>⚪</span>
              <span className="hidden sm:inline">Blanco</span>
            </button>
            <button
              onClick={() => handleThemeChange('sepia')}
              title="📜 Sepia Pergamino (descansa la vista)"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all active:scale-95"
              style={{
                background: themeKey === 'sepia' ? '#fbf0d9' : 'transparent',
                color: themeKey === 'sepia' ? '#3b291a' : theme.secondaryText,
                boxShadow: themeKey === 'sepia' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span>📜</span>
              <span className="hidden sm:inline">Sepia</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              title="🌙 Modo Noche"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all active:scale-95"
              style={{
                background: themeKey === 'dark' ? '#27272a' : 'transparent',
                color: themeKey === 'dark' ? '#f4f4f5' : theme.secondaryText,
                boxShadow: themeKey === 'dark' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span>🌙</span>
              <span className="hidden sm:inline">Noche</span>
            </button>
          </div>

          {/* Control de Tamaño de Letra: [ A- | 12pt | A+ ] */}
          <div
            className="flex items-center rounded-xl overflow-hidden"
            style={{ border: `1.5px solid ${theme.border}`, background: theme.bg }}
          >
            <button
              onClick={handleFontSizeDecrease}
              disabled={fontSizeIndex === 0}
              className="px-2.5 py-1 text-xs font-bold transition-all active:scale-95 disabled:opacity-40"
              style={{ color: theme.text, background: 'none', border: 'none', cursor: fontSizeIndex === 0 ? 'default' : 'pointer' }}
              title="Reducir tamaño de letra"
            >
              A-
            </button>
            <button
              onClick={handleFontSizeReset}
              className="px-2.5 py-1 text-xs font-bold border-x font-mono transition-colors hover:bg-black/5"
              style={{
                borderColor: theme.border,
                color: theme.verseColor,
                background: 'none',
                cursor: 'pointer',
              }}
              title="Restablecer tamaño oficial (12 pt)"
            >
              {currentFontSize.label}
            </button>
            <button
              onClick={handleFontSizeIncrease}
              disabled={fontSizeIndex === FONT_SIZE_STEPS.length - 1}
              className="px-2.5 py-1 text-xs font-bold transition-all active:scale-95 disabled:opacity-40"
              style={{ color: theme.text, background: 'none', border: 'none', cursor: fontSizeIndex === FONT_SIZE_STEPS.length - 1 ? 'default' : 'pointer' }}
              title="Aumentar tamaño de letra"
            >
              A+
            </button>
          </div>
        </div>

        {/* ── Scrollable Body: Lectura Sagrada 100% In-App ── */}
        <div
          className="flex-1 overflow-y-auto no-scrollbar"
          style={{
            padding: '20px 20px 30px',
            background: theme.bg,
            color: theme.text,
            transition: 'background 0.3s ease, color 0.3s ease',
          }}
        >
          {/* ── Encabezado Oficial Estilo Biblioteca del Evangelio (Gospel Library) ── */}
          {(() => {
            const headerInfo = SCRIPTURE_HEADERS[reading.day] || {
              book: reading.character.toUpperCase(),
              subtitle: reading.scriptureRef,
              testament: 'Antiguo Testamento',
            };
            return (
              <div className="text-center my-4 pb-4" style={{ borderBottom: `2px solid ${theme.border}` }}>
                <span
                  className="font-display font-bold uppercase tracking-widest text-[11px] block mb-1"
                  style={{ color: theme.secondaryText, letterSpacing: '0.18em' }}
                >
                  {headerInfo.testament || 'Antiguo Testamento'}
                </span>
                <h2
                  className="font-bold tracking-wide mt-1 mb-1.5"
                  style={{
                    fontFamily: '"Times New Roman", Times, "Songti SC", serif',
                    fontSize: 30,
                    letterSpacing: '0.04em',
                    color: theme.text,
                    textTransform: 'uppercase',
                    lineHeight: 1.15,
                  }}
                >
                  {headerInfo.book}
                </h2>
                <p
                  style={{
                    fontFamily: '"Times New Roman", Times, serif',
                    fontSize: 15.5,
                    fontStyle: 'italic',
                    color: theme.verseColor,
                    margin: 0,
                  }}
                >
                  {headerInfo.subtitle}
                </p>
                <div
                  className="mx-auto mt-3.5"
                  style={{
                    width: 54,
                    height: 2,
                    background: theme.verseColor,
                    opacity: 0.55,
                    borderRadius: 2,
                  }}
                />
              </div>
            );
          })()}

          {/* Resumen contextual estilo sumario de capítulo de Biblioteca del Evangelio */}
          {passage?.contextSummary && (
            <div
              className="rounded-2xl p-4 mb-6 text-sm"
              style={{
                background: theme.contextBg,
                border: `1.5px solid ${theme.contextBorder}`,
                color: theme.text,
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5 font-bold uppercase tracking-wider text-[11px]" style={{ color: theme.verseColor }}>
                <BookOpen style={{ width: 13, height: 13 }} />
                <span>Contexto de la lectura</span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontFamily: '"Times New Roman", Times, serif',
                  fontStyle: 'italic',
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: theme.text,
                }}
              >
                {passage.contextSummary}
              </p>
            </div>
          )}

          {/* ── Texto Sagrado: Versículos separados por punto y aparte estilo Gospel Library ── */}
          <div
            className="select-text"
            style={{
              fontFamily: '"Times New Roman", Times, "Songti SC", serif',
              fontSize: currentFontSize.px,
              lineHeight: 1.75,
              color: theme.text,
              letterSpacing: '0.01em',
            }}
          >
            {passage?.verses && passage.verses.length > 0 ? (
              <div className="space-y-4">
                {passage.verses.map((v, idx) => (
                  <p
                    key={idx}
                    style={{
                      marginBottom: '16px',
                      textAlign: 'justify',
                      textJustify: 'inter-word',
                      lineHeight: 1.75,
                      fontFamily: 'inherit',
                    }}
                  >
                    {/* Número de versículo en superíndice en negrita ámbar/dorado suave */}
                    <sup
                      className="font-bold select-none mr-1.5"
                      style={{
                        color: theme.verseColor,
                        fontSize: '0.74em',
                        lineHeight: 1,
                        verticalAlign: 'super',
                        fontFamily: 'inherit',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {v.verseNumber}
                    </sup>
                    <span>{v.text}</span>
                  </p>
                ))}
              </div>
            ) : (
              <p className="italic text-center py-6">
                Cargando el texto sagrado del día...
              </p>
            )}
          </div>

          {/* Enlace secundario y discreto a Gospel Library web */}
          <div className="mt-5 pt-3 text-right" style={{ borderTop: `1px dashed ${theme.border}` }}>
            <a
              id="open-official-scriptures-link"
              href={reading.scriptureUrl || CHURCH_OT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
              style={{ color: '#0284c7', textDecoration: 'none' }}
            >
              <span>Ver con notas al pie en ChurchofJesusChrist.org</span>
              <ExternalLink style={{ width: 12, height: 12 }} />
            </a>
          </div>

          {/* ── Sección «3 Minutos con Jesucristo» ── */}
          <div
            className="mt-6 p-4 rounded-2xl animate-fadeIn"
            style={{
              background: themeKey === 'dark' ? '#1f1b13' : themeKey === 'sepia' ? '#f4e3c3' : '#fffbeb',
              border: `2px solid ${themeKey === 'dark' ? '#78350f' : '#fde68a'}`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles style={{ width: 17, height: 17, color: '#d97706' }} />
              <span className="font-display font-bold text-xs uppercase tracking-wider" style={{ color: '#b45309' }}>
                3 Minutos con Jesucristo
              </span>
            </div>
            <p
              className="italic leading-relaxed"
              style={{
                fontSize: currentFontSize.px - 1,
                color: theme.text,
                fontFamily: '"Times New Roman", Times, serif',
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              «{reading.connectionThought}»
            </p>
          </div>

          {/* ── Menú desplegable opcional: Profundizar (Ministración y Reflexión) ── */}
          <div className="mt-6 mb-4">
            <button
              id="toggle-deepen-section-btn"
              type="button"
              onClick={() => setShowDeepen((prev) => !prev)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl transition-all active:scale-98"
              style={{
                background: theme.cardBg,
                border: `2px solid ${theme.border}`,
                color: theme.text,
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles style={{ width: 17, height: 17, color: '#a560f0' }} />
                <span className="font-display font-bold text-left" style={{ fontSize: 13.5 }}>
                  Profundizar: Ministración y Reflexión Personal
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: theme.secondaryText }}>
                <span>{showDeepen ? 'Ocultar' : 'Abrir'}</span>
                {showDeepen ? <ChevronUp style={{ width: 16, height: 16 }} /> : <ChevronDown style={{ width: 16, height: 16 }} />}
              </div>
            </button>

            {showDeepen && (
              <div className="mt-3 flex flex-col gap-3.5 animate-fadeIn">
                {/* Desafío de ministración */}
                <div
                  className="rounded-2xl p-4"
                  style={{ background: pillar.bg, border: `2px solid ${pillar.border}` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <PillarIcon style={{ width: 17, height: 17, color: pillar.color }} />
                    <span className="font-display font-bold uppercase" style={{ fontSize: 12, color: pillar.color, letterSpacing: '0.05em' }}>
                      Desafío de Ministración: {reading.pillar}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, margin: 0 }}>
                    {reading.dailyAction}
                  </p>
                </div>

                {/* Reflexión personal */}
                <div
                  className="rounded-2xl p-4"
                  style={{ background: theme.cardBg, border: `2px solid ${theme.border}` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="student-reflection-input"
                      className="font-display font-bold"
                      style={{ fontSize: 13.5, color: theme.text }}
                    >
                      Tu reflexión personal (opcional)
                    </label>
                    {noteSavedFeedback && (
                      <span className="text-xs font-bold text-[#58cc02] flex items-center gap-1 animate-fadeIn">
                        <CheckCircle style={{ width: 14, height: 14 }} /> ¡Guardada!
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
                      fontSize: 14,
                      padding: '10px 12px',
                      border: `1.5px solid ${theme.border}`,
                      borderRadius: 12,
                      outline: 'none',
                      resize: 'none',
                      background: theme.bg,
                      color: theme.text,
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
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
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <span>{savingNote ? 'Guardando...' : 'Guardar reflexión'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer Action: ¡He Terminado de Leer! (+1 Racha 🔥) ── */}
        <div
          style={{
            padding: '12px 16px 16px',
            borderTop: `2px solid ${theme.border}`,
            background: theme.cardBg,
            flexShrink: 0,
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}
        >
          {isInstructor ? (
            /* ── MODO INSTRUCTOR: Siempre habilitado para marcar o desmarcar ── */
            <div className="flex flex-col gap-2">
              {!isToday && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200">
                  <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                    <Shield style={{ width: 14, height: 14, color: '#0284c7' }} />
                    Modo Maestro: {isFuture ? `Lectura del ${reading.dateStr} (adelantada)` : `Lectura del ${reading.dateStr} (pasada)`}
                  </span>
                  <span className="text-[11px] font-bold text-sky-600 uppercase">Habilitado</span>
                </div>
              )}

              <button
                id="toggle-reading-status-btn"
                onClick={handleToggle}
                disabled={loading}
                className="font-display w-full flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md"
                style={{
                  height: 54,
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
                    <span>🔥 ¡He Terminado de Leer! (+1 Racha 🔥)</span>
                  </>
                )}
              </button>
            </div>
          ) : isCompleted ? (
            /* ── ALUMNO: Ya está completada ── */
            <div
              id="reading-completed-alert"
              className="rounded-2xl p-3.5 flex flex-col gap-2 animate-fadeIn"
              style={{
                background: '#f0fdf4',
                border: '2px solid #58cc02',
              }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle style={{ width: 20, height: 20, color: '#58cc02', flexShrink: 0 }} />
                <span
                  className="font-display font-bold"
                  style={{ fontSize: 15, color: '#166534', lineHeight: 1.3 }}
                >
                  ¡Día {reading.day} completado con éxito!
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: '#15803d', margin: 0, paddingLeft: 28, lineHeight: 1.4 }}>
                Has leído la palabra sagrada y mantenido tu conexión con el Salvador.
              </p>

              {isToday && (
                <div className="pt-2 mt-0.5 border-t border-dashed" style={{ borderColor: '#bbf7d0', textAlign: 'center' }}>
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
            /* ── ALUMNO: Día futuro (adelantado) ── */
            <div
              id="reading-ahead-alert"
              className="rounded-2xl p-3.5 flex flex-col gap-1.5 animate-fadeIn"
              style={{
                background: '#e0f2fe',
                border: '2px solid #38bdf8',
              }}
            >
              <div className="flex items-center gap-2">
                <Clock style={{ width: 20, height: 20, color: '#0284c7', flexShrink: 0 }} />
                <span
                  className="font-display font-bold"
                  style={{ fontSize: 14.5, color: '#0369a1', lineHeight: 1.3 }}
                >
                  {diffDays === 1
                    ? 'Aún falta 1 día para poder registrar esta lectura.'
                    : `Aún faltan ${diffDays} días para poder registrar esta lectura.`}
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: '#075985', margin: 0, paddingLeft: 28, lineHeight: 1.4 }}>
                Puedes leer el pasaje con calma para prepararte. Podrás registrar tu racha el <strong>{reading.dateStr}</strong>.
              </p>
            </div>
          ) : isPast ? (
            /* ── ALUMNO: Día pasado ── */
            <div
              id="reading-passed-alert"
              className="rounded-2xl p-3.5 flex flex-col gap-1.5 animate-fadeIn"
              style={{
                background: '#fff3e0',
                border: '2px solid #ff9600',
              }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle style={{ width: 20, height: 20, color: '#d97706', flexShrink: 0 }} />
                <span
                  className="font-display font-bold"
                  style={{ fontSize: 14.5, color: '#b45309', lineHeight: 1.3 }}
                >
                  El día de lectura pasó, pero puedes continuar con el día de hoy
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: '#9a3412', margin: 0, paddingLeft: 28, lineHeight: 1.4 }}>
                Lo importante es perseverar cada día. ¡Sigue leyendo hoy y mantén tu conexión con Cristo!
              </p>
            </div>
          ) : (
            /* ── ALUMNO: Día de hoy listo para registrar ── */
            <button
              id="toggle-reading-status-btn"
              onClick={handleToggle}
              disabled={loading}
              className="font-display w-full flex items-center justify-center gap-2 active:scale-98 transition-all shadow-lg"
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
                  <span>🔥 ¡He Terminado de Leer! (+1 Racha 🔥)</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* ── Celebration Overlay ── */}
        {showCelebration && (
          <div
            onClick={() => {
              setShowCelebration(false);
              onClose();
            }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center text-white p-6 animate-fadeIn cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            title="Toca para continuar"
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
              +1 Día de Racha 🔥
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
