import JSZip from "jszip";
import type { CardConfig } from "./ECBuilderForm";

function formatTimestamp(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${mm}${dd}${yyyy}-${hh}${min}${ss}`;
}

const CARD_WIDTH = 318;
const CARD_HEIGHT = 477;
const DENSITIES = [1, 2, 3] as const;

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[\n\r]+/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "untitled";
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function hasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  const data = ctx.getImageData(0, 0, width, height).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

function renderCroppedImage(
  img: HTMLImageElement,
  scale: number,
  posX: number,
  posY: number,
  density: number,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const cw = CARD_WIDTH * density;
  const ch = CARD_HEIGHT * density;

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d")!;

  const imgAR = img.naturalWidth / img.naturalHeight;
  const containerAR = cw / ch;

  let drawW: number, drawH: number;
  if (imgAR > containerAR) {
    drawH = ch;
    drawW = ch * imgAR;
  } else {
    drawW = cw;
    drawH = cw / imgAR;
  }

  const offsetX = (posX / 100) * (cw - drawW);
  const offsetY = (posY / 100) * (ch - drawH);

  const originX = (posX / 100) * cw;
  const originY = (posY / 100) * ch;

  ctx.save();
  ctx.translate(originX, originY);
  ctx.scale(scale, scale);
  ctx.translate(-originX, -originY);
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  ctx.restore();

  return { canvas, ctx };
}

const HEADING_FONT = '"PayPal Pro", system-ui, -apple-system, sans-serif';
const BODY_FONT = '"Plain", system-ui, -apple-system, sans-serif';
const CARD_RADIUS = 24;

async function ensureFontsLoaded(): Promise<void> {
  await document.fonts.ready;
}

function measureWithSpacing(ctx: CanvasRenderingContext2D, text: string, spacing: number): number {
  if (spacing === 0 || text.length === 0) return ctx.measureText(text).width;
  let width = 0;
  for (const char of text) {
    width += ctx.measureText(char).width + spacing;
  }
  return width - spacing;
}

function drawTextWithSpacing(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
): void {
  if (spacing === 0) {
    ctx.fillText(text, x, y);
    return;
  }
  let curX = x;
  for (const char of text) {
    ctx.fillText(char, curX, y);
    curX += ctx.measureText(char).width + spacing;
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  spacing: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (measureWithSpacing(ctx, test, spacing) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function renderPreviewImage(
  img: HTMLImageElement,
  card: CardConfig,
): Promise<HTMLCanvasElement> {
  await ensureFontsLoaded();

  const cw = CARD_WIDTH;
  const ch = CARD_HEIGHT;

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d")!;

  // Clip to rounded rect (rounded-3xl = 24px)
  ctx.beginPath();
  ctx.roundRect(0, 0, cw, ch, CARD_RADIUS);
  ctx.clip();

  // Draw cropped background image
  const { canvas: bgCanvas } = renderCroppedImage(img, card.scale, card.posX, card.posY, 1);
  ctx.drawImage(bgCanvas, 0, 0);

  // Dark overlay (bg-black/50)
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, cw, ch);

  const pad = 16;
  const dismissSize = 32;
  const dismissGap = 8;

  // Dismiss X button (size-8, top-right, text-white/80)
  const dismissX = cw - pad - dismissSize;
  const dismissY = pad;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  const iconSize = 16;
  const iconOffset = (dismissSize - iconSize) / 2;
  const ix = dismissX + iconOffset;
  const iy = dismissY + iconOffset;
  ctx.beginPath();
  ctx.moveTo(ix, iy);
  ctx.lineTo(ix + iconSize, iy + iconSize);
  ctx.moveTo(ix + iconSize, iy);
  ctx.lineTo(ix, iy + iconSize);
  ctx.stroke();

  // Title wraps within bounds of dismiss button (flex items-start gap-2)
  const titleMaxWidth = cw - pad * 2 - dismissGap - dismissSize;
  const fullMaxWidth = cw - pad * 2;

  // Title (font-heading font-black 40px/40px, tracking -1px)
  if (card.title) {
    ctx.fillStyle = "white";
    ctx.font = `900 40px ${HEADING_FONT}`;
    ctx.textBaseline = "top";
    const explicitLines = card.title.split("\n");
    let y = pad;
    for (const line of explicitLines) {
      const wrapped = wrapText(ctx, line, titleMaxWidth, -1);
      for (const wrappedLine of wrapped) {
        drawTextWithSpacing(ctx, wrappedLine, pad, y, -1);
        y += 40;
      }
    }

    // Subtitle (font-body 16px/24px, mt-1 = 4px, text-white/90)
    if (card.subtitle) {
      y += 4;
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = `400 16px ${BODY_FONT}`;
      const subtitleLines = wrapText(ctx, card.subtitle, fullMaxWidth, 0);
      for (const line of subtitleLines) {
        ctx.fillText(line, pad, y);
        y += 24;
      }
    }
  }

  // CTA button (font-label font-medium 14px, px-4 py-2, min-h-10, rounded-full, bg-white/70)
  if (card.cta) {
    ctx.font = `500 14px ${BODY_FONT}`;
    const textWidth = ctx.measureText(card.cta).width;
    const btnPadX = 16;
    const btnH = 40;
    const btnW = textWidth + btnPadX * 2;
    const btnX = cw - pad - btnW;
    const btnY = ch - pad - btnH;

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, btnH / 2);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.textBaseline = "middle";
    ctx.fillText(card.cta, btnX + btnPadX, btnY + btnH / 2);
  }

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      mimeType,
      quality,
    );
  });
}

export async function exportForDevelopment(cards: CardConfig[]): Promise<void> {
  const zip = new JSZip();
  const imagesFolder = zip.folder("images")!;
  const previewsFolder = zip.folder("previews-reference-only")!;

  const cardsWithImages = cards.filter((c) => c.image);
  const seenSlugs = new Map<string, number>();

  const cardExports = await Promise.all(
    cardsWithImages.map(async (card) => {
      let slug = slugify(card.title);

      const count = seenSlugs.get(slug) ?? 0;
      seenSlugs.set(slug, count + 1);
      if (count > 0) slug = `${slug}-${count + 1}`;

      const img = await loadImage(card.image!);

      const { canvas: checkCanvas, ctx: checkCtx } = renderCroppedImage(img, card.scale, card.posX, card.posY, 1);
      const transparent = hasTransparency(checkCtx, checkCanvas.width, checkCanvas.height);
      const ext = transparent ? "png" : "jpg";
      const mimeType = transparent ? "image/png" : "image/jpeg";

      const devImages: Record<string, string> = {};
      for (const d of DENSITIES) {
        const { canvas } = d === 1
          ? { canvas: checkCanvas }
          : renderCroppedImage(img, card.scale, card.posX, card.posY, d);
        const blob = await canvasToBlob(canvas, mimeType, transparent ? undefined : 0.92);
        const filename = `${slug}@${d}x.${ext}`;
        imagesFolder.file(filename, blob);
        devImages[`@${d}x`] = filename;
      }

      const previewCanvas = await renderPreviewImage(img, card);
      const previewBlob = await canvasToBlob(previewCanvas, "image/png");
      const previewFilename = `${slug}-preview.png`;
      previewsFolder.file(previewFilename, previewBlob);

      return {
        title: card.title,
        subtitle: card.subtitle,
        cta: card.cta,
        devImages,
        preview: previewFilename,
      };
    }),
  );

  const metadata = {
    cards: cardExports,
    cardDimensions: { width: CARD_WIDTH, height: CARD_HEIGHT, aspectRatio: "2:3" },
    exportedAt: new Date().toISOString(),
  };
  zip.file("engagement-cards.json", JSON.stringify(metadata, null, 2));

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const ts = formatTimestamp();
  a.download = `oslo-biz-engage-cards-dev-${ts}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
