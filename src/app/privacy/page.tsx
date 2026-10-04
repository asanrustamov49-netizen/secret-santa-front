import type { Metadata } from "next";
import LegalPage from "@/components/pages/legal/LegalPage";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return {
    title: m.meta.title(m.privacy.title),
    description: m.privacy.description,
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPolicyPage() {
  const { m } = await getI18n();
  return <LegalPage doc={m.privacy} other={{ href: "/terms", label: m.terms.title }} />;
}
