"use client";
import { useSyncExternalStore } from "react";
import { create } from "zustand";

interface CommandPaletteStore {
  open: boolean;
  /** Bumped on every opening: the palette's body remounts, so it starts with an empty query */
  session: number;
  /**
   * Closing for a navigation: no fade-out. The page transition snapshots the screen right
   * away, and a half-faded palette would be frozen into it.
   */
  instant: boolean;
}

export const useCommandPalette = create<CommandPaletteStore>(() => ({ open: false, session: 0, instant: false }));

export const openCommandPalette = () =>
  useCommandPalette.setState((state) => ({ open: true, session: state.session + 1, instant: false }));

export const closeCommandPalette = (options?: { instant?: boolean }) =>
  useCommandPalette.setState({ open: false, instant: Boolean(options?.instant) });

export const toggleCommandPalette = () =>
  useCommandPalette.getState().open ? closeCommandPalette() : openCommandPalette();

/** The palette's shortcut, the way this keyboard writes it: ⌘ on Apple devices, Ctrl elsewhere */
export function useModifierKey(): "⌘" | "Ctrl" {
  return useSyncExternalStore(
    () => () => {},
    () => (/Mac|iPhone|iPad|iPod/.test(navigator.platform) ? "⌘" : "Ctrl"),
    () => "Ctrl",
  );
}
