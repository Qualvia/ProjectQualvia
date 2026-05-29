import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Settings, Trash2, Pencil, RefreshCw, Plus, Calendar, Clock } from "lucide-react";
import ProgramarTareaDialog from "./ProgramarTareaDialog";

const FRECUENCIA_COLORS = {
  "Diaria":      "bg-blue-50 text-blue-700 border-blue-200",
  "Semanal":     "bg-purple-50 text-purple-700 border-purple-200",
  "Mensual":     "bg-amber-50 text-amber-700 border-amber-200",
  "Trimestral":  "bg-orange-50 text-orange-700 border-orange-200",
  "Semestral":   "bg-rose-50 text-rose-700 border-rose-200",
  "Anual":       "bg-slate-50 text-slate-700 border-slate-200",
};

export default function GestionarTareasDialog({ open, onClose }) {
  const { user, currentBusiness } = useBusiness();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProgramar, setShowProgramar] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const cargar = useCallback(async () => {
    if (!user?.id || !currentBusiness?.id) return;
    setLoading(true);
    const data = await base44.entities.TareaProgramada.filter({
      user_id: user.id,
      business_id: currentBusiness.id,
    });
    // Ordenar: activas primero, luego por frecuencia
    const orden = ["Diaria", "Semanal", "Mensual", "Trimestral", "Semestral", "Anual"];
    data.sort((a, b) => {
      if (a.activa !== b.activa) return a.activa ? -1 : 1;
      return orden.indexOf(a.frecuencia) - orden.indexOf(b.frecuencia);
    });
    setTareas(data);
    setLoading(false);
  }, [user?.id, currentBusiness?.id]);

  useEffect(() => {
    if (open) cargar();
  }, [open, cargar]);

  async function toggleActiva(tarea) {
    const nuevo = !tarea.activa;
    setTareas((prev) => prev.map((t) => t.id === tarea.id ? { ...t, activa: nuevo } : t));
    await base44.entities.TareaProgramada.update(tarea.id, { activa: nuevo });
  }

  async function eliminar(id) {
    await base44.entities.TareaProgramada.delete(id);
    setTareas((prev) => prev.filter((t) => t.id !== id));
    setConfirmDelete(null);
  }

  async function handleEditar(form) {
    if (!editando) return;
    const updated = await base44.entities.TareaProgramada.update(editando.id, {
      titulo: form.titulo,
      descripcion: form.descripcion || "",
      tipo: form.tipo,
      prioridad: form.prioridad || "Media",
      hora: form.hora || "",
      frecuencia: form.frecuencia,
      dias_semana: form.diasSemana || [],
      dia_mes: form.diaMes || 1,
    });
    setTareas((prev) => prev.map((t) => t.id === editando.id ? { ...t, ...updated } : t));
    setEditando(null);
  }

  async function handleCrear(form) {
    if (!user?.id || !currentBusiness?.id) return;
    const nueva = await base44.entities.TareaProgramada.create({
      user_id: user.id,
      business_id: currentBusiness.id,
      titulo: form.titulo,
      descripcion: form.descripcion || "",
      tipo: form.tipo,
      prioridad: form.prioridad || "Media",
      hora: form.hora || "",
      frecuencia: form.frecuencia,
      dias_semana: form.diasSemana || [],
      dia_mes: form.diaMes || 1,
      activa: true,
    });
    await cargar();
  }

  function frecuenciaLabel(tarea) {
    if (tarea.frecuencia === "Semanal" && tarea.dias_semana?.length > 0) {
      return `Semanal · ${tarea.dias_semana.join(", ")}`;
    }
    if (tarea.frecuencia === "Mensual" && tarea.dia_mes) {
      return `Mensual · día ${tarea.dia_mes}`;
    }
    return tarea.frecuencia;
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[85vh] overflow-y-auto relative">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="flex items-center gap-2 text-[#0A3E47] text-xl">
              <Settings className="w-5 h-5" />
              Gestionar tareas programadas
            </DialogTitle>
            <button
              onClick={() => { setEditando(null); setShowProgramar(true); }}
              className="flex items-center gap-1.5 text-sm font-medium rounded-lg px-4 py-2 bg-[#6BB68A] text-white hover:bg-[#5aa377] transition-all shrink-0">
              <Plus className="w-4 h-4" />
              Nueva tarea recurrente
            </button>
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-3">

          {/* Lista */}
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : tareas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div className="w-14 h-14 rounded-xl bg-[#E4F2EC] flex items-center justify-center">
                <Calendar className="w-7 h-7 text-[#6BB68A]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Sin tareas programadas</p>
                <p className="text-xs text-muted-foreground mt-0.5">Crea tu primera tarea recurrente.</p>
              </div>
            </div>
          ) : (
            tareas.map((tarea) => (
              <div
                key={tarea.id}
                className={`rounded-xl border p-4 flex items-start gap-4 transition-opacity ${!tarea.activa ? "opacity-50" : ""}`}>
                {/* Toggle activa */}
                <button
                  onClick={() => toggleActiva(tarea)}
                  title={tarea.activa ? "Desactivar" : "Activar"}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 transition-all flex items-center justify-center ${
                    tarea.activa ? "bg-[#6BB68A] border-[#6BB68A]" : "border-border"
                  }`}>
                  {tarea.activa && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{tarea.titulo}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${FRECUENCIA_COLORS[tarea.frecuencia] || "bg-secondary text-foreground border-border"}`}>
                      {frecuenciaLabel(tarea)}
                    </span>
                    {tarea.tipo && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E4F2EC] text-[#0A3E47]">
                        {tarea.tipo}
                      </span>
                    )}
                  </div>
                  {tarea.descripcion && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{tarea.descripcion}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    {tarea.hora && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3" />{tarea.hora}
                      </span>
                    )}
                    <span className={`text-[11px] font-medium ${tarea.activa ? "text-[#6BB68A]" : "text-muted-foreground"}`}>
                      {tarea.activa ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => { setEditando(tarea); setShowProgramar(true); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-[#0A3E47] hover:bg-muted transition-colors"
                    title="Editar">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(tarea.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Confirmación borrado */}
          {confirmDelete && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 rounded-lg">
              <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4 space-y-4">
                <p className="text-sm font-medium text-foreground">¿Eliminar esta tarea programada?</p>
                <p className="text-xs text-muted-foreground">Esta acción no se puede deshacer. Las ejecuciones del día de hoy no se verán afectadas.</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={() => eliminar(confirmDelete)}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Dialog de programar/editar */}
    <ProgramarTareaDialog
      open={showProgramar}
      onClose={() => { setShowProgramar(false); setEditando(null); }}
      tareaInicial={editando}
      onCrear={editando ? handleEditar : handleCrear}
    />
    </>
  );
}