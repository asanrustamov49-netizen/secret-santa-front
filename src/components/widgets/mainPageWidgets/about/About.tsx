import type { IconType } from "react-icons";
import {
  PiCoinsFill,
  PiGiftFill,
  PiHeartFill,
  PiLinkBold,
  PiLockSimpleFill,
  PiSparkleFill,
} from "react-icons/pi";
import Reveal from "@/components/ui/reveal/Reveal";
import SectionHeading from "@/components/ui/sectionHeading/SectionHeading";
import { getI18n } from "@/i18n/server";
import scss from "./about.module.scss";

// Look of each perk; the words come from m.landing.about.perks, in the same order
const PERKS: { icon: IconType; tone: string }[] = [
  { icon: PiGiftFill, tone: "gold" },
  { icon: PiLockSimpleFill, tone: "gold" },
  { icon: PiHeartFill, tone: "crimson" },
  { icon: PiCoinsFill, tone: "gold" },
  { icon: PiLinkBold, tone: "snow" },
  { icon: PiSparkleFill, tone: "purple" },
];

const About = async () => {
  const { m } = await getI18n();
  const t = m.landing.about;

  return (
    <section id="about" className={`section ${scss.section}`} aria-labelledby="about-title">
      <div className="container">
        <SectionHeading
          id="about-title"
          title={t.title}
          subtitle={t.subtitle}
        />

        <ul className={scss.grid}>
          {PERKS.map(({ icon: Icon, tone }, i) => {
            const { title, text } = t.perks[i];
            return (
            <Reveal as="li" key={title} delay={(i % 3) * 100} className={`surface-card ${scss.perk}`}>
              <span className={`${scss.icon} ${scss[tone]}`} aria-hidden="true">
                <Icon />
              </span>
              <h3 className={scss.title}>{title}</h3>
              <p className={scss.text}>{text}</p>
            </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default About;
