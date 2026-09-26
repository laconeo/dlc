import React, { useState, useEffect } from 'react';
import { TopHeader } from './components/TopHeader';
import { PathView } from './components/PathView';
import { ReadingModal } from './components/ReadingModal';
import { CardsGalleryModal } from './components/CardsGalleryModal';
import { AdminInstructorModal } from './components/AdminInstructorModal';
import { StudentAuthModal } from './components/StudentAuthModal';
import { MinisteringGuideModal } from './components/MinisteringGuideModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { BottomNav, NavTab } from './components/BottomNav';
import { DayReading, Student, SpecialBadge } from './types';
import { getLocalStudent, clearLocalStudent, toggleStudentDay, loginStudent, logoutStudent, getCurrentSessionStudent, saveStudentNote } from './utils/api';
import { SPECIAL_BADGES } from './data/readings';

export default function App() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<NavTab>('path');

  // Modals state
  const [selectedReading, setSelectedReading] = useState<DayReading | null>(null);
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);

  const [selectedBadge, setSelectedBadge] = useState<SpecialBadge | null>(null);
  const [isCardsModalOpen, setIsCardsModalOpen] = useState(false);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMinisteringModalOpen, setIsMinisteringModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Load existing student or prompt login/register
  useEffect(() => {
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

        // 3. Si no hay sesión válida, abrir modal de login/registro
        setStudent(null);
        setIsAuthModalOpen(true);
      } catch (err) {
        console.warn('Initialization error:', err);
        setIsAuthModalOpen(true);
      } finally {
        setLoading(false);
      }
    };
    initStudent();
  }, []);

  // Handlers
  const handleOpenReading = (reading: DayReading) => {
    setSelectedReading(reading);
    setIsReadingModalOpen(true);
  };

  const handleToggleDay = async (day: number, note?: string) => {
    if (!student) {
      setIsAuthModalOpen(true);
      return;
    }
    const updated = await toggleStudentDay(student.id, day, note);
    setStudent(updated);
  };

  const handleSaveNote = async (day: number, note: string) => {
    if (!student) return;
    const updated = await saveStudentNote(student.id, day, note);
    setStudent(updated);
  };

  const handleOpenBadge = (badge: SpecialBadge) => {
    setSelectedBadge(badge);
    setIsCardsModalOpen(true);
  };

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    if (tab === 'cards') {
      setIsCardsModalOpen(true);
    } else if (tab === 'ministering') {
      setIsMinisteringModalOpen(true);
    } else if (tab === 'profile') {
      setIsProfileModalOpen(true);
    }
  };

  const handleAuthSuccess = (newStudent: Student) => {
    setStudent(newStudent);
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    await logoutStudent();
    setStudent(null);
    setIsProfileModalOpen(false);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#e5e5e5] flex justify-center selection:bg-[#1cb0f6] selection:text-white">
      {/* Mobile-first main application container */}
      <div className="w-full max-w-md min-h-screen min-h-[100dvh] bg-white flex flex-col relative sm:shadow-xl sm:border-x sm:border-[#e5e5e5]">

        {/* Top Sticky Header */}
        <TopHeader
          student={student}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          onOpenBadges={() => {
            setSelectedBadge(SPECIAL_BADGES.abraham);
            setIsCardsModalOpen(true);
          }}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className={`flex-1 no-scrollbar ${isProfileModalOpen || isReadingModalOpen || isMinisteringModalOpen || isAuthModalOpen || !student ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3" style={{ color: '#afafaf' }}>
              <span className="text-5xl animate-bounce">📖</span>
              <p className="font-display font-bold" style={{ fontSize: 16, color: '#3c3c3c' }}>Cargando «Detente, Lee, Conecta»...</p>
            </div>
          ) : (
            <PathView
              student={student}
              onSelectReading={handleOpenReading}
              onOpenBadgeDetail={handleOpenBadge}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          unlockedBadgesCount={student?.unlockedBadgeIds?.length || 0}
        />

        {/* MODALS */}
        {/* Reading Modal */}
        <ReadingModal
          reading={selectedReading}
          student={student}
          isOpen={isReadingModalOpen}
          onClose={() => setIsReadingModalOpen(false)}
          onToggleComplete={handleToggleDay}
          onSaveNote={handleSaveNote}
        />

        {/* Cards Gallery Modal */}
        <CardsGalleryModal
          student={student}
          isOpen={isCardsModalOpen}
          onClose={() => {
            setIsCardsModalOpen(false);
            if (currentTab === 'cards') setCurrentTab('path');
          }}
          selectedBadge={selectedBadge}
        />

        {/* Instructor Admin Modal */}
        <AdminInstructorModal
          isOpen={isAdminModalOpen}
          currentStudent={student}
          onClose={() => setIsAdminModalOpen(false)}
          onStudentUpdated={() => {
            if (student) {
              const refreshed = getLocalStudent();
              if (refreshed) setStudent(refreshed);
            }
          }}
        />

        {/* Student Auth Modal */}
        <StudentAuthModal
          isOpen={isAuthModalOpen}
          currentStudent={student}
          onSuccess={handleAuthSuccess}
          onClose={student ? () => setIsAuthModalOpen(false) : undefined}
        />

        {/* Ministering Guide Modal */}
        <MinisteringGuideModal
          isOpen={isMinisteringModalOpen}
          onClose={() => {
            setIsMinisteringModalOpen(false);
            if (currentTab === 'ministering') setCurrentTab('path');
          }}
        />

        {/* Student Profile Modal */}
        <StudentProfileModal
          student={student}
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false);
            if (currentTab === 'profile') setCurrentTab('path');
          }}
          onSwitchAccount={() => {
            setIsProfileModalOpen(false);
            setIsAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onOpenAdmin={() => {
            setIsProfileModalOpen(false);
            setIsAdminModalOpen(true);
          }}
        />
      </div>
    </div>
  );
}
