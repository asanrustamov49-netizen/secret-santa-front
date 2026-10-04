"use client";
import {
  PiArrowRightBold,
  PiArrowsClockwiseBold,
  PiArrowBendUpLeftBold,
  PiCalendarBlank,
  PiChatsCircleFill,
  PiCheckCircleFill,
  PiGiftFill,
  PiLinkBold,
  PiLockKeyFill,
  PiSparkleFill,
  PiUsersThreeFill,
  PiWallet,
} from "react-icons/pi";
import Avatar from "@/components/ui/avatar/Avatar";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./guide.module.scss";

/** The tour, in order — each id is a step in m.onboarding.steps */
export const GUIDE_STEPS = [
  "welcome",
  "create",
  "invite",
  "wishlist",
  "draw",
  "mySanta",
  "santaChat",
  "eventChat",
  "ai",
  "notifications",
  "done",
] as const;

export type GuideStep = (typeof GUIDE_STEPS)[number];

/**
 * A small picture of each step, drawn with the app's own pieces (avatars, chips, bubbles,
 * the gift box) and made-up sample people — never real data. Decorative: the step's text
 * says everything a screen reader needs.
 */
const GuideVisual = ({ id }: { id: GuideStep }) => {
  const { m } = useI18n();
  const d = m.onboarding.demo;

  switch (id) {
    case "welcome":
      return (
        <div className={scss.vWelcome}>
          <GiftBox size={128} glow sparkles />
          <ul className={scss.chips}>
            {d.groups.map((group) => (
              <li key={group} className={scss.chip}>
                {group}
              </li>
            ))}
          </ul>
        </div>
      );

    case "create":
      return (
        <div className={scss.mock}>
          <p className={scss.mockKicker}>{d.newEvent}</p>
          <p className={scss.mockTitle}>{d.eventName}</p>
          <ul className={scss.mockRows}>
            <li>
              <PiCalendarBlank aria-hidden="true" /> {d.eventDate}
            </li>
            <li>
              <PiWallet aria-hidden="true" /> {d.budget}
            </li>
            <li>
              <PiUsersThreeFill aria-hidden="true" /> {d.people}
            </li>
          </ul>
          <span className={scss.mockButton}>
            <PiLinkBold aria-hidden="true" /> {d.inviteFriends}
          </span>
        </div>
      );

    case "invite":
      return (
        <div className={scss.vFlow}>
          <div className={scss.flowNode}>
            <Avatar name={d.organizerName} size={52} />
            <span>{d.organizer}</span>
          </div>
          <PiArrowRightBold className={scss.flowArrow} />
          <div className={`${scss.flowNode} ${scss.flowLink}`}>
            <span className={scss.linkPill}>
              <PiLinkBold /> /join/…
            </span>
            <span>{d.link}</span>
          </div>
          <PiArrowRightBold className={scss.flowArrow} />
          <div className={scss.flowNode}>
            <span className={scss.avatarRow}>
              {d.friends.map((name) => (
                <Avatar key={name} name={name} size={36} />
              ))}
            </span>
            <span>{d.participants}</span>
          </div>
        </div>
      );

    case "wishlist":
      return (
        <div className={scss.mock}>
          <p className={scss.mockKicker}>{d.interestsLabel}</p>
          <ul className={scss.chips}>
            {d.interests.map((interest) => (
              <li key={interest} className={scss.chip}>
                {interest}
              </li>
            ))}
          </ul>
          <p className={scss.mockKicker}>{d.wishlistLabel}</p>
          <ul className={scss.wishes}>
            {d.wishes.map((wish) => (
              <li key={wish.title}>
                <PiGiftFill /> <span>{wish.title}</span> <b>{wish.price}</b>
              </li>
            ))}
          </ul>
        </div>
      );

    case "draw":
      return (
        <div className={scss.mock}>
          <p className={scss.mockKicker}>
            <PiArrowsClockwiseBold /> {d.drawDone}
          </p>
          <div className={scss.pairRow}>
            <span className={scss.pairWho}>
              <Avatar name={d.you} size={36} /> {d.you}
            </span>
            <PiArrowRightBold className={scss.flowArrow} />
            <span className={`${scss.pairWho} ${scss.pairOpen}`}>
              <Avatar name={d.recipientName} size={36} /> {d.recipientName}
            </span>
          </div>
          {[0, 1].map((row) => (
            <div key={row} className={`${scss.pairRow} ${scss.pairHidden}`}>
              <span className={scss.blur} />
              <PiLockKeyFill />
              <span className={scss.blur} />
            </div>
          ))}
          <p className={scss.mockNote}>
            <PiLockKeyFill /> {d.onlyYours}
          </p>
        </div>
      );

    case "mySanta":
      return (
        <div className={scss.mock}>
          <p className={scss.mockKicker}>{d.youGiveTo}</p>
          <div className={scss.person}>
            <Avatar name={d.recipientName} size={48} />
            <div>
              <p className={scss.mockTitle}>{d.recipientName}</p>
              <p className={scss.mockSub}>
                <PiWallet /> {d.budget}
              </p>
            </div>
          </div>
          <ul className={scss.chips}>
            {d.interests.map((interest) => (
              <li key={interest} className={scss.chip}>
                {interest}
              </li>
            ))}
          </ul>
          <ul className={scss.wishes}>
            <li>
              <PiGiftFill /> <span>{d.wishes[0].title}</span> <b>{d.wishes[0].price}</b>
            </li>
          </ul>
          <span className={scss.mockButton}>
            <PiSparkleFill /> {d.aiIdeas}
          </span>
        </div>
      );

    case "santaChat":
      return (
        <div className={scss.vChats}>
          <div className={scss.phone}>
            <p className={scss.phoneHead}>
              <Avatar name={d.recipientName} size={26} />
              <span>
                <small>{d.youSee}</small> {d.recipientName}
              </span>
            </p>
            <p className={`${scss.bubble} ${scss.mine}`}>{d.santaQuestion}</p>
            <p className={scss.bubble}>{d.recipientAnswer}</p>
          </div>
          <div className={scss.phone}>
            <p className={scss.phoneHead}>
              <span className={scss.santaMark}>
                <PiGiftFill />
              </span>
              <span>
                <small>{d.theySee}</small> {m.santaChat.yourSanta}
              </span>
            </p>
            <p className={scss.bubble}>{d.santaQuestion}</p>
            <p className={`${scss.bubble} ${scss.mine}`}>{d.recipientAnswer}</p>
          </div>
        </div>
      );

    case "eventChat":
      return (
        <div className={scss.vCompare}>
          <div className={scss.compareCard}>
            <span className={`${scss.compareIcon} ${scss.blue}`}>
              <PiChatsCircleFill />
            </span>
            <p className={scss.mockTitle}>{d.eventChatTitle}</p>
            <span className={scss.avatarRow}>
              {d.friends.map((name) => (
                <Avatar key={name} name={name} size={28} />
              ))}
            </span>
            <p className={scss.mockSub}>{d.eventChatWho}</p>
          </div>
          <div className={scss.compareCard}>
            <span className={`${scss.compareIcon} ${scss.crimson}`}>
              <PiLockKeyFill />
            </span>
            <p className={scss.mockTitle}>{d.giftChatTitle}</p>
            <span className={scss.avatarRow}>
              <Avatar name={d.you} size={28} />
              <span className={scss.santaMark}>
                <PiGiftFill />
              </span>
            </span>
            <p className={scss.mockSub}>{d.giftChatWho}</p>
          </div>
        </div>
      );

    case "ai":
      return (
        <div className={scss.mock}>
          <p className={scss.mockKicker}>
            <PiSparkleFill /> {d.aiIdeas}
          </p>
          <ul className={scss.ideas}>
            {d.ideas.map((idea) => (
              <li key={idea.title}>
                <span>{idea.title}</span>
                <small>{idea.why}</small>
                <b>{idea.price}</b>
              </li>
            ))}
          </ul>
        </div>
      );

    case "notifications":
      return (
        <div className={scss.vNotice}>
          <div className={scss.notice}>
            <span className={scss.noticeIcon}>
              <PiGiftFill />
            </span>
            <div>
              <p className={scss.noticeTitle}>{m.santaChat.notice.fromSanta}</p>
              <p className={scss.noticeText}>{d.noticePreview}</p>
              <span className={scss.mockButton}>
                <PiArrowBendUpLeftBold /> {m.santaChat.notice.reply}
              </span>
            </div>
          </div>
          <p className={scss.mockNote}>
            <PiCheckCircleFill /> {d.noticeNote}
          </p>
        </div>
      );

    case "done":
      return (
        <div className={scss.vWelcome}>
          <GiftBox size={140} glow sparkles />
        </div>
      );
  }
};

export default GuideVisual;
