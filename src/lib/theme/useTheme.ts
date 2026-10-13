"use client";
import { useEffect, useSyncExternalStore } from "react";
import { useUpdatePreferences } from "@/lib/account/usePreferences";
import { useSession, useSessionHint } from "@/lib/auth/useSession";
import {
  readPreference,
  setPreference as applyPreference,
  subscribe,
  type ThemeOrigin,
  type ThemePreference,
} from "./theme";

// Server render always assumes "system"; the real value is read right after hydration.
const getServerSnapshot = (): ThemePreference => "system";

/**
 * The theme choice. localStorage stays the instant local copy (the <head> script
 * paints with it, so no flash); for a signed-in user the choice is also saved to
 * the account. A failed save changes nothing on screen — the theme stays applied.
 */
export function useTheme() {
  const preference = useSyncExternalStore(subscribe, readPreference, getServerSnapshot);
  const { data: user } = useSession({ enabled: useSessionHint() });
  const save = useUpdatePreferences();

  /** origin: the click that asked for it — the new theme spreads from there */
  const setPreference = (next: ThemePreference, origin?: ThemeOrigin) => {
    applyPreference(next, origin);
    if (user) save.mutate({ themePreference: next });
  };

  return { preference, setPreference };
}

/**
 * Mounted once (root layout): the account's theme is the source of truth. When
 * /auth/me brings a value that differs from this browser's copy — first visit on
 * a new device, or a change made elsewhere — it is applied and stored locally.
 * Runs only when the server value changes, never on a local pick.
 */
export function useServerThemeSync() {
  const { data: user } = useSession({ enabled: useSessionHint() });
  const serverTheme = user?.themePreference;

  useEffect(() => {
    if (serverTheme && serverTheme !== readPreference()) applyPreference(serverTheme);
  }, [serverTheme]);
}
