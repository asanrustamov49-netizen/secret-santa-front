import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { GIFT_BOX_MARK_VIEWBOX, giftBoxSvg } from "@/components/ui/giftBox/giftBoxArt";

// Favicon, app icons and the social preview, all drawn from the header's gift box.
// Server only (reads globals.css from disk) — import it from icon routes, never from components.
// Icon routes are prerendered at build time, so the CSS is read once, not per request.

/** Brand tokens from globals.css (:root) — the same values the page uses */
const tokens: Record<string, string> = Object.fromEntries(
  [...readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8").matchAll(/(--color-[\w-]+):\s*(#[0-9a-f]{3,8})\s*;/gi)].map(
    ([, name, value]) => [name, value],
  ),
);

/** Backdrop of app icons and the social preview: the night sky of the hero */
export const BRAND_NIGHT = tokens["--color-navy-1000"];

/** An icon has no stylesheet: swap every var(--color-…) for its value */
function resolveTokens(svg: string): string {
  return svg.replace(/var\((--color-[\w-]+)\)/g, (match, name: string) => {
    const value = tokens[name];
    if (!value) throw new Error(`Brand icon: ${name} is not a hex color in globals.css`);
    return value;
  });
}

/** The header's gift box as a standalone SVG file, trimmed to the mark */
export function brandMarkSvg(): string {
  return resolveTokens(giftBoxSvg({ uid: "mark", viewBox: GIFT_BOX_MARK_VIEWBOX }));
}

const markDataUri = () => `data:image/svg+xml;base64,${Buffer.from(brandMarkSvg()).toString("base64")}`;

interface IconOptions {
  size: number;
  /** Night-sky plate behind the mark; transparent without it (browser tab) */
  plate?: "square" | "rounded";
  /** Share of the icon the mark takes — smaller for masks that crop the edges */
  markScale?: number;
}

/** A square PNG of the mark */
export function brandIcon({ size, plate, markScale = 1 }: IconOptions): ImageResponse {
  const mark = Math.round(size * markScale);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: plate ? BRAND_NIGHT : "transparent",
          borderRadius: plate === "rounded" ? size * 0.22 : 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse draws <img>, not next/image */}
        <img src={markDataUri()} width={mark} height={mark} alt="" />
      </div>
    ),
    { width: size, height: size },
  );
}

/**
 * favicon.ico from PNG frames. Every browser since IE Vista reads PNG inside ICO,
 * so the frames are stored as they are — no BMP conversion.
 */
export function pngsToIco(frames: { size: number; png: Uint8Array }[]): Uint8Array<ArrayBuffer> {
  const header = 6;
  const entry = 16;
  let offset = header + entry * frames.length;
  const total = offset + frames.reduce((sum, frame) => sum + frame.png.length, 0);

  const ico = new Uint8Array(total);
  const view = new DataView(ico.buffer);
  view.setUint16(2, 1, true); // type: icon
  view.setUint16(4, frames.length, true);

  frames.forEach(({ size, png }, i) => {
    const at = header + entry * i;
    view.setUint8(at, size >= 256 ? 0 : size); // 0 means 256
    view.setUint8(at + 1, size >= 256 ? 0 : size);
    view.setUint16(at + 4, 1, true); // color planes
    view.setUint16(at + 6, 32, true); // bits per pixel
    view.setUint32(at + 8, png.length, true);
    view.setUint32(at + 12, offset, true);
    ico.set(png, offset);
    offset += png.length;
  });
  return ico;
}
