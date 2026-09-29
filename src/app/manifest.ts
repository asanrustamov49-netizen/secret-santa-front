import type { MetadataRoute } from "next";
import { en } from "@/i18n/messages/en";
import { BRAND_NIGHT } from "@/lib/brand/brandIcon";

// Name and icons for "Add to Home Screen" / "Install". A manifest has no language of its own,
// so it uses the reference (English) description.

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Secret Santa",
    short_name: "Secret Santa",
    description: en.meta.siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: BRAND_NIGHT,
    theme_color: BRAND_NIGHT,
    icons: [
      { src: "/icons/192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
