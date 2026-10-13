"use client";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import { PiArrowRightBold, PiArrowsClockwiseBold, PiPlusBold, PiShuffleBold, PiXBold } from "react-icons/pi";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import { useI18n } from "@/i18n/I18nProvider";
import { cleanName, DEMO_MAX, DEMO_MIN, DEMO_NAME_MAX, drawPairs, type NameProblem } from "@/lib/demo/draw";
import scss from "./tryDraw.module.scss";

type Phase = "idle" | "shuffling" | "done";

/** How long the boxes tumble before the pairs appear */
const SHUFFLE_MS = 1100;
const TONES = ["blue", "purple", "crimson", "green", "amber", "teal", "red", "snow"] as const;

/** A random little throw for each box while they tumble */
const throwFor = () => ({
  "--dx": `${Math.round((Math.random() - 0.5) * 70)}px`,
  "--dy": `${Math.round((Math.random() - 0.5) * 36)}px`,
  "--r": `${Math.round((Math.random() - 0.5) * 40)}deg`,
});

/**
 * The demo draw. Names are chips; "Draw names" wraps each one in a gift box, tumbles
 * the boxes, then lays out who gives to whom — a ribbon drawing from giver to receiver.
 * With reduced motion the pairs simply appear.
 */
const TryDrawPlayground = () => {
  const { m } = useI18n();
  const t = m.landing.tryDraw;
  const [names, setNames] = useState<string[]>(() => t.sample);
  const [draft, setDraft] = useState("");
  const [problem, setProblem] = useState<NameProblem | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pairs, setPairs] = useState<[string, string][]>([]);
  const [throws, setThrows] = useState<CSSProperties[]>([]);
  const [round, setRound] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const tone = (name: string) => TONES[Math.max(0, names.indexOf(name)) % TONES.length];

  const edit = (next: string[]) => {
    clearTimeout(timer.current);
    setNames(next);
    setPhase("idle");
    setPairs([]);
  };

  const add = (event: FormEvent) => {
    event.preventDefault();
    const result = cleanName(draft, names);
    if ("problem" in result) {
      setProblem(result.problem === "empty" ? null : result.problem);
      return;
    }
    edit([...names, result.name]);
    setDraft("");
    setProblem(null);
  };

  const draw = () => {
    clearTimeout(timer.current);
    const next = drawPairs(names);
    setRound((r) => r + 1);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPairs(next);
      setPhase("done");
      return;
    }
    setThrows(names.map(() => throwFor() as CSSProperties));
    setPhase("shuffling");
    setPairs([]);
    timer.current = setTimeout(() => {
      setPairs(next);
      setPhase("done");
    }, SHUFFLE_MS);
  };

  const tooFew = names.length < DEMO_MIN;
  const full = names.length >= DEMO_MAX;
  const message =
    problem === "duplicate" ? t.duplicate : problem === "full" || full ? t.full(DEMO_MAX) : tooFew ? t.needMore(DEMO_MIN) : null;

  return (
    <div className={`surface-card ${scss.playground}`}>
      {/* ---------- Names ---------- */}
      <div className={scss.names}>
        <ul className={scss.chips} aria-label={t.addLabel}>
          {names.map((name) => (
            <li key={name} className={scss.chip}>
              <span className={`${scss.initial} ${scss[tone(name)]}`} aria-hidden="true">
                {name.charAt(0).toUpperCase()}
              </span>
              <span className={scss.chipName}>{name}</span>
              <button
                type="button"
                className={`touch-target ${scss.remove}`}
                onClick={() => edit(names.filter((other) => other !== name))}
                aria-label={t.remove(name)}
                disabled={phase === "shuffling"}
              >
                <PiXBold aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>

        <form className={scss.addRow} onSubmit={add} noValidate>
          <label htmlFor="try-name" className="visually-hidden">
            {t.addLabel}
          </label>
          <input
            id="try-name"
            className={`input ${scss.input}`}
            placeholder={t.placeholder}
            value={draft}
            maxLength={DEMO_NAME_MAX}
            autoComplete="off"
            disabled={full || phase === "shuffling"}
            aria-invalid={problem ? true : undefined}
            aria-describedby="try-hint"
            onChange={(event) => {
              setDraft(event.target.value);
              setProblem(null);
            }}
          />
          <button type="submit" className="btn btn-outline" disabled={full || !draft.trim() || phase === "shuffling"}>
            <PiPlusBold aria-hidden="true" />
            {t.add}
          </button>
        </form>
        <p id="try-hint" className={`${scss.hint} ${problem ? scss.hintError : ""}`} role={problem ? "alert" : undefined}>
          <span>{t.count(names.length, DEMO_MAX)}</span>
          {message && <span>· {message}</span>}
        </p>
      </div>

      {/* ---------- Stage ---------- */}
      <div className={scss.board} data-phase={phase}>
        {phase !== "done" ? (
          <ul key={`boxes-${round}`} className={scss.boxes} aria-hidden="true">
            {names.map((name, i) => (
              <li key={name} className={scss.box} style={phase === "shuffling" ? { ...throws[i], animationDelay: `${i * 40}ms` } : undefined}>
                {phase === "shuffling" ? (
                  <GiftBox size={52} />
                ) : (
                  <>
                    <span className={`${scss.initial} ${scss.initialLarge} ${scss[tone(name)]}`}>{name.charAt(0).toUpperCase()}</span>
                    <span className={scss.boxName}>{name}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <ol key={`pairs-${round}`} className={scss.pairs}>
            {pairs.map(([giver, receiver], i) => (
              <li key={giver} className={scss.pair} style={{ "--i": i } as CSSProperties} aria-label={t.pairLabel(giver, receiver)}>
                <span className={scss.person} aria-hidden="true">
                  <span className={`${scss.initial} ${scss[tone(giver)]}`}>{giver.charAt(0).toUpperCase()}</span>
                  <span className={scss.personName}>{giver}</span>
                </span>
                <span className={scss.ribbon} aria-hidden="true">
                  <span className={scss.ribbonLine} />
                  <span className={scss.ribbonGift}>
                    <GiftBox size={26} />
                  </span>
                  <PiArrowRightBold className={scss.ribbonArrow} />
                </span>
                <span className={`${scss.person} ${scss.receiver}`} aria-hidden="true">
                  <span className={`${scss.initial} ${scss[tone(receiver)]}`}>{receiver.charAt(0).toUpperCase()}</span>
                  <span className={scss.personName}>{receiver}</span>
                </span>
              </li>
            ))}
          </ol>
        )}

        <div className={scss.actions}>
          {phase === "done" ? (
            <>
              <button type="button" className="btn btn-outline" onClick={draw}>
                <PiArrowsClockwiseBold aria-hidden="true" />
                {t.again}
              </button>
              <Link href="/signup" className="btn btn-primary btn-glow">
                {t.cta}
                <PiArrowRightBold className="icon-nudge" aria-hidden="true" />
              </Link>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-lg btn-glow"
              onClick={draw}
              disabled={tooFew || phase === "shuffling"}
              aria-busy={phase === "shuffling"}
            >
              {phase === "shuffling" ? <span className="spinner" aria-hidden="true" /> : <PiShuffleBold aria-hidden="true" />}
              {phase === "shuffling" ? t.shuffling : t.draw}
            </button>
          )}
        </div>

        <p className={scss.note}>{t.note}</p>
        <p className="visually-hidden" role="status">
          {phase === "done" ? t.result(pairs.length) : phase === "shuffling" ? t.shuffling : ""}
        </p>
      </div>
    </div>
  );
};

export default TryDrawPlayground;
