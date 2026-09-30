export type AnswerId = "A" | "B" | "C" | "D";
export type ParticipantClass = "Toddler" | "Casa";

export interface TrainingAnswer {
  id: AnswerId;
  text: string;
}

export interface TrainingQuestion {
  id: string;
  ageGroup: string;
  category: string;
  scenarioType: string;
  difficulty: number;
  context: string;
  question: string;
  answers: TrainingAnswer[];
  bestAnswer: AnswerId;
  analysis: Record<AnswerId, string>;
  montessoriPrinciple: string;
  principleTags: string[];
  commonMistakes: string[];
  severity: string;
  takeaway: string;
  trainerNote: string;
  reflectionQuestion: string;
  tags: string[];
}

export interface QuizAnswerRecord {
  questionId: string;
  answerId: AnswerId;
  isCorrect: boolean;
}

export interface QuizSession {
  datasetVersion: "v7-final";
  participantName: string;
  selectedClass: ParticipantClass;
  questionIds: string[];
  selectedAnswers: QuizAnswerRecord[];
  currentQuestion: number;
  startedAt: string;
  sessionCode: string;
}

export interface CompletedSession {
  participantName: string;
  selectedClass: ParticipantClass;
  date: string;
  score: number;
  total: number;
  percentage: number;
  sessionCode: string;
  questionIds: string[];
  answers: QuizAnswerRecord[];
}

export type CompletedSessionSummary = Omit<CompletedSession, "participantName" | "selectedClass">;

export interface TrainingProgress {
  lastCompletedDate: string | null;
  totalSessions: number;
  recentQuestionIds: string[];
  recentSessions: CompletedSessionSummary[];
  lastResult: CompletedSessionSummary | null;
}
