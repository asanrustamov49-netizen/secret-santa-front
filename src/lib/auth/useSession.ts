"use client";
import { useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { authApi, type LoginPayload, type RegisterPayload } from "@/lib/api/auth";

export const sessionKey = ["session"] as const;

/** Readable by client code: set together with the httpOnly auth cookies */
export function hasSessionHint() {
  return typeof document !== "undefined" && document.cookie.includes("has_session=");
}

const noopSubscribe = () => () => {};

/**
 * hasSessionHint() as a hook: false on the server and during hydration (no mismatch),
 * the real value right after. Instant — no request to the API.
 */
export function useSessionHint() {
  return useSyncExternalStore(noopSubscribe, hasSessionHint, () => false);
}

/**
 * The signed-in user, or null for guests.
 * `enabled` lets public pages skip the request when there's clearly no session.
 */
export function useSession({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: sessionKey,
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) return null;
        throw error;
      }
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (user) => queryClient.setQueryData(sessionKey, user),
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (user) => queryClient.setQueryData(sessionKey, user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    // Drop every cached query — nothing of the previous user may leak into the next one
    onSettled: () => queryClient.clear(),
  });
}

/**
 * "Log out of all devices": the API ends every other session of the account.
 * This browser stays signed in, so nothing here is cleared.
 */
export function useLogoutAll() {
  return useMutation({ mutationFn: authApi.logoutAll });
}
