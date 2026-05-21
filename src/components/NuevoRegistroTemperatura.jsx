import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function NuevoRegistroTemperatura({ onCancel, onSaved }) {
  const { currentBusiness, user } = useBusiness();
  const { nombreRegistrador } = useUsuarioInterno();
  const [equipos, setEquipos] = useState([]);
  const [values, setValues] = useState({}); // { equipo_id: { temperatura, observaciones } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentBusiness) {
      setLoading(false);
      return;
    }
    base44.entities.EquipoTemperatura.filter({ business_id: currentBusiness.id })
      .then((data) => {
        setEquipos(data);
        const init = {};
        data.forEach((e) => { init[e.id] = { temperatura: "", observaciones: "" }; });
        setValues(init);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando equipos:", err);
        setEquipos([]);
        setValues({});
        setLoading(false);
      });
  }, [currentBusiness]);

  function setField(equipoId, field, val) {
    setValues((prev) => ({ ...prev, [equipoId]: { ...prev[equipoId], [field]: val } }));
  }

  async function handleSave() {
    const filled = equipos.filter((e) => values[e.id]?.temperatura !== "");
    if (filled.length === 0) return;
    setSaving(true);
    const registrosCreados = await Promise.all(
      filled.map((e) =>
        base44.entities.RegistroTemperatura.create({
          user_id: user.id,
          business_id: currentBusiness.id,
          equipo_id: e.id,
          equipo_nombre: e.nombre,
          temperatura: Number(values[e.id].temperatura),
          observaciones: values[e.id].observaciones,
          temp_min: e.temp_min,
          temp_max: e.temp_max,
          registrado_por: nombreRegistrador || user.full_name || user.email,
          fecha: new Date().toISOString(),
        })
      )
    );
    // Generar incidencias automáticas para registros fuera de rango
    const fueraDeRango = registrosCreados.filter((r) => {
      if (r.temp_min === undefined || r.temp_max === undefined) return false;
      return r.temperatura < r.temp_min || r.temperatura > r.temp_max;
    });
    for (const r of fueraDeRango) {
      const existentes = await base44.entities.Incidencia.filter({ business_id: currentBusiness.id }, "-numero", 1, 0);
      const nextNumero = existentes.length > 0 ? (existentes[0].numero || 0) + 1 : 1;
      const desviacion = Math.max(r.temp_min - r.temperatura, r.temperatura - r.temp_max);
      await base44.entities.Incidencia.create({
        user_id: user.id,
        business_id: currentBusiness.id,
        numero: nextNumero,
        tipo: "Temperatura",
        modulo_origen: "Control de Temperatura",
        prioridad: desviacion > 3 ? "critica" : "alta",
        descripcion: `Temperatura fuera de rango en ${r.equipo_nombre}: ${r.temperatura}°C (Permitido: ${r.temp_min}°C-${r.temp_max}°C)`,
        causa: "Desviación crítica de temperatura",
        estado: "abierta",
        origen_automatico: true,
        fecha: new Date().toISOString(),
      });
    }
    setSaving(false);
    onSaved();
  }

  if (loading) {
    return (
      <div className="bg-secondary rounded-2xl p-6 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!loading && equipos.length === 0) {
    return (
      <div className="bg-secondary rounded-2xl p-6 text-center text-sm text-muted-foreground">
        No hay equipos configurados. Usa "Gestionar equipos/zonas" para añadirlos.
      </div>
    );
  }



  return (
    <div className="bg-secondary rounded-2xl p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipos.map((equipo) => (
          <div key={equipo.id} className="bg-white rounded-xl border border-border p-4 space-y-3">
            <div>
              <p className="font-semibold text-sm text-foreground">{equipo.nombre}</p>
              <p className="text-xs text-[#6BB68A] font-medium">
                Rango: {equipo.temp_min}°C – {equipo.temp_max}°C
              </p>
            </div>
            <Input
              type="number"
              placeholder="Temp. (°C)"
              value={values[equipo.id]?.temperatura ?? ""}
              onChange={(e) => setField(equipo.id, "temperatura", e.target.value)}
              className="bg-white"
            />
            <Textarea
              placeholder="Observaciones..."
              value={values[equipo.id]?.observaciones ?? ""}
              onChange={(e) => setField(equipo.id, "observaciones", e.target.value)}
              className="bg-white resize-none h-20 text-sm"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="bg-white">Cancelar</Button>
        <Button onClick={handleSave} disabled={saving} className="bg-[#6BB68A] hover:bg-[#5aa377] text-white">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Guardar registros
        </Button>
      </div>
    </div>
  );
}