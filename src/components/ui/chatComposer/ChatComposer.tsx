"use client";
import { useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { PiPaperPlaneRightFill, PiStopFill } from "react-icons/pi";
import scss from "./chatComposer.module.scss";

interface ChatComposerProps {
  /** Unique on the page: ties the label and hint to the field */
  id: string;
  /** Read by screen readers (the placeholder alone is not a label) */
  label: string;
  placeholder: string;
  maxLength: number;
  /** Resolves false when the message didn't go through: the text comes back */
  onSend: (content: string) => Promise<boolean>;
  /** A message / reply is on its way: sending is paused (Stop is offered when onStop is set) */
  busy?: boolean;
  onStop?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
  sendLabel: string;
  stopLabel?: string;
  /** "Enter to send · Shift + Enter for a new line" — shown under the field */
  keyHint?: string;
  charsLeft: (count: number) => string;
  /** compact — for the mini assistant */
  size?: "regular" | "compact";
}

/**
 * The message field shared by the event chat and the mini assistant.
 * Enter sends, Shift+Enter adds a line; it grows with the text up to a limit.
 */
const ChatComposer = ({
  id,
  label,
  placeholder,
  maxLength,
  onSend,
  busy = false,
  onStop,
  disabled,
  autoFocus,
  sendLabel,
  stopLabel,
  keyHint,
  charsLeft,
  size = "regular",
}: ChatComposerProps) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const text = value.trim();
  const canSend = Boolean(text) && !busy && !disabled;
  // The counter appears only near the limit
  const showCounter = value.length >= maxLength - Math.min(200, Math.round(maxLength / 5));

  // Grows with the text (and shrinks back once it is sent) — measured after each change
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
  }, [value]);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!canSend) return;
    setValue("");
    const sent = await onSend(text);
    // Nothing lost: a failed message comes back unless something new was typed meanwhile
    if (!sent) setValue((current) => current || text);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // isComposing: Enter that confirms an IME candidate must not send
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  };

  const hintId = keyHint ? `${id}-keys` : undefined;

  return (
    <form
      className={`${scss.composer} ${scss[size]} ${busy ? scss.busy : ""} ${disabled ? scss.disabled : ""}`}
      onSubmit={submit}
    >
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <textarea
        id={id}
        ref={inputRef}
        className={scss.input}
        rows={1}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        enterKeyHint="send"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        aria-describedby={hintId}
      />
      {busy && onStop ? (
        <button type="button" className={scss.send} onClick={onStop} aria-label={stopLabel} title={stopLabel}>
          <PiStopFill aria-hidden="true" />
        </button>
      ) : (
        <button
          type="submit"
          className={scss.send}
          disabled={!canSend}
          aria-label={sendLabel}
          title={sendLabel}
          aria-busy={busy || undefined}
        >
          {busy ? <span className="spinner" aria-hidden="true" /> : <PiPaperPlaneRightFill className="icon-lift" aria-hidden="true" />}
        </button>
      )}
      {(keyHint || showCounter) && (
        <p className={scss.meta}>
          {keyHint && (
            <span id={hintId} className={scss.keyHint}>
              {keyHint}
            </span>
          )}
          {showCounter && (
            <span className={scss.counter} aria-live="polite">
              {charsLeft(maxLength - value.length)}
            </span>
          )}
        </p>
      )}
    </form>
  );
};

export default ChatComposer;
