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
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      system: "Eres el asistente de calidad de Qualvia. El negocio ya usa Qualvia — nunca sugieras digitalizar ni usar una app. Genera UN consejo del día accionable y personalizado según el contexto recibido. Prioridad: (1) incidencias abiertas >48h → menciona la más crítica con acción concreta, (2) tareas pendientes → anima a completarlas, (3) sin auditoría >30 días → sugiérela, (4) todo en orden → consejo proactivo específico para el tipo de negocio. Nunca inventes datos que no estén en el contexto. 2 frases máximo. Sin saludos. Español.",
      messages: [{ role: "user", content: userPrompt }]
    })
  });

  const data = await response.json();
  const consejo = data?.content?.[0]?.text?.trim() || "Recuerda revisar tus registros del día y mantener al día el control de temperaturas.";

  return Response.json({ ok: true, consejo });
});