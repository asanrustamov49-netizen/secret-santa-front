"use client";
import { useEffect, useMemo, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { eventKey, eventsKey, matchKey, myMatchesKey, useEvents } from "@/lib/events/useEvents";
import {
  bumpChatUnread,
  chatKeyRoot,
  chatUnreadKey,
  clearChatUnread,
  mergeChatMessage,
} from "@/lib/chat/useEventChat";
import {
  clearUnread,
  mergeSantaChatMessage,
  santaChatEventKey,
  santaChatKeyRoot,
  santaChatsKey,
} from "@/lib/santaChat/useSantaChat";
import { targetsFor, type RealtimeTarget } from "./events";
import {
  clearNotices,
  dismissNotice,
  eventNoticeKey,
  noticeEventMessage,
  noticeSantaMessage,
  santaNoticeKey,
} from "./notices";
import {
  connectRealtime,
  disconnectRealtime,
  joinEventRoom,
  joinedEventIds,
  onRealtimeEvent,
  onChatMessage,
  onChatRead,
  onRealtimeReconnect,
  onSantaChatMessage,
  onSantaChatRead,
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
 * - new chat messages (event chats, the Secret Santa chat) raise unread badges and show a
 *   notice on whatever page is open — except the chat that is on screen
 */
export default function RealtimeProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const queryClient = useQueryClient();
  const events = useEvents();
  const myEventIds = useMemo(() => (events.data ?? []).map((event) => event.id).join(","), [events.data]);

  useEffect(() => {
    connectRealtime();
    return () => {
      disconnectRealtime();
      clearNotices();
    };
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
      // The Secret Santa chats of an event that finished or is gone for me
      if (name === "event:completed" || name === "event:deleted" || name === "event:removed") {
        void queryClient.invalidateQueries({ queryKey: santaChatEventKey(eventId) });
        void queryClient.invalidateQueries({ queryKey: santaChatsKey, exact: true });
        void queryClient.invalidateQueries({ queryKey: chatUnreadKey, exact: true });
        dismissNotice(eventNoticeKey(eventId));
      }
    });

    // A chat message goes straight into the cached chat (if that chat was ever opened here);
    // someone else's raises the unread badge (the open chat marks it read on the API)
    const stopChat = onChatMessage((message) => {
      mergeChatMessage(queryClient, message);
      if (message.author.id === userId) return;
      bumpChatUnread(queryClient, message.eventId);
      noticeEventMessage(message, userId);
    });
    // Read in another tab of mine
    const stopChatRead = onChatRead((eventId) => {
      clearChatUnread(queryClient, eventId);
      dismissNotice(eventNoticeKey(eventId));
    });

    // A Secret Santa chat message: into its cache, and a notice unless that chat is on screen
    const stopSanta = onSantaChatMessage((payload) => {
      mergeSantaChatMessage(queryClient, payload);
      noticeSantaMessage(payload);
    });
    // Read in another tab of mine: the badges and the notice go here too
    const stopSantaRead = onSantaChatRead(({ eventId, role }) => {
      clearUnread(queryClient, eventId, role);
      dismissNotice(santaNoticeKey(eventId, role));
    });

    const stopReconnect = onRealtimeReconnect(() => {
      // Chat messages missed while offline come back from the API
      void queryClient.invalidateQueries({ queryKey: chatKeyRoot });
      void queryClient.invalidateQueries({ queryKey: chatUnreadKey, exact: true });
      void queryClient.invalidateQueries({ queryKey: santaChatKeyRoot });
      void queryClient.invalidateQueries({ queryKey: santaChatsKey, exact: true });
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
      stopChatRead();
      stopSanta();
      stopSantaRead();
    };
  }, [queryClient, userId]);

  return children;
}
