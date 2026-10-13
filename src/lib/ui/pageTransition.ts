import type { ViewTransitionProps } from "react";

/**
 * Navigation types a <Link transitionTypes={...}> can carry. Going deeper (a list into
 * one event) slides in from the right, coming back slides from the left; everything
 * else (the sidebar, the browser's back button) gets a calm crossfade with a small rise.
 * The animations themselves are in globals.css (PAGE TRANSITIONS).
 */
export const NAV_FORWARD = ["nav-forward"];
export const NAV_BACK = ["nav-back"];

const BY_TYPE = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "vt-page" };

/** For a route template: its page content enters and leaves with the navigation */
export const PAGE_TRANSITION = {
  enter: BY_TYPE,
  exit: BY_TYPE,
  // Updates inside a page (data arriving, a Suspense reveal) never animate the whole page
  default: "none",
} satisfies Partial<ViewTransitionProps>;
