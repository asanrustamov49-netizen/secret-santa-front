"use client";
import { GIFT_BOX_MARK_VIEWBOX, giftBoxSvg } from "@/components/ui/giftBox/giftBoxArt";
import { inviteQr, QR_QUIET } from "./qr";

// The invite QR code as a printable card (PNG, drawn in the browser): the code, the
// gift in its middle, the event's name under it. Nothing leaves the device.

/** Fixed print colours — the card is white in both themes so every camera reads it */
export const QR_INK = "#0a1426";
const MUTED = "#536075";

const WIDTH = 1080;
const HEIGHT = 1350;
const QR_SIDE = 840;
const QR_TOP = 168;

/** The code as a standalone SVG with explicit colours (an <img> has no stylesheet) */
export function inviteQrSvg(url: string): string {
  const { viewBox, dots, finders } = inviteQr(url);
  const finderMarkup = finders
    .map(
      ([x, y]) =>
        `<rect x="${x + 0.5}" y="${y + 0.5}" width="6" height="6" rx="1.6" fill="none" stroke="${QR_INK}" stroke-width="1"/>` +
        `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.9" fill="${QR_INK}"/>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><path d="${dots}" fill="${QR_INK}"/>${finderMarkup}</svg>`;
}

/** The brand gift with the page's colour tokens resolved to their values */
function giftSvg(): string {
  const styles = getComputedStyle(document.documentElement);
  return giftBoxSvg({ uid: "qr", viewBox: GIFT_BOX_MARK_VIEWBOX }).replace(
    /var\((--color-[\w-]+)\)/g,
    (match, name: string) => styles.getPropertyValue(name).trim() || match,
  );
}

function loadSvg(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

/** Shortens the text with "…" until it fits the width */
function fit(context: CanvasRenderingContext2D, text: string, width: number): string {
  if (context.measureText(text).width <= width) return text;
  let cut = text;
  while (cut.length > 1 && context.measureText(`${cut}…`).width > width) cut = cut.slice(0, -1);
  return `${cut.trimEnd()}…`;
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  context.beginPath();
  context.roundRect(x, y, w, h, r);
  context.fill();
}

/** Draws the card and resolves with a PNG */
export async function inviteQrPng(url: string, eventName: string, brand: string): Promise<Blob> {
  await document.fonts.ready;
  const styles = getComputedStyle(document.documentElement);
  const display = styles.getPropertyValue("--font-playfair").trim() || "Georgia, serif";
  const sans = styles.getPropertyValue("--font-inter").trim() || "system-ui, sans-serif";

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, WIDTH, HEIGHT);

  const [qr, gift] = await Promise.all([loadSvg(inviteQrSvg(url)), loadSvg(giftSvg())]);

  // Brand line
  context.drawImage(gift, WIDTH / 2 - 150, 74, 56, 56);
  context.fillStyle = QR_INK;
  context.font = `700 44px ${display}`;
  context.textBaseline = "middle";
  context.textAlign = "left";
  context.fillText(brand, WIDTH / 2 - 82, 104);

  // The code, with a white plate and the gift in the clear middle
  const qrLeft = (WIDTH - QR_SIDE) / 2;
  context.drawImage(qr, qrLeft, QR_TOP, QR_SIDE, QR_SIDE);
  const { size, logo } = inviteQr(url);
  const cell = QR_SIDE / (size + 2 * QR_QUIET);
  const plate = logo[1] * cell;
  const plateX = qrLeft + (logo[0] + QR_QUIET) * cell;
  const plateY = QR_TOP + (logo[0] + QR_QUIET) * cell;
  context.fillStyle = "#ffffff";
  roundedRect(context, plateX, plateY, plate, plate, plate * 0.24);
  const inset = plate * 0.12;
  context.drawImage(gift, plateX + inset, plateY + inset, plate - inset * 2, plate - inset * 2);

  // The event and how to use it
  context.textAlign = "center";
  context.fillStyle = QR_INK;
  context.font = `700 60px ${display}`;
  context.fillText(fit(context, eventName, WIDTH - 160), WIDTH / 2, QR_TOP + QR_SIDE + 92);
  context.fillStyle = MUTED;
  context.font = `500 30px ${sans}`;
  context.fillText(fit(context, url.replace(/^https?:\/\//, ""), WIDTH - 160), WIDTH / 2, QR_TOP + QR_SIDE + 160);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))), "image/png"),
  );
}
