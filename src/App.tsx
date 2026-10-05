import React, { useState, useEffect } from 'react';
import { TopHeader } from './components/TopHeader';
import { PathView } from './components/PathView';
import { ReadingModal } from './components/ReadingModal';
import { CardsGalleryModal } from './components/CardsGalleryModal';
import { DailyCardsModal } from './components/DailyCardsModal';
import { AdminInstructorModal } from './components/AdminInstructorModal';
import { StudentAuthModal } from './components/StudentAuthModal';
import { MinisteringGuideModal } from './components/MinisteringGuideModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { BottomNav, NavTab } from './components/BottomNav';
import { DayReading, Student, SpecialBadge } from './types';
import { getLocalStudent, clearLocalStudent, toggleStudentDay, loginStudent, logoutStudent, getCurrentSessionStudent, saveStudentNote } from './utils/api';
import { supabase } from './utils/supabase';
import { SPECIAL_BADGES } from './data/readings';

export type AppPage = 'path' | 'reading' | 'dailyCards' | 'cards' | 'ministering' | 'profile' | 'instructor';

export default function App() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  // Active page view
  const [currentPage, setCurrentPage] = useState<AppPage>('path');

  // Selected item states
  const [selectedReading, setSelectedReading] = useState<DayReading | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<SpecialBadge | null>(null);

  // Load existing student or prompt login/register
  useEffect(() => {
    // Si la URL contiene un token de recuperación de contraseña,
    // debemos mostrar la pantalla de recuperación y no auto-ingresar
    const hasRecovery =
      window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery');

    if (hasRecovery) {
      setStudent(null);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStudent(null);
      }
    });

    const initStudent = async () => {
      setLoading(true);
      try {
        // 1. Verificar si hay sesión activa en Supabase Auth
        const sessionStudent = await getCurrentSessionStudent();
        if (sessionStudent) {
          setStudent(sessionStudent);
          return;
        }

        // 2. Si no hay sesión activa pero hay credenciales guardadas
        const saved = getLocalStudent();
        if (saved && saved.email && saved.password) {
          try {
            const synced = await loginStudent(saved.email, saved.password);
            setStudent(synced);
            return;
          } catch {
            // Si las credenciales fallan, limpiamos la sesión inválida
            clearLocalStudent();
          }
        }

        // 3. Sin sesión activa
        setStudent(null);
      } catch (err) {
        console.warn('Initialization error:', err);
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };
    initStudent();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handlers
  const handleOpenReading = (reading: DayReading) => {
    setSelectedReading(reading);
    setCurrentPage('reading');
  };

  const handleToggleDay = async (day: number, note?: string) => {
    if (!student) return;
    const updated = await toggleStudentDay(student.id, day, note);
    setStudent(updated);
  };

  const handleSaveNote = async (day: number, note: string) => {
    if (!student) return;
    const updated = await saveStudentNote(student.id, day, note);
    setStudent(updated);
  };

  const handleOpenBadge = (badge: SpecialBadge) => {
    setSelectedBadge({ ...badge });
    setCurrentPage('cards');
  };

  const handleSelectTab = (tab: NavTab) => {
    setCurrentPage(tab);
  };

  const handleAuthSuccess = (newStudent: Student) => {
    setStudent(newStudent);
    setCurrentPage('path');
  };

  const handleLogout = async () => {
    await logoutStudent();
    setStudent(null);
    setCurrentPage('path');
  };

  // ── 1. LOADING SCREEN ──
  if (loading) {
    return (
      <div className="h-screen h-[100dvh] max-h-[100dvh] bg-[#e5e5e5] flex justify-center items-center overflow-hidden">
        <div className="w-full max-w-md h-full bg-white flex flex-col items-center justify-center gap-3 sm:shadow-xl sm:border-x sm:border-[#e5e5e5]">
          <span className="text-5xl animate-bounce">📖</span>
          <p className="font-display font-bold text-base text-[#3c3c3c]">
            Cargando «Detente, Lee, Conecta»...
          </p>
        </div>
      </div>
    );
  }

  // ── 2. STANDALONE FULL-PAGE AUTH (LOGIN / REGISTER) ──
  if (!student) {
    return (
      <div className="h-screen h-[100dvh] max-h-[100dvh] bg-[#e5e5e5] flex justify-center overflow-hidden">
        <div className="w-full max-w-md h-full bg-white flex flex-col relative sm:shadow-xl sm:border-x sm:border-[#e5e5e5] overflow-hidden">
          <StudentAuthModal
            isOpen={true}
            currentStudent={null}
            onSuccess={handleAuthSuccess}
          />
        </div>
      </div>
    );
  }

  // Map currentPage to bottom nav tab when applicable
  const currentTab: NavTab =
    currentPage === 'dailyCards' || currentPage === 'cards' || currentPage === 'ministering' || currentPage === 'profile'
      ? currentPage
      : 'path';

  const showBottomNav =
    currentPage === 'path' ||
    currentPage === 'dailyCards' ||
    currentPage === 'cards' ||
    currentPage === 'ministering' ||
    currentPage === 'profile';

  return (
    <div className="h-screen h-[100dvh] max-h-[100dvh] bg-[#e5e5e5] flex justify-center selection:bg-[#1cb0f6] selection:text-white overflow-hidden">
      {/* Mobile-first main application frame */}
      <div className="w-full max-w-md h-full flex flex-col relative sm:shadow-xl sm:border-x sm:border-[#e5e5e5] bg-white overflow-hidden">

        {/* ── TOP HEADER (Only on main path) ── */}
        {currentPage === 'path' && (
          <TopHeader
            student={student}
            onOpenAdmin={() => setCurrentPage('instructor')}
            onOpenProfile={() => setCurrentPage('profile')}
          />
        )}

        {/* ── MAIN CONTENT AREA (PAGES) ── */}
        <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
          {/* PAGE 1: CAMINO DE LECTURAS (30 días con scroll suave y continuo) */}
          {currentPage === 'path' && (
            <main
              id="path-main-scroll"
              className="flex-1 min-h-0 overflow-y-auto no-scrollbar relative"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <PathView
                student={student}
                onSelectReading={handleOpenReading}
                onOpenBadgeDetail={handleOpenBadge}
              />
            </main>
          )}

          {/* PAGE 2: DETALLE DE LECTURA (Página completa) */}
          {currentPage === 'reading' && selectedReading && (
            <ReadingModal
              reading={selectedReading}
              student={student}
              isOpen={true}
              onClose={() => setCurrentPage('path')}
              onToggleComplete={handleToggleDay}
              onSaveNote={handleSaveNote}
            />
          )}

          {/* PAGE 3A: CARTAS DE LECTURA DIARIA (30 cartas con subida de instructor) */}
          {currentPage === 'dailyCards' && (
            <DailyCardsModal
              student={student}
              isOpen={true}
              onClose={() => setCurrentPage('path')}
            />
          )}

          {/* PAGE 3B: PREMIOS Y PATRIARCAS (Página completa) */}
          {currentPage === 'cards' && (
            <CardsGalleryModal
              student={student}
              isOpen={true}
              onClose={() => {
                setSelectedBadge(null);
                setCurrentPage('path');
              }}
              selectedBadge={selectedBadge}
            />
          )}

          {/* PAGE 4: GUÍA DE MINISTRACIÓN (Página completa) */}
          {currentPage === 'ministering' && (
            <MinisteringGuideModal
              isOpen={true}
              onClose={() => setCurrentPage('path')}
            />
          )}

          {/* PAGE 5: PERFIL DE ESTUDIANTE (Página completa) */}
          {currentPage === 'profile' && (
            <StudentProfileModal
              student={student}
              isOpen={true}
              onClose={() => setCurrentPage('path')}
              onSwitchAccount={() => setStudent(null)}
              onLogout={handleLogout}
              onOpenAdmin={() => setCurrentPage('instructor')}
              onStudentUpdated={(updated) => setStudent(updated)}
            />
          )}

          {/* PAGE 6: PANEL DEL INSTRUCTOR (Página completa) */}
          {currentPage === 'instructor' && (
            <AdminInstructorModal
              isOpen={true}
              currentStudent={student}
              onClose={() => setCurrentPage('path')}
              onStudentUpdated={() => {
                if (student) {
                  const refreshed = getLocalStudent();
                  if (refreshed) setStudent(refreshed);
                }
              }}
            />
          )}
        </div>

        {/* ── BOTTOM NAVIGATION (Visible en las vistas principales de la app) ── */}
        {showBottomNav && (
          <BottomNav
            currentTab={currentTab}
            onSelectTab={handleSelectTab}
            unlockedBadgesCount={student?.unlockedBadgeIds?.length || 0}
          />
        )}
      </div>
    </div>
  );
}
