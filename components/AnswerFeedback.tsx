import { CheckCircle2, Compass, Lightbulb } from "lucide-react";
import { PrincipleSummary } from "@/components/PrincipleSummary";
import type { AnswerId, TrainingQuestion } from "@/types/training";

function Takeaway({ children }: { children: string }) {
  return (
    <div className="rounded-xl border border-[#f1dfb9] bg-[#fffaf0] p-4">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#8b641f]">
        <Lightbulb className="size-4 text-[#d6982e]" />
        Ghi nhớ
      </h3>
      <p className="mt-2 text-[15px] leading-6 text-[#40594d]">{children}</p>
    </div>
  );
}

export function WrongAnswerDetails({
  question,
  selectedAnswer,
  showReasonHeading = false,
}: {
  question: TrainingQuestion;
  selectedAnswer: AnswerId;
  showReasonHeading?: boolean;
}) {
  const chosen = question.answers.find((answer) => answer.id === selectedAnswer);
  const best = question.answers.find((answer) => answer.id === question.bestAnswer);
  if (!chosen || !best) return null;

  return (
    <div className="space-y-5">
      {showReasonHeading && (
        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#557467]">Vì sao?</h3>
      )}

      <div className="rounded-xl border border-[#eadde1] bg-white/80 p-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#9b5870]">
          Lựa chọn của bạn
        </h3>
        <p className="mt-2 font-semibold text-[#4c3d43]">{chosen.id}. {chosen.text}</p>
        <p className="mt-2 text-[15px] leading-6 text-[#5f5056]">{question.analysis[selectedAnswer]}</p>
      </div>

      <div className="rounded-xl border border-[#c8ddd2] bg-[#f5faf7] p-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#3f765a]">
          Cách MIORA ưu tiên
        </h3>
        <p className="mt-2 font-semibold text-[#295943]">{best.id}. {best.text}</p>
        <p className="mt-2 text-[15px] leading-6 text-[#40594d]">{question.analysis[question.bestAnswer]}</p>
      </div>

      <PrincipleSummary principle={question.montessoriPrinciple} tags={question.principleTags} />
      <Takeaway>{question.takeaway}</Takeaway>
    </div>
  );
}

export function AnswerFeedback({ question, selectedAnswer }: { question: TrainingQuestion; selectedAnswer: AnswerId }) {
  const isCorrect = selectedAnswer === question.bestAnswer;

  return (
    <section
      className={`mt-6 rounded-2xl border p-4 sm:p-5 ${isCorrect ? "border-[#bcd8c8] bg-[#f1f8f4]" : "border-[#eadde1] bg-[#fff9fb]"}`}
      aria-live="polite"
    >
      <h2 className="flex items-start gap-2 text-base font-bold leading-6 text-[#295943] sm:text-lg">
        {isCorrect ? (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#3e8062]" />
        ) : (
          <Compass className="mt-0.5 size-5 shrink-0 text-[#6792BA]" />
        )}
        {isCorrect ? "PHÙ HỢP." : "Trong tình huống này, MIORA ưu tiên một cách xử lý khác."}
      </h2>

      <div className="mt-5 space-y-5">
        {isCorrect ? (
          <>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#557467]">Vì sao?</h3>
              <p className="mt-2 text-[15px] leading-6 text-[#40594d]">{question.analysis[selectedAnswer]}</p>
            </div>
            <PrincipleSummary principle={question.montessoriPrinciple} tags={question.principleTags} />
            <Takeaway>{question.takeaway}</Takeaway>
          </>
        ) : (
          <WrongAnswerDetails question={question} selectedAnswer={selectedAnswer} showReasonHeading />
        )}
      </div>
    </section>
  );
}
