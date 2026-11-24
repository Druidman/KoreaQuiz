"use client";

import { useState } from "react";
import { Blob, HangulSticker, Highlight, Lightstick, Sparkle, Star, Tape } from "@/components/decor";
import { LOGIN_URL, LOUNGE_URL } from "@/lib/lounge";


/** Send the user to 1lounge login, asking it to bring them back here afterwards. */
function goToLogin(e: React.MouseEvent<HTMLAnchorElement>) {
  if (!LOGIN_URL) return;
  e.preventDefault();
  // Cross-app navigation (different origin), so not router.push().
  e.currentTarget.href = `${LOGIN_URL}?next=${encodeURIComponent(window.location.href)}`;
  window.location.href = e.currentTarget.href;
}

/**
 * Stage 1: identity. Playing requires a 1lounge login (shared cookie
 * session): logged in → "Grasz jako …" + start; guest → "Zaloguj się".
 * Profile insert happens in QuizFlow.startQuiz() on submit.
 */
export function JoinCard({
  onStart,
  onSignOut,
  finished = false,
  onShowSummary,
  loading = false,
  accountName = null,
  accountEmail = null,
}: {
  onStart: (nickname: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  /** Account already has a finished_quizes row → button opens the summary. */
  finished?: boolean;
  onShowSummary: () => void;
  /** Session still being read – don't flash the login button. */
  loading?: boolean;
  /** Display name of the logged-in account, or null for guests. */
  accountName?: string | null;
  accountEmail?: string | null;
}) {
  const [busy, setBusy] = useState(false);

  const loggedIn = !!accountName;
  const canSubmit = !busy && !loading && loggedIn;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !accountName) return;
    if (finished) {
      onShowSummary();
      return;
    }
    setBusy(true);
    await onStart(accountName);
    setBusy(false);
  }

  async function handleSignOut() {
    setBusy(true);
    await onSignOut();
    setBusy(false);
  }

  const initial = (accountName ?? "").trim().charAt(0).toUpperCase();

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
        {LOUNGE_URL && (
          <div className="mb-5 flex justify-center">
            <a
              href={`${LOUNGE_URL}/`}
              className="inline-flex items-center gap-2 rounded-[14px_10px_16px_10px] border-[2.5px] border-ink bg-paper px-4 py-2 text-sm font-extrabold text-ink no-underline shadow-[3px_3px_0_var(--color-pink-soft)] transition hover:bg-blush active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
              1lounge
            </a>
          </div>
        )}

        <h1 className="mb-6 text-center font-display text-4xl font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">
          <span className="relative inline-block">
            Koreański <Highlight>quiz</Highlight>
            <Sparkle className="absolute -right-6 -top-4 h-7 w-7 rotate-[12deg]" />
          </span>
        </h1>

        <form
          onSubmit={handleSubmit}
          className="relative rounded-[28px_20px_30px_18px] border-[2.5px] border-ink bg-paper p-6 shadow-[6px_6px_0_var(--color-pink-soft)] sm:p-8"
        >
          <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-[-5deg]" />

          {loading ? (
            <p role="status" className="py-6 text-center text-base font-bold text-ink-soft">
              Sprawdzam konto…
            </p>
          ) : loggedIn ? (
            <>
              <p className="mb-3 block text-lg font-extrabold text-pink-deep">
                Grasz <Highlight className="text-ink">jako</Highlight>
              </p>
              <div className="flex items-stretch gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[16px_12px_18px_12px] border-[2.5px] border-ink/20 bg-blush px-3 py-3">
                  <span
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px_9px_13px_9px] border-[2.5px] border-ink bg-pink-deep text-lg font-extrabold text-white"
                  >
                    {initial}
                  </span>
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-base font-extrabold text-ink">{accountName}</span>
                    {accountEmail && accountEmail !== accountName && (
                      <span className="truncate text-sm font-semibold text-ink-soft">{accountEmail}</span>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={busy}
                  aria-label="Wyloguj się"
                  title="Wyloguj się"
                  className="flex w-14 shrink-0 cursor-pointer items-center justify-center rounded-[14px_12px_16px_12px] border-[2.5px] border-ink bg-paper text-ink shadow-[3px_3px_0_var(--color-pink-soft)] transition enabled:hover:bg-blush active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
                    <path d="M10 17l5-5-5-5M15 12H4" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mb-1 block text-lg font-extrabold text-pink-deep">
                Najpierw się <Highlight className="text-ink">zaloguj</Highlight>
              </p>
              <p className="mb-4 text-sm font-semibold text-ink-soft">
                Do quizu potrzebne jest szkolne konto 1lounge.
              </p>
              {LOGIN_URL ? (
                <a
                  href={LOGIN_URL}
                  onClick={goToLogin}
                  className="flex w-full items-center justify-center gap-2.5 rounded-[18px_12px_18px_14px] border-[2.5px] border-ink bg-pink-deep px-5 py-3.5 text-base font-extrabold text-white no-underline shadow-[4px_4px_0_var(--color-ink)] transition hover:bg-pink-press active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-ink)] sm:text-lg"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
                  </svg>
                  Zaloguj się
                </a>
              ) : (
                <p role="alert" className="text-sm font-bold text-alert">
                  Brak adresu 1lounge (NEXT_PUBLIC_BASE_LOUNGE_DOMAIN).
                </p>
              )}
            </>
          )}

          {loggedIn && (
            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-5 w-full rounded-[18px_12px_18px_14px] border-[2.5px] border-ink bg-pink-deep px-5 py-3.5 text-base font-extrabold text-white shadow-[4px_4px_0_var(--color-ink)] transition enabled:hover:bg-pink-press active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:text-lg"
            >
              {finished ? "Zobacz podsumowanie" : busy ? "Wchodzę do quizu…" : "Zaczynamy!"}
            </button>
          )}
        </form>

        <p className="mt-5 text-center text-sm font-bold text-ink-soft">
          10 pytań · Brak odpowiedzi w czasie = quiz od nowa · nie da się wrócić do poprzednich
        </p>
      </div>
    </section>
  );
}
