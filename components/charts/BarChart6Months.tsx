"use client";

import { formatRupiah } from "@/lib/money";
import { MonthlyTrendItem } from "@/features/statistics/actions";

interface BarChart6MonthsProps {
  data: MonthlyTrendItem[];
}

export function BarChart6Months({ data }: BarChart6MonthsProps) {
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.saving)), 1000000);
  const half = 65;

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2 h-[140px] px-1">
        {data.map((item, idx) => {
          const positive = item.saving >= 0;
          const h = Math.max(3, (Math.abs(item.saving) / maxAbs) * half);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="mb-1.5 text-[9px] font-mono tabular-nums text-white/40">
                {positive ? formatRupiah(item.saving).replace("Rp", "") : "−"}
              </span>
              <div
                className={`w-full max-w-[22px] rounded-t-md ${
                  positive ? "bg-white/15" : "bg-white/[0.05]"
                }`}
                style={{ height: `${h}px` }}
              />
              <span className="mt-2 text-[10px] tracking-wide uppercase text-white/30">
                {item.shortLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
