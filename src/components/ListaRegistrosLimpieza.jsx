import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Loader2, Trash2, Filter, CalendarDays, User, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ESTADO_STYLES = {
  satisfactorio: { badge: "bg-[#e6f5ed] text-[#2d8a5e]", label: "satisfactorio" },
  no_limpiado:   { badge: "bg-red-50 text-red-500",       label: "no limpiado" },
  no_aplica:     { badge: "bg-muted text-muted-foreground", label: "no aplica" },
};

const LIMITE = 10;

export default function ListaRegistrosLimpieza({ refreshKey }) {
  const { currentBusiness } = useBusiness();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verTodos, setVerTodos] = useState(false);

  useEffect(() => {
    if (!currentBusiness) return;
    setLoading(true);
    base44.entities.RegistroLimpieza.filter(
      { business_id: currentBusiness.id }, "-fecha", 200
    ).then((data) => {
      setRegistros(data);
      setLoading(false);
    });
  }, [currentBusiness, refreshKey]);

  async function handleDelete(id) {
    await base44.entities.RegistroLimpieza.delete(id);
    setRegistros((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (registros.length === 0) return null;

  const visibles = verTodos ? registros : registros.slice(0, LIMITE);
  const hayMas = registros.length > LIMITE;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border">
      <div className="px-5 py-4 flex items-center justify-between bg-secondary border-b border-border/40">
        <p className="font-semibold text-[#0A3E47]">Registros de limpieza</p>
        <Filter className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="p-4 space-y-3">
        {visibles.map((r) => {
          const styles = ESTADO_STYLES[r.estado] || ESTADO_STYLES.satisfactorio;
          return (
            <div key={r.id} className="bg-white rounded-xl border border-border px-5 py-4 relative">
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
            Ver más ({registros.length - LIMITE} restantes)
          </button>
        )}
      </div>
    </div>
  );
}