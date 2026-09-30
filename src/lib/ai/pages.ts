// Which app page the user came to the assistant from. Only a fixed identifier leaves the
// browser — never the path itself, ids or query strings. No imports: unit tested by node --test.

/** The same list the API accepts (backend src/ai/product-knowledge.ts, AI_PAGES) */
export type AiPage =
  | "dashboard"
  | "events"
  | "event_new"
  | "event"
  | "event_santa"
  | "my_santa"
  | "profile"
  | "settings"
  | "ai";

const PAGES: [RegExp, AiPage][] = [
  [/^\/dashboard$/, "dashboard"],
  [/^\/events$/, "events"],
  [/^\/events\/new$/, "event_new"],
  [/^\/events\/[^/]+\/santa$/, "event_santa"],
  [/^\/events\/[^/]+$/, "event"],
  [/^\/my-santa$/, "my_santa"],
  [/^\/profile$/, "profile"],
  [/^\/settings$/, "settings"],
  [/^\/ai$/, "ai"],
];

/**
 * The event of an event page (/events/:id, /events/:id/santa) — only for reading what that
 * page already has in its cache on this device. It never goes to the assistant.
 */
export function eventIdOf(pathname: string | null | undefined): string | null {
  if (typeof pathname !== "string") return null;
  const match = pathname.match(
    /^\/events\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/santa)?\/*$/i,
  );
  return match ? match[1] : null;
}

/** A value from the URL (?from=) that is one of the page identifiers */
export function isAiPage(value: unknown): value is AiPage {
  return PAGES.some(([, page]) => page === value);
}

/** A pathname → its page; anything unknown (or not a path at all) → undefined */
export function aiPageOf(pathname: string | null | undefined): AiPage | undefined {
  if (typeof pathname !== "string") return undefined;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return PAGES.find(([pattern]) => pattern.test(path))?.[1];
}
