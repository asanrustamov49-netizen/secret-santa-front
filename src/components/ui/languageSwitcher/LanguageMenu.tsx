"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { PiCaretDownBold, PiCheckBold } from "react-icons/pi";
import { LOCALES, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import Flag from "./Flag";
import scss from "./languageSwitcher.module.scss";

const CODES: Record<Locale, string> = { ru: "RU", en: "EN", ky: "KY" };

/**
 * The language switcher folded into one button (🇰🇬 KY ▾) — for tight spots such
 * as the desktop header. The same three choices open in a small menu.
 */
const LanguageMenu = ({ className }: { className?: string }) => {
  const { locale, setLocale, m } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Close on a click outside or Escape; Escape hands focus back to the button
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    // Focus the current language when the menu opens
    rootRef.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (code: Locale) => {
    setOpen(false);
    buttonRef.current?.focus();
    if (code !== locale) setLocale(code);
  };

  // Up / Down move between the three options
  const onMenuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const items = [...(event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])];
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "ArrowDown" ? index + 1 : index - 1;
    items[(next + items.length) % items.length]?.focus();
  };

  return (
    <div ref={rootRef} className={`${scss.menuRoot} ${className ?? ""}`}>
      <button
        ref={buttonRef}
        type="button"
        className={scss.menuButton}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${m.language.label}: ${m.language.names[locale]}`}
        onClick={() => setOpen((value) => !value)}
      >
        <Flag locale={locale} className={scss.flag} />
        <span>{CODES[locale]}</span>
        <PiCaretDownBold className={scss.caret} aria-hidden="true" />
      </button>

      {open && (
        <div id={menuId} role="menu" aria-label={m.language.label} className={scss.menu} onKeyDown={onMenuKey}>
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={code === locale}
              lang={code}
              className={scss.menuItem}
              onClick={() => choose(code)}
            >
              <Flag locale={code} className={scss.flag} />
              <span className={scss.menuName}>{m.language.names[code]}</span>
              <span className={scss.menuCode}>{CODES[code]}</span>
              {code === locale && <PiCheckBold className={scss.check} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageMenu;
