"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { safeNextPath } from "@/lib/auth/schemas";
import { useSession } from "@/lib/auth/useSession";
import { useI18n } from "@/i18n/I18nProvider";
import BrandLoader from "@/components/ui/brandLoader/BrandLoader";
import scss from "./auth.module.scss";

/**
 * Where the API sends the browser after a successful Google sign-in.
 * The auth cookies are already set; this page only confirms the session
 * with /auth/me (which also fills the session cache) and moves on to `next`.
 */
const AuthCallback = () => {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const session = useSession();
  const { m } = useI18n();

  useEffect(() => {
    if (session.isPending) return;

    if (session.data) {
      router.replace(next);
    } else {
      // Cookies didn't stick or the session was rejected — let the user try again
      router.replace(`/login?error=google&next=${encodeURIComponent(next)}`);
    }
  }, [session.isPending, session.data, next, router]);

  return (
    <BrandLoader label={m.auth.callback.signingIn} className={scss.callback} />
  );
};

export default AuthCallback;
