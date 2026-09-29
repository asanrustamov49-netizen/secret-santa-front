"use client";
import { useState } from "react";
import scss from "./avatar.module.scss";

interface AvatarProps {
  name: string;
  /** Google profile picture; falls back to the first letter if missing or broken */
  src?: string | null;
  size?: number;
  className?: string;
}

const Avatar = ({ name, src, size = 40, className }: AvatarProps) => {
  const [broken, setBroken] = useState(false);
  const showImage = src && !broken;

  return (
    <span
      className={`${scss.avatar} ${className ?? ""}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {showImage ? (
        // Plain <img>: tiny remote avatar, no need for next/image's optimizer.
        // no-referrer — Google's avatar host may refuse hotlinks with a referrer.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" referrerPolicy="no-referrer" onError={() => setBroken(true)} />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </span>
  );
};

export default Avatar;
