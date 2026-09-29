"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getErrorMessage } from "@/lib/api/client";
import { type AiPage, isAiPage } from "@/lib/ai/pages";
import { useAiChat, useCreateAiConversation } from "@/lib/ai/useAi";
import { useMessage } from "@/i18n/I18nProvider";
import AiChat from "./AiChat";
import AiHistory, { HISTORY_CLOSE_ID } from "./AiHistory";
import AiStart from "./AiStart";
import scss from "./ai.module.scss";

/**
 * /ai — the Secret Santa assistant. The open conversation lives in the URL (?c=<id>), so a
 * reload or a shared tab comes back to it. The chat state sits here, above both views,
 * so the first message keeps streaming while the page switches to the new conversation.
 * ?from=<page> — the app page the menu link was clicked on (see AppShell), kept for the visit.
 *
 * Desktop: history column | workspace. Mobile: the workspace alone; history is a bottom sheet.
 */
const AiAssistant = () => {
  const router = useRouter();
  const params = useSearchParams();
  const activeId = params.get("c");
  const [page] = useState<AiPage>(() => {
    const from = params.get("from");
    return isAiPage(from) ? from : "ai";
  });
  const chat = useAiChat(page);
  const create = useCreateAiConversation();
  const [startError, setStartError] = useMessage();
  const [historyOpen, setHistoryOpen] = useState(false);

  // Mobile sheet: Escape closes it, and focus moves into it when it opens
  useEffect(() => {
    if (!historyOpen) return;
    document.getElementById(HISTORY_CLOSE_ID)?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHistoryOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [historyOpen]);

  const open = (id: string | null) => {
    setHistoryOpen(false);
    chat.clearError();
    router.replace(id ? `/ai?c=${id}` : "/ai", { scroll: false });
  };

  const start = async (eventId: string | null, content: string) => {
    setStartError(undefined);
    let conversationId: string;
    try {
      conversationId = (await create.mutateAsync(eventId)).id;
    } catch (error) {
      setStartError((m) => getErrorMessage(error, m));
      return false;
    }
    open(conversationId);
    return chat.send(conversationId, content);
  };

  const openHistory = () => setHistoryOpen(true);

  return (
    <div className={scss.page}>
      {historyOpen && <div className={scss.sheetBackdrop} aria-hidden="true" onClick={() => setHistoryOpen(false)} />}

      <div id="ai-history" className={`${scss.historyColumn} ${historyOpen ? scss.historyOpen : ""}`}>
        <AiHistory activeId={activeId} onSelect={open} onNew={() => open(null)} onClose={() => setHistoryOpen(false)} />
      </div>

      <section className={scss.workspace}>
        {activeId ? (
          <AiChat
            key={activeId}
            id={activeId}
            chat={chat}
            onNew={() => open(null)}
            onOpenHistory={openHistory}
            historyOpen={historyOpen}
          />
        ) : (
          <AiStart
            page={page}
            onStart={start}
            busy={create.isPending || Boolean(chat.turn)}
            error={startError}
            onOpenHistory={openHistory}
            historyOpen={historyOpen}
          />
        )}
      </section>
    </div>
  );
};

export default AiAssistant;
