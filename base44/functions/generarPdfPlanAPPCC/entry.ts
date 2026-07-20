import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';

// A4 en puntos
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

const PETROLEO = rgb(10 / 255, 62 / 255, 71 / 255);
const GRIS = rgb(74 / 255, 74 / 255, 74 / 255);
const TEXTO = rgb(30 / 255, 30 / 255, 30 / 255);
const TEXTO_SUAVE = rgb(60 / 255, 60 / 255, 60 / 255);

// Las fuentes estándar de pdf-lib usan WinAnsi: hay símbolos que no soporta (≤, ≥, →…)
const sanitize = (s) =>
  String(s ?? "")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/↔/g, "<->")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, "...")
    .replace(/\u00A0/g, " ");

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // 1. Auth
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Body — plan_id
  let plan_id;
  try {
    ({ plan_id } = await req.json());
  } catch (e) {
    return Response.json({ error: "Body inválido" }, { status: 400 });
  }
  if (!plan_id) {
    return Response.json({ error: "plan_id es requerido" }, { status: 400 });
  }

  try {
    // 3. Plan
    const planes = await base44.asServiceRole.entities.PlanAPPCCGenerado.filter({ id: plan_id });
    if (!planes || planes.length === 0) {
      return Response.json({ error: "Plan no encontrado" }, { status: 404 });
    }
    const plan = planes[0];

    // 4. Propiedad del negocio
    const businesses = await base44.asServiceRole.entities.Business.filter({
      id: plan.business_id,
      user_id: user.id
    });
    if (!businesses || businesses.length === 0) {
      return Response.json({ error: "Sin permisos sobre este plan" }, { status: 403 });
    }
    const business = businesses[0];

    const contenido = plan.contenido || {};
    const disclaimer =
      "Documento generado con asistencia de inteligencia artificial a partir de la información facilitada por el establecimiento. La responsabilidad de la implantación y veracidad del sistema de autocontrol corresponde al titular, conforme al Reglamento (CE) 852/2004.";

    // 5. Construcción del PDF (pdf-lib — coordenadas manuales)
    const doc = await PDFDocument.create();
    const helv = await doc.embedFont(StandardFonts.Helvetica);
    const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const helvOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

    let page = doc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    const newPage = () => {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    };

    const wrap = (str, font, size, maxWidth) => {
      const text = sanitize(str);
      if (text === "") return [""];
      const words = text.split(/\s+/);
      const lines = [];
      let line = "";
      for (const w of words) {
        const test = line ? line + " " + w : w;
        if (font.widthOfTextAtSize(test, size) <= maxWidth) {
          line = test;
        } else {
          if (line) lines.push(line);
          line = w;
          while (font.widthOfTextAtSize(line, size) > maxWidth && line.length > 1) {
            const cut = Math.max(1, line.length - 1);
            lines.push(line.slice(0, cut));
            line = line.slice(cut);
          }
        }
      }
      if (line) lines.push(line);
      return lines;
    };

    const drawBlock = (
      str,
      { font = helv, size = 10, color = TEXTO, align = "left", lineGap = 2 } = {}
    ) => {
      const lines = wrap(str, font, size, CONTENT_W);
      const lineHeight = size + lineGap;
      for (const line of lines) {
        if (y - lineHeight < MARGIN) newPage();
        let x = MARGIN;
        const w = font.widthOfTextAtSize(line, size);
        if (align === "center") x = (PAGE_W - w) / 2;
        else if (align === "right") x = PAGE_W - MARGIN - w;
        page.drawText(line, { x, y: y - size, size, font, color });
        y -= lineHeight;
      }
    };

    const moveDown = (pts) => {
      y -= pts;
    };
    const gap = () => moveDown(8);

    const heading = (text, size = 14) => {
      gap();
      drawBlock(text, { font: helvBold, size, color: PETROLEO });
      gap();
    };
    const para = (text) => {
      drawBlock(text, { font: helv, size: 10, color: TEXTO_SUAVE });
      gap();
    };
    const field = (label, value) => {
      drawBlock(label + ":", { font: helvBold, size: 10, color: TEXTO });
      drawBlock(value || "—", { font: helv, size: 10, color: TEXTO_SUAVE });
      moveDown(4);
    };

    // --- Portada ---
    moveDown(60);
    drawBlock("Plan APPCC", { font: helvBold, size: 28, color: PETROLEO, align: "center" });
    moveDown(30);
    drawBlock(business.name || "", {
      font: helv,
      size: 16,
      color: TEXTO,
      align: "center"
    });
    moveDown(20);
    drawBlock("Equipo responsable: " + (contenido.equipo_responsable || "—"), {
      font: helv,
      size: 11,
      color: GRIS,
      align: "center"
    });
    moveDown(6);
    drawBlock("Fecha de generación: " + (plan.fecha_generacion || new Date().toISOString()), {
      font: helv,
      size: 11,
      color: GRIS,
      align: "center"
    });
    moveDown(40);
    drawBlock(disclaimer, { font: helvOblique, size: 9, color: GRIS });

    // --- Página de contenido ---
    newPage();

    heading("Descripción de la actividad", 16);
    para(contenido.descripcion_actividad);

    const diagramas = contenido.diagramas || {};
    for (const key of Object.keys(diagramas)) {
      const d = diagramas[key];
      heading(d.nombre || key, 14);
      if (d.introduccion) para(d.introduccion);

      const etapas = d.etapas || [];
      for (const etapa of etapas) {
        drawBlock("Etapa: " + (etapa.nombre || ""), {
          font: helvBold,
          size: 11,
          color: TEXTO
        });
        moveDown(3);
        const peligros = etapa.peligros || [];
        for (const p of peligros) {
          field("Tipo de peligro", p.tipo);
          field("Descripción", p.descripcion);
          if (p.es_pcc === true) {
            field("Límite crítico", p.limite_critico);
            const v = p.vigilancia || {};
            const vigil = [
              v.que ? "Qué: " + v.que : null,
              v.como ? "Cómo: " + v.como : null,
              v.frecuencia ? "Frecuencia: " + v.frecuencia : null,
              v.responsable ? "Responsable: " + v.responsable : null
            ]
              .filter(Boolean)
              .join("  ·  ");
            field("Vigilancia", vigil);
            field("Medida correctora", p.medida_correctora);
          }
          moveDown(6);
        }
      }
    }

    heading("Verificación general", 14);
    para(contenido.verificacion_general);

    heading("Documentación y registros", 14);
    const docs = contenido.documentacion_registro || [];
    if (docs.length === 0) {
      para("No se han definido registros asociados.");
    } else {
      for (const item of docs) {
        drawBlock("•  " + item, { font: helv, size: 10, color: TEXTO_SUAVE });
      }
      gap();
    }

    heading("Anexo — Carencias detectadas", 14);
    const anexo = contenido.anexo_huecos || [];
    if (!anexo || anexo.length === 0) {
      para("No se han detectado carencias relevantes.");
    } else {
      for (const h of anexo) {
        drawBlock(h.tipo || "", { font: helvBold, size: 10, color: TEXTO });
        drawBlock(h.descripcion || "", { font: helv, size: 10, color: TEXTO_SUAVE });
        moveDown(6);
      }
    }

    // 6. PDF a bytes
    const pdfBytes = await doc.save();

    // 7. Subida a almacenamiento privado
    const fileObj = new File([pdfBytes], "plan-appcc-" + plan.id + ".pdf", {
      type: "application/pdf"
    });
    const uploadRes = await base44.integrations.Core.UploadPrivateFile({ file: fileObj });
    const pdf_url = uploadRes.file_uri;

    // 8. Actualizar el registro
    await base44.asServiceRole.entities.PlanAPPCCGenerado.update(plan.id, {
      pdf_url,
      estado: "confirmado",
      fecha_confirmacion: new Date().toISOString()
    });

    return Response.json({ success: true, pdf_url });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Error generando el PDF" }, { status: 500 });
  }
});