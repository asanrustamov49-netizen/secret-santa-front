import { api } from "./client";
import type { EventStatus } from "./events";
import type { SantaChatMessage, SantaChatRole } from "@/lib/santaChat/messages";

export type { SantaChatMessage, SantaChatRole } from "@/lib/santaChat/messages";

/**
 * My side of a Secret Santa chat and a page of it (oldest first). `recipient` comes
 * only to the Santa; the recipient's view has nothing about the Santa at all.
 */
export interface SantaChatPage {
  /** null until the Santa's first message */
  chatId: string | null;
  role: SantaChatRole;
  event: { id: string; name: string; status: EventStatus };
  messages: SantaChatMessage[];
  hasMore: boolean;
  /** Messages from the other side I haven't read */
  unread: number;
  recipient?: { name: string; avatarUrl: string | null; interests: string[] };
}

/** One of my chats with messages in it — for badges and "your Santa wrote" */
export interface SantaChatSummary {
  chatId: string;
  eventId: string;
  eventName: string;
  status: EventStatus;
  role: SantaChatRole;
  unread: number;
  lastMessageAt: string;
}

const chatPath = (eventId: string, role: SantaChatRole) => `/events/${eventId}/santa-chat/${role}`;

export const santaChatApi = {
  list: () => api.get<{ chats: SantaChatSummary[] }>("/santa-chats").then((r) => r.data.chats),

  /** before: the id of the oldest message already loaded — the page just before it */
  open: (eventId: string, role: SantaChatRole, before?: string) =>
    api.get<SantaChatPage>(chatPath(eventId, role), { params: before ? { before } : undefined }).then((r) => r.data),

  send: (eventId: string, role: SantaChatRole, content: string) =>
    api
      .post<{ chatId: string; message: SantaChatMessage }>(`${chatPath(eventId, role)}/messages`, { content })
      .then((r) => r.data),

  read: (eventId: string, role: SantaChatRole) =>
    api.post<{ read: number }>(`${chatPath(eventId, role)}/read`).then((r) => r.data.read),
};
