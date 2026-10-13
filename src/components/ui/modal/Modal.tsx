"use client";
import { useEffect, useRef, type ReactNode } from "react";
import scss from "./modal.module.scss";

interface ModalProps {
  open: boolean;
  /** Esc, a click on the backdrop, or anything else that closed the dialog */
  onClose: () => void;
  /** The dialog's accessible name */
  label: string;
  /** Size and place of the box (width, margins) */
  className?: string;
  /** Close without the fade-out — e.g. right before a page transition snapshots the screen */
  instant?: boolean;
  /** Focus this element after opening (a CSS selector inside the dialog); default: the browser's pick */
  initialFocus?: string;
  children: ReactNode;
}

/**
 * The app's modal: a native <dialog> in the top layer. Focus stays inside, Esc closes it,
 * the page behind is inert and doesn't scroll. It drops in with a small scale over a
 * dimmed, softly blurred page and fades out quickly (@starting-style; browsers without
 * it simply show and hide it).
 */
const Modal = ({ open, onClose, label, className, instant, initialFocus, children }: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      if (initialFocus) dialog.querySelector<HTMLElement>(initialFocus)?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocus]);

  return (
    <dialog
      ref={dialogRef}
      className={`${scss.dialog} ${className ?? ""}`}
      aria-label={label}
      data-instant={instant || undefined}
      onClose={() => open && onClose()}
      // A click on the dim backdrop lands on the dialog itself
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      {children}
    </dialog>
  );
};

export default Modal;
