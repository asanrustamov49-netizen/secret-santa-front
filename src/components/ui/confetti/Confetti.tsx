"use client";
import scss from "./confetti.module.scss";

const COLORS = ["var(--color-gold)", "var(--color-crimson)", "var(--color-green-bright)", "var(--color-snow)", "var(--color-purple-light)"];

interface ConfettiProps {
  /** Change it to fire again (also varies the pattern) */
  burst?: number;
  pieces?: number;
}

/** Small seeded PRNG: random-looking, but the same for the same seed — keeps render pure */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One festive burst from the centre of its (relative) parent. CSS only, respects reduced motion. */
const Confetti = ({ burst = 0, pieces = 48 }: ConfettiProps) => {
  const random = seeded(burst + 1);
  const bits = Array.from({ length: pieces }, (_, i) => {
    const angle = (i / pieces) * Math.PI * 2 + random() * 0.4;
    const distance = 120 + random() * 220;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 80,
      rotate: random() * 720 - 360,
      delay: random() * 0.15,
      color: COLORS[i % COLORS.length],
      round: i % 3 === 0,
    };
  });

  return (
    <div key={burst} className={scss.confetti} aria-hidden="true">
      {bits.map((bit, i) => (
        <span
          key={i}
          className={`${scss.bit} ${bit.round ? scss.round : ""}`}
          style={
            {
              "--x": `${bit.x}px`,
              "--y": `${bit.y}px`,
              "--r": `${bit.rotate}deg`,
              "--c": bit.color,
              animationDelay: `${bit.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default Confetti;
