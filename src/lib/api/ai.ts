import { api, getErrorMessage, isAuthEndpoint, translateServerMessage } from "./client";
import { parseSse } from "@/lib/ai/sse";
import type { AiPage } from "@/lib/ai/pages";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";

/** Mirrors the API limit (SendMessageDto) */
export const MAX_AI_MESSAGE_LENGTH = 2000;

export interface AiConversation {
  id: string;
  /** null: a general conversation about the app */
  eventId: string | null;
  eventName: string | null;
  /** Start of the first message; null until one is sent */
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

/**
 * What the assistant can do in a conversation:
 * general — about the app, no event · not_drawn / not_revealed — about an event, no recipient
 * ready — my match is open: gift help for my recipient · unavailable — I'm no longer in the event
 */
export type AiState = "general" | "not_drawn" | "not_revealed" | "ready" | "unavailable";

export interface AiConversationDetails {
  conversation: AiConversation;
  messages: AiMessage[];
  state: AiState;
  /** Only once I opened my match */
  recipientName: string | null;
}

export type AiReplyEvent =
  | { type: "delta"; text: string }
  | { type: "done"; userMessage: AiMessage; message: AiMessage };

/** Codes the API sends for model failures — worded by the page (m.ai.errors) */
export type AiErrorCode = "ai_unavailable" | "ai_busy" | "ai_timeout" | "ai_refused";

/** A failed reply. status null = no response at all (offline) */
export class AiReplyError extends Error {
  constructor(
    readonly status: number | null,
    readonly code?: AiErrorCode,
    readonly apiMessage?: string,
  ) {
    super(code ?? apiMessage ?? `AI reply failed (${status ?? "network"})`);
  }
}

export const aiApi = {
  conversations: () =>
    api.get<{ conversations: AiConversation[] }>("/ai/conversations").then((res) => res.data.conversations),

  conversation: (id: string) =>
    api.get<AiConversationDetails>(`/ai/conversations/${id}`).then((res) => res.data),

  /** eventId null: a general conversation. Otherwise the server finds my recipient in the event itself */
  create: (eventId: string | null) =>
    api.post<{ conversation: AiConversation }>("/ai/conversations", { eventId }).then((res) => res.data.conversation),

  remove: (id: string) => api.delete(`/ai/conversations/${id}`).then(() => undefined),

  /**
   * Sends a message and yields the reply as it is written (SSE over fetch — axios can't
   * stream in the browser). Throws AiReplyError; an AbortError when `signal` fires.
   */
  async *reply(id: string, content: string, locale: Locale, page?: AiPage, signal?: AbortSignal): AsyncGenerator<AiReplyEvent> {
    const response = await postWithRefresh(`/ai/conversations/${id}/messages`, { content, locale, page }, signal);
    if (!response.ok) throw await replyError(response);
    if (!response.body) throw new AiReplyError(null);

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const { events, rest } = parseSse(buffer + value);
        buffer = rest;
        for (const { event, data } of events) {
          const payload = JSON.parse(data) as Record<string, unknown>;
          if (event === "delta") yield { type: "delta", text: payload.text as string };
          else if (event === "done") {
            yield { type: "done", userMessage: payload.userMessage as AiMessage, message: payload.message as AiMessage };
            return;
          } else if (event === "error") throw new AiReplyError(200, payload.code as AiErrorCode);
        }
      }
    } finally {
      reader.releaseLock();
    }
    // The stream ended without "done": the connection dropped mid-reply
    throw new AiReplyError(null, "ai_unavailable");
  },
};

/** fetch with the same one-time silent refresh the axios client does on a 401 */
async function postWithRefresh(path: string, body: unknown, signal?: AbortSignal): Promise<Response> {
  const send = () =>
    fetch(`/api${path}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify(body),
      signal,
    }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      throw new AiReplyError(null);
    });

  const response = await send();
  if (response.status !== 401 || isAuthEndpoint(path)) return response;
  try {
    await api.post("/auth/refresh");
  } catch {
    return response; // the session is over — AppShell takes it from here
  }
  return send();
}

async function replyError(response: Response): Promise<AiReplyError> {
  const body = (await response.json().catch(() => ({}))) as { code?: AiErrorCode; message?: string | string[] };
  const message = Array.isArray(body.message) ? body.message[0] : body.message;
  return new AiReplyError(response.status, body.code, message);
}

/** Any AI error in the reader's language */
export function aiErrorMessage(error: unknown, m: Messages): string {
  if (!(error instanceof AiReplyError)) return getErrorMessage(error, m);
  if (error.code) return m.ai.errors[error.code];
  if (error.status === null) return m.errors.offline;
  if (error.status === 429) return m.ai.errors.tooMany;
  if (error.status >= 500) return m.errors.server;
  return error.apiMessage ? translateServerMessage(error.apiMessage, m) : m.errors.generic;
}
