import { brandIcon, pngsToIco } from "@/lib/brand/brandIcon";

// /favicon.ico for crawlers and older browsers that ask for it by name.
// Next.js can't generate the favicon convention from code, so this is a plain static route.

export const dynamic = "force-static";

export async function GET() {
  const frames = await Promise.all(
    [16, 32, 48].map(async (size) => ({ size, png: new Uint8Array(await brandIcon({ size }).arrayBuffer()) })),
  );
  return new Response(pngsToIco(frames), { headers: { "Content-Type": "image/x-icon" } });
}
