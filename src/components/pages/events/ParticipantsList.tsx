"use client";
import { PiCheckCircleFill, PiCrownSimpleFill, PiHourglassMediumFill, PiXBold } from "react-icons/pi";
import Avatar from "@/components/ui/avatar/Avatar";
import ConfirmButton from "@/components/ui/confirmButton/ConfirmButton";
import type { Participant, SantaEvent } from "@/lib/api/events";
import { getErrorMessage } from "@/lib/api/client";
import { useRemoveParticipant } from "@/lib/events/useEvents";
import { toast } from "@/lib/toast";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./events.module.scss";

interface ParticipantsListProps {
  event: SantaEvent;
  participants: Participant[];
}

const ParticipantsList = ({ event, participants }: ParticipantsListProps) => {
  const remove = useRemoveParticipant(event.id);
  const canRemove = event.isOwner && event.status === "open";
  const { m } = useI18n();
  const t = m.events.participants;

  return (
    <section className={`surface-card ${scss.panel}`} aria-labelledby="people-title">
      <header className={scss.panelHeader}>
        <h2 id="people-title" className={scss.panelTitle}>
          {t.title} <span className={scss.count}>{participants.length}</span>
        </h2>
        {event.status !== "open" ? (
          // After the draw nobody can join, whatever the limit says
          <span className={scss.panelHint}>{t.closed}</span>
        ) : (
          event.maxParticipants && (
            <span className={scss.panelHint}>
              {event.maxParticipants - participants.length > 0
                ? t.spotsLeft(event.maxParticipants - participants.length)
                : t.full}
            </span>
          )
        )}
      </header>

      <ul className={scss.people}>
        {participants.map((person) => (
          <li key={person.id} className={scss.person}>
            <Avatar name={person.name} src={person.avatarUrl} size={40} />
            <div className={scss.personText}>
              <p className={scss.personName}>
                {person.name}
                {person.isMe && <span className={scss.you}>{m.common.you}</span>}
                {person.isOwner && (
                  <PiCrownSimpleFill className={scss.crown} aria-label={m.common.organizer} title={m.common.organizer} />
                )}
              </p>
              {event.status === "open" && (
                <p className={person.ready ? scss.personReady : scss.personWaiting}>
                  {person.ready ? (
                    <>
                      <PiCheckCircleFill aria-hidden="true" /> {t.ready}
                    </>
                  ) : (
                    <>
                      <PiHourglassMediumFill aria-hidden="true" /> {t.notReady}
                    </>
                  )}
                </p>
              )}
            </div>

            {canRemove && !person.isOwner && (
              <ConfirmButton
                className={scss.iconButton}
                confirmClassName={`${scss.iconButton} ${scss.dangerConfirm}`}
                confirmLabel={t.removeConfirm(person.name.split(" ")[0])}
                aria-label={t.remove(person.name)}
                disabled={remove.isPending}
                pending={remove.isPending && remove.variables === person.id}
                pendingLabel={<span className="visually-hidden">{t.removing(person.name)}</span>}
                onConfirm={() =>
                  remove.mutate(person.id, {
                    onSuccess: () => toast((m) => m.events.participants.removed(person.name)),
                    onError: (error) => toast((m) => getErrorMessage(error, m), "error"),
                  })
                }
              >
                <PiXBold />
              </ConfirmButton>
            )}
          </li>
        ))}
      </ul>

      {event.status === "open" && (
        <p className={scss.panelNote}>
          <strong>{t.readyNoteStrong}</strong>
          {t.readyNote}
        </p>
      )}
    </section>
  );
};

export default ParticipantsList;
