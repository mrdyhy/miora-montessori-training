import { getPrincipleLabels } from "@/utils/principleLabels";

export function PrincipleSummary({
  principle,
  tags,
}: {
  principle: string;
  tags: readonly string[];
}) {
  const labels = getPrincipleLabels(tags);

  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#557467]">
        Nguyên tắc Montessori
      </h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {labels.map((label, index) => (
          <span
            key={`${label}-${index}`}
            className="rounded-full border border-[#cbded5] bg-[#edf5f1] px-3 py-1 text-xs font-bold leading-5 text-[#355f4c]"
          >
            {label}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[15px] leading-6 text-[#40594d]">{principle}</p>
    </div>
  );
}
