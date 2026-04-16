import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Loader2, Trash2, Filter, CalendarDays, User, ChevronDown } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

const PAGE_SIZE = 30;
const EMPTY_FILTERS = { periodo: "todos", desde: "", hasta: "" };

const ALERGENO_COLORS = {
  "Gluten": "bg-amber-100 text-amber-700 border-amber-300",
  "Crustáceos": "bg-orange-100 text-orange-700 border-orange-300",
  "Huevos": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Pescado": "bg-blue-100 text-blue-700 border-blue-300",
  "Cacahuetes": "bg-amber-100 text-amber-800 border-amber-300",
  "Soja": "bg-green-100 text-green-700 border-green-300",
  "Lácteos": "bg-sky-100 text-sky-700 border-sky-300",
  "Frutos Cáscara": "bg-red-100 text-red-700 border-red-300",
  "Apio": "bg-lime-100 text-lime-700 border-lime-300",
  "Mostaza": "bg-yellow-100 text-yellow-800 border-yellow-400",
  "Sésamo": "bg-orange-100 text-orange-800 border-orange-300",
  "Sulfitos": "bg-purple-100 text-purple-700 border-purple-300",
  "Altramuces": "bg-pink-100 text-pink-700 border-pink-300",
  "Moluscos": "bg-indigo-100 text-indigo-700 border-indigo-300",
};

function FiltrosPanel({ filtros, setFiltros, onClose }) {
  const [local, setLocal] = useState(filtros);
  function set(f, v) { setLocal((prev) => ({ ...prev, [f]: v })); }
  const periodos = [
    { id: "hoy", label: "Hoy" }, { id: "semana", label: "Esta semana" },
    { id: "mes", label: "Este mes" }, { id: "todos", label: "Todos" },
  ];
  return (
    <div className="bg-secondary p-5 space-y-5 border-b border-border/40">
      <p className="font-semibold text-[#0A3E47]">Período rápido</p>
      <div className="flex gap-2 flex-wrap">
        {periodos.map((p) => (
          <button key={p.id} onClick={() => set("periodo", p.id)}
            className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors ${local.periodo === p.id ? "bg-[#6BB68A] border-[#6BB68A] text-white" : "bg-white border-border text-foreground hover:border-[#6BB68A]"}`}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Desde</label>
          <input type="date" value={local.desde} onChange={(e) => { set("desde", e.target.value); set("periodo", "personalizado"); }}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Hasta</label>
          <input type="date" value={local.hasta} onChange={(e) => { set("hasta", e.target.value); set("periodo", "personalizado"); }}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => { setFiltros(local); onClose(); }} className="py-2.5 rounded-xl bg-[#6BB68A] hover:bg-[#5aa377] text-white font-semibold text-sm transition-colors">Aplicar filtros</button>
        <button onClick={() => { setFiltros(EMPTY_FILTERS); setLocal(EMPTY_FILTERS); onClose(); }} className="py-2.5 rounded-xl bg-white border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors">Limpiar filtros</button>
      </div>
    </div>
  );
}

function aplicarFiltros(registros, filtros) {
  return registros.filter((r) => {
    const fecha = r.fecha ? new Date(r.fecha) : null;
    if (!fecha) return true;
    const now = new Date();
    if (filtros.periodo !== "todos" && filtros.periodo !== "personalizado") {
      if (filtros.periodo === "hoy" && (fecha < startOfDay(now) || fecha > endOfDay(now))) return false;
      if (filtros.periodo === "semana" && (fecha < startOfWeek(now, { weekStartsOn: 1 }) || fecha > endOfWeek(now, { weekStartsOn: 1 }))) return false;
      if (filtros.periodo === "mes" && (fecha < startOfMonth(now) || fecha > endOfMonth(now))) return false;
    }
    if (filtros.desde && fecha < startOfDay(new Date(filtros.desde))) return false;
    if (filtros.hasta && fecha > endOfDay(new Date(filtros.hasta))) return false;
    return true;
  });
}

export default function ListaRegistrosAlergenos({ refreshKey }) {
  const { currentBusiness } = useBusiness();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState(EMPTY_FILTERS);
  const hayFiltrosActivos = JSON.stringify(filtros) !== JSON.stringify(EMPTY_FILTERS);

  async function fetchPage(skipVal, replace = false) {
    if (!currentBusiness) return;
    const data = await base44.entities.RegistroAlergeno.filter({ business_id: currentBusiness.id }, "-fecha", PAGE_SIZE + 1, skipVal);
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

  async function handleLoadMore() { setLoadingMore(true); await fetchPage(skip, false); setLoadingMore(false); }
  async function handleDelete(id) {
    await base44.entities.RegistroAlergeno.delete(id);
    setRegistros((prev) => prev.filter((r) => r.id !== id));
  }

  const filtrados = useMemo(() => aplicarFiltros(registros, filtros), [registros, filtros]);

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (registros.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border">
      <div className="px-5 py-4 flex items-center justify-between bg-secondary border-b border-border/40">
        <p className="font-semibold text-[#0A3E47]">
          Registros de alérgenos
          {hayFiltrosActivos && <span className="ml-2 text-xs font-normal text-[#6BB68A]">({filtrados.length} resultados)</span>}
        </p>
        <button onClick={() => setMostrarFiltros((v) => !v)}
          className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${mostrarFiltros || hayFiltrosActivos ? "bg-[#6BB68A] border-[#6BB68A] text-white" : "bg-white border-border text-muted-foreground hover:text-foreground"}`}>
          <Filter className="w-4 h-4" />
        </button>
      </div>
      {mostrarFiltros && (
        <FiltrosPanel filtros={filtros} setFiltros={(f) => { setFiltros(f); }} onClose={() => setMostrarFiltros(false)} />
      )}
      <div className="p-4 space-y-3">
        {filtrados.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No hay registros con los filtros aplicados.</p>}
        {filtrados.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-border px-5 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-bold text-foreground text-base mb-2">{r.producto}</p>
                {r.alergenos?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {r.alergenos.map((a) => (
                      <span key={a} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${ALERGENO_COLORS[a] || "bg-yellow-100 text-yellow-700 border-yellow-300"}`}>{a}</span>
                    ))}
                  </div>
                )}
                {r.proveedor && <p className="text-sm text-foreground mb-0.5"><span className="font-semibold">Proveedor: </span>{r.proveedor}</p>}
                {r.lote && <p className="text-sm text-foreground mb-0.5"><span className="font-semibold">Lote: </span>{r.lote}</p>}
                {r.medidas_preventivas && <p className="text-sm text-foreground mb-0.5"><span className="font-semibold">Medidas preventivas: </span>{r.medidas_preventivas}</p>}
                {r.observaciones && <p className="text-xs text-muted-foreground italic mt-1">{r.observaciones}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{r.fecha ? format(new Date(r.fecha), "d MMM yyyy", { locale: es }) : "—"}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{r.created_by?.split("@")[0] || "—"}</span>
                  {r.origen === "recepcion" && <><span>·</span><span className="text-[#6BB68A] font-medium">Desde recepción</span></>}
                </div>
              </div>
              <button onClick={() => handleDelete(r.id)} className="text-destructive/60 hover:text-destructive transition-colors ml-3 shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {hasMore && !hayFiltrosActivos && (
          <button onClick={handleLoadMore} disabled={loadingMore}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border bg-secondary text-sm font-medium text-[#0A3E47] hover:bg-secondary/70 transition-colors">
            {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
            Cargar más
          </button>
        )}
      </div>
    </div>
  );
}