import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { fetchInvitePreview } from "@/lib/invites/preview";
import JoinEvent from "@/components/pages/join/JoinEvent";

// The title and description chat apps show next to the invite card (opengraph-image.tsx):
// "You're invited to “Office Santa”" instead of a generic page name. Never indexed —
// an invite code in a search result would be an open door.
export async function generateMetadata({ params }: PageProps<"/join/[code]">): Promise<Metadata> {
  const [{ code }, { m }] = await Promise.all([params, getI18n()]);
  const invite = await fetchInvitePreview(code);
  const robots = { index: false, follow: false };
  if (!invite) return { title: m.meta.title(m.meta.invited), robots };

  const title = m.join.shareTitle(invite.name);
  const description = m.join.shareDescription(invite.ownerName);
  return {
    title: m.meta.title(title),
    description,
    robots,
    openGraph: { title, description, type: "website", siteName: m.common.logo },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function JoinEventPage() {
  return <JoinEvent />;
}
