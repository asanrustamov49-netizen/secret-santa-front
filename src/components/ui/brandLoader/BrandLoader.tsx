import GiftBox from "@/components/ui/giftBox/GiftBox";
import scss from "./brandLoader.module.scss";

interface BrandLoaderProps {
  /** What is loading — read by screen readers, shown under the gift */
  label: string;
  /**
   * page — the whole screen (first load of the app, sign-in)
   * section — one area while it has nothing to show yet (a route that is still rendering)
   * Buttons keep their inline .spinner; lists and cards keep their skeletons.
   */
  variant?: "page" | "section";
  /** Fade in only if loading takes a moment — no flash on fast loads */
  delayed?: boolean;
  className?: string;
}

/**
 * The loading state of the product: the brand gift, floating in a soft gold and
 * winter-blue glow. No spinner around it; with reduced motion it simply stays still.
 */
const BrandLoader = ({ label, variant = "section", delayed = false, className }: BrandLoaderProps) => {
  const size = variant === "page" ? 76 : 56;

  return (
    <div
      className={`${scss.loader} ${scss[variant]} ${delayed ? scss.delayed : ""} ${className ?? ""}`}
      role="status"
      aria-live="polite"
    >
      <span className={scss.stage} aria-hidden="true">
        <span className={scss.aura} />
        <GiftBox size={size} glow sparkles className={scss.gift} />
        <span className={scss.floor} />
      </span>
      <p className={scss.label}>
        {label}
        <span className={scss.dots} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </p>
    </div>
  );
};

export default BrandLoader;
