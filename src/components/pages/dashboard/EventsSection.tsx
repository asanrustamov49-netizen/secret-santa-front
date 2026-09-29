import Link from "next/link";
import { PiArrowRightBold, PiPlusBold } from "react-icons/pi";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import EventCard from "@/components/pages/events/EventCard";
import type { SantaEvent } from "@/lib/api/events";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./dashboard.module.scss";

const SHOWN = 4;

interface EventsSectionProps {
  /** Active events, most urgent first */
  active: SantaEvent[];
  pastCount: number;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
}

const EventsSection = ({ active, pastCount, isPending, isError, onRetry }: EventsSectionProps) => {
  const hidden = active.length - SHOWN;
  const { m } = useI18n();
  const t = m.dashboard.events;

  return (
    <section aria-labelledby="events-title" className={scss.events}>
      <div className={scss.sectionHead}>
        <h2 id="events-title" className={scss.sectionTitle}>
          {t.title}
          {active.length > 0 && <span className={scss.count}>{active.length}</span>}
        </h2>
        {(hidden > 0 || pastCount > 0) && (
          <Link href="/events" className={`touch-target ${scss.textLink}`}>
            {t.viewAll} <PiArrowRightBold aria-hidden="true" />
          </Link>
        )}
      </div>

      {isPending ? (
        <div className={scss.eventGrid} aria-busy="true" aria-label={t.loading}>
          {[0, 1].map((i) => (
            <div key={i} className={`surface-card ${scss.eventSkeleton}`}>
              <span className={`${scss.skel} ${scss.skelKicker}`} />
              <span className={`${scss.skel} ${scss.skelLine}`} />
              <span className={`${scss.skel} ${scss.skelLineShort}`} />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className={`surface-card ${scss.emptyCard}`} role="alert">
          <p className={scss.emptyText}>{t.error}</p>
          <button type="button" className="btn btn-outline" onClick={onRetry}>
            {m.common.tryAgain}
          </button>
        </div>
      ) : active.length === 0 ? (
        <div className={`surface-card ${scss.emptyCard}`}>
          <GiftBox size={64} />
          <div>
            <p className={scss.emptyTitle}>
              {pastCount > 0 ? t.noActive : t.noEvents}
            </p>
            <p className={scss.emptyText}>
              {pastCount > 0 ? t.noActiveText : t.noEventsText}
            </p>
          </div>
          <Link href="/events/new" className="btn btn-primary">
            <PiPlusBold aria-hidden="true" /> {t.create}
          </Link>
        </div>
      ) : (
        <div className={scss.eventGrid}>
          {active.slice(0, SHOWN).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
          {active.length === 1 && (
            <Link href="/events/new" className={scss.newEvent}>
              <PiPlusBold aria-hidden="true" />
              <span>{t.startAnother}</span>
            </Link>
          )}
        </div>
      )}
    </section>
  );
};

export default EventsSection;
