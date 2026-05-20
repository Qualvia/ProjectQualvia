import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Loader2, Trash2, Filter, CalendarDays, User, ChevronDown, Snowflake } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

const PAGE_SIZE = 30;

const OPERACION_STYLES = {
  "Congelación":   { badge: "bg-sky-50 text-sky-600 font-medium" },
  "Descongelación": { badge: "bg-orange-50 text-orange-600 font-medium" },
};

const EMPTY_FILTERS = { periodo: "todos", desde: "", hasta: "", operacion: "todos", equipo: "todos", usuario: "todos" };

function FiltrosPanel({ registros, filtros, setFiltros, onClose }) {
  const [local, setLocal] = useState(filtros);
  const equipos = useMemo(() => [...new Set(registros.map((r) => r.equipo_nombre).filter(Boolean))], [registros]);
  const usuarios = useMemo(() => [...new Set(registros.map((r) => r.created_by?.split("@")[0]).filter(Boolean))], [registros]);
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Operación</label>
          <select value={local.operacion} onChange={(e) => set("operacion", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="todos">Todas</option>
            <option value="Congelación">Congelación</option>
            <option value="Descongelación">Descongelación</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Equipo</label>
          <select value={local.equipo} onChange={(e) => set("equipo", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="todos">Todos</option>
            {equipos.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Usuario</label>
        <select value={local.usuario} onChange={(e) => set("usuario", e.target.value)}
          className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="todos">Todos los usuarios</option>
          {usuarios.map((u) => <option key={u} value={u}>{u}</option>)}
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
    if (filtros.operacion !== "todos" && r.operacion !== filtros.operacion) return false;
    if (filtros.equipo !== "todos" && r.equipo_nombre !== filtros.equipo) return false;
    if (filtros.usuario !== "todos" && r.created_by?.split("@")[0] !== filtros.usuario) return false;
    return true;
  });
}

export default function ListaRegistrosCongelacion({ refreshKey }) {
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
    const data = await base44.entities.RegistroCongelacion.filter({ business_id: currentBusiness.id }, "-fecha", PAGE_SIZE + 1, skipVal);
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
    await base44.entities.RegistroCongelacion.delete(id);
    setRegistros((prev) => prev.filter((r) => r.id !== id));
  }

  const filtrados = useMemo(() => aplicarFiltros(registros, filtros), [registros, filtros]);

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (registros.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl overflow-hidden border border-border">
        <div className="px-5 py-4 flex items-center justify-between bg-secondary border-b border-border/40">
          <p className="font-semibold text-[#0A3E47]">
            Registros de congelación/descongelación
            {hayFiltrosActivos && <span className="ml-2 text-xs font-normal text-[#6BB68A]">({filtrados.length} resultados)</span>}
          </p>
          <button onClick={() => setMostrarFiltros((v) => !v)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${mostrarFiltros || hayFiltrosActivos ? "bg-[#6BB68A] border-[#6BB68A] text-white" : "bg-white border-border text-muted-foreground hover:text-foreground"}`}>
            <Filter className="w-4 h-4" />
          </button>
        </div>
        {mostrarFiltros && (
          <FiltrosPanel registros={registros} filtros={filtros} setFiltros={setFiltros} onClose={() => setMostrarFiltros(false)} />
        )}
        <div className="p-4 space-y-3">
          {filtrados.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No hay registros con los filtros aplicados.</p>}
          {filtrados.map((r) => {
            const styles = OPERACION_STYLES[r.operacion] || OPERACION_STYLES["Congelación"];
            return (
              <div key={r.id} className="bg-white rounded-xl border border-border px-5 py-4 relative">
                <button onClick={() => handleDelete(r.id)} className="absolute top-4 right-4 text-destructive/60 hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 mb-1 pr-8">
                  <Snowflake className="w-4 h-4 text-sky-400" />
                  <span className="font-bold text-foreground">{r.producto}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}>{r.operacion}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground my-1.5">
                  {r.equipo_nombre && <span className="text-muted-foreground">Equipo: <span className="text-foreground font-medium">{r.equipo_nombre}</span></span>}
                  {r.temperatura_inicial !== undefined && <span>T. inicial: <span className="font-medium">{r.temperatura_inicial}°C</span></span>}
                  {r.temperatura_final !== undefined && <span>T. final: <span className="font-medium">{r.temperatura_final}°C</span></span>}
                  {r.consumir_antes_de && <span>Consumir antes de: <span className="font-medium">{r.consumir_antes_de}</span></span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{r.fecha ? format(new Date(r.fecha), "d MMM yyyy HH:mm", { locale: es }) : "—"}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{r.created_by?.split("@")[0] || "—"}</span>
                </div>
                {r.observaciones && <p className="text-xs text-muted-foreground mt-1 italic">{r.observaciones}</p>}
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
    </div>
  );
}