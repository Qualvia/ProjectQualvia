import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Loader2, ChevronDown, ChevronUp, User, CalendarDays, Filter, FileDown } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";

const PAGE_SIZE = 20;

function PuntuacionBadge({ puntuacion }) {
  const color = puntuacion === 100 ? "text-[#2d8a5e]" : puntuacion >= 75 ? "text-yellow-600" : "text-red-500";
  return (
    <div className="text-right">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Puntuación</p>
      <p className={`text-2xl font-bold ${color}`}>{puntuacion}%</p>
      <p className="text-xs text-muted-foreground">items completados</p>
    </div>
  );
}

function ItemEstadoIcon({ estado }) {
  if (estado === "ok") return <CheckCircle2 className="w-4 h-4 text-[#6BB68A] shrink-0" />;
  if (estado === "ko") return <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
  return <MinusCircle className="w-4 h-4 text-muted-foreground shrink-0" />;
}

export default function TabHistorico({ refreshKey }) {
  const { currentBusiness } = useBusiness();
  const [ejecuciones, setEjecuciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [filtros, setFiltros] = useState({ periodo: "todos", desde: "", hasta: "", checklist: "todos" });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const hayFiltros = JSON.stringify(filtros) !== JSON.stringify({ periodo: "todos", desde: "", hasta: "", checklist: "todos" });

  async function fetchPage(skipVal, replace = false) {
    if (!currentBusiness) return;
    const data = await base44.entities.ChecklistEjecucion.filter({ business_id: currentBusiness.id }, "-fecha", PAGE_SIZE + 1, skipVal);
    const hasMoreData = data.length > PAGE_SIZE;
    const slice = hasMoreData ? data.slice(0, PAGE_SIZE) : data;
    setEjecuciones((prev) => replace ? slice : [...prev, ...slice]);
    setHasMore(hasMoreData);
    setSkip(skipVal + slice.length);
  }

  useEffect(() => {
    if (!currentBusiness) return;
    setLoading(true);
    fetchPage(0, true).finally(() => setLoading(false));
  }, [currentBusiness, refreshKey]);

  const checklistNombres = useMemo(() => [...new Set(ejecuciones.map((e) => e.plantilla_nombre).filter(Boolean))], [ejecuciones]);

  const filtradas = useMemo(() => ejecuciones.filter((e) => {
    const fecha = e.fecha ? new Date(e.fecha) : null;
    const now = new Date();
    if (fecha && filtros.periodo === "hoy" && (fecha < startOfDay(now) || fecha > endOfDay(now))) return false;
    if (fecha && filtros.periodo === "semana" && (fecha < startOfWeek(now, { weekStartsOn: 1 }) || fecha > endOfWeek(now, { weekStartsOn: 1 }))) return false;
    if (fecha && filtros.periodo === "mes" && (fecha < startOfMonth(now) || fecha > endOfMonth(now))) return false;
    if (filtros.desde && fecha && fecha < startOfDay(new Date(filtros.desde))) return false;
    if (filtros.hasta && fecha && fecha > endOfDay(new Date(filtros.hasta))) return false;
    if (filtros.checklist !== "todos" && e.plantilla_nombre !== filtros.checklist) return false;
    return true;
  }), [ejecuciones, filtros]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (ejecuciones.length === 0) return (
    <div className="text-center py-14">
      <p className="text-muted-foreground">No hay ejecuciones registradas todavía.</p>
      <p className="text-sm text-muted-foreground mt-1">Inicia un checklist para ver el histórico aquí.</p>
    </div>
  );

  const periodos = [{ id: "hoy", label: "Hoy" }, { id: "semana", label: "Esta semana" }, { id: "mes", label: "Este mes" }, { id: "todos", label: "Todos" }];

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-border">
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium text-muted-foreground shrink-0">Filtrar por:</span>
          <select value={filtros.periodo} onChange={(e) => setFiltros((f) => ({ ...f, periodo: e.target.value }))}
            className="h-9 rounded-lg border border-border px-3 text-sm focus:outline-none focus:border-[#6BB68A] bg-white">
            {periodos.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <select value={filtros.checklist} onChange={(e) => setFiltros((f) => ({ ...f, checklist: e.target.value }))}
            className="h-9 rounded-lg border border-border px-3 text-sm focus:outline-none focus:border-[#6BB68A] bg-white">
            <option value="todos">Todos los checklists</option>
            {checklistNombres.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          {hayFiltros && (
            <button onClick={() => setFiltros({ periodo: "todos", desde: "", hasta: "", checklist: "todos" })}
              className="text-xs text-[#6BB68A] hover:underline">Limpiar</button>
          )}
          <div className="ml-auto">
            <button
              onClick={() => {}}
              className="flex items-center gap-2 h-9 px-4 rounded-lg border border-[#6BB68A] bg-[#6BB68A] text-sm font-medium text-white hover:bg-[#5aa377] transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filtradas.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No hay resultados con los filtros aplicados.</p>}
        {filtradas.map((e) => {
          const expanded = expandedId === e.id;
          const borderColor = e.puntuacion === 100 ? "border-l-[#6BB68A]" : e.puntuacion >= 75 ? "border-l-yellow-400" : "border-l-red-400";
          return (
            <div key={e.id} className={`bg-white rounded-2xl border border-border border-l-4 ${borderColor} overflow-hidden`}>
              <div className="px-5 py-4 flex items-center justify-between gap-4 cursor-pointer" onClick={() => setExpandedId(expanded ? null : e.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#0A3E47] text-base">{e.plantilla_nombre}</span>
                    <button className="text-muted-foreground hover:text-foreground">
                      {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {e.fecha && (
                      <span className="text-xs bg-secondary text-foreground px-2.5 py-1 rounded-full">
                        {format(new Date(e.fecha), "d MMM yyyy HH:mm", { locale: es })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    <span>{e.registrado_por || "—"}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Puntuación</p>
                  <p className={`text-2xl font-bold ${e.puntuacion === 100 ? "text-[#2d8a5e]" : e.puntuacion >= 75 ? "text-yellow-600" : "text-red-500"}`}>{e.puntuacion}%</p>
                  <p className="text-xs text-muted-foreground">{e.items_ok}/{e.total_items} ítems</p>
                </div>
              </div>

              {expanded && (
                <div className="border-t border-border px-5 py-4 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Detalle de ejecución:</p>
                  <div className="space-y-2">
                    {(e.items_resultado || []).map((it, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <ItemEstadoIcon estado={it.estado} />
                        <div>
                          <p className="text-sm text-foreground">{it.texto}</p>
                          {it.estado === "ko" && it.motivo && (
                            <p className="text-xs text-red-500 mt-0.5">Motivo: {it.motivo}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {e.observaciones && (
                    <div className="mt-2 p-3 bg-secondary rounded-xl">
                      <p className="text-xs font-semibold text-foreground mb-1">Observaciones:</p>
                      <p className="text-sm text-muted-foreground">{e.observaciones}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasMore && !hayFiltros && (
        <button onClick={async () => { setLoadingMore(true); await fetchPage(skip); setLoadingMore(false); }}
          disabled={loadingMore}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border bg-secondary text-sm font-medium text-[#0A3E47] hover:bg-secondary/70 transition-colors">
          {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
          Cargar más
        </button>
      )}
    </div>
  );
}