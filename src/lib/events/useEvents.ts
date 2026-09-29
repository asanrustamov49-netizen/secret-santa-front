"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventsApi, type EventPayload } from "@/lib/api/events";

export const eventsKey = ["events"] as const;
export const eventKey = (id: string) => ["events", id] as const;
export const matchKey = (id: string) => ["events", id, "match"] as const;
export const myMatchesKey = ["matches"] as const;

export function useEvents() {
  // AppShell starts this fetch alongside /auth/me; the page underneath mounts a moment later.
  // A short staleTime lets that page reuse the fresh result instead of fetching it twice.
  // Our own changes still refresh it at once: mutations invalidate eventsKey explicitly.
  return useQuery({ queryKey: eventsKey, queryFn: eventsApi.list, staleTime: 10_000 });
}

export function useEventDetails(id: string) {
  return useQuery({ queryKey: eventKey(id), queryFn: () => eventsApi.details(id), retry: false });
}

export function useMyMatches() {
  return useQuery({ queryKey: myMatchesKey, queryFn: eventsApi.myMatches });
}

export function useMatch(id: string) {
  return useQuery({ queryKey: matchKey(id), queryFn: () => eventsApi.match(id), retry: false });
}

export function useInvite(code: string) {
  return useQuery({ queryKey: ["invite", code], queryFn: () => eventsApi.invite(code), retry: false });
}

/** Anything that changes an event: refresh the lists that show it */
function useEventMutation<TVars, TResult>(id: string, fn: (vars: TVars) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: eventKey(id) }),
        queryClient.invalidateQueries({ queryKey: eventsKey, exact: true }),
        queryClient.invalidateQueries({ queryKey: myMatchesKey }),
      ]),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventsKey, exact: true }),
  });
}

export const useUpdateEvent = (id: string) =>
  useEventMutation(id, (payload: EventPayload) => eventsApi.update(id, payload));
export const useRegenerateInvite = (id: string) => useEventMutation(id, () => eventsApi.regenerateInvite(id));
export const useRemoveParticipant = (id: string) =>
  useEventMutation(id, (participantId: string) => eventsApi.removeParticipant(id, participantId));
export const useDrawNames = (id: string) => useEventMutation(id, () => eventsApi.draw(id));
export const useCompleteEvent = (id: string) => useEventMutation(id, () => eventsApi.complete(id));

/** Leaving / deleting: the event is gone for me, drop it from every cache */
function useEventExit(id: string, fn: () => Promise<void>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: eventKey(id) });
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: eventsKey, exact: true }),
        queryClient.invalidateQueries({ queryKey: myMatchesKey }),
      ]);
    },
  });
}

export const useLeaveEvent = (id: string) => useEventExit(id, () => eventsApi.leave(id));
export const useDeleteEvent = (id: string) => useEventExit(id, () => eventsApi.remove(id));

export function useReveal(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => eventsApi.reveal(id),
    onSuccess: (result) => {
      queryClient.setQueryData(matchKey(id), result);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: eventsKey, exact: true }),
        queryClient.invalidateQueries({ queryKey: myMatchesKey }),
      ]);
    },
  });
}

export function useJoinEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventsApi.join,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventsKey, exact: true }),
  });
}
