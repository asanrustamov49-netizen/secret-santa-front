"use client";
import { useEffect, useMemo, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { eventKey, eventsKey, matchKey, myMatchesKey, useEvents } from "@/lib/events/useEvents";
import { chatKeyRoot, mergeChatMessage } from "@/lib/chat/useEventChat";
import { targetsFor, type RealtimeTarget } from "./events";
import {
  connectRealtime,
  disconnectRealtime,
  joinEventRoom,
  joinedEventIds,
  onRealtimeEvent,
  onChatMessage,
  onRealtimeReconnect,
} from "./socket";

/** The React Query cache entries a target stands for */
function keysFor(target: RealtimeTarget, eventId: string): readonly unknown[] {
  switch (target) {
    case "events":
      return eventsKey;
    case "event":
      return eventKey(eventId);
    case "match":
      return matchKey(eventId);
    case "myMatches":
      return myMatchesKey;
  }
}

/**
 * The signed-in app's single realtime connection (mounted once, in AppShell).
 * - listens to every event I'm in, so the dashboard, lists and My Secret Santa stay live
 * - turns each notification into targeted React Query invalidations — the data itself
 *   is refetched through the REST API, never taken from the socket
 * - after a reconnect, refetches everything it listens to (messages missed while
 *   offline are not replayed: the API is the source of truth)
 */
export default function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const events = useEvents();
  const myEventIds = useMemo(() => (events.data ?? []).map((event) => event.id).join(","), [events.data]);

  useEffect(() => {
    connectRealtime();
    return () => disconnectRealtime();
  }, []);

  // Every event of mine — the list refreshes on join/leave, and the rooms follow it
  useEffect(() => {
    if (!myEventIds) return;
    const leaves = myEventIds.split(",").map((id) => joinEventRoom(id));
    return () => leaves.forEach((leave) => leave());
  }, [myEventIds]);

  useEffect(() => {
    const stopEvents = onRealtimeEvent((name, eventId) => {
      for (const target of targetsFor(name)) {
        // exact: the event's own entry — its match is its own target
        void queryClient.invalidateQueries({ queryKey: keysFor(target, eventId), exact: true });
      }
    });

    // A chat message goes straight into the cached chat (if that chat was ever opened here)
    const stopChat = onChatMessage((message) => mergeChatMessage(queryClient, message));

    const stopReconnect = onRealtimeReconnect(() => {
      // Chat messages missed while offline come back from the API
      void queryClient.invalidateQueries({ queryKey: chatKeyRoot });
      void queryClient.invalidateQueries({ queryKey: eventsKey, exact: true });
      void queryClient.invalidateQueries({ queryKey: myMatchesKey, exact: true });
      for (const eventId of joinedEventIds()) {
        void queryClient.invalidateQueries({ queryKey: eventKey(eventId), exact: true });
        void queryClient.invalidateQueries({ queryKey: matchKey(eventId), exact: true });
      }
    });

    return () => {
      stopEvents();
      stopReconnect();
      stopChat();
    };
  }, [queryClient]);

  return children;
}
