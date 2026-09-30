"use client";
import Link from "next/link";
import { PiArrowRightBold, PiCalendarBlank, PiLockKeyFill, PiSparkleFill, PiWallet } from "react-icons/pi";
import Avatar from "@/components/ui/avatar/Avatar";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import { getErrorMessage } from "@/lib/api/client";
import { daysUntil, formatBudget, formatDay, relativeDay } from "@/lib/events/format";
import { useMyMatches } from "@/lib/events/useEvents";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./events.module.scss";

/** Every person I'm gifting, one card per drawn event */
const MySanta = () => {
  const matches = useMyMatches();
  const list = matches.data ?? [];
  const { m, locale } = useI18n();
  const t = m.mySanta;

  return (
    <div className={scss.page}>
      <header>
        <h1 className={scss.title}>{t.title}</h1>
        <p className={scss.subtitle}>{t.subtitle}</p>
      </header>

      {matches.isPending && (
        <div className={scss.cardGrid} aria-busy="true" aria-label={m.common.loading}>
          {[0, 1].map((i) => (
            <div key={i} className={`surface-card ${scss.eventCard} ${scss.skeleton}`} />
          ))}
        </div>
      )}

      {matches.isError && (
        <div className={`surface-card ${scss.stateCard}`} role="alert">
          <p>{getErrorMessage(matches.error, m, t.loadError)}</p>
          <button type="button" className="btn btn-outline" onClick={() => matches.refetch()}>
            {m.common.tryAgain}
          </button>
        </div>
      )}

      {matches.isSuccess && list.length === 0 && (
        <section className={scss.emptyHero} data-theme="dark">
          <GiftBox size={120} glow sparkles />
          <div>
            <h2>{t.emptyTitle}</h2>
            <p>{t.emptyText}</p>
            <Link href="/events" className="btn btn-primary btn-lg btn-glow">
              {t.goToEvents}
            </Link>
          </div>
        </section>
      )}

      {list.length > 0 && (
        <div className={scss.cardGrid}>
          {list.map((match) => {
            const budget = formatBudget(match.budgetMin, match.budgetMax, locale);
            const revealed = Boolean(match.revealedAt);
            return (
              <Link
                key={match.eventId}
                href={`/events/${match.eventId}/santa`}
                className={`surface-card ${scss.matchCard} ${revealed ? "" : scss.eventCardGlow}`}
              >
                <p className={scss.matchEvent}>{match.eventName}</p>

                {revealed && match.recipientName ? (
                  <div className={scss.matchWho}>
                    <Avatar name={match.recipientName} src={match.recipientAvatarUrl} size={56} />
                    <div>
                      <p className={scss.matchLabel}>{t.gifting}</p>
                      <p className={scss.matchName}>{match.recipientName}</p>
                    </div>
                  </div>
                ) : (
                  <div className={scss.matchWho}>
                    <GiftBox size={56} sparkles />
                    <div>
                      <p className={scss.matchLabel}>{t.wrapped}</p>
                      <p className={scss.matchName}>{t.tapToReveal}</p>
                    </div>
                  </div>
                )}

                <ul className={scss.eventMeta}>
                  {match.eventDate && (
                    <li>
                      <PiCalendarBlank className="icon-tilt" aria-hidden="true" />
                      {formatDay(match.eventDate, locale)}
                      {match.status !== "completed" && daysUntil(match.eventDate) >= 0 && (
                        <span className={scss.countdown}>{relativeDay(match.eventDate, m)}</span>
                      )}
                    </li>
                  )}
                  {budget && (
                    <li>
                      <PiWallet aria-hidden="true" />
                      {budget}
                    </li>
                  )}
                </ul>

                <p className={scss.eventCardCta}>
                  {revealed ? (
                    <>
                      {t.seeWishlist} <PiArrowRightBold className="icon-nudge" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <PiSparkleFill aria-hidden="true" /> {t.open}
                    </>
                  )}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {list.length > 0 && (
        <p className={scss.privacyNote}>
          <PiLockKeyFill aria-hidden="true" /> {t.privacy}
        </p>
      )}
    </div>
  );
};

export default MySanta;
