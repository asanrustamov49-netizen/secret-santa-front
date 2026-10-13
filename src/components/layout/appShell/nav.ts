import type { IconType } from "react-icons";
import { PiGearSix, PiGift, PiHouse, PiSparkle, PiTreeEvergreen, PiUserCircle } from "react-icons/pi";
import { aiPageOf } from "@/lib/ai/pages";

// The app's sections — shared by the sidebar, the phone tab bar and the command palette

export interface NavItem {
  href: string;
  /** Its labels in m.nav (full) and m.nav.short (mobile tab bar) */
  key: "dashboard" | "myEvents" | "mySanta" | "ai" | "profile" | "settings";
  icon: IconType;
  /** Where it sits in the sidebar: the Secret Santa itself, or the user's account */
  group: "main" | "account";
}

// The order people think in: home, my gift, my events, help — then me
export const NAV: NavItem[] = [
  { href: "/dashboard", key: "dashboard", icon: PiHouse, group: "main" },
  { href: "/my-santa", key: "mySanta", icon: PiGift, group: "main" },
  { href: "/events", key: "myEvents", icon: PiTreeEvergreen, group: "main" },
  { href: "/ai", key: "ai", icon: PiSparkle, group: "main" },
  { href: "/profile", key: "profile", icon: PiUserCircle, group: "account" },
  { href: "/settings", key: "settings", icon: PiGearSix, group: "account" },
];

export const GROUPS = ["main", "account"] as const;

/** A little life where it means something: the assistant breathes, the gift shakes on hover */
export const NAV_MOTION: Partial<Record<NavItem["key"], string>> = {
  ai: "icon-sparkle",
  mySanta: "icon-wiggle",
};

/** A section is active on its own page and every page under it (/events/new, /events/:id/santa…) */
export const isActiveIn = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/** The assistant learns which page the user came from — as a page identifier, never the path */
export function navHref(href: string, pathname: string) {
  if (href !== "/ai") return href;
  const from = aiPageOf(pathname);
  return from && from !== "ai" ? `/ai?from=${from}` : href;
}
