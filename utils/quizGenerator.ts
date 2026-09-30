import type { AnswerId, ParticipantClass, TrainingQuestion } from "@/types/training";
import { hasPrincipleLabel } from "@/utils/principleLabels";

const REQUIRED_ANSWER_IDS: readonly AnswerId[] = ["A", "B", "C", "D"];

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function validateTrainingDataset(input: unknown): TrainingQuestion[] {
  if (!Array.isArray(input)) {
    console.warn("[MIORA] Dataset không phải là một danh sách câu hỏi.");
    return [];
  }
  if (input.length !== 300) {
    console.warn(`[MIORA] Dataset cần 300 câu nhưng hiện có ${input.length} câu.`);
  }

  const seen = new Set<string>();
  return input.filter((item): item is TrainingQuestion => {
    if (!item || typeof item !== "object") {
      console.warn("[MIORA] Bỏ qua một câu hỏi không phải object.");
      return false;
    }
    const question = item as Partial<TrainingQuestion>;
    const answerIds = Array.isArray(question.answers)
      ? question.answers.map((answer) => answer?.id)
      : [];
    const analysis = question.analysis as Partial<Record<AnswerId, unknown>> | undefined;
    const validPrincipleTags =
      Array.isArray(question.principleTags) &&
      question.principleTags.length > 0 &&
      question.principleTags.every(
        (tag) => typeof tag === "string" && tag.trim().length > 0 && hasPrincipleLabel(tag),
      );
    const valid =
      typeof question.id === "string" &&
      question.id.trim().length > 0 &&
      !seen.has(question.id) &&
      typeof question.context === "string" && question.context.trim().length > 0 &&
      typeof question.question === "string" && question.question.trim().length > 0 &&
      typeof question.category === "string" && question.category.trim().length > 0 &&
      typeof question.ageGroup === "string" && question.ageGroup.trim().length > 0 &&
      typeof question.scenarioType === "string" && question.scenarioType.trim().length > 0 &&
      typeof question.difficulty === "number" &&
      Array.isArray(question.answers) &&
      question.answers.length === 4 &&
      question.answers.every(
        (answer) =>
          answer &&
          REQUIRED_ANSWER_IDS.includes(answer.id) &&
          typeof answer.text === "string" &&
          answer.text.trim().length > 0,
      ) &&
      new Set(answerIds).size === 4 &&
      REQUIRED_ANSWER_IDS.every((id) => answerIds.includes(id)) &&
      typeof question.bestAnswer === "string" &&
      answerIds.includes(question.bestAnswer) &&
      REQUIRED_ANSWER_IDS.every(
        (id) => typeof analysis?.[id] === "string" && (analysis[id] as string).trim().length > 0,
      ) &&
      typeof question.montessoriPrinciple === "string" &&
      question.montessoriPrinciple.trim().length > 0 &&
      validPrincipleTags &&
      typeof question.takeaway === "string" &&
      question.takeaway.trim().length > 0;

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
  selectedClass: ParticipantClass,
  count = 10,
  recentQuestionIds: readonly string[] = [],
): TrainingQuestion[] {
  const eligible = dataset.filter(
    (question) => question.ageGroup === selectedClass || question.ageGroup === "General",
  );
  const wanted = Math.min(Math.max(0, count), eligible.length);
  const recent = new Set(recentQuestionIds);
  const classPool = eligible.filter((question) => question.ageGroup === selectedClass);
  const generalPool = eligible.filter((question) => question.ageGroup === "General");
  const preferredClassCount = Math.min(classPool.length, Math.ceil(wanted * 0.7));
  const preferredGeneralCount = Math.min(generalPool.length, wanted - preferredClassCount);
  const selectedIds = new Set<string>();

  const selectFromPool = (pool: readonly TrainingQuestion[], target: number): TrainingQuestion[] => {
    const fresh = shuffle(pool.filter((question) => !recent.has(question.id) && !selectedIds.has(question.id)));
    const fallback = shuffle(pool.filter((question) => recent.has(question.id) && !selectedIds.has(question.id)));
    const candidatesPool = [...fresh, ...fallback];
    const picked: TrainingQuestion[] = [];
    const categoryCounts = new Map<string, number>();
    const scenarios = new Set<string>();
    const difficulties = new Set<number>();

    while (picked.length < target) {
      const candidates = candidatesPool.filter(
        (question) =>
          !selectedIds.has(question.id) &&
          (categoryCounts.get(question.category) ?? 0) < 2,
      );
      const available = candidates.length
        ? candidates
        : candidatesPool.filter((question) => !selectedIds.has(question.id));
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
      picked.push(next);
      selectedIds.add(next.id);
      categoryCounts.set(next.category, (categoryCounts.get(next.category) ?? 0) + 1);
      scenarios.add(next.scenarioType);
      difficulties.add(next.difficulty);
    }

    return picked;
  };

  const selected: TrainingQuestion[] = [];
  selected.push(...selectFromPool(classPool, preferredClassCount));
  selected.push(...selectFromPool(generalPool, preferredGeneralCount));
  if (selected.length < wanted) {
    selected.push(...selectFromPool(eligible, wanted - selected.length));
  }

  return shuffle(selected);
}
