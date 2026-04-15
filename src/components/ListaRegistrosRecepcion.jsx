import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Loader2, Trash2, Filter, CalendarDays, User, ChevronDown, Printer } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const EMPTY_FILTERS = { resultado: "todos" };
const LIMITE = 5;

export default function ListaRegistrosRecepcion({ refreshKey }) {
  const { currentBusiness } = useBusiness();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verTodos, setVerTodos] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState(EMPTY_FILTERS);

  useEffect(() => {
    if (!currentBusiness) return;
    setLoading(true);
    base44.entities.RegistroRecepcion.filter(
      { business_id: currentBusiness.id }, "-fecha", 200
    )
      .then((data) => {
        setRegistros(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando registros de recepción:", err);
        setRegistros([]);
        setLoading(false);
      });
  }, [currentBusiness, refreshKey]);

  async function handleDelete(id) {
    await base44.entities.RegistroRecepcion.delete(id);
    setRegistros((prev) => prev.filter((r) => r.id !== id));
  }

  const filtrados = useMemo(() => {
    return registros.filter((r) => {
      if (filtros.resultado !== "todos" && r.resultado !== filtros.resultado) return false;
      return true;
    });
  }, [registros, filtros]);

  const hayFiltrosActivos = JSON.stringify(filtros) !== JSON.stringify(EMPTY_FILTERS);

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (registros.length === 0) return null;

  const visibles = verTodos ? filtrados : filtrados.slice(0, LIMITE);
  const hayMas = filtrados.length > LIMITE;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between bg-secondary border-b border-border/40">
        <p className="font-semibold text-[#0A3E47]">
          Recepciones registradas
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

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="bg-secondary p-5 border-b border-border/40 flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Resultado</label>
            <select
              value={filtros.resultado}
              onChange={(e) => { setFiltros({ resultado: e.target.value }); setVerTodos(false); }}
              className="h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="todos">Todos</option>
              <option value="aceptado">Aceptado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
          <button
            onClick={() => { setFiltros(EMPTY_FILTERS); setMostrarFiltros(false); }}
            className="h-9 px-4 rounded-lg border border-border bg-white text-sm text-foreground hover:bg-secondary transition-colors"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* Cards */}
      <div className="p-4 space-y-3">
        {visibles.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No hay registros con los filtros aplicados.</p>
        )}
        {visibles.map((r) => (
          <div key={r.id} className={`rounded-xl border px-5 py-4 ${r.resultado === "rechazado" ? "bg-red-50 border-red-200" : "bg-white border-border"}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-foreground text-base">{r.producto}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${r.resultado === "aceptado" ? "bg-[#e6f5ed] text-[#2d8a5e]" : "bg-red-50 text-red-500"}`}>
                    {r.resultado}
                  </span>
                </div>

                {r.proveedor && (
                  <p className="text-sm text-foreground mb-0.5">
                    <span className="font-semibold">Proveedor: </span>
                    <span className="text-[#6BB68A]">{r.proveedor}</span>
                  </p>
                )}
                {r.lote && (
                  <p className="text-sm text-foreground mb-0.5">
                    <span className="font-semibold">Lote: </span>{r.lote}
                  </p>
                )}
                {r.fecha_caducidad && (
                  <p className="text-sm text-foreground mb-0.5">
                    <span className="font-semibold">Caducidad: </span>
                    {format(new Date(r.fecha_caducidad), "d MMM yyyy", { locale: es })}
                  </p>
                )}
                {r.temperatura !== undefined && r.temperatura !== null && (
                  <p className="text-sm text-foreground mb-0.5">
                    <span className="font-semibold">Temperatura: </span>{r.temperatura}°C
                  </p>
                )}
                {r.estado_envase && (
                  <p className="text-sm text-foreground mb-0.5">
                    <span className="font-semibold">Envase: </span>{r.estado_envase}
                  </p>
                )}

                {r.alergenos?.length > 0 && (
                  <div className="mb-1 mt-1">
                    <p className="text-sm font-semibold text-foreground">Alérgenos:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {r.alergenos.map((a) => (
                        <span key={a} className="text-xs px-2 py-0.5 rounded-full border border-yellow-400 bg-yellow-50 text-yellow-700 font-medium">
                          ⚠ {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {r.observaciones && (
                  <p className="text-xs text-muted-foreground italic mt-1">{r.observaciones}</p>
                )}

                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {r.fecha ? format(new Date(r.fecha), "d MMM yyyy", { locale: es }) : "—"}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {r.created_by?.split("@")[0] || "—"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 ml-3 shrink-0">
                {r.documento_url && (
                  <a href={r.documento_url} target="_blank" rel="noreferrer"
                    className="text-[#6BB68A] hover:opacity-70 transition-opacity">
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
  );
}