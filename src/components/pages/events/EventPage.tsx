"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AxiosError } from "axios";
import {
  PiArrowLeftBold,
  PiArrowRightBold,
  PiCalendarBlank,
  PiConfettiFill,
  PiCrownSimpleFill,
  PiLockKeyFill,
  PiGiftFill,
  PiShuffleBold,
  PiSparkleFill,
  PiUserCircleBold,
  PiUsersThree,
  PiWallet,
} from "react-icons/pi";
import ConfirmButton from "@/components/ui/confirmButton/ConfirmButton";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import Snowfall from "@/components/ui/snowfall/Snowfall";
import type { Participant, SantaEvent } from "@/lib/api/events";
import { getErrorMessage } from "@/lib/api/client";
import { daysUntil, formatBudget, formatDay, relativeDay } from "@/lib/events/format";
import { useDrawNames, useEventDetails } from "@/lib/events/useEvents";
import { useEventRealtime } from "@/lib/realtime/useRealtime";
import RealtimeStatus from "@/components/ui/realtimeStatus/RealtimeStatus";
import { toast } from "@/lib/toast";
import EventChat from "./EventChat";
import EventManage from "./EventManage";
import InviteShare from "./InviteShare";
import ParticipantsList from "./ParticipantsList";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./events.module.scss";

const MIN_PEOPLE = 3;

/** The one thing to do next, depending on who you are and where the event is */
const NextStep = ({ event }: { event: SantaEvent }) => {
  const draw = useDrawNames(event.id);
  const { m } = useI18n();
  const t = m.events.next;

  if (event.status === "completed") {
    return (
      <div className={scss.nextStep}>
        <PiConfettiFill className={scss.nextIcon} aria-hidden="true" />
        <p className={scss.nextTitle}>{t.completeTitle}</p>
        <p className={scss.nextText}>{t.completeText}</p>
        <Link href={`/events/${event.id}/santa`} className="btn btn-glass">
          {t.whoDidIGift}
        </Link>
      </div>
    );
  }

  if (event.status === "drawn") {
    return (
      <div className={scss.nextStep}>
        <GiftBox size={80} glow sparkles className={scss.nextGift} />
        <p className={scss.nextTitle}>{event.revealed ? t.recipientWaiting : t.namesDrawn}</p>
        <p className={scss.nextText}>
          {event.revealed ? t.checkWishlist : t.findOut}
        </p>
        <Link href={`/events/${event.id}/santa`} className="btn btn-primary btn-lg btn-glow">
          <PiSparkleFill className="icon-sparkle" aria-hidden="true" />
          {event.revealed ? t.seeRecipient : t.openSanta}
        </Link>
      </div>
    );
  }

  const missing = Math.max(0, MIN_PEOPLE - event.participantCount);

  if (!event.isOwner) {
    return (
      <div className={scss.nextStep}>
        <PiShuffleBold className={scss.nextIcon} aria-hidden="true" />
        <p className={scss.nextTitle}>{t.waitingDraw}</p>
        <p className={scss.nextText}>{t.waitingDrawText(event.ownerName)}</p>
      </div>
    );
  }

  return (
    <div className={scss.nextStep}>
      <PiShuffleBold className={scss.nextIcon} aria-hidden="true" />
      <p className={scss.nextTitle}>{missing > 0 ? t.inviteMore(missing) : t.readyWhenYouAre}</p>
      <p className={scss.nextText}>
        {missing > 0
          ? t.needMore(MIN_PEOPLE)
          : t.readyCount(event.readyCount, event.participantCount)}
      </p>
      <ConfirmButton
        className="btn btn-primary btn-lg btn-glow"
        confirmClassName="btn btn-primary btn-lg btn-glow"
        confirmLabel={t.drawConfirm(event.participantCount)}
        disabled={missing > 0 || draw.isPending}
        pending={draw.isPending}
        pendingLabel={t.drawing}
        onConfirm={() =>
          draw.mutate(undefined, {
            onSuccess: () => toast((m) => m.events.next.drawn, "success", PiGiftFill),
            onError: (error) => toast((m) => getErrorMessage(error, m), "error"),
          })
        }
      >
        <PiShuffleBold className="icon-wiggle" aria-hidden="true" />
        {t.draw}
      </ConfirmButton>
    </div>
  );
};

/** Nudge when *I* haven't given my Santa anything to go on */
const ProfileNudge = ({ participants }: { participants: Participant[] }) => {
  const me = participants.find((p) => p.isMe);
  const { m } = useI18n();
  if (!me || me.ready) return null;
  return (
    <Link href="/profile" className={scss.nudge}>
      <PiUserCircleBold aria-hidden="true" />
      <span>
        <strong>{m.events.page.nudgeTitle}</strong> {m.events.page.nudgeText}
      </span>
      <PiArrowRightBold className="icon-nudge" aria-hidden="true" />
    </Link>
  );
};

