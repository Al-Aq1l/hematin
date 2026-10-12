"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/money";

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
}

export function DonutChart({
  items,
  total,
  emptyLabel = "Belum ada transaksi",
}: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (total <= 0 || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-40 h-40 rounded-full border-4 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
          <span className="text-xs text-zinc-400 font-medium">{emptyLabel}</span>
        </div>
      </div>
    );
  }

  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate cumulative offsets
  const offsets: number[] = [];
  let accumulatedPercent = 0;
  for (const item of items) {
    offsets.push(-accumulatedPercent * circumference);
    accumulatedPercent += item.amount / total;
  }
  const slices = items.map((item, index) => ({
    ...item,
    strokeDasharray: `${(item.amount / total) * circumference} ${circumference}`,
    strokeDashoffset: offsets[index],
    index,
  }));

  const activeItem = hoveredIndex !== null ? items[hoveredIndex] : null;

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="relative w-[200px] h-[200px] flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-zinc-100 dark:text-zinc-800/80"
          />

          {/* Slices */}
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.index;
            return (
              <circle
                key={slice.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() =>
                  setHoveredIndex((prev) => (prev === slice.index ? null : slice.index))
                }
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
          {activeItem ? (
            <>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate max-w-[120px]">
                {activeItem.name}
              </span>
              <span className="text-sm font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                {formatRupiah(activeItem.amount)}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {activeItem.percentage}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                Total
              </span>
              <span className="text-sm font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                {formatRupiah(total)}
              </span>
              <span className="text-[10px] text-zinc-400">
                {items.length} Kategori
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
