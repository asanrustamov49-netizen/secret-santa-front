"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AxiosError } from "axios";
import { PiArrowLeftBold, PiArrowSquareOutBold, PiCheckCircleFill, PiLockKeyFill, PiSparkleFill } from "react-icons/pi";
import Avatar from "@/components/ui/avatar/Avatar";
import Confetti from "@/components/ui/confetti/Confetti";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import NightSky from "@/components/ui/nightSky/NightSky";
import Snowfall from "@/components/ui/snowfall/Snowfall";
import type { Recipient, SantaEvent } from "@/lib/api/events";
import { getErrorMessage } from "@/lib/api/client";
import { daysUntil, formatBudget, formatDay, relativeDay } from "@/lib/events/format";
import { useMatch, useReveal } from "@/lib/events/useEvents";
import { formatPrice } from "@/lib/profile/readiness";
import GiftChecklist from "./GiftChecklist";
import pscss from "../profile/profile.module.scss";
import { useI18n } from "@/i18n/I18nProvider";
import { useEventRealtime } from "@/lib/realtime/useRealtime";
import scss from "./events.module.scss";

const OPENING_MS = 1300;

function fitsBudget(price: number | null, event: SantaEvent) {
  if (price == null || (event.budgetMin == null && event.budgetMax == null)) return false;
  return (event.budgetMin == null || price >= event.budgetMin) && (event.budgetMax == null || price <= event.budgetMax);
}

