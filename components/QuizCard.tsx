"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DbQuestion, Selection, Selections } from "@/lib/types";
import { isAnswered } from "@/lib/types";
import { HangulSticker, Heart, Ribbon, ShapeMarker, Sparkle, Tape } from "@/components/decor";

/** Fallback when a question row somehow lacks a usable duration (seconds). */
const FALLBACK_DURATION_SEC = 30;
/** Remaining time below which the countdown pill turns red and pulses. */
const URGENT_SECONDS = 5;
/** Max length of an open-question answer (textarea also enforces it). */
const CUSTOM_MAX_LEN = 1000;

function durationOf(question: DbQuestion | undefined): number {
  const raw = question?.duration;
  return typeof raw === "number" && Number.isFinite(raw)
    ? Math.max(1, Math.floor(raw))
    : FALLBACK_DURATION_SEC;
}

/** No options (or a malformed options payload) means it's an open question. */
function isOpenQuestion(question: DbQuestion | undefined): boolean {
  return !Array.isArray(question?.options) || question.options.length === 0;
}

/**
 * Stage 2: one question at a time, forward-only. Each question has its own
 * countdown (`duration` seconds from the questions table) — expiry auto-advances,
 * or auto-submits on the last question. Closed questions are answered with
 * option buttons; open questions (no options in the DB) with a free-text area.
 * Answers stay changeable while the question is on screen and are
 * batch-inserted into user_answers on submit.
 */
