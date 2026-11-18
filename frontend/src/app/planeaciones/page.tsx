"use client";

import { useState, useEffect } from "react";
import { BookOpen, Sparkles, Printer, ShieldCheck, CheckCircle2, Clock, Users, ArrowRight } from "lucide-react";
import { getClassrooms, generateLessonPlan } from "@/lib/api";
import { ClassroomProfile, LessonPlan } from "@/types";
import ClassroomContextBadge from "@/components/ClassroomContextBadge";
import { CURRICULUM_GROUPS, getCurriculumForGrade } from "@/data/technologyCurriculum";

export default function PlaneacionesPage() {
  const [classrooms, setClassrooms] = useState<ClassroomProfile[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [curricularGrade, setCurricularGrade] = useState("2");
  const [componentId, setComponentId] = useState("nature");
  const [selectedEvidence, setSelectedEvidence] = useState("");
  const [topic, setTopic] = useState("");
  const [objective, setObjective] = useState("");
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [classroomError, setClassroomError] = useState("");
  const [generateError, setGenerateError] = useState("");

  const loadClassrooms = async () => {
    setLoadingClassrooms(true);
    setClassroomError("");
    try {
      const data = await getClassrooms();
      setClassrooms(data);
      setSelectedClassroomId((id) => data.some((item) => item.id === id) ? id : (data[0]?.id ?? ""));
    } catch (error) {
      setClassroomError(error instanceof Error ? error.message : "No se pudieron cargar las aulas.");
    } finally {
      setLoadingClassrooms(false);
    }
  };

  useEffect(() => { void loadClassrooms(); }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassroomId) return;
    setGenerateError("");
    setGenerating(true);
    try {
      const compList = selectedComponent ? [selectedComponent.competency] : [];
      const res = await generateLessonPlan({
        classroom_id: selectedClassroomId,
        topic: topic.trim(),
        learning_objective: objective.trim(),
        specific_competencies: compList,
        curricular_component: selectedComponent?.name,
        curricular_evidence: selectedEvidence,
        custom_notes: `Grado curricular: ${curricularGrade}. Conjunto MEN: ${gradeCurriculum.group}. Componente oficial: ${selectedComponent?.name}. Evidencia de aprendizaje seleccionada del MEN: ${selectedEvidence}. La planeación debe limitarse al área de Tecnología e Informática y mantener coherencia con estos referentes.`,
      });
      setPlan(res);
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : "No se pudo generar la planeación.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const activeClassroom = classrooms.find((c) => c.id === selectedClassroomId);
  const gradeCurriculum = getCurriculumForGrade(curricularGrade);
  const selectedComponent = gradeCurriculum.components.find((item) => item.id === componentId) ?? gradeCurriculum.components[0];

  useEffect(() => {
    if (selectedComponent && !selectedComponent.evidences.includes(selectedEvidence)) {
      setSelectedEvidence(selectedComponent.evidences[0] ?? "");
    }
  }, [componentId, curricularGrade]);

  return (
    <div className="space-y-8">
      {/* Context Badge */}
      <div className="no-print">
        {loadingClassrooms ? (
          <p role="status" className="p-4 text-sm text-slate-600">Cargando aulas…</p>
        ) : classroomError ? (
          <div role="alert" className="flex items-center gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
            <span>{classroomError}</span>
            <button type="button" onClick={loadClassrooms} className="ml-auto font-semibold underline">Reintentar</button>
          </div>
        ) : (
          <ClassroomContextBadge
            classrooms={classrooms}
            selectedId={selectedClassroomId}
            onSelect={setSelectedClassroomId}
          />
        )}
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
          {generateError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-rose-800">{generateError}</p>}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 space-y-3">
            <div>
              <p className="text-sm font-bold text-slate-800">Referentes curriculares · Tecnología e Informática</p>
              <p className="text-[11px] text-slate-600">Basados en las Orientaciones Curriculares del MEN (2022). Los referentes se presentan por conjuntos de grados.</p>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grado</label>
              <select value={curricularGrade} onChange={(e) => { setCurricularGrade(e.target.value); setComponentId("nature"); }} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white">
                {CURRICULUM_GROUPS.map((grade) => <option key={grade.value} value={grade.value}>{grade.label}</option>)}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">Conjunto curricular: {gradeCurriculum.group}</p>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Componente</label>
              <select value={componentId} onChange={(e) => setComponentId(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white">
                {gradeCurriculum.components.map((component) => <option key={component.id} value={component.id}>{component.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Competencia oficial del conjunto</label>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700">{selectedComponent.competency}</div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Evidencia de aprendizaje</label>
              <select value={selectedEvidence} onChange={(e) => setSelectedEvidence(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-xs">
                {selectedComponent.evidences.map((evidence, index) => <option key={index} value={evidence}>{evidence}</option>)}
              </select>
              <button type="button" onClick={() => setObjective(selectedEvidence)} className="mt-2 text-[11px] font-semibold text-blue-700 hover:underline">Usar esta evidencia como base del objetivo de la clase</button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tema de la clase</label>
            <input type="text" required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Escribe el tema específico que desarrollarás" className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none" />
            <p className="mt-1 text-[11px] text-slate-500">Este campo se conserva libre para que el docente escriba el tema de su clase.</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Objetivo de aprendizaje de la clase</label>
            <textarea required rows={3} value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Formula el aprendizaje que esperas alcanzar, en coherencia con la competencia y la evidencia seleccionadas." className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none" />
            <p className="mt-1 text-[11px] text-slate-500">El objetivo de clase se formula a partir del referente curricular; no se presenta como una cita textual del MEN.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={generating || loadingClassrooms || !!classroomError || !selectedClassroomId}
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
