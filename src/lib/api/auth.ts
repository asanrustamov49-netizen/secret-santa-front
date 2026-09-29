import { api } from "./client";

export type ThemePreferenceDto = "light" | "dark" | "system";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  interests: string[];
  /** Can sign in with a password (false for Google-only accounts) */
  hasPassword: boolean;
  /** A Google account is connected */
  hasGoogle: boolean;
  themePreference: ThemePreferenceDto;
  notifyEmail: boolean;
  notifyReminders: boolean;
  notifyInvites: boolean;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export const authApi = {
  me: () => api.get<{ user: User }>("/auth/me").then((r) => r.data.user),
  login: (payload: LoginPayload) =>
    api.post<{ user: User }>("/auth/login", payload).then((r) => r.data.user),
  register: (payload: RegisterPayload) =>
    api.post<{ user: User }>("/auth/register", payload).then((r) => r.data.user),
  logout: () => api.post("/auth/logout").then(() => undefined),
  /** Ends the account's sessions on every other device; this browser stays signed in */
  logoutAll: () => api.post("/auth/logout-all").then(() => undefined),
};
