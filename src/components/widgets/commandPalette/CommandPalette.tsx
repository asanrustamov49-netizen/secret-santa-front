"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  PiArrowElbowDownLeftBold,
  PiCheckBold,
  PiCompass,
  PiDesktop,
  PiGift,
  PiHeart,
  PiLink,
  PiMagnifyingGlass,
  PiMoonStars,
  PiPlus,
  PiSparkle,
  PiSun,
  PiTreeEvergreen,
} from "react-icons/pi";
import Flag from "@/components/ui/languageSwitcher/Flag";
import Modal from "@/components/ui/modal/Modal";
import { NAV, isActiveIn, navHref } from "@/components/layout/appShell/nav";
import { LOCALES } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { useEvents } from "@/lib/events/useEvents";
import { daysUntil, formatDay } from "@/lib/events/format";
import { openGuide } from "@/lib/onboarding/onboarding";
import type { ThemePreference } from "@/lib/theme/theme";
import { useTheme } from "@/lib/theme/useTheme";
import { closeCommandPalette, toggleCommandPalette, useCommandPalette } from "@/lib/ui/commandPalette";
import { rank, type Searchable } from "@/lib/ui/commandSearch";
import { NAV_FORWARD } from "@/lib/ui/pageTransition";
import scss from "./commandPalette.module.scss";

type GroupKey = "pages" | "events" | "actions" | "prefs" | "ai";
const GROUP_ORDER: GroupKey[] = ["pages", "events", "actions", "prefs", "ai"];

interface Command extends Searchable {
  id: string;
  group: GroupKey;
  icon: ReactNode;
  meta?: string;
  /** The page you're on, the theme or language in use */
  current?: boolean;
  run: () => void;
}

/** With an empty query, the few events worth jumping to: upcoming first */
const EVENTS_WHEN_IDLE = 4;
/** Staggered entrance for the first rows only — longer lists shouldn't wait */
const STAGGERED_ROWS = 10;

const THEMES: { value: ThemePreference; icon: ReactNode }[] = [
  { value: "light", icon: <PiSun /> },
  { value: "dark", icon: <PiMoonStars /> },
  { value: "system", icon: <PiDesktop /> },
];

/**
 * Ctrl/⌘ K anywhere in the app: jump to a page or one of your events, run an action
 * (new event, join, the tour), switch theme or language — or hand the question to the
 * AI assistant. In the app's Modal (focus stays inside, Esc closes, the page behind is
 * inert). The body remounts on every opening, so each search starts fresh.
 */
const CommandPalette = () => {
  const { open, session, instant } = useCommandPalette();
  const { m } = useI18n();

  // The shortcut — by key position, so it also works on a Cyrillic layout (where K is "Л")
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.code === "KeyK" && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        toggleCommandPalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Modal
      open={open}
      onClose={closeCommandPalette}
      label={m.command.dialogLabel}
      className={scss.dialog}
      instant={instant}
      initialFocus="input"
    >
      <PaletteBody key={session} />
    </Modal>
  );
};

