import { PiHandWavingFill } from "react-icons/pi";
import { useI18n } from "@/i18n/I18nProvider";
import { formatToday } from "@/lib/events/format";
import scss from "./dashboard.module.scss";

function partOfDay(hour: number) {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}

/** Rendered only in the browser (inside AppShell), so the local clock is safe to read */
const WelcomeSection = ({ name }: { name: string | undefined }) => {
  const { m, locale } = useI18n();
  const now = new Date();
  const firstName = name?.trim().split(/\s+/)[0];
  const today = formatToday(now, locale);

  return (
    <header className={scss.welcome}>
      <p className={scss.date}>{today}</p>
      <h1 className={scss.title}>
        {m.dashboard.greeting[partOfDay(now.getHours())]}
        {firstName ? `, ${firstName}` : ""}
        <PiHandWavingFill className={scss.wave} aria-hidden="true" />
      </h1>
      <p className={scss.subtitle}>{m.dashboard.subtitle}</p>
    </header>
  );
};

export default WelcomeSection;
