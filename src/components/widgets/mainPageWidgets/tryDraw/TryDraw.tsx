import Reveal from "@/components/ui/reveal/Reveal";
import SectionHeading from "@/components/ui/sectionHeading/SectionHeading";
import { getI18n } from "@/i18n/server";
import TryDrawPlayground from "./TryDrawPlayground";
import scss from "./tryDraw.module.scss";

/** "Try it": a demo draw right on the landing page — names in, pairs out, nothing sent anywhere */
const TryDraw = async () => {
  const { m } = await getI18n();
  const t = m.landing.tryDraw;

  return (
    <section id="try" className={`section ${scss.section}`} aria-labelledby="try-title">
      <div className="container">
        <SectionHeading id="try-title" eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
        <Reveal delay={120} className={scss.stage}>
          <TryDrawPlayground />
        </Reveal>
      </div>
    </section>
  );
};

export default TryDraw;
