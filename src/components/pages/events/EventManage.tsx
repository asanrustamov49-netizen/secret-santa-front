"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  PiArrowsClockwiseBold,
  PiCheckCircleBold,
  PiPencilSimpleBold,
  PiSignOutBold,
  PiTrashBold,
} from "react-icons/pi";
import ConfirmButton from "@/components/ui/confirmButton/ConfirmButton";
import TextField from "@/components/ui/textField/TextField";
import type { SantaEvent } from "@/lib/api/events";
import { getErrorMessage } from "@/lib/api/client";
import {
  useCompleteEvent,
  useDeleteEvent,
  useLeaveEvent,
  useRegenerateInvite,
  useUpdateEvent,
} from "@/lib/events/useEvents";
import { toast } from "@/lib/toast";
import { useI18n, useMessage } from "@/i18n/I18nProvider";
import scss from "./events.module.scss";

const toInt = (value: string) => {
  const digits = value.replace(/[\s,]/g, "");
  return digits ? Number(digits) : null;
};

/** Organizer: edit / new link / finish / delete. Participant: leave. */
const EventManage = ({ event }: { event: SantaEvent }) => {
  const router = useRouter();
  const update = useUpdateEvent(event.id);
  const regenerate = useRegenerateInvite(event.id);
  const complete = useCompleteEvent(event.id);
  const remove = useDeleteEvent(event.id);
  const leave = useLeaveEvent(event.id);
  const { m } = useI18n();
  const t = m.events.manage;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: event.name,
    description: event.description ?? "",
    eventDate: event.eventDate ?? "",
    budgetMin: event.budgetMin?.toString() ?? "",
    budgetMax: event.budgetMax?.toString() ?? "",
  });
  const [error, setError] = useMessage();

  const startEditing = () => {
    setForm({
      name: event.name,
      description: event.description ?? "",
      eventDate: event.eventDate ?? "",
      budgetMin: event.budgetMin?.toString() ?? "",
      budgetMax: event.budgetMax?.toString() ?? "",
    });
    setError(undefined);
    setEditing(true);
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError((m) => m.events.manage.errors.name);
    const min = toInt(form.budgetMin);
    const max = toInt(form.budgetMax);
    if ((form.budgetMin && Number.isNaN(min)) || (form.budgetMax && Number.isNaN(max))) {
      return setError((m) => m.events.manage.errors.budget);
    }
    if (min != null && max != null && min > max) return setError((m) => m.events.manage.errors.budgetOrder);

    update.mutate(
      {
        name: form.name.trim(),
        description: form.description.trim() || null,
        eventDate: form.eventDate || null,
        budgetMin: min,
        budgetMax: max,
      },
      {
        onSuccess: () => {
          setEditing(false);
          toast((m) => m.events.manage.updated);
        },
        onError: (err) => setError((m) => getErrorMessage(err, m)),
      },
    );
  };

  const onFailure = (err: unknown) => toast((m) => getErrorMessage(err, m), "error");

  if (!event.isOwner) {
    if (event.status !== "open") return null;
    return (
      <section className={`surface-card ${scss.panel}`} aria-label={t.participation}>
        <p className={scss.panelNote}>{t.leaveText}</p>
        <ConfirmButton
          className={`btn btn-outline ${scss.dangerOutline}`}
          confirmClassName={`btn ${scss.dangerSolid}`}
          confirmLabel={t.leaveConfirm}
          disabled={leave.isPending}
          pending={leave.isPending}
          pendingLabel={t.leaving}
          onConfirm={() =>
            leave.mutate(undefined, {
              onSuccess: () => {
                toast((m) => m.events.manage.left);
                router.replace("/events");
              },
              onError: onFailure,
            })
          }
        >
          <PiSignOutBold aria-hidden="true" /> {t.leave}
        </ConfirmButton>
      </section>
    );
  }

  // A finished event has nothing left to manage except deleting it
  const hasEverydayActions = editing || event.status !== "completed";

  const dangerZone = (
    <section className={`surface-card ${scss.panel} ${scss.dangerZone}`} aria-labelledby="danger-title">
      <div className={scss.manageRow}>
        <div>
          <h2 id="danger-title" className={scss.manageTitle}>
            {t.deleteTitle}
          </h2>
          <p className={scss.panelNote}>{t.deleteText}</p>
        </div>
        <ConfirmButton
          className={`btn btn-outline ${scss.dangerOutline}`}
          confirmClassName={`btn ${scss.dangerSolid}`}
          confirmLabel={t.deleteConfirm}
          disabled={remove.isPending}
          pending={remove.isPending}
          pendingLabel={t.deleting}
          onConfirm={() =>
            remove.mutate(undefined, {
              onSuccess: () => {
                toast((m) => m.events.manage.deleted);
                router.replace("/events");
              },
              onError: onFailure,
            })
          }
        >
          <PiTrashBold aria-hidden="true" /> {t.delete}
        </ConfirmButton>
      </div>
    </section>
  );

  if (!hasEverydayActions) return dangerZone;

  return (
    <>
      <section className={`surface-card ${scss.panel}`} aria-labelledby="manage-title">
        <header className={scss.panelHeader}>
          <h2 id="manage-title" className={scss.panelTitle}>
            {t.title}
          </h2>
          {!editing && event.status !== "completed" && (
            <button type="button" className="btn btn-ghost" onClick={startEditing}>
              <PiPencilSimpleBold aria-hidden="true" /> {t.edit}
            </button>
          )}
        </header>

        {editing ? (
          <form className={scss.editForm} onSubmit={save} noValidate>
            <TextField
              label={t.name}
              value={form.name}
              maxLength={80}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className={scss.fieldGroup}>
              <label htmlFor="edit-description" className={scss.label}>
                {t.description}
              </label>
              <textarea
                id="edit-description"
                className={`input ${scss.textarea}`}
                value={form.description}
                maxLength={500}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <TextField
              label={t.date}
              type="date"
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            />
            <div className={scss.twoCols}>
              <TextField
                label={t.budgetFrom}
                inputMode="numeric"
                value={form.budgetMin}
                onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
              />
              <TextField
                label={t.budgetTo}
                inputMode="numeric"
                value={form.budgetMax}
                onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
              />
            </div>
            {error && (
              <p className={scss.alert} role="alert">
                {error}
              </p>
            )}
            <div className={scss.wizardActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                {m.common.cancel}
              </button>
              <button type="submit" className="btn btn-primary" disabled={update.isPending}>
                {update.isPending ? m.common.saving : m.common.saveChanges}
              </button>
            </div>
          </form>
        ) : (
          <div className={scss.manageActions}>
            {event.status === "open" && (
              <div className={scss.manageRow}>
                <div>
                  <p className={scss.manageTitle}>{t.newLink}</p>
                  <p className={scss.panelNote}>{t.newLinkText}</p>
                </div>
                <ConfirmButton
                  className="btn btn-outline"
                  confirmClassName="btn btn-primary"
                  confirmLabel={t.replaceLink}
                  disabled={regenerate.isPending}
                  pending={regenerate.isPending}
                  pendingLabel={t.replacing}
                  onConfirm={() =>
                    regenerate.mutate(undefined, {
                      onSuccess: () => toast((m) => m.events.manage.newLinkReady),
                      onError: onFailure,
                    })
                  }
                >
                  <PiArrowsClockwiseBold aria-hidden="true" /> {t.newLinkButton}
                </ConfirmButton>
              </div>
            )}

            {event.status === "drawn" && (
              <div className={scss.manageRow}>
                <div>
                  <p className={scss.manageTitle}>{t.exchanged}</p>
                  <p className={scss.panelNote}>{t.exchangedText}</p>
                </div>
                <ConfirmButton
                  className="btn btn-outline"
                  confirmClassName="btn btn-primary"
                  confirmLabel={t.completeConfirm}
                  disabled={complete.isPending}
                  pending={complete.isPending}
                  pendingLabel={t.completing}
                  onConfirm={() =>
                    complete.mutate(undefined, {
                      onSuccess: () => toast((m) => m.events.manage.completed),
                      onError: onFailure,
                    })
                  }
                >
                  <PiCheckCircleBold aria-hidden="true" /> {t.complete}
                </ConfirmButton>
              </div>
            )}
          </div>
        )}
      </section>
      {dangerZone}
    </>
  );
};

export default EventManage;
