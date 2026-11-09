"use client";

import React, { useState } from "react";
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Building, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalTab, 
    login, 
    register, 
    loginAsDemo,
    loginWithGoogle 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">(authModalTab);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regInstitution, setRegInstitution] = useState("");
  const [regSpecialty, setRegSpecialty] = useState("");

  // Synchronize internal tab with external trigger
  React.useEffect(() => {
    setActiveTab(authModalTab);
    setError(null);
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError("Por favor completa tu correo y contraseña.");
      return;
    }
    setSubmitting(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError("Por favor completa los campos obligatorios (Nombre, Correo, Contraseña).");
      return;
    }
    if (regPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        institution: regInstitution.trim() || "Institución Educativa",
        specialty: regSpecialty.trim() || "Docente de Aula",
      });
    } catch (err: any) {
      setError(err.message || "Error al registrar la cuenta.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoClick = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginAsDemo();
    } catch (err: any) {
      setError(err.message || "Error al acceder como docente demo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleClick = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const emailInput = prompt("Ingresa tu correo de Google / Gmail para continuar:", "eyleenvalentinac@gmail.com");
      if (!emailInput) {
        setSubmitting(false);
        return;
      }
      const rawName = emailInput.split("@")[0].replace(/[._-]/g, " ").trim();
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      await loginWithGoogle({
        email: emailInput.trim(),
        name: formattedName || "Docente Google",
      });
    } catch (err: any) {
      setError(err.message || "Error al autenticar con Google.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Decorator */}
        <div className="h-2 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Brand header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 text-brand-600 mb-3 shadow-sm border border-brand-100">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Aula<span className="text-brand-600">MIA</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              La plataforma de IA pedagógica contextual para docentes
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-5 border border-slate-200/60">
            <button
              type="button"
              onClick={() => { setActiveTab("login"); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "login"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("register"); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "register"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Social / Fast Access Buttons */}
          <div className="space-y-2.5 mb-4">
            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all group disabled:opacity-50 hover:border-slate-400"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>

            {/* Quick Demo Access Button */}
            <button
              type="button"
              onClick={handleDemoClick}
              disabled={submitting}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 text-xs font-semibold transition-all group shadow-sm disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Acceder como Docente Demo (1 Clic)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              o con correo y contraseña
            </span>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="profesor@aulamia.edu.co"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? "Iniciando sesión..." : "Entrar a AulaMIA"}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. María Rodríguez"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="maria.rodriguez@colegio.edu.co"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña * (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institución Educativa
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Ej. Institución Educativa Técnica San José"
                    value={regInstitution}
                    onChange={(e) => setRegInstitution(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asignatura / Especialidad
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Ej. Matemáticas, Ciencias, Primaria"
                    value={regSpecialty}
                    onChange={(e) => setRegSpecialty(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? "Creando cuenta..." : "Registrarme e Iniciar"}
              </button>
            </form>
          )}

          {/* Footer note */}
          <div className="mt-5 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Datos seguros y contextualizados para uso pedagógico
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
