import { api } from "./client";
import type { User } from "./auth";

/** PATCH /account/preferences — send only what changes */
export type PreferencesPayload = Partial<
  Pick<User, "themePreference" | "notifyEmail" | "notifyReminders" | "notifyInvites">
>;

/** The signed-in user's own account settings (/api/account/*) */
export const accountApi = {
  updatePreferences: (payload: PreferencesPayload) =>
    api.patch<{ user: User }>("/account/preferences", payload).then((r) => r.data.user),

  /** Other devices are signed out; this one stays */
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.post("/account/password", payload).then(() => undefined),

  /** First password of a Google-only account — right after confirming with Google */
  setPassword: (payload: { newPassword: string }) =>
    api.post<{ user: User }>("/account/password/set", payload).then((r) => r.data.user),
};
