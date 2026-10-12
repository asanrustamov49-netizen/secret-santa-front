import type { ReactNode } from "react";
import { CARD_ICONS, CardChip, SOCIAL_CARD_SIZE, socialCard } from "@/lib/brand/socialCard";
import { fetchInvitePreview } from "@/lib/invites/preview";

// The card a chat app shows for an invite link: the event's name, its day, budget and how
// many have joined — so "join our Secret Santa" looks like an invitation, not a bare URL.
// Only what the public preview page shows anyone holding the link; no participant names.
// Numbers and dates only (no words), since the crawler's language is unknown.

export const alt = "Secret Santa invitation";
export const size = SOCIAL_CARD_SIZE;
export const contentType = "image/png";

const number = (value: number) => new Intl.NumberFormat("ru-RU").format(value).replace(/\s/g, " ");

function budget(min: number | null, max: number | null, currency: string): string | null {
  if (min != null && max != null) return min === max ? `${number(min)} ${currency}` : `${number(min)}–${number(max)} ${currency}`;
  if (max != null) return `≤ ${number(max)} ${currency}`;
  if (min != null) return `≥ ${number(min)} ${currency}`;
  return null;
}

/** 2026-12-24 → 24.12.2026 */
const day = (iso: string) => iso.split("-").reverse().join(".");

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const invite = await fetchInvitePreview(code);

  // Unknown or closed link: the plain brand card, never an error
  if (!invite) {
    return socialCard({ eyebrow: "Тайный Санта · Жашыруун Санта", title: "Secret Santa" });
  }

  const chips: { icon: ReactNode; text: string }[] = [];
  if (invite.eventDate) chips.push({ icon: CARD_ICONS.calendar, text: day(invite.eventDate) });
  const money = budget(invite.budgetMin, invite.budgetMax, invite.currency);
  if (money) chips.push({ icon: CARD_ICONS.wallet, text: money });
  chips.push({ icon: CARD_ICONS.people, text: number(invite.participantCount) });

  return socialCard({
    eyebrow: "Secret Santa · Тайный Санта",
    title: invite.name,
    // Signed like a card: the organizer's name, no words around it
    subtitle: `— ${invite.ownerName}`,
    footerText: chips.map((chip) => chip.text).join("") + invite.ownerName,
    footer: chips.map((chip) => (
      <CardChip key={chip.text} icon={chip.icon}>
        {chip.text}
      </CardChip>
    )),
  });
}
