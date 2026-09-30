"use client";
import { useEffect, useRef, type KeyboardEvent } from "react";
import Link from "next/link";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { PiArrowRightBold, PiArrowSquareOutBold, PiGiftFill, PiNotePencilBold, PiXBold } from "react-icons/pi";
import AiActions from "@/components/ui/aiActions/AiActions";
import BrandLoader from "@/components/ui/brandLoader/BrandLoader";
import ChatComposer from "@/components/ui/chatComposer/ChatComposer";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import { MAX_AI_MESSAGE_LENGTH } from "@/lib/api/ai";
import type { SantaEvent } from "@/lib/api/events";
import { getErrorMessage } from "@/lib/api/client";
import { splitAiActions } from "@/lib/ai/actions";
import { useMiniConversation } from "@/lib/ai/miniStore";
import type { AiPage } from "@/lib/ai/pages";
import { ONBOARDING_QUICK, quickActionsFor } from "@/lib/ai/quickActions";
import { useAiChat, useAiConversation, useCreateAiConversation } from "@/lib/ai/useAi";
import { eventKey } from "@/lib/events/useEvents";
import { useI18n, useMessage } from "@/i18n/I18nProvider";
import scss from "./miniPanel.module.scss";

const INPUT_ID = "mini-ai-input";

interface MiniAssistantPanelProps {
  userId: string;
  page: AiPage | undefined;
  eventId: string | null;
  /** Opened from the first-visit bubble */
  welcome: boolean;
  onClose: () => void;
}

/**
 * The mini assistant's chat window. A general conversation of the existing assistant
 * API (no event → the server never builds a recipient context for it), with the page
 * as an allowlisted identifier. Suggestions come from what is already on screen.
 */
