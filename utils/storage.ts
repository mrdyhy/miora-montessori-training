import type { CompletedSession, CompletedSessionSummary, QuizSession, TrainingProgress } from "@/types/training";

export const STORAGE_KEYS = {
  progress: "miora.training.progress.v1",
  activeSession: "miora.training.activeSession.v2",
} as const;

const LEGACY_PROFILE_KEYS = [
  "miora.training.learnerName.v1",
  "userName",
  "userClass",
] as const;
const LEGACY_ACTIVE_SESSION_KEY = "miora.training.activeSession.v1";

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

function toCompletedSessionSummary(value: unknown): CompletedSessionSummary | null {
  if (!value || typeof value !== "object") return null;
  const session = value as Partial<CompletedSession>;
  if (
    typeof session.date !== "string" ||
    typeof session.score !== "number" ||
    typeof session.total !== "number" ||
    typeof session.percentage !== "number" ||
    typeof session.sessionCode !== "string" ||
    !Array.isArray(session.questionIds) ||
    !Array.isArray(session.answers)
  ) {
    return null;
  }

  return {
    date: session.date,
    score: session.score,
    total: session.total,
    percentage: session.percentage,
    sessionCode: session.sessionCode,
    questionIds: session.questionIds,
    answers: session.answers,
  };
}

export function clearLegacyParticipantProfile(): void {
  try {
    const storage = browserStorage();
    LEGACY_PROFILE_KEYS.forEach((key) => storage?.removeItem(key));
  } catch {
    // Legacy profile data is optional cleanup only.
  }
}

export function loadProgress(): TrainingProgress {
  try {
    const storage = browserStorage();
    const value = storage?.getItem(STORAGE_KEYS.progress);
    if (!value) return { ...EMPTY_PROGRESS };

    const parsed = JSON.parse(value) as Partial<TrainingProgress> & {
      recentSessions?: unknown[];
      lastResult?: unknown;
    };
    const progress: TrainingProgress = {
      ...EMPTY_PROGRESS,
      ...parsed,
      recentSessions: Array.isArray(parsed.recentSessions)
        ? parsed.recentSessions.map(toCompletedSessionSummary).filter((session) => session !== null)
        : [],
      lastResult: toCompletedSessionSummary(parsed.lastResult),
    };
    storage?.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
    return progress;
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
    const storage = browserStorage();
    storage?.removeItem(STORAGE_KEYS.activeSession);
    storage?.removeItem(LEGACY_ACTIVE_SESSION_KEY);
  } catch {
    // The app remains usable even when storage is unavailable.
  }
}

export function recordCompletedSession(
  current: TrainingProgress,
  result: CompletedSession,
): TrainingProgress {
  const summary = toCompletedSessionSummary(result);
  if (!summary) return current;
  const recentQuestionIds = [...result.questionIds, ...current.recentQuestionIds]
    .filter((id, index, all) => all.indexOf(id) === index)
    .slice(0, 40);
  return {
    lastCompletedDate: result.date,
    totalSessions: current.totalSessions + 1,
    recentQuestionIds,
    recentSessions: [summary, ...current.recentSessions].slice(0, 5),
    lastResult: summary,
  };
}
