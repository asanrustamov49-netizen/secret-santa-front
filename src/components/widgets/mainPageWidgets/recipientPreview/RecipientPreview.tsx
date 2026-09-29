import StartLink from "@/components/ui/startLink/StartLink";
import {
  PiCoffeeFill,
  PiGameControllerFill,
  PiGiftFill,
  PiHeadphones,
  PiSoccerBallFill,
  PiTShirt,
} from "react-icons/pi";
import { GiChocolateBar } from "react-icons/gi";
import Reveal from "@/components/ui/reveal/Reveal";
import SectionHeading from "@/components/ui/sectionHeading/SectionHeading";
import { getI18n } from "@/i18n/server";
import scss from "./recipientPreview.module.scss";

// Same order as likeItems / wishItems in m.landing.recipient
const LIKE_ICONS = [PiSoccerBallFill, PiGameControllerFill, PiCoffeeFill];
const WISH_ICONS = [PiHeadphones, PiTShirt, GiChocolateBar];

const RecipientPreview = async () => {
  const { m } = await getI18n();
  const t = m.landing.recipient;

  return (
    <section id="wishlists" className={`section ${scss.section}`} aria-labelledby="wishlists-title">
      <div className={`container ${scss.inner}`}>
        <div className={scss.copy}>
          <SectionHeading
            id="wishlists-title"
            align="left"
            eyebrow={t.eyebrow}
            title={
              <>
                {t.title1}
                <br />
                {t.title2}
              </>
            }
            subtitle={t.subtitle}
          />
          <Reveal delay={150}>
            <StartLink className={`btn btn-primary btn-lg btn-glow ${scss.cta}`}>
              <PiGiftFill aria-hidden="true" />
              {t.cta}
            </StartLink>
          </Reveal>
        </div>

        <Reveal delay={200} className={scss.stage}>
          <article className={scss.card} aria-label={t.cardLabel}>
            <header className={scss.profile}>
              <span className={scss.avatar} aria-hidden="true">
                A
              </span>
              <div>
                <p className={scss.name}>{t.name}</p>
                <p className={scss.role}>{t.role}</p>
              </div>
            </header>

            <p className={scss.label}>{t.likes}</p>
            <ul className={scss.likes}>
              {LIKE_ICONS.map((Icon, i) => (
                <li key={i} className={scss.like}>
                  <Icon aria-hidden="true" />
                  {t.likeItems[i]}
                </li>
              ))}
            </ul>

            <p className={scss.label}>{t.wishlist}</p>
            <ul className={scss.wishlist}>
              {t.wishItems.map(({ label, price }, i) => {
                const Icon = WISH_ICONS[i];
                return (
                  <li key={label} className={scss.wish}>
                    <Icon className={scss.wishIcon} aria-hidden="true" />
                    <span className={scss.wishLabel}>{label}</span>
                    <span className={scss.price}>{price}</span>
                  </li>
                );
              })}
            </ul>
          </article>
        </Reveal>
      </div>
    </section>
  );
};

export default RecipientPreview;
