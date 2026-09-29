"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi, type ProfilePayload, type WishlistItem, type WishlistItemPayload } from "@/lib/api/profile";
import { sessionKey } from "@/lib/auth/useSession";

export const wishlistKey = ["wishlist"] as const;

/** Name / interests. The API returns the updated user, which becomes the session. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProfilePayload) => profileApi.update(payload),
    onSuccess: (user) => queryClient.setQueryData(sessionKey, user),
  });
}

export function useWishlist() {
  return useQuery({ queryKey: wishlistKey, queryFn: profileApi.wishlist });
}

const setItems = (queryClient: ReturnType<typeof useQueryClient>, update: (items: WishlistItem[]) => WishlistItem[]) =>
  queryClient.setQueryData<WishlistItem[]>(wishlistKey, (items = []) => update(items));

export function useAddWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WishlistItemPayload) => profileApi.addItem(payload),
    onSuccess: (item) => setItems(queryClient, (items) => [...items, item]),
  });
}

export function useUpdateWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: WishlistItemPayload & { id: string }) => profileApi.updateItem(id, payload),
    onSuccess: (item) => setItems(queryClient, (items) => items.map((it) => (it.id === item.id ? item : it))),
  });
}

/** Optimistic: the gift disappears at once and comes back if the API says no */
export function useRemoveWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => profileApi.removeItem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: wishlistKey });
      const previous = queryClient.getQueryData<WishlistItem[]>(wishlistKey);
      setItems(queryClient, (items) => items.filter((it) => it.id !== id));
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(wishlistKey, context.previous);
    },
  });
}
