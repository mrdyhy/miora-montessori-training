"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import rawDataset from "@/data/montessori-assistant-training-v5.json";
import { HomeScreen } from "@/components/HomeScreen";
import { QuizScreen } from "@/components/QuizScreen";
import { ResultScreen } from "@/components/ResultScreen";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AnswerId, CompletedSession, ParticipantClass, QuizSession, TrainingProgress } from "@/types/training";
import { getLocalDateKey } from "@/utils/date";
import { generateQuizQuestions, validateTrainingDataset } from "@/utils/quizGenerator";
import { createSessionCode } from "@/utils/sessionCode";
import {
  clearLegacyParticipantProfile,
  clearActiveSession,
  loadActiveSession,
  loadProgress,
  recordCompletedSession,
  saveActiveSession,
  saveProgress,
} from "@/utils/storage";

type Screen = "home" | "quiz" | "result";

const EMPTY_PROGRESS: TrainingProgress = {
  lastCompletedDate: null,
  totalSessions: 0,
  recentQuestionIds: [],
  recentSessions: [],
  lastResult: null,
};

interface ModelContextLike {
  registerTool: (tool: Record<string, unknown>, options?: { signal?: AbortSignal }) => void | Promise<void>;
}

export default function Home() {
  const dataset = useMemo(() => validateTrainingDataset(rawDataset), []);
  const questionMap = useMemo(() => new Map(dataset.map((question) => [question.id, question])), [dataset]);
  const [screen, setScreen] = useState<Screen>("home");
  const [participantNameDraft, setParticipantNameDraft] = useState("");
  const [selectedClassDraft, setSelectedClassDraft] = useState<ParticipantClass | null>(null);
  const [participantFormOpen, setParticipantFormOpen] = useState(false);
  const [progress, setProgress] = useState<TrainingProgress>(EMPTY_PROGRESS);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [result, setResult] = useState<CompletedSession | null>(null);
  const advanceLock = useRef(false);

  useEffect(() => {
    clearLegacyParticipantProfile();
    const storedProgress = loadProgress();
    const storedSession = loadActiveSession();
    setProgress(storedProgress);

    if (
      storedSession &&
      typeof storedSession.participantName === "string" &&
      storedSession.participantName.trim().length > 0 &&
      (storedSession.selectedClass === "Toddler" || storedSession.selectedClass === "Casa") &&
      Array.isArray(storedSession.questionIds) &&
      storedSession.questionIds.length === 10 &&
      storedSession.questionIds.every((id) => questionMap.has(id)) &&
      storedSession.currentQuestion >= 1 &&
      storedSession.currentQuestion <= storedSession.questionIds.length &&
      Array.isArray(storedSession.answers) &&
      typeof storedSession.startedAt === "string"
    ) {
      setSession(storedSession);
      setScreen("quiz");
    } else if (storedSession) {
      clearActiveSession();
    }
  }, [questionMap]);

  const createNewSession = useCallback((participantName: string, selectedClass: ParticipantClass) => {
    const questions = generateQuizQuestions(dataset, selectedClass, 10, progress.recentQuestionIds);
    if (questions.length !== 10) {
      console.warn(`[MIORA] Không thể tạo đủ 10 câu. Chỉ có ${questions.length} câu hợp lệ.`);
      return;
    }
    const nextSession: QuizSession = {
      participantName,
      selectedClass,
      questionIds: questions.map((question) => question.id),
      answers: [],
      currentQuestion: 1,
      startedAt: new Date().toISOString(),
      sessionCode: createSessionCode(),
    };
    setResult(null);
    setSession(nextSession);
    saveActiveSession(nextSession);
    setScreen("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dataset, progress.recentQuestionIds]);

  const requestStart = useCallback(() => {
    setParticipantNameDraft("");
    setSelectedClassDraft(null);
    setParticipantFormOpen(true);
  }, []);

  const startSessionFromForm = () => {
    const participantName = participantNameDraft.trim();
    if (!participantName || !selectedClassDraft) return;
    setParticipantFormOpen(false);
    createNewSession(participantName, selectedClassDraft);
  };

  const resumeSession = useCallback(() => {
    if (!session) return;
    setScreen("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [session]);

  const restartSession = () => {
    clearActiveSession();
    setSession(null);
    setResult(null);
    setScreen("home");
    requestStart();
  };

  const currentQuestion = session ? questionMap.get(session.questionIds[session.currentQuestion - 1]) ?? null : null;
  const selectedAnswer = currentQuestion
    ? session?.answers.find((answer) => answer.questionId === currentQuestion.id)?.answerId ?? null
    : null;

  const selectAnswer = useCallback((answerId: AnswerId) => {
    if (!session || !currentQuestion || session.answers.some((answer) => answer.questionId === currentQuestion.id)) return;
    const isCorrect = answerId === currentQuestion.bestAnswer;
    const updated: QuizSession = {
      ...session,
      answers: [...session.answers, { questionId: currentQuestion.id, answerId, isCorrect }],
    };
    setSession(updated);
    saveActiveSession(updated);
  }, [currentQuestion, session]);

  const nextQuestion = useCallback(() => {
    if (!session || !currentQuestion || !selectedAnswer || advanceLock.current) return;
    advanceLock.current = true;

    if (session.currentQuestion === session.questionIds.length) {
      const score = session.answers.filter((answer) => answer.isCorrect).length;
      const completed: CompletedSession = {
        participantName: session.participantName,
        selectedClass: session.selectedClass,
        date: getLocalDateKey(),
        score,
        total: session.questionIds.length,
        percentage: Math.round((score / session.questionIds.length) * 100),
        sessionCode: session.sessionCode,
        questionIds: session.questionIds,
        answers: session.answers,
      };
      const updatedProgress = recordCompletedSession(progress, completed);
      saveProgress(updatedProgress);
      clearActiveSession();
      setProgress(updatedProgress);
      setResult(completed);
      setSession(null);
      setScreen("result");
    } else {
      const updated = { ...session, currentQuestion: session.currentQuestion + 1 };
      setSession(updated);
      saveActiveSession(updated);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => { advanceLock.current = false; }, 250);
  }, [currentQuestion, progress, selectedAnswer, session]);

  useEffect(() => {
    const modelContext = (document as Document & { modelContext?: ModelContextLike }).modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const reportRegistrationError = (error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.warn("[MIORA] WebMCP tool registration failed.", error);
    };
    const register = (tool: Record<string, unknown>) => {
      try {
        void Promise.resolve(modelContext.registerTool(tool, { signal: lifecycle.signal })).catch(reportRegistrationError);
      } catch (error) {
        reportRegistrationError(error);
      }
    };

    register({
      name: "read_miora_training_state",
      title: "Xem trạng thái luyện tập MIORA",
      description: "Đọc trạng thái bài luyện tập hiện tại và câu hỏi đang hiển thị.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: () => ({
        screen,
        participantName: session?.participantName ?? result?.participantName ?? null,
        selectedClass: session?.selectedClass ?? result?.selectedClass ?? null,
        completedToday: progress.lastCompletedDate === getLocalDateKey(),
        active: session
          ? {
              current: session.currentQuestion,
              total: session.questionIds.length,
              score: session.answers.filter((answer) => answer.isCorrect).length,
            }
          : null,
        question: currentQuestion ? { id: currentQuestion.id, context: currentQuestion.context, question: currentQuestion.question, answers: currentQuestion.answers } : null,
      }),
    });
    register({
      name: "start_miora_training",
      title: "Bắt đầu luyện tập MIORA",
      description: "Mở biểu mẫu nhập tên và chọn lớp để bắt đầu một lượt 10 câu mới.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: () => {
        requestStart();
        return { status: "needs_participant_info" };
      },
    });
    return () => lifecycle.abort();
  }, [currentQuestion, progress.lastCompletedDate, requestStart, result, screen, session]);

  const completedQuestions = result ? result.questionIds.map((id) => questionMap.get(id)).filter((question) => question !== undefined) : [];

  return (
    <>
      {screen === "home" && (
        <HomeScreen
          progress={progress}
          activeSession={session}
          onStart={requestStart}
          onResume={resumeSession}
          onRestart={restartSession}
        />
      )}
      {screen === "quiz" && session && currentQuestion && (
        <QuizScreen
          key={currentQuestion.id}
          question={currentQuestion}
          current={session.currentQuestion}
          total={session.questionIds.length}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={selectAnswer}
          onNext={nextQuestion}
        />
      )}
      {screen === "result" && result && (
        <ResultScreen result={result} questions={completedQuestions} onPracticeAgain={restartSession} />
      )}

      <Dialog open={participantFormOpen} onOpenChange={setParticipantFormOpen}>
        <DialogContent className="rounded-2xl border-[#dfe8e3] p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#295943]">Bắt đầu lượt luyện tập</DialogTitle>
            <DialogDescription className="text-[15px] leading-6">Thông tin chỉ dùng cho lượt hiện tại và sẽ không được tự động điền ở lượt sau.</DialogDescription>
          </DialogHeader>
          <label className="mt-1 grid gap-2 text-sm font-semibold text-[#355f4c]" htmlFor="participant-name">
            Tên của bạn
            <Input
              id="participant-name"
              autoFocus
              autoComplete="off"
              maxLength={60}
              value={participantNameDraft}
              onChange={(event) => setParticipantNameDraft(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") startSessionFromForm(); }}
              placeholder="Ví dụ: Nguyễn An"
              className="h-12 rounded-xl border-[#cbdad2] text-base focus-visible:border-[#6792BA] focus-visible:ring-[#6792BA]/20"
            />
          </label>
          <fieldset className="mt-2 grid gap-2">
            <legend className="text-sm font-semibold text-[#355f4c]">Lớp của bạn</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["Toddler", "Casa"] as const).map((className) => (
                <Button
                  key={className}
                  type="button"
                  variant="outline"
                  aria-pressed={selectedClassDraft === className}
                  onClick={() => setSelectedClassDraft(className)}
                  className={`h-12 rounded-xl font-bold ${selectedClassDraft === className ? "border-[#6792BA] bg-[#edf5fb] text-[#466f96]" : "border-[#cbdad2] text-[#557467]"}`}
                >
                  {className}
                </Button>
              ))}
            </div>
          </fieldset>
          <DialogFooter className="mt-2">
            <Button disabled={!participantNameDraft.trim() || !selectedClassDraft} onClick={startSessionFromForm} className="h-12 w-full rounded-xl bg-[#6792BA] font-bold hover:bg-[#547fa8]">BẮT ĐẦU 10 CÂU</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
