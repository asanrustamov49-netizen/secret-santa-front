"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import TextField from "@/components/ui/textField/TextField";
import { getErrorMessage } from "@/lib/api/client";
import { googleErrorMessage } from "@/lib/auth/google";
import { fieldMessages, loginSchema, safeNextPath } from "@/lib/auth/schemas";
import { useLogin } from "@/lib/auth/useSession";
import { useFieldMessages, useI18n } from "@/i18n/I18nProvider";
import { focusFirstInvalid } from "@/lib/ui/focusFirstInvalid";
import GoogleButton from "./GoogleButton";
import scss from "./auth.module.scss";

type Values = { email: string; password: string };

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const { m } = useI18n();
  const t = m.auth.login;
  // Set by the API when Google sign-in fails (/login?error=google…)
  const googleError = googleErrorMessage(searchParams.get("error"), m);
  const login = useLogin();

  const [values, setValues] = useState<Values>({ email: "", password: "" });
  const [errors, setErrors] = useFieldMessages<keyof Values>();

  const update = (field: keyof Values) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldMessages(parsed.error));
      return focusFirstInvalid(event.currentTarget);
    }

    login.mutate(parsed.data, { onSuccess: () => router.replace(next) });
  };

  return (
    <form className={scss.form} onSubmit={onSubmit} noValidate>
      <div className={scss.header}>
        <h1 className={scss.title}>{t.title}</h1>
        <p className={scss.subtitle}>{t.subtitle}</p>
      </div>

      {login.isError ? (
        <p className={scss.alert} role="alert">
          {getErrorMessage(login.error, m)}
        </p>
      ) : (
        googleError && (
          <p className={scss.alert} role="alert">
            {googleError}
          </p>
        )
      )}

      <GoogleButton next={next} />

      <TextField
        label={m.auth.email}
        type="email"
        name="email"
        autoComplete="email"
        placeholder={m.auth.emailPlaceholder}
        value={values.email}
        onChange={update("email")}
        error={errors.email}
        autoFocus
      />
      <TextField
        label={m.auth.password}
        type="password"
        name="password"
        autoComplete="current-password"
        value={values.password}
        onChange={update("password")}
        error={errors.password}
      />

      <button type="submit" className={`btn btn-primary btn-lg ${scss.submit}`} disabled={login.isPending}>
        {login.isPending && <span className="spinner" aria-hidden="true" />}
        {login.isPending ? t.submitting : t.submit}
      </button>

      <p className={scss.switch}>
        {t.noAccount}{" "}
        <Link href={next === "/dashboard" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`}>
          {t.signUp}
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
