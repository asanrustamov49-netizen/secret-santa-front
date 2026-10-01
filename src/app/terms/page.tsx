import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Terms of Service | Secret Santa",
  description:
    "Terms of Service for using the Secret Santa website and application.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function TermsPage() {
  const { m } = await getI18n();
  const t = m.terms;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 0%, rgba(245,198,61,0.08), transparent 35%), #07101f",
        color: "#f5f7ff",
        padding: "80px 20px",
      }}
    >
      <article
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          lineHeight: 1.75,
        }}
      >
        <div style={{ marginBottom: "48px" }}>
          <p
            style={{
              color: "#f5c63d",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Secret Santa
          </p>

          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              lineHeight: 1.1,
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            {t.title}
          </h1>

          <p
            style={{
              color: "#aeb8c8",
              marginTop: "16px",
              fontSize: "15px",
            }}
          >
            {t.lastUpdated}
          </p>
        </div>

        <Section title={t.acceptance.title}>
          {t.acceptance.text.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </Section>

        <Section title={t.service.title}>
          {t.service.text.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </Section>

        <Section title={t.accounts.title}>
          {t.accounts.text.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </Section>

        <Section title={t.events.title}>
          {t.events.text.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </Section>

        <Section title={t.assignments.title}>
          {t.assignments.text.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </Section>

        <Section title={t.userContent.title}>
          {t.userContent.text.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </Section>

        <Section title={t.chat.title}>
          {t.chat.text.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </Section>

        <Section title={t.ai.title}>
          {t.ai.text.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </Section>

        <Section title={t.prohibited.title}>
          <p>{t.prohibited.intro}</p>

          <ul>
            <li>{t.prohibited.items.unlawful}</li>
            <li>{t.prohibited.items.account}</li>
            <li>{t.prohibited.items.assignments}</li>
            <li>{t.prohibited.items.security}</li>
            <li>{t.prohibited.items.malicious}</li>
            <li>{t.prohibited.items.impersonate}</li>
            <li>{t.prohibited.items.harassment}</li>
          </ul>
        </Section>

        <Section title={t.availability.title}>
          {t.availability.text.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </Section>

        <Section title={t.thirdParty.title}>
          {t.thirdParty.text.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </Section>

        <Section title={t.changes.title}>
          {t.changes.text.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </Section>

        <Section title={t.termination.title}>
          {t.termination.text.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </Section>

        <Section title={t.disclaimer.title}>
          <p>{t.disclaimer.text}</p>
        </Section>

        <Section title={t.contact.title}>
          <p>{t.contact.text}</p>
        </Section>

        <FooterNote />
      </article>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        marginBottom: "42px",
      }}
    >
      <h2
        style={{
          fontSize: "24px",
          lineHeight: 1.3,
          marginBottom: "16px",
          color: "#ffffff",
        }}
      >
        {title}
      </h2>

      <div
        style={{
          color: "#c1cada",
          fontSize: "16px",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function FooterNote() {
  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.1)",
        paddingTop: "28px",
        color: "#7d8798",
        fontSize: "14px",
      }}
    >
      Secret Santa — a simple way to make gift exchanges more magical. 🎁
    </div>
  );
}