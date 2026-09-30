import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Privacy Policy | Secret Santa",
  description:
    "Privacy Policy for Secret Santa. Learn how we collect, use, and protect your information.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function PrivacyPolicyPage() {
  const { m } = await getI18n();
  const t = m.privacy;

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

        <Section title={`1. ${t.introduction.title}`}>
          {t.introduction.text.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </Section>

        <Section title={`2. ${t.information.title}`}>
          <p>{t.information.intro}</p>

          <ul>
            <li>
              <strong>{t.information.items.account.split(":")[0]}:</strong>{" "}
              {t.information.items.account.split(":").slice(1).join(":").trim()}
            </li>
            <li>
              <strong>
                {t.information.items.authentication.split(":")[0]}:
              </strong>{" "}
              {t.information.items.authentication
                .split(":")
                .slice(1)
                .join(":")
                .trim()}
            </li>
            <li>
              <strong>{t.information.items.profile.split(":")[0]}:</strong>{" "}
              {t.information.items.profile.split(":").slice(1).join(":").trim()}
            </li>
            <li>
              <strong>{t.information.items.events.split(":")[0]}:</strong>{" "}
              {t.information.items.events.split(":").slice(1).join(":").trim()}
            </li>
            <li>
              <strong>{t.information.items.messages.split(":")[0]}:</strong>{" "}
              {t.information.items.messages
                .split(":")
                .slice(1)
                .join(":")
                .trim()}
            </li>
            <li>
              <strong>{t.information.items.technical.split(":")[0]}:</strong>{" "}
              {t.information.items.technical
                .split(":")
                .slice(1)
                .join(":")
                .trim()}
            </li>
          </ul>
        </Section>

        <Section title={`3. ${t.google.title}`}>
          {t.google.text.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </Section>

        <Section title={`4. ${t.usage.title}`}>
          <p>{t.usage.intro}</p>

          <ul>
            <li>{t.usage.items.account}</li>
            <li>{t.usage.items.authentication}</li>
            <li>{t.usage.items.events}</li>
            <li>{t.usage.items.participants}</li>
            <li>{t.usage.items.matching}</li>
            <li>{t.usage.items.recipient}</li>
            <li>{t.usage.items.wishlist}</li>
            <li>{t.usage.items.chat}</li>
            <li>{t.usage.items.ai}</li>
            <li>{t.usage.items.security}</li>
          </ul>
        </Section>

        <Section title={`5. ${t.secretSantaPrivacy.title}`}>
          {t.secretSantaPrivacy.text.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </Section>

        <Section title={`6. ${t.ai.title}`}>
          {t.ai.text.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </Section>

        <Section title={`7. ${t.cookies.title}`}>
          {t.cookies.text.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </Section>

        <Section title={`8. ${t.security.title}`}>
          {t.security.text.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </Section>

        <Section title={`9. ${t.retention.title}`}>
          {t.retention.text.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </Section>

        <Section title={`10. ${t.thirdParty.title}`}>
          {t.thirdParty.text.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </Section>

        <Section title={`11. ${t.children.title}`}>
          {t.children.text.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </Section>

        <Section title={`12. ${t.changes.title}`}>
          {t.changes.text.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </Section>

        <Section title={`13. ${t.contact.title}`}>
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
    <section style={{ marginBottom: "42px" }}>
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
