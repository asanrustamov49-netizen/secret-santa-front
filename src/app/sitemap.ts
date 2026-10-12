import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// The public pages. The language comes from a cookie / Accept-Language on the same URLs,
// so there are no per-language alternates to list.

const PAGES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/signup", priority: 0.8, changeFrequency: "monthly" },
  { path: "/login", priority: 0.5, changeFrequency: "monthly" },
  { path: "/join", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const site = siteUrl();
  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${site}${path === "/" ? "" : path}`,
    changeFrequency,
    priority,
  }));
}
