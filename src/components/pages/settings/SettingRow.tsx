import type { ReactNode } from "react";
import scss from "./settings.module.scss";

interface SettingRowProps {
  title: ReactNode;
  /** One or two sentences: what it does, in plain words */
  text?: ReactNode;
  /** The control: a switcher, a button… */
  children?: ReactNode;
  /** A control that needs the whole width (segmented switchers) goes under the text */
  wide?: boolean;
}

/** One setting: what it is and what it does on the left, how to change it on the right */
const SettingRow = ({ title, text, children, wide }: SettingRowProps) => (
  <div className={`${scss.row} ${wide ? scss.rowWide : ""}`}>
    <div className={scss.rowText}>
      <h3 className={scss.rowTitle}>{title}</h3>
      {text && <p className={scss.rowDescription}>{text}</p>}
    </div>
    {children && <div className={scss.rowControl}>{children}</div>}
  </div>
);

export default SettingRow;
