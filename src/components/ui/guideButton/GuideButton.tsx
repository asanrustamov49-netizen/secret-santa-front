"use client";
import type { ReactNode } from "react";
import { openGuide } from "@/lib/onboarding/onboarding";

/** Reopens the product tour (hosted at the root) — for server components like the footer */
const GuideButton = ({ className, children }: { className?: string; children: ReactNode }) => (
  <button type="button" className={className} onClick={openGuide}>
    {children}
  </button>
);

export default GuideButton;
