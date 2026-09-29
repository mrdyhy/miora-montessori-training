import { CheckCircle2, Lightbulb } from "lucide-react";
import type { AnswerId, TrainingQuestion } from "@/types/training";

export function AnswerFeedback({ question, selectedAnswer }: { question: TrainingQuestion; selectedAnswer: AnswerId }) {
  const isCorrect = selectedAnswer === question.bestAnswer;
  const best = question.answers.find((answer) => answer.id === question.bestAnswer)!;

  return (
    <section className={`mt-6 rounded-2xl border p-5 ${isCorrect ? "border-[#bcd8c8] bg-[#f1f8f4]" : "border-[#efd4dc] bg-[#fff7f9]"}`} aria-live="polite">
      <h2 className="flex items-center gap-2 text-lg font-bold text-[#295943]">
        <CheckCircle2 className={`size-5 ${isCorrect ? "text-[#3e8062]" : "text-[#d26a89]"}`} />
        {isCorrect ? "Phù hợp." : "Trong tình huống này, MIORA ưu tiên phương án khác."}
      </h2>

      <div className="mt-5 space-y-5 text-[15px] leading-6 text-[#40594d]">
        <div>
          <h3 className="mb-1 font-bold text-[#295943]">Vì sao?</h3>
          <p>{question.analysis[selectedAnswer]}</p>
        </div>
        {!isCorrect && (
          <div>
            <h3 className="mb-1 font-bold text-[#295943]">Cách phù hợp hơn</h3>
            <p className="mb-1 font-semibold">{best.id}. {best.text}</p>
            <p>{question.analysis[question.bestAnswer]}</p>
          </div>
        )}
        <div className="rounded-xl bg-white/75 p-4">
          <h3 className="mb-1 flex items-center gap-2 font-bold text-[#295943]"><Lightbulb className="size-4 text-[#d6982e]" />Ghi nhớ</h3>
          <p>{question.takeaway}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#789087]">Nguyên tắc phía sau</p>
          <p className="mt-1 text-sm text-[#63776d]">{question.montessoriPrinciple}</p>
        </div>
      </div>
    </section>
  );
}
