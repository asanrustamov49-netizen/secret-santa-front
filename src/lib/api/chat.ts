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

export const chatApi = {
  /** before: the id of the oldest message already loaded — the page just before it */
  list: (eventId: string, before?: string) =>
    api
      .get<ChatPage>(`/events/${eventId}/messages`, { params: before ? { before } : undefined })
      .then((r) => r.data),

  send: (eventId: string, content: string) =>
    api.post<{ message: ChatMessage }>(`/events/${eventId}/messages`, { content }).then((r) => r.data.message),
};
