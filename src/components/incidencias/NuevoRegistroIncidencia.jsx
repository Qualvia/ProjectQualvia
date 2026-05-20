import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Loader2, Upload } from "lucide-react";
import { format } from "date-fns";

const TIPOS = ["Temperatura", "Limpieza", "Recepción", "Agua", "Plagas", "Mantenimiento", "Formación", "Alérgenos", "Lotes", "Congelación", "Residuos", "Otro"];
const PRIORIDADES = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

export default function NuevoRegistroIncidencia({ onCancel, onSaved, nextNumero, incidenciaExistente }) {
  const { currentBusiness, user } = useBusiness();
  const isEdit = !!incidenciaExistente;
  const [form, setForm] = useState({
    tipo: incidenciaExistente?.tipo || "Temperatura",
    modulo_origen: incidenciaExistente?.modulo_origen || "",
    prioridad: incidenciaExistente?.prioridad || "media",
    responsable: incidenciaExistente?.responsable || "",
    fecha_prevista_resolucion: incidenciaExistente?.fecha_prevista_resolucion || format(new Date(), "yyyy-MM-dd"),
    descripcion: incidenciaExistente?.descripcion || "",
    causa: incidenciaExistente?.causa || "",
    solucion_provisional: incidenciaExistente?.solucion_provisional || "",
  });
  const [evidenciaUrl, setEvidenciaUrl] = useState(incidenciaExistente?.evidencia_url || "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(field, value) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEvidenciaUrl(file_url);
    setUploading(false);
  }

  async function handleGuardar() {
    if (!form.descripcion.trim()) return;
    setLoading(true);
    if (isEdit) {
      await base44.entities.Incidencia.update(incidenciaExistente.id, {
        ...form,
        evidencia_url: evidenciaUrl || undefined,
      });
    } else {
      await base44.entities.Incidencia.create({
        ...form,
        numero: nextNumero,
        evidencia_url: evidenciaUrl || undefined,
        estado: "abierta",
        user_id: user.id,
        business_id: currentBusiness.id,
        fecha: new Date().toISOString(),
      });
    }
    setLoading(false);
    onSaved();
  }

  return (
    <div className="bg-secondary rounded-2xl p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Tipo de incidencia *</label>
          <select value={form.tipo} onChange={(e) => set("tipo", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Módulo origen</label>
          <input type="text" placeholder="Ej: Control de temperatura" value={form.modulo_origen}
            onChange={(e) => set("modulo_origen", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Prioridad *</label>
          <select value={form.prioridad} onChange={(e) => set("prioridad", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            {PRIORIDADES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Responsable asignado</label>
          <input type="text" placeholder="Nombre del responsable" value={form.responsable}
            onChange={(e) => set("responsable", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Fecha prevista de resolución</label>
          <input type="date" value={form.fecha_prevista_resolucion}
            onChange={(e) => set("fecha_prevista_resolucion", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Descripción del evento *</label>
        <textarea placeholder="Describe lo ocurrido..." value={form.descripcion}
          onChange={(e) => set("descripcion", e.target.value)} rows={3}
          className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Causa probable</label>
        <textarea placeholder="¿Cuál crees que es la causa?" value={form.causa}
          onChange={(e) => set("causa", e.target.value)} rows={2}
          className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Solución provisional</label>
        <textarea placeholder="Acción inmediata tomada..." value={form.solucion_provisional}
          onChange={(e) => set("solucion_provisional", e.target.value)} rows={2}
          className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Evidencia (foto/documento)</label>
        {evidenciaUrl ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white">
            <a href={evidenciaUrl} target="_blank" rel="noreferrer" className="text-sm text-[#6BB68A] underline flex-1 truncate">Ver archivo subido</a>
            <button onClick={() => setEvidenciaUrl("")} className="text-xs text-muted-foreground hover:text-destructive">Eliminar</button>
          </div>
        ) : (
          <label className="flex items-center gap-3 p-3 rounded-xl border border-input bg-white cursor-pointer hover:border-[#6BB68A] transition-colors text-sm text-muted-foreground">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Subiendo..." : "Seleccionar archivo"}
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-border bg-white text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
          Cancelar
        </button>
        <button type="button" disabled={loading || !form.descripcion.trim()} onClick={handleGuardar}
          className="px-5 py-2.5 rounded-xl bg-[#6BB68A] hover:bg-[#5aa377] text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? "Guardar cambios" : "Registrar incidencia"}
        </button>
      </div>
    </div>
  );
}