"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { IconType } from "react-icons";
import {
  PiDevicesBold,
  PiEnvelopeSimple,
  PiPaletteFill,
  PiPencilSimpleBold,
  PiShieldCheckFill,
  PiSignOutBold,
  PiUserCircleFill,
} from "react-icons/pi";
import Avatar from "@/components/ui/avatar/Avatar";
import ConfirmButton from "@/components/ui/confirmButton/ConfirmButton";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import LanguageSwitcher from "@/components/ui/languageSwitcher/LanguageSwitcher";
import Snowfall from "@/components/ui/snowfall/Snowfall";
import ThemeSwitcher from "@/components/ui/themeSwitcher/ThemeSwitcher";
import { useI18n } from "@/i18n/I18nProvider";
import { getErrorMessage } from "@/lib/api/client";
import { useLogout, useLogoutAll, useSession } from "@/lib/auth/useSession";
import { toast } from "@/lib/toast";
import PasswordCard from "./PasswordCard";
import SettingRow from "./SettingRow";
import scss from "./settings.module.scss";

type SectionId = "account" | "appearance" | "security";

const SECTIONS: { id: SectionId; icon: IconType }[] = [
  { id: "account", icon: PiUserCircleFill },
  { id: "appearance", icon: PiPaletteFill },
  { id: "security", icon: PiShieldCheckFill },
];

interface SectionProps {
  id: SectionId;
  icon: IconType;
  title: string;
  text: string;
  index: number;
  children: ReactNode;
}

/** One group of settings: its name and purpose, then its rows */
const Section = ({ id, icon: Icon, title, text, index, children }: SectionProps) => (
  <section
    id={id}
    className={`surface-card ${scss.section}`}
    style={{ animationDelay: `${index * 70 + 80}ms` }}
    aria-labelledby={`${id}-title`}
  >
    <header className={scss.sectionHeader}>
      <span className={scss.sectionIcon} aria-hidden="true">
        <Icon />
      </span>
      <div>
        <h2 id={`${id}-title`} className={scss.sectionTitle}>
          {title}
        </h2>
        <p className={scss.sectionText}>{text}</p>
      </div>
    </header>
    <div className={scss.sectionBody}>{children}</div>
  </section>
);

/**
 * /settings — the account, not the person: what Secret Santa looks like for me and
 * how my account stays safe. Name, interests and wishlist live on /profile.
 * Only settings the app really has: no toggles for things that don't exist.
 */
const Settings = () => {
  const router = useRouter();
  const { data: user } = useSession();
  const logout = useLogout();
  const logoutAll = useLogoutAll();
  const { m } = useI18n();
  const t = m.settings;
  const [current, setCurrent] = useState<SectionId>("account");

  // The section in view lights up in the section list
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setCurrent(visible[0].target.id as SectionId);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    for (const { id } of SECTIONS) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [user]);

  if (!user) return null;

  const busy = logout.isPending || logoutAll.isPending;
  const titles: Record<SectionId, string> = {
    account: t.account.title,
    appearance: t.appearance.title,
    security: t.sections.security.title,
  };

  // Same as the sidebar's "Log out": the theme and language on this device are left alone
  const onLogout = () => logout.mutate(undefined, { onSettled: () => router.replace("/login") });

  // Every other session ends; this browser stays signed in
  const onLogoutAll = () =>
    logoutAll.mutate(undefined, {
      onSuccess: () => toast((m) => m.settings.sessions.allDone),
      onError: (error) => toast((m) => getErrorMessage(error, m), "error"),
    });

  return (
    <div className={scss.page}>
      <header className={scss.hero} data-theme="dark">
        <Snowfall bokeh={false} className={scss.heroSnow} />
        <div className={scss.heroCopy}>
          <h1 className={scss.title}>{t.title}</h1>
          <p className={scss.heroText}>{t.heroText}</p>
        </div>
        <GiftBox size={76} glow sparkles className={scss.heroGift} />
      </header>

      <div className={scss.layout}>
        <nav className={scss.sectionNav} aria-label={t.sectionsLabel}>
          <ul>
            {SECTIONS.map(({ id, icon: Icon }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={`${scss.sectionLink} ${current === id ? scss.sectionLinkActive : ""}`}
                  aria-current={current === id ? "true" : undefined}
                  onClick={() => setCurrent(id)}
                >
                  <Icon aria-hidden="true" />
                  <span>{titles[id]}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={scss.sections}>
          <Section id="account" icon={PiUserCircleFill} title={titles.account} text={t.sections.account} index={0}>
            <div className={scss.identity}>
              <Avatar name={user.name} src={user.avatarUrl} size={56} />
              <div className={scss.identityText}>
                <p className={scss.identityName}>{user.name}</p>
                <p className={scss.identityEmail}>
                  <PiEnvelopeSimple aria-hidden="true" />
                  <span className="visually-hidden">{t.account.email}: </span>
                  <span>{user.email}</span>
                </p>
              </div>
              <Link href="/profile" className={`btn btn-outline ${scss.rowButton}`}>
                <PiPencilSimpleBold aria-hidden="true" /> {m.dashboard.profile.edit}
              </Link>
            </div>
            <ul className={scss.notes}>
              <li>{t.profileText}</li>
              <li>{t.emailNote}</li>
            </ul>
          </Section>

          <Section id="appearance" icon={PiPaletteFill} title={titles.appearance} text={t.sections.appearance} index={1}>
            <SettingRow title={m.theme.label} text={t.themeText} wide>
              <ThemeSwitcher variant="full" className={scss.switcher} />
            </SettingRow>
            <SettingRow title={m.language.label} text={t.language.text} wide>
              <LanguageSwitcher variant="names" className={scss.switcher} />
            </SettingRow>
          </Section>

          <Section id="security" icon={PiShieldCheckFill} title={titles.security} text={t.sections.security.text} index={2}>
            <PasswordCard user={user} />

            <SettingRow title={t.sessions.logOut} text={t.sessions.logOutText}>
              <button type="button" className={`btn btn-outline ${scss.rowButton}`} onClick={onLogout} disabled={busy}>
                {logout.isPending ? <span className="spinner" aria-hidden="true" /> : <PiSignOutBold aria-hidden="true" />}
                {logout.isPending ? t.sessions.loggingOut : t.sessions.logOut}
              </button>
            </SettingRow>

            <SettingRow title={t.sessions.allTitle} text={t.sessions.allText}>
              <ConfirmButton
                className={`btn btn-outline ${scss.rowButton}`}
                confirmClassName={`btn btn-primary ${scss.rowButton}`}
                confirmLabel={t.sessions.allConfirm}
                disabled={busy}
                pending={logoutAll.isPending}
                pendingLabel={t.sessions.loggingOut}
                onConfirm={onLogoutAll}
              >
                <PiDevicesBold aria-hidden="true" /> {t.sessions.allButton}
              </ConfirmButton>
            </SettingRow>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
