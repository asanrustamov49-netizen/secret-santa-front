import type { ReactNode } from "react";
import { PiLinkBold, PiTreeEvergreenFill } from "react-icons/pi";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import Reveal from "@/components/ui/reveal/Reveal";
import SectionHeading from "@/components/ui/sectionHeading/SectionHeading";
import { getI18n } from "@/i18n/server";
import scss from "./howItWorks.module.scss";

// Create · Invite · Reveal — the words come from the dictionary, in this order
const ICONS: ReactNode[] = [
  <PiTreeEvergreenFill key="create" className={scss.tree} />,
  <PiLinkBold key="invite" className={scss.link} />,
  <GiftBox key="reveal" size={30} />,
];

const HowItWorks = async () => {
  const { m } = await getI18n();
  const t = m.landing.how;

  return (
    <section id="how-it-works" className={`section ${scss.section}`} aria-labelledby="how-title">
      <div className="container">
        <SectionHeading
          id="how-title"
          eyebrow={t.eyebrow}
          title={
            <>
              {t.title1}
              <br />
              {t.title2}
            </>
          }
        />

        <ol className={scss.steps}>
          {t.steps.map((step, i) => {
            const number = String(i + 1).padStart(2, "0");
            return (
              <Reveal as="li" key={step.title} delay={i * 120} className={`surface-card ${scss.step}`}>
                <span className={scss.number} aria-hidden="true">
                  {number}
                </span>
                <span className={scss.icon} aria-hidden="true">
                  {ICONS[i]}
                </span>
                <p className={scss.label}>{t.step(number)}</p>
                <h3 className={scss.title}>{step.title}</h3>
                <p className={scss.text}>{step.text}</p>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
