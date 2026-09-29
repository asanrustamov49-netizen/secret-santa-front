"use client";
import { useState, type FormEvent } from "react";
import { PiCheckBold, PiPencilSimpleBold, PiSparkleFill } from "react-icons/pi";
import Avatar from "@/components/ui/avatar/Avatar";
import Snowfall from "@/components/ui/snowfall/Snowfall";
import type { User } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";
import { profileReadiness, readinessLabel } from "@/lib/profile/readiness";
import { useI18n, useMessage } from "@/i18n/I18nProvider";
import { useUpdateProfile } from "@/lib/profile/useProfile";
import scss from "./profile.module.scss";

interface ProfileHeroProps {
  user: User;
  wishlistCount: number;
}

/** Night card: who you are + a garland that lights up as the profile fills in */
const ProfileHero = ({ user, wishlistCount }: ProfileHeroProps) => {
  const update = useUpdateProfile();
  const [draft, setDraft] = useState<string | null>(null); // null = not editing
  const [error, setError] = useMessage();
  const { m } = useI18n();
  const t = m.profile.hero;

  const readiness = profileReadiness(user.interests.length, wishlistCount);

  const startEditing = () => {
    setDraft(user.name);
    setError(undefined);
    update.reset();
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const name = (draft ?? "").trim();
    if (name.length < 2) return setError((m) => m.validation.nameShort);
    if (name.length > 60) return setError((m) => m.validation.nameLong);
    if (name === user.name) return setDraft(null);

    update.mutate({ name }, { onSuccess: () => setDraft(null) });
  };

  return (
    <section className={scss.hero} data-theme="dark" aria-label={t.label}>
      <Snowfall bokeh={false} twinkles className={scss.heroSnow} />

      <div className={scss.identity}>
        <Avatar name={user.name} src={user.avatarUrl} size={88} className={scss.heroAvatar} />

        <div className={scss.identityText}>
          {draft === null ? (
            <div className={scss.nameRow}>
              <h2 className={scss.name} title={user.name}>
                {user.name}
              </h2>
              <button type="button" className={scss.iconButton} onClick={startEditing} aria-label={t.editName}>
                <PiPencilSimpleBold />
              </button>
            </div>
          ) : (
            <form className={scss.nameForm} onSubmit={onSubmit} noValidate>
              <label htmlFor="profile-name" className="visually-hidden">
                {t.yourName}
              </label>
              <input
                id="profile-name"
                className={`input ${scss.nameInput}`}
                value={draft}
                maxLength={60}
                autoFocus
                autoComplete="name"
                aria-invalid={error ? true : undefined}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setError(undefined);
                }}
                onKeyDown={(event) => event.key === "Escape" && setDraft(null)}
              />
              <button type="submit" className="btn btn-primary" disabled={update.isPending}>
                {update.isPending ? m.common.saving : m.common.save}
              </button>
              <button type="button" className="btn btn-glass" onClick={() => setDraft(null)}>
                {m.common.cancel}
              </button>
              {(error || update.isError) && (
                <p className={scss.heroError} role="alert">
                  {error ?? getErrorMessage(update.error, m)}
                </p>
              )}
            </form>
          )}
          <p className={scss.email}>{user.email}</p>
        </div>
      </div>

      <div className={scss.readiness}>
        <p className={scss.readinessTitle}>
          {readiness.complete ? (
            <>
              <PiSparkleFill aria-hidden="true" /> {t.ready}
            </>
          ) : (
            t.readiness(readiness.done, readiness.total)
          )}
        </p>

        {/* A string of lights — one bulb per step */}
        <ol className={scss.garland}>
          {readiness.steps.map((step, i) => (
            <li key={step.key} className={`${scss.bulb} ${step.done ? scss.lit : ""}`} style={{ "--i": i } as React.CSSProperties}>
              <span className={scss.bulbGlass} aria-hidden="true">
                {step.done && <PiCheckBold />}
              </span>
              <span className={scss.bulbLabel}>
                {readinessLabel(step.key, m)}
                <span className="visually-hidden">{step.done ? m.common.done : m.common.toDo}</span>
              </span>
            </li>
          ))}
        </ol>

        <p className={scss.readinessText}>
          {readiness.complete ? t.completeText : t.incompleteText}
        </p>
      </div>
    </section>
  );
};

export default ProfileHero;
