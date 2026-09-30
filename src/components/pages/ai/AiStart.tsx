"use client";
import { type CSSProperties, useState } from "react";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  PiArrowRightBold,
  PiCalendarPlusFill,
  PiClockCounterClockwiseBold,
  PiGiftFill,
  PiHeartFill,
  PiLightbulbFill,
  PiLockKeyFill,
  PiSparkleFill,
  PiTreeEvergreenFill,
  PiUsersThreeFill,
  PiWalletFill,
} from "react-icons/pi";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import Snowfall from "@/components/ui/snowfall/Snowfall";
import type { AiPage } from "@/lib/ai/pages";
import type { SantaEvent } from "@/lib/api/events";
import { formatBudget } from "@/lib/events/format";
import { useEvents, useMyMatches } from "@/lib/events/useEvents";
import { useI18n } from "@/i18n/I18nProvider";
import type { Messages } from "@/i18n/messages";
import AiComposer from "./AiComposer";
import scss from "./ai.module.scss";

type Quick = { title: string; text: string; prompt: string };

/** About the app — offered to everyone, always */
const GENERAL_QUICK: { key: keyof Messages["ai"]["quick"]; icon: IconType }[] = [
  { key: "howItWorks", icon: PiTreeEvergreenFill },
  { key: "createEvent", icon: PiCalendarPlusFill },
  { key: "invite", icon: PiUsersThreeFill },
  { key: "findGift", icon: PiLightbulbFill },
];

/** About my recipient — only in an event where I opened my Secret Santa */
const GIFT_QUICK: { key: keyof Messages["ai"]["giftQuick"]; icon: IconType }[] = [
  { key: "choose", icon: PiGiftFill },
  { key: "budget", icon: PiWalletFill },
  { key: "wishlist", icon: PiHeartFill },
  { key: "ideas", icon: PiSparkleFill },
];

/** The page the user came from, by its menu name */
const PAGE_NAME: Record<Exclude<AiPage, "ai">, Exclude<keyof Messages["meta"], "title">> = {
  dashboard: "dashboard",
  events: "myEvents",
  event_new: "createEvent",
  event: "event",
  event_santa: "mySanta",
  my_santa: "mySanta",
  profile: "profile",
  settings: "settings",
};

const isOpened = (event: SantaEvent) => event.status !== "open" && event.revealed;

interface AiStartProps {
  /** Where the user came from — offers "what can I do here?" */
  page: AiPage;
  /** Creates the conversation (eventId null: a general one), then sends the first message */
  onStart: (eventId: string | null, content: string) => Promise<boolean>;
  busy: boolean;
  error?: string;
  /** Mobile: opens the history sheet */
  onOpenHistory: () => void;
  historyOpen: boolean;
}

/**
 * A new conversation: general, or about one of my events. Gift help is offered only
 * where my Secret Santa is open — the server decides again what the assistant may see.
 */
