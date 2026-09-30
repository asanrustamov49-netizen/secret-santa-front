"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PiArrowLeftBold, PiArrowRightBold, PiCheckBold, PiGiftFill } from "react-icons/pi";
import Confetti from "@/components/ui/confetti/Confetti";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import TextField from "@/components/ui/textField/TextField";
import InterestsCard from "@/components/pages/profile/InterestsCard";
import type { SantaEvent } from "@/lib/api/events";
import { getErrorMessage } from "@/lib/api/client";
import { useSession } from "@/lib/auth/useSession";
import { daysUntil, formatBudget, formatDay, toDayString } from "@/lib/events/format";
import { useCreateEvent } from "@/lib/events/useEvents";
import { profileReadiness } from "@/lib/profile/readiness";
import { useWishlist } from "@/lib/profile/useProfile";
import { focusFirstInvalid } from "@/lib/ui/focusFirstInvalid";
import InviteShare from "./InviteShare";
import { useFieldMessages, useI18n } from "@/i18n/I18nProvider";
import type { Messages, Say } from "@/i18n/messages";
import scss from "./events.module.scss";

// Wizard steps — their names are m.events.create.steps, in this order
const STEP_COUNT = 4;

interface Draft {
  name: string;
  description: string;
  eventDate: string;
  budgetMin: string;
  budgetMax: string;
  maxParticipants: string;
}

const EMPTY: Draft = { name: "", description: "", eventDate: "", budgetMin: "", budgetMax: "", maxParticipants: "" };
const DRAFT_KEY = "create-event-draft";

// Budget presets; their labels are m.events.create.budgets, in this order
const BUDGETS = [
  { min: "", max: "500" },
  { min: "500", max: "1000" },
  { min: "1000", max: "3000" },
  { min: "3000", max: "5000" },
];

/** Next occurrence of a festive day, as YYYY-MM-DD */
function nextDay(month: number, day: number) {
  const now = new Date();
  const candidate = new Date(now.getFullYear(), month - 1, day);
  if (daysUntil(candidate) < 0) candidate.setFullYear(candidate.getFullYear() + 1);
  return toDayString(candidate);
}

const DATE_IDEAS = [
  { key: "christmasEve", month: 12, day: 24 },
  { key: "christmas", month: 12, day: 25 },
  { key: "newYearsEve", month: 12, day: 31 },
] as const;

/** A field error of this wizard, worded at render (follows a language switch) */
const fieldError =
  (key: keyof Messages["events"]["create"]["errors"]): Say =>
  (m) =>
    m.events.create.errors[key];

const toInt = (value: string) => {
  const digits = value.replace(/[\s,]/g, "");
  return digits ? Number(digits) : null;
};

