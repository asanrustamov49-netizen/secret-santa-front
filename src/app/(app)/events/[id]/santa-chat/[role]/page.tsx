import { notFound } from "next/navigation";
import { pageTitle } from "@/i18n/server";
import SantaChat from "@/components/pages/santaChat/SantaChat";
import { isSantaChatRole } from "@/lib/santaChat/messages";

export const generateMetadata = pageTitle("santaChat");

/** /events/:id/santa-chat/sender (I'm the Santa) · /recipient (my Santa writes to me) */
export default async function SantaChatPage({ params }: PageProps<"/events/[id]/santa-chat/[role]">) {
  const { id, role } = await params;
  if (!isSantaChatRole(role)) notFound();
  return <SantaChat eventId={id} role={role} />;
}
