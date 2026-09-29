import type { CSSProperties } from "react";
import { PiConfetti, PiHeadphones, PiSparkleFill, PiTShirt, PiTreeEvergreen } from "react-icons/pi";
import { GiChocolateBar } from "react-icons/gi";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import { getI18n } from "@/i18n/server";
import scss from "./hero.module.scss";

// Demo data — shows the product moment, not a real match
const WISHLIST = [
  { icon: PiHeadphones, key: "headphones", tone: "snow" },
  { icon: PiTShirt, key: "hoodie", tone: "green" },
  { icon: GiChocolateBar, key: "chocolate", tone: "crimson" },
] as const;

const FRIENDS = [
  { initial: "A", tone: "blue" },
  { initial: "A", tone: "purple" },
  { initial: "M", tone: "crimson" },
  { initial: "D", tone: "red" },
  { initial: "T", tone: "amber" },
] as const;

const HeroMatchCard = async () => {
  const { m } = await getI18n();
  const t = m.landing.demo;

  return (
    <div className={scss.cardStage}>
      <article className={scss.card} aria-label={t.cardLabel}>
        <header className={scss.cardHeader}>
          <div>
            <p className={scss.eyebrow}>{t.event}</p>
            <p className={scss.cardTitle}>
              <PiTreeEvergreen className={scss.treeIcon} aria-hidden="true" />
              {t.matchReady}
            </p>
          </div>
          <span className={scss.cardGift}>
            <GiftBox size={30} />
          </span>
        </header>

        <div className={scss.youGot}>
          <span className={scss.youGotLabel}>{t.youGot}</span>
          <span className={scss.youGotName}>
            {t.name}
            <PiConfetti className={scss.confetti} aria-hidden="true" />
          </span>
        </div>

        <p className={scss.eyebrow}>{t.wishlist}</p>
        <ul className={scss.wishlist}>
          {WISHLIST.map(({ icon: Icon, key, tone }) => (
            <li key={key} className={scss.wish}>
              <Icon className={`${scss.wishIcon} ${scss[tone]}`} aria-hidden="true" />
              {t[key]}
            </li>
          ))}
        </ul>
      </article>

      {/* Floating chips */}
      <div className={`${scss.chip} ${scss.budgetChip}`}>
        <span className={scss.chipLabel}>{t.budget}</span>
        <span className={scss.chipValue}>{t.budgetValue}</span>
      </div>

      <div className={`${scss.chip} ${scss.friendsChip}`}>
        <span className={scss.avatars} aria-hidden="true">
          {FRIENDS.map((f, i) => (
            <span
              key={i}
              className={`${scss.avatar} ${scss[f.tone]}`}
              style={{ zIndex: FRIENDS.length - i } as CSSProperties}
            >
              {f.initial}
            </span>
          ))}
        </span>
        <span>
          <span className={scss.chipValue}>{t.friends}</span>
          <span className={scss.chipLabel}>
            {t.everyoneReady} <PiSparkleFill className={scss.chipSpark} aria-hidden="true" />
          </span>
        </span>
      </div>
    </div>
  );
};

export default HeroMatchCard;
