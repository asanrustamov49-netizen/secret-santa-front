"use client";
import { useEffect, useState, type ReactNode } from "react";

interface ConfirmButtonProps {
  children: ReactNode;
  /** Label on the second, "are you sure" click */
  confirmLabel: ReactNode;
  onConfirm: () => void;
  className?: string;
  confirmClassName?: string;
  disabled?: boolean;
  /** The confirmed action is running: spinner + locked, so it can't be sent twice */
  pending?: boolean;
  /** Shown next to the spinner while pending (e.g. "Deleting…"; visually hidden text for icon buttons) */
  pendingLabel?: ReactNode;
  "aria-label"?: string;
}

/**
 * Two-step button for things that can't be undone: the first click arms it,
 * a second click within 4 s does it. No modal, no accidents.
 */
const ConfirmButton = ({
  children,
  confirmLabel,
  onConfirm,
  className,
  confirmClassName,
  disabled,
  pending,
  pendingLabel,
  "aria-label": ariaLabel,
}: ConfirmButtonProps) => {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  if (pending) {
    return (
      <button type="button" className={confirmClassName ?? className} disabled aria-busy="true">
        <span className="spinner" aria-hidden="true" />
        {pendingLabel}
      </button>
    );
  }

  if (armed) {
    return (
      <button
        type="button"
        className={confirmClassName ?? className}
        disabled={disabled}
        autoFocus
        onClick={() => {
          setArmed(false);
          onConfirm();
        }}
        onBlur={() => setArmed(false)}
      >
        {confirmLabel}
      </button>
    );
  }

  return (
    <button type="button" className={className} disabled={disabled} onClick={() => setArmed(true)} aria-label={ariaLabel}>
      {children}
    </button>
  );
};

export default ConfirmButton;
