import { encode, QrCodeDataType } from "uqr";

// The invite link as a QR code, drawn our way: softly rounded modules, rounded finder
// squares, and a clear spot in the middle for the gift. Error correction H (30%) keeps
// it scannable with the centre covered. Pure — tested in qr.test.mjs.
//
// Round dots looked nicer but failed jsQR (a stand-in for weaker phone scanners) even
// without the logo; squares with small rounded corners decode like plain squares.

/** White margin around the code, in modules — part of every drawing, so no layout can eat it */
export const QR_QUIET = 3;

export interface InviteQr {
  /** Modules per side, without the quiet zone */
  size: number;
  /** viewBox with the quiet zone around the code */
  viewBox: string;
  /** One SVG path with every data module, in module units */
  dots: string;
  /** Top-left corners of the three finder patterns */
  finders: [number, number][];
  /** The cleared square in the middle, in modules: [start, length] on both axes */
  logo: [number, number];
}

/** Share of the side kept clear for the logo; well inside what level H can rebuild */
const LOGO_SHARE = 0.22;
/** A hairline between modules and the rounding of their corners, in modules */
const GAP = 0.04;
const CORNER = 0.28;

export function inviteQr(url: string): InviteQr {
  const { size, data, types } = encode(url, { ecc: "H", border: 0 });

  // An odd number of modules, centred, so the clear spot sits exactly in the middle
  let logoLength = Math.round(size * LOGO_SHARE);
  if (logoLength % 2 !== size % 2) logoLength += 1;
  const logoStart = (size - logoLength) / 2;
  const inLogo = (x: number, y: number) =>
    x >= logoStart && x < logoStart + logoLength && y >= logoStart && y < logoStart + logoLength;

  const k = CORNER;
  const side = 1 - 2 * GAP - 2 * k;
  const corner = (dx: number, dy: number) => `a${k} ${k} 0 0 1 ${dx * k} ${dy * k}`;
  let dots = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!data[y][x] || types[y][x] === QrCodeDataType.Position || inLogo(x, y)) continue;
      dots +=
        `M${x + GAP + k} ${y + GAP}h${side}${corner(1, 1)}v${side}${corner(-1, 1)}` +
        `h${-side}${corner(-1, -1)}v${-side}${corner(1, -1)}z`;
    }
  }

  const full = size + 2 * QR_QUIET;
  return {
    size,
    viewBox: `${-QR_QUIET} ${-QR_QUIET} ${full} ${full}`,
    dots,
    finders: [
      [0, 0],
      [size - 7, 0],
      [0, size - 7],
    ],
    logo: [logoStart, logoLength],
  };
}
