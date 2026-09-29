"use client";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aiApi, aiErrorMessage, type AiConversationDetails } from "@/lib/api/ai";
import type { AiPage } from "@/lib/ai/pages";
import { useI18n, useMessage } from "@/i18n/I18nProvider";

export const aiConversationsKey = ["ai", "conversations"] as const;
export const aiConversationKey = (id: string) => ["ai", "conversations", id] as const;

export function useAiConversations() {
  return useQuery({ queryKey: aiConversationsKey, queryFn: aiApi.conversations });
}

export function useAiConversation(id: string | null) {
  return useQuery({
    queryKey: aiConversationKey(id ?? ""),
    queryFn: () => aiApi.conversation(id!),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useCreateAiConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: aiApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: aiConversationsKey }),
  });
}

export function useDeleteAiConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: aiApi.remove,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: aiConversationKey(id) });
      return queryClient.invalidateQueries({ queryKey: aiConversationsKey });
    },
  });
}

/** The turn in flight: my message as sent, and the reply as it streams in */
export interface PendingTurn {
  conversationId: string;
  content: string;
  reply: string;
  /** sending = waiting for the first words; streaming = words arriving */
  status: "sending" | "streaming";
}

/**
 * Sending a message and streaming the reply. Saved messages come from the
 * conversation query; this only holds the turn in flight and its error.
 * `page`: the app page the user came from, so "what do I do here?" makes sense.
 */
export function useAiChat(page?: AiPage) {
  const queryClient = useQueryClient();
  const { locale } = useI18n();
  const [turn, setTurn] = useState<PendingTurn | null>(null);
  const [error, setError] = useMessage();
  const abortRef = useRef<AbortController | null>(null);

  // Leaving the page stops the reply (the server stops paying for it too)
  useEffect(() => () => abortRef.current?.abort(), []);

  /** Resolves false when the message didn't go through — the caller puts the text back */
  const send = async (conversationId: string, content: string): Promise<boolean> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setError(undefined);
    setTurn({ conversationId, content, reply: "", status: "sending" });

    try {
      for await (const event of aiApi.reply(conversationId, content, locale, page, controller.signal)) {
        if (event.type === "delta") {
          setTurn((current) => current && { ...current, reply: current.reply + event.text, status: "streaming" });
        } else {
          // Both messages are saved now: move them from "in flight" into the conversation
          // A refetch may already hold my message (it's saved before the reply starts): add only what's new
          queryClient.setQueryData<AiConversationDetails>(aiConversationKey(conversationId), (old) => {
            if (!old) return old;
            const known = new Set(old.messages.map((message) => message.id));
            const added = [event.userMessage, event.message].filter((message) => !known.has(message.id));
            return { ...old, messages: [...old.messages, ...added] };
          });
          void queryClient.invalidateQueries({ queryKey: aiConversationKey(conversationId) });
          void queryClient.invalidateQueries({ queryKey: aiConversationsKey });
        }
      }
      return true;
    } catch (failure) {
      if (!controller.signal.aborted) setError((m) => aiErrorMessage(failure, m));
      return false;
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setTurn((current) => (current?.conversationId === conversationId ? null : current));
    }
  };

  const stop = () => abortRef.current?.abort();

  return { turn, error, clearError: () => setError(undefined), send, stop };
}