const AiStart = ({ page, onStart, busy, error, onOpenHistory, historyOpen }: AiStartProps) => {
  const events = useEvents();
  const matches = useMyMatches();
  const { m, locale } = useI18n();
  const t = m.ai;
  // Without the list the assistant still works — just without event choice
  const list = events.data ?? [];
  const recipientOf = (eventId: string) =>
    matches.data?.find((match) => match.eventId === eventId && match.revealedAt)?.recipientName ?? null;

  // undefined = not chosen yet: the first event where gift help is ready (current before past), else general
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const contextId =
    picked === undefined
      ? (list.find(isOpened)?.id ?? null)
      : picked && list.some((event) => event.id === picked)
        ? picked
        : null;
  const selected = list.find((event) => event.id === contextId);
  const giftReady = Boolean(selected && isOpened(selected));
  const recipientName = selected && giftReady ? recipientOf(selected.id) : null;

  if (events.isPending) {
    return <div className={scss.startSkeleton} aria-busy="true" aria-label={t.loading} />;
  }

  const ask = (prompt: string) => void onStart(contextId, prompt);
  const cards = (items: { key: string; icon: IconType; quick: Quick }[], tone: "gold" | "blue") => (
    <div className={scss.quickGrid}>
      {items.map(({ key, icon: Icon, quick }, index) => (
        <button
          key={key}
          type="button"
          className={`${scss.quickCard} ${tone === "gold" ? scss.toneGold : scss.toneBlue}`}
          style={{ "--i": index } as CSSProperties}
          disabled={busy}
          onClick={() => ask(quick.prompt)}
        >
          <span className={scss.quickIcon} aria-hidden="true">
            <Icon />
          </span>
          <span className={scss.quickText}>
            <span className={scss.quickTitle}>{quick.title}</span>
            <span className={scss.quickHint}>{quick.text}</span>
          </span>
          <PiArrowRightBold className={scss.quickArrow} aria-hidden="true" />
        </button>
      ))}
    </div>
  );

  const budget = selected ? formatBudget(selected.budgetMin, selected.budgetMax, locale) : null;

  return (
    <div className={scss.start}>
      {/* The night stage: the same midnight card as the profile and dashboard heroes, in both themes */}
      <section className={scss.stage} data-theme="dark" aria-labelledby="ai-title">
        <Snowfall bokeh={false} className={scss.stageSnow} />

        <div className={scss.stageTop}>
          <span className={scss.eyebrow}>
            <PiSparkleFill aria-hidden="true" /> {m.meta.ai}
          </span>
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
        </div>

        <div className={scss.stageBody}>
          <div className={scss.stageCopy}>
            <h1 id="ai-title" className={scss.stageTitle}>
              {t.title}
            </h1>
            <p className={scss.stageSubtitle}>{t.subtitle}</p>
          </div>

          <div className={scss.halo} aria-hidden="true">
            <span className={scss.haloRing} />
            <span className={`${scss.haloRing} ${scss.haloRingOuter}`} />
            <GiftBox size={116} glow sparkles className={scss.haloGift} />
            <span className={scss.haloSpark}>
              <PiSparkleFill />
            </span>
          </div>
        </div>

        {list.length > 0 && (
          <div className={scss.context}>
            <span id="ai-context-label" className={scss.contextLabel}>
              {t.helpingWith}
            </span>
            <div role="radiogroup" aria-labelledby="ai-context-label" className={scss.contextRail}>
              <button
                type="button"
                role="radio"
                aria-checked={contextId === null}
                className={`${scss.contextPill} ${contextId === null ? scss.contextPillActive : ""}`}
                onClick={() => setPicked(null)}
              >
                <PiSparkleFill aria-hidden="true" />
                <span className={scss.contextPillName}>{t.general}</span>
              </button>
              {list.map((event) => {
                const Icon = isOpened(event) ? PiGiftFill : PiTreeEvergreenFill;
                return (
                  <button
                    key={event.id}
                    type="button"
                    role="radio"
                    aria-checked={event.id === contextId}
                    className={`${scss.contextPill} ${event.id === contextId ? scss.contextPillActive : ""}`}
                    onClick={() => setPicked(event.id)}
                  >
                    <Icon aria-hidden="true" />
                    <span className={scss.contextPillName}>{event.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* What the assistant knows in this context — only what the server will use too */}
        {selected && (
          <div key={selected.id} className={scss.ribbon}>
            {giftReady ? (
              <>
                <GiftBox size={40} className={scss.ribbonGift} />
                <span className={scss.ribbonText}>
                  <span className={scss.ribbonKicker}>{m.santa.youAreSantaFor}</span>
                  <span className={scss.ribbonName}>{recipientName ?? selected.name}</span>
                </span>
                {budget && (
                  <span className={scss.ribbonBudget}>
                    <span className={scss.ribbonKicker}>{m.dashboard.hero.budget}</span>
                    <span>{budget}</span>
                  </span>
                )}
              </>
            ) : selected.status === "open" ? (
              <>
                <span className={scss.ribbonIcon} aria-hidden="true">
                  <PiTreeEvergreenFill />
                </span>
                <span className={scss.ribbonText}>
                  <span className={scss.ribbonKicker}>{selected.name}</span>
                  <span>{m.events.status.open}</span>
                </span>
              </>
            ) : (
              <>
                <span className={scss.ribbonIcon} aria-hidden="true">
                  <PiLockKeyFill />
                </span>
                <span className={scss.ribbonText}>
                  <span>{t.notRevealed.text}</span>
                </span>
                <Link href={`/events/${selected.id}/santa`} className={`btn btn-primary ${scss.ribbonAction}`}>
                  {t.notRevealed.action}
                </Link>
              </>
            )}
          </div>
        )}
      </section>

      {page !== "ai" && (
        <button type="button" className={scss.pageHint} disabled={busy} onClick={() => ask(t.pageHint.prompt)}>
          <span className={scss.pageHintFrom}>
            {t.pageHint.from} <strong>{m.meta[PAGE_NAME[page]]}</strong>
          </span>
          <span className={scss.pageHintAsk}>
            {t.pageHint.title} <PiArrowRightBold className="icon-nudge" aria-hidden="true" />
          </span>
        </button>
      )}

      <section className={scss.actions} aria-labelledby="ai-quick">
        <h2 id="ai-quick" className={scss.sectionLabel}>
          {t.quickLabel}
        </h2>
        {giftReady && cards(GIFT_QUICK.map(({ key, icon }) => ({ key, icon, quick: t.giftQuick[key] })), "gold")}
        {giftReady ? (
          // With a recipient, gift help leads; the app questions stay one tap away
          <div className={scss.chips}>
            {GENERAL_QUICK.map(({ key, icon: Icon }) => (
              <button key={key} type="button" className={scss.chip} disabled={busy} onClick={() => ask(t.quick[key].prompt)}>
                <Icon aria-hidden="true" /> {t.quick[key].title}
              </button>
            ))}
          </div>
        ) : (
          cards(GENERAL_QUICK.map(({ key, icon }) => ({ key, icon, quick: t.quick[key] })), "blue")
        )}
      </section>

      {error && (
        <p className="form-alert" role="alert">
          {error}
        </p>
      )}

      <div className={scss.composerDock}>
        <AiComposer busy={busy} onSend={(content) => onStart(contextId, content)} />
        <p className={scss.disclaimer}>{t.disclaimer}</p>
      </div>
    </div>
  );
};

export default AiStart;
