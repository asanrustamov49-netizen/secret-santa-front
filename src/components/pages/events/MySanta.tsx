"use client";
import Link from "next/link";
import { NAV_FORWARD } from "@/lib/ui/pageTransition";
import {
  PiArrowRightBold,
  PiCalendarBlank,
  PiChatCircleDotsFill,
  PiGiftFill,
  PiLockKeyFill,
  PiSparkleFill,
  PiWallet,
} from "react-icons/pi";
import Avatar from "@/components/ui/avatar/Avatar";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import { getErrorMessage } from "@/lib/api/client";
import { daysUntil, formatBudget, formatDay, relativeDay } from "@/lib/events/format";
import { useMyMatches } from "@/lib/events/useEvents";
import { santaChatPath, type SantaChatRole } from "@/lib/santaChat/messages";
import { useSantaChats } from "@/lib/santaChat/useSantaChat";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./events.module.scss";

/** Every person I'm gifting, one card per drawn event */
const MySanta = () => {
  const matches = useMyMatches();
  const list = matches.data ?? [];
  const { m, locale } = useI18n();
  const t = m.mySanta;
  const s = m.santaChat;
  // My Secret Santa chats with messages: answers from my recipients, questions from my Santas
  const santaChats = useSantaChats().data ?? [];
  const inbox = santaChats.filter((chat) => chat.role === "recipient");
  const unreadAs = (eventId: string, role: SantaChatRole) =>
    santaChats.find((chat) => chat.eventId === eventId && chat.role === role)?.unread ?? 0;

  return (
    <div className={scss.page}>
      <header>
        <h1 className={scss.title}>{t.title}</h1>
        <p className={scss.subtitle}>{t.subtitle}</p>
      </header>

      {/* My own Secret Santas who wrote to me — anonymous: only the event and the unread count */}
      {inbox.length > 0 && (
        <section aria-labelledby="santa-inbox-title">
          <h2 id="santa-inbox-title" className={scss.sectionTitle}>
            {s.inbox.title}
          </h2>
          <p className={scss.inboxText}>{s.inbox.text}</p>
          <div className={`${scss.cardGrid} stagger`}>
            {inbox.map((chat) => (
              <Link
                key={chat.chatId}
                href={santaChatPath(chat.eventId, "recipient")}
                className={`surface-card ${scss.matchCard} ${chat.unread > 0 ? scss.eventCardGlow : ""}`}
              >
                <p className={scss.matchEvent}>{chat.eventName}</p>
                <div className={scss.matchWho}>
                  <span className={scss.santaMark} aria-hidden="true">
                    <PiGiftFill />
                  </span>
                  <p className={scss.matchName}>{s.yourSanta}</p>
                </div>
                <p className={scss.eventCardCta}>
                  {s.inbox.open} <PiArrowRightBold className="icon-nudge" aria-hidden="true" />
                  {chat.unread > 0 && (
                    <span className={scss.santaChatBadge} aria-label={s.unreadMessages(chat.unread)}>
                      {chat.unread}
                    </span>
                  )}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

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
        <div className={`${scss.cardGrid} stagger`}>
          {list.map((match) => {
            const budget = formatBudget(match.budgetMin, match.budgetMax, locale);
            const revealed = Boolean(match.revealedAt);
            const unread = unreadAs(match.eventId, "sender");
            return (
              <article
                key={match.eventId}
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
                  {/* Stretched over the whole card; the chat button below sits on top of it */}
                  <Link href={`/events/${match.eventId}/santa`} transitionTypes={NAV_FORWARD} className={scss.matchCardLink}>
                    {revealed ? (
                      <>
                        {t.seeWishlist} <PiArrowRightBold className="icon-nudge" aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        <PiSparkleFill aria-hidden="true" /> {t.open}
                      </>
                    )}
                  </Link>
                </p>

                {revealed && (
                  <Link
                    href={santaChatPath(match.eventId, "sender")}
                    className={`btn btn-outline ${scss.matchChat}`}
                  >
                    <PiChatCircleDotsFill aria-hidden="true" />
                    {s.write}
                    {unread > 0 && (
                      <span className={scss.santaChatBadge} aria-label={s.unreadMessages(unread)}>
                        {unread}
                      </span>
                    )}
                  </Link>
                )}
              </article>
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
