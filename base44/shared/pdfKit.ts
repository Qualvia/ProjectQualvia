import { StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';

// A4 en puntos
export const PAGE_W = 595.28;
export const PAGE_H = 841.89;
export const MARGIN = 50;
export const CONTENT_W = PAGE_W - MARGIN * 2;

export const PETROLEO = rgb(10 / 255, 62 / 255, 71 / 255);
export const GRIS = rgb(74 / 255, 74 / 255, 74 / 255);
export const TEXTO = rgb(30 / 255, 30 / 255, 30 / 255);
export const TEXTO_SUAVE = rgb(60 / 255, 60 / 255, 60 / 255);
export const SALVIA = rgb(107 / 255, 182 / 255, 138 / 255);
export const ARENA = rgb(237 / 255, 230 / 255, 218 / 255);
export const LINEA_SUAVE = rgb(212 / 255, 202 / 255, 182 / 255);

// Las fuentes estándar de pdf-lib usan WinAnsi: hay símbolos que no soporta (≤, ≥, →…)
export const sanitize = (s) =>
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

export const wrap = (str, font, size, maxWidth) => {
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

export const drawBlock = (ctx, str, opts = {}) => {
  const {
    font = ctx.helv,
    size = 10,
    color = TEXTO,
    align = "left",
    lineGap = 2,
  } = opts;
  const lines = wrap(str, font, size, CONTENT_W);
  const lineHeight = size + lineGap;
  for (const line of lines) {
    if (ctx.y - lineHeight < MARGIN) ctx.newPage();
    let x = MARGIN;
    const w = font.widthOfTextAtSize(line, size);
    if (align === "center") x = (PAGE_W - w) / 2;
    else if (align === "right") x = PAGE_W - MARGIN - w;
    ctx.page.drawText(line, { x, y: ctx.y - size, size, font, color });
    ctx.y -= lineHeight;
  }
};

export const moveDown = (ctx, pts) => {
  ctx.y -= pts;
};

const gap = (ctx) => moveDown(ctx, 8);

export const heading = (ctx, text, size = 14) => {
  gap(ctx);
  drawBlock(ctx, text, { font: ctx.helvBold, size, color: PETROLEO });
  gap(ctx);
};

export const para = (ctx, text) => {
  drawBlock(ctx, text, { font: ctx.helv, size: 10, color: TEXTO_SUAVE });
  gap(ctx);
};

export const field = (ctx, label, value) => {
  drawBlock(ctx, label + ":", { font: ctx.helvBold, size: 10, color: TEXTO });
  drawBlock(ctx, value || "—", { font: ctx.helv, size: 10, color: TEXTO_SUAVE });
  moveDown(ctx, 4);
};

// Tabla label/value con fondo arena y separadores sutiles entre filas.
export const pintarTabla = (ctx, filas) => {
  const labelW = 140;
  const padX = 12;
  const padY = 8;
  const fontH = 9.5;
  const lineH = 13;
  const valueW = CONTENT_W - labelW - padX * 2;

  const wrapped = (filas || []).map((f) => ({
    label: f.label,
    valueLines: wrap(f.value || "—", ctx.helv, fontH, valueW),
  }));

  const rowHeights = wrapped.map(
    (r) => Math.max(lineH, r.valueLines.length * lineH) + padY * 2
  );
  const totalH = rowHeights.reduce((a, b) => a + b, 0);

  if (ctx.y - totalH < MARGIN) ctx.newPage();

  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.y - totalH,
    width: CONTENT_W,
    height: totalH,
    color: ARENA,
  });

  let cursor = ctx.y;
  for (let i = 0; i < wrapped.length; i++) {
    const r = wrapped[i];
    const rh = rowHeights[i];
    cursor -= rh;
    ctx.page.drawText(r.label + ":", {
      x: MARGIN + padX,
      y: cursor + rh / 2 - fontH / 2,
      size: fontH,
      font: ctx.helvBold,
      color: TEXTO,
    });
    let vy = cursor + rh - padY - fontH;
    for (const line of r.valueLines) {
      ctx.page.drawText(line, {
        x: MARGIN + labelW + padX,
        y: vy,
        size: fontH,
        font: ctx.helv,
        color: TEXTO_SUAVE,
      });
      vy -= lineH;
    }
    if (i < wrapped.length - 1) {
      ctx.page.drawLine({
        start: { x: MARGIN + padX, y: cursor },
        end: { x: MARGIN + CONTENT_W - padX, y: cursor },
        thickness: 0.5,
        color: LINEA_SUAVE,
      });
    }
  }
  ctx.y -= totalH;
};

// Añade cabecera (QUALVIA + título) y pie (Página X de Y) a todas las páginas salvo la portada.
export const anadirCabeceraYPie = async (doc, tituloDocumento) => {
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();
  const total = pages.length;
  for (let i = 0; i < total; i++) {
    if (i === 0) continue;
    const p = pages[i];
    const { width, height } = p.getSize();
    const headerY = height - 28;
    p.drawText("QUALVIA", {
      x: MARGIN,
      y: headerY,
      size: 9,
      font: helvBold,
      color: PETROLEO,
    });
    const titleW = helv.widthOfTextAtSize(tituloDocumento, 9);
    p.drawText(tituloDocumento, {
      x: width - MARGIN - titleW,
      y: headerY,
      size: 9,
      font: helv,
      color: GRIS,
    });
    p.drawLine({
      start: { x: MARGIN, y: headerY - 6 },
      end: { x: width - MARGIN, y: headerY - 6 },
      thickness: 0.5,
      color: LINEA_SUAVE,
    });
    const footerY = 24;
    const pageStr = `Página ${i + 1} de ${total}`;
    const pw = helv.widthOfTextAtSize(pageStr, 9);
    p.drawText(pageStr, {
      x: (width - pw) / 2,
      y: footerY,
      size: 9,
      font: helv,
      color: GRIS,
    });
  }
};