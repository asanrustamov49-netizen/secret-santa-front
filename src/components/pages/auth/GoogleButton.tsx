import { FcGoogle } from "react-icons/fc";
import { googleSignInUrl } from "@/lib/auth/google";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./auth.module.scss";

interface GoogleButtonProps {
  /** Where to go after signing in */
  next: string;
}

/** A plain link on purpose: the whole page goes to Google and comes back signed in. */
const GoogleButton = ({ next }: GoogleButtonProps) => {
  const { m } = useI18n();
  return (
  <>
    <a href={googleSignInUrl(next)} className={`btn btn-outline btn-lg ${scss.google}`}>
      <FcGoogle aria-hidden="true" />
      {m.auth.google}
    </a>

    <p className={scss.divider}>
      <span>{m.auth.or}</span>
    </p>
  </>
  );
};

export default GoogleButton;
