// The mini assistant's suggestions: which questions fit the page the user is on.
// Keys of m.miniAi.quick; the question text itself is worded by the dictionary.
// No imports: unit tested by node --test.

export type QuickKey =
  | "howItWorks"
  | "createSanta"
  | "inviteFriends"
  | "whereRecipient"
  | "createEvent"
  | "joinEvent"
  | "eventSteps"
  | "whatNext"
  | "whoReady"
  | "whenDraw"
  | "eventChat"
  | "whatToGift"
  | "howWishlist"
  | "interests"
  | "fillWishlist"
  | "changeTheme"
  | "changeLanguage";

/** The same identifiers as lib/ai/pages.ts */
type Page =
  | "dashboard"
  | "events"
  | "event_new"
  | "event"
  | "event_santa"
  | "my_santa"
  | "profile"
  | "settings"
  | "ai";

/** What the event page shows about this event — already on screen, nothing more */
export interface EventHint {
  status: "open" | "drawn" | "completed";
  isOwner: boolean;
}

/** First visit: the basics, whatever the page */
export const ONBOARDING_QUICK: QuickKey[] = ["howItWorks", "createSanta", "inviteFriends", "whereRecipient"];

/**
 * Up to three suggestions for this page. On an event page they follow what the user can
 * actually do there: drawing names is the organizer's, and only before the draw.
 */
export function quickActionsFor(page: Page | undefined, event?: EventHint | null): QuickKey[] {
  switch (page) {
    case "dashboard":
      return ["createSanta", "inviteFriends", "howItWorks"];
    case "events":
      return ["createEvent", "joinEvent", "howItWorks"];
    case "event_new":
      return ["eventSteps", "inviteFriends", "howItWorks"];
    case "event": {
      if (!event) return ["whatNext", "howItWorks"];
      if (event.status === "open") {
        return event.isOwner ? ["whatNext", "whoReady", "whenDraw"] : ["whatNext", "whoReady", "fillWishlist"];
      }
      if (event.status === "drawn") return ["whatNext", "whatToGift", "eventChat"];
      return ["eventChat", "howItWorks"];
    }
    case "event_santa":
    case "my_santa":
      return ["whatToGift", "howWishlist", "whereRecipient"];
    case "profile":
      return ["interests", "fillWishlist", "howWishlist"];
    case "settings":
      return ["changeTheme", "changeLanguage", "howItWorks"];
    default:
      return ["howItWorks", "createSanta", "inviteFriends"];
  }
}
