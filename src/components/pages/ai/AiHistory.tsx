"use client";
import { PiNotePencilBold, PiSparkleFill, PiTreeEvergreenFill, PiXBold } from "react-icons/pi";
import { getErrorMessage } from "@/lib/api/client";
import type { AiConversation } from "@/lib/api/ai";
import { daysUntil } from "@/lib/events/format";
import { useAiConversations } from "@/lib/ai/useAi";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./ai.module.scss";

/** The sheet's close button — focused when the mobile sheet opens */
export const HISTORY_CLOSE_ID = "ai-history-close";

type Group = "today" | "yesterday" | "earlier";

/** Today · Yesterday · Earlier, newest first (the API already sorts by updatedAt) */
function groupOf(conversation: AiConversation): Group {
  const days = -daysUntil(new Date(conversation.updatedAt));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return "earlier";
}

interface AiHistoryProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  /** Mobile: closes the sheet */
  onClose: () => void;
}

/** My conversations, most recent first — only mine: the API filters by the signed-in user */
const AiHistory = ({ activeId, onSelect, onNew, onClose }: AiHistoryProps) => {
  const conversations = useAiConversations();
  const { m } = useI18n();
  const t = m.ai;
  const list = conversations.data ?? [];
  const groups = (["today", "yesterday", "earlier"] as const)
    .map((group) => ({ group, items: list.filter((conversation) => groupOf(conversation) === group) }))
    .filter(({ items }) => items.length > 0);
  const label: Record<Group, string> = { today: t.today, yesterday: t.yesterday, earlier: t.earlier };

  return (
    <aside className={scss.history} aria-label={t.historyLabel}>
      <span className={scss.sheetHandle} aria-hidden="true" />

      <header className={scss.historyHeader}>
        <h2 className={scss.historyTitle}>{t.recent}</h2>
        <button type="button" className={scss.iconButton} onClick={onNew} aria-label={t.newChat} title={t.newChat}>
          <PiNotePencilBold aria-hidden="true" />
        </button>
        <button
          id={HISTORY_CLOSE_ID}
          type="button"
          className={`${scss.iconButton} ${scss.sheetClose}`}
          onClick={onClose}
          aria-label={t.closeHistory}
          title={t.closeHistory}
        >
          <PiXBold aria-hidden="true" />
        </button>
      </header>

      {conversations.isPending && (
        <div className={scss.historySkeleton} aria-busy="true" aria-label={t.loading}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} />
          ))}
        </div>
      )}

      {conversations.isError && (
        <div className={scss.historyNote} role="alert">
          <p>{getErrorMessage(conversations.error, m, t.listError)}</p>
          <button type="button" className="btn btn-outline" onClick={() => conversations.refetch()}>
            {m.common.tryAgain}
          </button>
        </div>
      )}

      {conversations.isSuccess && list.length === 0 && <p className={scss.historyNote}>{t.historyEmpty}</p>}

      {groups.map(({ group, items }) => (
        <section key={group} className={scss.historyGroup} aria-label={label[group]}>
          <h3 className={scss.historyGroupTitle}>{label[group]}</h3>
          <ul className={scss.historyList}>
            {items.map((conversation) => {
              const active = conversation.id === activeId;
              const Icon = conversation.eventId ? PiTreeEvergreenFill : PiSparkleFill;
              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    className={`${scss.historyItem} ${active ? scss.historyActive : ""}`}
                    aria-current={active ? "true" : undefined}
                    onClick={() => onSelect(conversation.id)}
                  >
                    <span className={scss.historyItemIcon} aria-hidden="true">
                      <Icon />
                    </span>
                    <span className={scss.historyItemText}>
                      <span className={scss.historyItemTitle}>{conversation.title ?? t.untitled}</span>
                      <span className={scss.historyItemMeta}>{conversation.eventName ?? t.general}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </aside>
  );
};

export default AiHistory;
