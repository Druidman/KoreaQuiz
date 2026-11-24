"use client";

import { useEffect, useState } from "react";
import { HangulSticker, Heart, Highlight, Lightstick, Ribbon, Sparkle, Tape } from "@/components/decor";
import { getSupabase } from "@/lib/supabase";
import { LOUNGE_URL } from "@/lib/lounge";
import { loadSummary, type ItemStatus, type QuizSummary } from "@/lib/summary";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; summary: QuizSummary };

/** Headline + Korean flourish by score percentage. */
function verdict(pct: number): { title: string; korean: string } {
  if (pct === 100) return { title: "Perfekcja!", korean: "완벽해요!" };
  if (pct >= 80) return { title: "Świetny wynik!", korean: "대박!" };
  if (pct >= 50) return { title: "Całkiem nieźle!", korean: "좋아요!" };
  return { title: "Następnym razem będzie lepiej!", korean: "화이팅!" };
}

const STATUS_STYLE: Record<ItemStatus, { badge: string; label: string; border: string }> = {
  correct: { badge: "bg-mint", label: "Dobrze", border: "border-mint-deep/40" },
  wrong: { badge: "bg-alert", label: "Źle", border: "border-alert/40" },
  unanswered: { badge: "bg-butter", label: "Bez odpowiedzi", border: "border-ink/20" },
  ungraded: { badge: "bg-lilac", label: "Nieoceniane", border: "border-ink/20" },
};

