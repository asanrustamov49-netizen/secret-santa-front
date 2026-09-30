import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Secret Santa",
  description:
    "Privacy Policy for Secret Santa. Learn how we collect, use, and protect your information.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
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
            Privacy Policy
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

        <Section title="1. Introduction">
          <p>
            Secret Santa is a service that helps friends, families, students,
            teams, and other groups organize Secret Santa gift exchanges.
          </p>

          <p>
            This Privacy Policy explains what information we collect, how we use
            it, and how we protect it when you use the Secret Santa website and
            application.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>Depending on how you use the service, we may collect:</p>

          <ul>
            <li>
              <strong>Account information:</strong> name and email address.
            </li>
            <li>
              <strong>Authentication information:</strong> information necessary
              to authenticate your account.
            </li>
            <li>
              <strong>Profile information:</strong> avatar, interests, and
              wishlist information that you choose to provide.
            </li>
            <li>
              <strong>Event information:</strong> event names, dates, budgets,
              participants, and related event settings.
            </li>
            <li>
              <strong>Messages:</strong> messages you send through available
              event chat or AI assistant features.
            </li>
            <li>
              <strong>Technical information:</strong> information necessary to
              keep the service secure and functioning properly.
            </li>
          </ul>
        </Section>

        <Section title="3. Google Sign-In">
          <p>
            You may create or access your Secret Santa account using Google
            Sign-In.
          </p>

          <p>
            When you use Google Sign-In, we may receive information provided by
            Google according to the permissions you authorize, such as your
            name, email address, profile picture, and Google account identifier.
          </p>

          <p>
            We use this information to create and authenticate your Secret Santa
            account.
          </p>
        </Section>

        <Section title="4. How We Use Your Information">
          <p>We use collected information to:</p>

          <ul>
            <li>create and manage your account;</li>
            <li>authenticate you securely;</li>
            <li>create and manage Secret Santa events;</li>
            <li>allow participants to join events;</li>
            <li>perform Secret Santa participant matching;</li>
            <li>display the recipient information available to you;</li>
            <li>provide wishlist and gift suggestion features;</li>
            <li>provide event chat functionality;</li>
            <li>provide the AI assistant when you choose to use it;</li>
            <li>
              maintain and improve the security and reliability of the service.
            </li>
          </ul>
        </Section>

        <Section title="5. Secret Santa Privacy">
          <p>
            Secret Santa is designed so that participants do not receive the
            complete list of gift assignments.
          </p>

          <p>
            A participant can see the recipient assigned to them when the Secret
            Santa draw has been revealed. Information about other assignments is
            not intentionally exposed through the normal user interface.
          </p>
        </Section>

        <Section title="6. AI Assistant">
          <p>
            Secret Santa may provide AI-powered features such as gift ideas and
            assistance with using the service.
          </p>

          <p>
            When you use these features, relevant information may be processed
            to generate a response. The application is designed to provide the
            AI assistant only with the information necessary for the requested
            feature.
          </p>

          <p>
            You should avoid sending passwords, payment information, or other
            highly sensitive personal information to the AI assistant.
          </p>
        </Section>

        <Section title="7. Cookies and Local Storage">
          <p>
            The service may use cookies and browser storage to maintain
            authentication, language preferences, interface preferences, and
            other functionality required by the application.
          </p>

          <p>
            Some cookies are necessary for the service to operate securely,
            including authentication and session management.
          </p>
        </Section>

        <Section title="8. Data Security">
          <p>
            We use reasonable technical and organizational measures designed to
            protect account information and application data against
            unauthorized access, alteration, disclosure, or destruction.
          </p>

          <p>
            No internet service can guarantee absolute security, so users should
            also take reasonable steps to protect their accounts and
            credentials.
          </p>
        </Section>

        <Section title="9. Data Retention and Deletion">
          <p>
            We retain information for as long as reasonably necessary to provide
            the service, maintain accounts, operate events, and meet legitimate
            technical and security requirements.
          </p>

          <p>
            If account deletion functionality is available in your account
            settings, you may use it to request deletion of your account and
            associated information.
          </p>
        </Section>

        <Section title="10. Third-Party Services">
          <p>
            The service may rely on third-party providers for services such as
            authentication, hosting, databases, and AI processing.
          </p>

          <p>
            Such providers may process information as necessary to provide their
            services and are subject to their own terms and privacy policies.
          </p>
        </Section>

        <Section title="11. Children's Privacy">
          <p>
            Secret Santa is intended to be used with appropriate permission and
            supervision where required by applicable law or by the rules of a
            school, organization, or event.
          </p>

          <p>
            We do not knowingly collect personal information from children in
            circumstances where such collection is prohibited by applicable law.
          </p>
        </Section>

        <Section title="12. Changes to This Policy">
          <p>
            We may update this Privacy Policy when the service or applicable
            requirements change.
          </p>

          <p>
            The updated version will be published on this page together with its
            updated date.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            If you have questions about this Privacy Policy or the handling of
            your information, please contact the Secret Santa service
            administrator through the contact method provided on the website.
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
