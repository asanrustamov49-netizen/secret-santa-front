import { api } from "./client";
import type { WishlistItem } from "./profile";

export type EventStatus = "open" | "drawn" | "completed";

export interface SantaEvent {
  id: string;
  name: string;
  description: string | null;
  /** YYYY-MM-DD */
  eventDate: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  maxParticipants: number | null;
  status: EventStatus;
  inviteCode: string;
  drawnAt: string | null;
  createdAt: string;
  isOwner: boolean;
  ownerName: string;
  participantCount: number;
  readyCount: number;
  /** I already opened my Secret Santa here */
  revealed: boolean;
}

export interface Participant {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  isOwner: boolean;
  isMe: boolean;
  ready: boolean;
  joinedAt: string;
}

export interface EventPayload {
  name?: string;
  description?: string | null;
  eventDate?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  maxParticipants?: number | null;
}

export interface Recipient {
  name: string;
  avatarUrl: string | null;
  interests: string[];
  wishlist: WishlistItem[];
}

export interface MatchResult {
  event: SantaEvent;
  revealedAt: string | null;
  /** null until revealed */
  recipient: Recipient | null;
}

export interface MyMatch {
  eventId: string;
  eventName: string;
  eventDate: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  status: EventStatus;
  revealedAt: string | null;
  recipientName: string | null;
  recipientAvatarUrl: string | null;
}

export interface InvitePreview {
  name: string;
  description: string | null;
  eventDate: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  maxParticipants: number | null;
  status: EventStatus;
  ownerName: string;
  participantCount: number;
  people: { name: string; avatarUrl: string | null }[];
}

export const eventsApi = {
  list: () => api.get<{ events: SantaEvent[] }>("/events").then((r) => r.data.events),
  details: (id: string) =>
    api.get<{ event: SantaEvent; participants: Participant[] }>(`/events/${id}`).then((r) => r.data),
  create: (payload: EventPayload & { name: string }) =>
    api.post<{ event: SantaEvent }>("/events", payload).then((r) => r.data.event),
  update: (id: string, payload: EventPayload) =>
    api.patch<{ event: SantaEvent }>(`/events/${id}`, payload).then((r) => r.data.event),
  remove: (id: string) => api.delete(`/events/${id}`).then(() => undefined),

  regenerateInvite: (id: string) =>
    api.post<{ event: SantaEvent }>(`/events/${id}/invite`).then((r) => r.data.event),
  removeParticipant: (id: string, participantId: string) =>
    api.delete(`/events/${id}/participants/${participantId}`).then(() => undefined),
  leave: (id: string) => api.post(`/events/${id}/leave`).then(() => undefined),
  draw: (id: string) => api.post<{ event: SantaEvent }>(`/events/${id}/draw`).then((r) => r.data.event),
  complete: (id: string) => api.post<{ event: SantaEvent }>(`/events/${id}/complete`).then((r) => r.data.event),

  match: (id: string) => api.get<MatchResult>(`/events/${id}/match`).then((r) => r.data),
  reveal: (id: string) => api.post<MatchResult>(`/events/${id}/match/reveal`).then((r) => r.data),
  myMatches: () => api.get<{ matches: MyMatch[] }>("/matches").then((r) => r.data.matches),

  invite: (code: string) => api.get<{ invite: InvitePreview }>(`/invites/${code}`).then((r) => r.data.invite),
  join: (code: string) =>
    api.post<{ eventId: string; joined: boolean }>(`/invites/${code}/join`).then((r) => r.data),
};
