"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PiLinkBold } from "react-icons/pi";
import { extractInviteCode } from "@/lib/events/format";
import { useI18n, useMessage } from "@/i18n/I18nProvider";
import scss from "./events.module.scss";

/** Got an invite in a chat? Paste the link (or just the code) here. */
const JoinWithLink = ({ className, autoFocus }: { className?: string; autoFocus?: boolean }) => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useMessage();
  const { m } = useI18n();
  const t = m.events.joinLink;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const code = extractInviteCode(value);
    if (!code) return setError((m) => m.events.joinLink.invalid);
    router.push(`/join/${code}`);
  };

  return (
    <form className={`${scss.joinForm} ${className ?? ""}`} onSubmit={onSubmit} noValidate>
      <label htmlFor="join-link" className={scss.joinLabel}>
        <PiLinkBold aria-hidden="true" /> {t.label}
      </label>
      <div className={scss.joinRow}>
        <input
          id="join-link"
          className="input"
          placeholder={t.placeholder}
          value={value}
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            setValue(event.target.value);
            setError(undefined);
          }}
        />
        <button type="submit" className="btn btn-outline" disabled={!value.trim()}>
          {t.open}
        </button>
      </div>
      {error && (
        <p className={scss.fieldError} role="alert">
          {error}
        </p>
      )}
    </form>
  );
};

export default JoinWithLink;
