import { brandIcon } from "@/lib/brand/brandIcon";

// Web app manifest icons (see app/manifest.ts) and the social preview image.
// "maskable" keeps the mark inside the central 80% that Android masks never crop.

const ICONS = {
  "192.png": { size: 192, plate: "rounded", markScale: 0.74 },
  "512.png": { size: 512, plate: "rounded", markScale: 0.74 },
  "maskable-512.png": { size: 512, plate: "square", markScale: 0.6 },
} as const;

type IconName = keyof typeof ICONS;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(ICONS).map((name) => ({ name }));
}

export async function GET(_request: Request, ctx: RouteContext<"/icons/[name]">) {
  const { name } = await ctx.params;
  return brandIcon(ICONS[name as IconName]);
}
