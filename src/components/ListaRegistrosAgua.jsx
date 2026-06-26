import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Loader2, Trash2, Filter, CalendarDays, User, ChevronDown } from "lucide-react";
import ListaRegistrosSkeleton from "@/components/ListaRegistrosSkeleton";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

const PAGE_SIZE = 30;
const EMPTY_FILTERS = { periodo: "todos", desde: "", hasta: "", punto: "todos" };

function getEstado(r) {
  const cloroOk = r.cloro_nivel == null || (r.cloro_nivel >= r.cloro_min && r.cloro_nivel <= r.cloro_max);
  const phOk = r.ph_nivel == null || (r.ph_nivel >= r.ph_min && r.ph_nivel <= r.ph_max);
  return cloroOk && phOk ? "correcto" : "fuera_rango";
}

function FiltrosPanel({ registros, filtros, setFiltros, onClose }) {
  const [local, setLocal] = useState(filtros);
  const puntos = useMemo(() => [...new Set(registros.map((r) => r.punto_nombre).filter(Boolean))], [registros]);
  function set(field, val) { setLocal((prev) => ({ ...prev, [field]: val })); }
  function handleAplicar() { setFiltros(local); onClose(); }
  function handleLimpiar() { setLocal(EMPTY_FILTERS); setFiltros(EMPTY_FILTERS); onClose(); }
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
          <label className="block text-sm font-medium text-foreground mb-1.5">Desde</label>
          <input type="date" value={local.desde} onChange={(e) => { set("desde", e.target.value); set("periodo", "personalizado"); }}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Hasta</label>
          <input type="date" value={local.hasta} onChange={(e) => { set("hasta", e.target.value); set("periodo", "personalizado"); }}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Punto de toma</label>
        <select value={local.punto} onChange={(e) => set("punto", e.target.value)}
          className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="todos">Todos los puntos</option>
          {puntos.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleAplicar} className="py-2.5 rounded-xl bg-[#6BB68A] hover:bg-[#5aa377] text-white font-semibold text-sm transition-colors">Aplicar filtros</button>
        <button onClick={handleLimpiar} className="py-2.5 rounded-xl bg-white border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors">Limpiar filtros</button>
      </div>
    </div>
  );
}

function aplicarFiltros(registros, filtros) {
  return registros.filter((r) => {
    if (filtros.periodo !== "todos" && filtros.periodo !== "personalizado") {
      const fecha = new Date(r.fecha);
      const now = new Date();
      if (filtros.periodo === "hoy" && (fecha < startOfDay(now) || fecha > endOfDay(now))) return false;
      if (filtros.periodo === "semana" && (fecha < startOfWeek(now, { weekStartsOn: 1 }) || fecha > endOfWeek(now, { weekStartsOn: 1 }))) return false;
      if (filtros.periodo === "mes" && (fecha < startOfMonth(now) || fecha > endOfMonth(now))) return false;
    }
    if (filtros.desde && new Date(r.fecha) < startOfDay(new Date(filtros.desde))) return false;
    if (filtros.hasta && new Date(r.fecha) > endOfDay(new Date(filtros.hasta))) return false;
    if (filtros.punto !== "todos" && r.punto_nombre !== filtros.punto) return false;
    return true;
  });
}

export default function ListaRegistrosAgua({ refreshKey }) {
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
    const data = await base44.entities.RegistroAgua.filter({ business_id: currentBusiness.id }, "-fecha", PAGE_SIZE + 1, skipVal);
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
    await base44.entities.RegistroAgua.delete(id);
    setRegistros((prev) => prev.filter((r) => r.id !== id));
  }

  const filtrados = useMemo(() => aplicarFiltros(registros, filtros), [registros, filtros]);

  if (loading) return <ListaRegistrosSkeleton />;
  if (registros.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border">
      <div className="px-5 py-4 flex items-center justify-between bg-secondary border-b border-border/40">
        <p className="font-semibold text-[#0A3E47]">
          Registros de control de agua
          {hayFiltrosActivos && <span className="ml-2 text-xs font-normal text-[#6BB68A]">({filtrados.length} resultados)</span>}
        </p>
        <button onClick={() => setMostrarFiltros((v) => !v)}
          className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${mostrarFiltros || hayFiltrosActivos ? "bg-[#6BB68A] border-[#6BB68A] text-white" : "bg-white border-border text-muted-foreground hover:text-foreground"}`}>
          <Filter className="w-4 h-4" />
        </button>
      </div>
      {mostrarFiltros && (
        <FiltrosPanel registros={registros} filtros={filtros} setFiltros={(f) => { setFiltros(f); }} onClose={() => setMostrarFiltros(false)} />
      )}
      <div className="p-4 space-y-3">
        {filtrados.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No hay registros con los filtros aplicados.</p>}
        {filtrados.map((r) => {
          const estado = getEstado(r);
          const correcto = estado === "correcto";
          return (
            <div key={r.id} className={`rounded-xl border px-5 py-4 ${correcto ? "bg-white border-border" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-foreground text-base">{r.punto_nombre}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${correcto ? "bg-[#e6f5ed] text-[#2d8a5e]" : "bg-red-50 text-red-500"}`}>{correcto ? "Correcto" : "Fuera de rango"}</span>
                  </div>
                  <div className="flex gap-4 mb-2">
                    {r.cloro_nivel != null && <div><p className="text-xs text-muted-foreground">Cloro</p><p className="text-xl font-bold text-[#6BB68A]">{r.cloro_nivel} ppm</p></div>}
                    {r.ph_nivel != null && <div><p className="text-xs text-muted-foreground">pH</p><p className="text-xl font-bold text-foreground">{r.ph_nivel}</p></div>}
                  </div>
                  {r.cloro_nivel != null && <p className="text-sm text-foreground"><span className="font-semibold">Rango cloro: </span>{r.cloro_min}-{r.cloro_max} ppm</p>}
                  {r.ph_nivel != null && <p className="text-sm text-foreground"><span className="font-semibold">Rango pH: </span>{r.ph_min}-{r.ph_max}</p>}
                  <p className="text-sm text-foreground mt-1"><span className="font-semibold">Propiedades organolépticas: </span>{r.propiedades_organolepticas ? <span className="text-[#6BB68A]">✓ Correctas</span> : <span className="text-red-500">✗ Incorrectas</span>}</p>
                  {r.observaciones && <p className="text-xs text-muted-foreground italic mt-1">{r.observaciones}</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{r.fecha ? format(new Date(r.fecha), "d MMM yyyy HH:mm", { locale: es }) : "—"}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{r.registrado_por || r.created_by?.split("@")[0] || "—"}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(r.id)} className="text-destructive/60 hover:text-destructive transition-colors ml-3"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
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