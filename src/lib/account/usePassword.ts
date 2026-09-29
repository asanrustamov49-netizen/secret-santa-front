"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "@/lib/api/account";
import { sessionKey } from "@/lib/auth/useSession";

export function useChangePassword() {
  return useMutation({ mutationFn: accountApi.changePassword });
}

/** The API answers with the user (hasPassword: true), which becomes the session */
export function useSetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountApi.setPassword,
    onSuccess: (user) => queryClient.setQueryData(sessionKey, user),
  });
}
