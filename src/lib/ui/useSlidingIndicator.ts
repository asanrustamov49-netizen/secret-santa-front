"use client";
import { useLayoutEffect, useRef } from "react";

/**
 * One highlight that glides between the options of a segmented control (theme, language)
 * instead of each option painting its own. It sits under the option whose aria-checked is
 * "true", follows size changes, and slides only after the user picks something — never
 * when the page loads and the saved choice arrives a moment after hydration.
 *
 * The container gets data-ready once the highlight is placed: until then (server HTML,
 * the first frame) the active option keeps its own background, so nothing flashes.
 */
export function useSlidingIndicator(activeKey: unknown) {
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const animateNext = useRef(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;

    const place = (animate: boolean) => {
      const active = container.querySelector<HTMLElement>('[aria-checked="true"]');
      if (!active) {
        container.removeAttribute("data-ready");
        return;
      }
      indicator.style.transition = animate ? "" : "none";
      indicator.style.width = `${active.offsetWidth}px`;
      indicator.style.height = `${active.offsetHeight}px`;
      indicator.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
      container.setAttribute("data-ready", "");
    };

    place(animateNext.current);
    animateNext.current = false;

    // Labels reflow (a font loads, a container query flips): follow without sliding.
    // The observer's first call only reports the size it started with — skip it, or it
    // would cut short the slide that just began.
    let first = true;
    const observer = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      place(false);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeKey]);

  /** Call right before the user's choice is applied: the next move slides */
  const willChange = () => {
    animateNext.current = true;
  };

  return { containerRef, indicatorRef, willChange };
}
