// UI actions the assistant may *offer* — shown as a button, applied only when the user
// presses it. The model marks one as [[action:theme:dark]] on its own line; anything
// outside this list is dropped, and no marker is ever shown as text.
// Mirrors backend src/ai/ai-prompt.ts (AI_ACTIONS). No imports: unit tested by node --test.

export const AI_ACTIONS = [
  "theme:light",
  "theme:dark",
  "theme:system",
  "language:ru",
  "language:en",
  "language:ky",
] as const;

export type AiAction = (typeof AI_ACTIONS)[number];

export function isAiAction(value: unknown): value is AiAction {
  return typeof value === "string" && (AI_ACTIONS as readonly string[]).includes(value);
}

const MARKER = /\[\[\s*action\s*:\s*([^\]\s]*)\s*\]\]/gi;
/** The start of a marker still streaming in ("… [[act") — hidden until it completes */
const PARTIAL_TAIL = /\[(?:\[[^\]]*)?$/;

/**
 * The reply's text without markers, and the allowlisted actions it offers (each once).
 * `streaming`: also hide an unfinished marker at the very end.
 */
export function splitAiActions(content: string, streaming = false): { text: string; actions: AiAction[] } {
  const actions: AiAction[] = [];
  let text = content.replace(MARKER, (_, name: string) => {
    const action = name.toLowerCase();
    if (isAiAction(action) && !actions.includes(action)) actions.push(action);
    return "";
  });
  if (streaming) text = text.replace(PARTIAL_TAIL, "");
  return { text: text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim(), actions };
}

/** "theme:dark" → ["theme", "dark"] */
export function actionParts(action: AiAction): ["theme", "light" | "dark" | "system"] | ["language", "ru" | "en" | "ky"] {
  const [kind, value] = action.split(":");
  return kind === "theme"
    ? ["theme", value as "light" | "dark" | "system"]
    : ["language", value as "ru" | "en" | "ky"];
}
