"use client";
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AxiosError } from "axios";
import type { InfiniteData } from "@tanstack/react-query";
import { PiArrowDownBold, PiArrowLeftBold, PiGiftFill, PiLockKeyFill, PiWifiSlashBold } from "react-icons/pi";
import Avatar from "@/components/ui/avatar/Avatar";
import ChatComposer from "@/components/ui/chatComposer/ChatComposer";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import type { SantaChatPage } from "@/lib/api/santaChat";
import { MAX_CHAT_MESSAGE_LENGTH } from "@/lib/api/chat";
import { apiMessage, getErrorMessage } from "@/lib/api/client";
import { flattenChat } from "@/lib/chat/messages";
import { daysUntil, formatDay, formatTime, toDayString } from "@/lib/events/format";
import { useRealtimeStatus } from "@/lib/realtime/useRealtime";
import { firstUnreadIndex, type SantaChatMessage, type SantaChatRole } from "@/lib/santaChat/messages";
import { santaNoticeKey, setActiveChat } from "@/lib/realtime/notices";
import {
  useMarkSantaChatRead,
  useSantaChat,
  useSendSantaChatMessage,
} from "@/lib/santaChat/useSantaChat";
import { toast } from "@/lib/toast";
import { useI18n } from "@/i18n/I18nProvider";
import chatScss from "../events/eventChat.module.scss";
import eventsScss from "../events/events.module.scss";
import scss from "./santaChat.module.scss";

/** Messages from one side within this gap share one avatar */
const GROUP_GAP_MS = 5 * 60_000;
/** "At the bottom" — close enough to follow new messages */
const NEAR_BOTTOM_PX = 80;

interface SantaChatProps {
  eventId: string;
  /** My side: sender — I'm the Santa · recipient — my Santa writes to me */
  role: SantaChatRole;
}

/**
 * The anonymous Secret Santa chat, in the event chat's look. The Santa sees who they
 * write to; the recipient sees only "Your Secret Santa" — the API sends them nothing
 * else, and nothing here asks for it. Live messages come through RealtimeProvider;
 * this page only reads the cache.
 */
const SantaChat = ({ eventId, role }: SantaChatProps) => {
  const { m } = useI18n();
  const t = m.santaChat;
  const query = useSantaChat(eventId, role);

  // While this chat is on screen, its messages need no global notice
  useEffect(() => setActiveChat(santaNoticeKey(eventId, role)), [eventId, role]);

  const back =
    role === "sender" ? (
      <Link href={`/events/${eventId}/santa`} className={`touch-target ${eventsScss.backLink}`}>
        <PiArrowLeftBold className="icon-nudge-back" aria-hidden="true" /> {t.backToRecipient}
      </Link>
    ) : (
      <Link href="/my-santa" className={`touch-target ${eventsScss.backLink}`}>
        <PiArrowLeftBold className="icon-nudge-back" aria-hidden="true" /> {t.backToMySanta}
      </Link>
    );

  let content: ReactNode;
  if (query.isPending) {
    content = (
      <section className={`surface-card ${chatScss.chat}`} aria-busy="true" aria-label={t.loading}>
        <div className={chatScss.skeletonList}>
          <span className={chatScss.skeletonBubble} />
          <span className={`${chatScss.skeletonBubble} ${chatScss.skeletonMine}`} />
          <span className={chatScss.skeletonBubble} />
        </div>
      </section>
    );
  } else if (query.isError) {
    content = <ChatError error={query.error} eventId={eventId} onRetry={() => void query.refetch()} />;
  } else {
    content = (
      <OpenSantaChat
        key={`${eventId}:${role}`}
        eventId={eventId}
        role={role}
        data={query.data}
        hasOlder={query.hasNextPage}
        loadingOlder={query.isFetchingNextPage}
        loadOlder={() => void query.fetchNextPage()}
        refetch={() => void query.refetch()}
      />
    );
  }

  return (
    <div className={`${eventsScss.page} ${scss.page}`}>
      {back}
      {content}
    </div>
  );
};

