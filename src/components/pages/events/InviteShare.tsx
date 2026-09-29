"use client";
import { useSyncExternalStore } from "react";
import { PiCopyBold, PiShareNetworkBold, PiTelegramLogoFill, PiWhatsappLogoFill } from "react-icons/pi";
import { inviteUrl } from "@/lib/events/format";
import { toast } from "@/lib/toast";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./events.module.scss";

const noopSubscribe = () => () => {};
const canNativeShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

interface InviteShareProps {
  code: string;
  eventName: string;
}

/** The invite link with every way to send it: copy, the phone's share sheet, Telegram, WhatsApp */
const InviteShare = ({ code, eventName }: InviteShareProps) => {
  // window.location is only known in the browser — "" during SSR, filled in right after
  const url = useSyncExternalStore(noopSubscribe, () => inviteUrl(code), () => "");
  const hasShareSheet = useSyncExternalStore(noopSubscribe, canNativeShare, () => false);
  const { m } = useI18n();
  const t = m.events.invite;
  const message = t.message(eventName);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast((m) => m.events.invite.copied);
    } catch {
      toast((m) => m.events.invite.copyFailed, "error");
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: eventName, text: message, url });
    } catch {
      // Closing the share sheet is not an error worth showing
    }
  };

  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(message);

  return (
    <div className={scss.invite}>
      <div className={scss.inviteField}>
        <input
          className="input"
          readOnly
          value={url}
          aria-label={t.linkLabel}
          onFocus={(event) => event.target.select()}
        />
        <button type="button" className="btn btn-primary" onClick={copy}>
          <PiCopyBold aria-hidden="true" />
          {t.copy}
        </button>
      </div>

      <div className={scss.shareRow}>
        {hasShareSheet && (
          <button type="button" className={scss.shareButton} onClick={share}>
            <PiShareNetworkBold aria-hidden="true" /> {t.share}
          </button>
        )}
        <a
          className={scss.shareButton}
          href={`https://t.me/share/url?url=${encoded}&text=${text}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <PiTelegramLogoFill aria-hidden="true" /> Telegram
        </a>
        <a
          className={scss.shareButton}
          href={`https://wa.me/?text=${text}%20${encoded}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <PiWhatsappLogoFill aria-hidden="true" /> WhatsApp
        </a>
      </div>
    </div>
  );
};

export default InviteShare;
