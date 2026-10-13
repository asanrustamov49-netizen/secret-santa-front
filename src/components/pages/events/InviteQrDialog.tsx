"use client";
import { useState } from "react";
import { PiDownloadSimpleBold, PiXBold } from "react-icons/pi";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import Modal from "@/components/ui/modal/Modal";
import { useI18n } from "@/i18n/I18nProvider";
import { inviteQr, QR_QUIET } from "@/lib/invites/qr";
import { inviteQrPng, QR_INK } from "@/lib/invites/qrImage";
import { toast } from "@/lib/toast";
import scss from "./inviteQr.module.scss";

interface InviteQrDialogProps {
  open: boolean;
  onClose: () => void;
  url: string;
  eventName: string;
}

/**
 * The invite link as a QR code, big enough to scan from across a table — for the office
 * party where half the group is in the room. The code appears from its centre outwards;
 * "Save as image" makes a printable card with the event's name.
 */
const InviteQrDialog = ({ open, onClose, url, eventName }: InviteQrDialogProps) => {
  const { m } = useI18n();
  const t = m.events.invite;
  const [saving, setSaving] = useState(false);
  const { size, viewBox, dots, finders, logo } = inviteQr(url || "about:blank");
  const logoShare = `${(logo[1] / (size + 2 * QR_QUIET)) * 100}%`;

  const save = async () => {
    setSaving(true);
    try {
      const png = await inviteQrPng(url, eventName, m.common.logo);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(png);
      link.download = "secret-santa-invite.png";
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 10_000);
      toast((m) => m.events.invite.qrSaved);
    } catch {
      toast((m) => m.events.invite.qrSaveFailed, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} label={t.qrTitle} className={scss.dialog}>
      {/* Remounted on every opening, so the code draws itself in again */}
      {open && (
        <div className={scss.card}>
          <button type="button" className={`touch-target ${scss.close}`} onClick={onClose} aria-label={t.close}>
            <PiXBold aria-hidden="true" />
          </button>

          <h2 className={scss.title}>{t.qrTitle}</h2>
          <p className={scss.event}>{eventName}</p>

          <div className={scss.frame}>
            <svg viewBox={viewBox} className={scss.code} role="img" aria-label={t.qrLabel(eventName)}>
              <path d={dots} fill={QR_INK} className={scss.dots} />
              {finders.map(([x, y], i) => (
                <g key={`${x}-${y}`} className={scss.finder} style={{ animationDelay: `${120 + i * 90}ms` }}>
                  <rect x={x + 0.5} y={y + 0.5} width={6} height={6} rx={1.6} fill="none" stroke={QR_INK} strokeWidth={1} />
                  <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.9} fill={QR_INK} />
                </g>
              ))}
            </svg>
            <span className={scss.logo} style={{ width: logoShare, height: logoShare }} aria-hidden="true">
              <GiftBox size={64} className={scss.gift} />
            </span>
            <span className={scss.scan} aria-hidden="true" />
          </div>

          <p className={scss.hint}>{t.qrHint}</p>

          <button type="button" className={`btn btn-primary ${scss.save}`} onClick={save} disabled={saving}>
            {saving ? <span className="spinner" aria-hidden="true" /> : <PiDownloadSimpleBold aria-hidden="true" />}
            {t.qrDownload}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default InviteQrDialog;
