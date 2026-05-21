import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Loader2, Trash2, Filter, CalendarDays, User, ChevronDown, Printer, GitBranch } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isPast, isToday, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";

const PAGE_SIZE = 20;
const EMPTY_FILTERS = { periodo: "todos", desde: "", hasta: "" };

function FiltrosPanel({ filtros, setFiltros, onClose }) {
  const [local, setLocal] = useState(filtros);
  function set(f, v) { setLocal((prev) => ({ ...prev, [f]: v })); }
  const periodos = [
    { id: "hoy", label: "Hoy" },
    { id: "semana", label: "Esta semana" },
    { id: "mes", label: "Este mes" },
    { id: "todos", label: "Todos" },
  ];
  return (
    <div className="bg-secondary p-5 space-y-5 border-b border-border/40">
      <p className="font-semibold text-[#0A3E47]">Período rápido</p>
      <div className="flex gap-2 flex-wrap">
        {periodos.map((p) => (
          <button key={p.id} onClick={() => set("periodo", p.id)}
            className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors
              ${local.periodo === p.id ? "bg-[#6BB68A] border-[#6BB68A] text-white" : "bg-white border-border text-foreground hover:border-[#6BB68A]"}`}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Desde</label>
          <input type="date" value={local.desde}
            onChange={(e) => { set("desde", e.target.value); set("periodo", "personalizado"); }}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Hasta</label>
          <input type="date" value={local.hasta}
            onChange={(e) => { set("hasta", e.target.value); set("periodo", "personalizado"); }}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => { setFiltros(local); onClose(); }}
          className="py-2.5 rounded-xl bg-[#6BB68A] hover:bg-[#5aa377] text-white font-semibold text-sm transition-colors">
          Aplicar filtros
        </button>
        <button onClick={() => { setFiltros(EMPTY_FILTERS); setLocal(EMPTY_FILTERS); onClose(); }}
          className="py-2.5 rounded-xl bg-white border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors">
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}

// El SDK solo soporta filtro exacto por campo. El filtro de fecha se hace en cliente
// sobre la página cargada. buildQuery solo filtra por business_id.
function buildQuery(businessId) {
  return { business_id: businessId };
}

function pasaFiltroFecha(r, filtros) {
  const fecha = r.fecha ? new Date(r.fecha) : null;
  if (!fecha) return true;
  const now = new Date();
  if (filtros.periodo === "hoy") return isWithinInterval(fecha, { start: startOfDay(now), end: endOfDay(now) });
  if (filtros.periodo === "semana") return isWithinInterval(fecha, { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) });
  if (filtros.periodo === "mes") return isWithinInterval(fecha, { start: startOfMonth(now), end: endOfMonth(now) });
  if (filtros.periodo === "personalizado") {
    if (filtros.desde && fecha < startOfDay(new Date(filtros.desde))) return false;
    if (filtros.hasta && fecha > endOfDay(new Date(filtros.hasta))) return false;
  }
  return true;
}

function CaducidadBadge({ fecha }) {
  if (!fecha) return null;
  const d = new Date(fecha);
  const vencido = isPast(d) && !isToday(d);
  const hoy = isToday(d);
  const color = vencido ? "text-red-500" : hoy ? "text-orange-500" : "text-[#6BB68A]";
  return <span className={`font-semibold ${color}`}>{format(d, "d MMM yyyy", { locale: es })}</span>;
}

export default function ListaRegistrosLotes({ refreshKey }) {
  const { currentBusiness } = useBusiness();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState(EMPTY_FILTERS);
  const [expandedId, setExpandedId] = useState(null);

  const hayFiltrosActivos = JSON.stringify(filtros) !== JSON.stringify(EMPTY_FILTERS);

  async function fetchPage(skipVal, replace = false) {
    if (!currentBusiness) return;
    const q = buildQuery(currentBusiness.id);
    const data = await base44.entities.RegistroLote.filter(q, "-fecha", PAGE_SIZE + 1, skipVal);
    const hasMoreData = data.length > PAGE_SIZE;
    const slice = hasMoreData ? data.slice(0, PAGE_SIZE) : data;
    setRegistros((prev) => replace ? slice : [...prev, ...slice]);
    setHasMore(hasMoreData);
    setSkip(skipVal + slice.length);
  }

  useEffect(() => {
    if (!currentBusiness) return;
    setLoading(true);
    setSkip(0);
    fetchPage(0, true).finally(() => setLoading(false));
  }, [currentBusiness, refreshKey]);

  async function handleLoadMore() {
    setLoadingMore(true);
    await fetchPage(skip, false);
    setLoadingMore(false);
  }

  async function handleDelete(id) {
    await base44.entities.RegistroLote.delete(id);
    setRegistros((prev) => prev.filter((r) => r.id !== id));
  }

  const visibles = registros.filter((r) => pasaFiltroFecha(r, filtros));

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (registros.length === 0 && !hayFiltrosActivos) return null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border">
      <div className="px-5 py-4 flex items-center justify-between bg-secondary border-b border-border/40">
        <p className="font-semibold text-[#0A3E47]">
          Lotes registrados
          {hayFiltrosActivos && <span className="ml-2 text-xs font-normal text-[#6BB68A]">({visibles.length} resultados)</span>}
        </p>
        <button
          onClick={() => setMostrarFiltros((v) => !v)}
          className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors
            ${mostrarFiltros || hayFiltrosActivos
              ? "bg-[#6BB68A] border-[#6BB68A] text-white"
              : "bg-white border-border text-muted-foreground hover:text-foreground"}`}>
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {mostrarFiltros && (
        <FiltrosPanel filtros={filtros} setFiltros={(f) => { setFiltros(f); }} onClose={() => setMostrarFiltros(false)} />
      )}

      <div className="p-4 space-y-3">
        {visibles.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No hay registros con los filtros aplicados.</p>
        )}
        {visibles.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-border px-5 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-foreground text-base font-mono">{r.codigo_lote}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground font-medium border border-border">
                    {r.producto_elaborado}
                  </span>
                </div>

                {r.fecha_elaboracion && (
                  <p className="text-sm text-foreground mb-0.5">
                    <span className="font-semibold">Elaboración: </span>
                    {format(new Date(r.fecha_elaboracion), "d MMM yyyy", { locale: es })}
                  </p>
                )}
                {r.fecha_caducidad && (
                  <p className="text-sm text-foreground mb-0.5">
                    <span className="font-semibold">Caducidad: </span>
                    <CaducidadBadge fecha={r.fecha_caducidad} />
                  </p>
                )}
                {r.cantidad && (
                  <p className="text-sm text-foreground mb-0.5">
                    <span className="font-semibold">Cantidad: </span>{r.cantidad}
                  </p>
                )}
                {r.zona_almacenamiento && (
                  <p className="text-sm text-foreground mb-0.5">
                    <span className="font-semibold">Zona: </span>{r.zona_almacenamiento}
                  </p>
                )}

                {r.lotes_origen?.length > 0 && (
                  <div className="mt-2">
                    <button
                      onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      className="text-xs text-[#6BB68A] hover:underline flex items-center gap-1"
                    >
                      <GitBranch className="w-3 h-3" />
                      {r.lotes_origen.length} materia(s) prima(s) vinculada(s)
                    </button>
                    {expandedId === r.id && (
                      <div className="mt-2 space-y-1.5">
                        {r.lotes_origen.map((l, i) => (
                          <div key={i} className="bg-secondary rounded-lg px-3 py-2 text-xs">
                            <span className="font-semibold">{l.producto}</span>
                            {l.codigo_lote && <span className="text-muted-foreground ml-2">Lote: {l.codigo_lote}</span>}
                            {l.proveedor && <span className="text-muted-foreground ml-2">· {l.proveedor}</span>}
                            {l.cantidad_utilizada && <span className="text-muted-foreground ml-2">· {l.cantidad_utilizada}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {r.observaciones && (
                  <p className="text-xs text-muted-foreground italic mt-1">{r.observaciones}</p>
                )}

                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Creado: {r.fecha ? format(new Date(r.fecha), "d MMM yyyy HH:mm", { locale: es }) : "—"}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {r.registrado_por || r.created_by?.split("@")[0] || "—"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 ml-3 shrink-0">
                {r.documento_url && (
                  <a href={r.documento_url} target="_blank" rel="noreferrer" className="text-[#6BB68A] hover:opacity-70 transition-opacity">
                    <Printer className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => handleDelete(r.id)} className="text-destructive/60 hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {hasMore && (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border bg-secondary text-sm font-medium text-[#0A3E47] hover:bg-secondary/70 transition-colors"
          >
            {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
            Cargar más
          </button>
        )}
      </div>
    </div>
  );
}