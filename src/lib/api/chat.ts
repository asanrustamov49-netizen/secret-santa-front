import { api } from "./client";
import type { ChatMessage } from "@/lib/chat/messages";

export type { ChatMessage } from "@/lib/chat/messages";

/** Mirrors the API limit (SendChatMessageDto) */
export const MAX_CHAT_MESSAGE_LENGTH = 1000;

/** A page of messages, oldest first; hasMore: there are older ones before it */
export interface ChatPage {
  messages: ChatMessage[];
  hasMore: boolean;
}

/** Unread messages by others in one event chat */
export interface ChatUnread {
  eventId: string;
  eventName: string;
  unread: number;
}

export const chatApi = {
  /** before: the id of the oldest message already loaded — the page just before it */
  list: (eventId: string, before?: string) =>
    api
      .get<ChatPage>(`/events/${eventId}/messages`, { params: before ? { before } : undefined })
      .then((r) => r.data),

  send: (eventId: string, content: string) =>
    api.post<{ message: ChatMessage }>(`/events/${eventId}/messages`, { content }).then((r) => r.data.message),

  /** I've read this chat up to now (kept by the API: the same badge on every device) */
  read: (eventId: string) => api.post(`/events/${eventId}/messages/read`).then(() => undefined),

  /** Unread counts per event chat of mine that has any */
  unread: () => api.get<{ chats: ChatUnread[] }>("/chats/unread").then((r) => r.data.chats),
};
