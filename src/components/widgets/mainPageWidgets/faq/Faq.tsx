import Link from "next/link";
import { PiSparkleFill } from "react-icons/pi";
import Reveal from "@/components/ui/reveal/Reveal";
import SectionHeading from "@/components/ui/sectionHeading/SectionHeading";
import { getI18n } from "@/i18n/server";
import scss from "./faq.module.scss";

/**
 * The questions people ask before their first draw. Native <details> sharing one name:
 * opening a question closes the previous one, keyboard and screen readers work as is,
 * and the height eases open where the browser can animate to "auto". The same answers
 * go to search engines as FAQPage structured data.
 */
const Faq = async () => {
  const { m } = await getI18n();
  const t = m.landing.faq;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <section id="faq" className={`section ${scss.section}`} aria-labelledby="faq-title">
      <div className={`container ${scss.layout}`}>
        <div className={scss.intro}>
          <SectionHeading id="faq-title" eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} align="left" />
          <Reveal delay={120}>
            <Link href="/ai" className="btn btn-magic">
              <PiSparkleFill className="icon-sparkle" aria-hidden="true" />
              {t.askAi}
            </Link>
          </Reveal>
        </div>

        <div className={scss.list}>
          {t.items.map(({ q, a }, i) => (
            <Reveal key={q} delay={i * 70}>
              <details name="faq" className={scss.item} open={i === 0}>
                <summary className={scss.question}>
                  <span className={scss.number} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={scss.questionText}>{q}</span>
                  <span className={scss.toggle} aria-hidden="true" />
                </summary>
                <div className={scss.answer}>
                  <p>{a}</p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>

      <script
        type="application/ld+json"
        // Our own text, escaped so nothing in it can close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </section>
  );
};

export default Faq;
