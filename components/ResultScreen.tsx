import { Check, ChevronDown, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BrandMark } from "@/components/BrandMark";
import { WrongAnswerDetails } from "@/components/AnswerFeedback";
import type { CompletedSession, TrainingQuestion } from "@/types/training";
import { dateKeyToVietnamese } from "@/utils/date";

function encouragement(score: number): string {
  if (score === 10) return "Rất tốt. Tiếp tục giữ thói quen quan sát trước khi can thiệp.";
  if (score >= 8) return "Rất khá. Một vài tình huống nhỏ nữa sẽ giúp phản xạ vững hơn.";
  if (score >= 6) return "Đã hoàn thành. Hãy đọc kỹ lại những tình huống mình vừa sai.";
  return "Đã hoàn thành buổi luyện tập. Những câu sai chính là phần đáng học nhất hôm nay.";
}

export function ResultScreen({ result, questions, onPracticeAgain }: { result: CompletedSession; questions: TrainingQuestion[]; onPracticeAgain: () => void }) {
  const [showWrong, setShowWrong] = useState(false);
  const answerMap = new Map(result.answers.map((answer) => [answer.questionId, answer]));
  const wrongQuestions = questions.filter((question) => !answerMap.get(question.id)?.isCorrect);

  return (
    <main className="min-h-dvh px-4 py-4 sm:px-6 sm:py-7">
      <section className="app-shell mx-auto w-full max-w-xl overflow-hidden rounded-[28px] border border-[#dfe8e3] bg-white shadow-[0_24px_70px_rgba(41,89,67,0.11)]">
        <div className="result-capture relative overflow-hidden px-5 pb-5 pt-6 sm:px-8 sm:pb-7 sm:pt-8">
          <span aria-hidden="true" className="absolute -right-8 -top-10 size-32 rounded-full bg-[#6792BA]/10" />
          <div className="relative flex items-start justify-between">
            <BrandMark compact />
            <span className="grid size-10 place-items-center rounded-full bg-[#e7f4ec] text-[#3f7b5d]"><Check className="size-5" strokeWidth={2.5} /></span>
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.13em] text-[#6792BA]">Hoàn thành luyện tập hôm nay</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-[#295943]">{result.score} / {result.total} câu phù hợp</h1>

          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 rounded-2xl bg-[#f4f8f6] p-4">
            <div><p className="result-label">Tên</p><p className="result-value truncate">{result.participantName}</p></div>
            <div><p className="result-label">Lớp</p><p className="result-value">{result.selectedClass}</p></div>
            <div><p className="result-label">Ngày</p><p className="result-value">{dateKeyToVietnamese(result.date)}</p></div>
            <div><p className="result-label">Hoàn thành</p><p className="result-value">{result.total} / {result.total} câu</p></div>
            <div><p className="result-label">Điểm</p><p className="result-value">{result.score} / {result.total}</p></div>
            <div><p className="result-label">Tỷ lệ</p><p className="result-value text-[#6792BA]">{result.percentage}%</p></div>
          </div>

          <p className="mt-5 rounded-2xl border-l-4 border-[#F8BF60] bg-[#fffaf0] px-4 py-3 text-[15px] leading-6 text-[#465c52]">
            {encouragement(result.score)}
          </p>
          <p className="mt-4 text-center text-xs font-semibold tracking-[0.06em] text-[#789087]">Mã lượt: {result.sessionCode}</p>
        </div>

        <div className="border-t border-[#e9efec] px-5 py-5 sm:px-8">
          {wrongQuestions.length > 0 && (
            <Button variant="outline" className="h-12 w-full rounded-xl border-[#cddbd4] text-[#355f4c]" onClick={() => setShowWrong((value) => !value)} aria-expanded={showWrong}>
              {showWrong ? "ẨN CÂU SAI" : `XEM LẠI CÂU SAI (${wrongQuestions.length})`}
              <ChevronDown className={`size-4 transition ${showWrong ? "rotate-180" : ""}`} />
            </Button>
          )}

          {showWrong && (
            <div className="mt-4 space-y-4">
              {wrongQuestions.map((question) => {
                const record = answerMap.get(question.id)!;
                return (
                  <article key={question.id} className="rounded-2xl border border-[#e0e8e4] bg-[#fbfcfb] p-4 text-sm leading-6 text-[#445c50]">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#7b9187]">{question.id}</p>
                    <h2 className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-[#557467]">Tình huống</h2>
                    <p className="mt-2 font-medium">{question.context}</p>
                    <h2 className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#557467]">Câu hỏi</h2>
                    <p className="mt-2 font-bold text-[#295943]">{question.question}</p>
                    <div className="mt-4">
                      <WrongAnswerDetails question={question} selectedAnswer={record.answerId} showReasonHeading />
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <Accordion type="single" collapsible className="mt-2">
            <AccordionItem value="question-ids">
              <AccordionTrigger className="text-[#49675a] hover:no-underline">Xem mã câu đã làm</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2">
                  {result.questionIds.map((id) => <span key={id} className="rounded-md bg-[#edf3f0] px-2.5 py-1 font-mono text-xs text-[#49675a]">{id}</span>)}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button className="mt-3 h-12 w-full rounded-xl bg-[#6792BA] font-bold hover:bg-[#547fa8]" onClick={onPracticeAgain}>
            <RotateCcw className="size-4" />LÀM LƯỢT MỚI
          </Button>
        </div>
      </section>
    </main>
  );
}
