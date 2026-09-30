"use client";
import { PiCheckCircleFill, PiInfoFill, PiWarningCircleFill } from "react-icons/pi";
import { useToasts } from "@/lib/toast";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./toaster.module.scss";

const ICONS = { success: PiCheckCircleFill, error: PiWarningCircleFill, info: PiInfoFill };

/** Mounted once at the root, inside I18nProvider; toast() from anywhere shows up here */
const Toaster = () => {
  const { toasts, dismiss } = useToasts();
  const { m } = useI18n();

  return (
    <div className={scss.toaster} role="status" aria-live="polite">
      {toasts.map(({ id, message, tone, icon }) => {
        const Icon = icon ?? ICONS[tone];
        return (
          <button key={id} type="button" className={`${scss.toast} ${scss[tone]}`} onClick={() => dismiss(id)}>
            <Icon className="icon-pop" aria-hidden="true" />
            {message(m)}
          </button>
        );
      })}
    </div>
  );
};

export default Toaster;
