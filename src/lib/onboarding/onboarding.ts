"use client";
import { useSyncExternalStore } from "react";
import { create } from "zustand";

// The product tour: shown once per device to everyone — guests on the landing page,
// /login, /terms or an invite link, and signed-in people alike. A per-device
// convenience, so it lives in localStorage (like the sidebar's state) and everything
// still works when storage is blocked: the welcome then simply shows once per visit.

const KEY = "ss.onboarding.seen";
const EVENT = "ss:onboarding";

/** Blocked storage: remembered for this page's lifetime only */
let seenThisVisit = false;

export function readOnboardingSeen(): boolean {
  if (seenThisVisit) return true;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange); // another tab finished it
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Seen (or dismissed) on this device. The server and hydration say "seen": nothing flashes. */
export function useOnboardingSeen() {
  return useSyncExternalStore(subscribe, readOnboardingSeen, () => true);
}

export function markOnboardingSeen() {
  seenThisVisit = true;
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // storage blocked: this visit only
  }
  window.dispatchEvent(new Event(EVENT));
}

// ─── The guide dialog ───────────────────────────────────────────────

interface GuideStore {
  open: boolean;
}

export const useGuide = create<GuideStore>(() => ({ open: false }));

/** Open the tour — from the first-visit welcome, Settings or the footer. Counts as seen. */
export function openGuide() {
  markOnboardingSeen();
  useGuide.setState({ open: true });
}

export function closeGuide() {
  useGuide.setState({ open: false });
}
