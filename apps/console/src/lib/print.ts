import { tokens } from "@wayfound/ui/tokens";
import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";

export const MM = 72 / 25.4; // PDF points per millimetre
const DPI = 300;
const PX_PER_MM = DPI / 25.4;

export async function qrSvg(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: tokens.cobaltDeep, light: "#ffffff" },
  });
}

export async function qrPng(url: string, size = 1024): Promise<string> {
  return QRCode.toDataURL(url, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: tokens.cobaltDeep, light: "#ffffff" },
  });
}

export function download(name: string, data: Blob | string) {
  const a = document.createElement("a");
  a.href = typeof data === "string" ? data : URL.createObjectURL(data);
  a.download = name;
  a.click();
  if (typeof data !== "string") setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

interface Panel {
  title: string;
  lines: string[];
  qrUrl: string;
  footer: string;
  accent?: string;
}

/** Draw one printable panel at 300 dpi. Uses the page's web fonts, so Turkish letters render. */
async function drawPanel(
  widthMm: number,
  heightMm: number,
  panel: Panel,
  opts: { rotate?: boolean } = {},
): Promise<HTMLCanvasElement> {
  await document.fonts.ready;
  const w = Math.round(widthMm * PX_PER_MM);
  const h = Math.round(heightMm * PX_PER_MM);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  if (opts.rotate) {
    ctx.translate(w, h);
    ctx.rotate(Math.PI);
  }
  const mm = (v: number) => v * PX_PER_MM;
  ctx.fillStyle = tokens.paper;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = panel.accent ?? tokens.cobalt;
  ctx.fillRect(0, 0, w, mm(4));

  const pad = mm(Math.min(widthMm, heightMm) * 0.08);
  ctx.textAlign = "center";
  ctx.fillStyle = tokens.cobaltDeep;
  let y = pad + mm(8);
  ctx.font = `600 ${mm(Math.min(9, widthMm / 9))}px "Fraunces Variable", Georgia, serif`;
  ctx.fillText(panel.title, w / 2, y, w - pad * 2);
  y += mm(6);
  ctx.fillStyle = tokens.inkSoft;
  ctx.font = `500 ${mm(Math.min(4.2, widthMm / 20))}px "Inter Variable", system-ui, sans-serif`;
  for (const line of panel.lines) {
    y += mm(5.5);
    ctx.fillText(line, w / 2, y, w - pad * 2);
  }
  const qrSize = Math.min(w - pad * 2, h - y - mm(22));
  const qr = await loadImage(await qrPng(panel.qrUrl, Math.round(qrSize)));
  const qrY = y + mm(6);
  ctx.fillStyle = "#fff";
  ctx.fillRect((w - qrSize) / 2 - mm(2), qrY - mm(2), qrSize + mm(4), qrSize + mm(4));
  ctx.drawImage(qr, (w - qrSize) / 2, qrY, qrSize, qrSize);
  ctx.fillStyle = tokens.inkSoft;
  ctx.font = `400 ${mm(2.6)}px "Inter Variable", system-ui, sans-serif`;
  ctx.fillText(panel.footer, w / 2, h - pad, w - pad * 2);
  return canvas;
}

async function addCanvasPage(
  pdf: PDFDocument,
  canvas: HTMLCanvasElement,
  widthMm: number,
  heightMm: number,
  x = 0,
  y = 0,
  page = pdf.addPage([widthMm * MM, heightMm * MM]),
) {
  const png = await pdf.embedPng(canvas.toDataURL("image/png"));
  page.drawImage(png, {
    x,
    y,
    width: (canvas.width / PX_PER_MM) * MM,
    height: (canvas.height / PX_PER_MM) * MM,
  });
  return page;
}

/** A5 landscape sheet folded in half into a tent: the top half is upside down so both sides read upright. */
export async function tableTentPdf(opts: {
  name: string;
  url: string;
  en: Panel;
  tr: Panel;
}): Promise<Blob> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${opts.name} table tent`);
  const panelW = 148;
  const panelH = 105;
  const page = pdf.addPage([panelW * MM, panelH * 2 * MM]);
  const front = await drawPanel(panelW, panelH, opts.en);
  const back = await drawPanel(panelW, panelH, opts.tr, { rotate: true });
  await addCanvasPage(pdf, front, panelW, panelH, 0, 0, page);
  await addCanvasPage(pdf, back, panelW, panelH, 0, panelH * MM, page);
  page.drawLine({
    start: { x: 0, y: panelH * MM },
    end: { x: panelW * MM, y: panelH * MM },
    thickness: 0.3,
    dashArray: [3, 3],
  });
  return new Blob([(await pdf.save()) as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
}

/** Print kit: acrylic stand insert (A6), NFC tap card (85×55 mm) front, with crop marks left to the vendor. */
export async function printKitPdf(opts: {
  name: string;
  reviewUrl: string;
  nfcUrl: string;
  en: Panel;
  tr: Panel;
  card: Panel;
}): Promise<Blob> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${opts.name} review print kit`);
  pdf.setSubject(`NFC URL: ${opts.nfcUrl}`);
  await addCanvasPage(pdf, await drawPanel(105, 148, opts.en), 105, 148);
  await addCanvasPage(pdf, await drawPanel(105, 148, opts.tr), 105, 148);
  await addCanvasPage(pdf, await drawPanel(85, 55, opts.card, {}), 85, 55);
  return new Blob([(await pdf.save()) as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
}
