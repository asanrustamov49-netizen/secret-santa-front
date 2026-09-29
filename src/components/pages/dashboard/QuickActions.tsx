import Link from "next/link";
import { PiGiftFill, PiLinkBold, PiPlusBold, PiUserCircleFill } from "react-icons/pi";
import JoinWithLink from "@/components/pages/events/JoinWithLink";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./dashboard.module.scss";

interface QuickActionsProps {
  joinOpen: boolean;
  onToggleJoin: () => void;
  /** Drawn events I haven't opened yet */
  unopened: number;
}

const QuickActions = ({ joinOpen, onToggleJoin, unopened }: QuickActionsProps) => {
  const { m } = useI18n();
  const t = m.dashboard.quick;
  return (
  <section id="quick-actions" aria-label={t.label} className={scss.quick}>
    <div className={scss.quickGrid}>
      <Link href="/events/new" className={scss.quickItem}>
        <span className={scss.quickIcon} data-tone="gold">
          <PiPlusBold aria-hidden="true" />
        </span>
        <span>
          <strong>{t.create}</strong>
          <small>{t.createHint}</small>
        </span>
      </Link>

      <button
        type="button"
        className={`${scss.quickItem} ${joinOpen ? scss.quickActive : ""}`}
        aria-expanded={joinOpen}
        aria-controls="dashboard-join"
        onClick={onToggleJoin}
      >
        <span className={scss.quickIcon} data-tone="blue">
          <PiLinkBold aria-hidden="true" />
        </span>
        <span>
          <strong>{t.join}</strong>
          <small>{t.joinHint}</small>
        </span>
      </button>

      <Link href="/my-santa" className={scss.quickItem}>
        <span className={scss.quickIcon} data-tone="crimson">
          <PiGiftFill aria-hidden="true" />
        </span>
        <span>
          <strong>{t.mySanta}</strong>
          <small>{unopened > 0 ? t.waiting(unopened) : t.whoYouGift}</small>
        </span>
        {unopened > 0 && (
          <span className={scss.quickBadge} aria-hidden="true">
            {unopened}
          </span>
        )}
      </Link>

      <Link href="/profile" className={scss.quickItem}>
        <span className={scss.quickIcon} data-tone="green">
          <PiUserCircleFill aria-hidden="true" />
        </span>
        <span>
          <strong>{t.profile}</strong>
          <small>{t.profileHint}</small>
        </span>
      </Link>
    </div>

    {joinOpen && (
      <div id="dashboard-join" className={`surface-card ${scss.joinPanel}`}>
        <JoinWithLink autoFocus />
      </div>
    )}
  </section>
  );
};

export default QuickActions;
