import type { Locale } from "@/i18n/config";

// Tiny inline flags: emoji flags don't render on Windows (they show as "RU" letters).
// Decorative — the language name is always next to them or in aria-label.

// Kyrgyz sun: 40 rays as one star-shaped polygon, computed once (same on server and client)
const KG_RAYS = Array.from({ length: 80 }, (_, i) => {
  const angle = (Math.PI * i) / 40;
  const radius = i % 2 === 0 ? 7.6 : 5.2;
  return `${(25 + radius * Math.sin(angle)).toFixed(2)},${(15 - radius * Math.cos(angle)).toFixed(2)}`;
}).join(" ");

const FLAGS: Record<Locale, React.ReactNode> = {
  ru: (
    <svg viewBox="0 0 9 6" preserveAspectRatio="none">
      <rect width="9" height="2" fill="#fff" />
      <rect y="2" width="9" height="2" fill="#0039a6" />
      <rect y="4" width="9" height="2" fill="#d52b1e" />
    </svg>
  ),
  en: (
    // Simplified at 18px: no counterchange, so no clipPath ids to collide between switchers
    <svg viewBox="0 0 60 30" preserveAspectRatio="none">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#c8102e" strokeWidth="2" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
    </svg>
  ),
  ky: (
    <svg viewBox="0 0 50 30" preserveAspectRatio="none">
      <rect width="50" height="30" fill="#e8112d" />
      <polygon points={KG_RAYS} fill="#ffef00" />
      <circle cx="25" cy="15" r="4.6" fill="#ffef00" />
      <circle cx="25" cy="15" r="3.6" fill="#e8112d" />
      <path d="M21.6,14.2 h6.8 M21.6,15.8 h6.8 M23.3,11.8 v6.4 M26.7,11.8 v6.4" stroke="#ffef00" strokeWidth="0.7" />
    </svg>
  ),
};

const Flag = ({ locale, className }: { locale: Locale; className?: string }) => (
  <span className={className} aria-hidden="true">
    {FLAGS[locale]}
  </span>
);

export default Flag;
