import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const TIPOS_ELEMENTO = ["Trampa", "Lámpara UV", "Cebo", "Otro"];
const ESTADOS = [
  { value: "correcto", label: "Correcto" },
  { value: "incidencia", label: "Incidencia" },
  { value: "requiere_revision", label: "Requiere revisión" },
];

export default function NuevoRegistroPlaga({ onCancel, onSaved }) {
  const { currentBusiness, user } = useBusiness();
  const [puntos, setPuntos] = useState([]);
  const [loadingPuntos, setLoadingPuntos] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    punto_id: "",
    punto_nombre: "",
    tipo_elemento: "Trampa",
    ubicacion: "",
    estado: "correcto",
    evidencia_plaga: false,
    observaciones: "",
  });

  useEffect(() => {
    if (!currentBusiness) { setLoadingPuntos(false); return; }
    base44.entities.PuntoPlaga.filter({ business_id: currentBusiness.id })
      .then((data) => { setPuntos(data); setLoadingPuntos(false); })
      .catch(() => { setPuntos([]); setLoadingPuntos(false); });
  }, [currentBusiness]);

  function setField(field, val) { setForm((prev) => ({ ...prev, [field]: val })); }

  function handlePunto(id) {
    const p = puntos.find((p) => p.id === id);
    setForm((prev) => ({
      ...prev,
      punto_id: id,
      punto_nombre: p?.nombre || "",
      tipo_elemento: p?.tipo_elemento || "Trampa",
      ubicacion: p?.ubicacion || "",
    }));
  }

  async function handleSave() {
    if (!form.punto_id || !form.ubicacion?.trim()) return;
    setSaving(true);
    await base44.entities.RegistroPlaga.create({
      ...form,
      user_id: user.id,
      business_id: currentBusiness.id,
      fecha: new Date().toISOString(),
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
      No hay puntos de plagas configurados. Usa "Gestionar equipos/zonas" para añadirlos.
    </div>
  );

  return (
    <div className="bg-secondary rounded-2xl p-6 space-y-5">
      {/* Punto predefinido */}
      <div>
        <Label className="mb-1.5 block font-semibold">Seleccionar punto predefinido</Label>
        <Select value={form.punto_id} onValueChange={handlePunto}>
          <SelectTrigger className="bg-white h-12 text-base">
            <SelectValue placeholder="Selecciona un punto..." />
          </SelectTrigger>
          <SelectContent>
            {puntos.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tipo y Ubicación */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">Tipo de elemento *</Label>
          <Select value={form.tipo_elemento} onValueChange={(v) => setField("tipo_elemento", v)}>
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_ELEMENTO.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Ubicación *</Label>
          <Input
            placeholder="Ej: Entrada almacén, Cocina..."
            value={form.ubicacion}
            onChange={(e) => setField("ubicacion", e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      {/* Estado y Evidencia */}
      <div className="flex items-center gap-6">
        <div className="flex-1">
          <Label className="mb-1.5 block">Estado</Label>
          <Select value={form.estado} onValueChange={(v) => setField("estado", v)}>
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS.map((e) => (
                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-5">
          <input
            type="checkbox"
            checked={form.evidencia_plaga}
            onChange={(e) => setField("evidencia_plaga", e.target.checked)}
            className="w-4 h-4 accent-[#6BB68A]"
          />
          <span className="text-sm font-medium">Evidencia de plaga detectada</span>
        </label>
      </div>

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
        <Button
          onClick={handleSave}
          disabled={saving || !form.punto_id || !form.ubicacion?.trim()}
          className="bg-[#6BB68A] hover:bg-[#5aa377] text-white"
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Guardar registro
        </Button>
      </div>
    </div>
  );
}