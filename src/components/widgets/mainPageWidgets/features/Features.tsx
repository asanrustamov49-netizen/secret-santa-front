import {
  PiGameControllerFill,
  PiHeadphones,
  PiHeartFill,
  PiLockSimpleFill,
  PiSoccerBallFill,
  PiSparkleFill,
  PiTShirt,
  PiTreeEvergreenFill,
} from "react-icons/pi";
import { GiChocolateBar } from "react-icons/gi";
import AvatarStack, { type AvatarTone } from "@/components/ui/avatarStack/AvatarStack";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import Reveal from "@/components/ui/reveal/Reveal";
import SectionHeading from "@/components/ui/sectionHeading/SectionHeading";
import { getI18n } from "@/i18n/server";
import scss from "./features.module.scss";

const PARTICIPANTS: { initial: string; tone: AvatarTone }[] = [
  { initial: "A", tone: "blue" },
  { initial: "A", tone: "purple" },
  { initial: "M", tone: "crimson" },
  { initial: "D", tone: "red" },
  { initial: "T", tone: "amber" },
  { initial: "Z", tone: "teal" },
  { initial: "I", tone: "green" },
];

// Same order as m.landing.features.wishes
const WISH_ICONS = [PiHeadphones, PiTShirt, GiChocolateBar, PiSoccerBallFill, PiGameControllerFill];

const Features = async () => {
  const { m } = await getI18n();
  const t = m.landing.features;

  return (
    <section id="features" className={`section ${scss.section}`} aria-labelledby="features-title">
      <div className="container">
        <SectionHeading
          id="features-title"
          title={
            <>
              {t.title1}
              <br />
              {t.title2}
            </>
          }
          subtitle={t.subtitle}
        />

        <div className={scss.bento}>
          {/* Events — the big card */}
          <Reveal as="article" className={`surface-card ${scss.card} ${scss.events}`}>
            <p className={scss.eyebrow}>{t.eventsEyebrow}</p>
            <h3 className={scss.title}>
              <PiTreeEvergreenFill className={scss.tree} aria-hidden="true" />
              {t.eventsTitle}
            </h3>
            <p className={scss.text}>
              {t.eventsText}
            </p>

            <div className={scss.event}>
              <div className={scss.eventHead}>
                <div>
                  <p className={scss.eventName}>
                    <PiTreeEvergreenFill className={scss.tree} aria-hidden="true" />
                    {t.eventName}
                  </p>
                  <p className={scss.eventMeta}>{t.eventMeta}</p>
                </div>
                <span className={scss.active}>{t.active}</span>
              </div>

              <AvatarStack people={PARTICIPANTS} size="sm" />

              <div className={scss.progressRow}>
                <span
                  className={scss.progress}
                  role="progressbar"
                  aria-label={t.participantsReady}
                  aria-valuenow={18}
                  aria-valuemin={0}
                  aria-valuemax={18}
                >
                  <span className={scss.progressFill} />
                </span>
                <span className={scss.ready}>
                  {t.everyoneReady} <PiSparkleFill className={scss.spark} aria-hidden="true" />
                </span>
              </div>
            </div>

            {/* A gift peeking from the corner */}
            <GiftBox size={150} glow className={scss.cornerGift} />
          </Reveal>

          {/* Private matching */}
          <Reveal as="article" delay={120} className={`surface-card ${scss.card}`}>
            <h3 className={scss.title}>
              <GiftBox size={26} />
              {t.privateTitle}
            </h3>
            <p className={scss.text}>
              {t.privateText}
            </p>
            <p className={scss.notice}>
              <PiLockSimpleFill className={scss.lock} aria-hidden="true" />
              {t.privateNotice}
            </p>
          </Reveal>

          {/* Wishlists */}
          <Reveal as="article" delay={240} className={`surface-card ${scss.card}`}>
            <h3 className={scss.title}>
              <PiHeartFill className={scss.heart} aria-hidden="true" />
              {t.wishlistsTitle}
            </h3>
            <p className={scss.text}>{t.wishlistsText}</p>
            <ul className={scss.chips}>
              {WISH_ICONS.map((Icon, i) => (
                <li key={i} className={scss.chip}>
                  <Icon aria-hidden="true" />
                  {t.wishes[i]}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Features;
