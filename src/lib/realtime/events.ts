// The realtime vocabulary (mirrors backend src/realtime/realtime.events.ts) and what each
// message means for the page. No imports: unit tested by node --test.
//
// A message never carries data — only which event changed. The page then refetches
// through the REST API, which decides what this user may see.

export const REALTIME_EVENTS = [
  "event:participant_joined",
  "event:participant_left",
  "event:participant_updated",
  "event:wishlist_updated",
  "event:updated",
  "event:draw_completed",
  "event:completed",
  "event:deleted",
  "event:removed",
  "match:revealed",
] as const;

export type RealtimeEventName = (typeof REALTIME_EVENTS)[number];

/**
 * The single message that carries data (backend ChatRealtimeEvent): a new chat message,
 * exactly as GET /events/:id/messages returns it. Merged into the chat cache, nothing else.
 */
export const CHAT_MESSAGE_EVENT = "chat:message";

export interface RealtimePayload {
  eventId: string;
}

/**
 * Cached data a message makes stale:
 * events — my events list · event — this event + its participants · match — my match here
 * myMatches — "My Secret Santa" across events
 */
export type RealtimeTarget = "events" | "event" | "match" | "myMatches";

const TARGETS: Record<RealtimeEventName, RealtimeTarget[]> = {
  // Counts, the participants list, readiness
  "event:participant_joined": ["event", "events"],
  "event:participant_left": ["event", "events"],
  // Readiness — and, for their Santa, the recipient's name, interests or wishlist
  "event:participant_updated": ["event", "events", "match", "myMatches"],
  "event:wishlist_updated": ["event", "events", "match"],
  // Name, date, budget ("fits the budget" on the Santa page)
  "event:updated": ["event", "events", "match"],
  // The status changes; my own match now exists (fetched through the API)
  "event:draw_completed": ["event", "events", "match", "myMatches"],
  "event:completed": ["event", "events", "myMatches"],
  // Gone for me: the refetch answers 404 and the page says so
  "event:deleted": ["event", "events", "match", "myMatches"],
  "event:removed": ["event", "events", "match", "myMatches"],
  "match:revealed": ["match", "events", "myMatches"],
};

export function isRealtimeEvent(name: unknown): name is RealtimeEventName {
  return typeof name === "string" && (REALTIME_EVENTS as readonly string[]).includes(name);
}

/** A well-formed payload: exactly an event id (anything else is ignored) */
export function isRealtimePayload(payload: unknown): payload is RealtimePayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as { eventId?: unknown }).eventId === "string"
  );
}

export function targetsFor(name: RealtimeEventName): RealtimeTarget[] {
  return TARGETS[name];
}

/** Connection state, for the small indicator */
export type RealtimeStatus = "idle" | "connecting" | "connected" | "reconnecting" | "offline";
