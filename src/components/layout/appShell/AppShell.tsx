"use client";
import { useEffect, useRef, useState, ViewTransition, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PiList, PiMagnifyingGlass, PiSidebarSimple, PiSignOut, PiX } from "react-icons/pi";
import Avatar from "@/components/ui/avatar/Avatar";
import BrandLoader from "@/components/ui/brandLoader/BrandLoader";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import WinterBackdrop from "@/components/ui/winterBackdrop/WinterBackdrop";
import LanguageSwitcher from "@/components/ui/languageSwitcher/LanguageSwitcher";
import ThemeSwitcher from "@/components/ui/themeSwitcher/ThemeSwitcher";
import { useI18n } from "@/i18n/I18nProvider";
import { useLogout, useSession } from "@/lib/auth/useSession";
import { useEvents } from "@/lib/events/useEvents";
import { aiPageOf, eventIdOf } from "@/lib/ai/pages";
import { openCommandPalette, useModifierKey } from "@/lib/ui/commandPalette";
import CommandPalette from "@/components/widgets/commandPalette/CommandPalette";
import { GROUPS, NAV, NAV_MOTION, isActiveIn, navHref } from "./nav";
import MiniAssistant from "@/components/widgets/miniAssistant/MiniAssistant";
import RealtimeProvider from "@/lib/realtime/RealtimeProvider";
import ChatNotices from "@/components/ui/chatNotices/ChatNotices";
import { totalUnread, useSantaChats } from "@/lib/santaChat/useSantaChat";
import { totalChatUnread, useChatUnread } from "@/lib/chat/useEventChat";
import { useMediaQuery } from "@/lib/ui/useMediaQuery";
import { useSidebarCollapsed } from "@/lib/ui/useSidebarCollapsed";
import scss from "./appShell.module.scss";

/**
 * The "you are here" highlight. Only the active item renders it, under one name: when the
 * page changes, React pairs the old and the new one and the browser glides it across.
 */
const ActivePill = ({ name, className }: { name: string; className: string }) => (
  <ViewTransition name={name} share="nav-pill" default="none">
    <span className={className} aria-hidden="true" />
  </ViewTransition>
);

