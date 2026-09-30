"use client";
import { useCallback, useSyncExternalStore } from "react";
import { type InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi, type ChatPage } from "@/lib/api/chat";
import { addChatMessage, type ChatMessage } from "./messages";

/** Its own key (not under ["events", id]): event mutations don't need to refetch the chat */
export const chatKey = (eventId: string) => ["eventChat", eventId] as const;
export const chatKeyRoot = ["eventChat"] as const;

export type ChatData = InfiniteData<ChatPage, string | undefined>;

/**
 * The event chat: the newest page first, older pages on demand. Live messages arrive
 * through RealtimeProvider (mergeChatMessage); after a reconnect it refetches from REST.
 * `enabled`: only once names are drawn — the API answers 409 before that.
 */
export function useEventChat(eventId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: chatKey(eventId),
    queryFn: ({ pageParam }) => chatApi.list(eventId, pageParam),
    initialPageParam: undefined as string | undefined,
    // The oldest message loaded is the cursor for the page before it
    getNextPageParam: (last) => (last.hasMore ? last.messages[0]?.id : undefined),
    enabled,
    retry: false,
  });
}

/** Put a message into the cached chat (sent by me, or pushed over the socket) */
export function mergeChatMessage(queryClient: ReturnType<typeof useQueryClient>, message: ChatMessage) {
  queryClient.setQueryData<ChatData>(chatKey(message.eventId), (data) => addChatMessage(data, message));
}

export function useSendChatMessage(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => chatApi.send(eventId, content),
    onSuccess: (message) => mergeChatMessage(queryClient, message),
  });
}

// ─── "Read up to" — per event, on this device ───────────────────────

const readKey = (eventId: string) => `chat-read:${eventId}`;
const readListeners = new Set<() => void>();

export function readLastRead(eventId: string): string | null {
  try {
    return localStorage.getItem(readKey(eventId));
  } catch {
    return null; // storage blocked: nothing is marked as new
  }
}

function subscribeLastRead(listener: () => void) {
  readListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    readListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** When I last saw this chat to the end (ISO time of the newest message then), and a setter */
export function useChatLastRead(eventId: string) {
  const lastRead = useSyncExternalStore(
    subscribeLastRead,
    () => readLastRead(eventId),
    () => null,
  );
  const markRead = useCallback(
    (createdAt: string) => {
      const current = readLastRead(eventId);
      if (current && current >= createdAt) return;
      try {
        localStorage.setItem(readKey(eventId), createdAt);
      } catch {
        // storage blocked — fine, the chat still works
      }
      readListeners.forEach((listener) => listener());
    },
    [eventId],
  );
  return [lastRead, markRead] as const;
}
