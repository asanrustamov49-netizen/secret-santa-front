import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import LayoutClient from "./layout.c";
import { themeInitScript } from "@/lib/theme/theme";
import { getI18n } from "@/i18n/server";
import { LOCALES, type Locale } from "@/i18n/config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
});

// Public address of the site, for absolute links in social previews. Set SITE_URL in production.
const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

/** Open Graph locale codes (language_TERRITORY) */
const OG_LOCALE: Record<Locale, string> = { ru: "ru_RU", en: "en_GB", ky: "ky_KG" };

// Browser UI color around the page (mobile address bar): each theme's --color-bg from globals.css
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f3" },
    { media: "(prefers-color-scheme: dark)", color: "#050a1c" },
  ],
};

// Icons and the manifest come from the file conventions next to this layout
// (icon.tsx, apple-icon.tsx, manifest.ts) plus /favicon.ico — all drawn from the header's gift box.
export async function generateMetadata(): Promise<Metadata> {
  const { m, locale } = await getI18n();
  const brand = m.common.logo;
  const preview = { url: "/icons/512.png", width: 512, height: 512, alt: brand };

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: brand,
    title: m.meta.siteTitle,
    description: m.meta.siteDescription,
    appleWebApp: { title: brand },
    openGraph: {
      type: "website",
      siteName: brand,
      title: m.meta.siteTitle,
      description: m.meta.siteDescription,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((other) => other !== locale).map((other) => OG_LOCALE[other]),
      images: [preview],
    },
    twitter: {
      card: "summary",
      title: m.meta.siteTitle,
      description: m.meta.siteDescription,
      images: [preview],
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // The visitor's language, decided on the server so the first HTML is already in it
  const { locale } = await getI18n();

  return (
    // suppressHydrationWarning: data-theme is set by the inline script before React hydrates
    <html
      lang={locale}
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <LayoutClient locale={locale}>{children}</LayoutClient>
      </body>
    </html>
  );
}
