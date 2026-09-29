"use client";
import { useState, type FormEvent } from "react";
import { PiHeartFill, PiPlusBold, PiXBold } from "react-icons/pi";
import type { User } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";
import { MAX_INTEREST_LENGTH, MAX_INTERESTS } from "@/lib/api/profile";
import { useUpdateProfile } from "@/lib/profile/useProfile";
import { useI18n, useMessage } from "@/i18n/I18nProvider";
import scss from "./profile.module.scss";

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** Interests as ornaments. Every change saves straight away — there is no Save button to forget. */
const InterestsCard = ({ user }: { user: User }) => {
  const update = useUpdateProfile();
  const [draft, setDraft] = useState("");
  const [error, setError] = useMessage();
  const { m } = useI18n();
  const t = m.profile.interests;

  // While a save is in flight show what the user asked for, not the old list
  const interests = (update.isPending && update.variables.interests) || user.interests;
  const isFull = interests.length >= MAX_INTERESTS;
  // Suggestions are in the reader's language — a tapped one is saved as written
  const suggestions = t.suggestions.filter((s) => !interests.some((i) => same(i, s))).slice(0, 8);

  const save = (next: string[]) => {
    setError(undefined);
    update.mutate({ interests: next });
  };

  const add = (raw: string) => {
    // "coffee, books" adds both
    const fresh = raw
      .split(",")
      .map((part) => part.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    if (fresh.length === 0) return;

    const tooLong = fresh.find((item) => item.length > MAX_INTEREST_LENGTH);
    if (tooLong) return setError((m) => m.profile.interests.tooLong(MAX_INTEREST_LENGTH));

    const next = [...interests];
    for (const item of fresh) {
      if (!next.some((existing) => same(existing, item))) next.push(item);
    }
    if (next.length > MAX_INTERESTS) return setError((m) => m.profile.interests.tooMany(MAX_INTERESTS));
    if (next.length === interests.length) return setError((m) => m.profile.interests.duplicate);

    setDraft("");
    save(next);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    add(draft);
  };

  return (
    <section className={`surface-card ${scss.card}`} aria-labelledby="interests-title">
      <header className={scss.cardHeader}>
        <span className={`${scss.cardIcon} ${scss.iconCrimson}`} aria-hidden="true">
          <PiHeartFill />
        </span>
        <div>
          <h2 id="interests-title" className={scss.cardTitle}>
            {t.title}
          </h2>
          <p className={scss.cardText}>{t.text}</p>
        </div>
        <span className={scss.counter}>
          {interests.length}/{MAX_INTERESTS}
        </span>
      </header>

      {interests.length > 0 ? (
        <ul className={scss.ornaments} aria-label={t.listLabel}>
          {interests.map((interest, i) => (
            <li key={interest} className={scss.ornament} data-tone={i % 5}>
              {interest}
              <button
                type="button"
                className={`touch-target ${scss.ornamentRemove}`}
                onClick={() => save(interests.filter((it) => it !== interest))}
                aria-label={t.remove(interest)}
              >
                <PiXBold />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={scss.empty}>{t.empty}</p>
      )}

      <form className={scss.inlineForm} onSubmit={onSubmit} noValidate>
        <label htmlFor="interest-input" className="visually-hidden">
          {t.inputLabel}
        </label>
        <input
          id="interest-input"
          className="input"
          placeholder={isFull ? t.full : t.placeholder}
          value={draft}
          disabled={isFull}
          maxLength={200}
          onChange={(event) => {
            setDraft(event.target.value);
            setError(undefined);
          }}
        />
        <button type="submit" className="btn btn-primary" disabled={isFull || !draft.trim()}>
          <PiPlusBold aria-hidden="true" />
          {t.add}
        </button>
      </form>

      {(error || update.isError) && (
        <p className={scss.fieldError} role="alert">
          {error ?? getErrorMessage(update.error, m)}
        </p>
      )}

      {!isFull && suggestions.length > 0 && (
        <div className={scss.suggestions}>
          <p className={scss.suggestionsTitle}>{t.ideas}</p>
          <div className={scss.suggestionList}>
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" className={scss.suggestion} onClick={() => add(suggestion)}>
                <PiPlusBold aria-hidden="true" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default InterestsCard;
