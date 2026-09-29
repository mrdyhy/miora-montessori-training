"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import rawDataset from "@/data/montessori-assistant-training-v4.json";
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
import type { AnswerId, CompletedSession, QuizSession, TrainingProgress } from "@/types/training";
import { getLocalDateKey } from "@/utils/date";
import { generateQuizQuestions, validateTrainingDataset } from "@/utils/quizGenerator";
import { createSessionCode } from "@/utils/sessionCode";
import {
  clearActiveSession,
  loadActiveSession,
  loadLearnerName,
  loadProgress,
  recordCompletedSession,
  saveActiveSession,
  saveLearnerName,
  saveProgress,
} from "@/utils/storage";

type Screen = "home" | "quiz" | "result";
type PendingAction = "start" | null;

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
  const [name, setName] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [nameOpen, setNameOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [progress, setProgress] = useState<TrainingProgress>(EMPTY_PROGRESS);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [result, setResult] = useState<CompletedSession | null>(null);
  const advanceLock = useRef(false);

  useEffect(() => {
    const storedName = loadLearnerName();
    const storedProgress = loadProgress();
    const storedSession = loadActiveSession();
    setName(storedName);
    setNameDraft(storedName);
    setProgress(storedProgress);

    if (
      storedSession &&
      storedSession.questionIds.length === 10 &&
      storedSession.questionIds.every((id) => questionMap.has(id)) &&
      storedSession.currentQuestionIndex >= 0 &&
      storedSession.currentQuestionIndex < storedSession.questionIds.length
    ) {
      setSession(storedSession);
    } else if (storedSession) {
      clearActiveSession();
    }
  }, [questionMap]);

  const createNewSession = useCallback(() => {
    const questions = generateQuizQuestions(dataset, 10, progress.recentQuestionIds);
    if (questions.length !== 10) {
      console.warn(`[MIORA] Không thể tạo đủ 10 câu. Chỉ có ${questions.length} câu hợp lệ.`);
      return;
    }
    const nextSession: QuizSession = {
      questionIds: questions.map((question) => question.id),
      currentQuestionIndex: 0,
      answers: [],
      score: 0,
      sessionCode: createSessionCode(),
      startDate: getLocalDateKey(),
    };
    setResult(null);
    setSession(nextSession);
    saveActiveSession(nextSession);
    setScreen("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dataset, progress.recentQuestionIds]);

  const requestStart = useCallback(() => {
    if (!name.trim()) {
      setPendingAction("start");
      setNameOpen(true);
      return;
    }
    createNewSession();
  }, [createNewSession, name]);

  const saveNameAndContinue = () => {
    const cleanName = nameDraft.trim();
    if (!cleanName) return;
    setName(cleanName);
    saveLearnerName(cleanName);
    setNameOpen(false);
    if (pendingAction === "start") {
      setPendingAction(null);
      window.setTimeout(createNewSession, 0);
    }
  };

  const resumeSession = useCallback(() => {
    if (!session) return;
    setScreen("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [session]);

  const restartSession = () => {
    clearActiveSession();
    setSession(null);
    requestStart();
  };

  const currentQuestion = session ? questionMap.get(session.questionIds[session.currentQuestionIndex]) ?? null : null;
  const selectedAnswer = currentQuestion
    ? session?.answers.find((answer) => answer.questionId === currentQuestion.id)?.answerId ?? null
    : null;

  const selectAnswer = useCallback((answerId: AnswerId) => {
    if (!session || !currentQuestion || session.answers.some((answer) => answer.questionId === currentQuestion.id)) return;
    const isCorrect = answerId === currentQuestion.bestAnswer;
    const updated: QuizSession = {
      ...session,
      answers: [...session.answers, { questionId: currentQuestion.id, answerId, isCorrect }],
      score: session.score + (isCorrect ? 1 : 0),
    };
    setSession(updated);
    saveActiveSession(updated);
  }, [currentQuestion, session]);

  const nextQuestion = useCallback(() => {
    if (!session || !currentQuestion || !selectedAnswer || advanceLock.current) return;
    advanceLock.current = true;

    if (session.currentQuestionIndex === session.questionIds.length - 1) {
      const completed: CompletedSession = {
        name,
        date: getLocalDateKey(),
        score: session.score,
        total: session.questionIds.length,
        percentage: Math.round((session.score / session.questionIds.length) * 100),
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
      const updated = { ...session, currentQuestionIndex: session.currentQuestionIndex + 1 };
      setSession(updated);
      saveActiveSession(updated);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => { advanceLock.current = false; }, 250);
  }, [currentQuestion, name, progress, selectedAnswer, session]);

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
        learnerName: name || null,
        completedToday: progress.lastCompletedDate === getLocalDateKey(),
        active: session ? { current: session.currentQuestionIndex + 1, total: session.questionIds.length, score: session.score } : null,
        question: currentQuestion ? { id: currentQuestion.id, context: currentQuestion.context, question: currentQuestion.question, answers: currentQuestion.answers } : null,
      }),
    });
    register({
      name: "start_miora_training",
      title: "Bắt đầu luyện tập MIORA",
      description: "Bắt đầu một lượt 10 câu mới hoặc mở hộp nhập tên nếu chưa có tên người học.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: () => {
        requestStart();
        return { status: name ? "started" : "needs_name" };
      },
    });
    return () => lifecycle.abort();
  }, [currentQuestion, name, progress.lastCompletedDate, requestStart, screen, session]);

  const completedQuestions = result ? result.questionIds.map((id) => questionMap.get(id)).filter((question) => question !== undefined) : [];

  return (
    <>
      {screen === "home" && (
        <HomeScreen
          name={name}
          progress={progress}
          activeSession={session}
          onStart={requestStart}
          onResume={resumeSession}
          onRestart={restartSession}
          onChangeName={() => { setNameDraft(name); setPendingAction(null); setNameOpen(true); }}
        />
      )}
      {screen === "quiz" && session && currentQuestion && (
        <QuizScreen
          key={currentQuestion.id}
          question={currentQuestion}
          current={session.currentQuestionIndex + 1}
          total={session.questionIds.length}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={selectAnswer}
          onNext={nextQuestion}
        />
      )}
      {screen === "result" && result && (
        <ResultScreen result={result} questions={completedQuestions} onPracticeAgain={createNewSession} />
      )}

      <Dialog open={nameOpen} onOpenChange={(open) => { setNameOpen(open); if (!open) setPendingAction(null); }}>
        <DialogContent className="rounded-2xl border-[#dfe8e3] p-6 sm:max-w-md" showCloseButton={Boolean(name)}>
          <DialogHeader>
            <DialogTitle className="text-xl text-[#295943]">Tên của bạn</DialogTitle>
            <DialogDescription className="text-[15px] leading-6">Tên sẽ được lưu trên thiết bị này và hiển thị trong kết quả cuối lượt.</DialogDescription>
          </DialogHeader>
          <label className="mt-1 grid gap-2 text-sm font-semibold text-[#355f4c]" htmlFor="learner-name">
            Họ và tên
            <Input
              id="learner-name"
              autoFocus
              autoComplete="name"
              maxLength={60}
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") saveNameAndContinue(); }}
              placeholder="Ví dụ: Nguyễn An"
              className="h-12 rounded-xl border-[#cbdad2] text-base focus-visible:border-[#6792BA] focus-visible:ring-[#6792BA]/20"
            />
          </label>
          <DialogFooter className="mt-2">
            <Button disabled={!nameDraft.trim()} onClick={saveNameAndContinue} className="h-12 w-full rounded-xl bg-[#6792BA] font-bold hover:bg-[#547fa8]">TIẾP TỤC</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
