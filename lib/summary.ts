import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbQuestion, UserAnswerRow } from "@/lib/types";

/** Row of public.correct_answers (readable only once finished_quizes has the user). */
export interface CorrectAnswerRow {
  question_id: string;
  correct_option_id: string | null;
  correct_option_model: string | null;
}

export type ItemStatus = "correct" | "wrong" | "unanswered" | "ungraded";

export interface SummaryItem {
  question: DbQuestion;
  /** Text of what the user answered (option label or free text), null if none. */
  userAnswer: string | null;
  /** Accepted answers as text (option labels / model answers). */
  correctAnswers: string[];
  status: ItemStatus;
}

export interface QuizSummary {
  items: SummaryItem[];
  correct: number;
  /** Questions that have a correct answer defined (denominator of the score). */
  graded: number;
  /** false → correct_answers came back empty (not flagged as finished yet / RLS). */
  revealed: boolean;
}

/** Lenient comparison for open answers: case, spacing and trailing punctuation don't matter. */
function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .toLocaleLowerCase("pl")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.!?,;:]+$/u, "")
    .trim();
}

export async function loadSummary(supabase: SupabaseClient, userId: string): Promise<QuizSummary> {
  const [questionsRes, answersRes, correctRes] = await Promise.all([
    supabase.from("questions_with_options").select("*").order("created_at", { ascending: true }),
    supabase.from("user_answers").select("*").eq("user_id", userId),
    supabase.from("correct_answers").select("question_id, correct_option_id, correct_option_model"),
  ]);
  if (questionsRes.error) throw questionsRes.error;
  if (answersRes.error) throw answersRes.error;
  if (correctRes.error) throw correctRes.error;

  const questions = (questionsRes.data ?? []) as DbQuestion[];
  const answers = (answersRes.data ?? []) as UserAnswerRow[];
  const correctRows = (correctRes.data ?? []) as CorrectAnswerRow[];
  const revealed = correctRows.length > 0;

  const answerByQuestion = new Map(answers.map((a) => [a.question_id, a]));
  const correctByQuestion = new Map<string, CorrectAnswerRow[]>();
  for (const row of correctRows) {
    const list = correctByQuestion.get(row.question_id) ?? [];
    list.push(row);
    correctByQuestion.set(row.question_id, list);
  }

  let correct = 0;
  let graded = 0;

  const items = questions.map((question): SummaryItem => {
    const options = Array.isArray(question.options) ? question.options : [];
    const labelOf = (id: string | null) => options.find((o) => o.id === id)?.option ?? null;

    const answer = answerByQuestion.get(question.id);
    const userAnswer = answer
      ? answer.option_id
        ? labelOf(answer.option_id)
        : answer.custom_option_model
      : null;

    const accepted = correctByQuestion.get(question.id) ?? [];
    const correctAnswers = accepted
      .map((c) => (c.correct_option_id ? labelOf(c.correct_option_id) : c.correct_option_model))
      .filter((t): t is string => !!t);

    let status: ItemStatus;
    if (accepted.length === 0) {
      status = answer ? "ungraded" : "unanswered";
    } else {
      graded += 1;
      if (!answer) {
        status = "unanswered";
      } else if (answer.option_id) {
        status = accepted.some((c) => c.correct_option_id === answer.option_id) ? "correct" : "wrong";
      } else {
        const given = normalize(answer.custom_option_model ?? "");
        status = accepted.some(
          (c) => c.correct_option_model != null && normalize(c.correct_option_model) === given,
        )
          ? "correct"
          : "wrong";
      }
      if (status === "correct") correct += 1;
    }

    return { question, userAnswer, correctAnswers, status };
  });

  return { items, correct, graded, revealed };
}
