import { SOCIAL_CARD_SIZE, socialCard } from "@/lib/brand/socialCard";

// The site's social preview (links to any page without a card of its own). Prerendered at
// build time. Language-neutral on purpose: the crawler's language is unknown, so the card
// carries the product's name in all three of its languages.

export const alt = "Secret Santa";
export const size = SOCIAL_CARD_SIZE;
export const contentType = "image/png";

export default function Image() {
  return socialCard({
    eyebrow: "Тайный Санта · Жашыруун Санта",
    title: "Secret Santa",
    subtitle: "Draw names · Share wishlists · Gift in secret",
    brandRow: false,
  });
}
