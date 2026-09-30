"use client";
import { useState, type FormEvent } from "react";
import TextField from "@/components/ui/textField/TextField";
import type { WishlistItem, WishlistItemPayload } from "@/lib/api/profile";
import { focusFirstInvalid } from "@/lib/ui/focusFirstInvalid";
import { useFieldMessages, useI18n } from "@/i18n/I18nProvider";
import type { Messages, Say } from "@/i18n/messages";
import scss from "./profile.module.scss";

type Field = "title" | "price" | "url";

/** A field error of this form, worded at render (follows a language switch) */
const fieldError =
  (key: keyof Messages["profile"]["item"]["errors"]): Say =>
  (m) =>
    m.profile.item.errors[key];

interface WishlistItemFormProps {
  /** Editing an existing gift, or undefined for a new one */
  item?: WishlistItem;
  isPending: boolean;
  serverError?: string;
  onSubmit: (payload: WishlistItemPayload) => void;
  onCancel?: () => void;
}

function validate(title: string, price: string, url: string) {
  const errors: Partial<Record<Field, Say>> = {};
  if (!title.trim()) errors.title = fieldError("title");
  else if (title.trim().length > 120) errors.title = fieldError("titleMax");

  // "1 500" and "1,500" are fine
  const digits = price.replace(/[\s,]/g, "");
  if (digits && !/^\d+$/.test(digits)) errors.price = fieldError("price");
  else if (digits && Number(digits) > 10_000_000) errors.price = fieldError("priceHigh");

  const link = url.trim();
  if (link && !/^https?:\/\/\S+\.\S+/i.test(link)) errors.url = fieldError("url");

  return { errors, digits, link };
}

const WishlistItemForm = ({ item, isPending, serverError, onSubmit, onCancel }: WishlistItemFormProps) => {
  const [title, setTitle] = useState(item?.title ?? "");
  const [price, setPrice] = useState(item?.priceApprox != null ? String(item.priceApprox) : "");
  const [url, setUrl] = useState(item?.url ?? "");
  const [errors, setErrors] = useFieldMessages<Field>();
  const { m } = useI18n();
  const t = m.profile.item;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = validate(title, price, url);
    if (Object.keys(result.errors).length > 0) {
      setErrors(result.errors);
      return focusFirstInvalid(event.currentTarget);
    }

    onSubmit({
      title: title.trim(),
      priceApprox: result.digits ? Number(result.digits) : null,
      url: result.link || null,
    });
  };

  return (
    <form className={scss.giftForm} onSubmit={submit} noValidate>
      <TextField
        label={t.gift}
        placeholder={t.giftPlaceholder}
        value={title}
        maxLength={120}
        autoFocus
        error={errors.title}
        onChange={(event) => {
          setTitle(event.target.value);
          setErrors((current) => ({ ...current, title: undefined }));
        }}
      />
      <div className={scss.giftFormRow}>
        <TextField
          label={t.price}
          optional
          placeholder={t.pricePlaceholder}
          inputMode="numeric"
          value={price}
          error={errors.price}
          onChange={(event) => {
            setPrice(event.target.value);
            setErrors((current) => ({ ...current, price: undefined }));
          }}
        />
        <TextField
          label={t.link}
          optional
          type="url"
          placeholder={t.linkPlaceholder}
          value={url}
          error={errors.url}
          onChange={(event) => {
            setUrl(event.target.value);
            setErrors((current) => ({ ...current, url: undefined }));
          }}
        />
      </div>

      {serverError && (
        <p className={scss.fieldError} role="alert">
          {serverError}
        </p>
      )}

      <div className={scss.giftFormActions}>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {m.common.cancel}
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? m.common.saving : item ? m.common.saveChanges : t.add}
        </button>
      </div>
    </form>
  );
};

export default WishlistItemForm;
