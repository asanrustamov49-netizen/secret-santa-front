import type { ReactNode } from "react";
import Link from "next/link";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import NightSky from "@/components/ui/nightSky/NightSky";
import Snowfall from "@/components/ui/snowfall/Snowfall";
import scss from "./status.module.scss";

interface StatusSceneProps {
  /** Big gold numeral behind the gift ("404"); none for errors */
  code?: string;
  title: string;
  text: string;
  /** Buttons / links, already styled (btn classes) */
  actions: ReactNode;
  /** Small print under the actions, e.g. an error id to quote */
  footnote?: ReactNode;
  /**
   * full: the whole screen, with the logo — a page of its own (404, global error).
   * inline: fills the content area of the app shell, so the sidebar stays.
   */
  layout?: "full" | "inline";
  /** The logo's text; full layout only */
  logo?: string;
}

/**
 * Not found / something went wrong, in the product's night-sky style.
 * No data, no i18n of its own: server and client error pages pass the words in.
 */
const StatusScene = ({ code, title, text, actions, footnote, layout = "full", logo }: StatusSceneProps) => {
  const Wrapper = layout === "full" ? "main" : "section";
  return (
    <Wrapper
      id={layout === "full" ? "main" : undefined}
      tabIndex={layout === "full" ? -1 : undefined}
      className={`${scss.scene} ${scss[layout]}`}
      data-theme="dark"
      // The first-visit teaser (widgets/onboarding) stays away from 404 and error pages
      data-status-scene=""
      aria-labelledby="status-title"
    >
      <NightSky variant="hero" />
      <Snowfall bokeh={false} />

      {layout === "full" && logo && (
        <Link href="/" className={scss.logo}>
          <GiftBox size={28} />
          {logo}
        </Link>
      )}

      <div className={scss.content}>
        <div className={scss.visual} aria-hidden="true">
          {code && <span className={scss.code}>{code}</span>}
          <GiftBox size={layout === "full" ? 132 : 104} glow sparkles className={scss.gift} />
        </div>

        <h1 id="status-title" className={scss.title}>
          {title}
        </h1>
        <p className={scss.text}>{text}</p>

        <div className={scss.actions}>{actions}</div>
        {footnote && <p className={scss.footnote}>{footnote}</p>}
      </div>
    </Wrapper>
  );
};

export default StatusScene;
