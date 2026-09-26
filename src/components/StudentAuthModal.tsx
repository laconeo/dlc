import React, { useState, useEffect } from 'react';
import { Mail, User, BookOpen, Lock, Eye, EyeOff, Sparkles, ArrowRight, ArrowLeft, MapPin, CheckCircle2, Flame, Shield, KeyRound } from 'lucide-react';
import { Student, SUPERADMIN_EMAIL, isUserInstructor } from '../types';
import { loginStudent, registerStudent, requestPasswordReset, updateUserPassword } from '../utils/api';
import { supabase } from '../utils/supabase';

interface StudentAuthModalProps {
  isOpen: boolean;
  currentStudent: Student | null;
  initialMode?: AuthMode;
  onSuccess: (student: Student) => void;
  onClose?: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot_password' | 'reset_password';

/* ── Shared input field ── */
function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  suffix,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ElementType;
  suffix?: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#3c3c3c', marginBottom: 5 }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon
          style={{
            position: 'absolute',
            left: 13,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 17,
            height: 17,
            color: '#afafaf',
          }}
        />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          style={{
            width: '100%',
            padding: '12px 12px 12px 40px',
            paddingRight: suffix ? 42 : 12,
            fontSize: 16, /* prevents iOS zoom */
            fontFamily: 'inherit',
            fontWeight: 500,
            color: '#3c3c3c',
            background: '#f7f7f7',
            border: '2px solid #e5e5e5',
            borderRadius: 12,
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#1cb0f6';
            e.target.style.background = '#ffffff';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e5e5';
            e.target.style.background = '#f7f7f7';
          }}
        />
        {suffix && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── EyeToggle button ── */
function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#afafaf', padding: 0, display: 'flex' }}
    >
      {show ? <EyeOff style={{ width: 19, height: 19 }} /> : <Eye style={{ width: 19, height: 19 }} />}
    </button>
  );
}

/* ══════════════════════════════════════════════════
   FULL-SCREEN AUTH PAGE
   - No modal overlay, no bottom-sheet
   - Fixed header (branding + tabs)
   - Scrollable form area below
   ══════════════════════════════════════════════════ */
