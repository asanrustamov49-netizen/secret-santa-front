import scss from "./snowfall.module.scss";

interface SnowfallProps {
  /** Rare golden sparks between the flakes */
  twinkles?: boolean;
  /** Big out-of-focus flakes in the foreground */
  bokeh?: boolean;
  className?: string;
}

const TWINKLES = 8;
const BOKEH = 5;

const Snowfall = ({ twinkles = true, bokeh = true, className }: SnowfallProps) => {
  return (
    <div className={`${scss.snowfall} ${className ?? ""}`} aria-hidden="true">
      <div className={scss.sway}>
        <span className={`${scss.layer} ${scss.far}`} />
      </div>
      <div className={scss.sway}>
        <span className={`${scss.layer} ${scss.mid}`} />
      </div>
      <div className={scss.sway}>
        <span className={`${scss.layer} ${scss.near}`} />
      </div>

      {bokeh && (
        <div>
          {Array.from({ length: BOKEH }, (_, i) => (
            <span key={i} className={scss.bokeh} />
          ))}
        </div>
      )}

      {twinkles &&
        Array.from({ length: TWINKLES }, (_, i) => (
          <i key={i} className={scss.twinkle} />
        ))}
    </div>
  );
};

export default Snowfall;
