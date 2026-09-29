import { Progress } from "@/components/ui/progress";

export function TrainingProgress({ current, total }: { current: number; total: number }) {
  const percentage = Math.round((current / total) * 100);
  return (
    <div aria-label={`Tiến độ câu ${current} trên ${total}`}>
      <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[#49675a]">
        <span>Câu {current} / {total}</span>
        <span className="text-[#789087]">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2.5 bg-[#dfe9e4] [&_[data-slot=progress-indicator]]:bg-[#6792BA]" />
    </div>
  );
}
