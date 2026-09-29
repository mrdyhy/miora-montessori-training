import type { CompletedSession, QuizSession, TrainingProgress } from "@/types/training";

export const STORAGE_KEYS = {
  learnerName: "miora.training.learnerName.v1",
  progress: "miora.training.progress.v1",
  activeSession: "miora.training.activeSession.v1",
} as const;

const EMPTY_PROGRESS: TrainingProgress = {
  lastCompletedDate: null,
  totalSessions: 0,
  recentQuestionIds: [],
  recentSessions: [],
  lastResult: null,
};

function browserStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function loadLearnerName(): string {
  try {
    return browserStorage()?.getItem(STORAGE_KEYS.learnerName)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function saveLearnerName(name: string): void {
  try {
    browserStorage()?.setItem(STORAGE_KEYS.learnerName, name.trim());
  } catch (error) {
    console.warn("[MIORA] Không thể lưu tên người học.", error);
  }
}

export function loadProgress(): TrainingProgress {
  try {
    const value = browserStorage()?.getItem(STORAGE_KEYS.progress);
    return value ? { ...EMPTY_PROGRESS, ...JSON.parse(value) } : { ...EMPTY_PROGRESS };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function saveProgress(progress: TrainingProgress): void {
  try {
    browserStorage()?.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
  } catch (error) {
    console.warn("[MIORA] Không thể lưu tiến độ.", error);
  }
}

export function loadActiveSession(): QuizSession | null {
  try {
    const value = browserStorage()?.getItem(STORAGE_KEYS.activeSession);
    return value ? (JSON.parse(value) as QuizSession) : null;
  } catch {
    return null;
  }
}

export function saveActiveSession(session: QuizSession): void {
  try {
    browserStorage()?.setItem(STORAGE_KEYS.activeSession, JSON.stringify(session));
  } catch (error) {
    console.warn("[MIORA] Không thể lưu bài đang làm.", error);
  }
}

export function clearActiveSession(): void {
  try {
    browserStorage()?.removeItem(STORAGE_KEYS.activeSession);
  } catch {
    // The app remains usable even when storage is unavailable.
  }
}

export function recordCompletedSession(
  current: TrainingProgress,
  result: CompletedSession,
): TrainingProgress {
  const recentQuestionIds = [...result.questionIds, ...current.recentQuestionIds]
    .filter((id, index, all) => all.indexOf(id) === index)
    .slice(0, 40);
  return {
    lastCompletedDate: result.date,
    totalSessions: current.totalSessions + 1,
    recentQuestionIds,
    recentSessions: [result, ...current.recentSessions].slice(0, 5),
    lastResult: result,
  };
}
