import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Loader2, Thermometer } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ListaRegistrosTemperatura() {
  const { currentBusiness } = useBusiness();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentBusiness) return;
    base44.entities.RegistroTemperatura.filter({ business_id: currentBusiness.id }, "-fecha", 50).then((data) => {
      setRegistros(data);
      setLoading(false);
    });
  }, [currentBusiness]);

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (registros.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[#0A3E47]">Registros guardados ({registros.length})</p>
      <div className="space-y-2">
        {registros.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Thermometer className="w-4 h-4 text-[#6BB68A] shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{r.equipo_nombre}</p>
                {r.observaciones && <p className="text-xs text-muted-foreground">{r.observaciones}</p>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-[#0A3E47]">{r.temperatura}°C</p>
              <p className="text-xs text-muted-foreground">
                {r.fecha ? format(new Date(r.fecha), "d MMM, HH:mm", { locale: es }) : "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}