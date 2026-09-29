import type { TrainingQuestion } from "@/types/training";

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function validateTrainingDataset(input: unknown): TrainingQuestion[] {
  if (!Array.isArray(input)) return [];

  const seen = new Set<string>();
  return input.filter((item): item is TrainingQuestion => {
    if (!item || typeof item !== "object") return false;
    const question = item as Partial<TrainingQuestion>;
    const answerIds = Array.isArray(question.answers)
      ? question.answers.map((answer) => answer?.id)
      : [];
    const valid =
      typeof question.id === "string" &&
      !seen.has(question.id) &&
      typeof question.context === "string" &&
      typeof question.question === "string" &&
      typeof question.category === "string" &&
      Array.isArray(question.answers) &&
      question.answers.length === 4 &&
      typeof question.bestAnswer === "string" &&
      answerIds.includes(question.bestAnswer) &&
      Boolean(question.analysis?.[question.bestAnswer as keyof typeof question.analysis]);

    if (!valid) {
      console.warn(`[MIORA] Bỏ qua câu hỏi không hợp lệ: ${question.id ?? "không có ID"}`);
      return false;
    }
    seen.add(question.id as string);
    return true;
  });
}

export function generateQuizQuestions(
  dataset: readonly TrainingQuestion[],
  count = 10,
  recentQuestionIds: readonly string[] = [],
): TrainingQuestion[] {
  const wanted = Math.min(Math.max(0, count), dataset.length);
  const recent = new Set(recentQuestionIds);
  const fresh = shuffle(dataset.filter((question) => !recent.has(question.id)));
  const fallback = shuffle(dataset.filter((question) => recent.has(question.id)));
  const pool = [...fresh, ...fallback];
  const selected: TrainingQuestion[] = [];
  const selectedIds = new Set<string>();
  const categoryCounts = new Map<string, number>();
  const scenarios = new Set<string>();
  const difficulties = new Set<number>();

  while (selected.length < wanted) {
    const candidates = pool.filter(
      (question) =>
        !selectedIds.has(question.id) &&
        (categoryCounts.get(question.category) ?? 0) < 2,
    );
    const available = candidates.length
      ? candidates
      : pool.filter((question) => !selectedIds.has(question.id));
    if (!available.length) break;

    const ranked = available
      .map((question) => ({
        question,
        score:
          (categoryCounts.has(question.category) ? 0 : 100) +
          (scenarios.has(question.scenarioType) ? 0 : 12) +
          (difficulties.has(question.difficulty) ? 0 : 6) +
          (recent.has(question.id) ? -1000 : 0) +
          Math.random(),
      }))
      .sort((a, b) => b.score - a.score);

    const next = ranked[0].question;
    selected.push(next);
    selectedIds.add(next.id);
    categoryCounts.set(next.category, (categoryCounts.get(next.category) ?? 0) + 1);
    scenarios.add(next.scenarioType);
    difficulties.add(next.difficulty);
  }

  return selected;
}
