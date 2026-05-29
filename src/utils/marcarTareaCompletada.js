import { base44 } from "@/api/base44Client";

/**
 * Busca la primera TareaEjecucion del día de hoy que coincida con el tipo dado
 * (y pertenezca al user+business correcto) y la marca como completada.
 * Garantía de aislamiento: filtra estrictamente por user_id y business_id.
 */
export async function marcarTareaCompletada(tipo, userId, businessId) {
  if (!tipo || !userId || !businessId) return;

  const hoy = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const ejecuciones = await base44.entities.TareaEjecucion.filter({
    user_id: userId,
    business_id: businessId,
    tipo,
    fecha_dia: hoy,
    completada: false,
  });

  // Marcar la primera pendiente que coincida (puede haber varias si hay más de una tarea del mismo tipo)
  for (const ej of ejecuciones) {
    await base44.entities.TareaEjecucion.update(ej.id, { completada: true });
  }
}