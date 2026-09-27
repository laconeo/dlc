import React from 'react';
import { ArrowLeft, Heart, Share2, UserPlus, CheckCircle } from 'lucide-react';

interface MinisteringGuideModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

const PILLARS = [
  {
    id: 'amar',
    number: '1',
    title: 'Amar',
    Icon: Heart,
    color: '#ff4b4b',
    bg: '#fff0f0',
    border: '#ffc8c8',
    text: 'Prestar atención individual a quienes nos rodean, escuchar con compasión sincera y actuar con bondad genuina.',
  },
  {
    id: 'compartir',
    number: '2',
    title: 'Compartir',
    Icon: Share2,
    color: '#1cb0f6',
    bg: '#e8f7ff',
    border: '#a0dcfc',
    text: 'Compartir pasajes inspiradores, experiencias espirituales y tu testimonio con tu familia, amigos y compañeros de clase.',
  },
  {
    id: 'invitar',
    number: '3',
    title: 'Invitar',
    Icon: UserPlus,
    color: '#58cc02',
    bg: '#e8f9d9',
    border: '#a4e060',
    text: 'Invitar con calidez a otros a unirse a la lectura diaria, asistir a Seminario y acercarse juntos a Cristo.',
  },
];

const BENEFITS = [
  'Hábitos espirituales diarios sostenibles',
  'Recuperación de clases y asistencias pendientes',
  'Avance en lecturas obligatorias de Seminario',
  'Fortalecimiento del estudio junto a la familia',
];

export const MinisteringGuideModal: React.FC<MinisteringGuideModalProps> = ({
  isOpen = true,
  onClose,
}) => {
  if (isOpen === false) return null;

  return (
    <div
      className="w-full h-full flex flex-col bg-white overflow-hidden animate-fadeIn"
    >
      <div className="relative flex flex-col h-full flex-1 min-h-0">
        {/* ── Header: Duolingo red/love ── */}
        <div
          style={{
            background: '#ff4b4b',
            borderBottom: '3px solid #ea2b2b',
            padding: '20px 20px 18px',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{ background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)' }}
            aria-label="Volver"
          >
            <ArrowLeft style={{ width: 18, height: 18, color: '#ffffff' }} />
          </button>

          <span
            className="font-display font-bold rounded-full px-3"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 24,
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              background: 'rgba(255,255,255,0.25)',
              border: '2px solid rgba(255,255,255,0.4)',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: 8,
              marginLeft: 44,
            }}
          >
            Área Sudamérica Sur
          </span>

          <h1
            className="font-display font-bold text-white"
            style={{ fontSize: 24, lineHeight: 1.2 }}
          >
            «Detente, Lee, Conecta»
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
            3 Minutos con Jesucristo · Ministración a Su manera
          </p>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '16px 16px 32px' }}>

          {/* Purpose */}
          <div
            className="rounded-2xl mb-4"
            style={{ padding: '14px 16px', background: '#e8f7ff', border: '2px solid #a0dcfc' }}
          >
            <h3
              className="font-display font-bold mb-2"
              style={{ fontSize: 15, color: '#1899d6' }}
            >
              Propósito Principal
            </h3>
            <p style={{ fontSize: 14, color: '#3c3c3c', lineHeight: 1.6 }}>
              Ayudar a los jóvenes a reservar{' '}
              <strong>3 minutos al día</strong> para detenerse, leer un pasaje del Antiguo Testamento y conectar con Jesucristo, fomentando la ministración a la manera del Salvador:{' '}
              <strong>Amar, Compartir e Invitar</strong>.
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="mb-4">
            <h3
              className="font-display font-bold mb-3"
              style={{ fontSize: 16, color: '#3c3c3c' }}
            >
              Los Tres Pilares de la Ministración
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PILLARS.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl flex items-start gap-3"
                  style={{ padding: '14px', background: p.bg, border: `2px solid ${p.border}` }}
                >
                  <div
                    className="rounded-xl flex items-center justify-center shrink-0"
                    style={{ width: 44, height: 44, background: p.color }}
                  >
                    <p.Icon style={{ width: 22, height: 22, color: '#ffffff' }} />
                  </div>
                  <div>
                    <h4
                      className="font-display font-bold"
                      style={{ fontSize: 16, color: p.color }}
                    >
                      {p.number}. {p.title}
                    </h4>
                    <p style={{ fontSize: 13, color: '#3c3c3c', lineHeight: 1.55, marginTop: 3 }}>
                      {p.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div
            className="rounded-2xl mb-4"
            style={{ padding: '14px 16px', background: '#f7f7f7', border: '2px solid #e5e5e5' }}
          >
            <h3
              className="font-display font-bold uppercase mb-3"
              style={{ fontSize: 13, color: '#777777', letterSpacing: '0.06em' }}
            >
              Beneficios Clave
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {BENEFITS.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle style={{ width: 20, height: 20, color: '#58cc02', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#3c3c3c' }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