/** The API's own 404s for "this isn't yours" (EventsService.get, SantaChatService.pair) */
const ACCESS_DENIED = new Set(["Event not found", "You are not part of this draw"]);

const ChatError = ({ error, eventId, onRetry }: { error: Error; eventId: string; onRetry: () => void }) => {
  const { m } = useI18n();
  const t = m.santaChat;
  const status = error instanceof AxiosError ? error.response?.status : undefined;

  // The Santa hasn't opened their match yet: that's the way in
  if (status === 409 && apiMessage(error) === "Open your Secret Santa first") {
    return (
      <div className={`surface-card ${eventsScss.stateCard}`} role="alert">
        <GiftBox size={80} />
        <p>{t.openMatchFirst}</p>
        <Link href={`/events/${eventId}/santa`} className="btn btn-primary">
          {t.openMatch}
        </Link>
      </div>
    );
  }

  // A real "no": the API itself says I'm not in this event or not in its draw. Any other
  // 404 (e.g. "Cannot GET …" from an API that has no Secret Santa chat yet) is a fault
  // to report and retry — never presented as "you may not open this chat".
  const denied = status === 404 && ACCESS_DENIED.has(apiMessage(error) ?? "");
  const notOnServer = status === 404 && !denied;

  return (
    <div className={`surface-card ${eventsScss.stateCard}`} role="alert">
      <GiftBox size={80} />
      <p>{denied ? t.noAccess : notOnServer ? t.notOnServer : getErrorMessage(error, m, t.loadError)}</p>
      {!denied && status !== 409 && (
        <button type="button" className="btn btn-outline" onClick={onRetry}>
          {m.common.tryAgain}
        </button>
      )}
    </div>
  );
};

interface OpenSantaChatProps extends SantaChatProps {
  data: InfiniteData<SantaChatPage, unknown>;
  hasOlder: boolean;
  loadingOlder: boolean;
  loadOlder: () => void;
  refetch: () => void;
}

