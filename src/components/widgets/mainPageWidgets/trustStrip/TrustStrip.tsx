import { PiTreeEvergreenFill } from "react-icons/pi";
import AvatarStack, { type AvatarTone } from "@/components/ui/avatarStack/AvatarStack";
import Reveal from "@/components/ui/reveal/Reveal";
import { getI18n } from "@/i18n/server";
import scss from "./trustStrip.module.scss";

const GROUP: { initial: string; tone: AvatarTone }[] = [
  { initial: "A", tone: "blue" },
  { initial: "B", tone: "purple" },
  { initial: "C", tone: "crimson" },
  { initial: "D", tone: "red" },
  { initial: "E", tone: "amber" },
  { initial: "F", tone: "green" },
];

const TrustStrip = async () => {
  const { m } = await getI18n();
  const t = m.landing.trust;

  return (
    <section className={scss.strip} aria-label={t.label}>
      <div className="container">
        <Reveal className={`surface-card ${scss.card}`}>
          <p className={scss.caption}>{t.caption}</p>
          <div className={scss.proof}>
            <AvatarStack people={GROUP} />
            <span>
              {t.proof}
              <PiTreeEvergreenFill className={scss.tree} aria-hidden="true" />
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default TrustStrip;
