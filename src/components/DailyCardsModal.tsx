import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Sparkles,
  CheckCircle,
  Eye,
  Trash2,
  Download,
  X,
  Shield,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { Student, isUserInstructor } from '../types';
import { READINGS_DATA } from '../data/readings';
import {
  getStoredDailyCards,
  saveDailyCard,
  deleteDailyCard,
  fetchRemoteDailyCards,
} from '../utils/dailyCardsStorage';

interface DailyCardsModalProps {
  student: Student | null;
  isOpen?: boolean;
  onClose: () => void;
}

/**
 * Optimiza y comprime la imagen a max 1200px de ancho para almacenamiento eficiente
 */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const DailyCardsModal: React.FC<DailyCardsModalProps> = ({
  student,
  isOpen = true,
  onClose,
}) => {
  if (isOpen === false) return null;

  const [cardsMap, setCardsMap] = useState<Record<number, string>>(() => getStoredDailyCards());
  const [uploadingDay, setUploadingDay] = useState<number | null>(null);
  const [activePreviewDay, setActivePreviewDay] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetDayRef = useRef<number>(1);

  const isInstructor = isUserInstructor(student);

  // Sincronizar remotamente
  useEffect(() => {
    fetchRemoteDailyCards().then((remote) => {
      setCardsMap(remote);
    });
  }, []);

  // Mostramos los 30 días del desafío
  const daysList = READINGS_DATA.slice(0, 30);
  const availableCount = daysList.filter((d) => Boolean(cardsMap[d.day])).length;

  const handleTriggerUpload = (day: number) => {
    targetDayRef.current = day;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const day = targetDayRef.current;
    const reading = READINGS_DATA.find((r) => r.day === day);
    const characterName = reading?.character || `Día ${day}`;

    setUploadingDay(day);
    try {
      const compressedDataUrl = await compressImage(file);
      await saveDailyCard(day, compressedDataUrl, characterName);

      setCardsMap((prev) => ({
        ...prev,
        [day]: compressedDataUrl,
      }));

      setFeedbackMsg(`¡Carta del Día ${day} (${characterName}) guardada con éxito!`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err) {
      console.error('Error al procesar la imagen:', err);
      alert('Hubo un error al procesar el archivo de imagen.');
    } finally {
      setUploadingDay(null);
    }
  };

  const handleDeleteCard = async (day: number, character: string) => {
    if (!window.confirm(`¿Deseas quitar la imagen de la carta del Día ${day} (${character}) y volver al placeholder?`)) {
      return;
    }

    try {
      await deleteDailyCard(day);
      setCardsMap((prev) => {
        const next = { ...prev };
        delete next[day];
        return next;
      });
      if (activePreviewDay === day) {
        setActivePreviewDay(null);
      }
      setFeedbackMsg(`Carta del Día ${day} restablecida a placeholder.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Error al eliminar carta:', err);
    }
  };

  const previewReading = activePreviewDay
    ? READINGS_DATA.find((r) => r.day === activePreviewDay)
    : null;

  return (
    <div className="w-full h-full flex flex-col bg-[#f8fafc] overflow-hidden animate-fadeIn">
      {/* Input oculto para subir archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Top Header ── */}
      <div
        className="shrink-0 flex items-center justify-between"
        style={{
          background: '#a855f7',
          borderBottom: '3px solid #9333ea',
          padding: '16px 18px',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{ background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)' }}
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="font-display font-bold text-white text-xl leading-tight">
              Cartas del Desafío
            </h1>
            <p className="text-xs text-purple-100 font-medium">
              30 Cartas coleccionables de lectura diaria
            </p>
          </div>
        </div>

        {/* Contador de cartas subidas */}
        <div
          className="font-display font-bold rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm"
          style={{ background: '#ffffff', color: '#7e22ce', fontSize: 13 }}
        >
          <Sparkles style={{ width: 14, height: 14, color: '#a855f7' }} />
          <span>{availableCount}/30</span>
        </div>
      </div>

      {/* ── Banner de feedback o aviso de Instructor ── */}
      {feedbackMsg && (
        <div className="bg-emerald-500 text-white font-bold text-sm py-2 px-4 text-center animate-fadeIn shrink-0 flex items-center justify-center gap-1.5 shadow-sm">
          <CheckCircle style={{ width: 16, height: 16 }} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {isInstructor && (
        <div className="bg-purple-50 border-b border-purple-200 py-2 px-3.5 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Shield style={{ width: 16, height: 16, color: '#7e22ce', flexShrink: 0 }} />
            <span className="text-xs font-bold text-purple-900 leading-tight">
              Modo Instructor: Puedes subir las cartas de cada día para completar los placeholders.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full shrink-0">
            Editor
          </span>
        </div>
      )}

      {/* ── Grid de las 30 Cartas ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pb-8">
          {daysList.map((reading) => {
            const cardImage = cardsMap[reading.day];
            const hasImage = Boolean(cardImage);
            const isCurrentUploading = uploadingDay === reading.day;

            return (
              <div
                key={reading.day}
                id={`daily-card-slot-${reading.day}`}
                className="relative rounded-2xl overflow-hidden flex flex-col transition-all duration-200 shadow-sm hover:shadow-md"
                style={{
                  background: '#ffffff',
                  border: hasImage ? '2px solid #e9d5ff' : '2px dashed #cbd5e1',
                }}
              >
                {/* ── Área de la Carta (Proporción 3:4 coleccionable) ── */}
                <div
                  className="relative w-full aspect-[3/4] overflow-hidden flex items-center justify-center cursor-pointer group"
                  onClick={() => {
                    if (hasImage) {
                      setActivePreviewDay(reading.day);
                    } else if (isInstructor) {
                      handleTriggerUpload(reading.day);
                    }
                  }}
                  style={{
                    background: hasImage
                      ? '#1e1b4b'
                      : 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
                  }}
                >
                  {/* Badge de Día (Siempre visible en la esquina) */}
                  <div
                    className="absolute top-2 left-2 z-10 font-display font-extrabold rounded-lg px-2 py-0.5 shadow-sm"
                    style={{
                      fontSize: 11,
                      background: hasImage ? '#a855f7' : '#94a3b8',
                      color: '#ffffff',
                    }}
                  >
                    Día {reading.day}
                  </div>

                  {hasImage ? (
                    /* Carta con Imagen Real */
                    <>
                      <img
                        src={cardImage}
                        alt={`Carta Día ${reading.day}: ${reading.character}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Overlay para ver en grande */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                        <Eye style={{ width: 16, height: 16 }} />
                        <span>Ver carta</span>
                      </div>
                    </>
                  ) : (
                    /* Placeholder Elegante */
                    <div className="p-3 text-center flex flex-col items-center justify-center h-full gap-2">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
                        style={{ background: '#e2e8f0', color: '#94a3b8' }}
                      >
                        <ImageIcon style={{ width: 24, height: 24 }} />
                      </div>
                      <div className="text-center px-1">
                        <p className="font-display font-bold text-xs text-slate-700 leading-tight">
                          {reading.character}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {reading.scriptureRef}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full mt-1">
                        {isInstructor ? 'Clic para subir' : 'Próximamente'}
                      </span>
                    </div>
                  )}

                  {/* Estado de carga al subir */}
                  {isCurrentUploading && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 z-20 text-white">
                      <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                      <span className="text-xs font-bold">Subiendo...</span>
                    </div>
                  )}
                </div>

                {/* ── Pie de Página de la Lectura del Día ── */}
                <div
                  className="p-2.5 flex flex-col gap-1 border-t shrink-0"
                  style={{
                    background: hasImage ? '#faf5ff' : '#f8fafc',
                    borderColor: hasImage ? '#e9d5ff' : '#e2e8f0',
                  }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-display font-extrabold text-xs text-slate-900 truncate">
                      Día {reading.day} · {reading.character}
                    </span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0"
                      style={{ background: '#f1f5f9', color: '#64748b' }}
                    >
                      {reading.dateStr}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium truncate flex items-center gap-1">
                    <BookOpen style={{ width: 11, height: 11, color: '#a855f7', flexShrink: 0 }} />
                    <span className="truncate">{reading.scriptureRef}</span>
                  </p>

                  {/* Acciones de Instructor (Subir / Cambiar / Borrar) */}
                  {isInstructor && (
                    <div className="pt-1.5 mt-1 border-t border-slate-200 flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerUpload(reading.day);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                        style={{
                          background: hasImage ? '#f3e8ff' : '#9333ea',
                          color: hasImage ? '#7e22ce' : '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        title={hasImage ? 'Cambiar imagen de la carta' : 'Subir imagen de la carta'}
                      >
                        <Upload style={{ width: 12, height: 12 }} />
                        <span>{hasImage ? 'Cambiar' : 'Subir'}</span>
                      </button>

                      {hasImage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCard(reading.day, reading.character);
                          }}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          title="Volver a placeholder"
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modal Lightbox para ver la Carta en Grande ── */}
      {activePreviewDay && previewReading && cardsMap[activePreviewDay] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActivePreviewDay(null)}
        >
          {/* Botón cerrar */}
          <button
            onClick={() => setActivePreviewDay(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Cerrar vista"
          >
            <X style={{ width: 22, height: 22 }} />
          </button>

          {/* Tarjeta y Detalle */}
          <div
            className="w-full max-w-sm flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagen en gran tamaño */}
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-slate-900">
              <img
                src={cardsMap[activePreviewDay]}
                alt={`Carta Día ${activePreviewDay}: ${previewReading.character}`}
                className="w-full h-auto max-h-[70vh] object-contain mx-auto"
              />
            </div>

            {/* Pie de página descriptivo */}
            <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 text-white flex items-center justify-between border border-white/20">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-amber-400 text-sm">
                    Día {activePreviewDay}
                  </span>
                  <span className="text-white/60 text-xs">·</span>
                  <span className="font-bold text-base text-white">
                    {previewReading.character}
                  </span>
                </div>
                <p className="text-xs text-white/80 mt-0.5">
                  {previewReading.scriptureRef} · {previewReading.theme}
                </p>
              </div>

              {/* Botón de descarga de la carta */}
              <a
                href={cardsMap[activePreviewDay]}
                download={`Carta_Dia_${activePreviewDay}_${previewReading.character.replace(/\s+/g, '_')}.jpg`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-md active:scale-95 transition-transform"
                style={{ textDecoration: 'none' }}
              >
                <Download style={{ width: 14, height: 14 }} />
                <span>Guardar</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
