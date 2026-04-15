import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Loader2, Trash2, Filter, CalendarDays, User, ChevronDown, X } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

function getStatus(registro) {
  const { temperatura, temp_min, temp_max } = registro;
  if (temp_min === undefined || temp_max === undefined) return "correcto";
  if (temperatura >= temp_min && temperatura <= temp_max) return "correcto";
  const diff = Math.max(temp_min - temperatura, temperatura - temp_max);
  if (diff <= 3) return "aviso";
  return "critico";
}

const STATUS_STYLES = {
  correcto: { badge: "bg-[#e6f5ed] text-[#2d8a5e] font-medium", card: "bg-white border-border", temp: "text-[#2d8a5e]" },
  aviso:    { badge: "bg-orange-50 text-orange-600 font-medium", card: "bg-red-50 border-red-200", temp: "text-orange-500" },
  critico:  { badge: "bg-red-50 text-red-500 font-medium",       card: "bg-red-50 border-red-200", temp: "text-red-500" },
};

const EMPTY_FILTERS = { periodo: "todos", desde: "", hasta: "", equipo: "todos", estado: "todos", usuario: "todos" };

function FiltrosPanel({ registros, filtros, setFiltros, onClose }) {
  const [local, setLocal] = useState(filtros);

  const equipos = useMemo(() => [...new Set(registros.map((r) => r.equipo_nombre).filter(Boolean))], [registros]);
  const usuarios = useMemo(() => [...new Set(registros.map((r) => r.created_by?.split("@")[0]).filter(Boolean))], [registros]);

  function set(field, val) {
    setLocal((prev) => ({ ...prev, [field]: val }));
  }

  function handleAplicar() {
    setFiltros(local);
    onClose();
  }

  function handleLimpiar() {
    setLocal(EMPTY_FILTERS);
    setFiltros(EMPTY_FILTERS);
    onClose();
  }

  const periodos = [
    { id: "hoy", label: "Hoy" },
    { id: "semana", label: "Esta semana" },
    { id: "mes", label: "Este mes" },
    { id: "todos", label: "Todos" },
  ];

  return (
    <div className="bg-secondary p-5 space-y-5 border-b border-border/40">
      {/* Header */}
      <p className="font-semibold text-[#0A3E47]">Período rápido</p>

      {/* Período rápido */}
      <div className="flex gap-2 flex-wrap">
        {periodos.map((p) => (
          <button
            key={p.id}
            onClick={() => set("periodo", p.id)}
            className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors
              ${local.periodo === p.id
                ? "bg-[#6BB68A] border-[#6BB68A] text-white"
                : "bg-white border-border text-foreground hover:border-[#6BB68A]"
              }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Fechas personalizadas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Desde (personalizado)</label>
          <input
            type="date"
            value={local.desde}
            onChange={(e) => { set("desde", e.target.value); set("periodo", "personalizado"); }}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Hasta (personalizado)</label>
          <input
            type="date"
            value={local.hasta}
            onChange={(e) => { set("hasta", e.target.value); set("periodo", "personalizado"); }}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Equipo + Estado */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Equipo</label>
          <select
            value={local.equipo}
            onChange={(e) => set("equipo", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="todos">Todos</option>
            {equipos.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Estado</label>
          <select
            value={local.estado}
            onChange={(e) => set("estado", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="todos">Todos los estados</option>
            <option value="correcto">Correcto</option>
            <option value="aviso">Aviso</option>
            <option value="critico">Crítico</option>
          </select>
        </div>
      </div>

      {/* Usuario */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Usuario</label>
        <select
          value={local.usuario}
          onChange={(e) => set("usuario", e.target.value)}
          className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="todos">Todos los usuarios</option>
          {usuarios.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {/* Acciones */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleAplicar}
          className="py-2.5 rounded-xl bg-[#6BB68A] hover:bg-[#5aa377] text-white font-semibold text-sm transition-colors"
        >
          Aplicar filtros
        </button>
        <button
          onClick={handleLimpiar}
          className="py-2.5 rounded-xl bg-white border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}

function aplicarFiltros(registros, filtros) {
  return registros.filter((r) => {
    // Período
    if (filtros.periodo !== "todos" && filtros.periodo !== "personalizado") {
      const fecha = new Date(r.fecha);
      const now = new Date();
      if (filtros.periodo === "hoy" && (fecha < startOfDay(now) || fecha > endOfDay(now))) return false;
      if (filtros.periodo === "semana" && (fecha < startOfWeek(now, { weekStartsOn: 1 }) || fecha > endOfWeek(now, { weekStartsOn: 1 }))) return false;
      if (filtros.periodo === "mes" && (fecha < startOfMonth(now) || fecha > endOfMonth(now))) return false;
    }
    // Fechas personalizadas
    if (filtros.desde) {
      const desde = startOfDay(new Date(filtros.desde));
      if (new Date(r.fecha) < desde) return false;
    }
    if (filtros.hasta) {
      const hasta = endOfDay(new Date(filtros.hasta));
      if (new Date(r.fecha) > hasta) return false;
    }
    // Equipo
    if (filtros.equipo !== "todos" && r.equipo_nombre !== filtros.equipo) return false;
    // Estado
    if (filtros.estado !== "todos" && getStatus(r) !== filtros.estado) return false;
    // Usuario
    if (filtros.usuario !== "todos" && r.created_by?.split("@")[0] !== filtros.usuario) return false;
    return true;
  });
}

export default function ListaRegistrosTemperatura({ refreshKey, onFueraDeRangoChange }) {
  const { currentBusiness } = useBusiness();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verTodos, setVerTodos] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState(EMPTY_FILTERS);

  const LIMITE = 5;

  useEffect(() => {
    if (!currentBusiness) return;
    setLoading(true);
    base44.entities.RegistroTemperatura.filter(
      { business_id: currentBusiness.id }, "-fecha", 100
    ).then((data) => {
      setRegistros(data);
      setLoading(false);
      const hayFuera = data.some((r) => getStatus(r) !== "correcto");
      onFueraDeRangoChange?.(hayFuera);
    });
  }, [currentBusiness, refreshKey]);

  async function handleDelete(id) {
    await base44.entities.RegistroTemperatura.delete(id);
    const updated = registros.filter((r) => r.id !== id);
    setRegistros(updated);
    const hayFuera = updated.some((r) => getStatus(r) !== "correcto");
    onFueraDeRangoChange?.(hayFuera);
  }

  const filtrados = useMemo(() => aplicarFiltros(registros, filtros), [registros, filtros]);
  const hayFiltrosActivos = JSON.stringify(filtros) !== JSON.stringify(EMPTY_FILTERS);

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (registros.length === 0) return null;

  const visibles = verTodos ? filtrados : filtrados.slice(0, LIMITE);
  const hayMas = filtrados.length > LIMITE;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between bg-secondary border-b border-border/40">
          <p className="font-semibold text-[#0A3E47]">
            Registros de temperatura
            {hayFiltrosActivos && (
              <span className="ml-2 text-xs font-normal text-[#6BB68A]">({filtrados.length} resultados)</span>
            )}
          </p>
          <button
            onClick={() => setMostrarFiltros((v) => !v)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors
              ${mostrarFiltros || hayFiltrosActivos
                ? "bg-[#6BB68A] border-[#6BB68A] text-white"
                : "bg-white border-border text-muted-foreground hover:text-foreground"
              }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Panel de filtros — justo debajo del header */}
        {mostrarFiltros && (
          <FiltrosPanel
            registros={registros}
            filtros={filtros}
            setFiltros={(f) => { setFiltros(f); setVerTodos(false); }}
            onClose={() => setMostrarFiltros(false)}
          />
        )}

        {/* Cards */}
        <div className="p-4 space-y-3">
          {visibles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No hay registros con los filtros aplicados.</p>
          )}
          {visibles.map((r) => {
            const status = getStatus(r);
            const styles = STATUS_STYLES[status];
            return (
              <div key={r.id} className={`${styles.card} rounded-xl border px-5 py-4 relative`}>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="absolute top-4 right-4 text-destructive/60 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 mb-1 pr-8">
                  <span className="font-bold text-foreground">{r.equipo_nombre}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}>{status}</span>
                </div>
                <p className={`text-2xl font-bold ${styles.temp} mb-1`}>{r.temperatura}°C</p>
                {r.temp_min !== undefined && (
                  <p className="text-sm font-medium text-foreground mb-2">
                    Rango permitido: {r.temp_min}°C – {r.temp_max}°C
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {r.fecha ? format(new Date(r.fecha), "d MMM yyyy HH:mm", { locale: es }) : "—"}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {r.created_by?.split("@")[0] || "—"}
                  </span>
                </div>
                {r.observaciones && (
                  <p className="text-xs text-muted-foreground mt-1 italic">{r.observaciones}</p>
                )}
              </div>
            );
          })}

          {hayMas && !verTodos && (
            <button
              onClick={() => setVerTodos(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border bg-secondary text-sm font-medium text-[#0A3E47] hover:bg-secondary/70 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
              Ver más ({filtrados.length - LIMITE} restantes)
            </button>
          )}
        </div>
      </div>

    </div>
  );
}