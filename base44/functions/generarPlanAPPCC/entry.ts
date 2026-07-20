import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Anthropic from 'npm:@anthropic-ai/sdk';
import libreria from "./libreria.json" with { type: "json" };

const MODULOS_POR_DIAGRAMA = {
  caliente_inmediato: ["Registros de Temperaturas", "Registros de Recepción"],
  frio_sin_coccion: ["Registros de Temperaturas", "Registros de Limpieza"],
  crudo_alto_riesgo: ["Registros de Temperaturas", "Registros de Recepción", "Registros de Lotes internos"],
  produccion_anticipada: ["Registros de Temperaturas", "Registros de Lotes internos"],
  congelacion_descongelacion: ["Registros de Congelación/descongelación", "Registros de Temperaturas"],
  panaderia_pasteleria: ["Registros de Temperaturas"],
  fabricacion_distribucion: ["Registros de Lotes internos", "Registros de Recepción"],
  envasado_vacio: ["Registros de Temperaturas", "Registros de Lotes internos"],
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // 1. Auth
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Body
  let business_id;
  try {
    ({ business_id } = await req.json());
  } catch (e) {
    return Response.json({ error: "Body inválido" }, { status: 400 });
  }
  if (!business_id) {
    return Response.json({ error: "business_id es requerido" }, { status: 400 });
  }

  try {
    // 3. Business
    const businesses = await base44.asServiceRole.entities.Business.filter({ id: business_id, user_id: user.id });
    if (!businesses || businesses.length === 0) {
      return Response.json({ error: "Negocio no encontrado o sin permisos" }, { status: 403 });
    }
    const business = businesses[0];

    const perfiles = await base44.asServiceRole.entities.BusinessProfile.filter({ business_id });
    const perfil = perfiles[0] || {};

    // 4. Config
    const configs = await base44.asServiceRole.entities.ConfiguracionAPPCC.filter({ business_id });
    if (!configs || configs.length === 0) {
      return Response.json({ error: "No hay configuración APPCC para este negocio" }, { status: 400 });
    }
    const config = configs[0];
    if (!config.categorias_proceso || config.categorias_proceso.length === 0) {
      return Response.json({ error: "Completa el formulario antes de generar" }, { status: 400 });
    }

    // 5. Capa 1 — diagramas activos (determinista, sin IA)
    const diagramasActivos = {};
    for (const key of config.categorias_proceso) {
      if (libreria.diagramas[key]) {
        diagramasActivos[key] = libreria.diagramas[key];
      }
    }

    // 6. documentacion_registro — unión sin duplicados
    const baseModules = ["Registros de Limpieza", "Registros de Plagas", "Registros de Formación"];
    const modulosSet = new Set(baseModules);
    for (const key of Object.keys(diagramasActivos)) {
      const mods = MODULOS_POR_DIAGRAMA[key] || [];
      for (const m of mods) {
        modulosSet.add(m);
      }
    }
    const documentacion_registro = Array.from(modulosSet);

    // 7. Claude tool use forzado
    const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      system: "Eres un experto en seguridad alimentaria redactando la personalización de un Plan APPCC. Los peligros, puntos de control crítico y límites críticos YA ESTÁN DEFINIDOS y no debes modificarlos ni repetirlos — tu única tarea es redactar los campos narrativos que se te piden, usando los datos reales del negocio que se te dan. No inventes datos que no se te han dado. No uses markdown ni asteriscos, texto plano natural. El campo anexo_huecos debe contener EXCLUSIVAMENTE carencias, riesgos o datos no confirmados detectados a partir de la información del negocio (por ejemplo: equipo necesario no registrado, formación en APPCC no confirmada, proveedores no homologados, separación de circuitos parcial). NUNCA debe listar plantillas de registros a implementar — eso ya está cubierto por otra parte del documento. Si no se detecta ninguna carencia real, devuelve un array vacío.",
      messages: [{
        role: "user",
        content: `Datos del negocio:\n${JSON.stringify({ nombre: business.name, tipo_negocio: perfil.tipo_negocio, ciudad: perfil.ciudad, comunidad_autonoma: perfil.comunidad_autonoma || perfil.provincia })}\n\nConfiguración APPCC:\n${JSON.stringify(config)}\n\nDiagramas de flujo activos:\n${JSON.stringify(diagramasActivos)}`
      }],
      tools: [{
        name: "generar_personalizacion_appcc",
        description: "Genera el contenido narrativo personalizado del Plan APPCC",
        input_schema: {
          type: "object",
          properties: {
            descripcion_actividad: { type: "string" },
            equipo_responsable: { type: "string" },
            diagramas_introduccion: { type: "object", additionalProperties: { type: "string" } },
            verificacion_general: { type: "string" },
            anexo_huecos: {
              type: "array",
              items: {
                type: "object",
                properties: { tipo: { type: "string" }, descripcion: { type: "string" } },
                required: ["tipo", "descripcion"]
              }
            }
          },
          required: ["descripcion_actividad", "equipo_responsable", "diagramas_introduccion", "verificacion_general", "anexo_huecos"]
        }
      }],
      tool_choice: { type: "tool", name: "generar_personalizacion_appcc" }
    });

    const toolUse = response.content.find(b => b.type === "tool_use");
    if (!toolUse) {
      return Response.json({ error: "La IA no devolvió una respuesta válida" }, { status: 502 });
    }
    const personalizacion = toolUse.input;

    // 8. Documento final
    const diagramasFinal = {};
    for (const key of Object.keys(diagramasActivos)) {
      diagramasFinal[key] = {
        ...diagramasActivos[key],
        introduccion: personalizacion.diagramas_introduccion?.[key] || ""
      };
    }
    const documentoFinal = {
      descripcion_actividad: personalizacion.descripcion_actividad,
      equipo_responsable: personalizacion.equipo_responsable,
      diagramas: diagramasFinal,
      verificacion_general: personalizacion.verificacion_general,
      documentacion_registro,
      anexo_huecos: personalizacion.anexo_huecos
    };

    // 9. Guardar en PlanAPPCCGenerado
    const created = await base44.asServiceRole.entities.PlanAPPCCGenerado.create({
      business_id,
      user_id: user.id,
      config_id: config.id,
      libreria_version: libreria.version,
      contenido: documentoFinal,
      estado: "borrador",
      fecha_generacion: new Date().toISOString()
    });

    // 10. Respuesta
    return Response.json({ success: true, plan_id: created.id });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Error generando el documento" }, { status: 500 });
  }
});