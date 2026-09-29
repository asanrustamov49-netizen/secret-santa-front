import { Suspense } from "react";
import { pageTitle } from "@/i18n/server";
import { PiGiftFill, PiHeartFill, PiSparkleFill } from "react-icons/pi";
import AuthShell from "@/components/layout/authShell/AuthShell";
import SignupForm from "@/components/pages/auth/SignupForm";
import scss from "@/components/pages/auth/auth.module.scss";
import { getI18n } from "@/i18n/server";

export const generateMetadata = pageTitle("signup");

// Same order as m.auth.signup.perks
const PERK_ICONS = [PiGiftFill, PiHeartFill, PiSparkleFill];

const SignupAside = async () => {
  const { m } = await getI18n();
  const t = m.auth.signup;
  return (
    <>
      <p className={scss.asideTitle}>{t.asideTitle}</p>
      <p className={scss.asideText}>{t.asideText}</p>
      <ul className={scss.perks}>
        {PERK_ICONS.map((Icon, i) => (
          <li key={i} className={scss.perk}>
            <Icon aria-hidden="true" />
            {t.perks[i]}
          </li>
        ))}
      </ul>
    </>
  );
};

export default function SignupPage() {
  return (
    <AuthShell aside={<SignupAside />}>
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
