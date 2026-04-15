import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Loader2, Trash2, Filter, CalendarDays, User, ChevronDown } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

const ESTADO_STYLES = {
  satisfactorio: { badge: "bg-[#e6f5ed] text-[#2d8a5e]", card: "bg-white border-border", label: "satisfactorio" },
  no_limpiado:   { badge: "bg-red-50 text-red-500",        card: "bg-red-50 border-red-200",  label: "no limpiado" },
  no_aplica:     { badge: "bg-muted text-muted-foreground", card: "bg-white border-border",    label: "no aplica" },
};

const EMPTY_FILTERS = { periodo: "todos", desde: "", hasta: "", zona: "todos", estado: "todos", usuario: "todos" };
const LIMITE = 5;

function FiltrosPanel({ registros, filtros, setFiltros, onClose }) {
  const [local, setLocal] = useState(filtros);

  const zonas = useMemo(() => [...new Set(registros.map((r) => r.zona_nombre).filter(Boolean))], [registros]);
  const usuarios = useMemo(() => [...new Set(registros.map((r) => r.created_by?.split("@")[0]).filter(Boolean))], [registros]);

  function set(field, val) { setLocal((prev) => ({ ...prev, [field]: val })); }

  function handleAplicar() { setFiltros(local); onClose(); }
  function handleLimpiar() { setLocal(EMPTY_FILTERS); setFiltros(EMPTY_FILTERS); onClose(); }

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
          <button
            key={p.id}
            onClick={() => set("periodo", p.id)}
            className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors
              ${local.periodo === p.id
                ? "bg-[#6BB68A] border-[#6BB68A] text-white"
                : "bg-white border-border text-foreground hover:border-[#6BB68A]"}`}
          >
            {p.label}
          </button>
        ))}
      </div>

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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Zona</label>
          <select
            value={local.zona}
            onChange={(e) => set("zona", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="todos">Todas las zonas</option>
            {zonas.map((z) => <option key={z} value={z}>{z}</option>)}
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
            <option value="satisfactorio">Satisfactorio</option>
            <option value="no_limpiado">No limpiado</option>
            <option value="no_aplica">No aplica</option>
          </select>
        </div>
      </div>

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
    if (filtros.periodo !== "todos" && filtros.periodo !== "personalizado") {
      const fecha = new Date(r.fecha);
      const now = new Date();
      if (filtros.periodo === "hoy" && (fecha < startOfDay(now) || fecha > endOfDay(now))) return false;
      if (filtros.periodo === "semana" && (fecha < startOfWeek(now, { weekStartsOn: 1 }) || fecha > endOfWeek(now, { weekStartsOn: 1 }))) return false;
      if (filtros.periodo === "mes" && (fecha < startOfMonth(now) || fecha > endOfMonth(now))) return false;
    }
    if (filtros.desde && new Date(r.fecha) < startOfDay(new Date(filtros.desde))) return false;
    if (filtros.hasta && new Date(r.fecha) > endOfDay(new Date(filtros.hasta))) return false;
    if (filtros.zona !== "todos" && r.zona_nombre !== filtros.zona) return false;
    if (filtros.estado !== "todos" && r.estado !== filtros.estado) return false;
    if (filtros.usuario !== "todos" && r.created_by?.split("@")[0] !== filtros.usuario) return false;
    return true;
  });
}

export default function ListaRegistrosLimpieza({ refreshKey }) {
  const { currentBusiness } = useBusiness();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verTodos, setVerTodos] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState(EMPTY_FILTERS);

  useEffect(() => {
    if (!currentBusiness) return;
    setLoading(true);
    base44.entities.RegistroLimpieza.filter(
      { business_id: currentBusiness.id }, "-fecha", 200
    )
      .then((data) => {
        setRegistros(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando registros de limpieza:", err);
        setRegistros([]);
        setLoading(false);
      });
  }, [currentBusiness, refreshKey]);

  async function handleDelete(id) {
    await base44.entities.RegistroLimpieza.delete(id);
    setRegistros((prev) => prev.filter((r) => r.id !== id));
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
        <div className="px-5 py-4 flex items-center justify-between bg-secondary border-b border-border/40">
          <p className="font-semibold text-[#0A3E47]">
            Registros de limpieza
            {hayFiltrosActivos && (
              <span className="ml-2 text-xs font-normal text-[#6BB68A]">({filtrados.length} resultados)</span>
            )}
          </p>
          <button
            onClick={() => setMostrarFiltros((v) => !v)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors
              ${mostrarFiltros || hayFiltrosActivos
                ? "bg-[#6BB68A] border-[#6BB68A] text-white"
                : "bg-white border-border text-muted-foreground hover:text-foreground"}`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {mostrarFiltros && (
          <FiltrosPanel
            registros={registros}
            filtros={filtros}
            setFiltros={(f) => { setFiltros(f); setVerTodos(false); }}
            onClose={() => setMostrarFiltros(false)}
          />
        )}

        <div className="p-4 space-y-3">
          {visibles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No hay registros con los filtros aplicados.</p>
          )}
          {visibles.map((r) => {
            const styles = ESTADO_STYLES[r.estado] || ESTADO_STYLES.satisfactorio;
            return (
              <div key={r.id} className={`${styles.card} rounded-xl border px-5 py-4 relative`}>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="absolute top-4 right-4 text-destructive/60 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-1 pr-8">
                  <span className="font-bold text-foreground">{r.zona_nombre}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
                    {styles.label}
                  </span>
                </div>

                {r.productos_usados?.length > 0 && (
                  <p className="text-sm text-foreground mb-2">
                    <span className="font-semibold">Producto utilizado: </span>
                    <span className="text-[#6BB68A]">{r.productos_usados.join(", ")}</span>
                  </p>
                )}

                {r.motivo_no_limpiado && (
                  <p className="text-sm text-red-500 italic mb-1">Motivo: {r.motivo_no_limpiado}</p>
                )}

                {r.comentario && (
                  <p className="text-xs text-muted-foreground italic mb-1">{r.comentario}</p>
                )}

                {r.foto_url && (
                  <img src={r.foto_url} alt="foto zona" className="h-20 rounded-lg object-cover border border-border mt-1 mb-2" />
                )}

                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
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