import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CerrarIncidenciaDialog({ incidencia, open, onOpenChange, onClosed }) {
  const [accion, setAccion] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCerrar() {
    if (!accion.trim()) return;
    setSaving(true);
    await base44.entities.Incidencia.update(incidencia.id, {
      estado: "cerrada",
      accion_correctiva: accion,
      fecha_cierre: new Date().toISOString(),
    });
    setSaving(false);
    onOpenChange(false);
    onClosed();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#0A3E47]">Cerrar Incidencia</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-foreground mb-4">
          <span className="font-semibold">Incidencia:</span> {incidencia?.descripcion}
        </p>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Acción correctiva *</label>
          <textarea
            value={accion}
            onChange={(e) => setAccion(e.target.value)}
            placeholder="Describe la solución definitiva aplicada para resolver esta incidencia..."
            rows={5}
            className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">Explica qué medida definitiva se ha tomado para resolver el problema</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => onOpenChange(false)}
            className="flex-1 py-2.5 rounded-xl border border-border bg-white text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
            Cancelar
          </button>
          <button onClick={handleCerrar} disabled={saving || !accion.trim()}
            className="flex-1 py-2.5 rounded-xl bg-[#6BB68A] hover:bg-[#5aa377] text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Cerrar incidencia
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}