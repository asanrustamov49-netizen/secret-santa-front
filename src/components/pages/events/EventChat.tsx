"use client";
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { PiArrowDownBold, PiChatsCircleFill, PiLockKeyFill, PiLockSimpleFill } from "react-icons/pi";
import Avatar from "@/components/ui/avatar/Avatar";
import ChatComposer from "@/components/ui/chatComposer/ChatComposer";
import type { SantaEvent } from "@/lib/api/events";
import { MAX_CHAT_MESSAGE_LENGTH } from "@/lib/api/chat";
import { getErrorMessage } from "@/lib/api/client";
import { firstUnreadIndex, flattenChat, unreadCount, type ChatMessage } from "@/lib/chat/messages";
import { readLastRead, useChatLastRead, useEventChat, useSendChatMessage } from "@/lib/chat/useEventChat";
import { daysUntil, formatDay, formatTime, toDayString } from "@/lib/events/format";
import { toast } from "@/lib/toast";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./eventChat.module.scss";

/** Messages from one person within this gap share one name and avatar */
const GROUP_GAP_MS = 5 * 60_000;
/** "At the bottom" — close enough to follow new messages */
const NEAR_BOTTOM_PX = 80;

interface EventChatProps {
  event: SantaEvent;
  myId: string;
}

/**
 * The group chat of an event — for its participants, once names are drawn.
 * Plain messages between people; nothing about the draw is ever shown here
 * (the API never reads the pairs for it).
 */
const EventChat = ({ event, myId }: EventChatProps) => {
  const { m } = useI18n();
  const t = m.chat;

  if (event.status === "open") {
    return (
      <section className={`surface-card ${scss.chat} ${scss.locked}`} aria-labelledby="chat-title">
        <span className={scss.lockedIcon} aria-hidden="true">
          <PiChatsCircleFill />
          <PiLockSimpleFill className={scss.lockBadge} />
        </span>
        <div>
          <h2 id="chat-title" className={scss.title}>
            {t.lockedTitle}
          </h2>
          <p className={scss.subtitle}>{t.lockedText}</p>
        </div>
      </section>
    );
  }

  return <OpenChat eventId={event.id} myId={myId} />;
};

