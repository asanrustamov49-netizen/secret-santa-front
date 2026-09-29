"use client";
import { LOCALES } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import Flag from "./Flag";
// Same segmented look as the theme switcher — one set of styles for both
import seg from "../themeSwitcher/themeSwitcher.module.scss";
import scss from "./languageSwitcher.module.scss";

const CODES = { ru: "RU", en: "EN", ky: "KY" } as const;

interface LanguageSwitcherProps {
  /**
   * compact — flag + code, for headers
   * full    — flag + code, full width (menus, sidebar)
   * names   — flag + native name, full width (Settings)
   */
  variant?: "compact" | "full" | "names";
  className?: string;
}

/** 🇷🇺 RU · 🇬🇧 EN · 🇰🇬 KY — switches the whole site and remembers the choice */
const LanguageSwitcher = ({ variant = "compact", className }: LanguageSwitcherProps) => {
  const { locale, setLocale, m } = useI18n();

  return (
    <div
      role="radiogroup"
      aria-label={m.language.label}
      className={`${seg.switcher} ${variant === "compact" ? scss.compact : seg.full} ${className ?? ""}`}
    >
      {LOCALES.map((code) => {
        const isActive = locale === code;
        const name = m.language.names[code];
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={name}
            title={variant === "names" ? undefined : name}
            lang={code}
            className={`${seg.option} ${scss.option} ${isActive ? seg.active : ""}`}
            onClick={() => !isActive && setLocale(code)}
          >
            <Flag locale={code} className={scss.flag} />
            {variant === "names" ? (
              // Full names where there's room; codes on narrow phones (the name stays in aria-label)
              <>
                <span className={scss.long}>{name}</span>
                <span className={scss.short} aria-hidden="true">
                  {CODES[code]}
                </span>
              </>
            ) : (
              <span>{CODES[code]}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
