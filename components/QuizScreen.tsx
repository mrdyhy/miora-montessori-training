import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/BrandMark";
import { TrainingProgress } from "@/components/TrainingProgress";
import { AnswerFeedback } from "@/components/AnswerFeedback";
import type { AnswerId, TrainingQuestion } from "@/types/training";

interface QuizScreenProps {
  question: TrainingQuestion;
  current: number;
  total: number;
  selectedAnswer: AnswerId | null;
  onSelectAnswer: (answerId: AnswerId) => void;
  onNext: () => void;
}

export function QuizScreen({
  question,
  current,
  total,
  selectedAnswer,
  onSelectAnswer,
  onNext,
}: QuizScreenProps) {
  return (
    <main className="min-h-dvh px-4 py-4 sm:px-6 sm:py-7">
      <section className="app-shell mx-auto w-full max-w-2xl overflow-hidden rounded-[28px] border border-[#dfe8e3] bg-white shadow-[0_24px_70px_rgba(41,89,67,0.1)]">
        <header className="border-b border-[#edf1ef] px-5 py-5 sm:px-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <BrandMark compact />
            <span className="rounded-full bg-[#edf5f1] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-[#557467]">
              {question.ageGroup}
            </span>
          </div>
          <TrainingProgress current={current} total={total} />
        </header>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="rounded-2xl border-l-4 border-[#F8BF60] bg-[#fffaf0] px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#9b6e22]">Tình huống</p>
            <p className="mt-2 text-[1.05rem] leading-7 text-[#3d574b]">{question.context}</p>
          </div>

          <h1 className="mt-6 text-[1.45rem] font-bold leading-8 tracking-[-0.02em] text-[#295943]">{question.question}</h1>

          <div className="mt-5 grid gap-3" role="group" aria-label="Các phương án trả lời">
            {question.answers.map((answer) => {
              const chosen = selectedAnswer === answer.id;
              const best = selectedAnswer !== null && answer.id === question.bestAnswer;
              const wrong = chosen && answer.id !== question.bestAnswer;
              return (
                <button
                  key={answer.id}
                  type="button"
                  disabled={selectedAnswer !== null}
                  onClick={() => onSelectAnswer(answer.id)}
                  className={`group flex min-h-16 w-full items-start gap-3 rounded-2xl border p-4 text-left text-base leading-6 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6792BA]/25 disabled:cursor-default disabled:opacity-100 ${
                    best
                      ? "border-[#559174] bg-[#eff8f3] text-[#295943]"
                      : wrong
                        ? "border-[#dc809b] bg-[#fff2f6] text-[#603c48]"
                        : chosen
                          ? "border-[#6792BA] bg-[#f1f6fa]"
                          : selectedAnswer
                            ? "border-[#e6ece9] bg-[#fafcfb] text-[#708279]"
                            : "border-[#d9e4de] bg-white text-[#344f43] hover:border-[#8eaf9f] hover:bg-[#f8fbf9]"
                  }`}
                >
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full border text-sm font-bold ${best ? "border-[#559174] bg-[#559174] text-white" : wrong ? "border-[#dc809b] bg-[#dc809b] text-white" : "border-[#c9d7d0] bg-[#f7faf8] text-[#526e60]"}`}>
                    {answer.id}
                  </span>
                  <span className="pt-1">{answer.text}</span>
                </button>
              );
            })}
          </div>

          {selectedAnswer && (
            <>
              <AnswerFeedback question={question} selectedAnswer={selectedAnswer} />
              <Button className="mt-5 h-13 w-full rounded-xl bg-[#6792BA] text-base font-bold hover:bg-[#547fa8]" onClick={onNext}>
                {current === total ? "XEM KẾT QUẢ" : "CÂU TIẾP THEO"}
              </Button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
