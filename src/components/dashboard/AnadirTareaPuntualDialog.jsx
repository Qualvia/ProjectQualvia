import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarPlus } from "lucide-react";

const TIPOS_REGISTRO = [
  "Temperatura", "Limpieza", "Recepción", "Agua", "Plagas",
  "Mantenimiento", "Formación", "Alérgenos", "Lotes", "Congelación", "Residuos", "Otro"
];

const PRIORIDADES = ["Baja", "Media", "Alta", "Crítica"];

export default function AnadirTareaPuntualDialog({ open, onClose, onCrear }) {
  const [form, setForm] = useState({
    tipo: "Temperatura",
    titulo: "",
    descripcion: "",
    prioridad: "Media",
    hora: "",
  });

  function handleCrear() {
    if (!form.titulo.trim()) return;
    onCrear && onCrear(form);
    onClose();
    setForm({ tipo: "Temperatura", titulo: "", descripcion: "", prioridad: "Media", hora: "" });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#0A3E47] text-xl">
            <CalendarPlus className="w-5 h-5" />
            Añadir tarea puntual de hoy
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Tipo de registro */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Tipo de registro <span className="text-red-500">*</span></label>
            <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_REGISTRO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Título de la tarea <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ej: Revisar temperatura del obrador"
              className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#0A3E47]"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Detalles adicionales sobre la tarea..."
              rows={3}
              className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#0A3E47] resize-none"
            />
          </div>

          {/* Prioridad + Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Prioridad</label>
              <Select value={form.prioridad} onValueChange={(v) => setForm({ ...form, prioridad: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Hora (opcional)</label>
              <input
                type="time"
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                className="w-full h-9 border border-input rounded-lg px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#0A3E47]"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleCrear}
              disabled={!form.titulo.trim()}
              className="px-5 py-2 rounded-lg bg-[#6BB68A] text-white text-sm font-medium hover:bg-[#5aa377] transition-colors disabled:opacity-50">
              Añadir tarea
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}