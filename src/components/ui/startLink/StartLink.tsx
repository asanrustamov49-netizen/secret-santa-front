"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { useSessionHint } from "@/lib/auth/useSession";

interface StartLinkProps {
  className?: string;
  children: ReactNode;
}

/**
 * "Get started" call to action: guests go to sign up, signed-in users straight to
 * their dashboard — no detour through a sign-up form they don't need.
 */
const StartLink = ({ className, children }: StartLinkProps) => {
  const signedIn = useSessionHint();
  return (
    <Link href={signedIn ? "/dashboard" : "/signup"} className={className}>
      {children}
    </Link>
  );
};

export default StartLink;
