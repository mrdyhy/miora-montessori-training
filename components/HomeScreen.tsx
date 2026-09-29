import { History, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/BrandMark";
import type { QuizSession, TrainingProgress } from "@/types/training";
import { getLocalDateKey } from "@/utils/date";

interface HomeScreenProps {
  progress: TrainingProgress;
  activeSession: QuizSession | null;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}

export function HomeScreen({
  progress,
  activeSession,
  onStart,
  onResume,
  onRestart,
}: HomeScreenProps) {
  const completedToday = progress.lastCompletedDate === getLocalDateKey();

  return (
    <main className="min-h-dvh px-4 py-5 sm:px-6 sm:py-8">
      <section className="app-shell mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-[28px] border border-[#dfe8e3] bg-white shadow-[0_24px_70px_rgba(41,89,67,0.12)] sm:min-h-[720px]">
        <header className="flex items-center justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-8">
          <BrandMark />
        </header>

        <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 sm:py-12">
          <div className="mb-7 flex items-center gap-2" aria-hidden="true">
            <span className="h-2 w-14 rounded-full bg-[#6792BA]" />
            <span className="size-2 rounded-full bg-[#F8BF60]" />
            <span className="size-2 rounded-full bg-[#E784A1]" />
          </div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[#6792BA]">Training Trợ tá Montessori</p>
          <h1 className="max-w-md text-[clamp(2.35rem,11vw,4rem)] font-bold leading-[1.03] tracking-[-0.045em] text-[#295943]">
            Quan sát kỹ.<br />Đồng hành đúng.
          </h1>
          <p className="mt-6 max-w-md text-[1.05rem] leading-7 text-[#53665d]">
            10 tình huống mỗi ngày để luyện cách quan sát, hỗ trợ và đồng hành cùng trẻ.
          </p>

          {activeSession ? (
            <div className="mt-8 rounded-2xl border border-[#f0d99e] bg-[#fffaf0] p-4">
              <div className="flex gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-[#F8BF60]/25 text-[#8b641f]">
                  <History className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-[#295943]">Bạn có một bài đang làm dở.</p>
                  <p className="mt-1 text-sm font-semibold text-[#557467]">{activeSession.participantName} · Lớp {activeSession.selectedClass}</p>
                  <p className="mt-1 text-sm leading-6 text-[#687a72]">Đã trả lời {activeSession.answers.length} / {activeSession.questionIds.length} câu.</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-11 rounded-xl border-[#d7e2dc] text-[#3f6654]" onClick={onRestart}>
                  <RotateCcw className="size-4" />Làm lại
                </Button>
                <Button className="h-11 rounded-xl bg-[#6792BA] font-bold hover:bg-[#547fa8]" onClick={onResume}>TIẾP TỤC</Button>
              </div>
            </div>
          ) : (
            <div className={`mt-8 rounded-2xl border p-4 ${completedToday ? "border-[#bfdbcc] bg-[#f1f8f4]" : "border-[#e1ebe6] bg-[#f7faf8]"}`}>
              <p className="text-sm font-semibold text-[#295943]">
                {completedToday ? "Bạn đã hoàn thành bài luyện tập hôm nay ✓" : "Hôm nay bạn chưa hoàn thành 10 câu."}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#688078]">
                {progress.lastResult ? `Kết quả gần nhất: ${progress.lastResult.score}/${progress.lastResult.total}` : "Mỗi lượt khoảng 8–12 phút. Bạn có thể luyện thêm bất cứ lúc nào."}
              </p>
            </div>
          )}

          {!activeSession && (
            <Button
              size="lg"
              className="mt-6 h-14 w-full rounded-xl bg-[#6792BA] text-base font-bold tracking-[0.04em] text-white shadow-[0_10px_24px_rgba(103,146,186,0.24)] hover:bg-[#547fa8]"
              onClick={onStart}
            >
              {completedToday ? "LUYỆN THÊM 10 CÂU" : "BẮT ĐẦU LUYỆN TẬP"}
            </Button>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-[#edf1ef] px-6 py-4 text-xs text-[#789087] sm:px-8">
          <span>Học để hỗ trợ trẻ tốt hơn</span>
          <span>{progress.totalSessions ? `${progress.totalSessions} lượt đã hoàn thành` : "10 câu / lượt"}</span>
        </footer>
      </section>
    </main>
  );
}
