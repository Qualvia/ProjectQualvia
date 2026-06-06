import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

  const { business_id, user_id, nombre_negocio, tipo_negocio, ciudad, incidencias_activas, tareas_completadas, tareas_total, ultima_auditoria_dias } = await req.json();

  const tipoTexto = tipo_negocio || "negocio alimentario";
  const ciudadTexto = ciudad ? ` en ${ciudad}` : "";

  const contextoIncidencias = incidencias_activas?.length > 0
    ? `Incidencias abiertas: ${incidencias_activas.map(i => `${i.tipo} (${i.prioridad}, ${i.horas}h sin resolver)`).join(", ")}.`
    : "Sin incidencias activas.";

  const contextoTareas = tareas_total > 0
    ? `Tareas hoy: ${tareas_completadas}/${tareas_total} completadas.`
    : "Sin tareas programadas hoy.";

  const contextoAuditoria = ultima_auditoria_dias > 30
    ? `Última auditoría interna hace ${ultima_auditoria_dias} días.`
    : ultima_auditoria_dias === null
    ? "Nunca ha hecho una auditoría interna."
    : "";

  const userPrompt = `Negocio: ${nombre_negocio}, ${tipoTexto}${ciudadTexto}.
${contextoIncidencias}
${contextoTareas}
${contextoAuditoria}
Genera el consejo del día.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 150,
      system: "Eres el asistente de calidad alimentaria de Qualvia. Genera un consejo del día breve, práctico y muy personalizado para el negocio según su situación real. Si hay incidencias abiertas más de 48h, menciónalas con una acción concreta. Si lleva mucho sin auditoría, sugiérela. Si tiene tareas pendientes, anima a completarlas. Solo el consejo, sin saludos ni introducciones. Máximo 2 frases en español.",
      messages: [{ role: "user", content: userPrompt }]
    })
  });

  const data = await response.json();
  const consejo = data?.content?.[0]?.text?.trim() || "Recuerda revisar tus registros del día y mantener al día el control de temperaturas.";

  return Response.json({ ok: true, consejo });
});