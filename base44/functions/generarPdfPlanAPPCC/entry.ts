import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { PDFDocument, StandardFonts } from 'npm:pdf-lib@1.17.1';
import {
  PAGE_W, PAGE_H, MARGIN,
  PETROLEO, GRIS, TEXTO, TEXTO_SUAVE,
  drawBlock, moveDown, heading, para, field, pintarTabla, anadirCabeceraYPie,
} from '../../shared/pdfKit.ts';

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

    const ctx = {
      doc,
      page: doc.addPage([PAGE_W, PAGE_H]),
      y: PAGE_H - MARGIN,
      helv,
      helvBold,
      helvOblique,
      newPage() {
        ctx.page = doc.addPage([PAGE_W, PAGE_H]);
        ctx.y = PAGE_H - MARGIN;
      },
    };

    // --- Portada ---
    moveDown(ctx, 60);
    drawBlock(ctx, "Plan APPCC", { font: helvBold, size: 28, color: PETROLEO, align: "center" });
    moveDown(ctx, 30);
    drawBlock(ctx, business.name || "", {
      font: helv,
      size: 16,
      color: TEXTO,
      align: "center"
    });
    moveDown(ctx, 20);
    drawBlock(ctx, "Equipo responsable: " + (contenido.equipo_responsable || "—"), {
      font: helv,
      size: 11,
      color: GRIS,
      align: "center"
    });
    moveDown(ctx, 6);
    drawBlock(ctx, "Fecha de generación: " + (plan.fecha_generacion || new Date().toISOString()), {
      font: helv,
      size: 11,
      color: GRIS,
      align: "center"
    });
    moveDown(ctx, 40);
    drawBlock(ctx, disclaimer, { font: helvOblique, size: 9, color: GRIS });

    // --- Página de contenido ---
    ctx.newPage();

    heading(ctx, "Descripción de la actividad", 16);
    para(ctx, contenido.descripcion_actividad);

    const diagramas = contenido.diagramas || {};
    for (const key of Object.keys(diagramas)) {
      const d = diagramas[key];
      heading(ctx, d.nombre || key, 14);
      if (d.introduccion) para(ctx, d.introduccion);

      const etapas = d.etapas || [];
      for (const etapa of etapas) {
        drawBlock(ctx, "Etapa: " + (etapa.nombre || ""), {
          font: helvBold,
          size: 11,
          color: TEXTO
        });
        moveDown(ctx, 3);
        const peligros = etapa.peligros || [];
        for (const p of peligros) {
          field(ctx, "Tipo de peligro", p.tipo);
          field(ctx, "Descripción", p.descripcion);
          if (p.es_pcc === true) {
            const v = p.vigilancia || {};
            pintarTabla(ctx, [
              { label: "Límite crítico", value: p.limite_critico },
              { label: "Qué", value: v.que },
              { label: "Cómo", value: v.como },
              { label: "Frecuencia", value: v.frecuencia },
              { label: "Responsable", value: v.responsable },
              { label: "Medida correctora", value: p.medida_correctora },
            ]);
          }
          moveDown(ctx, 6);
        }
      }
    }

    heading(ctx, "Verificación general", 14);
    para(ctx, contenido.verificacion_general);

    heading(ctx, "Documentación y registros", 14);
    const docs = contenido.documentacion_registro || [];
    if (docs.length === 0) {
      para(ctx, "No se han definido registros asociados.");
    } else {
      for (const item of docs) {
        drawBlock(ctx, "•  " + item, { font: helv, size: 10, color: TEXTO_SUAVE });
      }
      moveDown(ctx, 8);
    }

    heading(ctx, "Anexo — Carencias detectadas", 14);
    const anexo = contenido.anexo_huecos || [];
    if (!anexo || anexo.length === 0) {
      para(ctx, "No se han detectado carencias relevantes.");
    } else {
      for (const h of anexo) {
        drawBlock(ctx, h.tipo || "", { font: helvBold, size: 10, color: TEXTO });
        drawBlock(ctx, h.descripcion || "", { font: helv, size: 10, color: TEXTO_SUAVE });
        moveDown(ctx, 6);
      }
    }

    // Cabecera y pie en todas las páginas (excepto portada)
    await anadirCabeceraYPie(doc, "Plan APPCC");

    // 6. PDF a bytes
    const pdfBytes = await doc.save();

    // 7. Subida a almacenamiento privado
    const fileObj = new File([pdfBytes], "plan-appcc-" + plan.id + ".pdf", {
      type: "application/pdf"
    });
    const uploadRes = await base44.integrations.Core.UploadFile({ file: fileObj });
    const pdf_url = uploadRes.file_url;

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