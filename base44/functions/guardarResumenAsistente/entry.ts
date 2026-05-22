import Anthropic from "npm:@anthropic-ai/sdk";

Deno.serve(async (req) => {
  const { mensajes, business_id, user_id } = await req.json();

  if (!mensajes || mensajes.length < 2) {
    return new Response(JSON.stringify({ ok: false }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  const client = new Anthropic({
    apiKey: Deno.env.get("ANTHROPIC_API_KEY")
  });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 150,
    messages: [
      {
        role: "user",
        content: `Resume en máximo 2 frases qué consultó el usuario y qué se le recomendó. Solo los puntos clave, sin saludos ni explicaciones.\n\nConversación:\n${mensajes.map(m => `${m.role}: ${m.content}`).join("\n")}`
      }
    ]
  });

  return new Response(
    JSON.stringify({ 
      resumen: response.content[0].text,
      ok: true 
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});