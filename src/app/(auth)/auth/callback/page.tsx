import { Suspense } from "react";
import { pageTitle } from "@/i18n/server";
import AuthShell from "@/components/layout/authShell/AuthShell";
import AuthCallback from "@/components/pages/auth/AuthCallback";
import scss from "@/components/pages/auth/auth.module.scss";
import { getI18n } from "@/i18n/server";

export const generateMetadata = pageTitle("signingIn");

const CallbackAside = async () => {
  const { m } = await getI18n();
  return (
    <>
      <p className={scss.asideTitle}>{m.auth.callback.asideTitle}</p>
      <p className={scss.asideText}>{m.auth.callback.asideText}</p>
    </>
  );
};

export default function AuthCallbackPage() {
  return (
    <AuthShell aside={<CallbackAside />}>
      {/* useSearchParams (?next=) needs a Suspense boundary */}
      <Suspense>
        <AuthCallback />
      </Suspense>
    </AuthShell>
  );
}
