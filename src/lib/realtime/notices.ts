"use client";
import { create } from "zustand";
import type { ChatMessage } from "@/lib/chat/messages";
import type { SantaChatPayload, SantaChatRole } from "@/lib/santaChat/messages";

/**
 * "You have a new message" — one notice per chat, kept until it is answered or closed
 * (so it is still there when the user comes back to a background tab). Fed by the one
 * realtime connection (RealtimeProvider); memory only, nothing is stored.
 *
 * A Secret Santa notice holds what that side's socket copy had: the event, my role,
 * the text — never who wrote it. An event chat notice holds what every participant
 * of the event reads anyway: the author's name and the text.
 */
export type ChatNotice =
  | { kind: "santa"; key: string; eventId: string; role: SantaChatRole; preview: string; count: number }
  | { kind: "event"; key: string; eventId: string; author: string; preview: string; count: number };

interface NoticeStore {
  notices: ChatNotice[];
  /** The chat open on screen right now — it gets no notice of its own */
  activeChat: string | null;
}

export const useChatNotices = create<NoticeStore>(() => ({ notices: [], activeChat: null }));

/** At most this many notices at once: the newest ones */
const MAX_NOTICES = 3;

export const santaNoticeKey = (eventId: string, role: SantaChatRole) => `santa:${eventId}:${role}`;
export const eventNoticeKey = (eventId: string) => `event:${eventId}`;

type NewNotice = ChatNotice extends infer N ? (N extends ChatNotice ? Omit<N, "count"> : never) : never;

/** One card per chat: a newer message replaces its preview and raises the count */
function push(notice: NewNotice) {
  useChatNotices.setState((state) => {
    if (state.activeChat === notice.key) return state;
    const known = state.notices.find((n) => n.key === notice.key);
    const next = { ...notice, count: (known?.count ?? 0) + 1 } as ChatNotice;
    return { notices: [...state.notices.filter((n) => n.key !== notice.key), next].slice(-MAX_NOTICES) };
  });
}

/** A Secret Santa message from the other side */
export function noticeSantaMessage({ eventId, role, message }: SantaChatPayload) {
  if (message.isMine) return;
  push({ kind: "santa", key: santaNoticeKey(eventId, role), eventId, role, preview: message.content });
}

/** An event chat message from someone else */
export function noticeEventMessage(message: ChatMessage, myId: string) {
  if (message.author.id === myId) return;
  const { eventId } = message;
  push({ kind: "event", key: eventNoticeKey(eventId), eventId, author: message.author.name, preview: message.content });
}

export function dismissNotice(key: string) {
  useChatNotices.setState((state) => ({ notices: state.notices.filter((notice) => notice.key !== key) }));
}

/** A chat is open on screen: its notice goes, and no new one shows while it stays open */
export function setActiveChat(key: string): () => void {
  dismissNotice(key);
  useChatNotices.setState({ activeChat: key });
  return () => {
    if (useChatNotices.getState().activeChat === key) useChatNotices.setState({ activeChat: null });
  };
}

/** Is this chat on screen? (Its unread then clears by itself) */
export const isActiveChat = (key: string) => useChatNotices.getState().activeChat === key;

/** Signed out: nothing left behind */
export function clearNotices() {
  useChatNotices.setState({ notices: [], activeChat: null });
}