export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  currentStudent,
  initialMode,
  onSuccess,
  onClose,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<AuthMode>(initialMode || 'login');
  const [email, setEmail] = useState(currentStudent?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState(currentStudent?.firstName || '');
  const [lastName, setLastName] = useState(currentStudent?.lastName || '');
  const [ward, setWard] = useState(currentStudent?.ward || '');
  const [seminaryClass, setSeminaryClass] = useState(currentStudent?.seminaryClass || '');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para recuperación de contraseña
  const [forgotSent, setForgotSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Estado para la pantalla de bienvenida post-registro
  const [registeredStudent, setRegisteredStudent] = useState<Student | null>(null);
  const [countdown, setCountdown] = useState(5);

  // Detectar token de recuperación en URL o evento de Supabase Auth
  useEffect(() => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    if (hash.includes('type=recovery') || search.includes('type=recovery')) {
      setMode('reset_password');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset_password');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auto-login automático con cuenta regresiva en la pantalla de bienvenida
  useEffect(() => {
    if (!registeredStudent) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onSuccess(registeredStudent);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [registeredStudent, onSuccess]);

  const resetForm = () => {
    setError(null);
    setPassword('');
    setConfirmPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotSent(false);
    setResetSuccess(false);
  };
  const switchMode = (m: AuthMode) => { setMode(m); resetForm(); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setError('Ingresa un correo electrónico válido.'); return; }
    if (!password.trim()) { setError('Ingresa tu contraseña.'); return; }
    setLoading(true); setError(null);
    try {
      onSuccess(await loginStudent(email.trim(), password.trim()));
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus datos.');
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await requestPasswordReset(email.trim());
      setForgotSent(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim().length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword.trim() !== confirmNewPassword.trim()) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatedStudent = await updateUserPassword(newPassword.trim());
      if (window.location.hash.includes('type=recovery')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      setResetSuccess(true);
      setTimeout(() => {
        onSuccess(updatedStudent);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña. Es posible que el enlace haya expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) { setError('Ingresa tu nombre.'); return; }
    if (!lastName.trim()) { setError('Ingresa tu apellido.'); return; }
    if (!email.includes('@')) { setError('Ingresa un correo válido.'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true); setError(null);
    try {
      const student = await registerStudent({
        email: email.trim(),
        password: password.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ward: ward.trim(),
        seminaryClass: seminaryClass.trim() || 'Seminario - Antiguo Testamento',
      });
      // Activamos la pantalla de bienvenida celebratoria
      setRegisteredStudent(student);
      setCountdown(5);
    } catch (err: any) {
      setError(err.message || 'Error al registrar. Intenta nuevamente.');
    } finally { setLoading(false); }
  };

  /* ── 🌟 PANTALLA DE BIENVENIDA CELEBRATORIA ── */
  if (registeredStudent) {
    const isSuper = (registeredStudent.email || '').toLowerCase().trim() === SUPERADMIN_EMAIL;
    const isInst = isUserInstructor(registeredStudent);

    return (
      <div
        className="w-full h-full flex flex-col justify-between animate-fadeIn bg-white overflow-hidden"
      >
        {/* Top Celebration Strip */}
        <div
          style={{
            background: 'linear-gradient(135deg, #58cc02 0%, #22c55e 100%)',
            padding: '36px 20px 28px',
            textAlign: 'center',
            borderBottom: '4px solid #46a302',
          }}
        >
          <div
            className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg animate-bounce"
            style={{
              background: '#ffffff',
              border: '4px solid #ffc800',
              fontSize: 38,
            }}
          >
            🎉
          </div>
          <h2
            className="font-display font-bold text-white text-2xl"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}
          >
            ¡Bienvenido(a), {registeredStudent.firstName || registeredStudent.name}!
          </h2>
          <p className="text-white/95 text-sm mt-1 font-medium">
            Tu cuenta ha sido creada exitosamente en Supabase
          </p>

          {/* Role badge */}
          <div className="mt-3">
            <span
              className="inline-flex items-center gap-1.5 font-display font-bold text-xs px-3.5 py-1 rounded-full shadow-sm"
              style={{
                background: isSuper ? '#222222' : isInst ? '#3c3c3c' : '#ffffff',
                color: isSuper || isInst ? '#ffc800' : '#46a302',
                border: isSuper ? '1px solid #ffc800' : 'none',
              }}
            >
              {isSuper ? (
                <><span>👑</span><span>Superadministrador</span></>
              ) : isInst ? (
                <><Shield className="w-3.5 h-3.5 text-[#ffc800]" /><span>Instructor</span></>
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5 text-[#46a302]" /><span>Alumno de Seminario</span></>
              )}
            </span>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3.5">
          {/* Email Welcome card */}
          <div
            className="rounded-2xl p-4 flex items-start gap-3 border-2 border-[#e5e5e5]"
            style={{ background: '#f8fafc' }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] flex items-center justify-center shrink-0 text-[#0284c7]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-[#1e293b]">
                Email de bienvenida enviado
              </p>
              <p className="text-xs text-[#64748b] mt-0.5">
                Hemos registrado tu correo <strong>{registeredStudent.email}</strong>. Recibirás tus confirmaciones y notificaciones de Seminario en tu bandeja de entrada.
              </p>
            </div>
          </div>

          {/* Auto-login status card */}
          <div
            className="rounded-2xl p-4 flex items-start gap-3 border-2 border-[#bbf7d0]"
            style={{ background: '#f0fdf4' }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#dcfce7] flex items-center justify-center shrink-0 text-[#16a34a]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-[#15803d]">
                Inicio de sesión automático
              </p>
              <p className="text-xs text-[#166534] mt-0.5">
                Tu sesión ha sido iniciada en Supabase. Ya estás autenticado y listo para ingresar sin tener que reescribir tu contraseña.
              </p>
            </div>
          </div>

          {/* 30 Days Challenge preview */}
          <div
            className="rounded-2xl p-4 border-2 border-[#fed7aa]"
            style={{ background: '#fff7ed' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Flame className="w-5 h-5 text-[#ea580c] fill-[#ea580c]" />
              <span className="font-display font-bold text-sm text-[#9a3412]">
                ¡Comienza hoy tu Día 1!
              </span>
            </div>
            <p className="text-xs text-[#c2410c]">
              Lectura de hoy: <strong>Josué 1:1-9</strong> («Esfuérzate y sé valiente»). Al acumular 7 días seguidos desbloquearás tu primera carta especial (Abraham).
            </p>
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="p-4 border-t-2 border-[#e5e5e5] bg-white">
          <button
            onClick={() => onSuccess(registeredStudent)}
            className="btn-duo-green w-full font-display font-bold text-base py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <span>¡Entrar al Desafío Ahora!</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-center text-xs text-[#94a3b8] mt-2 font-medium">
            Entrando automáticamente en {countdown} segundos...
          </p>
        </div>
      </div>
    );
  }

  /* ── LAYOUT: Formularios normales (Página Principal de Autenticación) ── */
  return (
    <div
      className="w-full h-full flex flex-col bg-white overflow-hidden animate-fadeIn relative"
      style={{ overscrollBehavior: 'none' }}
    >
      {/* ══ STICKY TOP HEADER ══ */}
      <div
        style={{
          background: '#58cc02',
          borderBottom: '3px solid #46a302',
          padding: '16px 20px 12px',
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          className="font-display"
          style={{
            width: 46,
            height: 46,
            borderRadius: 15,
            background: '#ffffff',
            border: '2.5px solid #46a302',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 6px',
            fontSize: 22,
          }}
        >
          {mode === 'forgot_password' || mode === 'reset_password' ? '🔐' : '📖'}
        </div>

        <p
          className="font-display font-bold"
          style={{ fontSize: 19, color: '#ffffff', lineHeight: 1.2 }}
        >
          {mode === 'forgot_password'
            ? 'Recuperar Contraseña'
            : mode === 'reset_password'
            ? 'Nueva Contraseña'
            : '«Detente, Lee, Conecta»'}
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>
          {mode === 'forgot_password'
            ? 'Te ayudamos a recuperar tu acceso'
            : mode === 'reset_password'
            ? 'Configura tu nueva clave de acceso'
            : 'Desafío de lectura · 30 días'}
        </p>

        {/* Mode tabs or Back Button */}
        <div style={{ marginTop: 10 }}>
          {mode === 'login' || mode === 'register' ? (
            <div
              style={{
                display: 'flex',
                background: 'rgba(0,0,0,0.18)',
                borderRadius: 12,
                padding: 3,
                gap: 4,
              }}
            >
              {(['login', 'register'] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className="font-display font-bold transition-all"
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 10,
                    fontSize: 14,
                    border: 'none',
                    cursor: 'pointer',
                    background: mode === m ? '#ffffff' : 'transparent',
                    color: mode === m ? '#46a302' : 'rgba(255,255,255,0.95)',
                  }}
                >
                  {m === 'login' ? 'Ingresar' : 'Registrarse'}
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="inline-flex items-center gap-1.5 text-white/95 text-xs font-bold font-display px-3 py-1.5 rounded-full hover:bg-white/20 transition-all cursor-pointer"
              style={{ background: 'rgba(0,0,0,0.22)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>

      {/* ══ FORM AREA (sin scroll en login, forgot y reset) ══ */}
      <div
        className={`flex-1 ${mode === 'login' || mode === 'forgot_password' || mode === 'reset_password' ? 'overflow-hidden flex flex-col justify-center' : 'overflow-y-auto no-scrollbar'}`}
        style={{
          padding: mode === 'register' ? '0 20px 24px' : '10px 20px 16px',
          overflowY: mode === 'register' ? 'auto' : 'hidden',
          overscrollBehavior: 'none',
        }}
      >
        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: 12,
              marginBottom: 4,
              padding: '10px 14px',
              background: '#fff0f0',
              border: '2px solid #ff4b4b',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              color: '#cc0000',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {mode === 'login' && (
          <form
            onSubmit={handleLogin}
            style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}
          >
            <Field
              id="login-email"
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="ejemplo@correo.com"
              icon={Mail}
            />
            <Field
              id="login-password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="Tu contraseña"
              icon={Lock}
              suffix={<EyeToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />}
            />

            {/* Enlace de recuperación de contraseña */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
              <button
                id="forgot-password-link-btn"
                type="button"
                onClick={() => switchMode('forgot_password')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#1cb0f6',
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '2px 0',
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              id="student-login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-duo-green font-display"
              style={{
                width: '100%',
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 2,
                fontSize: 16,
              }}
            >
              {loading
                ? <span style={{ fontSize: 22 }}>⏳</span>
                : <><span>Entrar al Desafío</span><ArrowRight style={{ width: 20, height: 20 }} /></>}
            </button>

            <p style={{ textAlign: 'center', fontSize: 14, color: '#777777', marginTop: 2 }}>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1cb0f6', fontWeight: 700, fontSize: 14 }}
              >
                Regístrate aquí
              </button>
            </p>

            {/* Continue as existing user */}
            {onClose && currentStudent && (
              <div style={{ textAlign: 'center', marginTop: 2 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#afafaf', fontSize: 13, fontWeight: 600 }}
                >
                  Continuar como {currentStudent.name}
                </button>
              </div>
            )}
          </form>
        )}

        {/* ── FORGOT PASSWORD FORM ── */}
        {mode === 'forgot_password' && (
          <div style={{ marginTop: 8 }}>
            {forgotSent ? (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '2px solid #86efac',
                  borderRadius: 16,
                  padding: '20px 16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: '#22c55e',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                  }}
                >
                  📬
                </div>
                <h3 className="font-display font-bold text-lg text-[#166534]">
                  ¡Correo enviado!
                </h3>
                <p style={{ fontSize: 13, color: '#15803d', lineHeight: 1.4 }}>
                  Hemos enviado las instrucciones para restablecer tu contraseña a:
                  <br />
                  <strong style={{ color: '#14532d', wordBreak: 'break-all' }}>{email}</strong>
                </p>
                <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.3 }}>
                  Abre el enlace que recibiste. Si no lo encuentras en unos minutos, revisa tu carpeta de <strong>Spam o Correo no deseado</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="btn-duo-green font-display"
                  style={{
                    width: '100%',
                    height: 46,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 6,
                    fontSize: 15,
                  }}
                >
                  <ArrowLeft style={{ width: 18, height: 18 }} />
                  <span>Volver a Iniciar Sesión</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleForgotPassword}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <p style={{ fontSize: 13, color: '#555555', lineHeight: 1.4 }}>
                  Ingresa tu correo registrado y te enviaremos un enlace seguro para crear una nueva contraseña.
                </p>

                <Field
                  id="forgot-email"
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="ejemplo@correo.com"
                  icon={Mail}
                />

                <button
                  id="student-forgot-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="btn-duo-green font-display"
                  style={{
                    width: '100%',
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 4,
                    fontSize: 16,
                  }}
                >
                  {loading ? (
                    <span style={{ fontSize: 22 }}>⏳</span>
                  ) : (
                    <>
                      <span>Enviar Enlace</span>
                      <ArrowRight style={{ width: 19, height: 19 }} />
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#777777',
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <ArrowLeft style={{ width: 15, height: 15 }} />
                    <span>Volver a Iniciar Sesión</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── RESET PASSWORD FORM (cuando viene del enlace del correo) ── */}
        {mode === 'reset_password' && (
          <div style={{ marginTop: 8 }}>
            {resetSuccess ? (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '2px solid #86efac',
                  borderRadius: 16,
                  padding: '24px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: '#22c55e',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                  }}
                >
                  ✨
                </div>
                <h3 className="font-display font-bold text-lg text-[#166534]">
                  ¡Contraseña actualizada!
                </h3>
                <p style={{ fontSize: 13, color: '#15803d', lineHeight: 1.4 }}>
                  Tu contraseña ha sido actualizada con éxito. Ingresando al desafío...
                </p>
                <span style={{ fontSize: 24 }} className="animate-spin">
                  ⏳
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleResetPassword}
                style={{ display: 'flex', flexDirection: 'column', gap: 11 }}
              >
                <p style={{ fontSize: 13, color: '#555555', lineHeight: 1.4 }}>
                  Crea tu nueva contraseña para acceder a «Detente, Lee, Conecta».
                </p>

                <Field
                  id="reset-new-password"
                  label="Nueva Contraseña"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Mínimo 6 caracteres"
                  icon={Lock}
                  suffix={
                    <EyeToggle
                      show={showNewPassword}
                      onToggle={() => setShowNewPassword(!showNewPassword)}
                    />
                  }
                />

                <Field
                  id="reset-confirm-password"
                  label="Confirmar Contraseña"
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={setConfirmNewPassword}
                  placeholder="Repite tu nueva contraseña"
                  icon={Lock}
                />

                <button
                  id="student-reset-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="btn-duo-green font-display"
                  style={{
                    width: '100%',
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 4,
                    fontSize: 16,
                  }}
                >
                  {loading ? (
                    <span style={{ fontSize: 22 }}>⏳</span>
                  ) : (
                    <>
                      <span>Guardar Nueva Contraseña</span>
                      <CheckCircle2 style={{ width: 19, height: 19 }} />
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#777777',
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <ArrowLeft style={{ width: 15, height: 15 }} />
                    <span>Volver a Iniciar Sesión</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── REGISTER FORM ── */}
        {mode === 'register' && (
          <form
            onSubmit={handleRegister}
            style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}
          >
            {/* Name + Surname side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field
                id="student-register-firstname"
                label="Nombre *"
                type="text"
                value={firstName}
                onChange={setFirstName}
                placeholder="Lucas"
                icon={User}
              />
              <Field
                id="student-register-lastname"
                label="Apellido *"
                type="text"
                value={lastName}
                onChange={setLastName}
                placeholder="Romero"
                icon={User}
              />
            </div>

            <Field
              id="student-register-email"
              label="Correo electrónico *"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="ejemplo@correo.com"
              icon={Mail}
            />

            <Field
              id="student-register-password"
              label="Contraseña * (mín. 4 caracteres)"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="Tu contraseña"
              icon={Lock}
              suffix={<EyeToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />}
            />

            <Field
              id="student-register-confirm-password"
              label="Repetir contraseña *"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Misma contraseña"
              icon={Lock}
            />

            {/* Church info section */}
            <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#afafaf', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                Información de la Iglesia (opcional)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Field
                  id="student-register-ward"
                  label="Rama o Barrio"
                  type="text"
                  value={ward}
                  onChange={setWard}
                  placeholder="Ej. Barrio Central"
                  icon={MapPin}
                />
                <Field
                  id="student-register-class"
                  label="Clase de Seminario"
                  type="text"
                  value={seminaryClass}
                  onChange={setSeminaryClass}
                  placeholder="Ej. Clase Matutina"
                  icon={BookOpen}
                />
              </div>
            </div>

            <button
              id="student-register-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-duo-blue font-display"
              style={{
                width: '100%',
                height: 52,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 4,
                fontSize: 16,
              }}
            >
              {loading
                ? <span style={{ fontSize: 22 }}>⏳</span>
                : <><Sparkles style={{ width: 20, height: 20 }} /><span>Crear Cuenta</span></>}
            </button>

            <p style={{ textAlign: 'center', fontSize: 14, color: '#777777', marginTop: 2 }}>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1cb0f6', fontWeight: 700, fontSize: 14 }}
              >
                Inicia sesión aquí
              </button>
            </p>

            {onClose && currentStudent && (
              <div style={{ textAlign: 'center', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#afafaf', fontSize: 13, fontWeight: 600 }}
                >
                  Continuar como {currentStudent.name}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