const RecipientCard = ({ event, recipient, celebrate }: { event: SantaEvent; recipient: Recipient; celebrate: boolean }) => {
  const { m, locale } = useI18n();
  const t = m.santa;
  const budget = formatBudget(event.budgetMin, event.budgetMax, locale);
  const firstName = recipient.name.split(" ")[0];

  return (
    <>
      <section className={scss.recipientHero} data-theme="dark" aria-labelledby="recipient-name">
        <NightSky variant="hero" />
        <Snowfall bokeh={false} />
        {celebrate && <Confetti burst={2} pieces={60} />}

        <div className={scss.recipientInner}>
          <p className={scss.recipientKicker}>
            <PiSparkleFill aria-hidden="true" /> {t.youAreSantaFor}
          </p>
          <Avatar name={recipient.name} src={recipient.avatarUrl} size={112} className={scss.recipientAvatar} />
          <h1 id="recipient-name" className={scss.recipientName}>
            {recipient.name}
          </h1>
          <p className={scss.recipientMeta}>
            {event.name}
            {budget && <> · {budget}</>}
            {event.eventDate && (
              <>
                {" "}
                · {formatDay(event.eventDate, locale)}
                {daysUntil(event.eventDate) >= 0 && ` (${relativeDay(event.eventDate, m)})`}
              </>
            )}
          </p>
          <p className={scss.recipientPrivate}>
            <PiLockKeyFill aria-hidden="true" /> {t.onlyYou}
          </p>
        </div>
      </section>

      <div className={scss.eventGrid}>
        <div className={scss.eventColumn}>
          <section className={`surface-card ${scss.panel}`} aria-labelledby="their-interests">
            <header className={scss.panelHeader}>
              <h2 id="their-interests" className={scss.panelTitle}>
                {t.loves(firstName)}
              </h2>
            </header>
            {recipient.interests.length > 0 ? (
              <ul className={pscss.ornaments}>
                {recipient.interests.map((interest, i) => (
                  <li key={interest} className={pscss.ornament} data-tone={i % 5}>
                    {interest}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={scss.panelNote}>{t.noInterests}</p>
            )}
          </section>

          <section className={`surface-card ${scss.panel}`} aria-labelledby="their-wishlist">
            <header className={scss.panelHeader}>
              <h2 id="their-wishlist" className={scss.panelTitle}>
                {t.wishlistOf(firstName)}
              </h2>
              <span className={scss.count}>{recipient.wishlist.length}</span>
            </header>
            {recipient.wishlist.length > 0 ? (
              <ul className={pscss.gifts}>
                {recipient.wishlist.map((item, i) => (
                  <li key={item.id} className={pscss.gift} data-tone={i % 3}>
                    <div className={pscss.giftBody}>
                      <p className={pscss.giftTitle}>{item.title}</p>
                      <div className={pscss.giftMeta}>
                        {item.priceApprox != null && <span className={pscss.price}>{formatPrice(item.priceApprox, locale)}</span>}
                        {fitsBudget(item.priceApprox, event) && (
                          <span className={scss.fits}>
                            <PiCheckCircleFill aria-hidden="true" /> {t.fitsBudget}
                          </span>
                        )}
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className={`touch-target ${pscss.giftLink}`}>
                            {t.whereToBuy} <PiArrowSquareOutBold aria-hidden="true" />
                            <span className="visually-hidden">{m.common.opensInNewTab}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={scss.panelNote}>
                {t.noWishlist(firstName)} {recipient.interests.length > 0 && t.interestsHint}
              </p>
            )}
          </section>
        </div>

        <GiftChecklist eventId={event.id} />
      </div>
    </>
  );
};

const SantaReveal = () => {
  const { id } = useParams<{ id: string }>();
  const match = useMatch(id);
  // The draw, and changes to my recipient's wishlist, without a refresh
  useEventRealtime(id);
  const reveal = useReveal(id);
  const [phase, setPhase] = useState<"idle" | "opening" | "open">("idle");
  const { m } = useI18n();
  const t = m.santa;

  // Box pops open, then the name appears
  useEffect(() => {
    if (phase !== "opening" || !reveal.isSuccess) return;
    const timer = setTimeout(() => setPhase("open"), OPENING_MS);
    return () => clearTimeout(timer);
  }, [phase, reveal.isSuccess]);

  const back = (
    <Link href={`/events/${id}`} className={`touch-target ${scss.backLink}`}>
      <PiArrowLeftBold className="icon-nudge-back" aria-hidden="true" /> {t.back}
    </Link>
  );

  if (match.isPending) {
    return (
      <div className={scss.page} aria-busy="true" aria-label={t.loading}>
        <div className={`${scss.revealStage} ${scss.skeleton}`} data-theme="dark" />
      </div>
    );
  }

  if (match.isError) {
    const status = match.error instanceof AxiosError ? match.error.response?.status : undefined;
    return (
      <div className={scss.page}>
        {back}
        <div className={`surface-card ${scss.stateCard}`} role="alert">
          <GiftBox size={80} />
          <p>
            {status === 404 ? t.notDrawn : getErrorMessage(match.error, m, t.loadError)}
          </p>
        </div>
      </div>
    );
  }

  const { event, recipient } = match.data;

  if (recipient && phase !== "opening") {
    return (
      <div className={scss.page}>
        {back}
        <RecipientCard event={event} recipient={recipient} celebrate={phase === "open"} />
      </div>
    );
  }

  const opening = phase === "opening";

  return (
    <div className={scss.page}>
      {back}
      <section className={scss.revealStage} data-theme="dark" aria-live="polite">
        <NightSky variant="hero" />
        <Snowfall bokeh={false} />

        <div className={scss.revealInner}>
          <p className={scss.recipientKicker}>{event.name}</p>
          <div className={`${scss.revealGift} ${opening ? scss.revealGiftOpening : ""}`}>
            <GiftBox size={200} glow sparkles />
            {opening && <Confetti burst={1} pieces={40} />}
          </div>

          {opening ? (
            <p className={scss.revealTitle}>{t.unwrapping}</p>
          ) : (
            <>
              <h1 className={scss.revealTitle}>{t.readyTitle}</h1>
              <p className={scss.revealText}>{t.readyText}</p>
              <button
                type="button"
                className="btn btn-primary btn-lg btn-glow"
                disabled={reveal.isPending}
                onClick={() => {
                  setPhase("opening");
                  reveal.mutate(undefined, { onError: () => setPhase("idle") });
                }}
              >
                <PiSparkleFill aria-hidden="true" />
                {t.open}
              </button>
              {reveal.isError && (
                <p className={scss.heroError} role="alert">
                  {getErrorMessage(reveal.error, m)}
                </p>
              )}
              <p className={scss.recipientPrivate}>
                <PiLockKeyFill aria-hidden="true" /> {t.private}
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default SantaReveal;
