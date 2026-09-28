"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Trash2, Edit2, ShieldCheck, Sparkles, Check, AlertCircle } from "lucide-react";
import { getClassrooms, createClassroom, deleteClassroom } from "@/lib/api";
import { ClassroomProfile } from "@/types";

export default function PerfilesPage() {
  const [classrooms, setClassrooms] = useState<ClassroomProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("5° de Primaria");
  const [subject, setSubject] = useState("Matemáticas");
  const [studentCount, setStudentCount] = useState(25);
  const [averageAge, setAverageAge] = useState(10);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [methodology, setMethodology] = useState("Aprendizaje Basado en Proyectos (ABP)");
  const [resourcesInput, setResourcesInput] = useState("Proyector, 1 computador docente, Material concreto, Cuadernos");
  const [learningPace, setLearningPace] = useState("Ritmo diverso con necesidad de apoyos visuales y segmentación de consignas");
  const [inclusionNeedsInput, setInclusionNeedsInput] = useState("Instrucciones breves en pasos simples, Apoyo visual y pictogramas, Tiempo flexible para responder");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const data = await getClassrooms();
      setClassrooms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const resourcesList = resourcesInput.split(",").map((s) => s.trim()).filter(Boolean);
      const inclusionList = inclusionNeedsInput.split(",").map((s) => s.trim()).filter(Boolean);

      await createClassroom({
        name,
        grade,
        subject,
        student_count: Number(studentCount),
        average_age: Number(averageAge),
        session_duration_minutes: Number(sessionDuration),
        methodology,
        available_resources: resourcesList,
        general_learning_pace: learningPace,
        inclusion_support_needs: inclusionList,
        notes,
      });

      setShowModal(false);
      // Reset form
      setName("");
      notes && setNotes("");
      fetchProfiles();
    } catch (err) {
      alert("Error al guardar el perfil del aula");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este perfil de aula?")) {
      await deleteClassroom(id);
      fetchProfiles();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            Perfiles de Aula (Contexto Pedagógico)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configura las características de tus grupos escolares para que la IA genere recursos 100% contextualizados.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Nuevo Perfil de Aula
        </button>
      </div>

      {/* Principle Reminder Banner */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div className="text-xs text-brand-950 leading-relaxed">
          <span className="font-bold">Enfoque Inclusivo sin Etiquetas Médicas:</span> En AulaMIA registramos necesidades pedagógicas, barreras del entorno y apoyos de acceso (Diseño Universal para el Aprendizaje - DUA), sin clasificar o diagnosticar médicamente a los estudiantes.
        </div>
      </div>

      {/* List of Classrooms */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Cargando perfiles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classrooms.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                    {c.grade}
                  </span>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-slate-400 hover:text-rose-500 transition p-1"
                    title="Eliminar aula"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{c.name}</h3>
                <p className="text-xs text-brand-600 font-medium">{c.subject}</p>

                <div className="mt-3 grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">Estudiantes</span>
                    <span className="font-bold text-slate-700">{c.student_count}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">Edad prom.</span>
                    <span className="font-bold text-slate-700">{c.average_age} años</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">Duración</span>
                    <span className="font-bold text-slate-700">{c.session_duration_minutes} min</span>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Metodología</span>
                    <p className="text-slate-700 font-medium">{c.methodology}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Recursos de Aula</span>
                    <p className="text-slate-600 text-[11px]">{c.available_resources.join(", ")}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700">Apoyos DUA Requeridos</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {c.inclusion_support_needs.map((need, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200/50 px-2 py-0.5 rounded-full"
                        >
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between items-center">
                <span>ID: {c.id}</span>
                <span className="text-brand-600 font-semibold">Listo para usar</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal to Create Classroom */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Nuevo Perfil de Aula
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Registra los parámetros pedagógicos y el contexto de diversidad de tu grupo.
            </p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Aula o Grupo</label>
                <input
                  type="text"
                  required
                  placeholder="ej. 5° A - Matemáticas Inclusiva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grado Escolar</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. 5° de Primaria"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Área o Asignatura</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Matemáticas"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estudiantes</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={studentCount}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Edad Promedio</label>
                  <input
                    type="number"
                    required
                    min={4}
                    value={averageAge}
                    onChange={(e) => setAverageAge(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duración (min)</label>
                  <input
                    type="number"
                    required
                    min={20}
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Metodología Pedagógica</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Aprendizaje Basado en Proyectos, Indagación, Cooperativo"
                  value={methodology}
                  onChange={(e) => setMethodology(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recursos Disponibles (separados por coma)</label>
                <input
                  type="text"
                  value={resourcesInput}
                  onChange={(e) => setResourcesInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-800 mb-1">Apoyos DUA y Necesidades de Inclusión (separados por coma)</label>
                <input
                  type="text"
                  value={inclusionNeedsInput}
                  onChange={(e) => setInclusionNeedsInput(e.target.value)}
                  className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/40 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas u Observaciones del Docente (opcional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Particularidades sobre la dinámica del grupo o metas institucionales..."
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm"
                >
                  {saving ? "Guardando..." : "Guardar Perfil"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
