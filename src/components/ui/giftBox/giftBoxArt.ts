// The gift box drawing — the brand mark. The one source for every place it appears:
// <GiftBox> (header logo, hero, cards) and the generated favicon / app icons.
// Plain markup, no React, so the same drawing renders in the browser and at build time.

/** The drawing's own coordinate space */
export const GIFT_BOX_VIEWBOX = "0 0 240 240";

/** The box, bow and floor light with the empty margin trimmed — for icons, where every pixel counts */
export const GIFT_BOX_MARK_VIEWBOX = "24 42 192 192";

interface GiftBoxSvgOptions {
  /** Makes gradient ids unique when several boxes share a page */
  uid: string;
  size?: number;
  viewBox?: string;
  className?: string;
  /** Class for the sparkle group; sparkles are drawn only when set */
  sparklesClassName?: string;
}

/**
 * The gift box as an <svg> string. Colors are the design tokens (var(--color-…)),
 * so on a page it follows the theme; icons resolve them to hex (see lib/brand).
 */
export function giftBoxSvg({ uid, size, viewBox = GIFT_BOX_VIEWBOX, className, sparklesClassName }: GiftBoxSvgOptions): string {
  const id = (name: string) => `${name}-${uid}`;
  const url = (name: string) => `url(#${id(name)})`;
  const sizeAttrs = size === undefined ? "" : ` width="${size}" height="${size}"`;
  const classAttr = className ? ` class="${className}"` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${sizeAttrs}${classAttr}>
<defs>
<linearGradient id="${id("body")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--color-crimson)"/><stop offset="1" style="stop-color:var(--color-crimson-deep)"/></linearGradient>
<linearGradient id="${id("lid")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--color-crimson-light)"/><stop offset="1" style="stop-color:var(--color-crimson)"/></linearGradient>
<linearGradient id="${id("sheen")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0.16"/><stop offset="0.35" stop-color="#fff" stop-opacity="0"/><stop offset="0.8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.22"/></linearGradient>
<linearGradient id="${id("ribbon")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--color-gold-deep)"/><stop offset="0.45" style="stop-color:var(--color-gold-light)"/><stop offset="1" style="stop-color:var(--color-gold)"/></linearGradient>
<linearGradient id="${id("bow")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--color-gold-light)"/><stop offset="1" style="stop-color:var(--color-gold-deep)"/></linearGradient>
<linearGradient id="${id("lidShadow")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
<radialGradient id="${id("floor")}"><stop offset="0" style="stop-color:var(--color-gold)" stop-opacity="0.35"/><stop offset="1" style="stop-color:var(--color-gold)" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="120" cy="218" rx="96" ry="10" fill="${url("floor")}"/>
<rect x="46" y="114" width="148" height="100" rx="10" fill="${url("body")}"/>
<rect x="46" y="114" width="148" height="100" rx="10" fill="${url("sheen")}"/>
<rect x="46" y="118" width="148" height="16" fill="${url("lidShadow")}"/>
<rect x="106" y="114" width="28" height="100" fill="${url("ribbon")}"/>
<rect x="36" y="88" width="168" height="32" rx="8" fill="${url("lid")}"/>
<rect x="36" y="88" width="168" height="32" rx="8" fill="${url("sheen")}"/>
<rect x="104" y="88" width="32" height="32" fill="${url("ribbon")}"/>
<rect x="40" y="89" width="160" height="2" rx="1" fill="#fff" opacity="0.25"/>
<path d="M120 88 C 98 48, 52 50, 62 78 C 70 98, 102 96, 120 88 Z" fill="${url("bow")}"/>
<path d="M120 88 C 142 48, 188 50, 178 78 C 170 98, 138 96, 120 88 Z" fill="${url("bow")}"/>
<path d="M116 86 C 100 62, 74 62, 76 78 C 80 90, 102 90, 116 86 Z" fill="var(--color-gold-deep)" opacity="0.55"/>
<path d="M124 86 C 140 62, 166 62, 164 78 C 160 90, 138 90, 124 86 Z" fill="var(--color-gold-deep)" opacity="0.55"/>
<path d="M114 92 L 92 124 L 101 121 L 105 131 L 121 94 Z" fill="${url("bow")}"/>
<path d="M126 92 L 148 124 L 139 121 L 135 131 L 119 94 Z" fill="${url("bow")}"/>
<rect x="108" y="76" width="24" height="22" rx="7" fill="${url("ribbon")}"/>
<rect x="112" y="79" width="10" height="3" rx="1.5" fill="#fff" opacity="0.45"/>${
    sparklesClassName
      ? `
<g class="${sparklesClassName}" fill="var(--color-gold-light)">
<path d="M200 40 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3 z"/>
<path d="M36 56 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z"/>
<path d="M214 132 l1.5 4.5 4.5 1.5 -4.5 1.5 -1.5 4.5 -1.5 -4.5 -4.5 -1.5 4.5 -1.5 z"/>
</g>`
      : ""
  }
</svg>`;
}
