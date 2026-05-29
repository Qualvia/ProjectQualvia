import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Info } from "lucide-react";

const TIPOS_REGISTRO = [
  "Temperatura", "Limpieza", "Recepción", "Agua", "Plagas",
  "Mantenimiento", "Formación", "Alérgenos", "Lotes", "Congelación", "Residuos", "Otro"
];

const PRIORIDADES = ["Baja", "Media", "Alta", "Crítica"];
const FRECUENCIAS = ["Diaria", "Semanal", "Mensual", "Trimestral", "Semestral", "Anual"];
const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function ProgramarTareaDialog({ open, onClose, onCrear, tareaInicial = null }) {
  const [form, setForm] = useState({
    tipo: "Temperatura",
    titulo: "",
    descripcion: "",
    prioridad: "Media",
    hora: "",
    frecuencia: "Diaria",
    diasSemana: [],
    diaMes: 1,
  });

  // Rellenar form si viene en modo edición
  React.useEffect(() => {
    if (tareaInicial) {
      setForm({
        tipo: tareaInicial.tipo || "Temperatura",
        titulo: tareaInicial.titulo || "",
        descripcion: tareaInicial.descripcion || "",
        prioridad: tareaInicial.prioridad || "Media",
        hora: tareaInicial.hora || "",
        frecuencia: tareaInicial.frecuencia || "Diaria",
        diasSemana: tareaInicial.dias_semana || [],
        diaMes: tareaInicial.dia_mes || 1,
      });
    } else {
      setForm({ tipo: "Temperatura", titulo: "", descripcion: "", prioridad: "Media", hora: "12:30", frecuencia: "Diaria", diasSemana: [], diaMes: 1 });
    }
  }, [tareaInicial, open]);

  function toggleDia(dia) {
    setForm((prev) => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter((d) => d !== dia)
        : [...prev.diasSemana, dia],
    }));
  }

  function handleCrear() {
    if (!form.titulo.trim()) return;
    onCrear && onCrear(form);
    onClose();
    setForm({ tipo: "Temperatura", titulo: "", descripcion: "", prioridad: "Media", hora: "", frecuencia: "Diaria", diasSemana: [], diaMes: 1 });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#0A3E47] text-xl">
            <RefreshCw className="w-5 h-5" />
            {tareaInicial ? "Editar Tarea Recurrente" : "Programar Tarea Recurrente"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Tipo de registro */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Tipo de registro a completar <span className="text-red-500">*</span></label>
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
              placeholder="Ej: Realizar control de temperatura diario"
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

          {/* Frecuencia */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Frecuencia <span className="text-red-500">*</span></label>
            <Select value={form.frecuencia} onValueChange={(v) => setForm({ ...form, frecuencia: v })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FRECUENCIAS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Días semana (si semanal) */}
          {form.frecuencia === "Semanal" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Selecciona los días de la semana</label>
              <div className="flex gap-2 flex-wrap">
                {DIAS_SEMANA.map((dia) => (
                  <button
                    key={dia}
                    onClick={() => toggleDia(dia)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                      form.diasSemana.includes(dia)
                        ? "bg-[#0A3E47] text-white border-[#0A3E47]"
                        : "border-border text-foreground hover:border-[#0A3E47]"
                    }`}>
                    {dia}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Día del mes (si mensual) */}
          {form.frecuencia === "Mensual" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Día del mes (1-31)</label>
              <input
                type="number"
                min={1}
                max={31}
                value={form.diaMes}
                onChange={(e) => setForm({ ...form, diaMes: Number(e.target.value) })}
                className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#0A3E47]"
              />
              <p className="text-xs text-muted-foreground">La tarea se generará este día de cada mes</p>
            </div>
          )}

          {/* Info box */}
          <div className="bg-secondary rounded-xl p-4 flex gap-3 items-start">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">¿Cómo funciona?</p>
              <p className="text-xs text-muted-foreground mt-0.5">Esta tarea se generará automáticamente según la frecuencia seleccionada y aparecerá en tu lista de "Tareas del día" cuando corresponda.</p>
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
              {tareaInicial ? "Guardar cambios" : "Crear programación"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}