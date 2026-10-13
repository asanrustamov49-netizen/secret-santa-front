import Link from "next/link";
import { PiArrowLeftBold, PiArrowUpRight, PiCalendarCheckBold, PiCheckCircleFill } from "react-icons/pi";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import GuideButton from "@/components/ui/guideButton/GuideButton";
import LanguageSwitcher from "@/components/ui/languageSwitcher/LanguageSwitcher";
import { getI18n } from "@/i18n/server";
import type { LegalSection } from "@/i18n/messages/legal";
import scss from "./legal.module.scss";

interface LegalDocument {
  title: string;
  /** When this version was published, as a date in the reader's language */
  date: string;
  intro: string[];
  /** "In short" — the few points that matter most */
  highlights: string[];
  sections: LegalSection[];
}

interface LegalPageProps {
  doc: LegalDocument;
  /** The other legal page, linked at the end */
  other: { href: string; label: string };
}

/**
 * Terms of Service and Privacy Policy: a calm, readable page in the product's style —
 * a night hero, a table of contents (sticky beside the text on wide screens, folded
 * above it on phones), short sections. Server-rendered: no JavaScript to read it.
 */
const LegalPage = async ({ doc, other }: LegalPageProps) => {
  const { m } = await getI18n();
  const t = m.legal;
  const toc = (
    <ol className={scss.tocList}>
      {doc.sections.map((section) => (
        <li key={section.id}>
          <a href={`#${section.id}`}>{section.title}</a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className={scss.page}>
      <header className={scss.hero} data-theme="dark">
        <div className={scss.bar}>
          <Link href="/" className={scss.logo}>
            <GiftBox size={28} />
            {m.common.logo}
          </Link>
          <LanguageSwitcher />
        </div>

        <div className={scss.heroInner}>
          <Link href="/" className={`touch-target ${scss.back}`}>
            <PiArrowLeftBold className="icon-nudge-back" aria-hidden="true" /> {t.backHome}
          </Link>
          <h1 className={scss.title}>{doc.title}</h1>
          <p className={scss.updated}>
            <PiCalendarCheckBold aria-hidden="true" /> {t.updated(doc.date)}
          </p>
        </div>
      </header>

      <main id="main" tabIndex={-1} className={scss.layout}>
        {/* Wide screens: always open, sticky beside the text. Phones: folded above it */}
        <nav className={scss.toc} aria-labelledby="legal-toc">
          <p id="legal-toc" className={scss.tocTitle}>
            {t.toc}
          </p>
          {toc}
        </nav>
        <details className={scss.tocMobile}>
          <summary className={scss.tocTitle}>{t.toc}</summary>
          <nav aria-label={t.toc}>{toc}</nav>
        </details>

        <article className={scss.article}>
          <div className={scss.intro}>
            {doc.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {doc.highlights.length > 0 && (
            <aside className={`surface-card ${scss.highlights}`} aria-labelledby="legal-summary">
              <h2 id="legal-summary" className={scss.highlightsTitle}>
                {t.summary}
              </h2>
              <ul>
                {doc.highlights.map((point) => (
                  <li key={point}>
                    <PiCheckCircleFill aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {doc.sections.map((section, index) => (
            <section key={section.id} id={section.id} className={scss.section} aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`} className={scss.sectionTitle}>
                <span className={scss.number}>{index + 1}</span>
                {section.title}
              </h2>
              {section.text.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.defs.length > 0 && (
                <dl className={scss.defs}>
                  {section.defs.map((def) => (
                    <div key={def.term}>
                      <dt>{def.term}</dt>
                      <dd>{def.text}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {section.items.length > 0 && (
                <ul className={scss.list}>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.after.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}

          <footer className={scss.end}>
            <p>{t.readAlso}</p>
            <div className={scss.endLinks}>
              <Link href={other.href} className="btn btn-outline">
                {other.label} <PiArrowUpRight aria-hidden="true" />
              </Link>
              <GuideButton className="btn btn-ghost">{m.onboarding.reopen}</GuideButton>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
};

export default LegalPage;
