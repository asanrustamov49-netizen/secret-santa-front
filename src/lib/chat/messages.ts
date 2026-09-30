// The event chat's cache and "unread" logic. No imports: unit tested by node --test.
//
// REST is the source of truth: pages come from GET /events/:id/messages, and a message
// pushed over the socket is only merged into what is already cached (deduplicated by id,
// so my own message coming back from the socket never shows twice).

export interface ChatMessage {
  id: string;
  eventId: string;
  content: string;
  /** ISO timestamp */
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
}

export interface ChatPageLike {
  messages: ChatMessage[];
  hasMore: boolean;
}

/** React Query's infinite data: pages[0] is the newest page, each page oldest first */
export interface ChatPages<Page extends ChatPageLike = ChatPageLike> {
  pages: Page[];
  pageParams: unknown[];
}

/** A well-formed chat:message payload for this shape — anything else is ignored */
export function isChatMessagePayload(payload: unknown): payload is { eventId: string; message: ChatMessage } {
  if (typeof payload !== "object" || payload === null) return false;
  const { eventId, message } = payload as { eventId?: unknown; message?: unknown };
  if (typeof eventId !== "string" || typeof message !== "object" || message === null) return false;
  const m = message as Partial<ChatMessage>;
  return (
    typeof m.id === "string" &&
    m.eventId === eventId &&
    typeof m.content === "string" &&
    typeof m.createdAt === "string" &&
    typeof m.author === "object" &&
    m.author !== null &&
    typeof m.author.id === "string" &&
    typeof m.author.name === "string"
  );
}

/** The newest page with this message added in order — unchanged if it's already there */
export function addChatMessage<Data extends ChatPages>(data: Data | undefined, message: ChatMessage): Data | undefined {
  if (!data || data.pages.length === 0) return data;
  if (data.pages.some((page) => page.messages.some((known) => known.id === message.id))) return data;
  const [newest, ...older] = data.pages;
  const messages = [...newest.messages, message].sort(byTime);
  return { ...data, pages: [{ ...newest, messages }, ...older] };
}

/** All loaded messages, oldest first */
export function flattenChat(data: ChatPages | undefined): ChatMessage[] {
  if (!data) return [];
  return [...data.pages].reverse().flatMap((page) => page.messages);
}

const byTime = (a: ChatMessage, b: ChatMessage) =>
  a.createdAt === b.createdAt ? 0 : a.createdAt < b.createdAt ? -1 : 1;

/**
 * Where "New messages" starts: the first message from someone else written after I last
 * read the chat. -1 = nothing new (or never opened: the first visit isn't a wall of "new").
 */
export function firstUnreadIndex(messages: ChatMessage[], lastReadAt: string | null, myId: string): number {
  if (!lastReadAt) return -1;
  return messages.findIndex((message) => message.author.id !== myId && message.createdAt > lastReadAt);
}

export function unreadCount(messages: ChatMessage[], lastReadAt: string | null, myId: string): number {
  const first = firstUnreadIndex(messages, lastReadAt, myId);
  if (first === -1) return 0;
  return messages.slice(first).filter((message) => message.author.id !== myId).length;
}
