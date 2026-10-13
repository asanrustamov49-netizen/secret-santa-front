// Theme = what the user picked (light / dark / system) → resolved to light or dark
// and written to <html data-theme>. The preference lives in localStorage.

export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

export function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function resolve(preference: ThemePreference): "light" | "dark" {
  if (preference !== "system") return preference;
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  // Swap tokens without every transition on the page animating at once
  root.classList.add("theme-switching");
  root.dataset.theme = resolve(preference);
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
}

const listeners = new Set<() => void>();

/** Where the user clicked: the new theme spreads from there */
export interface ThemeOrigin {
  x: number;
  y: number;
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

export function setPreference(preference: ThemePreference, origin?: ThemeOrigin) {
  try {
    if (preference === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // storage blocked (private mode) — the theme still applies for this visit
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as ViewTransitionDocument;
  const root = document.documentElement;
  // Nothing on screen changes (e.g. "system" while the OS is already dark): no animation
  const changes = resolve(preference) !== root.dataset.theme;

  if (!doc.startViewTransition || reduceMotion || !changes) {
    applyTheme(preference);
  } else if (!origin) {
    // From a menu or the command palette: a soft cross-fade
    doc.startViewTransition(() => applyTheme(preference));
  } else {
    // From a theme switch: the new theme spreads in a circle from the click
    root.classList.add("theme-reveal");
    const transition = doc.startViewTransition(() => applyTheme(preference));
    const radius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    );
    transition.ready
      .then(() =>
        root.animate(
          {
            clipPath: [
              `circle(0px at ${origin.x}px ${origin.y}px)`,
              `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
            ],
          },
          { duration: 560, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
        ),
      )
      .catch(() => {});
    transition.finished.finally(() => root.classList.remove("theme-reveal"));
  }

  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);

  // Follow the OS while on "system"; follow other tabs via storage events
  const media = window.matchMedia(DARK_QUERY);
  const onMediaChange = () => {
    if (readPreference() === "system") applyTheme("system");
    listener();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    applyTheme(readPreference());
    listener();
  };

  media.addEventListener("change", onMediaChange);
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onMediaChange);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Inlined into <head> so the right theme is set before the first paint —
 * no flash of the wrong theme. Keep it tiny and dependency-free.
 */
export const themeInitScript = `(function(){try{var p=localStorage.getItem('${THEME_STORAGE_KEY}');var d=p==='dark'||(p!=='light'&&window.matchMedia('${DARK_QUERY}').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){document.documentElement.dataset.theme='dark';}})();`;
