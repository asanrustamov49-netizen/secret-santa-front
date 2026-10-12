import type { Metadata } from "next";
import Link from "next/link";
import { PiArrowLeftBold, PiTreeEvergreen } from "react-icons/pi";
import StatusScene from "@/components/pages/status/StatusScene";
import { getI18n } from "@/i18n/server";

// Every unknown address and every notFound(): the night sky, not Next's plain default.

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.meta.title(m.meta.notFound), robots: { index: false } };
}

export default async function NotFound() {
  const { m } = await getI18n();
  const t = m.status;
  return (
    <StatusScene
      code="404"
      logo={m.common.logo}
      title={t.notFoundTitle}
      text={t.notFoundText}
      actions={
        <>
          <Link href="/" className="btn btn-primary btn-lg btn-glow">
            <PiArrowLeftBold aria-hidden="true" />
            {t.home}
          </Link>
          <Link href="/events" className="btn btn-glass btn-lg">
            <PiTreeEvergreen aria-hidden="true" />
            {t.dashboard}
          </Link>
        </>
      }
    />
  );
}