const PaletteBody = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { m, locale, setLocale } = useI18n();
  const t = m.command;
  const events = useEvents();
  const { preference, setPreference } = useTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const placedRef = useRef(false);

  const go = (href: string, forward = false) => () => {
    closeCommandPalette({ instant: true });
    if (href !== pathname) router.push(href, forward ? { transitionTypes: NAV_FORWARD } : undefined);
  };
  const act = (run: () => void, instant = false) => () => {
    closeCommandPalette({ instant });
    run();
  };

  const pages: Command[] = NAV.map(({ href, key, icon: Icon }) => ({
    id: `page-${key}`,
    group: "pages",
    label: m.nav[key],
    keywords: `${m.nav.short[key]} ${t.keywords[key]}`,
    icon: <Icon />,
    current: isActiveIn(pathname, href),
    run: go(navHref(href, pathname)),
  }));

  const allEvents = (events.data ?? []).map((event) => {
    const waitingForMe = event.status === "drawn" && !event.revealed;
    const href = waitingForMe ? `/events/${event.id}/santa` : `/events/${event.id}`;
    const meta = [m.events.status[event.status], event.eventDate && formatDay(event.eventDate, locale)]
      .filter(Boolean)
      .join(" · ");
    return {
      command: {
        id: `event-${event.id}`,
        group: "events",
        label: event.name,
        keywords: event.ownerName,
        meta,
        icon: waitingForMe ? <PiGift /> : <PiTreeEvergreen />,
        current: pathname === href,
        run: go(href, true),
      } satisfies Command,
      // Idle list: the active ones, nearest gift day first
      upcoming: event.status !== "completed",
      days: event.eventDate ? daysUntil(event.eventDate) : Number.POSITIVE_INFINITY,
    };
  });
  const idleEvents = allEvents
    .filter((entry) => entry.upcoming)
    .sort((a, b) => (a.days < 0 ? 1e9 : a.days) - (b.days < 0 ? 1e9 : b.days))
    .slice(0, EVENTS_WHEN_IDLE);

  const actions: Command[] = [
    { id: "create", group: "actions", label: t.createEvent, keywords: t.keywords.createEvent, icon: <PiPlus />, run: go("/events/new", true) },
    { id: "join", group: "actions", label: t.joinEvent, keywords: t.keywords.joinEvent, icon: <PiLink />, run: go("/join") },
    { id: "wish", group: "actions", label: t.addWish, keywords: t.keywords.addWish, icon: <PiHeart />, run: go("/profile#wishlist-title") },
    { id: "tour", group: "actions", label: t.tour, keywords: t.keywords.tour, icon: <PiCompass />, run: act(openGuide, true) },
  ];

  const prefs: Command[] = [
    ...THEMES.map(({ value, icon }) => ({
      id: `theme-${value}`,
      group: "prefs" as const,
      label: t.themeItem(m.theme[value]),
      keywords: t.keywords.theme,
      icon,
      current: preference === value,
      run: act(() => setPreference(value)),
    })),
    ...LOCALES.map((code) => ({
      id: `lang-${code}`,
      group: "prefs" as const,
      label: t.languageItem(m.language.names[code]),
      keywords: `${t.keywords.language} ${code}`,
      icon: <Flag locale={code} className={scss.flag} />,
      current: locale === code,
      run: act(() => code !== locale && setLocale(code)),
    })),
  ];

  const trimmed = query.trim();
  const searchable = [...pages, ...(trimmed ? allEvents.map((e) => e.command) : idleEvents.map((e) => e.command)), ...actions, ...prefs];
  const ranked = rank(searchable, trimmed);

  // Groups appear in the order of their best match (fixed order while idle)
  const order = trimmed ? [...new Set(ranked.map((r) => r.item.group))] : GROUP_ORDER;
  const results = order.flatMap((group) => ranked.filter((r) => r.item.group === group));
  if (trimmed) {
    results.push({
      item: {
        id: "ask-ai",
        group: "ai",
        label: t.askAi(trimmed),
        meta: t.askAiMeta,
        icon: <PiSparkle />,
        run: go(`/ai?ask=${encodeURIComponent(trimmed)}`),
      },
      match: null,
    });
  }
  const groups = GROUP_ORDER.filter((g) => results.some((r) => r.item.group === g)).sort(
    (a, b) => results.findIndex((r) => r.item.group === a) - results.findIndex((r) => r.item.group === b),
  );
  const activeIndex = Math.min(active, results.length - 1);
  const activeId = results[activeIndex] ? `${listId}-${results[activeIndex].item.id}` : undefined;

  // The highlight glides to the active row (and the row scrolls into view)
  useLayoutEffect(() => {
    const indicator = indicatorRef.current;
    const row = activeId ? document.getElementById(activeId) : null;
    if (!indicator) return;
    if (!row) {
      indicator.style.opacity = "0";
      return;
    }
    // First placement after opening: appear in place, don't slide in from the top
    indicator.style.transition = placedRef.current ? "" : "none";
    indicator.style.opacity = "1";
    indicator.style.transform = `translateY(${row.offsetTop}px)`;
    indicator.style.height = `${row.offsetHeight}px`;
    placedRef.current = true;
    row.scrollIntoView({ block: "nearest" });
  }, [activeId, trimmed]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const count = results.length;
    if (!count) return;
    const moves: Record<string, number> = {
      ArrowDown: (activeIndex + 1) % count,
      ArrowUp: (activeIndex - 1 + count) % count,
      Home: 0,
      End: count - 1,
      PageDown: Math.min(activeIndex + 5, count - 1),
      PageUp: Math.max(activeIndex - 5, 0),
    };
    if (event.key in moves) {
      // Home/End move in the list only while the query is empty; otherwise they edit the text
      if ((event.key === "Home" || event.key === "End") && trimmed) return;
      event.preventDefault();
      setActive(moves[event.key]);
    } else if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      results[activeIndex]?.item.run();
    }
  };

  return (
    <div className={scss.panel}>
      <div className={scss.search}>
        <PiMagnifyingGlass className={scss.searchIcon} aria-hidden="true" />
        <input
          className={scss.input}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          aria-label={t.dialogLabel}
          placeholder={t.placeholder}
          value={query}
          maxLength={200}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="go"
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
        />
        <button type="button" className={scss.esc} onClick={() => closeCommandPalette()} aria-label={t.close}>
          Esc
        </button>
      </div>

      {/* The scroller (rows measure their offsets from it); the listbox itself sits inside */}
      <div className={scss.results}>
        <span ref={indicatorRef} className={scss.indicator} aria-hidden="true" />

        {/* Nothing in the app matches: say so, and keep the AI as the way forward below */}
        {trimmed && ranked.length === 0 && (
          <div className={scss.empty}>
            <PiGift className={scss.emptyIcon} aria-hidden="true" />
            <p className={scss.emptyTitle}>{t.empty}</p>
            <p className={scss.emptyText}>{t.emptyHint}</p>
          </div>
        )}

        <div id={listId} role="listbox" aria-label={t.dialogLabel}>
          {groups.map((group) => (
            <div key={group} role="group" aria-labelledby={`${listId}-${group}`} className={scss.group}>
              <p id={`${listId}-${group}`} className={scss.groupLabel} role="presentation">
                {t.groups[group]}
              </p>
              {results
                .filter((r) => r.item.group === group)
                .map(({ item, match }) => {
                  const index = results.findIndex((r) => r.item.id === item.id);
                  const isActive = index === activeIndex;
                  return (
                    <div
                      key={item.id}
                      id={`${listId}-${item.id}`}
                      role="option"
                      aria-selected={isActive}
                      aria-current={item.current ? (item.group === "pages" ? "page" : "true") : undefined}
                      className={`${scss.option} ${isActive ? scss.optionActive : ""} ${item.group === "ai" ? scss.optionAi : ""}`}
                      style={index < STAGGERED_ROWS ? { animationDelay: `${index * 16}ms` } : undefined}
                      onPointerMove={() => !isActive && setActive(index)}
                      onClick={item.run}
                    >
                      <span className={scss.icon} aria-hidden="true">
                        {item.icon}
                      </span>
                      <span className={scss.text}>
                        <span className={scss.label}>
                          {match ? (
                            <>
                              {item.label.slice(0, match.start)}
                              <mark className={scss.mark}>{item.label.slice(match.start, match.end)}</mark>
                              {item.label.slice(match.end)}
                            </>
                          ) : (
                            item.label
                          )}
                        </span>
                        {item.meta && <span className={scss.meta}>{item.meta}</span>}
                      </span>
                      {item.current &&
                        (item.group === "prefs" ? (
                          <PiCheckBold className={scss.check} aria-hidden="true" />
                        ) : (
                          <span className={scss.here}>{t.here}</span>
                        ))}
                      <PiArrowElbowDownLeftBold className={scss.enter} aria-hidden="true" />
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      <footer className={scss.footer}>
        <span role="status" className="visually-hidden">
          {t.resultCount(results.length)}
        </span>
        <span className={scss.hint}>
          <kbd className={scss.kbd}>↑</kbd>
          <kbd className={scss.kbd}>↓</kbd>
          {t.navigate}
        </span>
        <span className={scss.hint}>
          <kbd className={scss.kbd}>Enter</kbd>
          {t.select}
        </span>
        <span className={scss.hint}>
          <kbd className={scss.kbd}>Esc</kbd>
          {t.close}
        </span>
      </footer>
    </div>
  );
};

export default CommandPalette;
