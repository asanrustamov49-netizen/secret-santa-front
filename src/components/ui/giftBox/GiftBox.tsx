import { useId } from "react";
import { giftBoxSvg } from "./giftBoxArt";
import scss from "./giftBox.module.scss";

interface GiftBoxProps {
  /** Rendered width in px (height follows the square viewBox) */
  size?: number;
  /** Soft warm light behind the box */
  glow?: boolean;
  /** Tiny sparkles around the bow */
  sparkles?: boolean;
  className?: string;
}

/**
 * The recurring gift object of the product — and the brand mark.
 * Pure SVG + tokens, so it scales from a 28px logo mark to a 400px hero visual.
 * The drawing lives in giftBoxArt.ts, shared with the favicon and app icons.
 * Position, rotation and motion are left to the parent.
 */
const GiftBox = ({ size = 240, glow = false, sparkles = false, className }: GiftBoxProps) => {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <span
      className={`${scss.gift} ${glow ? scss.withGlow : ""} ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
      // Our own static drawing — no user input reaches this markup
      dangerouslySetInnerHTML={{
        __html: giftBoxSvg({
          uid,
          size,
          className: scss.svg,
          sparklesClassName: sparkles ? scss.sparkles : undefined,
        }),
      }}
    />
  );
};

export default GiftBox;
