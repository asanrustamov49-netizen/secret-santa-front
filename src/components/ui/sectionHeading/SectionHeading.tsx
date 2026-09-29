import type { ReactNode } from "react";
import Reveal from "@/components/ui/reveal/Reveal";
import scss from "./sectionHeading.module.scss";

interface SectionHeadingProps {
  eyebrow?: string;
  /** Use <br /> inside for the editorial two-line break */
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  id?: string;
}

const SectionHeading = ({ eyebrow, title, subtitle, align = "center", id }: SectionHeadingProps) => {
  return (
    <Reveal className={`${scss.heading} ${scss[align]}`}>
      {eyebrow && <p className={scss.eyebrow}>{eyebrow}</p>}
      <h2 id={id} className={scss.title}>
        {title}
      </h2>
      {subtitle && <p className={scss.subtitle}>{subtitle}</p>}
    </Reveal>
  );
};

export default SectionHeading;
