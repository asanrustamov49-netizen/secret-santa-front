"use client";
import { useCallback, useSyncExternalStore } from "react";

// The mini assistant's memory on this device, per account (two people sharing a browser
// never see each other's chat — and the API would answer 404 for someone else's anyway):
//   mini-ai:conversation:<userId> — the conversation it continues
//   mini-ai:onboarded:<userId>    — the first-visit welcome was shown (or dismissed)
// Nothing here goes to the database: a new device simply starts fresh.

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // storage blocked (private mode): works for this visit only
  }
  notify();
}

const conversationKey = (userId: string) => `mini-ai:conversation:${userId}`;
const onboardedKey = (userId: string) => `mini-ai:onboarded:${userId}`;

/** The conversation the mini assistant continues; null = none yet */
export function useMiniConversation(userId: string) {
  const id = useSyncExternalStore(
    subscribe,
    () => read(conversationKey(userId)),
    () => null,
  );
  const setId = useCallback((next: string | null) => write(conversationKey(userId), next), [userId]);
  return [id, setId] as const;
}

/** Whether this person has already seen (or dismissed) the first-visit welcome here */
export function useMiniOnboarded(userId: string) {
  // Server render and hydration: "already onboarded", so nothing pops up before the real value is read
  const onboarded = useSyncExternalStore(
    subscribe,
    () => read(onboardedKey(userId)) === "1",
    () => true,
  );
  const markOnboarded = useCallback(() => write(onboardedKey(userId), "1"), [userId]);
  return [onboarded, markOnboarded] as const;
}
