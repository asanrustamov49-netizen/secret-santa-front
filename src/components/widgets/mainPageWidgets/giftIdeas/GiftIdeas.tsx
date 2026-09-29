import StartLink from "@/components/ui/startLink/StartLink";
import {
  PiCoffeeFill,
  PiGameControllerFill,
  PiHeadphones,
  PiSoccerBallFill,
  PiSparkleFill,
} from "react-icons/pi";
import Reveal from "@/components/ui/reveal/Reveal";
import { getI18n } from "@/i18n/server";
import scss from "./giftIdeas.module.scss";

// Demo output of the AI assistant
// Icons and scores; names and prices come from m.landing.ai.ideas, in the same order
const IDEAS = [
  { icon: PiHeadphones, match: 97 },
  { icon: PiSoccerBallFill, match: 89 },
  { icon: PiCoffeeFill, match: 84 },
  { icon: PiGameControllerFill, match: 78 },
];

const GiftIdeas = async () => {
  const { m } = await getI18n();
  const t = m.landing.ai;

  return (
    <section id="gift-ideas" className={`section ${scss.section}`} aria-labelledby="ai-title">
      <div className="container">
        <Reveal className={scss.panel} data-theme="dark">
          <div className={scss.copy}>
            <p className={scss.badge}>
              <PiSparkleFill aria-hidden="true" />
              {t.badge}
            </p>
            <h2 id="ai-title" className={scss.title}>
              {t.title1}
              <br />
              {t.title2}
            </h2>
            <p className={scss.text}>
              {t.text}
            </p>
            <StartLink className={`btn btn-magic btn-lg ${scss.cta}`}>
              <PiSparkleFill aria-hidden="true" />
              {t.cta}
            </StartLink>
          </div>

          <div className={scss.assistant} aria-label={t.exampleLabel}>
            <header className={scss.assistantHead}>
              <span className={scss.assistantIcon} aria-hidden="true">
                <PiSparkleFill />
              </span>
              <div>
                <p className={scss.assistantTitle}>{t.for}</p>
                <p className={scss.assistantMeta}>{t.budget}</p>
              </div>
            </header>

            <ol className={scss.ideas}>
              {IDEAS.map(({ icon: Icon, match }, i) => {
                const { name, price } = t.ideas[i];
                return (
                <Reveal as="li" key={name} delay={200 + i * 110} className={scss.idea}>
                  <Icon className={scss.ideaIcon} aria-hidden="true" />
                  <span className={scss.ideaText}>
                    <span className={scss.ideaName}>{name}</span>
                    <span className={scss.ideaPrice}>{price}</span>
                  </span>
                  <span className={scss.match} aria-label={t.match(match)}>
                    {match}%
                  </span>
                </Reveal>
                );
              })}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default GiftIdeas;
