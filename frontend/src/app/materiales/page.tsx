"use client";

import { useState, useEffect } from "react";
import { FileText, Sparkles, Printer, ShieldCheck, CheckCircle2, MessageSquare } from "lucide-react";
import { getClassrooms, generateMaterial } from "@/lib/api";
import { ClassroomProfile, EducationalMaterial } from "@/types";
import ClassroomContextBadge from "@/components/ClassroomContextBadge";
import FeedbackModal from "@/components/FeedbackModal";

export default function MaterialesPage() {
  const [classrooms, setClassrooms] = useState<ClassroomProfile[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [topic, setTopic] = useState("Fracciones en la vida cotidiana: Reparto equitativo");
  const [materialType, setMaterialType] = useState("ficha_de_trabajo");
  const [generating, setGenerating] = useState(false);
  const [material, setMaterial] = useState<EducationalMaterial | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

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
      const res = await generateMaterial({
        classroom_id: selectedClassroomId,
        topic,
        material_type: materialType,
      });
      setMaterial(res);
    } catch (err) {
      alert("Error al generar el material educativo");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
    setTimeout(() => {
      setShowFeedbackModal(true);
    }, 1000);
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
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Generador de Material Educativo y Fichas Imprimibles
            </h1>
            <p className="text-xs text-slate-500">
              Crea fichas de trabajo y talleres listos para fotocopiar o proyectar con andamiaje DUA para {activeClassroom?.name}.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tema o Propósito del Material</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="ej. Exploración de fracciones y partes de la unidad"
              className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tipo de Material</label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
            >
              <option value="ficha_de_trabajo">Ficha de Trabajo Activo (Paso a paso con andamiaje)</option>
              <option value="guia_taller">Guía de Taller Práctico / Cooperativo (Para equipos)</option>
              <option value="organizador_grafico">Organizador Gráfico y Síntesis Conceptual</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-md shadow-brand-500/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? "Diseñando Ficha Imprimible..." : "Generar Ficha de Trabajo"}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Printable Sheet View */}
      {material && (
        <div className="bg-white rounded-3xl border border-slate-300 p-8 md:p-12 shadow-sm space-y-8 animate-fadeIn max-w-4xl mx-auto">
          {/* Printable Header Box */}
          <div className="border-2 border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-300 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Institución Educativa • Aula Inclusiva
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  {material.title}
                </h2>
              </div>
              <div className="no-print">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 block">Estudiante:</span>
                <span className="text-slate-400 font-mono">____________________</span>
              </div>
              <div>
                <span className="font-bold text-slate-700 block">Fecha:</span>
                <span className="text-slate-400 font-mono">____ / ____ / 2026</span>
              </div>
              <div>
                <span className="font-bold text-slate-700 block">Grado:</span>
                <span className="text-slate-800 font-semibold">{material.grade}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700 block">Área:</span>
                <span className="text-slate-800 font-semibold">{material.subject}</span>
              </div>
            </div>
          </div>

          {/* Concept Intro */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">
              📌 Propósito del Aprendizaje:
            </span>
            {material.introductory_concept}
          </div>

          {/* Worksheet Sections */}
          <div className="space-y-6">
            {material.sections.map((sec) => (
              <div
                key={sec.section_number}
                className="border border-slate-200 rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">
                      {sec.section_number}
                    </span>
                    {sec.title}
                  </h3>
                </div>

                <p className="text-xs font-medium text-slate-600 italic">
                  Consigna: {sec.instructions}
                </p>

                <div className="space-y-3 pt-2">
                  {sec.exercises_or_activities.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200/80 bg-white text-xs space-y-2"
                    >
                      <span className="font-semibold text-slate-800 block">
                        {item}
                      </span>
                      <div className="h-16 border-b border-dotted border-slate-300 flex items-end pb-1 text-[11px] text-slate-300 italic">
                        [Respuesta o desarrollo del estudiante]
                      </div>
                    </div>
                  ))}
                </div>

                {sec.visual_clue_or_scaffolding && (
                  <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 text-[11px] text-amber-900">
                    {sec.visual_clue_or_scaffolding}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Exit Ticket */}
          <div className="bg-emerald-50/70 border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-xs text-emerald-950 space-y-3">
            <span className="font-bold text-emerald-900 uppercase tracking-wider block">
              🎯 {material.metacognitive_exit_ticket}
            </span>
            <div className="h-12 border-b border-dashed border-emerald-300" />
          </div>

          {/* Teacher implementation note (no-print) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 no-print">
            <strong>Consejo Pedagógico para el Docente:</strong> {material.teacher_implementation_tip}
          </div>

          {/* Feedback Trigger Button */}
          <div className="flex justify-end pt-2 no-print">
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition"
            >
              <MessageSquare className="w-4 h-4 text-brand-600" />
              ¿Qué te pareció esta ficha? Deja tu valoración
            </button>
          </div>

          {/* Feedback Modal */}
          <FeedbackModal
            resourceId={material.id}
            resourceTitle={material.title}
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)}
          />
        </div>
      )}
    </div>
  );
}