const MiniAssistantPanel = ({ userId, page, eventId, welcome, onClose }: MiniAssistantPanelProps) => {
  const { m } = useI18n();
  const t = m.miniAi;
  const [conversationId, setConversationId] = useMiniConversation(userId);
  const details = useAiConversation(conversationId);
  const chat = useAiChat(page);
  const create = useCreateAiConversation();
  const [startError, setStartError] = useMessage();
  const queryClient = useQueryClient();
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Deleted on /ai meanwhile (or not this account's): start a fresh one
  const missing =
    details.isError && details.error instanceof AxiosError && details.error.response?.status === 404;
  useEffect(() => {
    if (missing) setConversationId(null);
  }, [missing, setConversationId]);

  const saved = conversationId && !missing ? (details.data?.messages ?? []) : [];
  const turn = chat.turn && chat.turn.conversationId === conversationId ? chat.turn : null;
  const last = saved.at(-1);
  const showPendingQuestion = turn && !(last?.role === "user" && last.content === turn.content);
  const busy = Boolean(turn) || create.isPending;
  const loading = Boolean(conversationId) && !missing && details.isPending;
  const showIntro = !loading && saved.length === 0 && !turn;

  // Suggestions for this page — on an event page, from the event already on screen
  const event =
    page === "event" && eventId
      ? queryClient.getQueryData<{ event: SantaEvent }>(eventKey(eventId))?.event
      : undefined;
  const quick = welcome
    ? ONBOARDING_QUICK
    : quickActionsFor(page, event ? { status: event.status, isOwner: event.isOwner } : null);

  // Opening: the field on a computer; on a phone the title (no keyboard jumping up)
  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover)").matches;
    const target = canHover
      ? document.getElementById(INPUT_ID)
      : document.getElementById("mini-ai-title");
    target?.focus();
  }, []);

  // Follow the conversation as it grows (only the panel scrolls)
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [saved.length, turn?.reply, turn?.status]);

  // Phones: stay above the on-screen keyboard (the visual viewport shrinks, the layout doesn't)
  useEffect(() => {
    const viewport = window.visualViewport;
    const panel = panelRef.current;
    if (!viewport || !panel) return;
    const update = () => {
      const keyboard = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      panel.style.setProperty("--kb", `${Math.round(keyboard)}px`);
      panel.style.setProperty("--vv-height", `${Math.round(viewport.height)}px`);
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  const ask = async (content: string): Promise<boolean> => {
    setStartError(undefined);
    let id = conversationId && !missing ? conversationId : null;
    if (!id) {
      try {
        id = (await create.mutateAsync(null)).id;
      } catch (error) {
        setStartError((m) => getErrorMessage(error, m));
        return false;
      }
      setConversationId(id);
    }
    return chat.send(id, content);
  };

  const startOver = () => {
    chat.stop();
    chat.clearError();
    setStartError(undefined);
    setConversationId(null);
    document.getElementById(INPUT_ID)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
    }
  };

  const fullHref = conversationId && !missing
    ? `/ai?c=${conversationId}${page ? `&from=${page}` : ""}`
    : page
      ? `/ai?from=${page}`
      : "/ai";
  const error = startError ?? chat.error;

  return (
    <div
      id="mini-ai"
      ref={panelRef}
      className={scss.panel}
      role="dialog"
      aria-modal="false"
      aria-labelledby="mini-ai-title"
      onKeyDown={onKeyDown}
    >
      {/* Always night, like the /ai stage and the sidebar */}
      <header className={scss.header} data-theme="dark">
        <span className={scss.mark} aria-hidden="true">
          <GiftBox size={22} />
        </span>
        <div className={scss.heading}>
          <h2 id="mini-ai-title" className={scss.title} tabIndex={-1}>
            {t.title}
          </h2>
          {page && page !== "ai" && <p className={scss.context}>{t.onPage(t.pages[page])}</p>}
        </div>
        <div className={scss.headerActions}>
          {!showIntro && (
            <button type="button" className={scss.iconButton} onClick={startOver} aria-label={t.newChat} title={t.newChat}>
              <PiNotePencilBold aria-hidden="true" />
            </button>
          )}
          <Link href={fullHref} className={scss.iconButton} aria-label={t.openFull} title={t.openFull}>
            <PiArrowSquareOutBold aria-hidden="true" />
          </Link>
          <button type="button" className={scss.iconButton} onClick={onClose} aria-label={t.close} title={t.close}>
            <PiXBold aria-hidden="true" />
          </button>
        </div>
      </header>

      <div ref={bodyRef} className={scss.body}>
        {loading ? (
          <BrandLoader label={m.ai.loading} className={scss.loader} />
        ) : showIntro ? (
          <div className={scss.intro}>
            <GiftBox size={52} glow sparkles className="icon-float" />
            <p className={scss.introTitle}>{welcome ? t.welcomeTitle : t.greeting}</p>
            <p className={scss.introText}>{welcome ? t.welcomeText : t.greetingText}</p>
            {(page === "event_santa" || page === "my_santa") && (
              <p className={scss.giftHint}>
                <PiGiftFill aria-hidden="true" />
                {t.giftHint}
              </p>
            )}
            <p id="mini-ai-quick" className={scss.quickLabel}>
              {t.quickLabel}
            </p>
            <ul className={scss.quick} aria-labelledby="mini-ai-quick">
              {quick.map((key) => (
                <li key={key}>
                  <button type="button" className={scss.quickButton} onClick={() => void ask(t.quick[key].prompt)} disabled={busy}>
                    <span>{t.quick[key].label}</span>
                    <PiArrowRightBold className="icon-nudge" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ol className={scss.messages} role="log" aria-live="polite" aria-busy={busy} aria-label={t.title}>
            {saved.map((message) =>
              message.role === "user" ? (
                <li key={message.id} className={scss.user}>
                  <p className={scss.text}>{message.content}</p>
                </li>
              ) : (
                <li key={message.id} className={scss.assistant}>
                  <Reply content={message.content} />
                </li>
              ),
            )}

            {showPendingQuestion && (
              <li className={scss.user}>
                <p className={scss.text}>{turn.content}</p>
              </li>
            )}

            {turn && (
              <li className={scss.assistant}>
                {turn.status === "sending" ? (
                  <p className={scss.thinking}>
                    <span className={scss.dots} aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    {m.ai.thinking}
                  </p>
                ) : (
                  <p className={`${scss.text} ${scss.streaming}`}>{splitAiActions(turn.reply, true).text}</p>
                )}
              </li>
            )}
          </ol>
        )}

        {error && (
          <div className={`form-alert ${scss.error}`} role="alert">
            <span>{error}</span>
            <button
              type="button"
              className={scss.dismiss}
              onClick={() => {
                setStartError(undefined);
                chat.clearError();
              }}
              aria-label={m.ai.dismiss}
            >
              <PiXBold aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div className={scss.footer}>
        <ChatComposer
          id={INPUT_ID}
          size="compact"
          label={t.placeholder}
          placeholder={t.placeholder}
          maxLength={MAX_AI_MESSAGE_LENGTH}
          onSend={ask}
          busy={busy}
          onStop={turn ? chat.stop : undefined}
          sendLabel={m.ai.send}
          stopLabel={m.ai.stop}
          charsLeft={m.ai.charsLeft}
        />
        <p className={scss.disclaimer}>{m.ai.disclaimer}</p>
      </div>
    </div>
  );
};

/** A saved reply: text, and the settings buttons it offers */
const Reply = ({ content }: { content: string }) => {
  const { text, actions } = splitAiActions(content);
  return (
    <>
      <p className={scss.text}>{text}</p>
      <AiActions actions={actions} />
    </>
  );
};

export default MiniAssistantPanel;
