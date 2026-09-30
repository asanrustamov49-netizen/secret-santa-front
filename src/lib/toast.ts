"use client";
import { create } from "zustand";
import type { IconType } from "react-icons";
import type { Say } from "@/i18n/messages";

export type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  /** Worded by the Toaster from the current dictionary, so a toast on screen follows a language switch */
  message: Say;
  tone: ToastTone;
  /** A festive icon instead of the tone's default (a gift for the draw…) — never an emoji in the text */
  icon?: IconType;
}

interface ToastStore {
  toasts: Toast[];
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToasts = create<ToastStore>((set) => ({
  toasts: [],
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/** Short confirmation at the bottom of the screen: toast((m) => m.events.invite.copied) */
export function toast(message: Say, tone: ToastTone = "success", icon?: IconType) {
  const id = nextId++;
  useToasts.setState((state) => ({ toasts: [...state.toasts.slice(-2), { id, message, tone, icon }] }));
  setTimeout(() => useToasts.getState().dismiss(id), 3200);
}
