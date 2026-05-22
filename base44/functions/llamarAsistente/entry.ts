import Anthropic from "npm:@anthropic-ai/sdk";

Deno.serve(async (req) => {
  const { 
    business_id, 
    mensajes, 
    contexto_negocio,
    memoria_previa,
    intencion
  } = await req.json();

  const client = new Anthropic({
    apiKey: Deno.env.get("ANTHROPIC_API_KEY")
  });

  // Contexto dinámico según intención
  let contexto_dinamico = "";
  if (intencion === "registros" && contexto_negocio.ultimos_registros) {
    contexto_dinamico = `\nÚltimos registros del negocio:\n${JSON.stringify(contexto_negocio.ultimos_registros)}`;
  } else if (intencion === "incidencias" && contexto_negocio.incidencias) {
    contexto_dinamico = `\nIncidencias activas:\n${JSON.stringify(contexto_negocio.incidencias)}`;
  } else if (intencion === "resumen" && contexto_negocio.kpis) {
    contexto_dinamico = `\nEstado actual del negocio:\n${JSON.stringify(contexto_negocio.kpis)}`;
  }

  // Memoria de sesión anterior
  const memoria = memoria_previa 
    ? `\nCONTEXTO DE SESIONES ANTERIORES:\n${memoria_previa}\n` 
    : "";

  const system_prompt = `Eres QUALVIA, asistente especializada en seguridad alimentaria y gestión de calidad para negocios de hostelería e industria alimentaria en España.

PERSONALIDAD:
Combinas la expertise técnica de una consultora de seguridad alimentaria con la cercanía de un colaborador de confianza. Tu objetivo es que el usuario siempre se sienta respaldado, tranquilo y con las cosas bajo control. Cuando la situación requiere precisión técnica la aportas, pero nunca a costa de perder esa calidez y ese sentimiento de soporte constante.

TONO:
- Cercano pero profesional
- Claro y directo, sin tecnicismos innecesarios
- Cuando uses terminología técnica (APPCC, PCC, RGSEAA...) explícala brevemente si el contexto lo requiere
- Transmite siempre calma y control
- Usa "nosotros" cuando hables del negocio del usuario, estás en su equipo

CONTEXTO DEL NEGOCIO:
- Negocio: ${contexto_negocio.nombre}
- Tipo: ${contexto_negocio.tipo_negocio}
- Ubicación: ${contexto_negocio.ciudad}, ${contexto_negocio.comunidad_autonoma}
- Fecha actual: ${new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
${memoria}${contexto_dinamico}

CAPACIDADES:
1. Responder dudas sobre normativa APPCC y seguridad alimentaria
2. Orientar sobre el estado del negocio en calidad
3. Analizar tendencias de registros e incidencias
4. Proponer mejoras concretas y accionables
5. Preparar al negocio para inspecciones sanitarias

LÍMITES:
- Solo respondes sobre seguridad alimentaria, calidad, normativa alimentaria y gestión del negocio en ese ámbito
- Si te preguntan algo fuera de este scope, lo indicas amablemente y reconduces la conversación
- Nunca inventas datos del negocio, solo usas los que tienes en el contexto
- Cuando no tengas datos suficientes lo dices claramente y orientas sobre qué información sería necesaria

NORMATIVA DE REFERENCIA:
- Reglamento (CE) 852/2004 de higiene alimentaria
- Real Decreto 3484/2000
- Normativa autonómica de ${contexto_negocio.comunidad_autonoma} cuando aplique
- Guías APPCC del sector HORECA español

FORMATO DE RESPUESTAS:
- Respuestas conversacionales: naturales, sin listas excesivas, máximo 3-4 párrafos
- Análisis y orientación: estructurados con puntos claros
- Siempre termina con una pregunta o sugerencia proactiva cuando tenga sentido`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: system_prompt,
        cache_control: { type: "ephemeral" }
      }
    ],
    messages: mensajes
  });

  return new Response(
    JSON.stringify({ 
      respuesta: response.content[0].text,
      tokens_usados: response.usage.input_tokens + response.usage.output_tokens
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});