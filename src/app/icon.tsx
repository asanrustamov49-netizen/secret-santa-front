import { brandIcon, brandMarkSvg } from "@/lib/brand/brandIcon";

// Browser tab icon: an SVG that stays sharp at any size, plus a PNG for browsers without SVG favicons.
// /favicon.ico (app/favicon.ico/route.ts) covers the rest.

export function generateImageMetadata() {
  return [
    { id: "svg", contentType: "image/svg+xml" },
    { id: "32", contentType: "image/png", size: { width: 32, height: 32 } },
  ];
}

export default async function Icon({ id }: { id: Promise<string> }) {
  if ((await id) === "svg") {
    return new Response(brandMarkSvg(), { headers: { "Content-Type": "image/svg+xml" } });
  }
  return brandIcon({ size: 32 });
}
