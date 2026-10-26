"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Layers, 
  CheckSquare, 
  Gamepad2, 
  Wand2, 
  Users, 
  Clock, 
  Sparkles, 
  Star,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  FolderArchive,
  LogIn,
  UserPlus
} from "lucide-react";
import ClassroomContextBadge from "@/components/ClassroomContextBadge";
import { getClassrooms, getStats } from "@/lib/api";
import { ClassroomProfile, DashboardStats } from "@/types";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user, openLoginModal, openRegisterModal } = useAuth();
  const [classrooms, setClassrooms] = useState<ClassroomProfile[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [clsList, statsData] = await Promise.all([
          getClassrooms(),
          getStats().catch(() => null),
        ]);
        setClassrooms(clsList);
        if (clsList.length > 0) {
          setSelectedClassroomId(clsList[0].id);
        }
        if (statsData) {
          setStats(statsData);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeClassroom = classrooms.find((c) => c.id === selectedClassroomId) || classrooms[0];

  const modules = [
    {
      title: "Planeaciones de Clase",
      desc: "Secuencias didácticas completas con inicio, desarrollo, cierre y ajustes DUA basados en el aula.",
      href: "/planeaciones",
      icon: BookOpen,
      color: "from-blue-600 to-indigo-600",
      badge: "Secuencia Didáctica",
    },
    {
      title: "Actividades Diferenciadas",
      desc: "Generación simultánea en 4 niveles: Base, Refuerzo, Profundización y Adaptada para inclusión.",
      href: "/actividades",
      icon: Layers,
      color: "from-indigo-600 to-violet-600",
      badge: "4 Niveles",
    },
    {
      title: "Evaluaciones & Rúbricas",
      desc: "Pruebas formativas con pistas de andamiaje cognitivo y rúbricas cualitativas de 4 niveles.",
      href: "/evaluaciones",
      icon: CheckSquare,
      color: "from-emerald-600 to-teal-600",
      badge: "Formativa",
    },
    {
      title: "Material Educativo y Fichas",
      desc: "Fichas de trabajo y talleres imprimibles con encabezado escolar y ticket de salida metacognitivo.",
      href: "/materiales",
      icon: FileText,
      color: "from-teal-600 to-cyan-600",
      badge: "Imprimible DUA",
    },
    {
      title: "Mini-Juegos Educativos",
      desc: "Trivias y dinámicas interactivas jugables en el aula con pistas visuales y sin frustración.",
      href: "/juegos",
      icon: Gamepad2,
      color: "from-amber-500 to-orange-500",
      badge: "Gamificación",
    },
    {
      title: "Adaptar para mi Aula",
      desc: "Pega cualquier texto o actividad externa y la IA la transformará según las necesidades del grupo.",
      href: "/adaptar",
      icon: Wand2,
      color: "from-fuchsia-600 to-pink-600",
      badge: "Función Estrella ✨",
      highlight: true,
    },
    {
      title: "Biblioteca de Recursos",
      desc: "Consulta, filtra, imprime o elimina todo el material pedagógico generado para tus cursos.",
      href: "/biblioteca",
      icon: FolderArchive,
      color: "from-slate-700 to-slate-900",
      badge: "Historial Guardado",
    },
    {
      title: "Perfiles de Aula",
      desc: "Configura el grado, recursos, ritmos de aprendizaje y apoyos de inclusión sin etiquetas clínicas.",
      href: "/perfiles",
      icon: Users,
      color: "from-violet-700 to-purple-900",
      badge: "Contexto Docente",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-semibold backdrop-blur border border-white/10 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            Asistente Pedagógico Contextual con Inteligencia Artificial
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Diseña experiencias pedagógicas que entienden la realidad de tu aula
          </h1>
          <p className="mt-4 text-sm md:text-base text-indigo-100/90 leading-relaxed max-w-2xl">
            A diferencia de una IA genérica, AulaMIA fundamenta cada planeación, actividad, evaluación y mini-juego en el contexto real de tus estudiantes, apoyando la inclusión y ahorrando tiempo valioso de preparación.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-indigo-200">
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Diseño Universal para el Aprendizaje (DUA)
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-brand-300" />
              El docente siempre decide y valida
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              Sin diagnósticos médicos clínicos
            </span>
          </div>
        </div>
      </div>

      {/* Teacher Authentication Status Card */}
      {user ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-5 bg-gradient-to-r from-brand-50/90 via-indigo-50/60 to-purple-50/60 border border-brand-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-brand-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-base font-bold text-slate-900">
                  ¡Hola, Prof. {user.name}! 👋
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Docente Activo
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {user.specialty} • <span className="font-medium text-slate-700">{user.institution}</span>
              </p>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/60">
            Tus planeaciones y perfiles se asocian a tu cuenta
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold text-slate-800">
                Identifícate como Docente en AulaMIA
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Inicia sesión o regístrate para personalizar tus aulas y exportar tus recursos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={openLoginModal}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={openRegisterModal}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-sm"
            >
              Registrarse
            </button>
          </div>
        </div>
      )}

      {/* Classroom Context Switcher */}
      <ClassroomContextBadge
        classrooms={classrooms}
        selectedId={selectedClassroomId}
        onSelect={(id) => setSelectedClassroomId(id)}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Recursos Creados</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {stats ? stats.total_resources_generated : 3}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Materiales y propuestas pedagógicas</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Ahorro Estimado</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {stats ? `${stats.estimated_hours_saved}h` : "4.5h"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Tiempo docente optimizado</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Valoración Docente</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {stats && stats.average_pedagogical_rating ? stats.average_pedagogical_rating.toFixed(1) : "4.9"} / 5
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Relevancia y pertinencia DUA</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Ajustes Inclusivos</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">100%</p>
          <p className="text-[11px] text-slate-400 mt-1">Enfoque DUA sin etiquetas</p>
        </div>
      </div>

      {/* Main Feature Banner: Adaptar para mi Aula */}
      <div className="rounded-3xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 text-white p-6 md:p-8 shadow-lg shadow-pink-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Herramienta Estrella Diferencial
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            “Adaptar para mi aula”: Transforma cualquier consigna en 1 Clic
          </h2>
          <p className="text-xs md:text-sm text-pink-100 leading-relaxed">
            ¿Encontraste un taller en internet, una actividad de un libro o una guía externa que es muy difícil o poco accesible para tu grupo? Pégala y AulaMIA la rediseñará aplicando los apoyos DUA y el ritmo de aprendizaje de tu aula activa.
          </p>
        </div>
        <Link
          href="/adaptar"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-fuchsia-700 font-bold text-sm shadow-md hover:bg-pink-50 transition-all hover:scale-105 active:scale-95"
        >
          Probar Adaptación Ahora
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Module Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Módulos de Asistencia Pedagógica
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Genera recursos contextualizados para {activeClassroom ? activeClassroom.name : "tu aula"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`group relative rounded-2xl p-6 bg-white border transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 ${
                  m.highlight
                    ? "border-pink-300 ring-2 ring-pink-500/20 shadow-md shadow-pink-500/10 hover:shadow-lg hover:shadow-pink-500/20"
                    : "border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${m.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.highlight
                          ? "bg-pink-100 text-pink-700 font-extrabold"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {m.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors text-base mb-1.5">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-brand-600">
                  <span>Acceder al módulo</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
