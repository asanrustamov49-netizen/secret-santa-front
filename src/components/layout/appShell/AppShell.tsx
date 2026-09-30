"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { IconType } from "react-icons";
import {
  PiGearSix,
  PiGift,
  PiHouse,
  PiList,
  PiSidebarSimple,
  PiSignOut,
  PiSparkle,
  PiTreeEvergreen,
  PiUserCircle,
  PiX,
} from "react-icons/pi";
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
import MiniAssistant from "@/components/widgets/miniAssistant/MiniAssistant";
import RealtimeProvider from "@/lib/realtime/RealtimeProvider";
import { useMediaQuery } from "@/lib/ui/useMediaQuery";
import { useSidebarCollapsed } from "@/lib/ui/useSidebarCollapsed";
import scss from "./appShell.module.scss";

interface NavItem {
  href: string;
  /** Its labels in m.nav (full) and m.nav.short (mobile tab bar) */
  key: "dashboard" | "myEvents" | "mySanta" | "ai" | "profile" | "settings";
  icon: IconType;
  /** Where it sits in the sidebar: the Secret Santa itself, or the user's account */
  group: "main" | "account";
}

// The order people think in: home, my gift, my events, help — then me
const NAV: NavItem[] = [
  { href: "/dashboard", key: "dashboard", icon: PiHouse, group: "main" },
  { href: "/my-santa", key: "mySanta", icon: PiGift, group: "main" },
  { href: "/events", key: "myEvents", icon: PiTreeEvergreen, group: "main" },
  { href: "/ai", key: "ai", icon: PiSparkle, group: "main" },
  { href: "/profile", key: "profile", icon: PiUserCircle, group: "account" },
  { href: "/settings", key: "settings", icon: PiGearSix, group: "account" },
];

const GROUPS = ["main", "account"] as const;

/** A little life where it means something: the assistant breathes, the gift shakes on hover */
const NAV_MOTION: Partial<Record<NavItem["key"], string>> = {
  ai: "icon-sparkle",
  mySanta: "icon-wiggle",
};

/** A section is active on its own page and every page under it (/events/new, /events/:id/santa…) */
const isActiveIn = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/** The assistant learns which page the user came from — as a page identifier, never the path */
function navHref(href: string, pathname: string) {
  if (href !== "/ai") return href;
  const from = aiPageOf(pathname);
  return from && from !== "ai" ? `/ai?from=${from}` : href;
}

const AppShell = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();
  const logout = useLogout();
  const events = useEvents();
  const { m } = useI18n();
  // Drawn but not opened yet — worth a badge in the menu
  const unopened =
    events.data?.filter((e) => e.status === "drawn" && !e.revealed).length ?? 0;
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
    <RealtimeProvider>
      <div className={`${scss.shell} ${collapsed ? scss.collapsed : ""}`}>
        <WinterBackdrop />

        {/* Mobile top bar */}
        <header className={scss.topbar}>
          {/* Covered by the open drawer — only the close button stays reachable */}
          <Link href="/dashboard" className={scss.logo} inert={menuOpen}>
            <GiftBox size={28} />
            {m.common.logo}
          </Link>
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
                    return (
                      <Link
                        key={href}
                        href={navHref(href, pathname)}
                        className={`${scss.navItem} ${isActive ? scss.active : ""} ${key === "ai" ? scss.accent : ""}`}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setIsMenuOpen(false)}
                      >
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
                          {href === "/my-santa" && unopened > 0 && (
                            <span className={scss.dot} />
                          )}
                        </span>
                        <span className={scss.label}>{m.nav[key]}</span>
                        {href === "/my-santa" && unopened > 0 && (
                          <span
                            className={`${scss.badge} icon-pop`}
                            aria-label={m.nav.toOpen(unopened)}
                          >
                            {unopened}
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

        {showMiniAi && (
          <div inert={menuOpen}>
            <MiniAssistant userId={user.id} page={aiPage} eventId={eventIdOf(pathname)} />
          </div>
        )}

        <nav className={scss.tabbar} aria-label={m.nav.app} inert={menuOpen}>
          {NAV.map(({ href, key, icon: Icon }) => {
            const active = isActiveIn(pathname, href);
            return (
              <Link
                key={href}
                href={navHref(href, pathname)}
                className={`${scss.tab} ${active ? scss.tabActive : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className={scss.tabIcon}>
                  <Icon className={NAV_MOTION[key]} aria-hidden="true" />
                  {href === "/my-santa" && unopened > 0 && (
                    <span
                      className={`${scss.tabBadge} icon-pop`}
                      aria-label={m.nav.toOpen(unopened)}
                    >
                      {unopened}
                    </span>
                  )}
                </span>
                {m.nav.short[key]}
              </Link>
            );
          })}
        </nav>
      </div>
    </RealtimeProvider>
  );
};

export default AppShell;
