"use client";
import { useRealtimeStatus } from "@/lib/realtime/useRealtime";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./realtimeStatus.module.scss";

/**
 * A quiet "live" dot for pages that update by themselves. When the connection drops,
 * it says so — the page still works through the API, it just won't refresh on its own.
 */
const RealtimeStatus = ({ className }: { className?: string }) => {
  const status = useRealtimeStatus();
  const { m } = useI18n();
  if (status === "idle") return null;

  return (
    <span className={`${scss.status} ${scss[status]} ${className ?? ""}`} role="status" title={m.realtime.label}>
      <span className={scss.dot} aria-hidden="true" />
      {m.realtime[status]}
    </span>
  );
};

export default RealtimeStatus;
