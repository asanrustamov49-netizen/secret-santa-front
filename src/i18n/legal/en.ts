import { legalSection } from "../messages/legal";

// English Privacy Policy and Terms of Use. Server-only: read by app/privacy and app/terms
// through getLegal(), never by client components, so they stay out of the browser bundle.

export const enLegal = {
  privacy: {
    title: "Privacy Policy",
    description:
      "What Secret Santa stores about you, why, who can see it, and how long it is kept.",
    date: "4 October 2026",
    intro: [
      "Secret Santa is a web app for organizing gift exchanges: events, invite links, a random draw, wishlists, chats and an AI gift assistant.",
      "This policy describes the data the app actually uses today — what it is, why it's needed and who can see it.",
    ],
    highlights: [
      "We store only what the app needs to work: your account, profile, events, messages and sessions.",
      "Your email is never shown to other participants.",
      "Each participant sees only their own pair. Not even the organizer sees who gives to whom.",
      "In the gift chat, your recipient never receives your name, picture or ID.",
      "There are no advertising or analytics trackers, and the app doesn't send you emails.",
    ],
    sections: [
      legalSection("data", "What we store", {
        text: ["Depending on what you use, the app stores:"],
        defs: [
          {
            term: "Account",
            text: "your name and email address. If you sign up with email, your password is stored only as a one-way hash (scrypt) — never as text.",
          },
          {
            term: "Google Sign-In",
            text: "your Google account ID, name, email address, whether Google has verified it, and a link to your profile picture. We don't receive your Google password and don't keep Google's access tokens.",
          },
          {
            term: "Profile",
            text: "your interests and your wishlist: gift names, approximate prices and optional links.",
          },
          {
            term: "Preferences",
            text: "your colour theme, saved to your account so all your devices use it. Your language is kept in a cookie (see below).",
          },
          {
            term: "Events",
            text: "events you create or join: name, description, date, budget, participant limit, invite link code, who takes part and when they joined.",
          },
          {
            term: "The draw",
            text: "who gives a gift to whom, and when you opened your own pair.",
          },
          {
            term: "Messages",
            text: "what you write in event chats and in the anonymous gift chat, with when it was sent, and when you last read each chat.",
          },
          {
            term: "AI assistant",
            text: "your conversations with the assistant.",
          },
          {
            term: "Sessions",
            text: "for each sign-in: a hashed session token, its expiry date and your browser's user-agent string, so you can recognise your devices.",
          },
        ],
        after: [
          "The app contains no advertising or analytics trackers.",
        ],
      }),
      legalSection("use", "How the data is used", {
        items: [
          "to sign you in and keep your session;",
          "to run events, invite links and the draw;",
          "to show your Secret Santa your name, interests and wishlist after the draw;",
          "to deliver chat messages and notifications in real time;",
          "to answer you with the AI assistant when you ask it;",
          "to protect the service — for example, to limit repeated requests and to end sessions.",
        ],
        after: ["The app doesn't send you emails, and your data isn't used for advertising."],
      }),
      legalSection("visibility", "Who sees what", {
        items: [
          "Participants of an event see your name, picture, whether you've filled in your profile, and your messages in the event chat.",
          "Your email address is never shown to other participants.",
          "Your interests and wishlist are shown to your Secret Santa — the one person who gives you a gift — after the draw.",
          "Each participant sees only their own recipient. The organizer doesn't see the pairs either.",
          "In the gift chat, your recipient sees your messages as coming from “Your Secret Santa”: the app never sends them your name, picture or ID. You see your recipient's name, because you already know who you're gifting.",
          "Anyone with an event's invite link sees a preview: the event's name, description, date and budget, the organizer's name, the number of participants, and the first names and pictures of up to six of them.",
        ],
      }),
      legalSection("google", "Google Sign-In", {
        text: [
          "You can sign up and sign in with Google. Google then tells us your account ID, name, email address, whether the address is verified, and a link to your profile picture.",
          "We use this only to create your account and sign you in. Google's own privacy policy applies to your Google account.",
        ],
      }),
      legalSection("ai", "AI assistant", {
        text: [
          "When you write to the AI assistant, your message and the earlier messages of that conversation are sent to an external AI model provider to generate the answer. The app supports Google Gemini and Anthropic Claude; which one is used depends on the service's configuration.",
          "For gift ideas in an event, the assistant also receives the event's name, date and budget, your name and interests, and your recipient's name, interests and wishlist. It doesn't receive email addresses, passwords or other people's pairs.",
          "Conversations are stored so you can return to them, and you can delete them. Please don't share passwords, payment details or other sensitive information with the assistant.",
        ],
      }),
      legalSection("cookies", "Cookies and browser storage", {
        text: ["The app uses only the cookies it needs to work:"],
        defs: [
          {
            term: "access_token",
            text: "keeps you signed in; lives 15 minutes and renews automatically. Not readable by page scripts (httpOnly).",
          },
          {
            term: "refresh_token",
            text: "renews your session for up to 30 days. Not readable by page scripts (httpOnly).",
          },
          {
            term: "has_session",
            text: "a hint without any secret that tells the site you're signed in.",
          },
          { term: "locale", text: "the language you chose." },
        ],
        after: [
          "Your browser's storage also keeps a few things that stay on your device: the colour theme, the menu's state, whether you've seen the welcome tour, the mini assistant's current conversation, your private gift checklist, where you stopped reading an event chat, and an unsaved draft of a new event.",
          "There are no third-party or advertising cookies.",
        ],
      }),
      legalSection("security", "Security", {
        items: [
          "Passwords and session tokens are stored only as hashes.",
          "Sign-in cookies can't be read by scripts on the page.",
          "Every request checks that you may see the data: that you're in the event, that it's your pair, that it's your chat.",
          "The database isn't reachable through any public interface — only through the app's API.",
          "In Settings you can log out of all devices at once.",
        ],
        after: ["No online service can be perfectly secure, so please keep your password to yourself."],
      }),
      legalSection("retention", "Keeping and deleting data", {
        items: [
          "You can change your profile and interests and delete wishlist items at any time.",
          "You can delete conversations with the AI assistant.",
          "An organizer can delete an event; this removes its participants, pairs, event chat and gift chats.",
          "Sessions end when you log out, after 30 days without renewal, or when you log out of all devices.",
          "When an account is deleted, everything linked to it is deleted too: profile, wishlist, sessions, events it organized, its messages and AI conversations.",
        ],
        after: ["The app doesn't yet have a button to delete your account yourself."],
      }),
      legalSection("services", "Services we rely on", {
        items: [
          "Google — for Google Sign-In and, when configured, for AI answers (Gemini).",
          "Anthropic — for AI answers, when configured instead of Gemini.",
          "Supabase — the managed PostgreSQL database where the app's data is stored.",
          "Hosting providers that run the website and the API.",
        ],
        after: ["Each of them processes data under its own terms and privacy policy."],
      }),
      legalSection("children", "Children", {
        text: [
          "The app has no age check. If Secret Santa is used at a school or within an organization, it should be used with the permission required by its rules and by applicable law.",
        ],
      }),
      legalSection("changes", "Changes to this policy", {
        text: [
          "When the app changes, we update this page. The date at the top shows the current version.",
        ],
      }),
    ],
  },

  terms: {
    title: "Terms of Service",
    description: "The rules for using Secret Santa: accounts, events, the draw, chats and AI.",
    date: "4 October 2026",
    intro: [
      "These terms describe the rules for using Secret Santa — the website and the app for organizing gift exchanges.",
      "By using Secret Santa, you agree to them. If you don't agree, please don't use the service.",
    ],
    highlights: [
      "Keep your account secure and the information you share accurate.",
      "Keep the secret: don't try to find out other people's pairs or unmask your Secret Santa.",
      "Be respectful in chats.",
      "AI ideas are suggestions — the decision is yours.",
    ],
    sections: [
      legalSection("service", "The service", {
        text: [
          "Secret Santa provides tools for organizing gift exchanges: creating events, inviting participants by link, a random draw, profiles with interests and wishlists, an event chat, an anonymous gift chat between a Secret Santa and their recipient, and an AI gift assistant.",
          "Features may change as the service develops.",
        ],
      }),
      legalSection("accounts", "Your account", {
        items: [
          "You can sign up with an email and password or with Google.",
          "Provide accurate information and keep your password to yourself.",
          "You're responsible for what happens in your account. If you think someone else has access, change your password and log out of all devices in Settings.",
        ],
      }),
      legalSection("events", "Events", {
        items: [
          "The organizer creates the event and is responsible for its name, date, budget and participant limit.",
          "The organizer can edit the event until it is completed. Until the draw, they can also replace the invite link and remove participants, and participants can leave.",
          "After the draw, nobody can join or leave, so the pairs stay intact.",
          "The organizer can mark the event as completed, or delete it for everyone.",
        ],
      }),
      legalSection("draw", "The draw", {
        items: [
          "Names are drawn randomly; nobody draws themselves, and everyone gives and receives exactly one gift.",
          "Each participant sees only their own recipient. Not even the organizer sees the pairs.",
          "Keep your recipient private, and don't try to find out other people's pairs.",
        ],
      }),
      legalSection("content", "What you share", {
        text: [
          "Your name, interests, wishlist and messages are your content, and you're responsible for them.",
          "Don't post content that is illegal, threatening, abusive or deceptive, or that violates someone else's rights.",
        ],
      }),
      legalSection("chats", "Chats", {
        items: [
          "The event chat is visible to everyone in the event; it opens after the draw.",
          "The gift chat connects a Secret Santa with their recipient. The recipient doesn't see who writes — don't try to unmask your Secret Santa, and don't use the chat to reveal pairs.",
          "Be respectful. Don't share passwords, payment details or other sensitive information in chats.",
          "When an event is completed, its gift chats become read-only.",
        ],
      }),
      legalSection("ai", "AI features", {
        text: [
          "The AI assistant suggests gift ideas and answers questions about the service. Its answers may be incomplete or inaccurate.",
          "You decide whether and how to use its suggestions.",
        ],
      }),
      legalSection("prohibited", "Not allowed", {
        items: [
          "using the service for anything unlawful;",
          "trying to access another person's account;",
          "trying to reveal other people's pairs or the identity of a Secret Santa;",
          "interfering with the service's security or operation, sending malicious code or automated abusive requests;",
          "impersonating another person or organization;",
          "harassing or threatening other participants.",
        ],
      }),
      legalSection("availability", "Availability", {
        text: [
          "We aim to keep Secret Santa available, but can't guarantee uninterrupted access: maintenance, updates or technical problems may interrupt it.",
        ],
      }),
      legalSection("third-party", "Third-party services", {
        text: [
          "Secret Santa relies on third-party services — Google Sign-In, hosting, the database and an AI model provider. Their own terms and policies also apply.",
        ],
      }),
      legalSection("termination", "Suspension and ending use", {
        text: [
          "Access may be restricted if an account is used against these terms or threatens the security of the service.",
          "You can stop using the service at any time.",
        ],
      }),
      legalSection("disclaimer", "No guarantees", {
        text: [
          "Secret Santa is provided “as is” and “as available”. To the extent permitted by law, we don't guarantee that it will be error-free, uninterrupted or suitable for every purpose.",
        ],
      }),
      legalSection("changes", "Changes to these terms", {
        text: [
          "We may update these terms as the service changes. The date at the top shows the current version.",
        ],
      }),
    ],
  },
};

export type LegalDocs = typeof enLegal;
