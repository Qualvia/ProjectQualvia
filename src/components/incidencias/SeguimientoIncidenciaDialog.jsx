import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

export default function SeguimientoIncidenciaDialog({ incidencia, open, onOpenChange, onUpdated }) {
  const [form, setForm] = useState({
    seguimiento_fecha: format(new Date(), "yyyy-MM-dd"),
    seguimiento_responsable: "",
    seguimiento_plan: "",
    seguimiento_observaciones: "",
  });
  const [saving, setSaving] = useState(false);

  function set(field, val) { setForm((prev) => ({ ...prev, [field]: val })); }

  async function handleGuardar() {
    if (!form.seguimiento_plan.trim()) return;
    setSaving(true);
    await base44.entities.Incidencia.update(incidencia.id, {
      estado: "seguimiento",
      ...form,
    });
    setSaving(false);
    onOpenChange(false);
    onUpdated();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#0A3E47]">Poner en Seguimiento</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-foreground mb-4">
          <span className="font-semibold">Incidencia:</span> {incidencia?.descripcion}
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Fecha de seguimiento *</label>
              <input type="date" value={form.seguimiento_fecha} onChange={(e) => set("seguimiento_fecha", e.target.value)}
                className="w-full h-9 rounded-lg border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Responsable del seguimiento</label>
              <input type="text" placeholder="" value={form.seguimiento_responsable}
                onChange={(e) => set("seguimiento_responsable", e.target.value)}
                className="w-full h-9 rounded-lg border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Plan de acción *</label>
            <textarea placeholder="Describe el plan de acción para hacer seguimiento de esta incidencia..." value={form.seguimiento_plan}
              onChange={(e) => set("seguimiento_plan", e.target.value)} rows={4}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
            <p className="text-xs text-muted-foreground mt-1">Especifica las acciones a realizar y cómo se monitoreará la incidencia</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Observaciones adicionales</label>
            <textarea placeholder="Otras observaciones sobre el seguimiento..." value={form.seguimiento_observaciones}
              onChange={(e) => set("seguimiento_observaciones", e.target.value)} rows={3}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => onOpenChange(false)}
            className="flex-1 py-2.5 rounded-xl border border-border bg-white text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={saving || !form.seguimiento_plan.trim()}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Poner en seguimiento
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}