const OpenSantaChat = ({ eventId, role, data, hasOlder, loadingOlder, loadOlder, refetch }: OpenSantaChatProps) => {
  const { m, locale } = useI18n();
  const t = m.santaChat;
  const send = useSendSantaChatMessage(eventId, role);
  const { mutate: markRead } = useMarkSantaChatRead(eventId, role);
  const realtime = useRealtimeStatus();

  const head: SantaChatPage = data.pages[0];
  const { event, recipient, chatId } = head;
  const messages = useMemo(() => flattenChat<SantaChatMessage>(data), [data]);
  const newest = messages.at(-1);
  const newestIncoming = messages.findLast((message) => !message.isMine)?.id ?? null;
  const oldestId = messages[0]?.id;

  // "New messages" stays where it was when the chat opened
  const [unreadOnOpen] = useState(head.unread);
  const dividerAt = firstUnreadIndex(messages, unreadOnOpen);

  const listRef = useRef<HTMLOListElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  /** Arrived while I was scrolled up */
  const [missed, setMissed] = useState(0);

  // ─── Read state (kept by the API) ───────────────────────────────────
  // Read = the newest message from the other side was on screen in a visible tab
  const readFor = useRef<string | null>(head.unread > 0 ? null : newestIncoming);
  useEffect(() => {
    if (!newestIncoming) return;
    const read = () => {
      if (readFor.current === newestIncoming || document.visibilityState !== "visible") return;
      readFor.current = newestIncoming;
      markRead(undefined, { onError: () => (readFor.current = null) });
    };
    read();
    document.addEventListener("visibilitychange", read);
    return () => document.removeEventListener("visibilitychange", read);
  }, [newestIncoming, markRead]);

  // ─── Scrolling (as in the event chat) ───────────────────────────────

  // Older page loaded above: keep the reader's place instead of jumping
  const heightBefore = useRef<number | null>(null);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || heightBefore.current === null) return;
    list.scrollTop += list.scrollHeight - heightBefore.current;
    heightBefore.current = null;
  }, [oldestId]);

  // First render: open at the first unread message, or at the end
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const divider = list.querySelector<HTMLElement>("[data-unread-divider]");
    list.scrollTop = divider ? divider.offsetTop - 12 : list.scrollHeight;
  }, []);

  // A new message: follow it if I'm at the end or it's mine; otherwise count it
  const lastSeenNewest = useRef(newest?.id);
  useEffect(() => {
    const list = listRef.current;
    if (!list || !newest || lastSeenNewest.current === newest.id) return;
    lastSeenNewest.current = newest.id;
    if (atBottom || newest.isMine) {
      list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
    } else {
      setMissed((count) => count + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the newest message changes
  }, [newest?.id]);

  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    const bottom = list.scrollHeight - list.scrollTop - list.clientHeight < NEAR_BOTTOM_PX;
    setAtBottom(bottom);
    if (bottom) setMissed(0);
  };

  const onLoadOlder = () => {
    heightBefore.current = listRef.current?.scrollHeight ?? null;
    loadOlder();
  };

  const onSend = async (content: string) => {
    try {
      await send.mutateAsync(content);
      return true;
    } catch (error) {
      toast((m) => getErrorMessage(error, m), "error");
      // Closed meanwhile (event finished, chat gone): show the page as it is now
      if (error instanceof AxiosError && (error.response?.status === 409 || error.response?.status === 404)) refetch();
      return false;
    }
  };

  const dayLabel = (iso: string) => {
    const day = toDayString(new Date(iso));
    const diff = daysUntil(day);
    if (diff === 0) return m.ai.today;
    if (diff === -1) return m.ai.yesterday;
    return formatDay(day, locale);
  };

  // Who "the other side" is, as this reader may know it
  const otherName = role === "sender" && recipient ? recipient.name : t.yourSanta;
  const otherAvatar =
    role === "sender" && recipient ? (
      <Avatar name={recipient.name} src={recipient.avatarUrl} size={32} />
    ) : (
      <span className={scss.anonymousAvatar} aria-hidden="true">
        <PiGiftFill />
      </span>
    );

  const closed = event.status === "completed";
  const waiting = role === "recipient" && !chatId;

  return (
    <section className={`surface-card ${chatScss.chat}`} aria-labelledby="santa-chat-title">
      <header className={chatScss.header}>
        {role === "sender" && recipient ? (
          <Avatar name={recipient.name} src={recipient.avatarUrl} size={42} />
        ) : (
          <span className={`${scss.anonymousAvatar} ${scss.anonymousLarge}`} aria-hidden="true">
            <PiGiftFill />
          </span>
        )}
        <div className={chatScss.headerText}>
          <h1 id="santa-chat-title" className={chatScss.title}>
            {otherName}
          </h1>
          <p className={chatScss.subtitle}>
            {role === "sender" ? t.senderSubtitle(event.name) : t.recipientSubtitle(event.name)}
          </p>
        </div>
        {missed > 0 && (
          <span className={chatScss.unreadBadge} aria-live="polite">
            {m.chat.unread(missed)}
          </span>
        )}
      </header>

      {role === "sender" && recipient && recipient.interests.length > 0 && (
        <p className={scss.interests}>
          <span className={scss.interestsLabel}>{m.santa.loves(recipient.name.split(" ")[0])}:</span>{" "}
          {recipient.interests.join(" · ")}
        </p>
      )}

      <p className={chatScss.privacy}>
        <PiLockKeyFill aria-hidden="true" />
        {role === "sender" ? t.senderPrivacy : t.recipientPrivacy}
      </p>

      {(realtime === "reconnecting" || realtime === "offline") && (
        <p className={scss.offline} role="status">
          <PiWifiSlashBold aria-hidden="true" />
          {t.offline}
        </p>
      )}

      <div className={chatScss.body}>
        <ol
          ref={listRef}
          className={chatScss.messages}
          role="log"
          aria-label={t.messagesLabel}
          aria-live="polite"
          onScroll={onScroll}
          tabIndex={0}
        >
          {hasOlder && (
            <li className={chatScss.loadEarlier}>
              <button type="button" className="btn btn-ghost" onClick={onLoadOlder} disabled={loadingOlder}>
                {loadingOlder && <span className="spinner" aria-hidden="true" />}
                {m.chat.loadEarlier}
              </button>
            </li>
          )}

          {messages.length === 0 && (
            // No chat yet is not an error: the Santa's first message opens it
            <li className={chatScss.empty}>
              <PiGiftFill className="icon-float" aria-hidden="true" />
              {role === "sender" && recipient ? (
                <>
                  <p className={scss.emptyTitle}>{t.emptySenderTitle(recipient.name.split(" ")[0])}</p>
                  <p>{t.emptySender}</p>
                </>
              ) : (
                <p>{t.emptyRecipient}</p>
              )}
            </li>
          )}

          {messages.map((message, i) => {
            const previous = messages[i - 1];
            const newDay = !previous || dayOf(previous) !== dayOf(message);
            const grouped =
              !newDay &&
              i !== dividerAt &&
              previous.isMine === message.isMine &&
              Date.parse(message.createdAt) - Date.parse(previous.createdAt) < GROUP_GAP_MS;
            const time = formatTime(message.createdAt, locale);
            return (
              <Fragment key={message.id}>
                {newDay && (
                  <li className={chatScss.day} aria-hidden="true">
                    <span>{dayLabel(message.createdAt)}</span>
                  </li>
                )}
                {i === dividerAt && (
                  <li className={chatScss.divider} data-unread-divider>
                    <span>{m.chat.newMessages}</span>
                  </li>
                )}
                <li
                  className={`${chatScss.message} ${message.isMine ? chatScss.mine : ""} ${grouped ? chatScss.grouped : ""}`}
                >
                  {!message.isMine && <span className={chatScss.avatar}>{!grouped && otherAvatar}</span>}
                  <div className={chatScss.bubbleColumn}>
                    <span className="visually-hidden">{message.isMine ? m.chat.you : otherName}:</span>
                    <div className={chatScss.bubble}>
                      <p className={chatScss.text}>{message.content}</p>
                      <time
                        className={chatScss.time}
                        dateTime={message.createdAt}
                        title={`${formatDay(dayOf(message), locale)}, ${time}`}
                      >
                        {time}
                      </time>
                    </div>
                  </div>
                </li>
              </Fragment>
            );
          })}
          <li className={chatScss.end} aria-hidden="true" />
        </ol>

        {!atBottom && missed > 0 && (
          <button
            type="button"
            className={chatScss.jump}
            onClick={() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })}
          >
            <PiArrowDownBold aria-hidden="true" />
            {m.chat.unread(missed)}
          </button>
        )}
      </div>

      {closed || waiting ? (
        <p className={scss.closedNote}>{closed ? t.finished : t.waitingForSanta}</p>
      ) : (
        <ChatComposer
          id={`santa-chat-composer-${role}`}
          label={role === "sender" && recipient ? t.inputLabelSender(recipient.name) : t.inputLabelRecipient}
          placeholder={role === "sender" ? t.placeholderSender : t.placeholderRecipient}
          maxLength={MAX_CHAT_MESSAGE_LENGTH}
          onSend={onSend}
          busy={send.isPending}
          sendLabel={send.isPending ? m.chat.sending : m.chat.send}
          keyHint={m.chat.keyHint}
          charsLeft={m.chat.charsLeft}
        />
      )}
    </section>
  );
};

const dayOf = (message: SantaChatMessage) => toDayString(new Date(message.createdAt));

export default SantaChat;