const OpenChat = ({ eventId, myId }: { eventId: string; myId: string }) => {
  const { m, locale } = useI18n();
  const t = m.chat;
  const chat = useEventChat(eventId, true);
  const send = useSendChatMessage(eventId);
  const [lastRead, markRead] = useChatLastRead(eventId);
  // Where "New messages" starts: fixed at what was unread when the chat was opened
  const [openedWith] = useState(() => readLastRead(eventId));
  const listRef = useRef<HTMLOListElement>(null);
  const endRef = useRef<HTMLLIElement>(null);
  const [atBottom, setAtBottom] = useState(true);

  const messages = useMemo(() => flattenChat(chat.data), [chat.data]);
  const newest = messages.at(-1);
  const oldestId = messages[0]?.id;
  const dividerAt = firstUnreadIndex(messages, openedWith, myId);
  const unread = unreadCount(messages, lastRead, myId);

  // Older page loaded above: keep the reader's place instead of jumping
  const heightBefore = useRef<number | null>(null);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || heightBefore.current === null) return;
    list.scrollTop += list.scrollHeight - heightBefore.current;
    heightBefore.current = null;
  }, [oldestId]);

  // First load: open at the first unread message, or at the end
  const opened = useRef(false);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !newest || opened.current) return;
    opened.current = true;
    const divider = list.querySelector<HTMLElement>("[data-unread-divider]");
    list.scrollTop = divider ? divider.offsetTop - 12 : list.scrollHeight;
  }, [newest]);

  // A new message: follow it if I'm at the end, or if it's mine (only the list scrolls, never the page)
  useEffect(() => {
    const list = listRef.current;
    if (!list || !newest || !opened.current) return;
    if (atBottom || newest.author.id === myId) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the newest message changes
  }, [newest?.id]);

  // Seen to the end (visible, and the tab in front): everything up to the newest is read
  useEffect(() => {
    const end = endRef.current;
    const list = listRef.current;
    if (!end || !list || !newest) return;
    let inView = false;
    const check = () => {
      if (inView && document.visibilityState === "visible") markRead(newest.createdAt);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        check();
      },
      { root: list, threshold: 0.5 },
    );
    observer.observe(end);
    // Came back to the tab with the chat already scrolled to the end
    document.addEventListener("visibilitychange", check);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", check);
    };
  }, [newest, markRead]);

  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    setAtBottom(list.scrollHeight - list.scrollTop - list.clientHeight < NEAR_BOTTOM_PX);
  };

  const loadEarlier = () => {
    heightBefore.current = listRef.current?.scrollHeight ?? null;
    void chat.fetchNextPage();
  };

  const onSend = async (content: string) => {
    try {
      await send.mutateAsync(content);
      return true;
    } catch (error) {
      toast((m) => getErrorMessage(error, m), "error");
      return false;
    }
  };

  const dayLabel = (iso: string) => {
    const day = toDayString(new Date(iso));
    const diff = daysUntil(day);
    if (diff === 0) return m.format.today;
    if (diff === -1) return m.format.yesterday;
    return formatDay(day, locale);
  };

  return (
    <section className={`surface-card ${scss.chat}`} aria-labelledby="chat-title">
      <header className={scss.header}>
        <span className={scss.headerIcon} aria-hidden="true">
          <PiChatsCircleFill />
        </span>
        <div className={scss.headerText}>
          <h2 id="chat-title" className={scss.title}>
            {t.title}
          </h2>
          <p className={scss.subtitle}>{t.subtitle}</p>
        </div>
        {unread > 0 && (
          <span className={scss.unreadBadge} aria-live="polite">
            {t.unread(unread)}
          </span>
        )}
      </header>

      <p className={scss.privacy}>
        <PiLockKeyFill aria-hidden="true" />
        {t.privacy}
      </p>

      <div className={scss.body}>
        {chat.isPending ? (
          <div className={scss.skeletonList} aria-busy="true" aria-label={t.loading}>
            <span className={scss.skeletonBubble} />
            <span className={`${scss.skeletonBubble} ${scss.skeletonMine}`} />
            <span className={scss.skeletonBubble} />
          </div>
        ) : chat.isError ? (
          <div className={scss.state} role="alert">
            <p>{getErrorMessage(chat.error, m, t.loadError)}</p>
            <button type="button" className="btn btn-outline" onClick={() => void chat.refetch()}>
              {m.common.tryAgain}
            </button>
          </div>
        ) : (
          <ol
            ref={listRef}
            className={scss.messages}
            role="log"
            aria-label={t.messagesLabel}
            aria-live="polite"
            onScroll={onScroll}
            tabIndex={0}
          >
            {chat.hasNextPage && (
              <li className={scss.loadEarlier}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={loadEarlier}
                  disabled={chat.isFetchingNextPage}
                >
                  {chat.isFetchingNextPage && <span className="spinner" aria-hidden="true" />}
                  {t.loadEarlier}
                </button>
              </li>
            )}

            {messages.length === 0 && (
              <li className={scss.empty}>
                <PiChatsCircleFill className="icon-float" aria-hidden="true" />
                <p>{t.empty}</p>
              </li>
            )}

            {messages.map((message, i) => {
              const previous = messages[i - 1];
              const newDay = !previous || dayOf(previous) !== dayOf(message);
              const grouped =
                !newDay &&
                i !== dividerAt &&
                previous.author.id === message.author.id &&
                Date.parse(message.createdAt) - Date.parse(previous.createdAt) < GROUP_GAP_MS;
              return (
                <Fragment key={message.id}>
                  {newDay && (
                    <li className={scss.day} aria-hidden="true">
                      <span>{dayLabel(message.createdAt)}</span>
                    </li>
                  )}
                  {i === dividerAt && (
                    <li className={scss.divider} data-unread-divider>
                      <span>{t.newMessages}</span>
                    </li>
                  )}
                  <MessageItem
                    message={message}
                    mine={message.author.id === myId}
                    grouped={grouped}
                    time={formatTime(message.createdAt, locale)}
                    youLabel={t.you}
                  />
                </Fragment>
              );
            })}
            <li ref={endRef} className={scss.end} aria-hidden="true" />
          </ol>
        )}

        {!atBottom && unread > 0 && (
          <button
            type="button"
            className={scss.jump}
            onClick={() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })}
          >
            <PiArrowDownBold aria-hidden="true" />
            {t.unread(unread)}
          </button>
        )}
      </div>

      <ChatComposer
        id={`chat-composer-${eventId}`}
        label={t.inputLabel}
        placeholder={t.placeholder}
        maxLength={MAX_CHAT_MESSAGE_LENGTH}
        onSend={onSend}
        busy={send.isPending}
        disabled={chat.isPending || chat.isError}
        sendLabel={send.isPending ? t.sending : t.send}
        keyHint={t.keyHint}
        charsLeft={t.charsLeft}
      />
    </section>
  );
};

const dayOf = (message: ChatMessage) => toDayString(new Date(message.createdAt));

interface MessageItemProps {
  message: ChatMessage;
  mine: boolean;
  /** Follows the same person's message: no repeated name and avatar */
  grouped: boolean;
  time: string;
  youLabel: string;
}

const MessageItem = ({ message, mine, grouped, time, youLabel }: MessageItemProps) => (
  <li className={`${scss.message} ${mine ? scss.mine : ""} ${grouped ? scss.grouped : ""}`}>
    {!mine && (
      <span className={scss.avatar}>
        {!grouped && <Avatar name={message.author.name} src={message.author.avatarUrl} size={32} />}
      </span>
    )}
    <div className={scss.bubbleColumn}>
      {!grouped && !mine && <p className={scss.author}>{message.author.name}</p>}
      {mine && <span className="visually-hidden">{youLabel}:</span>}
      <div className={scss.bubble}>
        <p className={scss.text}>{message.content}</p>
        <time className={scss.time} dateTime={message.createdAt}>
          {time}
        </time>
      </div>
    </div>
  </li>
);

export default EventChat;
