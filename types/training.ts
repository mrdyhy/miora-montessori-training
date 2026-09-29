export type AnswerId = "A" | "B" | "C" | "D";

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
  questionIds: string[];
  currentQuestionIndex: number;
  answers: QuizAnswerRecord[];
  score: number;
  sessionCode: string;
  startDate: string;
}

export interface CompletedSession {
  name: string;
  date: string;
  score: number;
  total: number;
  percentage: number;
  sessionCode: string;
  questionIds: string[];
  answers: QuizAnswerRecord[];
}

export interface TrainingProgress {
  lastCompletedDate: string | null;
  totalSessions: number;
  recentQuestionIds: string[];
  recentSessions: CompletedSession[];
  lastResult: CompletedSession | null;
}
