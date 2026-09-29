"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountApi, type PreferencesPayload } from "@/lib/api/account";
import { sessionKey } from "@/lib/auth/useSession";
import { readPreference } from "@/lib/theme/theme";

/**
 * Saves account preferences. The API answers with the updated user, which
 * becomes the session — the same way profile updates do.
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PreferencesPayload) => accountApi.updatePreferences(payload),
    // One at a time, in click order: the server ends up with the last choice
    scope: { id: "account-preferences" },
    onSuccess: (user, payload) => {
      // A theme answer that no longer matches this browser's choice is outdated
      // (a newer pick is queued, or its save failed). Caching it would make the
      // server-theme sync switch the page back — keep the user's latest pick.
      if (payload.themePreference && user.themePreference !== readPreference()) return;
      queryClient.setQueryData(sessionKey, user);
    },
  });
}
