"use client";
import { useCallback, useSyncExternalStore } from "react";
import {
  type InfiniteData,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { chatApi, type ChatPage, type ChatUnread } from "@/lib/api/chat";
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

// ─── Unread, kept by the API ────────────────────────────────────────
// The badge counts: what others wrote since I last read each chat (on any device).
// A pushed message raises its count at once; reading a chat (here or in another tab,
// via chat:read) clears it; a reconnect refetches it from REST.

export const chatUnreadKey = ["chatUnread"] as const;

export function useChatUnread() {
  return useQuery({ queryKey: chatUnreadKey, queryFn: chatApi.unread, staleTime: 60_000, retry: 1 });
}

/** Unread across all my event chats — the menu badge */
export const totalChatUnread = (chats: ChatUnread[] | undefined) =>
  (chats ?? []).reduce((sum, chat) => sum + chat.unread, 0);

/** Someone else wrote in this event's chat */
export function bumpChatUnread(queryClient: QueryClient, eventId: string) {
  const chats = queryClient.getQueryData<ChatUnread[]>(chatUnreadKey);
  if (!chats?.some((chat) => chat.eventId === eventId)) {
    // Not in the list yet: the API adds it (with the event's name)
    void queryClient.invalidateQueries({ queryKey: chatUnreadKey, exact: true });
    return;
  }
  queryClient.setQueryData<ChatUnread[]>(chatUnreadKey, (list) =>
    list?.map((chat) => (chat.eventId === eventId ? { ...chat, unread: chat.unread + 1 } : chat)),
  );
}

export function clearChatUnread(queryClient: QueryClient, eventId: string) {
  queryClient.setQueryData<ChatUnread[]>(chatUnreadKey, (chats) => chats?.filter((chat) => chat.eventId !== eventId));
}

/** Tell the API this chat is read up to now */
export function useMarkChatReadOnServer(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => chatApi.read(eventId),
    onSuccess: () => clearChatUnread(queryClient, eventId),
  });
}

// ─── "Read up to" — per event, on this device ───────────────────────
// Where the "New messages" divider goes when the chat opens.

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
