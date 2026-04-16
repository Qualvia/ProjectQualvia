import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, Upload, Loader2, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";

export default function EmpresaMantenimientoDialog({ open, onOpenChange }) {
  const { currentBusiness, user } = useBusiness();
  const [form, setForm] = useState({ nombre_empresa: "", email: "", telefono: "", contacto: "", direccion: "", contrato_url: "" });
  const [existingId, setExistingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open || !currentBusiness) return;
    base44.entities.EmpresaMantenimiento.filter({ business_id: currentBusiness.id })
      .then((data) => {
        if (data.length > 0) { setForm(data[0]); setExistingId(data[0].id); }
        else { setForm({ nombre_empresa: "", email: "", telefono: "", contacto: "", direccion: "", contrato_url: "" }); setExistingId(null); }
      })
      .catch(() => {});
  }, [open, currentBusiness]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((prev) => ({ ...prev, contrato_url: file_url }));
    setUploading(false);
  }

  async function handleSave() {
    if (!form.nombre_empresa?.trim()) return;
    setSaving(true);
    const payload = { ...form, user_id: user.id, business_id: currentBusiness.id };
    if (existingId) await base44.entities.EmpresaMantenimiento.update(existingId, payload);
    else await base44.entities.EmpresaMantenimiento.create(payload);
    setSaving(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#0A3E47]">
            <Wrench className="w-5 h-5" />
            Empresa de mantenimiento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Label className="mb-1.5 block">Nombre de la empresa *</Label>
            <Input placeholder="Ej: Mantenimientos Industriales S.L." value={form.nombre_empresa}
              onChange={(e) => setForm({ ...form, nombre_empresa: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Email</Label>
              <Input placeholder="correo@empresa.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block">Teléfono</Label>
              <Input placeholder="600 000 000" value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Persona de contacto</Label>
            <Input placeholder="Nombre del contacto" value={form.contacto}
              onChange={(e) => setForm({ ...form, contacto: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5 block">Dirección</Label>
            <Input placeholder="Dirección de la empresa" value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5 block">Contrato</Label>
            {form.contrato_url ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary">
                <FileText className="w-4 h-4 text-[#6BB68A]" />
                <a href={form.contrato_url} target="_blank" rel="noreferrer" className="text-sm text-[#6BB68A] underline flex-1 truncate">Ver contrato subido</a>
                <button onClick={() => setForm((p) => ({ ...p, contrato_url: "" }))} className="text-xs text-muted-foreground hover:text-destructive">Eliminar</button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border border-dashed border-border bg-secondary text-sm text-muted-foreground cursor-pointer hover:border-[#6BB68A] transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Subiendo..." : "Subir contrato"}
                <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.jpg,.png" />
              </label>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !form.nombre_empresa?.trim()} className="bg-[#6BB68A] hover:bg-[#5aa377] text-white">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}