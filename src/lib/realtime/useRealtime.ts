"use client";
import { useEffect, useSyncExternalStore } from "react";
import { getRealtimeStatus, joinEventRoom, subscribeRealtimeStatus } from "./socket";

/** Live updates for this event while the calling page is open */
export function useEventRealtime(eventId: string | null | undefined) {
  useEffect(() => {
    if (!eventId) return;
    return joinEventRoom(eventId);
  }, [eventId]);
}

/** Connected / reconnecting / offline — for the small indicator */
export function useRealtimeStatus() {
  return useSyncExternalStore(subscribeRealtimeStatus, getRealtimeStatus, () => "idle" as const);
}
