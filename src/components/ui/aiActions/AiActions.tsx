"use client";
import { PiCheckBold, PiDesktop, PiGlobeHemisphereWest, PiMoonStars, PiSun } from "react-icons/pi";
import type { IconType } from "react-icons";
import { actionParts, type AiAction } from "@/lib/ai/actions";
import { useTheme } from "@/lib/theme/useTheme";
import { toast } from "@/lib/toast";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./aiActions.module.scss";

const THEME_ICONS: Record<"light" | "dark" | "system", IconType> = {
  light: PiSun,
  dark: PiMoonStars,
  system: PiDesktop,
};

/**
 * The settings the assistant offered in its reply, as buttons. Nothing changes until the
 * user presses one — and only these allowlisted settings exist (lib/ai/actions.ts).
 */
const AiActions = ({ actions }: { actions: AiAction[] }) => {
  const { m, locale, setLocale } = useI18n();
  const { preference, setPreference } = useTheme();
  if (actions.length === 0) return null;

  return (
    <div className={scss.actions} role="group" aria-label={m.ai.actions.label}>
      {actions.map((action) => {
        const [kind, value] = actionParts(action);
        const active = kind === "theme" ? preference === value : locale === value;
        const Icon = kind === "theme" ? THEME_ICONS[value as keyof typeof THEME_ICONS] : PiGlobeHemisphereWest;
        const apply = () => {
          if (kind === "theme") setPreference(value as keyof typeof THEME_ICONS);
          else setLocale(value as "ru" | "en" | "ky");
          toast((m) => m.ai.actions.applied);
        };
        return (
          <button key={action} type="button" className={scss.action} onClick={apply} disabled={active}>
            {active ? <PiCheckBold aria-hidden="true" /> : <Icon aria-hidden="true" />}
            {m.ai.actions[action]}
            {active && <span className={scss.active}>· {m.ai.actions.active}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default AiActions;