const EventPage = () => {
  const { id } = useParams<{ id: string }>();
  const details = useEventDetails(id);
  // Joins, readiness, edits and the draw show up without a refresh
  useEventRealtime(id);
  const { m, locale } = useI18n();
  const t = m.events.page;

  if (details.isPending) {
    return (
      <div className={scss.page} aria-busy="true" aria-label={t.loading}>
        <div className={`${scss.eventHero} ${scss.skeleton}`} data-theme="dark" />
      </div>
    );
  }

  if (details.isError) {
    const notFound = details.error instanceof AxiosError && [400, 404].includes(details.error.response?.status ?? 0);
    return (
      <div className={`surface-card ${scss.stateCard}`} role="alert">
        <GiftBox size={80} />
        <p>
          {notFound ? t.notFound : getErrorMessage(details.error, m, t.loadError)}
        </p>
        <Link href="/events" className="btn btn-outline">
          {t.backToEvents}
        </Link>
      </div>
    );
  }

  const { event, participants } = details.data;
  const budget = formatBudget(event.budgetMin, event.budgetMax, locale);
  const readyShare = event.participantCount ? event.readyCount / event.participantCount : 0;
  const me = participants.find((person) => person.isMe);

  return (
    <div className={scss.page}>
      <Link href="/events" className={`touch-target ${scss.backLink}`}>
        <PiArrowLeftBold className="icon-nudge-back" aria-hidden="true" /> {m.common.allEvents}
      </Link>

      <section className={scss.eventHero} data-theme="dark" aria-labelledby="event-name">
        <Snowfall bokeh={false} className={scss.heroSnow} />

        <div className={scss.eventHeroMain}>
          <div className={scss.eventCardTop}>
            <span className={scss.status} data-status={event.status}>
              {m.events.status[event.status]}
            </span>
            {event.isOwner ? (
              <span className={scss.ownerTag}>
                <PiCrownSimpleFill aria-hidden="true" /> {t.youOrganize}
              </span>
            ) : (
              <span className={scss.ownerTag}>{t.organizedBy(event.ownerName)}</span>
            )}
            <RealtimeStatus />
          </div>

          <h1 id="event-name" className={scss.eventTitle}>
            {event.name}
          </h1>
          {event.description && <p className={scss.eventDescription}>{event.description}</p>}

          <ul className={scss.heroMeta}>
            {event.eventDate && (
              <li>
                <PiCalendarBlank className="icon-tilt" aria-hidden="true" />
                <span>
                  {formatDay(event.eventDate, locale)}
                  {event.status !== "completed" && daysUntil(event.eventDate) >= 0 && (
                    <em> · {relativeDay(event.eventDate, m)}</em>
                  )}
                </span>
              </li>
            )}
            {budget && (
              <li>
                <PiWallet aria-hidden="true" />
                <span>{budget}</span>
              </li>
            )}
            <li>
              <PiUsersThree aria-hidden="true" />
              <span>
                {t.peopleOf(event.participantCount, event.maxParticipants)}
              </span>
            </li>
          </ul>

          {event.status === "open" && (
            <div className={scss.heroReady}>
              <div className={scss.readyBar} aria-hidden="true">
                <span style={{ width: `${Math.round(readyShare * 100)}%` }} />
              </div>
              <p>
                {t.readyForSanta(event.readyCount, event.participantCount)}
              </p>
            </div>
          )}
        </div>

        <NextStep event={event} />
      </section>

      <ProfileNudge participants={participants} />

      <div className={scss.eventGrid}>
        <div className={scss.eventColumn}>
          {event.status === "open" && (
            <section className={`surface-card ${scss.panel}`} aria-labelledby="invite-title">
              <header className={scss.panelHeader}>
                <h2 id="invite-title" className={scss.panelTitle}>
                  {t.inviteTitle}
                </h2>
              </header>
              <p className={scss.panelNote}>{t.inviteNote}</p>
              <InviteShare code={event.inviteCode} eventName={event.name} />
            </section>
          )}

          {event.status !== "open" && (
            <p className={scss.privacyNote}>
              <PiLockKeyFill aria-hidden="true" />
              {t.privacyNote}
            </p>
          )}

          {/* Open once names are drawn; before that, a note that it is coming */}
          {me && <EventChat key={event.id} event={event} myId={me.userId} />}

          <EventManage key={`${event.name}-${event.status}`} event={event} />
        </div>

        <ParticipantsList event={event} participants={participants} />
      </div>
    </div>
  );
};

export default EventPage;
