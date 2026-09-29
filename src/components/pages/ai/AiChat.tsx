"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { AxiosError } from "axios";
import { PiArrowLeftBold, PiClockCounterClockwiseBold, PiTrashBold, PiXBold } from "react-icons/pi";
import ConfirmButton from "@/components/ui/confirmButton/ConfirmButton";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import { getErrorMessage } from "@/lib/api/client";
import type { useAiChat } from "@/lib/ai/useAi";
import { useAiConversation, useDeleteAiConversation } from "@/lib/ai/useAi";
import { toast } from "@/lib/toast";
import { useI18n } from "@/i18n/I18nProvider";
import AiComposer from "./AiComposer";
import scss from "./ai.module.scss";

interface AiChatProps {
  id: string;
  chat: ReturnType<typeof useAiChat>;
  onNew: () => void;
  /** Mobile: opens the history sheet */
  onOpenHistory: () => void;
  historyOpen: boolean;
}

/** The assistant's mark: the brand gift in a small night medallion */
const AssistantMark = () => (
  <span className={scss.assistantMark} aria-hidden="true">
    <GiftBox size={22} />
  </span>
);

/** One conversation: its messages, the reply streaming in, and the composer */
const AiChat = ({ id, chat, onNew, onOpenHistory, historyOpen }: AiChatProps) => {
  const details = useAiConversation(id);
  const remove = useDeleteAiConversation();
  const { m } = useI18n();
  const t = m.ai;
  const endRef = useRef<HTMLDivElement>(null);

  const saved = details.data?.messages ?? [];
  const turn = chat.turn?.conversationId === id ? chat.turn : null;
  // My message may already be saved while the reply streams (a refetch landed mid-turn)
  const last = saved.at(-1);
  const showPendingQuestion = turn && !(last?.role === "user" && last.content === turn.content);
  const busy = Boolean(turn);

  // Follow the conversation as it grows — unless the reader scrolled up to reread
  useEffect(() => {
    const end = endRef.current;
    if (!end) return;
    const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 240;
    if (nearBottom || turn?.status === "sending") end.scrollIntoView({ block: "end" });
  }, [saved.length, turn?.reply, turn?.status]);

  if (details.isPending) {
    return <div className={scss.startSkeleton} aria-busy="true" aria-label={t.loading} />;
  }

  if (details.isError) {
    // Someone else's conversation is a 404 too — the API never says whether it exists
    const notFound = details.error instanceof AxiosError && details.error.response?.status === 404;
    return (
      <div className={`surface-card ${scss.stateCard}`} role="alert">
        <GiftBox size={72} glow />
        <p>{notFound ? t.notFound : getErrorMessage(details.error, m, t.loadError)}</p>
        <button type="button" className="btn btn-primary" onClick={onNew}>
          {t.newChat}
        </button>
      </div>
    );
  }

  const { conversation, state, recipientName } = details.data;
  // Only an event I'm no longer in ends a conversation; everything else can go on
  const canContinue = state !== "unavailable";
  const status = !canContinue
    ? { label: t.status.paused, tone: scss.statusPaused }
    : turn?.status === "sending"
      ? { label: t.thinking, tone: scss.statusBusy }
      : turn
        ? { label: t.status.writing, tone: scss.statusBusy }
        : { label: t.status.ready, tone: scss.statusReady };

  return (
    <div className={scss.chat}>
      <header className={scss.chatHeader}>
        <button type="button" className={scss.iconButton} onClick={onNew} aria-label={t.newChat} title={t.newChat}>
          <PiArrowLeftBold aria-hidden="true" />
        </button>

        <span className={scss.chatAvatar} aria-hidden="true">
          <GiftBox size={26} />
          <span className={`${scss.statusDot} ${status.tone}`} />
        </span>

        <div className={scss.chatHeading}>
          <h1 className={scss.chatTitle}>{conversation.title ?? t.untitled}</h1>
          <p className={scss.chatMeta}>
            <span className={scss.chatStatus} aria-live="polite">
              {status.label}
            </span>
            <span aria-hidden="true">·</span>
            <span className={scss.chatContext}>{conversation.eventName ?? t.general}</span>
            {recipientName && (
              <>
                <span aria-hidden="true">·</span>
                <span className={scss.chatContext}>{t.forRecipient(recipientName)}</span>
              </>
            )}
          </p>
        </div>

        <div className={scss.chatActions}>
          <button
            type="button"
            className={`${scss.iconButton} ${scss.mobileOnly}`}
            onClick={onOpenHistory}
            aria-label={t.history}
            title={t.history}
            aria-expanded={historyOpen}
            aria-controls="ai-history"
          >
            <PiClockCounterClockwiseBold aria-hidden="true" />
          </button>
          <ConfirmButton
            className={`${scss.iconButton} ${scss.deleteButton}`}
            confirmClassName={`btn ${scss.dangerSolid}`}
            confirmLabel={t.deleteConfirm}
            aria-label={t.delete}
            disabled={remove.isPending || busy}
            pending={remove.isPending}
            onConfirm={() =>
              remove.mutate(id, {
                onSuccess: () => {
                  toast((m) => m.ai.deleted);
                  onNew();
                },
                onError: (error) => toast((m) => getErrorMessage(error, m), "error"),
              })
            }
          >
            <PiTrashBold aria-hidden="true" />
          </ConfirmButton>
        </div>
      </header>

      <ol className={scss.messages} aria-live="polite" aria-busy={busy}>
        {saved.map((message) => (
          <li key={message.id} className={message.role === "user" ? scss.userMessage : scss.assistantMessage}>
            {message.role === "assistant" && <AssistantMark />}
            <p className={scss.messageText}>{message.content}</p>
          </li>
        ))}

        {showPendingQuestion && (
          <li className={scss.userMessage}>
            <p className={scss.messageText}>{turn.content}</p>
          </li>
        )}

        {turn && (
          <li className={scss.assistantMessage}>
            <AssistantMark />
            {turn.status === "sending" ? (
              <p className={scss.thinking}>
                <span className={scss.dots} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                {t.thinking}
              </p>
            ) : (
              <p className={`${scss.messageText} ${scss.streaming}`}>{turn.reply}</p>
            )}
          </li>
        )}
      </ol>

      {chat.error && (
        <div className={`form-alert ${scss.chatError}`} role="alert">
          <span>{chat.error}</span>
          <button type="button" className={scss.dismiss} onClick={chat.clearError} aria-label={t.dismiss}>
            <PiXBold aria-hidden="true" />
          </button>
        </div>
      )}

      <div ref={endRef} />

      <div className={scss.composerDock}>
        {/* Drawn but not opened: the assistant helps with the event, gift ideas come after opening */}
        {state === "not_revealed" && conversation.eventId && (
          <p className={scss.chatHint}>
            {t.notRevealed.text} <Link href={`/events/${conversation.eventId}/santa`}>{t.notRevealed.action}</Link>
          </p>
        )}
        {canContinue ? (
          <AiComposer busy={busy} onStop={chat.stop} onSend={(content) => chat.send(id, content)} autoFocus />
        ) : (
          <p className={`form-alert ${scss.closedNote}`}>{t.closed}</p>
        )}
        <p className={scss.disclaimer}>{t.disclaimer}</p>
      </div>
    </div>
  );
};

export default AiChat;
