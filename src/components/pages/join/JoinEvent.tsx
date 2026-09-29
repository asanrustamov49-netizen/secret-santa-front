"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { PiCalendarBlank, PiLockKeyFill, PiUsersThree, PiWallet } from "react-icons/pi";
import Avatar from "@/components/ui/avatar/Avatar";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import NightSky from "@/components/ui/nightSky/NightSky";
import Snowfall from "@/components/ui/snowfall/Snowfall";
import { getErrorMessage } from "@/lib/api/client";
import { useSessionHint } from "@/lib/auth/useSession";
import { daysUntil, formatBudget, formatDay, relativeDay } from "@/lib/events/format";
import { useInvite, useJoinEvent } from "@/lib/events/useEvents";
import { toast } from "@/lib/toast";
import LanguageSwitcher from "@/components/ui/languageSwitcher/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./join.module.scss";

/** Public page behind every invite link: see the event, then join (signing up first if needed) */
const JoinEvent = () => {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const signedIn = useSessionHint();
  const invite = useInvite(code);
  const join = useJoinEvent();
  const { m, locale } = useI18n();
  const t = m.join;

  const here = `/join/${code}`;

  const onJoin = () =>
    join.mutate(code, {
      onSuccess: ({ eventId, joined }) => {
        toast((m) => (joined ? m.join.joined : m.join.alreadyIn));
        router.push(`/events/${eventId}`);
      },
      onError: (error) => {
        // Session hint was stale — sign in and come back here
        if (error instanceof AxiosError && error.response?.status === 401) {
          router.push(`/login?next=${encodeURIComponent(here)}`);
        }
      },
    });

  let body;

  if (invite.isPending) {
    body = <div className={scss.skeleton} aria-busy="true" aria-label={t.loading} />;
  } else if (invite.isError) {
    const invalid = invite.error instanceof AxiosError && [400, 404].includes(invite.error.response?.status ?? 0);
    body = (
      <>
        <GiftBox size={96} />
        <h1 className={scss.title}>{invalid ? t.invalidTitle : t.errorTitle}</h1>
        <p className={scss.text}>
          {invalid ? t.invalidText : getErrorMessage(invite.error, m)}
        </p>
        <Link href="/" className="btn btn-glass btn-lg">
          {t.home}
        </Link>
      </>
    );
  } else {
    const event = invite.data;
    const budget = formatBudget(event.budgetMin, event.budgetMax, locale);
    const closed = event.status !== "open";
    const full = event.maxParticipants != null && event.participantCount >= event.maxParticipants;
    const extra = event.participantCount - event.people.length;

    body = (
      <>
        <GiftBox size={110} glow sparkles className={scss.gift} />
        <p className={scss.kicker}>{t.invitedYou(event.ownerName)}</p>
        <h1 className={scss.title}>{event.name}</h1>
        {event.description && <p className={scss.text}>{event.description}</p>}

        <ul className={scss.facts}>
          {event.eventDate && (
            <li>
              <PiCalendarBlank aria-hidden="true" />
              <strong>{formatDay(event.eventDate, locale)}</strong>
              {daysUntil(event.eventDate) >= 0 && <span>{relativeDay(event.eventDate, m)}</span>}
            </li>
          )}
          {budget && (
            <li>
              <PiWallet aria-hidden="true" />
              <strong>{budget}</strong>
              <span>{t.giftBudget}</span>
            </li>
          )}
          <li>
            <PiUsersThree aria-hidden="true" />
            <strong>{event.participantCount}</strong>
            <span>{t.peopleIn(event.participantCount)}</span>
          </li>
        </ul>

        {event.people.length > 0 && (
          <div className={scss.people} aria-label={t.whosIn}>
            {event.people.map((person, i) => (
              <Avatar key={i} name={person.name} src={person.avatarUrl} size={40} className={scss.face} />
            ))}
            {extra > 0 && <span className={scss.more}>+{extra}</span>}
          </div>
        )}

        {closed ? (
          <p className={scss.notice}>{t.closed}</p>
        ) : full ? (
          <p className={scss.notice}>{t.full(event.ownerName)}</p>
        ) : signedIn ? (
          <button type="button" className="btn btn-primary btn-lg btn-glow" onClick={onJoin} disabled={join.isPending}>
            {join.isPending ? t.joining : t.join}
          </button>
        ) : (
          <div className={scss.guestActions}>
            <Link href={`/signup?next=${encodeURIComponent(here)}`} className="btn btn-primary btn-lg btn-glow">
              {t.signUpJoin}
            </Link>
            <Link href={`/login?next=${encodeURIComponent(here)}`} className="btn btn-glass btn-lg">
              {t.haveAccount}
            </Link>
          </div>
        )}

        {join.isError && !(join.error instanceof AxiosError && join.error.response?.status === 401) && (
          <p className={scss.notice} role="alert">
            {getErrorMessage(join.error, m)}
          </p>
        )}

        <p className={scss.private}>
          <PiLockKeyFill aria-hidden="true" /> {t.private}
        </p>
      </>
    );
  }

  return (
    <main className={scss.page} data-theme="dark">
      <NightSky variant="hero" />
      <Snowfall />
      <Link href="/" className={scss.logo}>
        <GiftBox size={28} /> {m.common.logo}
      </Link>
      <LanguageSwitcher className={scss.language} />
      <div className={scss.card}>{body}</div>
    </main>
  );
};

export default JoinEvent;
