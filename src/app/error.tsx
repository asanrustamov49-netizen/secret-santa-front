"use client";
import Link from "next/link";
import { PiArrowClockwiseBold, PiHouse } from "react-icons/pi";
import StatusScene from "@/components/pages/status/StatusScene";
import { useI18n } from "@/i18n/I18nProvider";

// A page that failed to render (public pages; the signed-in area has its own, inside the shell).
// Server errors arrive with a digest only — never their message — which people can quote to us.

export default function RouteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { m } = useI18n();
  const t = m.status;
  return (
    <StatusScene
      logo={m.common.logo}
      title={t.errorTitle}
      text={t.errorText}
      actions={
        <>
          <button type="button" className="btn btn-primary btn-lg btn-glow" onClick={() => retry()}>
            <PiArrowClockwiseBold aria-hidden="true" />
            {t.retry}
          </button>
          <Link href="/" className="btn btn-glass btn-lg">
            <PiHouse aria-hidden="true" />
            {t.home}
          </Link>
        </>
      }
      footnote={error.digest ? t.errorCode(error.digest) : undefined}
    />
  );
}
