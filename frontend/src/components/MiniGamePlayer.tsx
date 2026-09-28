"use client";

import { useState } from "react";
import { EducationalGame } from "@/types";
import { Award, CheckCircle2, XCircle, Lightbulb, RotateCcw, Sparkles, Trophy } from "lucide-react";

interface Props {
  game: EducationalGame;
}

export default function MiniGamePlayer({ game }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const currentItem = game.items[currentIndex];
  const isCorrect = selectedOption === currentItem?.correct_index;

  const handleSelect = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
    setShowFeedback(true);
    if (idx === currentItem.correct_index) {
      setScore((prev) => prev + currentItem.points);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < game.items.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setShowHint(false);
    } else {
      setGameFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setShowHint(false);
    setScore(0);
    setGameFinished(false);
  };

  if (gameFinished) {
    return (
      <div className="bg-gradient-to-br from-indigo-900 to-brand-950 text-white rounded-3xl p-8 text-center shadow-xl max-w-xl mx-auto border border-indigo-700/40">
        <div className="w-20 h-20 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-400/20 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>
        <span className="px-3 py-1 bg-brand-800/80 rounded-full text-xs font-semibold text-brand-200 uppercase tracking-widest border border-brand-700">
          ¡Misión Cumplida!
        </span>
        <h3 className="text-2xl font-bold mt-2">¡Felicitaciones al Equipo!</h3>
        <p className="text-indigo-200 text-sm mt-1 max-w-sm mx-auto">
          Han completado todos los desafíos pedagógicos de {game.topic}.
        </p>

        <div className="bg-white/10 rounded-2xl p-4 my-6 border border-white/10">
          <div className="flex justify-around items-center">
            <div>
              <p className="text-xs text-indigo-300">Puntaje Total</p>
              <p className="text-3xl font-extrabold text-amber-300">{score} pts</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <p className="text-xs text-indigo-300">Insignia Desbloqueada</p>
              <p className="text-sm font-bold text-white flex items-center gap-1 justify-center mt-1">
                <Award className="w-4 h-4 text-amber-400" />
                {game.reward_badge_name}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-brand-900 font-bold text-sm rounded-xl hover:bg-indigo-50 shadow-md transition"
        >
          <RotateCcw className="w-4 h-4" />
          Jugar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm max-w-2xl mx-auto">
      {/* Game Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2.5 py-0.5 rounded-full">
            {game.game_style.replace("_", " ")}
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-1">{game.game_title}</h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 font-medium">Puntos</span>
          <p className="text-xl font-black text-brand-600">{score}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-brand-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / game.items.length) * 100}%` }}
        />
      </div>

      <div className="text-xs font-semibold text-slate-400 mb-2">
        Desafío {currentIndex + 1} de {game.items.length}
      </div>

      {/* Question Prompt */}
      <h4 className="text-base md:text-lg font-bold text-slate-800 mb-5 leading-snug">
        {currentItem?.prompt}
      </h4>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {currentItem?.options.map((opt, idx) => {
          let buttonStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300";

          if (showFeedback) {
            if (idx === currentItem.correct_index) {
              buttonStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold ring-1 ring-emerald-500";
            } else if (idx === selectedOption) {
              buttonStyle = "bg-rose-50 border-rose-400 text-rose-800";
            } else {
              buttonStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={showFeedback}
              className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-center justify-between ${buttonStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white border border-slate-300 text-xs font-bold flex items-center justify-center text-slate-600 shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </div>
              {showFeedback && idx === currentItem.correct_index && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
              )}
              {showFeedback && idx === selectedOption && idx !== currentItem.correct_index && (
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* Scaffold Hint for Inclusion */}
      {currentItem?.visual_clue && (
        <div className="mb-4">
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1.5 transition"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Ver pista visual de apoyo (DUA)
            </button>
          ) : (
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2 animate-fadeIn">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>{currentItem.visual_clue}</div>
            </div>
          )}
        </div>
      )}

      {/* Feedback Banner */}
      {showFeedback && (
        <div
          className={`p-4 rounded-2xl border mb-6 animate-fadeIn ${
            isCorrect
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-slate-50 border-slate-200 text-slate-800"
          }`}
        >
          <p className="text-xs font-bold mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-600" />
            {isCorrect ? "¡Excelente razonamiento!" : "Reflexión Pedagógica:"}
          </p>
          <p className="text-xs leading-relaxed">{currentItem.fun_fact_or_feedback}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end pt-2 border-t border-slate-100">
        {showFeedback ? (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            {currentIndex + 1 < game.items.length ? "Siguiente Desafío →" : "Ver Resultados Finales 🏆"}
          </button>
        ) : (
          <p className="text-xs text-slate-400 italic">Selecciona una respuesta para continuar</p>
        )}
      </div>
    </div>
  );
}
