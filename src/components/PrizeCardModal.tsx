import React, { useState, useRef } from 'react';
import {
  X,
  Award,
  Upload,
  Sparkles,
  Lock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Eye,
  Check,
  Share2,
} from 'lucide-react';
import { Student, SpecialBadge, isUserInstructor } from '../types';
import { READINGS_DATA } from '../data/readings';
import {
  compressPrizeCardImage,
  savePrizeCard,
  deletePrizeCard,
} from '../utils/prizeCardsStorage';

interface PrizeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: SpecialBadge;
  student: Student | null;
  prizeCardsMap: Record<number, string>;
  onCardUpdated: (week: number, imageUrl: string) => void;
  onCardDeleted?: (week: number) => void;
}

export const PrizeCardModal: React.FC<PrizeCardModalProps> = ({
  isOpen,
  onClose,
  badge,
  student,
  prizeCardsMap,
  onCardUpdated,
  onCardDeleted,
}) => {
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);
  const [previewAsStudent, setPreviewAsStudent] = useState(false);
  const [zoomImage, setZoomImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !badge) return null;

  const isInstructor = isUserInstructor(student);
  const canUpload = isInstructor && !previewAsStudent;
  const canManage = canUpload;

  const week = badge.weekNumber;
  const weekReadings = READINGS_DATA.filter((r) => r.week === week);
  const weekDays = weekReadings.map((r) => r.day);
  const totalDays = weekDays.length; // 7 días en semana 1, 2, 3; 9 días en semana 4

  const completedDays = student?.completedDays || [];
  const completedWeekDays = weekDays.filter((d) => completedDays.includes(d));
  const missingWeekDays = weekDays.filter((d) => !completedDays.includes(d));

  // Regla estricta: Se desbloquea SOLO si completó la TOTALIDAD de los días de la semana
  const isWeekCompleted = weekDays.length > 0 && weekDays.every((d) => completedDays.includes(d));

  // El instructor puede ver la carta siempre a menos que active la simulación de alumno
  const canViewCard = isInstructor ? (!previewAsStudent ? true : isWeekCompleted) : isWeekCompleted;

  const cardImageUrl = prizeCardsMap ? prizeCardsMap[week] : undefined;

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressed = await compressPrizeCardImage(file);
      const res = await savePrizeCard(week, compressed, badge.patriarch);

      onCardUpdated(week, compressed);

      if (res.cloudSynced) {
        setFeedback({ text: `¡Carta Premio de ${badge.patriarch} (Semana ${week}) guardada y sincronizada en la nube!` });
      } else {
        setFeedback({
          text: `⚠️ Guardada localmente. (Para sincronizar en nube ejecuta supabase/prize_cards.sql).`,
          isError: true,
        });
      }
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error('Error al subir carta premio:', err);
      alert('Hubo un error al procesar la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Deseas quitar la imagen de la Carta Premio de la Semana ${week} (${badge.patriarch})?`)) {
      return;
    }

    try {
      await deletePrizeCard(week);
      if (onCardDeleted) onCardDeleted(week);
      setFeedback({ text: 'Imagen de la carta eliminada.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
      {/* Input de archivo oculto para el instructor */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border-4"
        style={{ borderColor: isWeekCompleted ? '#ffc800' : '#e2e8f0' }}
      >
        {/* ── Header ── */}
        <div
          className="p-4 flex items-center justify-between text-white relative shrink-0"
          style={{
            background: isWeekCompleted
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : '#334155',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xl shadow-md"
              style={{
                background: isWeekCompleted ? '#ffc800' : '#475569',
                color: isWeekCompleted ? '#1e293b' : '#ffffff',
              }}
            >
              {isWeekCompleted ? '🏆' : <Lock className="w-5 h-5 text-slate-300" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Semana {badge.weekNumber} · {badge.tier === 'gold' ? 'Carta Dorada' : 'Carta Premio'}
                </span>
              </div>
              <h3 className="font-display font-bold text-base leading-tight mt-0.5">
                {badge.patriarch}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center active:scale-95 transition-all"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* ── Banner de feedback (Toast) ── */}
        {feedback && (
          <div
            className={`p-2.5 text-xs text-center font-bold font-display ${
              feedback.isError ? 'bg-amber-100 text-amber-900 border-b border-amber-200' : 'bg-emerald-100 text-emerald-900 border-b border-emerald-200'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* ── Barra de Instructor (si aplica) ── */}
        {isInstructor && (
          <div className="bg-[#f1f5f9] px-3.5 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Modo Instructor</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewAsStudent(!previewAsStudent)}
                className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>{previewAsStudent ? 'Ver como Maestro' : 'Simular Alumno'}</span>
              </button>
              <button
                onClick={handleTriggerUpload}
                disabled={uploading}
                className="bg-[#1cb0f6] text-white px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 hover:bg-[#1899d6] active:scale-95"
              >
                <Upload className="w-3 h-3" />
                <span>{uploading ? 'Cargando...' : cardImageUrl ? 'Cambiar Carta' : 'Subir Carta'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Contenido Scrollable ── */}
        <div className="p-4 overflow-y-auto no-scrollbar flex-1 space-y-3.5">
          {/* CASO 1: COMPLETÓ EL DESAFÍO (7/7 DÍAS) -> MUESTRA LA CARTA */}
          {canViewCard ? (
            <div className="flex flex-col items-center">
              {/* Badge de logro */}
              <div className="w-full bg-gradient-to-r from-amber-50 to-yellow-100 border-2 border-amber-300 rounded-2xl p-2.5 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎉</span>
                  <div>
                    <p className="font-display font-bold text-xs text-amber-900 leading-tight">
                      ¡Desafío de los {totalDays} Días Completado!
                    </p>
                    <p className="text-[10px] text-amber-700">
                      Has leído cada día de esta semana sin fallar.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  {completedWeekDays.length}/{totalDays}
                </span>
              </div>

              {/* Carta Premio Visual */}
              {cardImageUrl ? (
                <div className="relative group w-full flex flex-col items-center">
                  <div
                    onClick={() => setZoomImage(true)}
                    className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-[#ffc800] cursor-pointer max-w-[270px] transition-transform active:scale-95 bg-slate-900"
                    style={{
                      boxShadow: '0 10px 25px -5px rgba(255, 200, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <img
                      src={cardImageUrl}
                      alt={`Carta Premio: ${badge.patriarch}`}
                      className="w-full h-auto max-h-[340px] object-contain rounded-xl block"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                      <span className="bg-white/90 text-slate-800 text-[11px] font-bold px-3 py-1 rounded-full shadow">
                        🔍 Toca para ampliar
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2">
                    Toca la carta para verla en pantalla completa
                  </p>
                </div>
              ) : (
                /* Carta oficial de colección cuando aún no se subió foto externa */
                <div
                  className="w-full max-w-[270px] aspect-[3/4] rounded-3xl p-5 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-2xl border-4"
                  style={{
                    background: badge.tier === 'gold'
                      ? 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 40%, #fde68a 100%)'
                      : 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
                    borderColor: badge.tier === 'gold' ? '#f59e0b' : '#94a3b8',
                    boxShadow: badge.tier === 'gold'
                      ? '0 12px 30px -5px rgba(245, 158, 11, 0.4)'
                      : '0 12px 25px -5px rgba(100, 116, 139, 0.3)',
                  }}
                >
                  {/* Encabezado de la Carta */}
                  <div className="w-full flex items-center justify-between z-10">
                    <span className="font-display font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md bg-black/10 text-slate-800">
                      DLC · Semana {badge.weekNumber}
                    </span>
                    <span className="text-lg">
                      {badge.tier === 'gold' ? '👑' : '🥈'}
                    </span>
                  </div>

                  {/* Cuerpo Central */}
                  <div className="flex flex-col items-center my-auto z-10">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-2 shadow-md border-2"
                      style={{
                        background: badge.tier === 'gold' ? '#fde047' : '#ffffff',
                        borderColor: badge.tier === 'gold' ? '#eab308' : '#cbd5e1',
                      }}
                    >
                      {badge.tier === 'gold' ? '👑' : '📜'}
                    </div>
                    <h4 className="font-display font-black text-lg text-slate-900 tracking-tight">
                      {badge.patriarch}
                    </h4>
                    <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide mt-0.5">
                      {badge.tier === 'gold' ? 'Carta Dorada Suprema' : 'Patriarca de la Semana'}
                    </p>
                    <p className="text-[10px] text-slate-600 italic mt-2 px-1 line-clamp-3">
                      {badge.quote}
                    </p>
                  </div>

                  {/* Pie de Carta */}
                  <div className="w-full z-10">
                    <div className="bg-black/10 rounded-xl py-1 px-2 text-[10px] font-bold text-slate-800 flex items-center justify-center gap-1">
                      <span>✓ Racha 7/7 Completada</span>
                    </div>
                    {isInstructor && (
                      <button
                        onClick={handleTriggerUpload}
                        disabled={uploading}
                        className="mt-2 w-full bg-[#1cb0f6] text-white font-display font-bold text-[11px] py-1.5 px-2 rounded-xl shadow active:scale-95 flex items-center justify-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Foto Personalizada</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Cita y Descripción */}
              <div className="w-full bg-slate-50 rounded-2xl p-3 border border-slate-200 mt-3 text-center">
                <p className="font-serif italic text-xs text-slate-700 leading-snug">
                  {badge.quote}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {badge.description}
                </p>
              </div>
            </div>
          ) : (
            /* CASO 2: FALTÓ UN DÍA -> NO SE MUESTRA LA CARTA + MENSAJE "VAMOS PARA LA PRÓXIMA" */
            <div className="flex flex-col items-center text-center py-2">
              {/* Tarjeta de Carta Bloqueada con Candado */}
              <div className="w-full max-w-[240px] aspect-[3/4] bg-gradient-to-b from-slate-100 to-slate-200 rounded-3xl border-4 border-dashed border-slate-300 flex flex-col items-center justify-center p-5 shadow-inner relative overflow-hidden mb-3">
                <div className="w-16 h-16 rounded-full bg-slate-300/80 flex items-center justify-center text-slate-600 mb-3 shadow">
                  <Lock className="w-8 h-8 text-slate-500" />
                </div>
                <span className="font-display font-bold text-xs uppercase tracking-wider text-slate-500">
                  Carta Oculta
                </span>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  {badge.patriarch} · Semana {badge.weekNumber}
                </p>

                {/* Sombra de carta misteriosa */}
                <div className="absolute inset-0 bg-slate-900/5 pointer-events-none" />
              </div>

              {/* ── MENSAJE SOLICITADO: "¡VAMOS PARA LA PRÓXIMA!" ── */}
              <div className="w-full bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-300 rounded-3xl p-4 text-center shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 border border-orange-300 flex items-center justify-center text-2xl mx-auto mb-2 shadow-sm">
                  💪
                </div>
                <h4 className="font-display font-black text-base text-orange-950 uppercase tracking-tight">
                  ¡Vamos para la próxima!
                </h4>
                <p className="text-xs text-orange-900 leading-relaxed mt-1 font-medium">
                  Esta carta premio se gana <strong>únicamente al completar los {totalDays} días leídos</strong> sin perder ningún día.
                </p>

                {/* Resumen de días faltantes */}
                <div className="bg-white/80 rounded-2xl p-2.5 mt-2.5 border border-orange-200 text-left">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700">Tu progreso en esta semana:</span>
                    <span className="text-orange-600 font-display">
                      {completedWeekDays.length} de {totalDays} días
                    </span>
                  </div>
                  {missingWeekDays.length > 0 && (
                    <p className="text-[11px] text-slate-600 leading-tight">
                      {missingWeekDays.length === 1 ? (
                        <>Te faltó leer el <strong>Día {missingWeekDays[0]}</strong>.</>
                      ) : (
                        <>Días que faltaron leer: <strong>Días {missingWeekDays.join(', ')}</strong>.</>
                      )}
                    </p>
                  )}
                </div>

                <p className="text-[11px] text-orange-800 mt-2.5 leading-snug">
                  <strong>¡No te desanimes!</strong> Cada versículo que lees fortalece tu espíritu. ¡En la siguiente semana vamos con todo el ánimo por la próxima carta premio! 📖✨
                </p>
              </div>

              {/* Aviso del premio grupal */}
              <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 mt-3 text-left flex items-start gap-2">
                <span className="text-base shrink-0">🍕</span>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  <strong>Recuerda:</strong> Al finalizar el desafío saldremos todos juntos a una pizzería o heladería por perseverar y participar en clase.
                </p>
              </div>
            </div>
          )}

          {/* Botón de instructor para borrar carta si existe */}
          {canManage && cardImageUrl && (
            <div className="pt-2 text-center">
              <button
                onClick={handleDelete}
                className="text-[11px] text-red-500 hover:text-red-700 font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <span>Quitar imagen de esta carta premio</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 shrink-0 flex items-center justify-between gap-2">
          {canUpload ? (
            <button
              onClick={handleTriggerUpload}
              disabled={uploading}
              className="flex-1 bg-[#1cb0f6] text-white font-display font-bold text-xs py-2.5 px-3 rounded-2xl border-b-4 border-[#1899d6] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Cargando imagen...' : cardImageUrl ? 'Cambiar Imagen de Carta' : 'Subir Carta Premio'}</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-500 text-center w-full font-medium">
              {isWeekCompleted ? '¡Felicitaciones por tu constancia!' : '¡Sigue leyendo cada día!'}
            </div>
          )}

          <button
            onClick={onClose}
            className="bg-white text-slate-700 font-display font-bold text-xs py-2.5 px-4 rounded-2xl border border-slate-300 active:scale-95 transition-all shadow-sm"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* ── Modal de Zoom en Pantalla Completa ── */}
      {zoomImage && cardImageUrl && (
        <div
          onClick={() => setZoomImage(false)}
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div className="relative max-w-md w-full flex flex-col items-center">
            <button
              onClick={() => setZoomImage(false)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={cardImageUrl}
              alt={badge.patriarch}
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl border-4 border-[#ffc800]"
            />
            <p className="text-white text-xs mt-3 font-display font-bold">
              {badge.patriarch} · Carta Premio Semana {badge.weekNumber}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
