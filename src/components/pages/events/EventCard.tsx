import Link from "next/link";
import { PiCalendarBlank, PiCrownSimpleFill, PiSparkleFill, PiUsersThree, PiWallet } from "react-icons/pi";
import type { SantaEvent } from "@/lib/api/events";
import { daysUntil, formatBudget, formatDay, relativeDay } from "@/lib/events/format";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./events.module.scss";

/** A whole-card link to the event, with what matters at a glance */
const EventCard = ({ event }: { event: SantaEvent }) => {
  const { m, locale } = useI18n();
  const t = m.events.card;
  const budget = formatBudget(event.budgetMin, event.budgetMax, locale);
  const readyShare = event.participantCount ? event.readyCount / event.participantCount : 0;
  const waitingForMe = event.status === "drawn" && !event.revealed;
  const upcoming = event.eventDate && daysUntil(event.eventDate) >= 0 && event.status !== "completed";

  return (
    <Link
      href={waitingForMe ? `/events/${event.id}/santa` : `/events/${event.id}`}
      className={`surface-card ${scss.eventCard} ${waitingForMe ? scss.eventCardGlow : ""}`}
      data-status={event.status}
    >
      <div className={scss.eventCardTop}>
        <span className={scss.status} data-status={event.status}>
          {m.events.status[event.status]}
        </span>
        {event.isOwner && (
          <span className={scss.ownerTag} title={t.organizesThis}>
            <PiCrownSimpleFill aria-hidden="true" /> {m.common.organizer}
          </span>
        )}
      </div>

      <h3 className={scss.eventCardName}>{event.name}</h3>

      <ul className={scss.eventMeta}>
        {event.eventDate && (
          <li>
            <PiCalendarBlank className="icon-tilt" aria-hidden="true" />
            {formatDay(event.eventDate, locale)}
            {upcoming && <span className={scss.countdown}>{relativeDay(event.eventDate, m)}</span>}
          </li>
        )}
        {budget && (
          <li>
            <PiWallet aria-hidden="true" />
            {budget}
          </li>
        )}
        <li>
          <PiUsersThree aria-hidden="true" />
          {t.people(event.participantCount)}
          {event.status === "open" && ` · ${t.ready(event.readyCount)}`}
        </li>
      </ul>

      {event.status === "open" && (
        <div className={scss.readyBar} aria-hidden="true">
          <span style={{ width: `${Math.round(readyShare * 100)}%` }} />
        </div>
      )}

      {waitingForMe && (
        <p className={scss.eventCardCta}>
          <PiSparkleFill aria-hidden="true" /> {t.waiting}
        </p>
      )}
    </Link>
  );
};

export default EventCard;
