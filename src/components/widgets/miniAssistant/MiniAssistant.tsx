"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PiSparkleFill, PiXBold } from "react-icons/pi";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import type { AiPage } from "@/lib/ai/pages";
import { useMiniOnboarded } from "@/lib/ai/miniStore";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./miniLauncher.module.scss";

// The chat itself (AI client, streaming, messages) loads only when it is first opened
const loadPanel = () => import("./MiniAssistantPanel");
const MiniAssistantPanel = dynamic(loadPanel, { ssr: false });

/** How long a first visit waits before the welcome bubble — let the page settle first */
const TEASER_DELAY_MS = 1600;

interface MiniAssistantProps {
  userId: string;
  /** The page the user is on — a fixed identifier, never the path */
  page: AiPage | undefined;
  /** /events/:id and /events/:id/santa: the event, for suggestions that fit it */
  eventId: string | null;
}

/**
 * The small Secret Santa AI in the corner of every app page (AppShell leaves it out
 * on /ai, where the full assistant is). It uses the same assistant API, as a general
 * conversation: it knows the page, never anyone's recipient.
 */
const MiniAssistant = ({ userId, page, eventId }: MiniAssistantProps) => {
  const { m } = useI18n();
  const t = m.miniAi;
  const [open, setOpen] = useState(false);
  /** Opened from the first-visit bubble: the panel starts with the welcome */
  const [welcome, setWelcome] = useState(false);
  const [onboarded, markOnboarded] = useMiniOnboarded(userId);
  const [teaserReady, setTeaserReady] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // First visit on this device: a small bubble after a moment — once, never again
  useEffect(() => {
    if (onboarded) return;
    const timer = setTimeout(() => setTeaserReady(true), TEASER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [onboarded]);
  const showTeaser = teaserReady && !onboarded && !open;

  const openPanel = (withWelcome: boolean) => {
    setWelcome(withWelcome);
    setOpen(true);
    markOnboarded();
  };

  const close = () => {
    setOpen(false);
    // Back to where the user was: the button that opened it
    requestAnimationFrame(() => launcherRef.current?.focus());
  };

  return (
    <div className={`${scss.root} ${open ? scss.isOpen : ""}`}>
      {showTeaser && (
        <div className={scss.teaser} role="status">
          <button type="button" className={scss.teaserClose} onClick={markOnboarded} aria-label={t.teaserDismiss}>
            <PiXBold aria-hidden="true" />
          </button>
          <p className={scss.teaserText}>
            <PiSparkleFill className="icon-sparkle" aria-hidden="true" />
            {t.teaser}
          </p>
          <div className={scss.teaserActions}>
            <button type="button" className="btn btn-primary" onClick={() => openPanel(true)}>
              {t.teaserAction}
            </button>
            <button type="button" className="btn btn-ghost" onClick={markOnboarded}>
              {t.teaserDismiss}
            </button>
          </div>
        </div>
      )}

      {open && (
        <MiniAssistantPanel userId={userId} page={page} eventId={eventId} welcome={welcome} onClose={close} />
      )}

      <button
        ref={launcherRef}
        type="button"
        className={scss.launcher}
        aria-label={open ? t.close : t.open}
        aria-expanded={open}
        aria-controls={open ? "mini-ai" : undefined}
        onClick={() => (open ? close() : openPanel(false))}
        // Start fetching the chat's code as soon as the user reaches for it
        onPointerEnter={() => void loadPanel()}
        onFocus={() => void loadPanel()}
      >
        <span className={scss.medallion} aria-hidden="true">
          {open ? <PiXBold className={scss.closeIcon} /> : <GiftBox size={26} className="icon-float" />}
        </span>
        {!open && <PiSparkleFill className={`icon-sparkle ${scss.sparkle}`} aria-hidden="true" />}
        <span className={scss.tooltip} aria-hidden="true">
          {open ? t.close : t.open}
        </span>
      </button>
    </div>
  );
};

export default MiniAssistant;