function StatusIcon({ status }: { status: ItemStatus }) {
  const stroke = status === "wrong" ? "#fff" : "var(--color-ink)";
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink shadow-[2px_2px_0_var(--color-ink)] ${STATUS_STYLE[status].badge}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        {status === "correct" && (
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {status === "wrong" && (
          <path d="M7 7l10 10M17 7L7 17" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        )}
        {(status === "unanswered" || status === "ungraded") && (
          <path d="M7 12h10" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        )}
      </svg>
    </span>
  );
}

/** Circular score meter (pink arc on blush track). */
function ScoreRing({ correct, total }: { correct: number; total: number }) {
  const pct = total > 0 ? correct / total : 0;
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto h-[148px] w-[148px]">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="64" cy="64" r={r} fill="var(--color-blush)" stroke="var(--color-ink)" strokeWidth="2.5" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="var(--color-pink)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${pct * c} ${c}`}
          className="transition-[stroke-dasharray] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-extrabold tabular-nums text-ink">
          {correct}/{total}
        </span>
        <span className="text-sm font-extrabold tabular-nums text-ink-soft">{Math.round(pct * 100)}%</span>
      </div>
    </div>
  );
}

/** Stage 3: score + question-by-question review (correct answers unlocked by finished_quizes). */
export function SummaryCard({ userId }: { userId: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    loadSummary(getSupabase(), userId)
      .then((summary) => {
        if (!cancelled) setState({ status: "ready", summary });
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: e instanceof Error ? e.message : "Nie udało się wczytać wyników.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <section className="relative px-4 py-10 sm:py-16">
      {/* stickers on the screen edges, under the content */}
      <HangulSticker text="끝!" className="bob fixed right-5 top-6 z-0 rotate-[10deg] sm:right-10 sm:top-10" />
      <Lightstick
        fill="var(--color-mint)"
        className="bob2 fixed left-5 top-5 z-0 h-20 w-10 rotate-[-16deg] max-sm:hidden sm:left-10 sm:top-8"
      />
      <Heart
        fill="var(--color-pink)"
        className="bob fixed bottom-12 left-6 z-0 h-11 w-11 rotate-[-6deg] max-sm:hidden sm:left-12"
      />
      <Sparkle
        fill="var(--color-lilac)"
        className="bob2 sticker-shadow fixed bottom-8 right-8 z-0 h-9 w-9 rotate-[14deg] max-sm:hidden sm:right-14"
      />

      <div className="relative z-10 mx-auto w-full max-w-xl">
        <Ribbon className="mx-auto mb-4 h-7 w-24 rotate-[3deg]" />
        <h1 className="text-center font-display text-[32px] leading-tight font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">
          Szacuneczek za <Highlight>odpowiedzi</Highlight>!
        </h1>

        {state.status === "loading" && (
          <p role="status" className="mt-10 text-center text-base font-bold text-ink-soft">
            Liczę wynik…
          </p>
        )}

        {state.status === "error" && (
          <div
            role="alert"
            className="mt-10 rounded-[18px_14px_20px_12px] border-[2.5px] border-alert bg-paper px-4 py-3 text-sm font-bold text-ink shadow-[4px_4px_0_var(--color-pink-soft)]"
          >
            Odpowiedzi są zapisane, ale nie udało się wczytać podsumowania: {state.message}
          </div>
        )}

        {state.status === "ready" && <SummaryBody summary={state.summary} />}

        {LOUNGE_URL && (
          <div className="mt-10 flex justify-center">
            <a
              href={`${LOUNGE_URL}/`}
              className="inline-flex items-center gap-2 rounded-[14px_10px_16px_10px] border-[2.5px] border-ink bg-paper px-5 py-3 text-base font-extrabold text-ink no-underline shadow-[4px_4px_0_var(--color-pink-soft)] transition hover:bg-blush active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
              Wróć do 1lounge
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryBody({ summary }: { summary: QuizSummary }) {
  const { items, correct, graded, revealed } = summary;
  const wrong = items.filter((i) => i.status === "wrong").length;
  const pct = graded > 0 ? Math.round((correct / graded) * 100) : 0;
  const { title, korean } = verdict(pct);

  return (
    <>
      {/* score card */}
      <div className="relative mt-12 rounded-[20px_30px_18px_28px] border-[2.5px] border-ink bg-paper px-6 pb-7 pt-9 text-center shadow-[6px_6px_0_var(--color-pink-soft)] sm:px-10">
        <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-[-4deg]" />
        {revealed && graded > 0 ? (
          <>
            <ScoreRing correct={correct} total={graded} />
            <p className="mt-5 font-display text-2xl font-extrabold text-ink sm:text-3xl">{title}</p>
            <p className="mt-1 text-lg font-extrabold text-pink-deep" lang="ko">
              {korean}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              <span className="rounded-full border-[2.5px] border-ink bg-mint px-3.5 py-1 text-sm font-extrabold text-ink">
                Dobrze: {correct}
              </span>
              <span className="rounded-full border-[2.5px] border-ink bg-alert px-3.5 py-1 text-sm font-extrabold text-white">
                Źle: {wrong}
              </span>
            </div>
          </>
        ) : (
          <>
            <p className="text-xl font-extrabold leading-relaxed text-ink sm:text-2xl">
              Twoje odpowiedzi zostały zapisane.
            </p>
            <p className="mt-3 text-base font-semibold text-ink-soft">
              Poprawne odpowiedzi pojawią się tutaj, gdy quiz zostanie oznaczony jako ukończony.
            </p>
          </>
        )}
      </div>

      {/* question-by-question */}
      <h2 className="mt-12 mb-4 font-display text-2xl font-extrabold tracking-[-0.02em] text-ink">
        Pytanie po <Highlight>pytaniu</Highlight>
      </h2>
      <ol className="m-0 grid list-none gap-3.5 p-0">
        {items.map((item, i) => {
          const style = STATUS_STYLE[item.status];
          const showCorrect = revealed && item.status !== "correct" && item.correctAnswers.length > 0;
          return (
            <li
              key={item.question.id}
              className={`rounded-[18px_14px_20px_12px] border-[2.5px] bg-paper p-4 shadow-[4px_4px_0_var(--color-pink-soft)] sm:p-5 ${style.border}`}
            >
              <div className="flex items-start gap-3">
                <StatusIcon status={item.status} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold tracking-wide text-ink-soft uppercase">
                    Pytanie {i + 1} · <span className="sr-only">wynik: </span>
                    {style.label}
                  </p>
                  <p className="mt-1 text-base font-extrabold leading-snug text-ink sm:text-lg">
                    {item.question.question}
                  </p>

                  <dl className="mt-3 grid gap-2 text-sm">
                    <div className="rounded-[12px_9px_13px_9px] bg-blush px-3 py-2">
                      <dt className="font-bold text-ink-soft">Twoja odpowiedź</dt>
                      <dd
                        className={`m-0 font-extrabold break-words ${
                          item.status === "wrong" ? "text-alert line-through decoration-2" : "text-ink"
                        }`}
                      >
                        {item.userAnswer ?? "—"}
                      </dd>
                    </div>
                    {showCorrect && (
                      <div className="rounded-[12px_9px_13px_9px] border-2 border-mint-deep/30 bg-mint/15 px-3 py-2">
                        <dt className="font-bold text-mint-deep">
                          {item.correctAnswers.length > 1 ? "Poprawne odpowiedzi" : "Poprawna odpowiedź"}
                        </dt>
                        <dd className="m-0 font-extrabold break-words text-ink">
                          {item.correctAnswers.join(" · ")}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
