import type { Metadata } from "next";
import LegalPage from "@/components/pages/legal/LegalPage";
import { getI18n } from "@/i18n/server";
import { getLegal } from "@/i18n/legal";

export async function generateMetadata(): Promise<Metadata> {
  const [{ m }, legal] = await Promise.all([getI18n(), getLegal()]);
  return {
    title: m.meta.title(legal.terms.title),
    description: legal.terms.description,
    robots: { index: true, follow: true },
  };
}

export default async function TermsPage() {
  const legal = await getLegal();
  return <LegalPage doc={legal.terms} other={{ href: "/privacy", label: legal.privacy.title }} />;
}
