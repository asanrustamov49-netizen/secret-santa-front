import { api } from "./client";
import type { User } from "./auth";

export interface WishlistItem {
  id: string;
  title: string;
  /** Whole сом, or null when the user has no idea */
  priceApprox: number | null;
  url: string | null;
  position: number;
  createdAt: string;
}

export interface WishlistItemPayload {
  title: string;
  priceApprox: number | null;
  url: string | null;
}

export interface ProfilePayload {
  name?: string;
  interests?: string[];
}

// Limits mirror the API so the UI can stop before a request fails
export const MAX_INTERESTS = 20;
export const MAX_INTEREST_LENGTH = 30;
export const MAX_WISHLIST_ITEMS = 30;

export const profileApi = {
  update: (payload: ProfilePayload) =>
    api.patch<{ user: User }>("/profile", payload).then((r) => r.data.user),

  wishlist: () => api.get<{ items: WishlistItem[] }>("/profile/wishlist").then((r) => r.data.items),
  addItem: (payload: WishlistItemPayload) =>
    api.post<{ item: WishlistItem }>("/profile/wishlist", payload).then((r) => r.data.item),
  updateItem: (id: string, payload: WishlistItemPayload) =>
    api.put<{ item: WishlistItem }>(`/profile/wishlist/${id}`, payload).then((r) => r.data.item),
  removeItem: (id: string) => api.delete(`/profile/wishlist/${id}`).then(() => undefined),
};