function loadDraft(): Draft {
  try {
    const saved = sessionStorage.getItem(DRAFT_KEY);
    return saved ? { ...EMPTY, ...(JSON.parse(saved) as Partial<Draft>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

const CreateEvent = () => {
  const router = useRouter();
  const { data: user } = useSession();
  const wishlist = useWishlist();
  const create = useCreateEvent();
  const { m, locale } = useI18n();
  const t = m.events.create;

  const [step, setStep] = useState(0);
  // Restored after a refresh. Safe to read storage here: AppShell renders pages
  // only in the browser, once the session has loaded.
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [errors, setErrors] = useFieldMessages<keyof Draft>();
  const [created, setCreated] = useState<SantaEvent | null>(null);

  useEffect(() => {
    if (created) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Private mode etc. — the draft just won't survive a refresh
    }
  }, [draft, created]);

  const set = (field: keyof Draft) => (value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateEvent = () => {
    const next: Partial<Record<keyof Draft, Say>> = {};
    if (!draft.name.trim()) next.name = fieldError("name");
    else if (draft.name.trim().length > 80) next.name = fieldError("nameMax");
    if (draft.description.length > 500) next.description = fieldError("descriptionMax");
    if (draft.eventDate && daysUntil(draft.eventDate) < 0) next.eventDate = fieldError("pastDate");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateBudget = () => {
    const next: Partial<Record<keyof Draft, Say>> = {};
    const min = toInt(draft.budgetMin);
    const max = toInt(draft.budgetMax);
    const people = toInt(draft.maxParticipants);
    if (draft.budgetMin && (min === null || Number.isNaN(min))) next.budgetMin = fieldError("budgetMin");
    if (draft.budgetMax && (max === null || Number.isNaN(max))) next.budgetMax = fieldError("budgetMax");
    if (min != null && max != null && min > max) next.budgetMax = fieldError("budgetOrder");
    if (draft.maxParticipants && (people === null || Number.isNaN(people) || people < 3 || people > 500)) {
      next.maxParticipants = fieldError("people");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const next = (event: FormEvent) => {
    event.preventDefault();
    if ((step === 0 && !validateEvent()) || (step === 1 && !validateBudget())) {
      return focusFirstInvalid(event.currentTarget);
    }
    setStep((s) => s + 1);
  };

  const submit = () => {
    create.mutate(
      {
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        eventDate: draft.eventDate || null,
        budgetMin: toInt(draft.budgetMin),
        budgetMax: toInt(draft.budgetMax),
        maxParticipants: toInt(draft.maxParticipants),
      },
      {
        onSuccess: (event) => {
          setCreated(event);
          setStep(3);
          try {
            sessionStorage.removeItem(DRAFT_KEY);
          } catch {}
        },
      },
    );
  };

  const readiness = user ? profileReadiness(user.interests.length, wishlist.data?.length ?? 0) : null;
  const budget = formatBudget(toInt(draft.budgetMin), toInt(draft.budgetMax), locale);

  return (
    <div className={scss.wizard}>
      {step < 3 && (
        <Link href="/events" className={`touch-target ${scss.backLink}`}>
          <PiArrowLeftBold className="icon-nudge-back" aria-hidden="true" /> {m.common.allEvents}
        </Link>
      )}

      {/* Progress: Event · Budget · Profile · Ready */}
      <ol className={scss.stepper} aria-label={t.stepsLabel}>
        {t.steps.slice(0, STEP_COUNT).map((label, i) => (
          <li
            key={i}
            className={`${scss.stepDot} ${i < step ? scss.stepDone : ""} ${i === step ? scss.stepCurrent : ""}`}
            aria-current={i === step ? "step" : undefined}
          >
            <span aria-hidden="true">{i < step ? <PiCheckBold /> : i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      <div className={`surface-card ${scss.wizardCard}`}>
        {step === 0 && (
          <form className={scss.wizardForm} onSubmit={next} noValidate>
            <header>
              <h1 className={scss.wizardTitle}>{t.eventTitle}</h1>
              <p className={scss.subtitle}>{t.eventSubtitle}</p>
            </header>

            <div className={scss.fieldGroup}>
              <TextField
                label={t.name}
                placeholder={t.namePlaceholder}
                value={draft.name}
                maxLength={80}
                autoFocus
                error={errors.name}
                onChange={(e) => set("name")(e.target.value)}
              />
              <div className={scss.chips}>
                {t.nameIdeas.map((idea) => (
                  <button key={idea} type="button" className={`touch-target ${scss.chip}`} onClick={() => set("name")(idea)}>
                    {idea}
                  </button>
                ))}
              </div>
            </div>

            <div className={scss.fieldGroup}>
              <label htmlFor="event-description" className={scss.label}>
                {t.description}
                <span className={scss.optional}>{m.common.optional}</span>
              </label>
              <textarea
                id="event-description"
                className={`input ${scss.textarea}`}
                placeholder={t.descriptionPlaceholder}
                value={draft.description}
                maxLength={500}
                onChange={(e) => set("description")(e.target.value)}
              />
              <p className={scss.hint}>{draft.description.length}/500</p>
            </div>

            <div className={scss.fieldGroup}>
              <TextField
                label={t.date}
                optional
                type="date"
                value={draft.eventDate}
                min={toDayString(new Date())}
                error={errors.eventDate}
                onChange={(e) => set("eventDate")(e.target.value)}
              />
              <div className={scss.chips}>
                {DATE_IDEAS.map(({ key, month, day }) => {
                  const value = nextDay(month, day);
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`touch-target ${scss.chip} ${draft.eventDate === value ? scss.chipActive : ""}`}
                      onClick={() => set("eventDate")(value)}
                    >
                      {t.dateIdeas[key]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={scss.wizardActions}>
              <button type="submit" className="btn btn-primary btn-lg">
                {m.common.continue} <PiArrowRightBold className="icon-nudge" aria-hidden="true" />
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <form className={scss.wizardForm} onSubmit={next} noValidate>
            <header>
              <h1 className={scss.wizardTitle}>{t.budgetTitle}</h1>
              <p className={scss.subtitle}>{t.budgetSubtitle}</p>
            </header>

            <div className={scss.fieldGroup}>
              <p className={scss.label}>
                {t.budget}
                <span className={scss.optional}>{m.common.optional}</span>
              </p>
              <div className={scss.chips}>
                {BUDGETS.map((preset, i) => {
                  const active = draft.budgetMin === preset.min && draft.budgetMax === preset.max;
                  return (
                    <button
                      key={preset.max}
                      type="button"
                      className={`touch-target ${scss.chip} ${active ? scss.chipActive : ""}`}
                      onClick={() => {
                        setDraft((current) => ({ ...current, budgetMin: preset.min, budgetMax: preset.max }));
                        setErrors({});
                      }}
                    >
                      {t.budgets[i]}
                    </button>
                  );
                })}
              </div>
              <div className={scss.twoCols}>
                <TextField
                  label={t.from}
                  inputMode="numeric"
                  placeholder="1000"
                  value={draft.budgetMin}
                  error={errors.budgetMin}
                  onChange={(e) => set("budgetMin")(e.target.value)}
                />
                <TextField
                  label={t.to}
                  inputMode="numeric"
                  placeholder="3000"
                  value={draft.budgetMax}
                  error={errors.budgetMax}
                  onChange={(e) => set("budgetMax")(e.target.value)}
                />
              </div>
            </div>

            <TextField
              label={t.maxPeople}
              optional
              inputMode="numeric"
              placeholder={t.noLimit}
              hint={t.maxPeopleHint}
              value={draft.maxParticipants}
              error={errors.maxParticipants}
              onChange={(e) => set("maxParticipants")(e.target.value)}
            />

            <div className={scss.wizardActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>
                <PiArrowLeftBold className="icon-nudge-back" aria-hidden="true" /> {m.common.back}
              </button>
              <button type="submit" className="btn btn-primary btn-lg">
                {m.common.continue} <PiArrowRightBold className="icon-nudge" aria-hidden="true" />
              </button>
            </div>
          </form>
        )}

        {step === 2 && user && readiness && (
          <div className={scss.wizardForm}>
            <header>
              <h1 className={scss.wizardTitle}>{t.profileTitle}</h1>
              <p className={scss.subtitle}>{t.profileSubtitle}</p>
            </header>

            <InterestsCard user={user} />

            <p className={scss.wizardNote}>
              {wishlist.data?.length ? (
                <>
                  <PiCheckBold aria-hidden="true" /> {t.giftsOnWishlist(wishlist.data.length)}
                </>
              ) : (
                <>{t.addGiftsLater}</>
              )}
            </p>

            {/* Summary so nothing is a surprise */}
            <dl className={scss.summary}>
              <div>
                <dt>{t.summaryEvent}</dt>
                <dd>{draft.name.trim()}</dd>
              </div>
              {draft.eventDate && (
                <div>
                  <dt>{t.summaryDate}</dt>
                  <dd>{formatDay(draft.eventDate, locale)}</dd>
                </div>
              )}
              {budget && (
                <div>
                  <dt>{t.summaryBudget}</dt>
                  <dd>{budget}</dd>
                </div>
              )}
            </dl>

            {create.isError && (
              <p className={scss.alert} role="alert">
                {getErrorMessage(create.error, m)}
              </p>
            )}

            <div className={scss.wizardActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                <PiArrowLeftBold className="icon-nudge-back" aria-hidden="true" /> {m.common.back}
              </button>
              <button type="button" className="btn btn-primary btn-lg btn-glow" onClick={submit} disabled={create.isPending}>
                <PiGiftFill aria-hidden="true" />
                {create.isPending ? t.submitting : t.submit}
              </button>
            </div>
          </div>
        )}

        {step === 3 && created && (
          <div className={scss.success}>
            <div className={scss.successGift}>
              <GiftBox size={120} glow sparkles />
              <Confetti burst={1} />
            </div>
            <h1 className={scss.wizardTitle}>{t.successTitle}</h1>
            <p className={scss.subtitle}>{t.successText(created.name)}</p>

            <InviteShare code={created.inviteCode} eventName={created.name} />

            <div className={scss.wizardActions}>
              <button type="button" className="btn btn-primary btn-lg" onClick={() => router.push(`/events/${created.id}`)}>
                {t.goToEvent} <PiArrowRightBold className="icon-nudge" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEvent;
