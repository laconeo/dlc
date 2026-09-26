import React, { useState } from 'react';
import { X, Award, Sparkles, Check, Lock, Shield } from 'lucide-react';
import { Student, SpecialBadge } from '../types';
import { SPECIAL_BADGES } from '../data/readings';

interface CardsGalleryModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  selectedBadge?: SpecialBadge | null;
}

/* Color palette per badge */
const BADGE_COLORS: Record<string, { color: string; bg: string; border: string; cardFrom: string; cardTo: string }> = {
  abraham:    { color: '#1cb0f6', bg: '#e8f7ff', border: '#a0dcfc', cardFrom: '#1cb0f6', cardTo: '#1899d6' },
  isaac:      { color: '#58cc02', bg: '#e8f9d9', border: '#a4e060', cardFrom: '#58cc02', cardTo: '#46a302' },
  jacob:      { color: '#a560f0', bg: '#f5eeff', border: '#c8a0f8', cardFrom: '#a560f0', cardTo: '#8a40d0' },
  jesucristo: { color: '#ffc800', bg: '#fffbe0', border: '#ffe066', cardFrom: '#ffc800', cardTo: '#e5a400' },
};

export const CardsGalleryModal: React.FC<CardsGalleryModalProps> = ({
  student,
  isOpen,
  onClose,
  selectedBadge: initialSelectedBadge,
}) => {
  if (!isOpen) return null;

  const [activeBadge, setActiveBadge] = useState<SpecialBadge>(
    initialSelectedBadge || SPECIAL_BADGES.abraham
  );

  const unlockedBadgeIds = student?.unlockedBadgeIds || [];
  const completedCount = student?.completedDays?.length || 0;

  const allBadges = [
    SPECIAL_BADGES.abraham,
    SPECIAL_BADGES.isaac,
    SPECIAL_BADGES.jacob,
    SPECIAL_BADGES.jesucristo,
  ];

  const isUnlocked = unlockedBadgeIds.includes(activeBadge.id);
  const bc = BADGE_COLORS[activeBadge.id] || BADGE_COLORS.abraham;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center overflow-y-auto animate-fadeIn"
      style={{ background: 'rgba(0,0,0,0.65)' }}
    >
      <div
        className="relative w-full sm:max-w-md flex flex-col overflow-hidden"
        style={{
          background: '#ffffff',
          borderRadius: '24px 24px 0 0',
          border: '2px solid #e5e5e5',
          maxHeight: '93dvh',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            background: '#3c3c3c',
            borderBottom: '3px solid #222222',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#ffc800' }}
            >
              <Award style={{ width: 22, height: 22, color: '#3c3c3c' }} />
            </div>
            <div>
              <h2
                className="font-display font-bold text-white"
                style={{ fontSize: 17, lineHeight: 1.2 }}
              >
                Álbum de Cartas de Racha
              </h2>
              <p style={{ fontSize: 12, color: '#afafaf' }}>
                Cartas plateadas de patriarcas y carta dorada
              </p>
            </div>
          </div>
          <button
            id="close-cards-gallery-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)' }}
          >
            <X style={{ width: 18, height: 18, color: '#ffffff' }} />
          </button>
        </div>

        {/* ── Badge Tab Selector ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            padding: '12px',
            background: '#f7f7f7',
            borderBottom: '2px solid #e5e5e5',
            flexShrink: 0,
          }}
        >
          {allBadges.map((badge) => {
            const bUnlocked = unlockedBadgeIds.includes(badge.id);
            const bCurrent = activeBadge.id === badge.id;
            const bColors = BADGE_COLORS[badge.id];

            return (
              <button
                key={badge.id}
                onClick={() => setActiveBadge(badge)}
                className="flex flex-col items-center gap-1.5 rounded-2xl transition-all active:scale-95"
                style={{
                  padding: '10px 6px',
                  background: bCurrent ? bColors.bg : '#ffffff',
                  border: `2px solid ${bCurrent ? bColors.color : '#e5e5e5'}`,
                  outline: bCurrent ? `3px solid ${bColors.color}40` : 'none',
                }}
              >
                <div
                  className="font-display font-bold flex items-center justify-center rounded-xl"
                  style={{
                    width: 34,
                    height: 34,
                    fontSize: 14,
                    background: bUnlocked ? bColors.color : '#e5e5e5',
                    color: bUnlocked ? '#ffffff' : '#afafaf',
                  }}
                >
                  {bUnlocked ? '✓' : badge.weekNumber <= 3 ? `S${badge.weekNumber}` : '👑'}
                </div>
                <span
                  className="font-display font-bold truncate w-full text-center"
                  style={{
                    fontSize: 11,
                    color: bCurrent ? bColors.color : '#777777',
                  }}
                >
                  {badge.patriarch.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Card Spotlight ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '20px 16px 0' }}>
          <div className="flex flex-col items-center">

            {/* Collectible Card */}
            <div
              className="relative overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
              style={{
                width: 260,
                borderRadius: 24,
                padding: '20px 18px',
                border: `4px solid ${isUnlocked ? bc.border : '#e5e5e5'}`,
                background: isUnlocked
                  ? `linear-gradient(160deg, ${bc.cardFrom}22 0%, #ffffff 50%, ${bc.cardFrom}11 100%)`
                  : '#f7f7f7',
                opacity: isUnlocked ? 1 : 0.7,
                filter: isUnlocked ? 'none' : 'grayscale(0.6)',
              }}
            >
              {/* Holographic sheen */}
              {isUnlocked && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)' }}
                />
              )}

              {/* Card type label */}
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span
                  className="font-display font-bold uppercase rounded-full px-3"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    height: 22,
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: '#3c3c3c',
                    color: '#ffffff',
                  }}
                >
                  {activeBadge.tier === 'gold' ? 'CARTA DORADA' : 'CARTA PLATEADA'}
                </span>
                <span
                  className="font-bold"
                  style={{ fontSize: 11, color: '#777777' }}
                >
                  {activeBadge.weekNumber <= 3 ? `Sem. ${activeBadge.weekNumber}` : 'Final'}
                </span>
              </div>

              {/* Card art icon */}
              <div className="my-4 flex justify-center relative z-10">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center"
                  style={{
                    background: isUnlocked ? bc.cardFrom : '#d0d0d0',
                    border: `3px solid ${isUnlocked ? bc.border : '#c0c0c0'}`,
                  }}
                >
                  {activeBadge.tier === 'gold' ? (
                    <Sparkles
                      style={{ width: 48, height: 48, color: '#ffffff', animationDuration: '8s' }}
                      className="animate-spin"
                    />
                  ) : (
                    <Shield style={{ width: 48, height: 48, color: '#ffffff' }} />
                  )}
                </div>
              </div>

              {/* Name & title */}
              <div className="text-center relative z-10">
                <h3
                  className="font-display font-bold"
                  style={{ fontSize: 22, color: '#3c3c3c', lineHeight: 1.2 }}
                >
                  {activeBadge.patriarch}
                </h3>
                <p style={{ fontSize: 13, color: '#777777', fontWeight: 600, marginTop: 2 }}>
                  {activeBadge.title}
                </p>
                <p
                  className="italic mt-3 rounded-xl"
                  style={{
                    fontSize: 12,
                    color: '#3c3c3c',
                    lineHeight: 1.5,
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    padding: '8px 10px',
                  }}
                >
                  {activeBadge.quote}
                </p>
              </div>

              {/* Locked / Unlocked status */}
              <div
                className="mt-4 pt-3 flex justify-center relative z-10"
                style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}
              >
                {isUnlocked ? (
                  <span
                    className="font-display font-bold flex items-center gap-2 rounded-full px-4"
                    style={{
                      height: 30,
                      fontSize: 12,
                      background: '#e8f9d9',
                      color: '#46a302',
                      border: '2px solid #a4e060',
                    }}
                  >
                    <Check style={{ width: 14, height: 14, strokeWidth: 3 }} />
                    ¡GANADA!
                  </span>
                ) : (
                  <span
                    className="font-bold flex items-center gap-2 rounded-full px-4"
                    style={{
                      height: 30,
                      fontSize: 12,
                      background: '#f0f0f0',
                      color: '#777777',
                      border: '2px solid #d0d0d0',
                    }}
                  >
                    <Lock style={{ width: 14, height: 14 }} />
                    Día {activeBadge.unlockedAtDay}
                  </span>
                )}
              </div>
            </div>

            {/* Info card */}
            <div
              className="w-full rounded-2xl mt-4 mb-4"
              style={{ padding: '14px 16px', background: '#f7f7f7', border: '2px solid #e5e5e5' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold" style={{ fontSize: 14, color: '#3c3c3c' }}>
                  Requisito de Desafío:
                </span>
                <span
                  className="font-display font-bold"
                  style={{ fontSize: 14, color: isUnlocked ? '#46a302' : bc.color }}
                >
                  {completedCount} / {activeBadge.unlockedAtDay} días
                </span>
              </div>
              {/* Progress mini-bar */}
              <div
                className="rounded-full overflow-hidden mb-3"
                style={{ height: 10, background: '#e5e5e5', border: '2px solid #d0d0d0' }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((completedCount / activeBadge.unlockedAtDay) * 100))}%`,
                    background: isUnlocked ? '#58cc02' : bc.cardFrom,
                  }}
                />
              </div>
              <p style={{ fontSize: 13, color: '#3c3c3c', lineHeight: 1.6 }}>
                {activeBadge.description}
              </p>
              <p style={{ fontSize: 12, color: '#777777', marginTop: 8, fontStyle: 'italic' }}>
                {activeBadge.tier === 'gold'
                  ? 'Reúne las 3 cartas plateadas completando los 30 días para recibir la Carta Dorada de Jesucristo.'
                  : 'Lee todos los días de la semana para desbloquear esta carta de personaje bíblico.'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: '12px 16px 16px', borderTop: '2px solid #f0f0f0', background: '#ffffff', flexShrink: 0 }}>
          <button
            onClick={onClose}
            className="btn-duo-green font-display w-full flex items-center justify-center"
            style={{ height: 52, borderRadius: 16, fontSize: 15 }}
          >
            Volver al Camino
          </button>
        </div>
      </div>
    </div>
  );
};
