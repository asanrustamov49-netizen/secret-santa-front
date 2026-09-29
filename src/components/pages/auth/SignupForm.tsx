"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PiGiftFill } from "react-icons/pi";
import TextField from "@/components/ui/textField/TextField";
import { getErrorMessage } from "@/lib/api/client";
import { fieldMessages, registerSchema, safeNextPath } from "@/lib/auth/schemas";
import { focusFirstInvalid } from "@/lib/ui/focusFirstInvalid";
import { useRegister } from "@/lib/auth/useSession";
import { useFieldMessages, useI18n } from "@/i18n/I18nProvider";
import GoogleButton from "./GoogleButton";
import scss from "./auth.module.scss";

type Values = { name: string; email: string; password: string };

const SignupForm = () => {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const register = useRegister();
  const { m } = useI18n();
  const t = m.auth.signup;

  const [values, setValues] = useState<Values>({ name: "", email: "", password: "" });
  const [errors, setErrors] = useFieldMessages<keyof Values>();

  const update = (field: keyof Values) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldMessages(parsed.error));
      return focusFirstInvalid(event.currentTarget);
    }

    register.mutate(parsed.data, { onSuccess: () => router.replace(next) });
  };

  return (
    <form className={scss.form} onSubmit={onSubmit} noValidate>
      <div className={scss.header}>
        <h1 className={scss.title}>{t.title}</h1>
        <p className={scss.subtitle}>{t.subtitle}</p>
      </div>

      {register.isError && (
        <p className={scss.alert} role="alert">
          {getErrorMessage(register.error, m)}
        </p>
      )}

      <GoogleButton next={next} />

      <TextField
        label={t.name}
        name="name"
        autoComplete="name"
        placeholder={t.namePlaceholder}
        value={values.name}
        onChange={update("name")}
        error={errors.name}
        autoFocus
      />
      <TextField
        label={m.auth.email}
        type="email"
        name="email"
        autoComplete="email"
        placeholder={m.auth.emailPlaceholder}
        value={values.email}
        onChange={update("email")}
        error={errors.email}
      />
      <TextField
        label={m.auth.password}
        type="password"
        name="password"
        autoComplete="new-password"
        value={values.password}
        onChange={update("password")}
        error={errors.password}
        hint={t.passwordHint}
      />

      <button type="submit" className={`btn btn-primary btn-lg ${scss.submit}`} disabled={register.isPending}>
        {register.isPending ? (
          <span className="spinner" aria-hidden="true" />
        ) : (
          <PiGiftFill aria-hidden="true" />
        )}
        {register.isPending ? t.submitting : t.submit}
      </button>

      <p className={scss.switch}>
        {t.haveAccount}{" "}
        <Link href={next === "/dashboard" ? "/login" : `/login?next=${encodeURIComponent(next)}`}>
          {t.logIn}
        </Link>
      </p>
    </form>
  );
};

export default SignupForm;