const AppShell = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();
  const logout = useLogout();
  const events = useEvents();
  const { m } = useI18n();
  const mod = useModifierKey();
  // Drawn but not opened yet — worth a badge in the menu
  const unopened =
    events.data?.filter((e) => e.status === "drawn" && !e.revealed).length ?? 0;
  // Unread Secret Santa chat messages, either side — the same badge, kept live by the socket
  const santaUnread = totalUnread(useSantaChats().data);
  // Unread event chat messages — on My Events (a REST count, raised live by the socket)
  const chatUnread = totalChatUnread(useChatUnread().data);
  const badges: Partial<Record<string, { count: number; label: string }>> = {};
  if (unopened + santaUnread > 0) {
    badges["/my-santa"] = {
      count: unopened + santaUnread,
      label: [
        unopened > 0 ? m.nav.toOpen(unopened) : null,
        santaUnread > 0 ? m.santaChat.unreadMessages(santaUnread) : null,
      ]
        .filter(Boolean)
        .join(", "),
    };
  }
  if (chatUnread > 0) {
    badges["/events"] = { count: chatUnread, label: m.notices.unreadInChats(chatUnread) };
  }
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // The sidebar is an off-canvas drawer only below this width; on desktop it's always visible
  const isMobile = useMediaQuery("(max-width: 960px)");
  const menuOpen = isMobile && isMenuOpen;
  // Desktop only: icons with tooltips. The drawer on phones is always full width
  const [collapsedPref, toggleCollapsed] = useSidebarCollapsed();
  const collapsed = collapsedPref && !isMobile;
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  const user = session.data;
  // The small assistant lives on every app page except the full one
  const aiPage = aiPageOf(pathname);
  const showMiniAi = aiPage !== "ai";

  // Open drawer: lock page scroll, move focus inside, close on Escape.
  // Closing restores scroll and hands focus back to the menu button.
  useEffect(() => {
    if (!menuOpen) return;

    const trigger = menuButtonRef.current;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setIsMenuOpen(false);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    sidebarRef.current
      ?.querySelector<HTMLElement>("a[href], button:not(:disabled)")
      ?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [menuOpen]);

  // Session ended (refresh failed) → back to login, then return here
  useEffect(() => {
    if (user === null)
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [user, pathname, router]);

  const onLogout = () =>
    logout.mutate(undefined, { onSettled: () => router.replace("/login") });

  if (session.isError) {
    return (
      <div className={scss.state}>
        <p>{m.nav.accountError}</p>
        <div className={scss.stateActions}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => session.refetch()}
          >
            {m.common.tryAgain}
          </button>
          {/* Escape hatch: drop the session hint so /login stops redirecting here */}
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              document.cookie = "has_session=; path=/; max-age=0";
              router.replace("/login");
            }}
          >
            {m.nav.logInAgain}
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={scss.state} aria-busy="true">
        <WinterBackdrop />
        <BrandLoader variant="page" label={m.loader.app} />
      </div>
    );
  }

  return (
    // Live updates for everything below: one Socket.IO connection per tab
    <RealtimeProvider userId={user.id}>
      <div className={`${scss.shell} ${collapsed ? scss.collapsed : ""}`}>
        <WinterBackdrop />

        {/* Mobile top bar */}
        <header className={scss.topbar}>
          {/* Covered by the open drawer — only the close button stays reachable */}
          <Link href="/dashboard" className={scss.logo} inert={menuOpen}>
            <GiftBox size={28} />
            {m.common.logo}
          </Link>
          <div className={scss.topbarActions}>
          <button
            type="button"
            className={scss.menuButton}
            onClick={openCommandPalette}
            aria-label={m.command.open}
            inert={menuOpen}
          >
            <PiMagnifyingGlass aria-hidden="true" />
          </button>
          <button
            ref={menuButtonRef}
            type="button"
            className={scss.menuButton}
            aria-label={menuOpen ? m.nav.closeMenu : m.nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="app-sidebar"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {menuOpen ? <PiX /> : <PiList />}
          </button>
          </div>
        </header>

        {menuOpen && (
          <div
            className={scss.overlay}
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Closed drawer sits off-screen: inert keeps it out of the Tab order and the a11y tree.
          Always "night": the same midnight surface as the /ai stage, in both themes */}
        <aside
          ref={sidebarRef}
          id="app-sidebar"
          data-theme="dark"
          className={`${scss.sidebar} ${menuOpen ? scss.open : ""}`}
          inert={isMobile && !menuOpen}
        >
          <div className={scss.brand}>
            <Link
              href="/"
              className={`${scss.logo} ${scss.sidebarLogo}`}
              aria-label={m.common.logo}
            >
              <GiftBox size={30} />
              <span className={scss.logoText}>{m.common.logo}</span>
            </Link>
            <button
              type="button"
              className={scss.collapseButton}
              onClick={toggleCollapsed}
              aria-label={collapsed ? m.nav.expand : m.nav.collapse}
              aria-controls="app-sidebar"
              aria-expanded={!collapsed}
            >
              <PiSidebarSimple aria-hidden="true" />
              <span className={scss.tooltip} aria-hidden="true">
                {collapsed ? m.nav.expand : m.nav.collapse}
              </span>
            </button>
          </div>

          {/* Ctrl/⌘ K anywhere does the same */}
          <button
            type="button"
            className={`${scss.navItem} ${scss.searchButton}`}
            onClick={() => {
              setIsMenuOpen(false);
              openCommandPalette();
            }}
            aria-keyshortcuts="Control+K Meta+K"
          >
            <span className={scss.navIcon} aria-hidden="true">
              <PiMagnifyingGlass />
            </span>
            <span className={scss.label}>{m.command.open}</span>
            <kbd className={scss.searchKbd} aria-hidden="true">
              {mod} K
            </kbd>
          </button>

          <nav className={scss.nav} aria-label={m.nav.app}>
            {GROUPS.map((group) => (
              <div
                key={group}
                role="group"
                aria-labelledby={`nav-${group}`}
                className={scss.navGroup}
              >
                <span id={`nav-${group}`} className={scss.groupLabel}>
                  {m.nav.groups[group]}
                </span>
                {NAV.filter((item) => item.group === group).map(
                  ({ href, key, icon: Icon }) => {
                    const isActive = isActiveIn(pathname, href);
                    const badge = badges[href];
                    return (
                      <Link
                        key={href}
                        href={navHref(href, pathname)}
                        className={`${scss.navItem} ${isActive ? scss.active : ""} ${key === "ai" ? scss.accent : ""}`}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {isActive && <ActivePill name="nav-active" className={scss.activePill} />}
                        <span className={scss.navIcon} aria-hidden="true">
                          {key === "profile" ? (
                            <Avatar
                              name={user.name}
                              src={user.avatarUrl}
                              size={24}
                            />
                          ) : (
                            <Icon className={NAV_MOTION[key]} />
                          )}
                          {badge && (
                            <span className={scss.dot} />
                          )}
                        </span>
                        <span className={scss.label}>{m.nav[key]}</span>
                        {badge && (
                          <span
                            className={`${scss.badge} icon-pop`}
                            aria-label={badge.label}
                          >
                            {badge.count}
                          </span>
                        )}
                      </Link>
                    );
                  },
                )}
              </div>
            ))}
          </nav>

          <div className={scss.sidebarFooter}>
            {/* Quick switches — the same ones live in Settings */}
            <div className={scss.prefs}>
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>

            <button
              type="button"
              className={scss.logout}
              onClick={onLogout}
              disabled={logout.isPending}
            >
              <span className={scss.navIcon} aria-hidden="true">
                {logout.isPending ? (
                  <span className="spinner" />
                ) : (
                  <PiSignOut />
                )}
              </span>
              <span className={scss.label}>
                {logout.isPending ? m.nav.loggingOut : m.nav.logOut}
              </span>
            </button>
          </div>
        </aside>

        {/* While the drawer is open, the page behind it is out of reach */}
        <main className={scss.main} inert={menuOpen}>
          {children}
        </main>

        {/* New messages (Secret Santa chat, event chats) — on every page but that chat itself */}
        <div inert={menuOpen}>
          <ChatNotices />
        </div>

        {showMiniAi && (
          <div inert={menuOpen}>
            <MiniAssistant userId={user.id} page={aiPage} eventId={eventIdOf(pathname)} />
          </div>
        )}

        <nav className={scss.tabbar} aria-label={m.nav.app} inert={menuOpen}>
          {NAV.map(({ href, key, icon: Icon }) => {
            const active = isActiveIn(pathname, href);
            const badge = badges[href];
            return (
              <Link
                key={href}
                href={navHref(href, pathname)}
                className={`${scss.tab} ${active ? scss.tabActive : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className={scss.tabIcon}>
                  {active && <ActivePill name="tab-active" className={scss.tabPill} />}
                  <Icon className={NAV_MOTION[key]} aria-hidden="true" />
                  {badge && (
                    <span
                      className={`${scss.tabBadge} icon-pop`}
                      aria-label={badge.label}
                    >
                      {badge.count}
                    </span>
                  )}
                </span>
                {m.nav.short[key]}
              </Link>
            );
          })}
        </nav>
      </div>

      <CommandPalette />
    </RealtimeProvider>
  );
};

export default AppShell;
