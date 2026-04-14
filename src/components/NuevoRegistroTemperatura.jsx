import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function NuevoRegistroTemperatura({ onCancel, onSaved }) {
  const { currentBusiness } = useBusiness();
  const [equipos, setEquipos] = useState([]);
  const [values, setValues] = useState({}); // { equipo_id: { temperatura, observaciones } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentBusiness) return;
    base44.entities.EquipoTemperatura.filter({ business_id: currentBusiness.id }).then((data) => {
      setEquipos(data);
      const init = {};
      data.forEach((e) => { init[e.id] = { temperatura: "", observaciones: "" }; });
      setValues(init);
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
    await Promise.all(
      filled.map((e) =>
        base44.entities.RegistroTemperatura.create({
          business_id: currentBusiness.id,
          equipo_id: e.id,
          equipo_nombre: e.nombre,
          temperatura: Number(values[e.id].temperatura),
          observaciones: values[e.id].observaciones,
          fecha: new Date().toISOString(),
        })
      )
    );
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

  if (equipos.length === 0) {
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