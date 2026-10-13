"use client";
import type { IconType } from "react-icons";
import { PiDesktop, PiMoonStars, PiSun } from "react-icons/pi";
import { useTheme } from "@/lib/theme/useTheme";
import type { ThemePreference } from "@/lib/theme/theme";
import { useI18n } from "@/i18n/I18nProvider";
import { useSlidingIndicator } from "@/lib/ui/useSlidingIndicator";
import scss from "./themeSwitcher.module.scss";

const OPTIONS: { value: ThemePreference; icon: IconType }[] = [
  { value: "light", icon: PiSun },
  { value: "dark", icon: PiMoonStars },
  { value: "system", icon: PiDesktop },
];

interface ThemeSwitcherProps {
  /** compact = icons only (header), full = icons + labels (settings, menus) */
  variant?: "compact" | "full";
  className?: string;
}

const ThemeSwitcher = ({ variant = "compact", className }: ThemeSwitcherProps) => {
  const { preference, setPreference } = useTheme();
  const { m } = useI18n();
  const { containerRef, indicatorRef, willChange } = useSlidingIndicator(preference);

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={m.theme.label}
      className={`${scss.switcher} ${scss[variant]} ${className ?? ""}`}
    >
      <span ref={indicatorRef} className={scss.indicator} aria-hidden="true" />
      {OPTIONS.map(({ value, icon: Icon }) => {
        const isActive = preference === value;
        const label = m.theme[value];
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={variant === "compact" ? m.theme.option(label) : undefined}
            title={variant === "compact" ? label : undefined}
            className={`${scss.option} ${isActive ? scss.active : ""}`}
            onClick={(event) => {
              if (isActive) return;
              willChange();
              // A keyboard press has no pointer position: spread from the button's centre
              const box = event.currentTarget.getBoundingClientRect();
              const fromPointer = event.detail > 0;
              setPreference(value, {
                x: fromPointer ? event.clientX : box.left + box.width / 2,
                y: fromPointer ? event.clientY : box.top + box.height / 2,
              });
            }}
          >
            <Icon aria-hidden="true" />
            {variant === "full" && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSwitcher;
