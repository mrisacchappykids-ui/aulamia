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
  FolderArchive
} from "lucide-react";
import ClassroomContextBadge from "@/components/ClassroomContextBadge";
import { getClassrooms, getStats } from "@/lib/api";
import { ClassroomProfile, DashboardStats } from "@/types";

export default function Dashboard() {
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
      badge: "Didáctica Estructurada",
    },
    {
      title: "Actividades Diferenciadas",
      desc: "Genera 4 niveles en un solo clic: Actividad Base, Refuerzo, Profundización y Adaptada.",
      href: "/actividades",
      icon: Layers,
      color: "from-indigo-600 to-purple-600",
      badge: "Multinivel DUA",
    },
    {
      title: "Evaluaciones y Rúbricas",
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
            {stats ? `${stats.estimated_hours_saved} h` : "4.5 h"}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Tiempo docente recuperado</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Apoyos DUA Activos</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {activeClassroom ? activeClassroom.inclusion_support_needs.length : 4}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Estrategias de inclusión en curso</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pertinencia Pedagógica</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {stats?.average_pedagogical_rating ? `${stats.average_pedagogical_rating} / 5.0` : "4.9 / 5.0"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats?.feedback_responses_count ? `${stats.feedback_responses_count} valoraciones docentes` : "Valoración cualitativa docente"}
          </p>
        </div>
      </div>

      {/* Modules Launcher Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Módulos Pedagógicos</h2>
            <p className="text-xs text-slate-500">
              Genera recursos directamente vinculados al aula: <span className="font-semibold text-brand-600">{activeClassroom?.name}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m, idx) => {
            const Icon = m.icon;
            return (
              <Link
                key={idx}
                href={m.href}
                className={`group relative bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                  m.highlight
                    ? "border-brand-200 ring-2 ring-brand-500/10 hover:border-brand-300"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${m.color} text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {m.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-brand-600">
                  <span>Abrir generador</span>
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
