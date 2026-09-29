import scss from "./nightSky.module.scss";

type NightSkyVariant = "hero" | "magic" | "cta";

interface NightSkyProps {
  /** Moves the light sources so sections don't look copy-pasted */
  variant?: NightSkyVariant;
  className?: string;
}

/**
 * Layered midnight background: navy base + blue / purple / gold light
 * sources + vignette + fine grain. Purely decorative.
 */
const NightSky = ({ variant = "hero", className }: NightSkyProps) => {
  return (
    <div
      className={`${scss.sky} ${scss[variant]} ${className ?? ""}`}
      aria-hidden="true"
    >
      <span className={`${scss.glow} ${scss.blue}`} />
      <span className={`${scss.glow} ${scss.purple}`} />
      <span className={`${scss.glow} ${scss.gold}`} />
      <span className={scss.stars} />
      <span className={scss.vignette} />
      <span className={scss.grain} />
    </div>
  );
};

export default NightSky;
