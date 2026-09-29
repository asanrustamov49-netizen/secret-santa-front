"use client";
import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { PiArrowUpBold, PiStopFill } from "react-icons/pi";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./ai.module.scss";

/** Mirrors the API limit (SendMessageDto) */
export const MAX_MESSAGE_LENGTH = 2000;
/** The counter appears only near the limit */
const COUNTER_FROM = MAX_MESSAGE_LENGTH - 200;

interface AiComposerProps {
  /** Resolves false when the message didn't go through: the text comes back */
  onSend: (content: string) => Promise<boolean>;
  onStop?: () => void;
  /** A reply is on its way: sending is paused, Stop is offered */
  busy: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

/** Enter sends, Shift+Enter adds a line. Starts at two lines, grows with the text up to a limit. */
const AiComposer = ({ onSend, onStop, busy, disabled, autoFocus }: AiComposerProps) => {
  const { m } = useI18n();
  const t = m.ai;
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const text = value.trim();
  const canSend = Boolean(text) && !busy && !disabled;

  const resize = () => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
  };

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!canSend) return;
    setValue("");
    requestAnimationFrame(resize);
    const sent = await onSend(text);
    // Nothing lost: a failed message comes back unless something new was typed meanwhile
    if (!sent) {
      setValue((current) => current || text);
      requestAnimationFrame(resize);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // isComposing: Enter that confirms an IME candidate must not send
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <form className={`${scss.composer} ${busy ? scss.composerBusy : ""}`} onSubmit={submit}>
      <label htmlFor="ai-composer" className="visually-hidden">
        {t.placeholder}
      </label>
      <textarea
        id="ai-composer"
        ref={inputRef}
        className={scss.composerInput}
        rows={2}
        maxLength={MAX_MESSAGE_LENGTH}
        placeholder={t.placeholder}
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        enterKeyHint="send"
        onChange={(event) => {
          setValue(event.target.value);
          resize();
        }}
        onKeyDown={onKeyDown}
        aria-describedby="ai-composer-keys"
      />
      {value.length >= COUNTER_FROM && (
        <span className={scss.counter} aria-live="polite">
          {t.charsLeft(MAX_MESSAGE_LENGTH - value.length)}
        </span>
      )}
      {busy && onStop ? (
        <button type="button" className={scss.sendButton} onClick={onStop} aria-label={t.stop} title={t.stop}>
          <PiStopFill aria-hidden="true" />
        </button>
      ) : (
        <button type="submit" className={scss.sendButton} disabled={!canSend} aria-label={t.send} title={t.send}>
          <PiArrowUpBold aria-hidden="true" />
        </button>
      )}
      <span id="ai-composer-keys" className={scss.keyHint}>
        {t.keyHint}
      </span>
    </form>
  );
};

export default AiComposer;
