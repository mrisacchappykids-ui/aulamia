"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Sparkles, Printer, Lightbulb, ShieldCheck, CheckCircle2 } from "lucide-react";
import { getClassrooms, generateEvaluation } from "@/lib/api";
import { ClassroomProfile, EvaluationResource } from "@/types";
import ClassroomContextBadge from "@/components/ClassroomContextBadge";

export default function EvaluacionesPage() {
  const [classrooms, setClassrooms] = useState<ClassroomProfile[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [topic, setTopic] = useState("Resolución de problemas con suma y resta de fracciones");
  const [evalType, setEvalType] = useState("formativa");
  const [generating, setGenerating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResource | null>(null);

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
      const res = await generateEvaluation({
        classroom_id: selectedClassroomId,
        topic,
        evaluation_type: evalType,
      });
      setEvaluation(res);
    } catch (err) {
      alert("Error al generar la evaluación");
    } finally {
      setGenerating(false);
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

      {/* Generator Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm no-print">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Evaluación Formativa y Rúbricas Contextuales
            </h1>
            <p className="text-xs text-slate-500">
              Genera instrumentos pedagógicos con pistas DUA y matrices de valoración cualitativa.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tema a Evaluar</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="ej. Conceptos clave de fracciones y aplicación práctica"
              className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tipo de Evaluación</label>
            <select
              value={evalType}
              onChange={(e) => setEvalType(e.target.value)}
              className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
            >
              <option value="formativa">Evaluación Formativa (Enfoque de proceso y retroalimentación)</option>
              <option value="diagnostica">Evaluación Diagnóstica (Saberes previos y punto de partida)</option>
              <option value="sumativa">Evaluación Sumativa (Cierre de ciclo con criterios de logro)</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-md shadow-brand-500/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? "Generando Instrumento de Evaluación..." : "Generar Evaluación y Rúbrica"}
            </button>
          </div>
        </form>
      </div>

      {/* Evaluation & Rubric Results */}
      {evaluation && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                Tipo: {evaluation.evaluation_type}
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">{evaluation.title}</h2>
              <p className="text-xs text-slate-500 mt-1">
                Instrumento diseñado para el perfil de {activeClassroom?.name}.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
            >
              <Printer className="w-4 h-4" />
              Imprimir Instrumento
            </button>
          </div>

          {/* DUA Guidelines Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-2 mb-2 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Pautas de Aplicación Inclusiva y Flexibilidad
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-emerald-950">
              {evaluation.adaptation_guidelines.map((guide, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{guide}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Questions Section */}
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900">
              Cuestionario Formativo con Pistas de Andamiaje
            </h3>

            <div className="space-y-4">
              {evaluation.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition text-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {q.question_text}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold uppercase shrink-0">
                      {q.question_type.replace("_", " ")}
                    </span>
                  </div>

                  {q.options && (
                    <div className="space-y-1.5 pl-8">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                            oIdx === q.correct_option_index
                              ? "border-emerald-300 bg-emerald-50/60 font-semibold text-emerald-950"
                              : "border-slate-100 bg-slate-50 text-slate-700"
                          }`}
                        >
                          <span className="font-bold text-slate-500">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <span>{opt}</span>
                          {oIdx === q.correct_option_index && (
                            <span className="ml-auto text-[10px] text-emerald-700 font-bold">
                              (Criterio esperado)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.question_type === "open_reflection" && (
                    <div className="pl-8 pt-2">
                      <div className="h-20 border-2 border-dashed border-slate-200 rounded-xl p-3 text-slate-400 italic">
                        [Espacio para respuesta escrita, dibujo o esquema conceptual del estudiante]
                      </div>
                    </div>
                  )}

                  {q.inclusion_hint && (
                    <div className="pl-8">
                      <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-center gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span><strong>Pista de inclusión:</strong> {q.inclusion_hint}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Qualitative Rubric Table */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Rúbrica Cualitativa de Valoración (4 Niveles de Desempeño)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="p-3 font-bold">Criterio Pedagógico</th>
                    <th className="p-3 font-semibold text-rose-700">Inicial / En Proceso</th>
                    <th className="p-3 font-semibold text-amber-700">Básico</th>
                    <th className="p-3 font-semibold text-blue-700">Satisfactorio</th>
                    <th className="p-3 font-semibold text-emerald-700">Avanzado / Sobresaliente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evaluation.rubric.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">{r.criteria_name}</td>
                      <td className="p-3 text-slate-600 bg-rose-50/20">{r.level_emerging}</td>
                      <td className="p-3 text-slate-600 bg-amber-50/20">{r.level_developing}</td>
                      <td className="p-3 text-slate-600 bg-blue-50/20">{r.level_proficient}</td>
                      <td className="p-3 text-slate-600 bg-emerald-50/20">{r.level_advanced}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
