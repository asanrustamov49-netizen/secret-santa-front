"use client";
import { useState } from "react";
import { PiCheckBold } from "react-icons/pi";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./events.module.scss";

const STEPS = ["idea", "bought", "wrapped", "given"] as const;

type Done = Partial<Record<(typeof STEPS)[number], boolean>>;

const storageKey = (eventId: string) => `gift-checklist:${eventId}`;

function load(eventId: string): Done {
  try {
    return JSON.parse(localStorage.getItem(storageKey(eventId)) ?? "{}") as Done;
  } catch {
    return {};
  }
}

/** A private little to-do for the giver. Lives in this browser only — nobody else sees it. */
const GiftChecklist = ({ eventId }: { eventId: string }) => {
  // Client-only page (inside AppShell), so reading storage on first render is safe
  const [done, setDone] = useState<Done>(() => load(eventId));
  const count = STEPS.filter((key) => done[key]).length;
  const { m } = useI18n();
  const t = m.events.checklist;

  const toggle = (key: keyof Done) => {
    const next = { ...done, [key]: !done[key] };
    setDone(next);
    try {
      localStorage.setItem(storageKey(eventId), JSON.stringify(next));
    } catch {
      // Storage blocked — the ticks just won't be remembered
    }
  };

  return (
    <section className={`surface-card ${scss.panel}`} aria-labelledby="checklist-title">
      <header className={scss.panelHeader}>
        <h2 id="checklist-title" className={scss.panelTitle}>
          {t.title}
        </h2>
        <span className={scss.count}>
          {count}/{STEPS.length}
        </span>
      </header>
      <ul className={scss.checklist}>
        {STEPS.map((key) => (
          <li key={key}>
            <button
              type="button"
              role="checkbox"
              aria-checked={Boolean(done[key])}
              className={`${scss.checkItem} ${done[key] ? scss.checked : ""}`}
              onClick={() => toggle(key)}
            >
              <span className={scss.checkBox} aria-hidden="true">
                {done[key] && <PiCheckBold />}
              </span>
              {t.steps[key]}
            </button>
          </li>
        ))}
      </ul>
      <p className={scss.panelNote}>{t.private}</p>
    </section>
  );
};

export default GiftChecklist;
