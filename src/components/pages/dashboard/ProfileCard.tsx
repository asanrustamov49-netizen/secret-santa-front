import Link from "next/link";
import { PiArrowRightBold, PiCheckBold } from "react-icons/pi";
import Avatar from "@/components/ui/avatar/Avatar";
import type { User } from "@/lib/api/auth";
import { profileReadiness, readinessLabel } from "@/lib/profile/readiness";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./dashboard.module.scss";

interface ProfileCardProps {
  user: User;
  /** undefined while the wishlist is loading */
  wishlistCount: number | undefined;
  wishlistError: boolean;
  onRetry: () => void;
}

/**
 * Progress = the same three steps as the profile page (name, 3+ interests, a wish).
 * Shown only once the wishlist is known — never a guessed number.
 */
const ProfileCard = ({ user, wishlistCount, wishlistError, onRetry }: ProfileCardProps) => {
  const known = wishlistCount !== undefined;
  const { m } = useI18n();
  const t = m.dashboard.profile;
  const readiness = profileReadiness(user.interests.length, wishlistCount ?? 0);
  const percent = Math.round((readiness.done / readiness.total) * 100);

  return (
    <section className={`surface-card ${scss.profileCard}`} aria-labelledby="profile-title">
      <div className={scss.profileHead}>
        <Avatar name={user.name} src={user.avatarUrl} size={48} />
        <div className={scss.profileWho}>
          <h2 id="profile-title" className={scss.profileTitle}>
            {t.title}
          </h2>
          <p className={scss.profileName}>{user.name}</p>
        </div>
      </div>

      {wishlistError ? (
        <div className={scss.profileError} role="alert">
          <p>{t.wishlistError}</p>
          <button type="button" className={scss.textLink} onClick={onRetry}>
            {m.common.tryAgain}
          </button>
        </div>
      ) : known ? (
        <>
          <div className={scss.progressRow}>
            <span>{readiness.complete ? t.ready : t.complete(percent)}</span>
            <span className={scss.progressValue}>{percent}%</span>
          </div>
          <div
            className={scss.progress}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label={t.completeness}
          >
            <span style={{ width: `${percent}%` }} />
          </div>

          <ul className={scss.checks}>
            {readiness.steps.map((step) => (
              <li key={step.key} className={step.done ? scss.checkDone : ""}>
                <span className={scss.checkMark} aria-hidden="true">
                  {step.done && <PiCheckBold />}
                </span>
                {readinessLabel(step.key, m)}
                {step.key === "interests" && !step.done && (
                  <span className={scss.checkHint}>{t.soFar(user.interests.length)}</span>
                )}
                <span className="visually-hidden">{step.done ? m.common.done : m.common.toDo}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div aria-busy="true" aria-label={t.loading}>
          <span className={`${scss.skel} ${scss.skelLine}`} />
          <span className={`${scss.skel} ${scss.skelLineShort}`} />
        </div>
      )}

      <Link href="/profile" className={`btn ${readiness.complete ? "btn-outline" : "btn-primary"} ${scss.profileCta}`}>
        {readiness.complete ? t.edit : t.completeCta}
        <PiArrowRightBold className="icon-nudge" aria-hidden="true" />
      </Link>
    </section>
  );
};

export default ProfileCard;
