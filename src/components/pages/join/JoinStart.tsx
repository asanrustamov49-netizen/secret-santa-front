import Link from "next/link";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import NightSky from "@/components/ui/nightSky/NightSky";
import Snowfall from "@/components/ui/snowfall/Snowfall";
import JoinWithLink from "@/components/pages/events/JoinWithLink";
import LanguageSwitcher from "@/components/ui/languageSwitcher/LanguageSwitcher";
import { getI18n } from "@/i18n/server";
import scss from "./join.module.scss";

/** /join without a code — "Join a Secret Santa" from the landing page lands here */
const JoinStart = async () => {
  const { m } = await getI18n();
  const t = m.join.start;

  return (
    <main className={scss.page} data-theme="dark">
      <NightSky variant="hero" />
      <Snowfall />
      <Link href="/" className={scss.logo}>
        <GiftBox size={28} /> {m.common.logo}
      </Link>
      <LanguageSwitcher className={scss.language} />
      <div className={scss.card}>
        <GiftBox size={110} glow sparkles className={scss.gift} />
        <p className={scss.kicker}>{t.kicker}</p>
        <h1 className={scss.title}>{t.title}</h1>
        <p className={scss.text}>{t.text}</p>
        <JoinWithLink className={scss.joinForm} autoFocus />
        <p className={scss.private}>
          {t.noInvite} <Link href="/signup">{t.startOwn}</Link> {t.andInvite}
        </p>
      </div>
    </main>
  );
};

export default JoinStart;
