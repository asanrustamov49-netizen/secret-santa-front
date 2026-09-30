"use client";
import { useId, useState, type InputHTMLAttributes } from "react";
import { PiEye, PiEyeSlash } from "react-icons/pi";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./textField.module.scss";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
  /** Marks the field as optional next to its label ("Link · Optional") — not in the placeholder */
  optional?: boolean;
}

/** Labelled input with inline error. type="password" gets a show/hide toggle. */
const TextField = ({ label, error, hint, optional, type = "text", className, ...inputProps }: TextFieldProps) => {
  const id = useId();
  const [isRevealed, setIsRevealed] = useState(false);
  const { m } = useI18n();
  const isPassword = type === "password";
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={`${scss.field} ${className ?? ""}`}>
      <label htmlFor={id} className={scss.label}>
        {label}
        {optional && <span className={scss.optional}>{m.common.optional}</span>}
      </label>

      <div className={scss.control}>
        <input
          id={id}
          type={isPassword && isRevealed ? "text" : type}
          className={`input ${scss.input} ${error ? scss.invalid : ""} ${isPassword ? scss.withToggle : ""}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            className={scss.toggle}
            onClick={() => setIsRevealed((value) => !value)}
            aria-label={isRevealed ? m.auth.hidePassword : m.auth.showPassword}
          >
            {isRevealed ? <PiEyeSlash /> : <PiEye />}
          </button>
        )}
      </div>

      {error ? (
        <p id={`${id}-error`} className={scss.error} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={scss.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
};

export default TextField;
