"use client";

import { useState, useEffect } from "react";
import { Layers, Sparkles, Printer, CheckCircle2, ShieldCheck, ArrowRight, HelpCircle } from "lucide-react";
import { getClassrooms, generateActivities } from "@/lib/api";
import { ClassroomProfile, ActivitySet, ActivityVariant } from "@/types";
import ClassroomContextBadge from "@/components/ClassroomContextBadge";

export default function ActividadesPage() {
  const [classrooms, setClassrooms] = useState<ClassroomProfile[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [topic, setTopic] = useState("Fracciones equivalentes y representación gráfica");
  const [focus, setFocus] = useState("Práctica conceptual, colaborativa y manipulativa");
  const [generating, setGenerating] = useState(false);
  const [activitySet, setActivitySet] = useState<ActivitySet | null>(null);
  const [activeTab, setActiveTab] = useState<"base" | "refuerzo" | "profundizacion" | "adaptada">("base");

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
      const res = await generateActivities({
        classroom_id: selectedClassroomId,
        topic,
        main_focus: focus,
      });
      setActivitySet(res);
      setActiveTab("base");
    } catch (err) {
      alert("Error al generar las actividades");
    } finally {
      setGenerating(false);
    }
  };

  const activeClassroom = classrooms.find((c) => c.id === selectedClassroomId);

  const getVariant = (): ActivityVariant | undefined => {
    if (!activitySet) return undefined;
    switch (activeTab) {
      case "base":
        return activitySet.base_activity;
      case "refuerzo":
        return activitySet.reinforcement_activity;
      case "profundizacion":
        return activitySet.deepening_activity;
      case "adaptada":
        return activitySet.adapted_activity;
    }
  };

  const currentVariant = getVariant();

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
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Generador de Actividades Multinivel (DUA)
            </h1>
            <p className="text-xs text-slate-500">
              Crea simultáneamente 4 variantes graduadas para atender la diversidad sin multiplicar tu trabajo.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tema de la Actividad</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="ej. Operaciones con fracciones o Cadenas alimenticias"
              className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Enfoque o Dinámica Pedagógica</label>
            <input
              type="text"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="ej. Trabajo en parejas con material manipulativo y discusión guiada"
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
              {generating ? "Diseñando 4 Niveles de Actividad..." : "Generar Actividades Multinivel"}
            </button>
          </div>
        </form>
      </div>

      {/* Results View with Tabs */}
      {activitySet && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full">
                Set Diferenciado
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">{activitySet.title}</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">{activitySet.pedagogical_rationale}</p>
            </div>

            <button
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
            >
              <Printer className="w-4 h-4" />
              Imprimir Ficha
            </button>
          </div>

          {/* Level Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4 no-print">
            <button
              onClick={() => setActiveTab("base")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "base"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              1. Actividad Base (Estándar)
            </button>
            <button
              onClick={() => setActiveTab("refuerzo")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "refuerzo"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              2. Actividad de Refuerzo (Andamiaje)
            </button>
            <button
              onClick={() => setActiveTab("profundizacion")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "profundizacion"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
              }`}
            >
              3. Actividad de Profundización (Reto)
            </button>
            <button
              onClick={() => setActiveTab("adaptada")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "adaptada"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              4. Actividad Adaptada (Inclusión DUA)
            </button>
          </div>

          {/* Active Variant Card */}
          {currentVariant && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Nivel Seleccionado:
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {currentVariant.title}
                  </h3>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-semibold uppercase bg-slate-100 text-slate-700">
                  {currentVariant.level}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {currentVariant.description}
              </p>

              {/* Instructions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Instrucciones Paso a Paso para los Estudiantes
                </h4>
                <div className="space-y-2">
                  {currentVariant.step_by_step_instructions.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200/80 text-xs text-slate-800 flex items-start gap-3 bg-white"
                    >
                      <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support & Deliverable */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
                  <h4 className="font-bold text-brand-900 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                    Apoyo y Mediación Pedagógica
                  </h4>
                  <p className="text-brand-950 leading-relaxed">
                    {currentVariant.pedagogical_support}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Entregable o Evidencia Esperada
                  </h4>
                  <p className="text-slate-700 leading-relaxed">
                    {currentVariant.expected_deliverable}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
