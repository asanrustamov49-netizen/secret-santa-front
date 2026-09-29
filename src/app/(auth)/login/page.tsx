import { Suspense } from "react";
import { pageTitle } from "@/i18n/server";
import { PiConfettiFill } from "react-icons/pi";
import AuthShell from "@/components/layout/authShell/AuthShell";
import LoginForm from "@/components/pages/auth/LoginForm";
import scss from "@/components/pages/auth/auth.module.scss";
import { getI18n } from "@/i18n/server";

export const generateMetadata = pageTitle("login");

const LoginAside = async () => {
  const { m } = await getI18n();
  const t = m.auth.login;
  return (
  <>
    <p className={scss.asideTitle}>{t.asideTitle}</p>
    <p className={scss.asideText}>{t.asideText}</p>

    <div className={scss.matchCard} aria-hidden="true">
      <div className={scss.matchRow}>
        <span className={scss.avatar}>A</span>
        <div>
          <p className={scss.matchName}>{t.demoMatch}</p>
          <p className={scss.matchMeta}>{t.demoEvent}</p>
        </div>
      </div>
      <p className={scss.ready}>
        <PiConfettiFill />
        {t.demoReady}
      </p>
    </div>
  </>
  );
};

export default function LoginPage() {
  return (
    <AuthShell aside={<LoginAside />}>
      {/* useSearchParams (?next=) needs a Suspense boundary */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
