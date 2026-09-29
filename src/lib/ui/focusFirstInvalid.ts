/**
 * After a failed submit: move focus to the first field the form marks `aria-invalid`.
 * Deferred a task so React has committed the new errors first (not rAF — it stalls in background tabs).
 */
export function focusFirstInvalid(form: EventTarget | null) {
  if (!(form instanceof HTMLFormElement)) return;
  setTimeout(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
}
