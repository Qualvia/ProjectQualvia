import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Loader2 } from "lucide-react";
import { format } from "date-fns";

const TIPOS = ["Preventivo", "Correctivo", "Revisión"];
const ESTADOS = ["Operativo", "No operativo", "Pendiente revisión"];

export default function NuevoRegistroMantenimiento({ onCancel, onSaved }) {
  const { currentBusiness, user } = useBusiness();
  const [equipos, setEquipos] = useState([]);
  const [loadingEquipos, setLoadingEquipos] = useState(true);
  const [modoManual, setModoManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const [form, setForm] = useState({
    equipo_nombre: "",
    tipo_mantenimiento: "Preventivo",
    descripcion: "",
    estado_final: "Operativo",
    proxima_revision: format(new Date(), "yyyy-MM-dd"),
    foto_url: "",
    observaciones: "",
  });

  useEffect(() => {
    if (!currentBusiness) { setLoadingEquipos(false); return; }
    base44.entities.EquipoTemperatura.filter({ business_id: currentBusiness.id })
      .then((data) => { setEquipos(data); setLoadingEquipos(false); })
      .catch(() => { setEquipos([]); setLoadingEquipos(false); });
  }, [currentBusiness]);

  function setField(field, val) { setForm((prev) => ({ ...prev, [field]: val })); }

  async function handleFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setField("foto_url", file_url);
    setUploadingFoto(false);
  }

  async function handleSave() {
    if (!form.equipo_nombre?.trim() || !form.descripcion?.trim()) return;
    setSaving(true);
    await base44.entities.RegistroMantenimiento.create({
      ...form,
      user_id: user.id,
      business_id: currentBusiness.id,
      fecha: new Date().toISOString(),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="bg-secondary rounded-2xl p-6 space-y-5">
      {/* Equipo y Tipo */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">Equipo o instalación *</Label>
          {modoManual ? (
            <Input
              placeholder="Escribe el nombre del equipo..."
              value={form.equipo_nombre}
              onChange={(e) => setField("equipo_nombre", e.target.value)}
              className="bg-white"
            />
          ) : (
            <Select value={form.equipo_nombre} onValueChange={(v) => setField("equipo_nombre", v)} disabled={loadingEquipos}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecciona equipo" />
              </SelectTrigger>
              <SelectContent>
                {equipos.map((e) => (
                  <SelectItem key={e.id} value={e.nombre}>{e.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <button
            onClick={() => { setModoManual((v) => !v); setField("equipo_nombre", ""); }}
            className="text-xs text-[#6BB68A] hover:underline mt-1"
          >
            {modoManual ? "Seleccionar de la lista" : "Escribir manualmente"}
          </button>
        </div>
        <div>
          <Label className="mb-1.5 block">Tipo de mantenimiento *</Label>
          <Select value={form.tipo_mantenimiento} onValueChange={(v) => setField("tipo_mantenimiento", v)}>
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Descripción */}
      <div>
        <Label className="mb-1.5 block">Descripción del mantenimiento *</Label>
        <Textarea
          placeholder="Describe el trabajo realizado..."
          value={form.descripcion}
          onChange={(e) => setField("descripcion", e.target.value)}
          className="bg-white resize-none h-24"
        />
      </div>

      {/* Estado y Próxima revisión */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">Estado final</Label>
          <Select value={form.estado_final} onValueChange={(v) => setField("estado_final", v)}>
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Próxima revisión</Label>
          <Input
            type="date"
            value={form.proxima_revision}
            onChange={(e) => setField("proxima_revision", e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      {/* Foto evidencia */}
      <div>
        <Label className="mb-1.5 block">Foto evidencia</Label>
        {form.foto_url ? (
          <div className="flex items-center gap-3">
            <img src={form.foto_url} alt="evidencia" className="h-20 rounded-lg object-cover border border-border" />
            <button onClick={() => setField("foto_url", "")} className="text-xs text-muted-foreground hover:text-destructive">Eliminar</button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border border-dashed border-border bg-white text-sm text-muted-foreground cursor-pointer hover:border-[#6BB68A] transition-colors">
            {uploadingFoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            {uploadingFoto ? "Subiendo..." : "Tomar foto"}
            <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
          </label>
        )}
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
          disabled={saving || !form.equipo_nombre?.trim() || !form.descripcion?.trim()}
          className="bg-[#6BB68A] hover:bg-[#5aa377] text-white"
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Guardar registro
        </Button>
      </div>
    </div>
  );
}