import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Loader2, Trash2, Filter, CalendarDays, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function getStatus(registro) {
  const { temperatura, temp_min, temp_max } = registro;
  if (temp_min === undefined || temp_max === undefined) return "correcto";
  const diff = Math.max(temp_min - temperatura, temperatura - temp_max);
  if (temperatura >= temp_min && temperatura <= temp_max) return "correcto";
  if (diff <= 3) return "aviso";
  return "critico";
}

const STATUS_STYLES = {
  correcto: { badge: "bg-[#e6f5ed] text-[#2d8a5e] font-medium", card: "bg-white", temp: "text-[#2d8a5e]" },
  aviso:    { badge: "bg-orange-50 text-orange-600 font-medium", card: "bg-orange-50/40", temp: "text-orange-500" },
  critico:  { badge: "bg-red-50 text-red-500 font-medium", card: "bg-red-50/40", temp: "text-red-500" },
};

export default function ListaRegistrosTemperatura({ refreshKey }) {
  const { currentBusiness } = useBusiness();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentBusiness) return;
    setLoading(true);
    base44.entities.RegistroTemperatura.filter(
      { business_id: currentBusiness.id }, "-fecha", 100
    ).then((data) => {
      setRegistros(data);
      setLoading(false);
    });
  }, [currentBusiness, refreshKey]);

  async function handleDelete(id) {
    await base44.entities.RegistroTemperatura.delete(id);
    setRegistros((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (registros.length === 0) return null;

  return (
    <div className="bg-secondary rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-border/40">
        <p className="font-semibold text-[#0A3E47]">Registros de temperatura</p>
        <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-border text-muted-foreground hover:text-foreground transition-colors">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Cards */}
      <div className="p-4 space-y-3">
        {registros.map((r) => {
          const status = getStatus(r);
          const styles = STATUS_STYLES[status];
          return (
            <div key={r.id} className={`${styles.card} rounded-xl border border-border px-5 py-4 relative`}>
              {/* Delete */}
              <button
                onClick={() => handleDelete(r.id)}
                className="absolute top-4 right-4 text-destructive/60 hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Name + badge */}
              <div className="flex items-center gap-2 mb-1 pr-8">
                <span className="font-bold text-foreground">{r.equipo_nombre}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}>{status}</span>
              </div>

              {/* Temperature */}
              <p className={`text-2xl font-bold ${styles.temp} mb-1`}>{r.temperatura}°C</p>

              {/* Range */}
              {r.temp_min !== undefined && (
                <p className="text-sm font-medium text-foreground mb-2">
                  Rango permitido: {r.temp_min}°C – {r.temp_max}°C
                </p>
              )}

              {/* Meta */}
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

              {/* Observaciones */}
              {r.observaciones && (
                <p className="text-xs text-muted-foreground mt-1 italic">{r.observaciones}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}