"use client";
import Link from "next/link";
import { PiArrowClockwiseBold, PiHouse } from "react-icons/pi";
import StatusScene from "@/components/pages/status/StatusScene";
import { useI18n } from "@/i18n/I18nProvider";

// A page of the signed-in area that failed to render: shown inside the app shell,
// so the sidebar and tab bar stay and the rest of the app is one click away.

export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { m } = useI18n();
  const t = m.status;
  return (
    <StatusScene
      layout="inline"
      title={t.errorTitle}
      text={t.errorText}
      actions={
        <>
          <button type="button" className="btn btn-primary btn-lg btn-glow" onClick={() => retry()}>
            <PiArrowClockwiseBold aria-hidden="true" />
            {t.retry}
          </button>
          <Link href="/dashboard" className="btn btn-glass btn-lg">
            <PiHouse aria-hidden="true" />
            {m.nav.dashboard}
          </Link>
        </>
      }
      footnote={error.digest ? t.errorCode(error.digest) : undefined}
    />
  );
}
