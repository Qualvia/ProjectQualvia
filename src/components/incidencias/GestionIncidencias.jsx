import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import {
  AlertTriangle, Eye, CheckCircle2, TrendingUp, Clock,
  Filter, FileText, Pencil, Trash2, Loader2, ChevronDown,
  AlertCircle
} from "lucide-react";
import { format, subWeeks, subMonths, subQuarters, subYears, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import NuevoRegistroIncidencia from "./NuevoRegistroIncidencia";
import CerrarIncidenciaDialog from "./CerrarIncidenciaDialog";
import SeguimientoIncidenciaDialog from "./SeguimientoIncidenciaDialog";

const PRIORIDAD_BADGE = {
  baja:    "bg-blue-50 text-blue-600",
  media:   "bg-yellow-50 text-yellow-700",
  alta:    "bg-orange-50 text-orange-600",
  critica: "bg-red-100 text-red-600",
};

const PERIODO_OPTIONS = [
  { value: "todas", label: "Todas las incidencias" },
  { value: "semana", label: "Última semana" },
  { value: "mes", label: "Último mes" },
  { value: "trimestre", label: "Último trimestre" },
  { value: "semestre", label: "Último semestre" },
  { value: "anio", label: "Último año" },
  { value: "personalizado", label: "Personalizado" },
];

function getCardStyle(estado) {
  if (estado === "abierta") return "bg-red-50 border-red-200";
  if (estado === "seguimiento") return "bg-blue-50 border-blue-100";
  return "bg-white border-border";
}

function getEstadoBadge(estado) {
  if (estado === "abierta") return "bg-red-100 text-red-600";
  if (estado === "seguimiento") return "bg-blue-100 text-blue-600";
  return "bg-green-100 text-green-700";
}

function getEstadoLabel(estado) {
  if (estado === "abierta") return "Abierta";
  if (estado === "seguimiento") return "En Seguimiento";
  return "Cerrada";
}

function filtrarPorPeriodo(registros, periodo, desde, hasta) {
  const now = new Date();
  return registros.filter((r) => {
    const fecha = new Date(r.fecha);
    if (periodo === "semana" && fecha < subWeeks(now, 1)) return false;
    if (periodo === "mes" && fecha < subMonths(now, 1)) return false;
    if (periodo === "trimestre" && fecha < subQuarters(now, 1)) return false;
    if (periodo === "semestre" && fecha < subMonths(now, 6)) return false;
    if (periodo === "anio" && fecha < subYears(now, 1)) return false;
    if (periodo === "personalizado") {
      if (desde && fecha < startOfDay(new Date(desde))) return false;
      if (hasta && fecha > endOfDay(new Date(hasta))) return false;
    }
    return true;
  });
}

const PAGE_SIZE = 30;

export default function GestionIncidencias({ refreshKey, onIncidenciasChange, showNuevo: showNuevoProp, onCloseNuevo }) {
  const { currentBusiness, user } = useBusiness();
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);

  const showNuevo = showNuevoProp ?? false;
  const [showFiltros, setShowFiltros] = useState(false);
  const [periodo, setPeriodo] = useState("todas");
  const [showPeriodoDropdown, setShowPeriodoDropdown] = useState(false);
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos");

  // Dialogs
  const [cerrarDialog, setCerrarDialog] = useState(null);
  const [seguimientoDialog, setSeguimientoDialog] = useState(null);
  const [editDialog, setEditDialog] = useState(null);

  async function fetchPage(skipVal, replace = false) {
    if (!currentBusiness) return;
    const data = await base44.entities.Incidencia.filter({ business_id: currentBusiness.id }, "-fecha", PAGE_SIZE + 1, skipVal);
    const hasMoreData = data.length > PAGE_SIZE;
    const slice = hasMoreData ? data.slice(0, PAGE_SIZE) : data;
    setIncidencias((prev) => replace ? slice : [...prev, ...slice]);
    setHasMore(hasMoreData);
    setSkip(skipVal + slice.length);
  }

  useEffect(() => {
    if (!currentBusiness) return;
    setLoading(true);
    setSkip(0);
    fetchPage(0, true).finally(() => setLoading(false));
  }, [currentBusiness, refreshKey]);

  async function handleDelete(id) {
    await base44.entities.Incidencia.delete(id);
    setIncidencias((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleLoadMore() { setLoadingMore(true); await fetchPage(skip, false); setLoadingMore(false); }

  function reload() { setLoading(true); setSkip(0); fetchPage(0, true).finally(() => setLoading(false)); onIncidenciasChange?.(); }

  const nextNumero = useMemo(() => {
    if (incidencias.length === 0) return 1;
    return Math.max(...incidencias.map((i) => i.numero || 0)) + 1;
  }, [incidencias]);

  const filtradas = useMemo(() => {
    let list = filtrarPorPeriodo(incidencias, periodo, filtroDesde, filtroHasta);
    if (filtroEstado !== "todos") list = list.filter((i) => i.estado === filtroEstado);
    if (filtroPrioridad !== "todos") list = list.filter((i) => i.prioridad === filtroPrioridad);
    return list;
  }, [incidencias, periodo, filtroDesde, filtroHasta, filtroEstado, filtroPrioridad]);

  // Stats
  const stats = useMemo(() => {
    const abiertas = filtradas.filter((i) => i.estado === "abierta").length;
    const seguimiento = filtradas.filter((i) => i.estado === "seguimiento").length;
    const cerradas = filtradas.filter((i) => i.estado === "cerrada").length;
    const total = filtradas.length;
    const tasa = total > 0 ? Math.round((cerradas / total) * 100) : 0;
    const criticas = filtradas.filter((i) => i.prioridad === "critica").length;
    const altas = filtradas.filter((i) => i.prioridad === "alta").length;

    // Tiempo promedio resolución (horas)
    const cerradasConFecha = filtradas.filter((i) => i.estado === "cerrada" && i.fecha_cierre && i.fecha);
    const tiempoPromedio = cerradasConFecha.length > 0
      ? Math.round(cerradasConFecha.reduce((acc, i) => acc + (new Date(i.fecha_cierre) - new Date(i.fecha)) / 3600000, 0) / cerradasConFecha.length)
      : 0;

    return { abiertas, seguimiento, cerradas, total, tasa, criticas, altas, tiempoPromedio };
  }, [filtradas]);

  const periodoLabel = PERIODO_OPTIONS.find((p) => p.value === periodo)?.label || "Todas las incidencias";

  return (
    <div className="space-y-5">

      {/* Formulario nuevo */}
      {showNuevo && !editDialog && (
        <NuevoRegistroIncidencia
          nextNumero={nextNumero}
          onCancel={() => onCloseNuevo?.()}
          onSaved={() => { onCloseNuevo?.(); reload(); }}
        />
      )}

      {/* Formulario editar */}
      {editDialog && (
        <NuevoRegistroIncidencia
          nextNumero={editDialog.numero}
          incidenciaExistente={editDialog}
          onCancel={() => setEditDialog(null)}
          onSaved={() => { setEditDialog(null); reload(); }}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border-2 border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.abiertas}</p>
            <p className="text-xs text-muted-foreground">Abiertas</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Eye className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.seguimiento}</p>
            <p className="text-xs text-muted-foreground">En Seguimiento</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-[#6BB68A]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.cerradas}</p>
            <p className="text-xs text-muted-foreground">Cerradas</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#6BB68A]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.tasa}%</p>
            <p className="text-xs text-muted-foreground">Tasa de Resolución</p>
            {stats.total > 0 && <p className="text-xs text-muted-foreground">{stats.cerradas} de {stats.total}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border-2 border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.criticas}</p>
            <p className="text-xs text-muted-foreground">Prioridad Crítica</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.altas}</p>
            <p className="text-xs text-muted-foreground">Prioridad Alta</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#0A3E47]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.tiempoPromedio}h</p>
            <p className="text-xs text-muted-foreground">Tiempo Promedio</p>
            <p className="text-xs text-muted-foreground">resolución</p>
          </div>
        </div>
      </div>

      {/* Período selector */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <p className="text-sm font-medium text-foreground mb-2">Período de análisis</p>
        <div className="relative">
          <button
            onClick={() => setShowPeriodoDropdown((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-input bg-white text-sm text-foreground hover:border-[#6BB68A] transition-colors">
            {periodoLabel}
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          {showPeriodoDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-xl shadow-lg overflow-hidden">
              {PERIODO_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => { setPeriodo(opt.value); setShowPeriodoDropdown(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors flex items-center justify-between ${periodo === opt.value ? "font-medium" : ""}`}>
                  {opt.label}
                  {periodo === opt.value && <CheckCircle2 className="w-4 h-4 text-[#6BB68A]" />}
                </button>
              ))}
            </div>
          )}
        </div>
        {periodo === "personalizado" && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Desde</label>
              <input type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)}
                className="w-full h-9 rounded-lg border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Hasta</label>
              <input type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)}
                className="w-full h-9 rounded-lg border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
        )}
      </div>

      {/* Lista de incidencias */}
      <div className="bg-white rounded-2xl overflow-hidden border border-border">
        <div className="px-5 py-4 flex items-center justify-between bg-secondary border-b border-border/40">
          <p className="font-semibold text-[#0A3E47]">
            Incidencias registradas
            {filtradas.length < incidencias.length && <span className="ml-2 text-xs font-normal text-[#6BB68A]">({filtradas.length} resultados)</span>}
          </p>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-white text-muted-foreground hover:text-foreground transition-colors">
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowFiltros((v) => !v)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${showFiltros ? "bg-[#6BB68A] border-[#6BB68A] text-white" : "bg-white border-border text-muted-foreground hover:text-foreground"}`}>
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Panel filtros lista */}
        {showFiltros && (
          <div className="bg-secondary p-4 space-y-3 border-b border-border/40">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Estado</label>
                <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="todos">Todos</option>
                  <option value="abierta">Abiertas</option>
                  <option value="seguimiento">En seguimiento</option>
                  <option value="cerrada">Cerradas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Prioridad</label>
                <select value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="todos">Todas</option>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
            </div>
            <button onClick={() => { setFiltroEstado("todos"); setFiltroPrioridad("todos"); }}
              className="text-sm text-muted-foreground hover:text-foreground underline">Limpiar filtros</button>
          </div>
        )}

        <div className="p-4 space-y-3">
          {loading && <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}
          {!loading && filtradas.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No hay incidencias registradas.</p>
          )}
          {filtradas.map((inc) => (
            <div key={inc.id} className={`rounded-xl border px-5 py-4 ${getCardStyle(inc.estado)}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {inc.numero && (
                      <span className="text-sm font-bold px-2 py-0.5 rounded-md border border-[#0A3E47] text-[#0A3E47]">#{inc.numero}</span>
                    )}
                    {inc.prioridad && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORIDAD_BADGE[inc.prioridad]}`}>{inc.prioridad}</span>
                    )}
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getEstadoBadge(inc.estado)}`}>{getEstadoLabel(inc.estado)}</span>
                    {(inc.modulo_origen || inc.tipo) && (
                      <span className="text-xs text-muted-foreground">{inc.modulo_origen || inc.tipo}</span>
                    )}
                  </div>
                  <p className="font-bold text-foreground mb-1">{inc.descripcion}</p>
                  {inc.causa && <p className="text-sm text-foreground">Causa: {inc.causa}</p>}
                  {inc.accion_correctiva && (
                    <p className="text-sm text-[#6BB68A] font-medium mt-0.5">Acción correctiva: {inc.accion_correctiva}</p>
                  )}
                  {inc.seguimiento_plan && inc.estado === "seguimiento" && (
                    <p className="text-sm text-blue-600 mt-0.5">Plan seguimiento: {inc.seguimiento_plan}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Registrada el {inc.fecha ? format(new Date(inc.fecha), "d MMM yyyy HH:mm", { locale: es }) : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {inc.estado !== "cerrada" && (
                    <>
                      {inc.estado !== "seguimiento" && (
                        <button
                          onClick={() => setSeguimientoDialog(inc)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                          Seguimiento
                        </button>
                      )}
                      <button
                        onClick={() => setCerrarDialog(inc)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Cerrar
                      </button>
                    </>
                  )}
                  <button onClick={() => { setEditDialog(inc); onCloseNuevo?.(); }} className="text-muted-foreground hover:text-foreground transition-colors p-1.5">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(inc.id)} className="text-destructive/60 hover:text-destructive transition-colors p-1.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {hasMore && (
            <button onClick={handleLoadMore} disabled={loadingMore}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border bg-secondary text-sm font-medium text-[#0A3E47] hover:bg-secondary/70 transition-colors">
              {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
              Cargar más
            </button>
          )}
        </div>
      </div>

      {cerrarDialog && (
        <CerrarIncidenciaDialog
          incidencia={cerrarDialog}
          open={!!cerrarDialog}
          onOpenChange={(v) => { if (!v) setCerrarDialog(null); }}
          onClosed={() => { setCerrarDialog(null); reload(); }}
        />
      )}
      {seguimientoDialog && (
        <SeguimientoIncidenciaDialog
          incidencia={seguimientoDialog}
          open={!!seguimientoDialog}
          onOpenChange={(v) => { if (!v) setSeguimientoDialog(null); }}
          onUpdated={() => { setSeguimientoDialog(null); reload(); }}
        />
      )}
    </div>
  );
}