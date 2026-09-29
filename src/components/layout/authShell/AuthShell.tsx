import type { ReactNode } from "react";
import Link from "next/link";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import NightSky from "@/components/ui/nightSky/NightSky";
import Snowfall from "@/components/ui/snowfall/Snowfall";
import LanguageSwitcher from "@/components/ui/languageSwitcher/LanguageSwitcher";
import ThemeSwitcher from "@/components/ui/themeSwitcher/ThemeSwitcher";
import { getI18n } from "@/i18n/server";
import scss from "./authShell.module.scss";

interface AuthShellProps {
  /** Night-sky panel on the left: headline + a little product moment */
  aside: ReactNode;
  children: ReactNode;
}

/** Split screen for login / signup: magical night on the left, the form on the right. */
const AuthShell = async ({ aside, children }: AuthShellProps) => {
  const { m } = await getI18n();

  return (
    <div className={scss.shell}>
      <aside className={scss.aside} data-theme="dark">
        <NightSky variant="hero" />
        <Snowfall bokeh={false} />
        <div className={scss.asideContent}>
          <GiftBox size={96} glow sparkles className={scss.gift} />
          {aside}
        </div>
      </aside>

      <main className={scss.main}>
        <div className={scss.top}>
          <Link href="/" className={scss.logo}>
            <GiftBox size={28} />
            {m.common.logo}
          </Link>
          <div className={scss.controls}>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
        <div className={scss.formWrap}>{children}</div>
      </main>
    </div>
  );
};

export default AuthShell;
