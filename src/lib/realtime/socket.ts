"use client";
import { io, type Socket } from "socket.io-client";
import { api } from "@/lib/api/client";
import { isChatMessagePayload, type ChatMessage } from "@/lib/chat/messages";
import {
  CHAT_MESSAGE_EVENT,
  isRealtimeEvent,
  isRealtimePayload,
  type RealtimeEventName,
  type RealtimeStatus,
} from "./events";

// One Socket.IO connection per tab, shared by the whole app (RealtimeProvider starts it).
// It is only a "something changed" channel: REST stays the source of truth, and nothing
// breaks without it — the pages just stop updating by themselves until it's back.
//
// The socket talks to the API host directly (WebSockets can't go through the Next.js
// /api rewrite), so the auth cookies don't travel with it. Instead every (re)connect
// asks for a one-minute ticket over the usual cookie-authenticated REST call and
// hands it over in the handshake payload — never in the URL.

/** The API's own address (the REST calls go through /api on this site instead) */
const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL ?? "https://secret-santa-back-k0vs.onrender.com";

type Listener = (name: RealtimeEventName, eventId: string) => void;

let socket: Socket | null = null;
let status: RealtimeStatus = "idle";
/** Event rooms wanted by the page, with how many subscribers each */
const rooms = new Map<string, number>();
const statusListeners = new Set<() => void>();
const eventListeners = new Set<Listener>();
const reconnectListeners = new Set<() => void>();
const chatListeners = new Set<(message: ChatMessage) => void>();
let everConnected = false;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let retryAttempt = 0;

function setStatus(next: RealtimeStatus) {
  if (status === next) return;
  status = next;
  for (const listener of statusListeners) listener();
}

async function fetchTicket(): Promise<string | undefined> {
  try {
    const { data } = await api.get<{ ticket: string }>("/realtime/ticket");
    return data.ticket;
  } catch {
    return undefined; // signed out or offline: the handshake is refused and retried later
  }
}

/**
 * The server refused the handshake (expired ticket, session over, API restarting).
 * Socket.IO doesn't retry those by itself: try again with a fresh ticket, backing off.
 */
function scheduleRetry() {
  if (!socket || retryTimer) return;
  const delay = Math.min(30_000, 2_000 * 2 ** retryAttempt);
  retryAttempt++;
  retryTimer = setTimeout(() => {
    retryTimer = undefined;
    if (socket && !socket.connected) socket.connect();
  }, delay);
}

function joinRoom(eventId: string) {
  socket?.emit("event:join", { eventId });
}

function onOnline() {
  if (socket && !socket.connected) socket.connect();
}

function onOffline() {
  setStatus("offline");
}

/** Opens the shared connection (idempotent). Call once for the signed-in app. */
export function connectRealtime() {
  if (socket) return;
  setStatus("connecting");

  socket = io(REALTIME_URL, {
    autoConnect: false,
    // WebSocket first; long-polling only as the transport fallback of a live connection
    transports: ["websocket", "polling"],
    withCredentials: false,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
    // A fresh ticket on every (re)connect
    auth: (callback) => {
      void fetchTicket().then((ticket) => callback(ticket ? { ticket } : {}));
    },
  });

  socket.on("connect", () => {
    retryAttempt = 0;
    setStatus("connected");
    for (const eventId of rooms.keys()) joinRoom(eventId);
    // Back after a gap: whatever was missed meanwhile is refetched
    if (everConnected) for (const listener of reconnectListeners) listener();
    everConnected = true;
  });

  socket.on("disconnect", (reason) => {
    if (reason === "io client disconnect") return setStatus("idle");
    setStatus(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "reconnecting");
    // The server closed it on purpose: Socket.IO won't come back by itself
    if (reason === "io server disconnect") scheduleRetry();
  });

  socket.on("connect_error", () => {
    setStatus(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "reconnecting");
    if (!socket?.active) scheduleRetry();
  });

  socket.onAny((name: unknown, payload: unknown) => {
    // The one message with data: a new chat message (checked field by field)
    if (name === CHAT_MESSAGE_EVENT) {
      if (isChatMessagePayload(payload)) for (const listener of chatListeners) listener(payload.message);
      return;
    }
    if (!isRealtimeEvent(name) || !isRealtimePayload(payload)) return;
    for (const listener of eventListeners) listener(name, payload.eventId);
  });

  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  socket.connect();
}

/** Closes it — on sign-out, and when the signed-in app unmounts */
export function disconnectRealtime() {
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = undefined;
  retryAttempt = 0;
  everConnected = false;
  rooms.clear();
  if (typeof window !== "undefined") {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
  }
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
  setStatus("idle");
}

/**
 * Listen to one event while a page needs it. The server checks membership; a refused
 * join simply means no live updates for it. Returns the "stop listening" function.
 */
export function joinEventRoom(eventId: string): () => void {
  const count = rooms.get(eventId) ?? 0;
  rooms.set(eventId, count + 1);
  if (count === 0 && socket?.connected) joinRoom(eventId);

  return () => {
    const left = (rooms.get(eventId) ?? 1) - 1;
    if (left > 0) return void rooms.set(eventId, left);
    rooms.delete(eventId);
    socket?.emit("event:leave", { eventId });
  };
}

/** The events currently listened to */
export const joinedEventIds = () => [...rooms.keys()];

export function onRealtimeEvent(listener: Listener): () => void {
  eventListeners.add(listener);
  return () => void eventListeners.delete(listener);
}

/** New event-chat messages from any event I listen to (the rooms are membership-checked) */
export function onChatMessage(listener: (message: ChatMessage) => void): () => void {
  chatListeners.add(listener);
  return () => void chatListeners.delete(listener);
}

export function onRealtimeReconnect(listener: () => void): () => void {
  reconnectListeners.add(listener);
  return () => void reconnectListeners.delete(listener);
}

export const getRealtimeStatus = () => status;

export function subscribeRealtimeStatus(listener: () => void): () => void {
  statusListeners.add(listener);
  return () => void statusListeners.delete(listener);
}
