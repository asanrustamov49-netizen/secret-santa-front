"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import { FcGoogle } from "react-icons/fc";
import { PiKeyBold } from "react-icons/pi";
import TextField from "@/components/ui/textField/TextField";
import type { User } from "@/lib/api/auth";
import { apiMessage, getErrorMessage } from "@/lib/api/client";
import { useChangePassword, useSetPassword } from "@/lib/account/usePassword";
import { GOOGLE_REAUTH_URL, reauthErrorMessage } from "@/lib/auth/google";
import { changePasswordSchema, fieldMessages, setPasswordSchema } from "@/lib/auth/schemas";
import { toast } from "@/lib/toast";
import { focusFirstInvalid } from "@/lib/ui/focusFirstInvalid";
import { useFieldMessages, useI18n, useMessage } from "@/i18n/I18nProvider";
import type { Say } from "@/i18n/messages";
import SettingRow from "./SettingRow";
import scss from "./settings.module.scss";

type Values = { currentPassword: string; newPassword: string; confirmPassword: string };
const EMPTY: Values = { currentPassword: "", newPassword: "", confirmPassword: "" };

const statusOf = (error: unknown) => (error instanceof AxiosError ? error.response?.status : undefined);

/**
 * Password settings — a row in the Security section.
 * - Has a password → change it (the current one proves it's you).
 * - Google-only → set a first one. There's no current password to check, so the
 *   user confirms with Google first: a full-page trip to GOOGLE_REAUTH_URL that
 *   comes back here with ?reauth=ok (the API then allows setting it for 5 min).
 */
const PasswordCard = ({ user }: { user: User }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Read once: the URL is tidied right away, the result stays for this visit
  const [reauth, setReauth] = useState(() => searchParams.get("reauth"));
  const reauthInUrl = searchParams.has("reauth");

  const changePassword = useChangePassword();
  const setPassword = useSetPassword();
  const pending = changePassword.isPending || setPassword.isPending;

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useFieldMessages<keyof Values>();
  const [formError, setFormError] = useMessage();
  const formRef = useRef<HTMLFormElement>(null);
  const { m } = useI18n();
  const t = m.settings.password;

  useEffect(() => {
    if (reauthInUrl) router.replace("/settings", { scroll: false });
  }, [reauthInUrl, router]);

  const isSetting = !user.hasPassword;
  // Google-only and just back from Google: the set-password form opens by itself
  const showForm = isSetting ? reauth === "ok" : open;

  const update = (field: keyof Values) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(undefined);
  };

  const close = () => {
    setOpen(false);
    setReauth(null);
    setValues(EMPTY);
    setErrors({});
    setFormError(undefined);
  };

  // A server answer arrives outside any event: render the error now, then focus it
  const showFieldError = (field: keyof Values, say: Say) => {
    flushSync(() => setErrors({ [field]: say }));
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);

    if (isSetting) {
      const parsed = setPasswordSchema.safeParse(values);
      if (!parsed.success) {
        setErrors(fieldMessages(parsed.error));
        return focusFirstInvalid(event.currentTarget);
      }
      setPassword.mutate(
        { newPassword: parsed.data.newPassword },
        {
          onSuccess: () => {
            close();
            toast((m) => m.settings.password.setDone);
          },
          onError: (error) => {
            // Grant missing or expired: back to "confirm with Google"
            if (statusOf(error) === 403) {
              close();
              setReauth("expired");
              return;
            }
            setFormError((m) => getErrorMessage(error, m));
          },
        },
      );
      return;
    }

    const parsed = changePasswordSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldMessages(parsed.error));
      return focusFirstInvalid(event.currentTarget);
    }
    changePassword.mutate(
      { currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword },
      {
        onSuccess: () => {
          close();
          toast((m) => m.settings.password.changed);
        },
        onError: (error) => {
          const status = statusOf(error);
          const say: Say = (m) => getErrorMessage(error, m);
          if (status === 403) return showFieldError("currentPassword", say);
          // Matched on the API's English text: the translated one differs per language
          if (status === 400 && /different/i.test(apiMessage(error) ?? "")) return showFieldError("newPassword", say);
          setFormError(say);
        },
      },
    );
  };

  const reauthNotice =
    reauth === "expired"
      ? t.expired
      : reauth && reauth !== "ok"
        ? reauthErrorMessage(reauth, m)
        : null;

  return (
    <div className={scss.rowBlock}>
      {!showForm ? (
        <SettingRow title={isSetting ? t.noPassword : t.title} text={isSetting ? t.noPasswordText : t.changeText}>
          {isSetting ? (
            // A plain link on purpose: the whole page goes to Google and comes back
            <a href={GOOGLE_REAUTH_URL} className={`btn btn-outline ${scss.rowButton}`}>
              <FcGoogle aria-hidden="true" /> {t.set}
            </a>
          ) : (
            <button type="button" className={`btn btn-outline ${scss.rowButton}`} onClick={() => setOpen(true)}>
              <PiKeyBold aria-hidden="true" /> {t.change}
            </button>
          )}
        </SettingRow>
      ) : (
        <form ref={formRef} className={scss.passwordForm} onSubmit={onSubmit} noValidate aria-labelledby="password-form-title">
          <h3 id="password-form-title" className={scss.rowTitle}>
            {isSetting ? t.set : t.change}
          </h3>
          {isSetting && <p className={scss.rowDescription}>{t.googleConfirmed}</p>}

          {/* Lets password managers file the new password under the right account */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={user.email}
            readOnly
            hidden
          />

          {!isSetting && (
            <TextField
              label={t.current}
              type="password"
              name="currentPassword"
              autoComplete="current-password"
              value={values.currentPassword}
              onChange={update("currentPassword")}
              error={errors.currentPassword}
              autoFocus
            />
          )}
          <TextField
            label={t.new}
            type="password"
            name="newPassword"
            autoComplete="new-password"
            hint={t.hint}
            value={values.newPassword}
            onChange={update("newPassword")}
            error={errors.newPassword}
            autoFocus={isSetting}
          />
          <TextField
            label={t.confirm}
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={update("confirmPassword")}
            error={errors.confirmPassword}
          />

          {formError && (
            <p className="form-alert" role="alert">
              {formError}
            </p>
          )}

          <div className={scss.formActions}>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending && <span className="spinner" aria-hidden="true" />}
              {pending ? m.common.saving : isSetting ? t.set : t.savePassword}
            </button>
            <button type="button" className="btn btn-outline" onClick={close} disabled={pending}>
              {m.common.cancel}
            </button>
          </div>
        </form>
      )}

      {reauthNotice && (
        <p className="form-alert" role="alert">
          {reauthNotice}
        </p>
      )}
    </div>
  );
};

export default PasswordCard;
