import Snowfall from "@/components/ui/snowfall/Snowfall";
import scss from "./winterBackdrop.module.scss";

/**
 * The quiet "it's winter" layer behind app pages: soft icy/lavender/gold light
 * plus a sparse, slow snowfall. Fixed, non-interactive, CSS-only — the UI on
 * top stays the foreground. Colours come from theme tokens (--atmosphere, --rgb-flake).
 */
const WinterBackdrop = () => (
  <div className={scss.backdrop} aria-hidden="true">
    <Snowfall bokeh={false} twinkles={false} className={scss.snow} />
  </div>
);

export default WinterBackdrop;
