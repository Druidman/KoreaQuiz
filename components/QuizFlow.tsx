"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { displayName, getSupabase } from "@/lib/supabase";
import type { DbQuestion, Selections } from "@/lib/types";
import {
  collectDeviceMetadata,
  enrichDeviceMetadata,
  getDeviceFingerprint,
} from "@/lib/device-metadata";
import { JoinCard } from "@/components/JoinCard";
import { QuizCard } from "@/components/QuizCard";
import { SummaryCard } from "@/components/SummaryCard";

type Stage = "join" | "quiz" | "submitting" | "done";
type Account = { status: "loading" } | { status: "guest" } | { status: "user"; user: User };
function shuffleArr<T>(arr: T[]){
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
      
export function QuizFlow() {
  const [stage, setStage] = useState<Stage>("join");
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<DbQuestion[] | null>(null);
  /** Bumped on restart → QuizCard remounts with fresh index/answers/timer. */
  const [attempt, setAttempt] = useState(0);

  /** Time ran out unanswered: reshuffle and start again from question 1. */
  const restartQuiz = useCallback(() => {
    setError(null);
    setQuestions((prev) => {
      if (!prev) return prev;
      const next = prev.map((q) => ({ ...q, options: q.options ? [...q.options] : q.options }));
      shuffleArr(next);
      next.forEach((q) => shuffleArr(q.options || []));
      return next;
    });
    setAttempt((a) => a + 1);
  }, []);

  // Session shared with 1lounge (cookie on the common domain). Anonymous
  // sessions left over from an earlier attempt don't count as an account.
  const [account, setAccount] = useState<Account>({ status: "loading" });

  useEffect(() => {
    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      queueMicrotask(() => setAccount({ status: "guest" }));
      return;
    }
    // Fires INITIAL_SESSION right away, then on every sign-in / sign-out.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setAccount(user && !user.is_anonymous ? { status: "user", user } : { status: "guest" });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const accountUser = account.status === "user" ? account.user : null;
  const accountId = accountUser?.id ?? null;

  // Already finished on this account (finished_quizes row) → the start button
  // becomes "Zobacz podsumowanie" (no auto-jump; right after a quiz we do jump).
  const [finishedCheckedFor, setFinishedCheckedFor] = useState<string | null>(null);
  const [finishedFor, setFinishedFor] = useState<string | null>(null);
  useEffect(() => {
    if (!accountId) return;
    let cancelled = false;
    getSupabase()
      .from("finished_quizes")
      .select("user_id")
      .eq("user_id", accountId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setFinishedFor(data ? accountId : null);
        setFinishedCheckedFor(accountId);
      });
    return () => {
      cancelled = true;
    };
  }, [accountId]);
  const checkingFinished = !!accountId && finishedCheckedFor !== accountId;
  const alreadyFinished = !!accountId && finishedFor === accountId;
  const showSummary = useCallback(() => setStage("done"), []);

  /**
   * Step 1–3 of the flow: account -> profile row -> fetch questions.
   * Requires a 1lounge login (shared cookie session); nick = account name.
   */
  const startQuiz = useCallback(async (nickname: string) => {
    setError(null);
    try {
      const supabase = getSupabase();

      const uid = accountUser?.id;
      if (!uid) throw new Error("Zaloguj się, żeby zagrać.");

      // One attempt per account. "Finished" = a finished_quizes row, which the
      // check_if_finished_quiz trigger adds once every question has an answer.
      const { data: finished, error: finishedReadError } = await supabase
        .from("finished_quizes")
        .select("user_id")
        .eq("user_id", uid)
        .maybeSingle();
      if (finishedReadError) throw finishedReadError;
      if (finished) {
        // Already done on this account → show the summary instead of a new attempt.
        setStage("done");
        return;
      }

      // Profile may already exist from an earlier, unfinished visit (profiles PK).
      const { data: existingProfile, error: profileReadError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", uid)
        .maybeSingle();
      if (profileReadError) throw profileReadError;

      if (!existingProfile) {
        const baseMeta = collectDeviceMetadata();
        const meta = await enrichDeviceMetadata(baseMeta);
        const { error: profileError } = await supabase.from("profiles").insert({
          nickname: nickname.trim(),
          metadata: { ...meta, device_fingerprint: getDeviceFingerprint() },
        });
        if (profileError) throw profileError;
      }

      const { data, error: questionsError } = await supabase
        .from("questions_with_options")
        .select("*")
        .order("created_at", { ascending: true });
      if (questionsError) throw questionsError;

      // Questions without options are open questions — keep them. Only drop
      // malformed rows (missing id/question text).
      const fetched = (data ?? []).filter(
        (q) => typeof q.id === "string" && typeof q.question === "string" && q.question.length > 0,
      );
      if (fetched.length === 0) {
        throw new Error("Nie znaleziono pytań w bazie. Skontaktuj się z prowadzącym.");
      }

      shuffleArr(fetched)

      setQuestions((fetched as DbQuestion[] | null)?.map((question)=>{shuffleArr(question.options || []); return question;}) || []);
      setStage("quiz");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Coś poszło nie tak. Spróbuj ponownie.");
    }
  }, [accountUser]);

  /** Sign out (shared cookie → also logs out of 1lounge). */
  const signOut = useCallback(async () => {
    setError(null);
    const { error: signOutError } = await getSupabase().auth.signOut();
    if (signOutError) setError(signOutError.message);
    // onAuthStateChange flips `account` to guest → JoinCard shows "Zaloguj się".
  }, []);

  /** Step 4: insert one user_answers row per question. */
  const submitQuiz = useCallback(async (selections: Selections) => {
    setError(null);
    setStage("submitting");
    try {
      const supabase = getSupabase();
      const uid = (await supabase.auth.getUser()).data.user?.id;
      if (!uid) throw new Error("Sesja wygasła. Odśwież stronę i spróbuj ponownie.");

      type AnswerRow = {
        user_id: string;
        question_id: string;
        option_id?: string;
        custom_option_model?: string;
      };
      const rows: AnswerRow[] = Object.entries(selections).flatMap(
        ([questionId, selection]): AnswerRow[] => {
          if (selection.kind === "option") {
            return [{ user_id: uid, question_id: questionId, option_id: selection.optionId }];
          }
          // Timer expiry can sweep past an open question with whitespace-only text —
          // don't insert an empty custom answer.
          const text = selection.text.trim();
          return text.length > 0
            ? [{ user_id: uid, question_id: questionId, custom_option_model: text }]
            : [];
        },
      );
      if (rows.length === 0) throw new Error("Brak odpowiedzi do wysłania.");

      const { error: insertError } = await supabase.from("user_answers").insert(rows);
      if (insertError) throw insertError;

      setStage("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się wysłać odpowiedzi.");
      setStage("quiz");
    }
  }, []);

  if (stage === "done" && accountId) return <SummaryCard userId={accountId} />;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md">
        {error && (
          <div
            role="alert"
            className="relative z-10 mb-4 rounded-[18px_14px_20px_12px] border-[2.5px] border-alert bg-paper px-4 py-3 text-sm font-bold text-ink shadow-[4px_4px_0_var(--color-pink-soft)]"
          >
            {error}
          </div>
        )}
        {stage === "join" && (
          <JoinCard
            onStart={startQuiz}
            onSignOut={signOut}
            finished={alreadyFinished}
            onShowSummary={showSummary}
            loading={account.status === "loading" || checkingFinished}
            accountName={accountUser ? displayName(accountUser) : null}
            accountEmail={accountUser?.email ?? null}
          />
        )}
        {stage !== "join" && questions && (
          <QuizCard
            key={attempt}
            questions={questions}
            busy={stage === "submitting"}
            onSubmit={submitQuiz}
            onRestart={restartQuiz}
          />
        )}
      </div>
    </div>
  );
}
