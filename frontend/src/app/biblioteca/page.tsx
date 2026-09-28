"use client";

import { useState, useEffect } from "react";
import { 
  FolderArchive, 
  Trash2, 
  Printer, 
  Search, 
  BookOpen, 
  Layers, 
  CheckSquare, 
  Gamepad2, 
  Wand2, 
  FileText,
  Clock,
  Calendar,
  Sparkles
} from "lucide-react";
import { getResources, deleteResource, getStats } from "@/lib/api";
import { DashboardStats } from "@/types";

export default function BibliotecaPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resList, statsData] = await Promise.all([
        getResources(),
        getStats().catch(() => null),
      ]);
      setResources(resList);
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error("Error loading resources:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("¿Deseas eliminar este recurso de la biblioteca?")) {
      await deleteResource(id);
      loadData();
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "lesson_plan":
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case "activity_set":
        return <Layers className="w-5 h-5 text-purple-600" />;
      case "evaluation":
        return <CheckSquare className="w-5 h-5 text-emerald-600" />;
      case "game":
        return <Gamepad2 className="w-5 h-5 text-amber-600" />;
      case "adaptation":
        return <Wand2 className="w-5 h-5 text-fuchsia-600" />;
      case "material":
        return <FileText className="w-5 h-5 text-teal-600" />;
      default:
        return <FolderArchive className="w-5 h-5 text-slate-600" />;
    }
  };

  const getResourceTypeName = (type: string) => {
    switch (type) {
      case "lesson_plan":
        return "Planeación de Clase";
      case "activity_set":
        return "Set de Actividades DUA";
      case "evaluation":
        return "Evaluación Formativa";
      case "game":
        return "Mini-Juego Educativo";
      case "adaptation":
        return "Adaptación Curricular";
      case "material":
        return "Ficha de Trabajo";
      default:
        return "Recurso Pedagógico";
    }
  };

  const filteredResources = resources.filter((r) => {
    const matchesType = filterType === "all" || r.resource_type === filterType;
    const title = r.title || r.game_title || r.adapted_title || "";
    const topic = r.topic || "";
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FolderArchive className="w-6 h-6 text-brand-600" />
            Biblioteca de Recursos Guardados
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Historial de materiales pedagógicos generados para tus aulas con AulaMIA.
          </p>
        </div>

        {stats && (
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              Tiempo total ahorrado:
            </span>
            <span className="font-bold text-slate-900">
              {stats.estimated_hours_saved} horas
            </span>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Buscar por tema o título..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        {/* Type selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-500 font-medium shrink-0">Filtrar:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium cursor-pointer w-full sm:w-auto"
          >
            <option value="all">Todos los recursos</option>
            <option value="lesson_plan">Planeaciones de Clase</option>
            <option value="activity_set">Actividades Diferenciadas</option>
            <option value="evaluation">Evaluaciones y Rúbricas</option>
            <option value="game">Mini-Juegos Educativos</option>
            <option value="adaptation">Adaptaciones Inclusivas</option>
            <option value="material">Fichas Imprimibles</option>
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">
          Cargando biblioteca de recursos...
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FolderArchive className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No hay recursos guardados</h3>
          <p className="text-xs text-slate-500">
            {searchQuery || filterType !== "all"
              ? "No se encontraron materiales con los filtros actuales."
              : "Genera tu primera planeación, actividad o ficha de trabajo para verla aquí."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const title = res.title || res.game_title || res.adapted_title || "Recurso Pedagógico";
            const dateStr = res.saved_at || res.created_at;
            const dateFormatted = dateStr ? new Date(dateStr).toLocaleDateString() : "Reciente";

            return (
              <div
                key={res.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:border-brand-200 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        {getResourceIcon(res.resource_type)}
                      </div>
                      <span className="text-[11px] font-bold text-slate-600">
                        {getResourceTypeName(res.resource_type)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(res.id)}
                      className="text-slate-400 hover:text-rose-500 transition p-1"
                      title="Eliminar de biblioteca"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                    {title}
                  </h3>

                  {res.topic && (
                    <p className="text-xs text-brand-600 font-medium mt-1 line-clamp-1">
                      Tema: {res.topic}
                    </p>
                  )}

                  {res.grade && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      {res.grade} {res.subject ? `• ${res.subject}` : ""}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    {dateFormatted}
                  </span>

                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-600 font-semibold transition text-[11px]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
