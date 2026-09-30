import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Secret Santa",
  description:
    "Terms of Service for using the Secret Santa website and application.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
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
            Terms of Service
          </h1>

          <p
            style={{
              color: "#aeb8c8",
              marginTop: "16px",
              fontSize: "15px",
            }}
          >
            Last updated: September 30, 2026
          </p>
        </div>

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using Secret Santa, you agree to these Terms of
            Service and to use the service in accordance with applicable laws
            and regulations.
          </p>

          <p>
            If you do not agree with these Terms, please do not use the service.
          </p>
        </Section>

        <Section title="2. About the Service">
          <p>
            Secret Santa provides tools for organizing gift exchanges between
            groups of people.
          </p>

          <p>
            Depending on the available features, the service may include event
            creation, participant invitations, Secret Santa matching, wishlists,
            event chat, and AI-powered gift suggestions.
          </p>
        </Section>

        <Section title="3. Accounts">
          <p>Some features require you to create an account.</p>

          <p>
            You are responsible for providing accurate information and for
            keeping your account credentials secure.
          </p>

          <p>
            You should not share your password or authentication credentials
            with other people.
          </p>
        </Section>

        <Section title="4. Secret Santa Events">
          <p>
            Event organizers are responsible for creating and managing their
            events, including selecting appropriate dates, budgets, and
            participant settings.
          </p>

          <p>
            Participants are responsible for providing accurate profile,
            interest, and wishlist information when they choose to provide it.
          </p>

          <p>
            Once a Secret Santa draw has been performed, some event settings may
            become restricted in order to preserve the integrity of the existing
            assignments.
          </p>
        </Section>

        <Section title="5. Gift Assignments">
          <p>
            Secret Santa uses an automated process to create gift assignments
            between event participants.
          </p>

          <p>
            The service is designed to prevent participants from being matched
            with themselves and to keep other participants' assignments private.
          </p>

          <p>
            Users are responsible for keeping their own recipient information
            private and should not intentionally attempt to discover another
            participant's assignment.
          </p>
        </Section>

        <Section title="6. User Content">
          <p>
            You may provide information such as your name, interests, wishlist,
            messages, and other content while using the service.
          </p>

          <p>
            You are responsible for the content you submit and should not submit
            content that is illegal, threatening, abusive, deceptive, or that
            violates another person's rights.
          </p>
        </Section>

        <Section title="7. Event Chat">
          <p>
            Some Secret Santa events may include a group chat that becomes
            available after the Secret Santa draw.
          </p>

          <p>
            Messages in event chat should be respectful and appropriate for the
            participants of the event.
          </p>

          <p>
            Do not use event chat to share passwords, payment credentials, or
            other highly sensitive information.
          </p>
        </Section>

        <Section title="8. AI Features">
          <p>
            Secret Santa may provide AI-powered features for gift ideas,
            wishlist assistance, and questions about the service.
          </p>

          <p>
            AI-generated suggestions are provided for informational purposes.
            They may be incomplete, inaccurate, or unsuitable for a particular
            situation.
          </p>

          <p>
            You remain responsible for deciding whether and how to use any
            suggestion provided by the AI assistant.
          </p>
        </Section>

        <Section title="9. Prohibited Use">
          <p>You agree not to:</p>

          <ul>
            <li>use the service for unlawful purposes;</li>
            <li>attempt to access another user's account;</li>
            <li>attempt to reveal private Secret Santa assignments;</li>
            <li>interfere with the security or operation of the service;</li>
            <li>send malicious code or automated abusive requests;</li>
            <li>impersonate another person or organization;</li>
            <li>use the service to harass or threaten other participants.</li>
          </ul>
        </Section>

        <Section title="10. Availability">
          <p>
            We aim to keep Secret Santa available and reliable, but we cannot
            guarantee uninterrupted access to the service.
          </p>

          <p>
            The service may occasionally be unavailable because of maintenance,
            updates, technical problems, or circumstances outside our control.
          </p>
        </Section>

        <Section title="11. Third-Party Services">
          <p>
            Secret Santa may integrate with third-party services such as Google
            authentication, hosting providers, databases, and AI providers.
          </p>

          <p>
            Your use of third-party services may also be subject to their own
            terms and policies.
          </p>
        </Section>

        <Section title="12. Changes to the Service">
          <p>
            We may add, modify, or remove features from Secret Santa as the
            service develops.
          </p>

          <p>
            We may also update these Terms when necessary. The latest version
            will be published on this page.
          </p>
        </Section>

        <Section title="13. Account Suspension or Termination">
          <p>
            Access to an account may be restricted or terminated if the account
            is used in violation of these Terms or in a way that threatens the
            security or operation of the service.
          </p>

          <p>You may stop using the service at any time.</p>
        </Section>

        <Section title="14. Disclaimer">
          <p>
            Secret Santa is provided on an “as available” basis. To the extent
            permitted by applicable law, we do not guarantee that the service
            will always be error-free, uninterrupted, or suitable for every
            particular purpose.
          </p>
        </Section>

        <Section title="15. Contact">
          <p>
            If you have questions about these Terms of Service, please contact
            the Secret Santa service administrator through the contact method
            provided on the website.
          </p>
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
