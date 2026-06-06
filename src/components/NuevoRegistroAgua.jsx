import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { marcarTareaCompletada } from "@/utils/marcarTareaCompletada";
import { registrarActividad } from "@/utils/registrarActividad";

export default function NuevoRegistroAgua({ onCancel, onSaved }) {
  const { currentBusiness, user } = useBusiness();
  const { nombreRegistrador } = useUsuarioInterno();
  const [puntos, setPuntos] = useState([]);
  const [loadingPuntos, setLoadingPuntos] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    punto_id: "",
    punto_nombre: "",
    cloro_nivel: "",
    cloro_min: 0.2,
    cloro_max: 1,
    ph_nivel: "",
    ph_min: 6.5,
    ph_max: 9.5,
    propiedades_organolepticas: true,
    observaciones: "",
  });

  useEffect(() => {
    if (!currentBusiness) { setLoadingPuntos(false); return; }
    base44.entities.PuntoAgua.filter({ business_id: currentBusiness.id })
      .then((data) => { setPuntos(data); setLoadingPuntos(false); })
      .catch(() => { setPuntos([]); setLoadingPuntos(false); });
  }, [currentBusiness]);

  function setField(field, val) { setForm((prev) => ({ ...prev, [field]: val })); }

  function handlePunto(id) {
    const p = puntos.find((p) => p.id === id);
    setForm((prev) => ({ ...prev, punto_id: id, punto_nombre: p?.nombre || "" }));
  }

  async function handleSave() {
    if (!form.punto_id) return;
    setSaving(true);
    await base44.entities.RegistroAgua.create({
      ...form,
      cloro_nivel: form.cloro_nivel !== "" ? Number(form.cloro_nivel) : null,
      cloro_min: Number(form.cloro_min),
      cloro_max: Number(form.cloro_max),
      ph_nivel: form.ph_nivel !== "" ? Number(form.ph_nivel) : null,
      ph_min: Number(form.ph_min),
      ph_max: Number(form.ph_max),
      user_id: user.id,
      business_id: currentBusiness.id,
      registrado_por: nombreRegistrador || user.full_name || user.email,
      fecha: new Date().toISOString(),
    });
    await marcarTareaCompletada("Agua", user.id, currentBusiness.id);
    registrarActividad({
      user_id: user.id,
      business_id: currentBusiness.id,
      tipo: "agua",
      quien: nombreRegistrador || user.full_name || user.email,
      accion: `análisis de agua · ${form.punto_nombre}`,
      detalle: form.cloro_nivel !== "" ? `Cloro: ${form.cloro_nivel} ppm · pH: ${form.ph_nivel || "—"}` : null,
    });
    setSaving(false);
    onSaved();
  }

  if (loadingPuntos) return (
    <div className="bg-secondary rounded-2xl p-6 flex justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  );

  if (puntos.length === 0) return (
    <div className="bg-secondary rounded-2xl p-6 text-center text-sm text-muted-foreground">
      No hay puntos de agua configurados. Usa "Gestionar equipos/zonas" para añadirlos.
    </div>
  );

  return (
    <div className="bg-secondary rounded-2xl p-6 space-y-5">
      {/* Punto de toma */}
      <div>
        <Label className="mb-1.5 block font-semibold">Punto de toma *</Label>
        <Select value={form.punto_id} onValueChange={handlePunto}>
          <SelectTrigger className="bg-white h-12 text-base">
            <SelectValue placeholder="Selecciona un punto de agua..." />
          </SelectTrigger>
          <SelectContent>
            {puntos.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Control de Cloro */}
      <div>
        <p className="font-semibold text-foreground mb-3">Control de Cloro</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="mb-1.5 block text-sm">Nivel (ppm) *</Label>
            <Input type="number" step="0.1" placeholder="Ej: 0.5" value={form.cloro_nivel}
              onChange={(e) => setField("cloro_nivel", e.target.value)} className="bg-white" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Rango mín (ppm)</Label>
            <Input type="number" step="0.1" value={form.cloro_min}
              onChange={(e) => setField("cloro_min", e.target.value)} className="bg-white" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Rango máx (ppm)</Label>
            <Input type="number" step="0.1" value={form.cloro_max}
              onChange={(e) => setField("cloro_max", e.target.value)} className="bg-white" />
          </div>
        </div>
      </div>

      {/* Control de pH */}
      <div>
        <p className="font-semibold text-foreground mb-3">Control de pH</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="mb-1.5 block text-sm">Nivel pH</Label>
            <Input type="number" step="0.1" placeholder="Ej: 7.0" value={form.ph_nivel}
              onChange={(e) => setField("ph_nivel", e.target.value)} className="bg-white" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Rango mín pH</Label>
            <Input type="number" step="0.1" value={form.ph_min}
              onChange={(e) => setField("ph_min", e.target.value)} className="bg-white" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Rango máx pH</Label>
            <Input type="number" step="0.1" value={form.ph_max}
              onChange={(e) => setField("ph_max", e.target.value)} className="bg-white" />
          </div>
        </div>
      </div>

      {/* Propiedades organolépticas */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.propiedades_organolepticas}
          onChange={(e) => setField("propiedades_organolepticas", e.target.checked)}
          className="w-4 h-4 accent-[#6BB68A]"
        />
        <span className="text-sm font-medium">Propiedades organolépticas correctas (olor, sabor, color)</span>
      </label>

      {/* Observaciones */}
      <div>
        <Label className="mb-1.5 block">Observaciones</Label>
        <Textarea
          placeholder="Observaciones adicionales..."
          value={form.observaciones}
          onChange={(e) => setField("observaciones", e.target.value)}
          className="bg-white resize-none h-20"
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="bg-white">Cancelar</Button>
        <Button onClick={handleSave} disabled={saving || !form.punto_id} className="bg-[#6BB68A] hover:bg-[#5aa377] text-white">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Guardar registro
        </Button>
      </div>
    </div>
  );
}