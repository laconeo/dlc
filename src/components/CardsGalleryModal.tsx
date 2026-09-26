import React from 'react';
import { Award, ArrowLeft, Sparkles, Lock, Flame, Shield } from 'lucide-react';
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
            id="close-cards-gallery-btn"
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
            <Award style={{ width: 22, height: 22, color: '#3c3c3c' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-white text-base leading-tight">
                Álbum de Cartas
              </h2>
              <span
                className="font-display font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide inline-block"
                style={{ background: '#ffc800', color: '#3c3c3c' }}
              >
                Próximamente
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#afafaf' }}>
              Coleccionables de Fe y Racha
            </p>
          </div>
        </div>
      </div>

      {/* ── Scrollable Body: Próximamente Content ── */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-5 flex flex-col items-center justify-center text-center">
        {/* Animated Golden Teaser Card */}
        <div
          className="relative rounded-3xl p-6 mb-6 shadow-xl border-4 transition-transform duration-300 hover:scale-105"
          style={{
            width: '100%',
            maxWidth: 280,
            background: 'linear-gradient(145deg, #fffbe0 0%, #ffffff 45%, #fff3b0 100%)',
            borderColor: '#ffc800',
          }}
        >
          {/* Card header */}
          <div className="flex justify-between items-center mb-3">
            <span
              className="font-display font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full"
              style={{ background: '#3c3c3c', color: '#ffc800' }}
            >
              Colección Especial
            </span>
            <Sparkles className="w-5 h-5 text-[#ffc800]" />
          </div>

          {/* Card Icon Spotlight */}
          <div
            className="w-24 h-24 rounded-2xl mx-auto my-3 flex items-center justify-center shadow-inner relative"
            style={{
              background: 'linear-gradient(135deg, #ffe066 0%, #ffc800 100%)',
              border: '3px solid #e5a400',
            }}
          >
            <Lock className="w-10 h-10 text-white drop-shadow-md" />
            <div
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md text-sm"
              style={{ background: '#ffffff', border: '2px solid #ffc800' }}
            >
              👑
            </div>
          </div>

          <h3 className="font-display font-bold text-lg text-[#3c3c3c] mt-2">
            Cartas de Patriarcas
          </h3>
          <p className="text-xs text-[#777777] font-medium mt-1">
            Abraham · Isaac · Jacob · Jesucristo
          </p>

          <div
            className="mt-4 pt-3 border-t-2 border-[#ffe066] flex items-center justify-center gap-2"
          >
            <span
              className="font-display font-bold text-xs uppercase px-3 py-1 rounded-xl"
              style={{ background: '#ff9600', color: '#ffffff' }}
            >
              Próximamente disponible
            </span>
          </div>
        </div>

        {/* Informative Explanation */}
        <h2 className="font-display font-bold text-2xl text-[#3c3c3c] mb-2">
          ¡Muy pronto en tu app!
        </h2>
        <p className="text-sm text-[#666666] max-w-xs leading-relaxed mb-5">
          Estamos afinando la entrega de cartas coleccionables para premiar tu avance semanal en las lecturas del Antiguo Testamento.
        </p>

        {/* Feature Preview Cards */}
        <div className="w-full max-w-sm space-y-2.5 mb-5 text-left">
          <div
            className="rounded-2xl p-3 flex items-center gap-3 border-2 border-[#e5e5e5]"
            style={{ background: '#f8fafc' }}
          >
            <div className="w-9 h-9 rounded-xl bg-[#e0f2fe] flex items-center justify-center shrink-0 text-[#0284c7]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-xs text-[#1e293b]">
                Cartas Plateadas de Patriarcas
              </p>
              <p className="text-[11px] text-[#64748b]">
                Se desbloquean al completar cada semana ininterrumpida de lectura (Semana 1, 2 y 3).
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl p-3 flex items-center gap-3 border-2 border-[#ffe066]"
            style={{ background: '#fffdf0' }}
          >
            <div className="w-9 h-9 rounded-xl bg-[#fff3b0] flex items-center justify-center shrink-0 text-[#d97706]">
              <Award className="w-5 h-5 text-[#d97706]" />
            </div>
            <div>
              <p className="font-display font-bold text-xs text-[#78350f]">
                Carta Dorada Suprema de Jesucristo
              </p>
              <p className="text-[11px] text-[#92400e]">
                Recompensa exclusiva al completar los 30 días del desafío.
              </p>
            </div>
          </div>
        </div>

        {/* Student Current Streak Feedback */}
        <div
          className="rounded-2xl p-3 border-2 border-[#bbf7d0] flex items-center justify-center gap-2 mb-2 w-full max-w-sm"
          style={{ background: '#f0fdf4' }}
        >
          <Flame className="w-5 h-5 text-[#16a34a] fill-[#16a34a]" />
          <span className="font-display font-bold text-xs text-[#15803d]">
            Tu progreso actual: {completedCount} de 30 días leídos · Racha: {currentStreak} días
          </span>
        </div>
      </div>

      {/* ── Bottom Action Button ── */}
      <div
        className="p-4 border-t-2 border-[#e5e5e5] bg-white shrink-0"
      >
        <button
          onClick={onClose}
          className="btn-duo-green w-full font-display font-bold text-base py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <span>← Volver al Camino de Lecturas</span>
        </button>
      </div>
    </div>
  );
};
