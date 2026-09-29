"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PiCalendarBlankBold, PiGiftFill, PiTreeEvergreenFill } from "react-icons/pi";
import type { SantaEvent } from "@/lib/api/events";
import { daysUntil, daysUntilNewYear, formatDay, timeUntilDay } from "@/lib/events/format";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./dashboard.module.scss";

interface CountdownCardProps {
  /** Active (not completed) events */
  events: SantaEvent[];
  isPending: boolean;
  isError: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Real countdown to the nearest gift-exchange day. No date anywhere → says so, no fake timer. */
const CountdownCard = ({ events, isPending, isError }: CountdownCardProps) => {
  const [now, setNow] = useState(() => Date.now());
  const { m, locale } = useI18n();
  const t = m.dashboard.countdown;

  // Minutes are the smallest unit shown — a 30 s tick is plenty and cheap
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const upcoming = events
    .filter((e): e is SantaEvent & { eventDate: string } => Boolean(e.eventDate) && daysUntil(e.eventDate!) >= 0)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))[0];

  const newYear = daysUntilNewYear();
  const newYearLine = (
    <p className={scss.countdownFoot}>
      <PiTreeEvergreenFill aria-hidden="true" />
      {newYear === 0 ? t.happyNewYear : t.untilNewYear(newYear)}
    </p>
  );

  let body: React.ReactNode;

  if (isPending) {
    body = (
      <div aria-busy="true" aria-label={t.loading}>
        <span className={`${scss.skel} ${scss.skelKicker}`} />
        <span className={`${scss.skel} ${scss.skelDigits}`} />
      </div>
    );
  } else if (isError) {
    body = <p className={scss.countdownEmpty}>{t.unavailable}</p>;
  } else if (!upcoming) {
    const undated = events.find((e) => !e.eventDate);
    body = (
      <>
        <p className={scss.countdownLabel}>
          <PiCalendarBlankBold aria-hidden="true" /> {t.title}
        </p>
        <p className={scss.countdownEmpty}>
          {events.length === 0
            ? t.noEvents
            : t.noDates}
        </p>
        {undated?.isOwner && (
          <Link href={`/events/${undated.id}`} className={scss.textLink}>
            {t.setDate(undated.name)}
          </Link>
        )}
      </>
    );
  } else {
    const left = timeUntilDay(upcoming.eventDate, now);
    body = (
      <>
        {/* Label says "event" up front, the name sits below the digits — so the big
            number can't be misread as the New Year countdown further down */}
        <p className={scss.countdownLabel}>
          <PiCalendarBlankBold aria-hidden="true" /> {left ? t.eventIn : upcoming.name}
        </p>
        {left ? (
          <>
            <div
              className={scss.digits}
              role="timer"
              aria-label={t.timerLabel(left.days, left.hours, left.minutes, upcoming.name)}
            >
              {[
                { key: "days", value: left.days, unit: t.days(left.days) },
                { key: "hours", value: left.hours, unit: t.hours(left.hours) },
                { key: "minutes", value: left.minutes, unit: t.minutes(left.minutes) },
              ].map(({ key, value, unit }) => (
                <div key={key} className={scss.digit}>
                  <span className={scss.digitValue}>{pad(value)}</span>
                  <span className={scss.digitUnit}>{unit}</span>
                </div>
              ))}
            </div>
            <p className={scss.countdownDate}>
              <strong>{upcoming.name}</strong> · {formatDay(upcoming.eventDate, locale)}
            </p>
          </>
        ) : (
          <div className={scss.giftDay}>
            <PiGiftFill aria-hidden="true" />
            <p>{t.giftDay}</p>
          </div>
        )}
      </>
    );
  }

  return (
    <section className={`surface-card ${scss.countdownCard}`} aria-label={t.label}>
      {body}
      {!isPending && newYearLine}
    </section>
  );
};

export default CountdownCard;
