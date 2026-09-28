"use client";

import { useState, useEffect } from "react";
import { Wand2, Sparkles, Printer, ShieldCheck, ArrowRight, CheckCircle2, Clock, BookOpen } from "lucide-react";
import { getClassrooms, adaptResource } from "@/lib/api";
import { ClassroomProfile, AdaptationResult } from "@/types";
import ClassroomContextBadge from "@/components/ClassroomContextBadge";

export default function AdaptarPage() {
  const [classrooms, setClassrooms] = useState<ClassroomProfile[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [originalTitle, setOriginalTitle] = useState("Taller Estándar: Resolución de Problemas de Fracciones");
  const [originalContent, setOriginalContent] = useState(
    "Lea atentamente la página 45 del libro de texto. Resuelva individualmente los 10 ejercicios del taller calculando el común denominador de memoria y redacte un párrafo de 8 líneas justificando sus resultados."
  );
  const [targetBarrier, setTargetBarrier] = useState("Estudiantes con dificultad para procesar textos extensos y necesidad de apoyo visual/material concreto");
  const [adapting, setAdapting] = useState(false);
  const [adaptation, setAdaptation] = useState<AdaptationResult | null>(null);

  useEffect(() => {
    getClassrooms().then((data) => {
      setClassrooms(data);
      if (data.length > 0) setSelectedClassroomId(data[0].id);
    });
  }, []);

  const handleAdapt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassroomId) return;
    setAdapting(true);
    try {
      const res = await adaptResource({
        classroom_id: selectedClassroomId,
        original_title: originalTitle,
        original_content: originalContent,
        target_barrier: targetBarrier,
      });
      setAdaptation(res);
    } catch (err) {
      alert("Error al adaptar el recurso pedagógico");
    } finally {
      setAdapting(false);
    }
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

      {/* Feature Header */}
      <div className="bg-gradient-to-r from-fuchsia-900 to-indigo-950 text-white rounded-3xl p-8 md:p-10 shadow-lg no-print">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-fuchsia-200 text-xs font-semibold backdrop-blur mb-3">
          <Wand2 className="w-3.5 h-3.5 text-fuchsia-300" />
          Función Diferencial Estrella de AulaMIA
        </div>
        <h1 className="text-2xl md:text-3xl font-black">
          Adaptar Cualquier Contenido para Mi Aula
        </h1>
        <p className="text-xs md:text-sm text-fuchsia-100/90 mt-2 max-w-2xl leading-relaxed">
          Pega una actividad tradicional, un texto de guía o un ejercicio genérico. La IA de AulaMIA analizará las características del aula activa ({activeClassroom?.name}) y la rediseñará con principios DUA: instrucciones dosificadas, apoyos visuales y carga cognitiva justa.
        </p>
      </div>

      {/* Form Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm no-print">
        <form onSubmit={handleAdapt} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Título del Material o Actividad Original
            </label>
            <input
              type="text"
              required
              value={originalTitle}
              onChange={(e) => setOriginalTitle(e.target.value)}
              placeholder="ej. Taller de Lectura o Guía de Fracciones"
              className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Contenido o Consigna Original (Texto o Instrucción Actual)
            </label>
            <textarea
              rows={4}
              required
              value={originalContent}
              onChange={(e) => setOriginalContent(e.target.value)}
              placeholder="Pega aquí la actividad que quieres adaptar..."
              className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Barrera Pedagógica o Enfoque de Inclusión a Atender (Opcional)
            </label>
            <input
              type="text"
              value={targetBarrier}
              onChange={(e) => setTargetBarrier(e.target.value)}
              placeholder="ej. Apoyos para estudiantes con ritmo más pausado o instrucciones breves"
              className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={adapting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 transition"
            >
              <Wand2 className="w-4 h-4" />
              {adapting ? "Adaptando según el Perfil del Aula..." : "✨ Adaptar para mi Aula"}
            </button>
          </div>
        </form>
      </div>

      {/* Adapted Result View */}
      {adaptation && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-bold text-fuchsia-700 uppercase tracking-widest bg-fuchsia-50 px-3 py-1 rounded-full">
                Versión Adaptada DUA
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                {adaptation.adapted_title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ajuste pedagógico generado a partir de: <em>"{adaptation.original_title}"</em>
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
            >
              <Printer className="w-4 h-4" />
              Imprimir Versión Adaptada
            </button>
          </div>

          {/* Comparison / Profile applied */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs">
              <span className="font-bold text-slate-500 block uppercase tracking-wider mb-2">
                Consigna Original Previa:
              </span>
              <p className="text-slate-600 italic bg-white p-3 rounded-xl border border-slate-100 leading-relaxed">
                "{originalContent}"
              </p>
            </div>

            <div className="bg-fuchsia-50/60 rounded-2xl p-5 border border-fuchsia-100 text-xs">
              <span className="font-bold text-fuchsia-900 block uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-fuchsia-600" />
                Criterios de Adaptación Aplicados:
              </span>
              <ul className="space-y-1.5 text-fuchsia-950">
                <li>• <strong>Grado:</strong> {adaptation.applied_profile_summary.grade}</li>
                <li>• <strong>Área:</strong> {adaptation.applied_profile_summary.subject}</li>
                <li>• <strong>Barrera atendida:</strong> {adaptation.applied_profile_summary.target_barrier}</li>
              </ul>
            </div>
          </div>

          {/* Simplified Step by Step */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
              Instrucciones Rediseñadas (Dosificación y Claridad Cognitiva)
            </h3>
            <div className="space-y-2">
              {adaptation.simplified_instructions.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/40 text-xs text-emerald-950 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual and Structural Supports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                Apoyos Visuales y Estructurales Sugeridos
              </h4>
              <ul className="space-y-1.5 text-slate-600">
                {adaptation.visual_and_structural_supports.map((sup, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1.5 shrink-0" />
                    <span>{sup}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div>
                <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Dosificación del Tiempo Recomendada
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {adaptation.recommended_pacing}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 mb-1">
                  Ajuste de Carga de Trabajo
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {adaptation.differentiated_workload}
                </p>
              </div>
            </div>
          </div>

          {/* Teacher Guidance */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 leading-relaxed">
            <strong>Orientación Ética y Pedagógica:</strong> {adaptation.teacher_pedagogical_guidance}
          </div>
        </div>
      )}
    </div>
  );
}
