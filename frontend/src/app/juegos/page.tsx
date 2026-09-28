"use client";

import { useState, useEffect } from "react";
import { Gamepad2, Sparkles, Trophy, ShieldCheck, Play, Award, RotateCcw } from "lucide-react";
import { getClassrooms, generateGame } from "@/lib/api";
import { ClassroomProfile, EducationalGame } from "@/types";
import ClassroomContextBadge from "@/components/ClassroomContextBadge";
import MiniGamePlayer from "@/components/MiniGamePlayer";

export default function JuegosPage() {
  const [classrooms, setClassrooms] = useState<ClassroomProfile[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [topic, setTopic] = useState("Operaciones y equivalencia de fracciones");
  const [gameStyle, setGameStyle] = useState("trivia_interactiva");
  const [generating, setGenerating] = useState(false);
  const [game, setGame] = useState<EducationalGame | null>(null);

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
      const res = await generateGame({
        classroom_id: selectedClassroomId,
        topic,
        game_style: gameStyle,
      });
      setGame(res);
    } catch (err) {
      alert("Error al generar el mini-juego");
    } finally {
      setGenerating(false);
    }
  };

  const activeClassroom = classrooms.find((c) => c.id === selectedClassroomId);

  return (
    <div className="space-y-8">
      {/* Context Badge */}
      <ClassroomContextBadge
        classrooms={classrooms}
        selectedId={selectedClassroomId}
        onSelect={(id) => setSelectedClassroomId(id)}
      />

      {/* Generator Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Generador y Simulador de Mini-Juegos Educativos
            </h1>
            <p className="text-xs text-slate-500">
              Crea dinámicas gamificadas e interactivas adaptadas al ritmo y edad de {activeClassroom?.name}.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tema o Concepto a Gamificar</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="ej. Fracciones en recetas de cocina o Los ecosistemas locales"
              className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Estilo de Dinámica de Gamificación</label>
            <select
              value={gameStyle}
              onChange={(e) => setGameStyle(e.target.value)}
              className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
            >
              <option value="trivia_interactiva">Trivia Interactiva por Misiones (Ideal para pizarra o equipos)</option>
              <option value="desafio_relampago">Desafío Relámpago en Parejas (Refuerzo ágil y reflexivo)</option>
              <option value="bingo_reto">Reto de Asociación y Pistas (Enfoque manipulativo y visual)</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-md shadow-brand-500/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? "Diseñando Dinámica Gamificada..." : "Crear Mini-Juego con IA"}
            </button>
          </div>
        </form>
      </div>

      {/* Live Interactive Game Player */}
      {game && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-600" />
              Simulador Interactivo en Vivo
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                {game.reward_badge_name}
              </span>
            </div>
          </div>

          {/* Player component */}
          <MiniGamePlayer game={game} />

          {/* DUA Adaptations in Game */}
          <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-3xl p-6 text-xs max-w-2xl mx-auto">
            <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Ajustes de Inclusión y Flexibilidad Activos en este Juego
            </h3>
            <ul className="space-y-1.5 text-emerald-950">
              {game.inclusion_accommodations.map((acc, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>{acc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
