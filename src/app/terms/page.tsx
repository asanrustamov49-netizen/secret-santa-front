import type { Metadata } from "next";
import LegalPage from "@/components/pages/legal/LegalPage";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return {
    title: m.meta.title(m.terms.title),
    description: m.terms.description,
    robots: { index: true, follow: true },
  };
}

export default async function TermsPage() {
  const { m } = await getI18n();
  return <LegalPage doc={m.terms} other={{ href: "/privacy", label: m.privacy.title }} />;
}
