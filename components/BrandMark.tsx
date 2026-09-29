import { Leaf } from "lucide-react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-[#295943]">
      <span className={`${compact ? "size-9" : "size-10"} grid place-items-center rounded-full bg-[#edf5f1]`}>
        <Leaf className="size-5" strokeWidth={1.8} />
      </span>
      <div>
        <p className={`${compact ? "text-lg" : "text-xl"} font-extrabold tracking-[0.18em]`}>MIORA</p>
        <p className="text-[10px] font-semibold tracking-[0.16em] text-[#60796e]">PRESCHOOL</p>
      </div>
    </div>
  );
}
