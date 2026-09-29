import type { CSSProperties } from "react";
import Link from "next/link";
import StartLink from "@/components/ui/startLink/StartLink";
import { PiGiftFill, PiSparkleFill } from "react-icons/pi";
import NightSky from "@/components/ui/nightSky/NightSky";
import Snowfall from "@/components/ui/snowfall/Snowfall";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import HeroMatchCard from "./HeroMatchCard";
import { getI18n } from "@/i18n/server";
import scss from "./hero.module.scss";

// Staggered entrance: each element gets its own delay via --delay
const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

const Hero = async () => {
  const { m } = await getI18n();
  const t = m.landing.hero;

  return (
    <section className={scss.hero} aria-labelledby="hero-title" data-theme="dark">
      <NightSky variant="hero" />
      <Snowfall />

      <div className={`container ${scss.inner}`}>
        <div className={scss.content}>
          <p className={`${scss.badge} ${scss.reveal}`} style={delay(100)}>
            <PiSparkleFill aria-hidden="true" />
            {t.badge}
          </p>

          <h1 id="hero-title" className={scss.title}>
            <span className={`${scss.line} ${scss.white} ${scss.reveal}`} style={delay(200)}>
              {t.line1}
            </span>
            <span className={`${scss.line} ${scss.gold} ${scss.reveal}`} style={delay(380)}>
              {t.line2}
            </span>
            <span className={`${scss.line} ${scss.white} ${scss.reveal}`} style={delay(560)}>
              {t.line3}
            </span>
          </h1>

          <p className={`${scss.subtitle} ${scss.reveal}`} style={delay(760)}>
            {t.subtitle}
          </p>

          <div className={`${scss.actions} ${scss.reveal}`} style={delay(900)}>
            <StartLink className="btn btn-primary btn-lg btn-glow">
              <PiGiftFill aria-hidden="true" />
              {t.create}
            </StartLink>
            <Link href="/join" className="btn btn-glass btn-lg">
              {t.join}
            </Link>
          </div>
        </div>

        <div className={`${scss.visual} ${scss.revealVisual}`} style={delay(700)}>
          <div className={scss.bigGift}>
            <GiftBox size={250} glow sparkles />
          </div>
          <HeroMatchCard />
        </div>
      </div>

      <a href="#how-it-works" className={`${scss.scrollHint} ${scss.reveal}`} style={delay(1300)}>
        <span>{t.scroll}</span>
        <span className={scss.scrollLine} aria-hidden="true" />
      </a>
    </section>
  );
};

export default Hero;
