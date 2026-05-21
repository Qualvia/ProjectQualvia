import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function NuevoRegistroFormacion({ onCancel, onSaved }) {
  const { currentBusiness, user } = useBusiness();
  const { nombreRegistrador } = useUsuarioInterno();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tema: "",
    fecha_formacion: format(new Date(), "yyyy-MM-dd"),
    duracion_horas: "",
    formador: "",
    contenido: "",
    empleados_asistentes: "",
    evidencia_url: "",
    observaciones: "",
  });

  function setField(field, val) { setForm((prev) => ({ ...prev, [field]: val })); }

  async function handleSave() {
    if (!form.tema?.trim() || !form.fecha_formacion) return;
    setSaving(true);
    await base44.entities.RegistroFormacion.create({
      ...form,
      duracion_horas: form.duracion_horas ? Number(form.duracion_horas) : undefined,
      user_id: user.id,
      business_id: currentBusiness.id,
      registrado_por: nombreRegistrador || user.full_name || user.email,
      fecha: new Date().toISOString(),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="bg-secondary rounded-2xl p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">Tema de la formación *</Label>
          <Input
            placeholder="Ej: Manipulación de alimentos..."
            value={form.tema}
            onChange={(e) => setField("tema", e.target.value)}
            className="bg-white"
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Fecha de formación *</Label>
          <Input
            type="date"
            value={form.fecha_formacion}
            onChange={(e) => setField("fecha_formacion", e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">Duración (horas)</Label>
          <Input
            type="number"
            placeholder="Ej: 2"
            value={form.duracion_horas}
            onChange={(e) => setField("duracion_horas", e.target.value)}
            className="bg-white"
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Formador</Label>
          <Input
            placeholder="Nombre del formador"
            value={form.formador}
            onChange={(e) => setField("formador", e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block">Contenido</Label>
        <Textarea
          placeholder="Resumen del contenido de la formación..."
          value={form.contenido}
          onChange={(e) => setField("contenido", e.target.value)}
          className="bg-white resize-none h-24"
        />
      </div>

      <div>
        <Label className="mb-1.5 block">Empleados asistentes (separar por comas)</Label>
        <Input
          placeholder="Ej: Juan Pérez, María García"
          value={form.empleados_asistentes}
          onChange={(e) => setField("empleados_asistentes", e.target.value)}
          className="bg-white"
        />
      </div>

      <div>
        <Label className="mb-1.5 block">URL de Evidencia</Label>
        <Input
          placeholder="Enlace a documentos, fotos, etc."
          value={form.evidencia_url}
          onChange={(e) => setField("evidencia_url", e.target.value)}
          className="bg-white"
        />
      </div>

      <div>
        <Label className="mb-1.5 block">Observaciones</Label>
        <Textarea
          placeholder="Notas adicionales o comentarios..."
          value={form.observaciones}
          onChange={(e) => setField("observaciones", e.target.value)}
          className="bg-white resize-none h-20"
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="bg-white">Cancelar</Button>
        <Button
          onClick={handleSave}
          disabled={saving || !form.tema?.trim() || !form.fecha_formacion}
          className="bg-[#6BB68A] hover:bg-[#5aa377] text-white"
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Guardar registro
        </Button>
      </div>
    </div>
  );
}