"use client";
import { type InfiniteData, type QueryClient, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { santaChatApi, type SantaChatPage, type SantaChatSummary } from "@/lib/api/santaChat";
import { addChatMessage } from "@/lib/chat/messages";
import type { SantaChatPayload, SantaChatRole } from "./messages";

/** One chat: my side of it in one event */
export const santaChatKey = (eventId: string, role: SantaChatRole) => ["santaChat", eventId, role] as const;
export const santaChatEventKey = (eventId: string) => ["santaChat", eventId] as const;
export const santaChatKeyRoot = ["santaChat"] as const;
/** My chats with messages — badges, "your Santa wrote" */
export const santaChatsKey = ["santaChats"] as const;

export type SantaChatData = InfiniteData<SantaChatPage, string | undefined>;

/**
 * My side of the Secret Santa chat in an event: the newest page first, older pages on
 * demand. Live messages arrive through RealtimeProvider (mergeSantaChatMessage); after
 * a reconnect it refetches from REST, and the merge skips anything already there.
 */
export function useSantaChat(eventId: string, role: SantaChatRole) {
  return useInfiniteQuery({
    queryKey: santaChatKey(eventId, role),
    queryFn: ({ pageParam }) => santaChatApi.open(eventId, role, pageParam),
    initialPageParam: undefined as string | undefined,
    // The oldest message loaded is the cursor for the page before it
    getNextPageParam: (last) => (last.hasMore ? last.messages[0]?.id : undefined),
    retry: false,
  });
}

/**
 * Read by the menu badge, My Secret Santa and the recipient's page at once. The socket
 * keeps it fresh (every message and read invalidates it), so a mount needn't refetch.
 */
export function useSantaChats() {
  return useQuery({ queryKey: santaChatsKey, queryFn: santaChatApi.list, staleTime: 60_000, retry: 1 });
}

/** Unread messages across my chats — the menu badge */
export const totalUnread = (chats: SantaChatSummary[] | undefined) =>
  (chats ?? []).reduce((sum, chat) => sum + chat.unread, 0);

/** Put a message into the cached chat (sent by me, or pushed over the socket) */
export function mergeSantaChatMessage(queryClient: QueryClient, { chatId, eventId, role, message }: SantaChatPayload) {
  queryClient.setQueryData<SantaChatData>(santaChatKey(eventId, role), (data) => {
    const next = addChatMessage(data, message);
    if (!next || next === data) return next;
    // The Santa's first message just opened the chat
    const [newest, ...older] = next.pages;
    return { ...next, pages: [{ ...newest, chatId }, ...older] };
  });
  // Unread counts and the list of chats come from the API
  void queryClient.invalidateQueries({ queryKey: santaChatsKey, exact: true });
}

export function useSendSantaChatMessage(eventId: string, role: SantaChatRole) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => santaChatApi.send(eventId, role, content),
    onSuccess: ({ chatId, message }) => mergeSantaChatMessage(queryClient, { chatId, eventId, role, message }),
  });
}

/** Everything the other side wrote is read: unread drops here and in the badges */
export function useMarkSantaChatRead(eventId: string, role: SantaChatRole) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => santaChatApi.read(eventId, role),
    onSuccess: (read) => {
      if (read === 0) return;
      clearUnread(queryClient, eventId, role);
    },
  });
}

/** Read here or in another tab: no unread left in this chat */
export function clearUnread(queryClient: QueryClient, eventId: string, role: SantaChatRole) {
  queryClient.setQueryData<SantaChatData>(santaChatKey(eventId, role), (data) =>
    data ? { ...data, pages: data.pages.map((page) => ({ ...page, unread: 0 })) } : data,
  );
  queryClient.setQueryData<SantaChatSummary[]>(santaChatsKey, (chats) =>
    chats?.map((chat) => (chat.eventId === eventId && chat.role === role ? { ...chat, unread: 0 } : chat)),
  );
}