export function QuizCard({
  questions,
  busy,
  onSubmit,
}: {
  questions: DbQuestion[];
  busy: boolean;
  onSubmit: (selections: Selections) => Promise<void>;
}) {
  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<Selections>({});
  const [secondsLeft, setSecondsLeft] = useState(() => durationOf(questions[0]));

  const question = questions[index];
  const durationSec = durationOf(question);
  const isLast = index === questions.length - 1;
  const open = isOpenQuestion(question);
  const answeredCount = Object.values(selections).filter(isAnswered).length;
  const urgent = secondsLeft <= URGENT_SECONDS;

  const selectionForQuestion = question ? selections[question.id] : undefined;
  const answeredForQuestion = isAnswered(selectionForQuestion);
  const customText = !open
    ? ""
    : selectionForQuestion?.kind === "custom"
      ? selectionForQuestion.text
      : "";

  // Reset the countdown whenever the question changes. Done during render (the
  // React-documented "adjust state on prop change" pattern) instead of inside the
  // timer effect, where a synchronous setState is an anti-pattern the lint rule
  // (react-hooks/set-state-in-effect) rejects.
  const [countdownQuestionId, setCountdownQuestionId] = useState(question.id);
  if (countdownQuestionId !== question.id) {
    setCountdownQuestionId(question.id);
    setSecondsLeft(durationSec);
  }

  // Restart the countdown when a submit cycle ends back on this screen (insert
  // failed -> QuizFlow returns to the quiz stage). Without this the last question
  // would be left with a dead 0s timer and no further auto-submit.
  const [timerGen, setTimerGen] = useState(0);
  const [prevBusy, setPrevBusy] = useState(busy);
  if (prevBusy !== busy) {
    setPrevBusy(busy);
    if (prevBusy) {
      setTimerGen((g) => g + 1);
      setSecondsLeft(durationSec);
    }
  }

  // Latest values for the timer's expiry callback (closures would go stale).
  const latestRef = useRef({ busy, isLast, selections });
  useEffect(() => {
    latestRef.current = { busy, isLast, selections };
  });

  // Guards so a Dalej click and a timer tick landing in the same instant
  // can't advance twice, and submit can't be triggered concurrently.
  const advancingRef = useRef(false);
  const submittingRef = useRef(false);

  // Selecting again simply overwrites — the choice stays editable until submit.
  const choose = useCallback(
    (optionId: string) => {
      const selection: Selection = { kind: "option", optionId };
      setSelections((prev) => ({ ...prev, [question.id]: selection }));
    },
    [question.id],
  );

  // Open question: every keystroke overwrites the buffered answer. Whitespace is
  // trimmed (and empties dropped) when the rows are built for the insert.
  const chooseCustom = useCallback(
    (text: string) => {
      const selection: Selection = { kind: "custom", text };
      setSelections((prev) => ({ ...prev, [question.id]: selection }));
    },
    [question.id],
  );

  const tryAdvance = useCallback(() => {
    if (advancingRef.current || latestRef.current.busy) return;
    advancingRef.current = true;
    setIndex((i) => Math.min(i + 1, questions.length - 1));
  }, [questions.length]);

  const trySubmit = useCallback(() => {
    if (submittingRef.current || latestRef.current.busy) return;
    submittingRef.current = true;
    // submitQuiz handles its own errors, but never let this ref stay stuck.
    Promise.resolve(onSubmit(latestRef.current.selections))
      .catch(() => {})
      .finally(() => {
        submittingRef.current = false;
      });
  }, [onSubmit]);

  // Per-question countdown, deadline-based so it stays accurate.
  useEffect(() => {
    advancingRef.current = false;
    const deadline = Date.now() + durationSec * 1000;
    const interval = setInterval(() => {
      const remainingMs = deadline - Date.now();
      if (remainingMs > 0) {
        setSecondsLeft(Math.ceil(remainingMs / 1000));
        return;
      }
      clearInterval(interval);
      setSecondsLeft(0);
      // Expiry while a submit is in flight is suppressed — the submit flow owns the UI.
      if (latestRef.current.busy) return;
      if (latestRef.current.isLast) trySubmit();
      else tryAdvance();
    }, 250);
    return () => clearInterval(interval);
  }, [durationSec, index, timerGen, tryAdvance, trySubmit]);

  const progressPct = ((index + (answeredForQuestion ? 1 : 0)) / questions.length) * 100;

  return (
    <section className="relative">
      {/* stickers on the screen edges, under the content */}
      <HangulSticker
        text="정답?"
        bg="bg-mint"
        className="bob fixed right-4 top-5 z-0 rotate-[7deg] sm:right-8 sm:top-8"
      />
      <Heart className="bob2 fixed left-4 top-5 z-0 h-11 w-11 rotate-[-12deg] sm:left-8 sm:top-8" />
      <Ribbon
        color="var(--color-lilac)"
        className="fixed bottom-6 left-3 z-0 h-7 w-24 rotate-[-4deg] max-[359px]:hidden sm:left-8"
      />

      <div className="relative z-10">
        {/* progress row */}
        <div className="mb-4 flex items-center gap-3">
          <Sparkle className="h-6 w-6 shrink-0" />
          <div className="relative h-3.5 flex-1 overflow-hidden rounded-full border-[2.5px] border-ink bg-paper">
            <div
              className={`h-full bg-pink transition-all duration-300 ${
                progressPct > 0 && progressPct < 100 ? "border-r-[2.5px] border-ink" : ""
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-sm font-extrabold tabular-nums text-ink">
            {index + 1}/{questions.length}
          </span>
        </div>

        <div className="relative rounded-[28px_20px_30px_18px] border-[2.5px] border-ink bg-paper p-5 shadow-[6px_6px_0_var(--color-pink-soft)] sm:p-7">
          <Tape className="-top-3 left-6 rotate-[-6deg]" />

          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-extrabold tracking-[-0.02em] text-pink-deep">
              Pytanie {index + 1}
            </h2>
            <span
              role="timer"
              aria-label={`Pozostały czas: ${secondsLeft} sekund`}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border-[2.5px] border-ink px-3 py-1 text-sm font-extrabold tabular-nums transition-colors ${
                urgent
                  ? "pulse-urgent bg-alert text-white shadow-[3px_3px_0_var(--color-ink)]"
                  : "bg-paper text-ink"
              }`}
            >
              <span
                aria-hidden
                className={`h-2.5 w-2.5 rounded-full border-2 border-ink ${urgent ? "bg-butter" : "bg-mint"}`}
              />
              {secondsLeft}s
            </span>
          </div>
          <p className="mb-5 text-xl font-extrabold leading-snug text-ink sm:text-2xl">
            {question.question}
          </p>

          {open ? (
            <div>
              <label htmlFor={`answer-${question.id}`} className="sr-only">
                Twoja odpowiedź
              </label>
              <textarea
                id={`answer-${question.id}`}
                value={customText}
                onChange={(e) => chooseCustom(e.target.value)}
                disabled={busy}
                rows={4}
                maxLength={CUSTOM_MAX_LEN}
                placeholder="Wpisz swoją odpowiedź…"
                className="w-full resize-none rounded-[16px_12px_18px_12px] border-[2.5px] border-ink/20 bg-blush px-4 py-3 text-base font-bold text-ink transition placeholder:text-ink/45 focus:border-pink-deep focus:bg-paper focus:shadow-[4px_4px_0_var(--color-pink-soft)] focus:outline-none disabled:opacity-50 sm:text-lg"
              />
              <div className="mt-1 text-right text-xs font-bold tabular-nums text-ink-soft">
                {customText.length}/{CUSTOM_MAX_LEN}
              </div>
            </div>
          ) : (
            <div className="grid gap-2.5">
              {question.options!.map((option, i) => {
                const selected =
                  selectionForQuestion?.kind === "option" && selectionForQuestion.optionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={busy}
                    onClick={() => choose(option.id)}
                    aria-pressed={selected}
                    className={`flex w-full items-start gap-3 rounded-[18px_14px_20px_12px] border-[2.5px] px-4 py-3 text-left text-base font-bold transition sm:text-lg ${
                      selected
                        ? "border-ink bg-pink-deep text-white shadow-[4px_4px_0_var(--color-ink)]"
                        : "border-ink/20 bg-blush text-ink enabled:hover:-translate-y-0.5 enabled:hover:border-ink enabled:hover:bg-paper enabled:hover:shadow-[4px_4px_0_var(--color-pink-soft)] active:translate-y-0"
                    }`}
                  >
                    <ShapeMarker index={i} selected={selected} />
                    <span className="pt-0.5">{option.option}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-ink-soft">
            {answeredCount}/{questions.length} odpowiedzi
          </span>

          {isLast ? (
            <button
              type="button"
              disabled={answeredCount === 0 || busy}
              onClick={trySubmit}
              className="rounded-[12px_18px_14px_18px] border-[2.5px] border-ink bg-ink px-5 py-3 text-base font-extrabold text-white shadow-[4px_4px_0_var(--color-pink)] transition enabled:hover:bg-[#3a2e57] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-pink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:text-lg"
            >
              {busy ? "Wysyłam…" : "Wyślij odpowiedzi"}
            </button>
          ) : (
            <button
              type="button"
              disabled={!answeredForQuestion || busy}
              onClick={tryAdvance}
              className="flex items-center gap-2 rounded-[18px_12px_18px_14px] border-[2.5px] border-ink bg-pink-deep px-5 py-3 text-base font-extrabold text-white shadow-[4px_4px_0_var(--color-ink)] transition enabled:hover:bg-pink-press active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:text-lg"
            >
              Dalej
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                <path
                  d="M5 12h13M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
