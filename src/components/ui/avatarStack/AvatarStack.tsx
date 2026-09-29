import scss from "./avatarStack.module.scss";

export type AvatarTone = "blue" | "purple" | "crimson" | "red" | "amber" | "green" | "teal";

interface AvatarStackProps {
  people: { initial: string; tone: AvatarTone }[];
  size?: "sm" | "md";
  className?: string;
}

/** Overlapping initials — "who's in" at a glance. Decorative: pair it with a text label. */
const AvatarStack = ({ people, size = "md", className }: AvatarStackProps) => {
  return (
    <span className={`${scss.stack} ${scss[size]} ${className ?? ""}`} aria-hidden="true">
      {people.map((person, i) => (
        <span
          key={i}
          className={`${scss.avatar} ${scss[person.tone]}`}
          style={{ zIndex: people.length - i }}
        >
          {person.initial}
        </span>
      ))}
    </span>
  );
};

export default AvatarStack;
