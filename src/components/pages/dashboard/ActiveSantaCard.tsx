import Link from "next/link";
import { PiArrowRightBold, PiLinkBold, PiLockKeyFill, PiPlusBold, PiSparkleFill } from "react-icons/pi";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import Snowfall from "@/components/ui/snowfall/Snowfall";
import type { SantaEvent } from "@/lib/api/events";
import { formatBudget } from "@/lib/events/format";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./dashboard.module.scss";

const MIN_PEOPLE = 3;

interface ActiveSantaCardProps {
  /** The event that needs attention most (see pickFeatured), or null when there is none */
  event: SantaEvent | null;
  /** From /api/matches — the API only returns a name after *I* revealed it */
  recipientName: string | null | undefined;
  /** Other drawn events still waiting to be opened */
  moreToReveal: number;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  onJoin: () => void;
}

interface Fact {
  label: string;
  value: React.ReactNode;
}

const Facts = ({ facts }: { facts: Fact[] }) => (
  <dl className={scss.facts}>
    {facts.map((fact) => (
      <div key={fact.label}>
        <dt>{fact.label}</dt>
        <dd>{fact.value}</dd>
      </div>
    ))}
  </dl>
);

/** The dashboard's hero: what's happening with my Secret Santa right now, and the one next step */
const ActiveSantaCard = ({
  event,
  recipientName,
  moreToReveal,
  isPending,
  isError,
  onRetry,
  onJoin,
}: ActiveSantaCardProps) => {
  const { m, locale } = useI18n();
  const t = m.dashboard.hero;
  const budget = event ? formatBudget(event.budgetMin, event.budgetMax, locale) : null;
  let content: React.ReactNode;

  if (isPending) {
    content = (
      <div className={scss.heroBody} aria-busy="true" aria-label={t.loading}>
        <span className={`${scss.skel} ${scss.skelKicker}`} />
        <span className={`${scss.skel} ${scss.skelTitle}`} />
        <span className={`${scss.skel} ${scss.skelFacts}`} />
        <span className={`${scss.skel} ${scss.skelButton}`} />
      </div>
    );
  } else if (isError) {
    content = (
      <div className={scss.heroBody} role="alert">
        <p className={scss.kicker}>{t.errorKicker}</p>
        <h2 className={scss.heroTitle}>{t.errorTitle}</h2>
        <p className={scss.heroText}>{t.errorText}</p>
        <div className={scss.heroActions}>
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            {m.common.tryAgain}
          </button>
        </div>
      </div>
    );
  } else if (!event) {
    content = (
      <div className={scss.heroBody}>
        <p className={scss.kicker}>{t.emptyKicker}</p>
        <h2 className={scss.heroTitle}>
          {t.emptyTitle} <span>{t.emptyTitleAccent}</span>
        </h2>
        <p className={scss.heroText}>{t.emptyText}</p>
        <div className={scss.heroActions}>
          <Link href="/events/new" className="btn btn-primary btn-lg btn-glow">
            <PiPlusBold aria-hidden="true" /> {t.create}
          </Link>
          <button type="button" className="btn btn-glass btn-lg" onClick={onJoin}>
            <PiLinkBold aria-hidden="true" /> {t.joinWithLink}
          </button>
        </div>
      </div>
    );
  } else if (event.status === "drawn" && !event.revealed) {
    content = (
      <div className={scss.heroBody}>
        <p className={scss.kicker}>
          <PiSparkleFill aria-hidden="true" /> {t.readyKicker}
        </p>
        <h2 className={scss.heroTitle}>{event.name}</h2>
        <Facts
          facts={[
            {
              label: t.recipient,
              value: (
                <span className={scss.hidden}>
                  <PiLockKeyFill aria-hidden="true" /> {t.hidden}
                </span>
              ),
            },
            { label: t.status, value: t.readyToReveal },
            ...(budget ? [{ label: t.budget, value: budget }] : []),
          ]}
        />
        <div className={scss.heroActions}>
          <Link href={`/events/${event.id}/santa`} className="btn btn-primary btn-lg btn-glow">
            <PiSparkleFill aria-hidden="true" /> {t.reveal}
          </Link>
          <Link href={`/events/${event.id}`} className="btn btn-glass btn-lg">
            {t.openEvent}
          </Link>
        </div>
      </div>
    );
  } else if (event.status === "drawn") {
    content = (
      <div className={scss.heroBody}>
        <p className={scss.kicker}>{t.giftingKicker}</p>
        <h2 className={scss.heroTitle}>
          {recipientName === undefined ? (
            <span className={`${scss.skel} ${scss.skelTitle}`} aria-label={m.common.loading} />
          ) : (
            <span>{recipientName ?? t.yourRecipient}</span>
          )}
        </h2>
        <Facts
          facts={[
            { label: t.event, value: event.name },
            ...(budget ? [{ label: t.budget, value: budget }] : []),
            { label: t.status, value: t.timeToShop },
          ]}
        />
        <div className={scss.heroActions}>
          <Link href={`/events/${event.id}/santa`} className="btn btn-primary btn-lg">
            {t.viewWishlist} <PiArrowRightBold className="icon-nudge" aria-hidden="true" />
          </Link>
          <Link href={`/events/${event.id}`} className="btn btn-glass btn-lg">
            {t.openEvent}
          </Link>
        </div>
      </div>
    );
  } else {
    // Still gathering people
    const missing = Math.max(0, MIN_PEOPLE - event.participantCount);
    const share = event.participantCount ? event.readyCount / event.participantCount : 0;
    const next = event.isOwner
      ? missing > 0
        ? t.inviteMore(missing)
        : t.everyoneHere
      : t.waitingFor(event.ownerName);

    content = (
      <div className={scss.heroBody}>
        <p className={scss.kicker}>{t.gettingReady}</p>
        <h2 className={scss.heroTitle}>{event.name}</h2>
        <Facts
          facts={[
            { label: t.people, value: t.peopleValue(event.participantCount, event.maxParticipants) },
            { label: t.profilesReady, value: t.profilesReadyValue(event.readyCount, event.participantCount) },
            { label: t.status, value: t.preparing },
          ]}
        />
        <div className={scss.heroProgress} aria-hidden="true">
          <span style={{ width: `${Math.round(share * 100)}%` }} />
        </div>
        <p className={scss.heroText}>{next}</p>
        <div className={scss.heroActions}>
          <Link href={`/events/${event.id}`} className="btn btn-primary btn-lg">
            {event.isOwner ? (missing > 0 ? t.inviteFriends : t.drawNames) : t.openEvent}
            <PiArrowRightBold className="icon-nudge" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className={scss.heroCard} data-theme="dark" aria-label={t.label}>
      <Snowfall bokeh={false} twinkles={false} className={scss.heroSnow} />
      {content}
      <div className={scss.heroArt} aria-hidden="true">
        <GiftBox size={150} glow sparkles={Boolean(event && event.status === "drawn" && !event.revealed)} />
      </div>
      {moreToReveal > 0 && (
        <Link href="/my-santa" className={scss.heroMore}>
          {t.moreToReveal(moreToReveal)} <PiArrowRightBold className="icon-nudge" aria-hidden="true" />
        </Link>
      )}
    </section>
  );
};

export default ActiveSantaCard;
