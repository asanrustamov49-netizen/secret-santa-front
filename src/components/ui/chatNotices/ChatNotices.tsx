"use client";
import Link from "next/link";
import { PiArrowBendUpLeftBold, PiChatsCircleFill, PiGiftFill, PiX } from "react-icons/pi";
import { useEvents, useMyMatches } from "@/lib/events/useEvents";
import { type ChatNotice, dismissNotice, useChatNotices } from "@/lib/realtime/notices";
import { santaChatPath } from "@/lib/santaChat/messages";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./chatNotices.module.scss";

/**
 * New-message notices on every signed-in page (mounted once in AppShell): the anonymous
 * Secret Santa chat and the event chats. The chat open on screen never gets one — its
 * messages just appear there. Notices stay until answered or closed, so one that came
 * while the tab was in the background is still there on return.
 */
const ChatNotices = () => {
  const notices = useChatNotices((state) => state.notices);
  const { m } = useI18n();

  return (
    <section className={scss.stack} aria-label={m.notices.label} aria-live="polite">
      {notices.map((notice) =>
        notice.kind === "santa" ? <SantaNotice key={notice.key} notice={notice} /> : <EventNotice key={notice.key} notice={notice} />,
      )}
    </section>
  );
};

type Of<K extends ChatNotice["kind"]> = Extract<ChatNotice, { kind: K }>;

const SantaNotice = ({ notice }: { notice: Of<"santa"> }) => {
  const { m } = useI18n();
  const t = m.santaChat.notice;
  return (
    <NoticeCard
      notice={notice}
      icon={<PiGiftFill />}
      title={notice.role === "recipient" ? t.fromSanta : <RecipientAnswered eventId={notice.eventId} />}
      preview={notice.preview}
      href={santaChatPath(notice.eventId, notice.role)}
      action={t.reply}
    />
  );
};

/** To the Santa: their recipient answered — the name they already know from their reveal */
const RecipientAnswered = ({ eventId }: { eventId: string }) => {
  const { m } = useI18n();
  const name = useMyMatches().data?.find((match) => match.eventId === eventId)?.recipientName;
  return <>{name ? m.santaChat.notice.fromRecipient(name) : m.santaChat.notice.fromRecipientGeneric}</>;
};

const EventNotice = ({ notice }: { notice: Of<"event"> }) => {
  const { m } = useI18n();
  const eventName = useEvents().data?.find((event) => event.id === notice.eventId)?.name;
  return (
    <NoticeCard
      notice={notice}
      tone="event"
      icon={<PiChatsCircleFill />}
      title={eventName ? m.notices.eventChat(eventName) : m.notices.eventChatGeneric}
      preview={`${notice.author}: ${notice.preview}`}
      href={`/events/${notice.eventId}#event-chat`}
      action={m.notices.openChat}
    />
  );
};

interface NoticeCardProps {
  notice: ChatNotice;
  tone?: "santa" | "event";
  icon: React.ReactNode;
  title: React.ReactNode;
  preview: string;
  href: string;
  action: string;
}

const NoticeCard = ({ notice, tone = "santa", icon, title, preview, href, action }: NoticeCardProps) => {
  const { m } = useI18n();
  const dismiss = () => dismissNotice(notice.key);
  const titleId = `notice-${notice.key}`;

  return (
    <article className={`${scss.notice} ${tone === "event" ? scss.event : ""}`} aria-labelledby={titleId}>
      <span className={`${scss.icon} icon-pop`} aria-hidden="true">
        {icon}
      </span>
      <div className={scss.body}>
        <p id={titleId} className={scss.title}>
          {title}
        </p>
        <p className={scss.preview}>{preview}</p>
        {notice.count > 1 && <p className={scss.count}>{m.notices.count(notice.count)}</p>}
        <Link href={href} className={`btn btn-primary ${scss.reply}`} onClick={dismiss}>
          <PiArrowBendUpLeftBold aria-hidden="true" />
          {action}
        </Link>
      </div>
      <button type="button" className={scss.close} onClick={dismiss} aria-label={m.notices.close} title={m.notices.close}>
        <PiX aria-hidden="true" />
      </button>
    </article>
  );
};

export default ChatNotices;
