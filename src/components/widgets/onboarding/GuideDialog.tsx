"use client";
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import Link from "next/link";
import { PiArrowLeftBold, PiArrowRightBold, PiXBold } from "react-icons/pi";
import { closeGuide } from "@/lib/onboarding/onboarding";
import { useSessionHint } from "@/lib/auth/useSession";
import { useI18n } from "@/i18n/I18nProvider";
import GuideVisual, { GUIDE_STEPS } from "./GuideVisual";
import scss from "./guide.module.scss";

/**
 * The product tour: eleven short steps, from creating an event to the anonymous gift
 * chat. A native modal <dialog>: the page behind is inert, focus stays inside, Escape
 * (or the backdrop, or ×, or Skip) closes it — and every way out counts as seen.
 * Arrow keys move between steps. Loaded only when opened.
 */
const GuideDialog = () => {
  const { m } = useI18n();
  const t = m.onboarding;
  const signedIn = useSessionHint();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const id = GUIDE_STEPS[index];
  const step = t.steps[id];
  const total = GUIDE_STEPS.length;
  const last = index === total - 1;

  // Open as a modal; on the way out, focus goes back where the user was
  useEffect(() => {
    const dialog = dialogRef.current;
    const before = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (dialog && !dialog.open) dialog.showModal();
    // showModal focuses the first control (a progress dot); start on "Next" instead
    dialog?.querySelector<HTMLElement>("[data-primary]")?.focus();
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = overflow;
      if (dialog?.open) dialog.close();
      before?.focus();
    };
  }, []);

  // Next becomes Get started (a link) on the last step, and back: the main action keeps focus
  // (React's autoFocus skips links)
  useEffect(() => {
    dialogRef.current?.querySelector<HTMLElement>("[data-primary]")?.focus();
  }, [last]);

  // A new step starts at its top (long steps scroll on phones)
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [index]);

  const go = (next: number) => setIndex(Math.min(total - 1, Math.max(0, next)));

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowRight") go(index + 1);
    else if (event.key === "ArrowLeft") go(index - 1);
  };

  // A click on the backdrop (the dialog element itself, outside the card) closes it
  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) closeGuide();
  };

  return (
    <dialog
      ref={dialogRef}
      className={scss.dialog}
      aria-labelledby="guide-title"
      aria-describedby="guide-text"
      onCancel={(event) => {
        event.preventDefault(); // Escape: close through the store, so React unmounts it
        closeGuide();
      }}
      onKeyDown={onKeyDown}
      onClick={onClick}
    >
      <div className={scss.card} data-theme="dark">
        <header className={scss.top}>
          <p className={scss.counter} aria-live="polite">
            <span className="visually-hidden">{t.dialogLabel}: </span>
            {t.progress(index + 1, total)}
          </p>
          <ol className={scss.dots}>
            {GUIDE_STEPS.map((stepId, n) => (
              <li key={stepId}>
                <button
                  type="button"
                  className={`${scss.dot} ${n === index ? scss.dotActive : ""} ${n < index ? scss.dotDone : ""}`}
                  aria-label={t.stepLabel(n + 1, t.steps[stepId].title)}
                  aria-current={n === index ? "step" : undefined}
                  onClick={() => go(n)}
                />
              </li>
            ))}
          </ol>
          <div className={scss.topActions}>
            {!last && (
              <button type="button" className={scss.skip} onClick={closeGuide}>
                {t.skip}
              </button>
            )}
            <button type="button" className={scss.close} onClick={closeGuide} aria-label={t.close} title={t.close}>
              <PiXBold aria-hidden="true" />
            </button>
          </div>
        </header>

        <div ref={bodyRef} className={scss.body}>
          <div key={id} className={scss.step}>
            <div className={scss.visual} aria-hidden="true">
              <GuideVisual id={id} />
            </div>
            <div className={scss.copy}>
              <h2 id="guide-title" className={scss.title}>
                {step.title}
              </h2>
              <div id="guide-text" className={scss.text}>
                {step.text.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className={scss.actions}>
          <button type="button" className="btn btn-ghost" onClick={() => go(index - 1)} disabled={index === 0}>
            <PiArrowLeftBold className="icon-nudge-back" aria-hidden="true" />
            {t.back}
          </button>
          {last ? (
            <Link
              href={signedIn ? "/dashboard" : "/signup"}
              className="btn btn-primary btn-glow"
              onClick={closeGuide}
              data-primary
            >
              {signedIn ? t.startSignedIn : t.start}
              <PiArrowRightBold className="icon-nudge" aria-hidden="true" />
            </Link>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => go(index + 1)} data-primary>
              {t.next}
              <PiArrowRightBold className="icon-nudge" aria-hidden="true" />
            </button>
          )}
        </footer>
      </div>
    </dialog>
  );
};

export default GuideDialog;
