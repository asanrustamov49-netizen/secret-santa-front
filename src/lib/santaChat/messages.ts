// The anonymous Secret Santa chat: its vocabulary and the checks on what arrives over
// the socket. No imports: unit tested by node --test.
//
// A message is only ever "mine / not mine" — the API never sends who wrote it, and
// nothing here keeps a field it didn't expect: a payload is copied field by field,
// so even a malformed one can't put anything else into the cache or the screen.

/** sender — I'm the Santa (I know who I write to) · recipient — my Santa writes to me */
export type SantaChatRole = "sender" | "recipient";

export interface SantaChatMessage {
  id: string;
  content: string;
  /** ISO timestamp */
  createdAt: string;
  isMine: boolean;
}

/** santa-chat:message — my own copy of a new message, worded for my side */
export interface SantaChatPayload {
  chatId: string;
  eventId: string;
  role: SantaChatRole;
  message: SantaChatMessage;
}

/** santa-chat:read — I read this chat in another tab */
export interface SantaChatReadPayload {
  eventId: string;
  role: SantaChatRole;
}

export const SANTA_CHAT_MESSAGE_EVENT = "santa-chat:message";
export const SANTA_CHAT_READ_EVENT = "santa-chat:read";

export function isSantaChatRole(value: unknown): value is SantaChatRole {
  return value === "sender" || value === "recipient";
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

/** A clean copy of a santa-chat:message payload, or null for anything malformed */
export function parseSantaChatPayload(payload: unknown): SantaChatPayload | null {
  if (!isObject(payload) || !isObject(payload.message)) return null;
  const { chatId, eventId, role, message } = payload as Record<string, unknown> & { message: Record<string, unknown> };
  if (typeof chatId !== "string" || typeof eventId !== "string" || !isSantaChatRole(role)) return null;
  const { id, content, createdAt, isMine } = message;
  if (typeof id !== "string" || typeof content !== "string" || typeof createdAt !== "string" || typeof isMine !== "boolean") {
    return null;
  }
  return { chatId, eventId, role, message: { id, content, createdAt, isMine } };
}

export function parseSantaChatRead(payload: unknown): SantaChatReadPayload | null {
  if (!isObject(payload)) return null;
  const { eventId, role } = payload;
  if (typeof eventId !== "string" || !isSantaChatRole(role)) return null;
  return { eventId, role };
}

/** The chat page for my side of it — nothing in the URL but the event and my own role */
export const santaChatPath = (eventId: string, role: SantaChatRole) => `/events/${eventId}/santa-chat/${role}`;

/**
 * Where "New messages" starts: the earliest of the last `unread` messages the other
 * side wrote. -1 = nothing unread.
 */
export function firstUnreadIndex(messages: SantaChatMessage[], unread: number): number {
  if (unread <= 0) return -1;
  let left = unread;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].isMine) continue;
    left--;
    if (left === 0) return i;
  }
  // Fewer loaded than unread (older page not loaded): the first loaded message from them
  return messages.findIndex((message) => !message.isMine);
}
