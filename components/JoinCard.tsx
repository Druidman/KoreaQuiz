"use client";

import { useState } from "react";
import { Blob, HangulSticker, Highlight, Lightstick, Sparkle, Star, Tape } from "@/components/decor";

/**
 * Stage 1: nickname entry. The anonymous sign-in + profile insert happen in
 * QuizFlow.startQuiz() once the participant submits this form.
 */
export function JoinCard({ onStart }: { onStart: (nickname: string) => Promise<void> }) {
  const [nickname, setNickname] = useState("");
  const [busy, setBusy] = useState(false);

  const canSubmit = nickname.trim().length >= 2 && !busy;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    await onStart(nickname);
    setBusy(false);
  }

  return (
    <section className="relative">
      {/* stickers on the screen edges, under the content */}
      <HangulSticker
        text="퀴즈"
        className="bob fixed left-4 top-6 z-0 rotate-[-9deg] sm:left-8 sm:top-8"
      />
      <Lightstick className="bob2 fixed right-5 top-5 z-0 h-20 w-10 rotate-[16deg] sm:right-10 sm:top-8" />
      <Blob className="fixed -bottom-10 -left-12 z-0 h-32 w-40 rotate-[-10deg] max-[359px]:hidden" />
      <Star className="bob fixed bottom-10 right-6 z-0 h-12 w-12 rotate-[8deg] max-[359px]:hidden" />

      <div className="relative z-10">
        <h1 className="mb-6 text-center font-display text-4xl font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">
          <span className="relative inline-block">
            Skibidi <Highlight>quiz</Highlight>
            <Sparkle className="absolute -right-6 -top-4 h-7 w-7 rotate-[12deg]" />
          </span>
        </h1>

        <form
          onSubmit={handleSubmit}
          className="relative rounded-[28px_20px_30px_18px] border-[2.5px] border-ink bg-paper p-6 shadow-[6px_6px_0_var(--color-pink-soft)] sm:p-8"
        >
          <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-[-5deg]" />

          <label htmlFor="nickname" className="mb-1 block text-lg font-extrabold text-pink-deep">
            Twój <Highlight className="text-ink">nick</Highlight>
          </label>
          <p className="mb-4 text-sm font-semibold text-ink-soft">
            Tak żebym ciebie mógł rozpoznać bo Pan będzie chciał odpowiedzi
          </p>

          <input
            id="nickname"
            name="nickname"
            type="text"
            required
            minLength={2}
            maxLength={60}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="np. alek_w5a"
            className="w-full rounded-[16px_12px_18px_12px] border-[2.5px] border-ink/20 bg-blush px-4 py-3 text-base font-bold text-ink transition placeholder:text-ink/45 focus:border-pink-deep focus:bg-paper focus:shadow-[4px_4px_0_var(--color-pink-soft)] focus:outline-none"
          />

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-5 w-full rounded-[18px_12px_18px_14px] border-[2.5px] border-ink bg-pink-deep px-5 py-3.5 text-base font-extrabold text-white shadow-[4px_4px_0_var(--color-ink)] transition enabled:hover:bg-pink-press active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:text-lg"
          >
            {busy ? "Wchodzę do quizu…" : "Zaczynamy!"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm font-bold text-ink-soft">
          10 pytań · Uważaj na czas · nie da się wrócić do poprzednich
        </p>
      </div>
    </section>
  );
}
