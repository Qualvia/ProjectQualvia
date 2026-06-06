import { base44 } from "@/api/base44Client";

/**
 * Registra una entrada en el feed de actividad del negocio.
 * Es un fire-and-forget: no lanza errores hacia el componente llamante.
 */
export async function registrarActividad({ user_id, business_id, tipo, quien, accion, detalle }) {
  if (!user_id || !business_id) return;
  try {
    await base44.entities.RegistroActividad.create({
      user_id,
      business_id,
      tipo,
      quien: quien || "Sistema",
      accion,
      detalle: detalle || undefined,
      fecha: new Date().toISOString(),
    });
  } catch (_) {
    // silencioso: no bloquear el flujo principal si falla
  }
}