import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

// Texto del item → ruta de destino
const ITEM_LINKS = {
  "Registrar la temperatura de equipos de frío": "/registros?tab=temperatura",
};

export default function EjecutarChecklist({ plantilla, onCancel, onCompletado }) {
  const { currentBusiness, user } = useBusiness();
  const { usuarioActivo } = useUsuarioInterno();
  const navigate = useNavigate();
  const [respuestas, setRespuestas] = useState(() =>
    (plantilla.items || []).map(() => ({ estado: "pendiente", motivo: "" }))
  );
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);

  const totalOk = respuestas.filter((r) => r.estado === "ok").length;
  const totalRespondidos = respuestas.filter((r) => r.estado !== "pendiente").length;

  function setEstado(i, estado) {
    setRespuestas((prev) =>
      prev.map((r, idx) => idx === i ? { ...r, estado, motivo: estado === "ok" ? "" : r.motivo } : r)
    );
  }

  function setMotivo(i, motivo) {
    setRespuestas((prev) => prev.map((r, idx) => idx === i ? { ...r, motivo } : r));
  }

  async function handleFinalizar() {
    if (saving) return;
    setSaving(true);
    const items_resultado = (plantilla.items || []).map((it, i) => ({
      texto: it.texto,
      estado: respuestas[i].estado,
      motivo: respuestas[i].motivo || "",
    }));
    const total = items_resultado.length;
    const ok = items_resultado.filter((r) => r.estado === "ok").length;
    const puntuacion = total > 0 ? Math.round((ok / total) * 100) : 0;
    const registrado_por = usuarioActivo?.nombre || user?.full_name || user?.email || "";

    await base44.entities.ChecklistEjecucion.create({
      user_id: user.id,
      business_id: currentBusiness.id,
      plantilla_id: plantilla.id,
      plantilla_nombre: plantilla.nombre,
      registrado_por,
      items_resultado,
      total_items: total,
      items_ok: ok,
      puntuacion,
      observaciones,
      fecha: new Date().toISOString(),
    });
    onCompletado();
  }

  const hoy = format(new Date(), "d MMM yyyy", { locale: es });
  const quien = usuarioActivo?.nombre || user?.full_name || user?.email || "";

  return (
    <div className="space-y-4">
      <button onClick={onCancel} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a la lista
      </button>

      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        {/* Header verde superior */}
        <div className="h-1.5 bg-[#6BB68A]" />
        <div className="px-6 py-5 flex items-start justify-between border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-[#0A3E47]">{plantilla.nombre}</h2>
            {plantilla.descripcion && <p className="text-sm text-muted-foreground mt-0.5">{plantilla.descripcion}</p>}
          </div>
          <div className="text-right text-sm text-muted-foreground shrink-0 ml-4">
            <p>{hoy}</p>
            <p>{quien}</p>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {(plantilla.items || []).map((item, i) => {
            const r = respuestas[i];
            const esKo = r.estado === "ko";
            return (
              <div key={i} className={`rounded-xl border px-5 py-4 transition-colors ${esKo ? "bg-red-50 border-red-200" : r.estado === "ok" ? "bg-white border-[#6BB68A]/30" : "bg-white border-border"}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className={`text-base font-medium ${esKo ? "text-red-700" : "text-foreground"}`}>{item.texto}</p>
                    {ITEM_LINKS[item.texto] && (
                      <button
                        onClick={() => navigate(ITEM_LINKS[item.texto])}
                        className="mt-1 text-sm text-[#6BB68A] hover:text-[#5aa377] font-medium flex items-center gap-1 transition-colors"
                      >
                        → Ir a registro de Temperatura
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEstado(i, r.estado === "ok" ? "pendiente" : "ok")}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${r.estado === "ok" ? "bg-[#6BB68A] border-[#6BB68A] text-white" : "border-border bg-white text-muted-foreground hover:border-[#6BB68A] hover:text-[#6BB68A]"}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>
                    </button>
                    <button
                      onClick={() => setEstado(i, r.estado === "ko" ? "pendiente" : "ko")}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${r.estado === "ko" ? "bg-red-500 border-red-500 text-white" : "border-border bg-white text-muted-foreground hover:border-red-400 hover:text-red-400"}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                </div>
                {esKo && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-red-600 mb-1">Motivo de no realización:</p>
                    <input
                      type="text"
                      placeholder="Escribe el motivo..."
                      value={r.motivo}
                      onChange={(e) => setMotivo(i, e.target.value)}
                      className="w-full h-9 rounded-lg border border-red-200 bg-white px-3 text-sm focus:outline-none focus:border-red-400"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Observaciones */}
          <div className="pt-2">
            <label className="block text-sm font-semibold text-foreground mb-2">Observaciones generales (opcional)</label>
            <textarea
              placeholder="Añadir comentarios sobre la ejecución..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:border-[#6BB68A] resize-none"
            />
          </div>
        </div>

        {/* Footer fijo */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between bg-white">
          <p className="text-sm text-muted-foreground">Completados: <span className="font-semibold text-foreground">{totalRespondidos} / {plantilla.items?.length || 0}</span></p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleFinalizar}
              disabled={saving || totalRespondidos === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A3E47] hover:bg-[#0A3E47]/90 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              {saving ? "Guardando..." : "Finalizar Checklist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}