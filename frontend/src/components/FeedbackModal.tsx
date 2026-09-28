"use client";

import { useState } from "react";
import { Star, Clock, CheckCircle2, X, Sparkles } from "lucide-react";
import { submitFeedback } from "@/lib/api";

interface Props {
  resourceId: string;
  resourceTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function FeedbackModal({
  resourceId,
  resourceTitle,
  isOpen,
  onClose,
  onSubmitted,
}: Props) {
  const [stars, setStars] = useState(5);
  const [relevance, setRelevance] = useState(5);
  const [minutesSaved, setMinutesSaved] = useState(60);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitFeedback({
        resource_id: resourceId,
        stars,
        relevance_rating: relevance,
        estimated_minutes_saved: Number(minutesSaved),
        qualitative_comment: comment,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        if (onSubmitted) onSubmitted();
      }, 1500);
    } catch (err) {
      alert("Error al enviar retroalimentación");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              ¡Gracias por tu Retroalimentación!
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Tus respuestas alimentan las métricas pedagógicas de impacto y pertinencia de AulaMIA.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="flex items-center gap-2 text-brand-600 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Valoración de Pertinencia Pedagógica</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                ¿Qué tan útil fue este recurso?
              </h3>
              <p className="text-slate-500 mt-0.5 line-clamp-1">
                {resourceTitle}
              </p>
            </div>

            {/* Stars Rating */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Calificación General (1 a 5 estrellas)
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStars(star)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= stars
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-bold text-sm text-slate-700">
                  {stars}.0 / 5.0
                </span>
              </div>
            </div>

            {/* Time Saved Estimation */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Tiempo de diseño pedagógico que estimas haber ahorrado
              </label>
              <select
                value={minutesSaved}
                onChange={(e) => setMinutesSaved(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium"
              >
                <option value={30}>Aproximadamente 30 minutos</option>
                <option value={45}>Aproximadamente 45 minutos</option>
                <option value={60}>Aproximadamente 1 hora</option>
                <option value={90}>Aproximadamente 1.5 horas</option>
                <option value={120}>2 horas o más</option>
              </select>
            </div>

            {/* Qualitative Comment */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Comentario o sugerencia sobre la adaptación al grupo (opcional)
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿La propuesta se ajustó bien al grado y necesidades de tus alumnos?"
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Omitir
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm transition"
              >
                {submitting ? "Guardando..." : "Enviar Valoración"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
