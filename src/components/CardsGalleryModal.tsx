import React from 'react';
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
} from 'lucide-react';
import { Student, SpecialBadge } from '../types';

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
}) => {
  if (isOpen === false) return null;

  const currentStreak = student?.currentStreak || 0;
  const completedCount = student?.completedDays?.length || 0;

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
                Regla para ganar la Carta:
              </p>
            </div>
            <p className="text-xs text-[#c2410c] leading-relaxed">
              La carta de la semana <strong>SOLO se gana si completas la TOTALIDAD de las lecturas sin perder ningún día</strong>. Debes marcar la lectura cada día correspondiente de forma consecutiva (7 de 7 días). Si se pierde un día, no se puede reclamar la carta de esa semana.
            </p>
          </div>

          {/* Cartas a ganar */}
          <p className="font-display font-bold text-xs text-[#475569] mb-2 uppercase tracking-wide">
            Las 4 Cartas del Desafío:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {/* Semana 1: Abraham */}
            <div
              className="rounded-2xl p-2.5 border-2 border-[#e2e8f0] text-center flex flex-col items-center"
              style={{ background: '#f8fafc' }}
            >
              <div className="w-9 h-9 rounded-xl bg-[#e0f2fe] flex items-center justify-center text-base mb-1 shadow-sm">
                🥈
              </div>
              <p className="font-display font-bold text-xs text-[#1e293b]">
                Abraham
              </p>
              <p className="text-[10px] text-[#64748b]">
                Semana 1 · 7 días seguidos
              </p>
            </div>

            {/* Semana 2: Isaac */}
            <div
              className="rounded-2xl p-2.5 border-2 border-[#e2e8f0] text-center flex flex-col items-center"
              style={{ background: '#f8fafc' }}
            >
              <div className="w-9 h-9 rounded-xl bg-[#dcfce7] flex items-center justify-center text-base mb-1 shadow-sm">
                🥈
              </div>
              <p className="font-display font-bold text-xs text-[#1e293b]">
                Isaac
              </p>
              <p className="text-[10px] text-[#64748b]">
                Semana 2 · 14 días seguidos
              </p>
            </div>

            {/* Semana 3: Jacob */}
            <div
              className="rounded-2xl p-2.5 border-2 border-[#e2e8f0] text-center flex flex-col items-center"
              style={{ background: '#f8fafc' }}
            >
              <div className="w-9 h-9 rounded-xl bg-[#f3e8ff] flex items-center justify-center text-base mb-1 shadow-sm">
                🥈
              </div>
              <p className="font-display font-bold text-xs text-[#1e293b]">
                Jacob
              </p>
              <p className="text-[10px] text-[#64748b]">
                Semana 3 · 21 días seguidos
              </p>
            </div>

            {/* Día 30: Jesucristo */}
            <div
              className="rounded-2xl p-2.5 border-2 border-[#ffe066] text-center flex flex-col items-center"
              style={{ background: '#fffdf0' }}
            >
              <div className="w-9 h-9 rounded-xl bg-[#fff3b0] flex items-center justify-center text-base mb-1 shadow-sm">
                👑
              </div>
              <p className="font-display font-bold text-xs text-[#78350f]">
                Jesucristo
              </p>
              <p className="text-[10px] text-[#b45309] font-bold">
                Carta Dorada · 30 días
              </p>
            </div>
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
    </div>
  );
};
