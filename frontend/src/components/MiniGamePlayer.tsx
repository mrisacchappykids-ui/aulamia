"use client";

import { useEffect, useMemo, useState } from "react";
import { EducationalGame } from "@/types";
import {
  Award,
  CheckCircle2,
  Clock3,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";

interface Props {
  game: EducationalGame;
}

type GameMode = "trivia" | "challenge" | "bingo";

const ROUND_SECONDS = 45;

export default function MiniGamePlayer({ game }: Props) {
  const mode: GameMode =
    game.game_style === "desafio_relampago"
      ? "challenge"
      : game.game_style === "bingo_reto" || game.game_style === "asociacion"
        ? "bingo"
        : "trivia";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);

  const currentItem = game.items[currentIndex];
  const isCorrect = selectedOption === currentItem?.correct_index;
  const progress = game.items.length
    ? Math.round(((currentIndex + (gameFinished ? 1 : 0)) / game.items.length) * 100)
    : 0;

  useEffect(() => {
    if (mode !== "challenge" || gameFinished) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(timer);
          setGameFinished(true);
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mode, gameFinished]);

  const answerLabel = useMemo(() => {
    if (mode === "bingo") return "Elige la casilla que resuelve la pista";
    if (mode === "challenge") return "Responde antes de que termine el tiempo";
    return "Selecciona la respuesta correcta";
  }, [mode]);

  const handleSelect = (index: number) => {
    if (showFeedback || !currentItem) return;
    setSelectedOption(index);
    setShowFeedback(true);
    if (index === currentItem.correct_index) {
      setScore((previous) => previous + currentItem.points);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < game.items.length) {
      setCurrentIndex((previous) => previous + 1);
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
    setSecondsLeft(ROUND_SECONDS);
  };

  if (!game.items.length) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-900">
        No se encontraron retos para este juego. Intenta generarlo nuevamente.
      </div>
    );
  }

  if (gameFinished) {
    const maxScore = game.items.reduce((total, item) => total + item.points, 0);
    const percentage = maxScore ? Math.round((score / maxScore) * 100) : 0;
    return (
      <section className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 p-8 text-center text-white shadow-xl">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-300 text-amber-950 shadow-lg">
          <Trophy className="h-10 w-10" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">Misión completada</p>
        <h2 className="mt-2 text-3xl font-black">{game.game_title}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-indigo-100">
          {percentage >= 80
            ? "¡Excelente trabajo! Tus respuestas muestran lo que has aprendido."
            : percentage >= 50
              ? "¡Buen esfuerzo! Sigue practicando y cada vez lo harás mejor."
              : "Cada intento es una oportunidad para aprender. Puedes jugar otra vez."}
        </p>
        <div className="mx-auto mt-7 grid max-w-sm grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-indigo-200">Puntos obtenidos</p>
            <p className="mt-1 text-3xl font-black">{score}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-indigo-200">Avance</p>
            <p className="mt-1 text-3xl font-black">{percentage}%</p>
          </div>
        </div>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
          <Award className="h-4 w-4" />
          Insignia: {game.reward_badge_name}
        </div>
        <div className="mt-8">
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-indigo-950 transition hover:bg-indigo-50"
          >
            <RotateCcw className="h-4 w-4" />
            Volver a jugar
          </button>
        </div>
      </section>
    );
  }

  if (!currentItem) return null;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
      <div className="bg-gradient-to-r from-indigo-950 to-violet-900 p-5 text-white md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
              {mode === "challenge"
                ? "Desafío relámpago"
                : mode === "bingo"
                  ? "Bingo de pistas"
                  : "Trivia por misiones"}
            </p>
            <h2 className="mt-1 text-2xl font-black">{game.game_title}</h2>
            <p className="mt-1 text-sm text-indigo-100">{game.topic}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold">
            {mode === "challenge" ? (
              <>
                <Clock3 className="h-4 w-4" />
                {secondsLeft}s
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-300" />
                {score} puntos
              </>
            )}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between text-xs font-semibold text-indigo-100">
          <span>Reto {currentIndex + 1} de {game.items.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="p-5 md:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800">
            {answerLabel}
          </span>
          <span className="text-xs font-semibold text-slate-500">+{currentItem.points} puntos</span>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 md:p-6">
          <p className="text-lg font-bold leading-7 text-slate-900">{currentItem.prompt}</p>
          {currentItem.visual_clue && (
            <button
              type="button"
              onClick={() => setShowHint((visible) => !visible)}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
              aria-expanded={showHint}
            >
              <Lightbulb className="h-4 w-4" />
              {showHint ? "Ocultar pista" : "Necesito una pista"}
            </button>
          )}
          {showHint && currentItem.visual_clue && (
            <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
              {currentItem.visual_clue}
            </p>
          )}
        </div>

        <div className={mode === "bingo" ? "mt-6 grid grid-cols-2 gap-3" : "mt-6 grid gap-3 sm:grid-cols-2"}>
          {currentItem.options.map((option, index) => {
            const chosen = selectedOption === index;
            const correct = index === currentItem.correct_index;
            let style = "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50";
            if (showFeedback && correct) style = "border-emerald-400 bg-emerald-50 text-emerald-900";
            else if (showFeedback && chosen) style = "border-rose-300 bg-rose-50 text-rose-900";
            return (
              <button
                key={`${currentItem.id}-${index}`}
                type="button"
                onClick={() => handleSelect(index)}
                disabled={showFeedback}
                className={`relative min-h-20 rounded-2xl border-2 p-4 text-left text-sm font-semibold leading-6 transition disabled:cursor-default ${style} ${mode === "bingo" ? "text-center shadow-sm" : ""}`}
              >
                {mode === "bingo" && (
                  <span className="mb-2 block text-2xl" aria-hidden="true">{["🧩", "⭐", "🎯", "🔎"][index]}</span>
                )}
                <span className="flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                  {showFeedback && correct && <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-600" />}
                  {showFeedback && chosen && !correct && <XCircle className="ml-auto h-5 w-5 shrink-0 text-rose-600" />}
                </span>
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className={`mt-5 rounded-2xl border p-4 ${isCorrect ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
            <p className={`flex items-center gap-2 font-bold ${isCorrect ? "text-emerald-800" : "text-amber-900"}`}>
              {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <Lightbulb className="h-5 w-5" />}
              {isCorrect ? "¡Respuesta correcta!" : "¡Buen intento! Sigamos aprendiendo."}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{currentItem.fun_fact_or_feedback}</p>
            <button
              type="button"
              onClick={handleNext}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-800"
            >
              {currentIndex + 1 < game.items.length ? "Siguiente reto" : "Ver resultado"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        )}

        {!showFeedback && (
          <p className="mt-5 text-center text-xs text-slate-500">
            Puedes usar la pista cuando la necesites. Lo importante es aprender jugando.
          </p>
        )}
      </div>

      {game.inclusion_accommodations?.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 md:px-8">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Apoyos para participar</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {game.inclusion_accommodations.map((accommodation, index) => (
              <li key={index} className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                {accommodation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
