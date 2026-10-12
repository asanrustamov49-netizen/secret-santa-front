import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import { BRAND_NIGHT, markDataUri } from "./brandIcon";
import { glyphs, googleFont, type OgFont } from "./ogFont";

// Social preview cards (Open Graph / Twitter), 1200×630: the hero's night sky with the gift.
// One frame for the site card and for invite links. Server only.

export const SOCIAL_CARD_SIZE = { width: 1200, height: 630 };

const SNOW = "#f5f7ff";
const SNOW_SOFT = "#aeb8c8";
const GOLD = "#f5c63d";

/** A few fixed stars — the same sky on every card */
const STARS: [number, number, number][] = [
  [64, 92, 3], [210, 40, 2], [388, 118, 2], [520, 54, 3], [690, 30, 2], [812, 140, 2],
  [1132, 64, 3], [1060, 210, 2], [980, 560, 2], [1150, 500, 3], [610, 590, 2], [90, 560, 2],
];

export interface SocialCardContent {
  /** Small gold line above the title */
  eyebrow: string;
  title: string;
  /** One line under the title */
  subtitle?: string;
  /** Rendered at the bottom: chips, the organizer… */
  footer?: ReactNode;
  /** Every other string the footer draws, so its glyphs are in the font subset */
  footerText?: string;
  /** The small logo row at the top; off when the title already is the brand */
  brandRow?: boolean;
}

/** Long event names get smaller type instead of a cut-off */
function titleSize(title: string): number {
  if (title.length > 48) return 56;
  if (title.length > 30) return 66;
  if (title.length > 18) return 78;
  return 92;
}

export async function socialCard({ eyebrow: eyebrowText, title, subtitle = "", footer, footerText = "", brandRow = true }: SocialCardContent) {
  // Upper-cased here, not with CSS: the font subset must hold the capitals that are drawn
  const eyebrow = eyebrowText.toUpperCase();
  const display = await googleFont("Playfair Display", 700, glyphs(title, "Secret Santa"));
  const body = await googleFont("Inter", 600, glyphs(eyebrow, subtitle, footerText, "0123456789·–— "));
  const fonts = [display, body].filter((font): font is OgFont => font !== null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: BRAND_NIGHT,
          backgroundImage:
            "radial-gradient(circle at 82% 38%, rgba(245,198,61,0.22), transparent 42%), radial-gradient(circle at 8% 100%, rgba(117,97,216,0.28), transparent 46%), radial-gradient(circle at 40% 0%, rgba(82,119,199,0.22), transparent 40%)",
          color: SNOW,
          fontFamily: body ? "Inter" : undefined,
        }}
      >
        {STARS.map(([x, y, r], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: r,
              background: "rgba(245,247,255,0.7)",
            }}
          />
        ))}

        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse draws <img>, not next/image */}
        <img src={markDataUri()} width={360} height={360} alt="" style={{ position: "absolute", right: 70, top: 120 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 760,
            height: "100%",
            padding: "64px 0 60px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: brandRow ? 1 : 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse draws <img>, not next/image */}
            <img src={markDataUri()} width={44} height={44} alt="" />
            <span style={{ fontFamily: "Playfair Display", fontSize: 32, fontWeight: 700 }}>Secret Santa</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <span
              style={{
                color: GOLD,
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: 3,
              }}
            >
              {eyebrow}
            </span>
            <span
              style={{
                fontFamily: "Playfair Display",
                fontSize: titleSize(title),
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: -1,
              }}
            >
              {title}
            </span>
            {subtitle && <span style={{ color: SNOW_SOFT, fontSize: 30, lineHeight: 1.35 }}>{subtitle}</span>}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 56 }}>{footer}</div>
        </div>
      </div>
    ),
    { ...SOCIAL_CARD_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}

/** A rounded chip on the card: an icon and a short value */
export function CardChip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 20px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.06)",
        color: SNOW,
        fontSize: 24,
        fontWeight: 600,
      }}
    >
      {icon}
      {children}
    </div>
  );
}

/** Line icons for the chips (Phosphor-like, drawn in gold) */
export const CARD_ICONS = {
  calendar: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  ),
  wallet: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v4" />
      <rect x="4" y="7.5" width="16" height="12" rx="2.5" />
      <circle cx="16" cy="13.5" r="1.2" fill={GOLD} />
    </svg>
  ),
  people: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round">
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3 19c.8-3.2 3.2-5 6-5s5.2 1.8 6 5" />
      <path d="M15.5 5.6a3.2 3.2 0 0 1 0 6M18 14.4c1.5.7 2.6 2.2 3 4.6" />
    </svg>
  ),
};
