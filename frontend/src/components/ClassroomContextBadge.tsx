"use client";

import { ClassroomProfile } from "@/types";
import { Users, Clock, Sparkles, AlertCircle, ShieldCheck, ChevronDown } from "lucide-react";
import Link from "next/link";

interface Props {
  classrooms: ClassroomProfile[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function ClassroomContextBadge({ classrooms, selectedId, onSelect }: Props) {
  const activeClassroom = classrooms.find((c) => c.id === selectedId) || classrooms[0];

  if (!activeClassroom) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-amber-800 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>No hay perfiles de aula cargados. Crea tu primer perfil para comenzar.</span>
        </div>
        <Link
          href="/perfiles"
          className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition"
        >
          Crear Perfil
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Active Context Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-600 shrink-0 mt-0.5">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                Contexto Activo
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activeClassroom.session_duration_minutes} min / sesión
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              {activeClassroom.name}
            </h2>
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
              {activeClassroom.grade} • {activeClassroom.subject} • {activeClassroom.student_count} estudiantes • Metodología: {activeClassroom.methodology}
            </p>
          </div>
        </div>

        {/* Switcher Dropdown & Details */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => onSelect(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none transition cursor-pointer"
            >
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  Cambiar: {c.name} ({c.grade})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <Link
            href="/perfiles"
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl border border-slate-200 transition"
          >
            Gestionar
          </Link>
        </div>
      </div>

      {/* Support Tags & Inclusion Highlight */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-inclusion-600" />
          Apoyos DUA cargados:
        </span>
        {activeClassroom.inclusion_support_needs.map((need, idx) => (
          <span
            key={idx}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60"
          >
            {need}
          </span>
        ))}
      </div>
    </div>
  );
}
