import { cache } from "react";
import { apiUrl } from "@/lib/site";

// Server only: the public invite preview (GET /api/invites/:code — what anyone holding the
// link already sees on /join/<code>), for the page's title and its social preview card.

export interface InvitePreviewData {
  name: string;
  eventDate: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  status: "open" | "drawn" | "completed";
  ownerName: string;
  participantCount: number;
}

/** Same shape the API's InviteCodePipe accepts; anything else is never sent */
const CODE = /^[A-Za-z0-9_-]{6,32}$/;

/**
 * The preview, or null for an unknown code or an unreachable API — a link preview must
 * never fail the page. Cached for a few minutes: a chat app may fetch the card many times.
 */
export const fetchInvitePreview = cache(async (code: string): Promise<InvitePreviewData | null> => {
  if (!CODE.test(code)) return null;
  try {
    const res = await fetch(`${apiUrl()}/api/invites/${code}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const { invite } = (await res.json()) as { invite?: InvitePreviewData };
    return invite && typeof invite.name === "string" ? invite : null;
  } catch {
    return null;
  }
});
