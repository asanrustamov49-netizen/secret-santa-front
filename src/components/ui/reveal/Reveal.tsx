"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import scss from "./reveal.module.scss";

interface RevealProps {
  children: ReactNode;
  /** Stagger in ms */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article";
  /** Pin a theme for this block, e.g. an always-dark panel */
  "data-theme"?: "dark" | "light";
}

/** Soft rise-in when the element first scrolls into view. Plays once. */
const Reveal = ({
  children,
  delay = 0,
  className,
  as: Tag = "div",
  "data-theme": theme,
}: RevealProps) => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`${scss.reveal} ${isVisible ? scss.visible : ""} ${className ?? ""}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      data-theme={theme}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
