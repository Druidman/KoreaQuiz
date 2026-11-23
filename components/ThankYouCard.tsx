"use client";

import { HangulSticker, Heart, Highlight, Lightstick, Ribbon, Sparkle } from "@/components/decor";

/** Stage 3: thank-you screen. No way back into the quiz. */
export function ThankYouCard() {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10 text-center">
      {/* stickers on the screen edges, under the content */}
      <HangulSticker
        text="끝!"
        className="bob fixed right-5 top-6 z-0 rotate-[10deg] sm:right-10 sm:top-10"
      />
      <Lightstick
        fill="var(--color-mint)"
        className="bob2 fixed left-5 top-5 z-0 h-20 w-10 rotate-[-16deg] sm:left-10 sm:top-8"
      />
      <Heart
        fill="var(--color-pink)"
        className="bob fixed bottom-12 left-6 z-0 h-11 w-11 rotate-[-6deg] max-[359px]:hidden sm:left-12"
      />
      <Sparkle
        fill="var(--color-lilac)"
        className="bob2 sticker-shadow fixed bottom-8 right-8 z-0 h-9 w-9 rotate-[14deg] sm:right-14"
      />

      <div className="relative z-10 w-full max-w-md">
        <Ribbon className="mx-auto mb-4 h-7 w-24 rotate-[3deg]" />
        <h1 className="font-display text-[32px] leading-tight font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">
          Szacuneczek za <Highlight>odpowiedzi</Highlight>!
        </h1>

        <div className="relative mt-12 rounded-[20px_30px_18px_28px] border-[2.5px] border-ink bg-paper px-6 pb-8 pt-10 shadow-[6px_6px_0_var(--color-pink-soft)] sm:px-10">
          <span
            aria-hidden
            className="pop-in absolute -top-[26px] left-1/2 -ml-[26px] flex h-[52px] w-[52px] items-center justify-center rounded-full border-[2.5px] border-ink bg-mint shadow-[3px_3px_0_var(--color-ink)]"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="var(--color-ink)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="text-xl font-extrabold leading-relaxed text-ink sm:text-2xl">
            Twoje odpowiedzi zostały zapisane.
          </p>
          <p className="mt-3 text-base font-semibold text-ink-soft sm:text-lg">
            Możesz zamknąć tę kartę (zapamiętaj swój nick)
          </p>
        </div>

        
      </div>
    </section>
  );
}
