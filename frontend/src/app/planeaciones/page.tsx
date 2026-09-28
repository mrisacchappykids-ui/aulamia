"use client";

import { useState, useEffect } from "react";
import { BookOpen, Sparkles, Printer, ShieldCheck, CheckCircle2, Clock, Users, ArrowRight } from "lucide-react";
import { getClassrooms, generateLessonPlan } from "@/lib/api";
import { ClassroomProfile, LessonPlan } from "@/types";
import ClassroomContextBadge from "@/components/ClassroomContextBadge";

export default function PlaneacionesPage() {
  const [classrooms, setClassrooms] = useState<ClassroomProfile[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [topic, setTopic] = useState("Suma y resta de fracciones con igual y diferente denominador");
  const [objective, setObjective] = useState("Resolver situaciones problemáticas cotidianas utilizando adición y sustracción de fracciones");
  const [competencies, setCompetencies] = useState("Pensamiento numérico, razonamiento matemático, comunicación asertiva");
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<LessonPlan | null>(null);

  useEffect(() => {
    getClassrooms().then((data) => {
      setClassrooms(data);
      if (data.length > 0) setSelectedClassroomId(data[0].id);
    });
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassroomId) return;
    setGenerating(true);
    try {
      const compList = competencies.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await generateLessonPlan({
        classroom_id: selectedClassroomId,
        topic,
        learning_objective: objective,
        specific_competencies: compList,
      });
      setPlan(res);
    } catch (err) {
      alert("Error al generar la planeación");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const activeClassroom = classrooms.find((c) => c.id === selectedClassroomId);

  return (
    <div className="space-y-8">
      {/* Context Badge */}
      <div className="no-print">
        <ClassroomContextBadge
          classrooms={classrooms}
          selectedId={selectedClassroomId}
          onSelect={(id) => setSelectedClassroomId(id)}
        />
      </div>

      {/* Generator Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm no-print">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Generador de Planeaciones de Clase Contextualizadas
            </h1>
            <p className="text-xs text-slate-500">
              Estructura didáctica completa anclada al aula seleccionada ({activeClassroom?.name}).
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tema de la Clase</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="ej. Los ecosistemas y las cadenas tróficas locales"
              className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Objetivo de Aprendizaje</label>
            <input
              type="text"
              required
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="ej. Identificar las interacciones entre productores y consumidores mediante modelos gráficos"
              className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Competencias o Habilidades Clave (separadas por coma)</label>
            <input
              type="text"
              value={competencies}
              onChange={(e) => setCompetencies(e.target.value)}
              className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-md shadow-brand-500/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? "Generando Secuencia Didáctica..." : "Generar Planeación con IA"}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Lesson Plan View */}
      {plan && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 md:p-10 shadow-sm space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full">
                Planeación de Clase
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">{plan.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                <span><strong>Grado:</strong> {plan.grade}</span>
                <span>•</span>
                <span><strong>Área:</strong> {plan.subject}</span>
                <span>•</span>
                <span><strong>Fecha:</strong> {new Date(plan.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="no-print inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Guardar PDF
            </button>
          </div>

          {/* Goal & Competencies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 rounded-2xl p-6 border border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Objetivo Pedagógico
              </h3>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {plan.learning_objective}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Competencias a Desarrollar
              </h3>
              <ul className="space-y-1 text-xs text-slate-700">
                {plan.competencies.map((c, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Phases of Class */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600" />
              Secuencia Didáctica por Momentos
            </h3>

            <div className="space-y-4">
              {plan.phases.map((phase, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200/90 rounded-2xl p-5 hover:border-brand-200 transition"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {phase.phase_name}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {phase.duration_minutes} minutos
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 block mb-1">Rol / Mediación del Docente:</span>
                      <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl">
                        {phase.teacher_action}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 block mb-1">Acción y Participación del Estudiante:</span>
                      <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl">
                        {phase.student_action}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 text-[11px] text-slate-500">
                    <strong>Recursos:</strong> {phase.required_materials.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DUA Adaptations & Inclusivity */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Ajustes Razonables y Principios DUA Aplicados a este Grupo
            </h3>
            <ul className="space-y-2 text-xs text-emerald-950">
              {plan.universal_design_adaptations.map((adapt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{adapt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Formative Evaluation & Evidences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
            <div>
              <h4 className="font-bold text-slate-800 mb-1">Estrategia de Evaluación Formativa</h4>
              <p className="text-slate-600 leading-relaxed">{plan.formative_evaluation_strategy}</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-1">Evidencias de Aprendizaje</h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                {plan.learning_evidences.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
