"use client";

import { formatRupiah } from "@/lib/money";
import { categoryColor } from "@/lib/categoryColor";

export interface DonutChartItem {
  id: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

interface DonutChartProps {
  items: DonutChartItem[];
  total: number;
  emptyLabel?: string;
  centerSubtitle?: string;
}

export function DonutChart({
  items,
  total,
  emptyLabel = "Belum ada transaksi",
  centerSubtitle,
}: DonutChartProps) {
  if (total <= 0 || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-[240px] h-[240px] rounded-full bg-white/[0.03] flex items-center justify-center">
          <span className="text-xs text-zinc-500 font-medium">{emptyLabel}</span>
        </div>
      </div>
    );
  }

  const size = 240;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // ponytail: gap fixed-length; upgrade when kategori bisa <5 (gap sudut konstan per-radian)
  const gap = items.length > 1 ? strokeWidth * 0.9 : 0;

  // Calculate cumulative offsets
  const offsets: number[] = [];
  let accumulatedPercent = 0;
  for (const item of items) {
    offsets.push(-accumulatedPercent * circumference);
    accumulatedPercent += item.amount / total;
  }

  const slices = items.map((item, index) => {
    const rawLen = (item.amount / total) * circumference;
    // strokeLinecap round menambah strokeWidth/2 di tiap ujung; kurangi supaya panjang visual presisi
    const arcLen = Math.max(0.5, rawLen - gap - strokeWidth);
    return {
      ...item,
      strokeDasharray: `${arcLen} ${circumference}`,
      strokeDashoffset: offsets[index] - gap / 2 - strokeWidth / 2,
      index,
    };
  });

  return (
    <div className="flex flex-col items-center justify-center py-2 select-none">
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Segmented Slices with rounded ends and gap */}
          {slices.map((slice) => (
            <circle
              key={slice.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={categoryColor(slice.color)}
              strokeWidth={strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6 text-center">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">
            {centerSubtitle || "SPENT THIS MONTH"}
          </span>
          <span className="mt-1 text-2xl sm:text-[28px] font-semibold tracking-tight text-white leading-none">
            {formatRupiah(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
