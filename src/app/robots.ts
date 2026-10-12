import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Search engines see the public pages only. The signed-in area redirects guests anyway,
// and invite links (/join/<code>) are private: a code in a search result is an open door.

export default function robots(): MetadataRoute.Robots {
  const site = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/join/",
        "/dashboard",
        "/events",
        "/my-santa",
        "/ai",
        "/profile",
        "/settings",
      ],
    },
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
