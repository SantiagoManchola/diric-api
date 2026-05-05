import PDFDocument from "pdfkit";
import https from "https";
import http from "http";

// ── Types ─────────────────────────────────────────────────────────────────────

interface EventForPdf {
  id: number;
  title: string;
  type: string;
  location: string | null;
  description: string;
  entity_name: string | null;
  entity_website: string | null;
  entity_sector: string | null;
  entity_contact_name: string | null;
  entity_contact_email: string | null;
  entity_contact_phone: string | null;
  entity_contact_role: string | null;
  event_development: string | null;
  activity_details: string | null;
  results_summary: string | null;
  agreements: string | null;
  visit_purpose: string | null;
  visit_justification: string | null;
  conclusions: string;
  start_datetime: Date;
  end_datetime: Date;
  creator: { name: string; email: string };
  encargado: { name: string; email: string };
  attendees: Array<{
    user: { name: string; phone: string; email: string };
  }>;
  images: Array<{
    url: string;
    filename: string;
    mime_type: string;
    order_idx: number;
  }>;
}

interface Cell {
  text: string;
  isHeader?: boolean;
  colspan?: number;
  align?: "left" | "center" | "right";
  bold?: boolean;
  italic?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MARGIN = 40;
const HEADER_BG = "#c6d9f1";
const FONT_SIZE = 10;
const TITLE_FONT_SIZE = 11;
const CELL_PAD = 5;
const LINE_GAP = 1;

// Column proportions from docx DXA grid (total = 8828)
const COL4 = [2689 / 8828, 1842 / 8828, 2148 / 8828, 2149 / 8828]; // generalidades
const COL2 = [2263 / 8828, 6565 / 8828]; // desarrollo, resultados, ODS
const COL3 = [5240 / 8828, 2268 / 8828, 1320 / 8828]; // compromisos

// ── Helpers ───────────────────────────────────────────────────────────────────

function contentWidth(doc: PDFKit.PDFDocument): number {
  return doc.page.width - MARGIN * 2;
}

function checkPageBreak(
  doc: PDFKit.PDFDocument,
  y: number,
  needed: number,
): number {
  if (y + needed > doc.page.height - MARGIN - 10) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function absoluteWidths(
  doc: PDFKit.PDFDocument,
  colProportions: number[],
): number[] {
  const total = contentWidth(doc);
  return colProportions.map((p) => p * total);
}

function calcRowHeight(
  doc: PDFKit.PDFDocument,
  cells: Cell[],
  absWidths: number[],
): number {
  let maxH = 18;
  let wIdx = 0;
  for (const cell of cells) {
    const span = cell.colspan ?? 1;
    let w = 0;
    for (let j = 0; j < span; j++) w += absWidths[wIdx + j] ?? 0;
    wIdx += span;

    doc.font(cell.bold ? "Helvetica-Bold" : "Helvetica").fontSize(FONT_SIZE);
    const h = doc.heightOfString(cell.text || " ", {
      width: Math.max(w - CELL_PAD * 2, 1),
      lineGap: LINE_GAP,
    });
    maxH = Math.max(maxH, h + CELL_PAD * 2);
  }
  return Math.ceil(maxH);
}

function drawRow(
  doc: PDFKit.PDFDocument,
  cells: Cell[],
  x: number,
  y: number,
  absWidths: number[],
  rowH: number,
): void {
  let cx = x;
  let wIdx = 0;

  for (const cell of cells) {
    const span = cell.colspan ?? 1;
    let w = 0;
    for (let j = 0; j < span; j++) w += absWidths[wIdx + j] ?? 0;
    wIdx += span;

    // Background
    if (cell.isHeader) {
      doc.save().rect(cx, y, w, rowH).fillColor(HEADER_BG).fill().restore();
    }

    // Border
    doc.save().rect(cx, y, w, rowH).lineWidth(0.5).stroke("#000000").restore();

    // Text
    const font = cell.bold
      ? "Helvetica-Bold"
      : cell.italic
        ? "Helvetica-Oblique"
        : "Helvetica";
    doc.font(font).fontSize(FONT_SIZE).fillColor("#000000");

    if (cell.text?.trim()) {
      doc.text(cell.text, cx + CELL_PAD, y + CELL_PAD, {
        width: Math.max(w - CELL_PAD * 2, 1),
        align: cell.align ?? "left",
        lineGap: LINE_GAP,
        lineBreak: true,
      });
    }

    cx += w;
  }
}

function renderRows(
  doc: PDFKit.PDFDocument,
  rows: Cell[][],
  colProportions: number[],
  y: number,
): number {
  const abs = absoluteWidths(doc, colProportions);
  const x = MARGIN;

  for (const cells of rows) {
    const rowH = calcRowHeight(doc, cells, abs);
    y = checkPageBreak(doc, y, rowH);
    drawRow(doc, cells, x, y, abs, rowH);
    y += rowH;
  }
  return y;
}

function sectionLabel(text: string): Cell[] {
  return [{ text, isHeader: true, bold: true, align: "center", colspan: 99 }];
}

function gap(doc: PDFKit.PDFDocument, y: number, amount = 8): number {
  return checkPageBreak(doc, y + amount, 20);
}

function fetchImageBuffer(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, (res) => {
      if (!res.statusCode || res.statusCode >= 400) {
        resolve(null);
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", () => resolve(null));
    });
    req.on("error", () => resolve(null));
    req.setTimeout(15000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(d: Date): string {
  return `${formatDate(d)} ${d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`;
}

function eventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    mesa_trabajo: "Mesa de Trabajo",
    socializacion_externa: "Socialización Externa / Visita Técnica",
    socializacion_interna: "Socialización Interna",
  };
  return labels[type] ?? type;
}

// ── Section renderers ─────────────────────────────────────────────────────────

function renderDocumentHeader(
  doc: PDFKit.PDFDocument,
  event: EventForPdf,
): number {
  const cw = contentWidth(doc);
  let y = MARGIN;

  // Top border line
  doc
    .save()
    .moveTo(MARGIN, y)
    .lineTo(MARGIN + cw, y)
    .lineWidth(1.5)
    .stroke("#1f4e79")
    .restore();
  y += 6;

  // Form code right-aligned
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#1f4e79")
    .text("EX-FO-10", MARGIN, y, { width: cw, align: "right" });

  // Main title
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#1f4e79")
    .text("Sistematización de Visitas Técnicas Empresariales", MARGIN, y + 2, {
      width: cw,
      align: "center",
    });
  y += 22;

  // Subtitle / description
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#444444")
    .text(
      "Vinculan el potencial desarrollo de actividades de investigación, creación, cooperación y proyección social.",
      MARGIN,
      y,
      { width: cw, align: "center" },
    );
  y += 14;

  // Event type chip
  doc.save().rect(MARGIN, y, cw, 18).fillColor("#1f4e79").fill().restore();
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#ffffff")
    .text(eventTypeLabel(event.type), MARGIN, y + 4, {
      width: cw,
      align: "center",
    });
  y += 24;

  return y;
}

function renderGeneralidades(
  doc: PDFKit.PDFDocument,
  event: EventForPdf,
  y: number,
): number {
  y = gap(doc, y);
  doc
    .font("Helvetica-Bold")
    .fontSize(TITLE_FONT_SIZE)
    .fillColor("#000000")
    .text("Generalidades", MARGIN, y);
  y += 16;

  const attendeeRows: Cell[][] = event.attendees.map((a) => [
    { text: a.user.name },
    { text: a.user.phone || "-" },
    { text: a.user.email || "-" },
    { text: "-" },
  ]);

  const rows: Cell[][] = [
    // Company row
    [
      {
        text: "Empresa / Entidad objeto de la visita:",
        isHeader: true,
        colspan: 4,
        bold: true,
        align: "center",
      },
    ],
    [{ text: event.entity_name || "-", colspan: 4 }],
    // Website / Date headers
    [
      { text: "Sitio web - Organización", isHeader: true, align: "center" },
      {
        text: "Lugar y fecha de la visita",
        isHeader: true,
        colspan: 3,
        align: "center",
      },
    ],
    // Website / Date values
    [
      { text: event.entity_website || "-" },
      {
        text: `${event.location || "-"}  ·  ${formatDate(event.start_datetime)} ${event.start_datetime.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })} – ${event.end_datetime.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`,
        colspan: 3,
      },
    ],
    // Host headers
    [
      { text: "Nombre anfitrión(s)", isHeader: true, align: "center" },
      { text: "Celular", isHeader: true, align: "center" },
      { text: "Correo-e", isHeader: true, align: "center" },
      { text: "Rol", isHeader: true, align: "center" },
    ],
    // Host values
    [
      { text: event.entity_contact_name || "-" },
      { text: event.entity_contact_phone || "-" },
      { text: event.entity_contact_email || "-" },
      { text: event.entity_contact_role || "-" },
    ],
    // Visitor headers
    [
      { text: "Visitante(s)", isHeader: true, align: "center" },
      { text: "Celular", isHeader: true, align: "center" },
      { text: "Correo-e", isHeader: true, align: "center" },
      { text: "Rol", isHeader: true, align: "center" },
    ],
    // Visitors (attendees)
    ...(attendeeRows.length > 0
      ? attendeeRows
      : [[{ text: "-" }, { text: "-" }, { text: "-" }, { text: "-" }]]),
    // Purpose
    [
      {
        text: "Propósito de la visita",
        isHeader: true,
        colspan: 4,
        align: "center",
      },
    ],
    [{ text: event.visit_purpose || "-", colspan: 4 }],
    // Justification
    [
      {
        text: "Justificación de la visita",
        isHeader: true,
        colspan: 4,
        align: "center",
      },
    ],
    [{ text: event.visit_justification || "-", colspan: 4 }],
  ];

  return renderRows(doc, rows, COL4, y);
}

function renderDesarrollo(
  doc: PDFKit.PDFDocument,
  event: EventForPdf,
  y: number,
): number {
  y = gap(doc, y);
  doc
    .font("Helvetica-Bold")
    .fontSize(TITLE_FONT_SIZE)
    .fillColor("#000000")
    .text("Desarrollo de la Visita", MARGIN, y);
  y += 16;

  const rows: Cell[][] = [
    [
      { text: "Actividades:", isHeader: true, bold: true, align: "center" },
      { text: "Detalle", isHeader: true, bold: true, align: "center" },
    ],
    [
      { text: event.activity_details || "-" },
      { text: event.event_development || "-" },
    ],
  ];

  return renderRows(doc, rows, COL2, y);
}

async function renderMemoriaVisual(
  doc: PDFKit.PDFDocument,
  images: EventForPdf["images"],
  y: number,
): Promise<number> {
  if (images.length === 0) return y;

  y = gap(doc, y);
  doc
    .font("Helvetica-Bold")
    .fontSize(TITLE_FONT_SIZE)
    .fillColor("#000000")
    .text("Memoria Visual de la Visita", MARGIN, y);
  y += 16;

  const cw = contentWidth(doc);
  const GAP = 6;
  const IMG_PER_ROW = 2;
  const imgW = (cw - GAP * (IMG_PER_ROW - 1)) / IMG_PER_ROW;
  const MAX_IMG_H = 160;

  const sorted = [...images].sort((a, b) => a.order_idx - b.order_idx);

  for (let i = 0; i < sorted.length; i += IMG_PER_ROW) {
    const rowImages = sorted.slice(i, i + IMG_PER_ROW);
    let rowMaxH = 0;

    // Fetch all images in the row
    const buffers: (Buffer | null)[] = await Promise.all(
      rowImages.map((img) => fetchImageBuffer(img.url)),
    );

    // Measure row height (scale proportionally)
    const dims: { w: number; h: number }[] = [];
    for (const buf of buffers) {
      if (buf) {
        dims.push({ w: imgW, h: MAX_IMG_H });
        rowMaxH = Math.max(rowMaxH, MAX_IMG_H);
      } else {
        dims.push({ w: imgW, h: 40 });
        rowMaxH = Math.max(rowMaxH, 40);
      }
    }

    y = checkPageBreak(doc, y, rowMaxH + GAP);

    let ix = MARGIN;
    for (let j = 0; j < rowImages.length; j++) {
      const buf = buffers[j];
      const mime = rowImages[j].mime_type;

      if (buf && (mime === "image/jpeg" || mime === "image/png")) {
        try {
          doc.image(buf, ix, y, {
            width: imgW,
            height: MAX_IMG_H,
            fit: [imgW, MAX_IMG_H],
            align: "center",
            valign: "center",
          });
        } catch {
          // skip image if pdfkit can't embed it
        }
      } else {
        // Placeholder when image can't be loaded
        doc
          .save()
          .rect(ix, y, imgW, 40)
          .lineWidth(0.5)
          .stroke("#cccccc")
          .restore();
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#888888")
          .text("[Imagen no disponible]", ix + 4, y + 14, {
            width: imgW - 8,
            align: "center",
          });
      }

      // Caption
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#555555")
        .text(rowImages[j].filename, ix, y + rowMaxH + 2, {
          width: imgW,
          align: "center",
        });

      ix += imgW + GAP;
    }

    y += rowMaxH + 18; // height + caption + gap
  }

  return y;
}

function renderResultados(
  doc: PDFKit.PDFDocument,
  event: EventForPdf,
  y: number,
): number {
  y = gap(doc, y);
  doc
    .font("Helvetica-Bold")
    .fontSize(TITLE_FONT_SIZE)
    .fillColor("#000000")
    .text("Resultados Obtenidos", MARGIN, y);
  y += 16;

  const rows: Cell[][] = [
    [
      { text: "Tipo:", isHeader: true, bold: true, align: "center" },
      { text: "Detalle", isHeader: true, bold: true, align: "center" },
    ],
    [{ text: event.results_summary || "-", colspan: 2 }],
  ];

  y = renderRows(doc, rows, COL2, y);

  // Types legend
  y += 4;
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#555555")
    .text(
      "Tipos: Ext: Extensión  ·  Con: Consultoría  ·  Inv: Investigación  ·  Tec: Servicios Técnico/Tecnológico  ·  For: Formación a la medida  ·  Div: Divulgativo  ·  Ped: Pedagógico  ·  Soc: Social",
      MARGIN,
      y,
      { width: contentWidth(doc) },
    );
  y += 14;

  return y;
}

function renderCompromisos(
  doc: PDFKit.PDFDocument,
  event: EventForPdf,
  y: number,
): number {
  y = gap(doc, y);
  doc
    .font("Helvetica-Bold")
    .fontSize(TITLE_FONT_SIZE)
    .fillColor("#000000")
    .text("Compromisos", MARGIN, y);
  y += 16;

  const rows: Cell[][] = [
    [
      { text: "Detalle", isHeader: true, align: "center" },
      { text: "Responsable", isHeader: true, align: "center" },
      { text: "Fecha", isHeader: true, align: "center" },
    ],
    [{ text: event.agreements || "-", colspan: 3 }],
  ];

  return renderRows(doc, rows, COL3, y);
}

function renderConclusions(
  doc: PDFKit.PDFDocument,
  event: EventForPdf,
  y: number,
): number {
  if (!event.conclusions?.trim()) return y;

  y = gap(doc, y);
  doc
    .font("Helvetica-Bold")
    .fontSize(TITLE_FONT_SIZE)
    .fillColor("#000000")
    .text("Conclusiones", MARGIN, y);
  y += 16;

  const rows: Cell[][] = [[{ text: event.conclusions, colspan: 1 }]];
  return renderRows(doc, rows, [1], y);
}

function renderFooter(doc: PDFKit.PDFDocument, event: EventForPdf): void {
  const cw = contentWidth(doc);
  const footerY = doc.page.height - MARGIN + 4;
  const createdText = `Generado el ${formatDateTime(new Date())}  ·  Encargado: ${event.encargado.name}  ·  Creado por: ${event.creator.name}`;

  doc
    .save()
    .moveTo(MARGIN, footerY - 6)
    .lineTo(MARGIN + cw, footerY - 6)
    .lineWidth(0.5)
    .stroke("#aaaaaa")
    .restore();

  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor("#888888")
    .text(createdText, MARGIN, footerY, { width: cw, align: "center" });
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generateEventPDF(event: EventForPdf): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: MARGIN,
        bufferPages: true,
        info: {
          Title: event.title,
          Author: "DIRIC – Sistema de Gestión",
          Subject: "EX-FO-10 Sistematización de Visitas Técnicas",
          CreationDate: new Date(),
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      let y = renderDocumentHeader(doc, event);
      y = renderGeneralidades(doc, event, y);
      y = renderDesarrollo(doc, event, y);
      y = await renderMemoriaVisual(doc, event.images, y);
      y = renderResultados(doc, event, y);
      y = renderCompromisos(doc, event, y);
      renderConclusions(doc, event, y);

      // Add footer to every page
      const totalPages = (doc as any).bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        renderFooter(doc, event);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
