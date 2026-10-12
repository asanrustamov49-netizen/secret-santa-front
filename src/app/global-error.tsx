"use client";
import "./globals.css";
import { PiArrowClockwiseBold, PiHouse } from "react-icons/pi";
import StatusScene from "@/components/pages/status/StatusScene";
import { isLocale, LOCALE_COOKIE, negotiateLocale, type Locale } from "@/i18n/config";

// The root layout itself failed: this replaces it, so there are no providers here —
// no dictionaries, no theme. A few words in each language, picked like the layout picks
// them (saved choice, else the browser's), and the night scene, which is dark anyway.

const WORDS: Record<Locale, { title: string; text: string; retry: string; home: string; code: string }> = {
  en: {
    title: "Something went wrong",
    text: "We couldn't open Secret Santa. Try again — that usually helps.",
    retry: "Try again",
    home: "Go to the home page",
    code: "Error code",
  },
  ru: {
    title: "Что-то пошло не так",
    text: "Не удалось открыть Тайного Санту. Попробуйте ещё раз — обычно это помогает.",
    retry: "Попробовать снова",
    home: "На главную",
    code: "Код ошибки",
  },
  ky: {
    title: "Бир нерсе туура эмес болуп кетти",
    text: "Жашыруун Сантаны ачуу мүмкүн болгон жок. Кайра аракет кылыңыз — адатта бул жардам берет.",
    retry: "Кайра аракет кылуу",
    home: "Башкы бетке",
    code: "Ката коду",
  },
};

function currentLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const saved = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`))?.[1];
  return isLocale(saved) ? saved : negotiateLocale(navigator.languages?.join(",") ?? navigator.language);
}

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const locale = currentLocale();
  const t = WORDS[locale];
  return (
    <html lang={locale} data-theme="dark">
      <body>
        <title>{`${t.title} — Secret Santa`}</title>
        <StatusScene
          logo="Secret Santa"
          title={t.title}
          text={t.text}
          actions={
            <>
              <button type="button" className="btn btn-primary btn-lg btn-glow" onClick={() => retry()}>
                <PiArrowClockwiseBold aria-hidden="true" />
                {t.retry}
              </button>
              {/* A full page load on purpose: the client router is what just failed */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- <Link> would go through that router */}
              <a href="/" className="btn btn-glass btn-lg">
                <PiHouse aria-hidden="true" />
                {t.home}
              </a>
            </>
          }
          footnote={error.digest ? `${t.code}: ${error.digest}` : undefined}
        />
      </body>
    </html>
  );
}
