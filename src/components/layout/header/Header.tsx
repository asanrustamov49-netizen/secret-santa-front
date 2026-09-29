"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import LanguageMenu from "@/components/ui/languageSwitcher/LanguageMenu";
import LanguageSwitcher from "@/components/ui/languageSwitcher/LanguageSwitcher";
import ThemeSwitcher from "@/components/ui/themeSwitcher/ThemeSwitcher";
import { useI18n } from "@/i18n/I18nProvider";
import { useSession, useSessionHint } from "@/lib/auth/useSession";
import scss from "./header.module.scss";

const NAV_LINKS = [
  { href: "#how-it-works", key: "howItWorks" },
  { href: "#features", key: "features" },
  { href: "#gift-ideas", key: "giftIdeas" },
  { href: "#about", key: "about" },
] as const;

const Header = () => {
  const { m, locale } = useI18n();
  const t = m.header;
  // Guests never hit /auth/me: only ask the API when the session-hint cookie exists
  const mightBeSignedIn = useSessionHint();
  const { data: user } = useSession({ enabled: mightBeSignedIn });
  const isSignedIn = mightBeSignedIn && Boolean(user);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Transparent over the hero, glass once the page moves
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu: lock page scroll, move focus inside, close on Escape.
  // Closing unlocks scroll and hands focus back to the menu button.
  useEffect(() => {
    if (!isMenuOpen) return;

    const trigger = menuButtonRef.current;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsMenuOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    menuRef.current?.querySelector<HTMLElement>("a[href]")?.focus();

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header
        // Longer languages need more room before the section links fit (see the SCSS)
        data-locale={locale}
        className={`${scss.header} ${isScrolled ? scss.scrolled : ""} ${
          isMenuOpen ? scss.menuOpen : ""
        }`}
        // Over the night hero the header is always "dark"; once scrolled it follows the theme
        data-theme={isScrolled || isMenuOpen ? undefined : "dark"}
      >
        <div className={scss.container}>
          {/* Logo */}
          <Link href="/" className={scss.logo} onClick={closeMenu}>
            <GiftBox size={34} className={scss.logoIcon} />
            <span className={scss.logoText}>{m.common.logo}</span>
          </Link>

          {/* Navigation */}
          <nav className={scss.navigation} aria-label={t.main}>
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className={scss.navLink}>
                {t[link.key]}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className={scss.actions}>
            {/* One compact button here — the header has no room for three segments */}
            <LanguageMenu className={scss.themeSwitcher} />
            <ThemeSwitcher className={scss.themeSwitcher} />

            {isSignedIn ? (
              <Link href="/dashboard" className={`btn btn-primary btn-glow ${scss.mySantaButton}`}>
                {t.dashboard}
              </Link>
            ) : (
              <>
                <Link href="/login" className={scss.dashboardLink}>
                  {t.logIn}
                </Link>
                <Link href="/signup" className={`btn btn-primary btn-glow ${scss.mySantaButton}`}>
                  {t.createShort}
                </Link>
              </>
            )}

            <button
              ref={menuButtonRef}
              type="button"
              className={scss.menuButton}
              aria-label={isMenuOpen ? m.nav.closeMenu : m.nav.openMenu}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — outside <header> so the header's backdrop-filter doesn't trap it */}
      <div ref={menuRef} id="mobile-menu" className={scss.mobileMenu} hidden={!isMenuOpen}>
        <nav className={scss.mobileNav} aria-label={t.mobile}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={scss.mobileLink} onClick={closeMenu}>
              {t[link.key]}
            </a>
          ))}
        </nav>

        <div className={scss.mobileActions}>
          <LanguageSwitcher variant="full" />
          <ThemeSwitcher variant="full" className={scss.mobileTheme} />
          {isSignedIn ? (
            <Link href="/dashboard" className="btn btn-primary btn-lg" onClick={closeMenu}>
              {t.dashboard}
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-glass btn-lg" onClick={closeMenu}>
                {t.logIn}
              </Link>
              <Link href="/signup" className="btn btn-primary btn-lg" onClick={closeMenu}>
                {t.create}
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
