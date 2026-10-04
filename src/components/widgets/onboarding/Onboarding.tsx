"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PiXBold } from "react-icons/pi";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import { markOnboardingSeen, openGuide, useGuide, useOnboardingSeen } from "@/lib/onboarding/onboarding";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./onboarding.module.scss";

// The tour itself (steps, illustrations, dialog) loads only when someone opens it
const loadGuide = () => import("./GuideDialog");
const GuideDialog = dynamic(loadGuide, { ssr: false });

/** Let the page settle before the welcome appears */
const TEASER_DELAY_MS = 1200;

/**
 * First visit on this device — on whatever page it happens (landing, /login, /terms,
 * an invite link, the app): a small welcome in the corner, once. "Show me" opens the
 * product tour; closing it counts as seen. Mounted once at the root, it also hosts the
 * tour when Settings or the footer reopen it.
 */
const Onboarding = () => {
  const { m } = useI18n();
  const t = m.onboarding;
  const seen = useOnboardingSeen();
  const open = useGuide((state) => state.open);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (seen) return;
    const timer = setTimeout(() => setReady(true), TEASER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [seen]);

  return (
    <>
      {ready && !seen && !open && (
        <aside className={scss.teaser} aria-labelledby="onboarding-teaser-title">
          <button type="button" className={scss.close} onClick={markOnboardingSeen} aria-label={t.close} title={t.close}>
            <PiXBold aria-hidden="true" />
          </button>
          <span className={scss.gift} aria-hidden="true">
            <GiftBox size={34} />
          </span>
          <div className={scss.copy}>
            <p id="onboarding-teaser-title" className={scss.title}>
              {t.teaserTitle}
            </p>
            <p className={scss.text}>{t.teaserText}</p>
            <button
              type="button"
              className={`btn btn-primary ${scss.show}`}
              onClick={openGuide}
              // Start fetching the tour as soon as someone reaches for it
              onPointerEnter={() => void loadGuide()}
              onFocus={() => void loadGuide()}
            >
              {t.show}
            </button>
          </div>
        </aside>
      )}

      {open && <GuideDialog />}
    </>
  );
};

export default Onboarding;
