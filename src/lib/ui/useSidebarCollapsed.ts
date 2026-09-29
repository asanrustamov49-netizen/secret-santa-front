"use client";
import { useCallback, useSyncExternalStore } from "react";

// Desktop sidebar: full or icons only. A per-device convenience, so it lives in
// localStorage — and everything still works when storage is blocked (private mode).

const KEY = "ss.sidebar.collapsed";
const EVENT = "ss:sidebar";

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange); // another tab
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** [collapsed, toggle]. The server (and first hydration pass) renders it expanded. */
export function useSidebarCollapsed(): [boolean, () => void] {
  const collapsed = useSyncExternalStore(subscribe, read, () => false);
  const toggle = useCallback(() => {
    try {
      window.localStorage.setItem(KEY, read() ? "0" : "1");
    } catch {
      // Storage unavailable: nothing to remember, nothing to toggle
      return;
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [collapsed, toggle];
}
