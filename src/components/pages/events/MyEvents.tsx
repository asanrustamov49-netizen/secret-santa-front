"use client";
import Link from "next/link";
import { PiPlusBold } from "react-icons/pi";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import { getErrorMessage } from "@/lib/api/client";
import { useEvents } from "@/lib/events/useEvents";
import EventCard from "./EventCard";
import JoinWithLink from "./JoinWithLink";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./events.module.scss";

const MyEvents = () => {
  const events = useEvents();
  const { m } = useI18n();
  const t = m.events.list;
  const all = events.data ?? [];
  const active = all.filter((e) => e.status !== "completed");
  const past = all.filter((e) => e.status === "completed");

  return (
    <div className={scss.page}>
      <header className={scss.pageHeader}>
        <div>
          <h1 className={scss.title}>{t.title}</h1>
          <p className={scss.subtitle}>{t.subtitle}</p>
        </div>
        <Link href="/events/new" className="btn btn-primary btn-glow">
          <PiPlusBold aria-hidden="true" />
          {t.create}
        </Link>
      </header>

      {events.isPending && (
        <div className={scss.cardGrid} aria-busy="true" aria-label={t.loading}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`surface-card ${scss.eventCard} ${scss.skeleton}`} />
          ))}
        </div>
      )}

      {events.isError && (
        <div className={`surface-card ${scss.stateCard}`} role="alert">
          <p>{getErrorMessage(events.error, m, t.error)}</p>
          <button type="button" className="btn btn-outline" onClick={() => events.refetch()}>
            {m.common.tryAgain}
          </button>
        </div>
      )}

      {events.isSuccess && all.length === 0 && (
        <section className={scss.emptyHero} data-theme="dark">
          <GiftBox size={120} glow sparkles />
          <div>
            <h2>{t.emptyTitle}</h2>
            <p>{t.emptyText}</p>
            <Link href="/events/new" className="btn btn-primary btn-lg btn-glow">
              {t.createFirst}
            </Link>
          </div>
        </section>
      )}

      {active.length > 0 && (
        <section aria-labelledby="active-title">
          <h2 id="active-title" className={scss.sectionTitle}>
            {t.active} <span className={scss.count}>{active.length}</span>
          </h2>
          <div className={scss.cardGrid}>
            {active.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            <Link href="/events/new" className={scss.newCard}>
              <PiPlusBold aria-hidden="true" />
              <span>{t.newGroup}</span>
            </Link>
          </div>
        </section>
      )}

      {events.isSuccess && <JoinWithLink className={`surface-card ${scss.joinCard}`} />}

      {past.length > 0 && (
        <section aria-labelledby="past-title">
          <h2 id="past-title" className={scss.sectionTitle}>
            {t.past} <span className={scss.count}>{past.length}</span>
          </h2>
          <div className={scss.cardGrid}>
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MyEvents;
