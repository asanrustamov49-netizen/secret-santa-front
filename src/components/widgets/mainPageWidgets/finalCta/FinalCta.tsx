import StartLink from "@/components/ui/startLink/StartLink";
import { PiGiftFill } from "react-icons/pi";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import NightSky from "@/components/ui/nightSky/NightSky";
import Reveal from "@/components/ui/reveal/Reveal";
import Snowfall from "@/components/ui/snowfall/Snowfall";
import { getI18n } from "@/i18n/server";
import scss from "./finalCta.module.scss";

// The closing "Christmas moment" — same night sky as the hero, framed in a card
const FinalCta = async () => {
  const { m } = await getI18n();
  const t = m.landing.cta;

  return (
    <section className={`section ${scss.section}`} aria-labelledby="cta-title">
      <div className="container">
        <Reveal className={scss.frame} data-theme="dark">
          <NightSky variant="cta" />
          <Snowfall bokeh={false} />

          <div className={scss.content}>
            <GiftBox size={120} glow sparkles className={scss.gift} />
            <h2 id="cta-title" className={scss.title}>
              {t.title} <span className={scss.gold}>{t.titleAccent}</span>
            </h2>
            <p className={scss.text}>{t.text}</p>
            <StartLink className="btn btn-primary btn-lg btn-glow">
              <PiGiftFill aria-hidden="true" />
              {t.button}
            </StartLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FinalCta;
