"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/money";
import { MonthlyTrendItem } from "@/features/statistics/actions";

interface BarChart6MonthsProps {
  data: MonthlyTrendItem[];
}

export function BarChart6Months({ data }: BarChart6MonthsProps) {
  const [selectedMonth, setSelectedMonth] = useState<MonthlyTrendItem | null>(null);

  // Find max value across all months for scale
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense)),
    1000000 // default minimum floor
  );

  const chartHeight = 160;

  return (
    <div className="space-y-3">
      {/* Legend & Details */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Masuk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Keluar</span>
          </div>
        </div>

        {selectedMonth ? (
          <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
            {selectedMonth.label}
          </span>
        ) : (
          <span className="text-[10px] text-zinc-400">Ketuk batang untuk rincian</span>
        )}
      </div>

      {/* Selected Month Tooltip Card */}
      {selectedMonth && (
        <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div>
            <div className="text-[10px] text-zinc-400">Pemasukan</div>
            <div className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatRupiah(selectedMonth.income)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-400">Pengeluaran</div>
            <div className="font-bold font-mono text-rose-600 dark:text-rose-400">
              {formatRupiah(selectedMonth.expense)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-400">Selisih</div>
            <div
              className={`font-bold font-mono ${
                selectedMonth.saving >= 0
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatRupiah(selectedMonth.saving)}
            </div>
          </div>
        </div>
      )}

      {/* Bar Chart Area */}
      <div className="relative pt-4 pb-1">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="border-b border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="border-b border-dashed border-zinc-200 dark:border-zinc-800" />
        </div>

        <div className="grid grid-cols-6 gap-2 items-end h-[160px] relative z-10 px-1">
          {data.map((item, idx) => {
            const incomeHeight = maxValue > 0 ? (item.income / maxValue) * (chartHeight - 30) : 0;
            const expenseHeight = maxValue > 0 ? (item.expense / maxValue) * (chartHeight - 30) : 0;
            const isSelected = selectedMonth?.label === item.label;

            return (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  setSelectedMonth((prev) => (prev?.label === item.label ? null : item))
                }
                className={`flex flex-col items-center justify-end h-full group focus:outline-hidden p-1 rounded-xl transition-all ${
                  isSelected ? "bg-zinc-200/50 dark:bg-zinc-800" : "hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40"
                }`}
              >
                {/* Bars Pair */}
                <div className="flex items-end gap-1 h-[130px] w-full justify-center">
                  {/* Income bar */}
                  <div
                    className="w-2.5 sm:w-3 bg-emerald-500 rounded-t-sm transition-all duration-300"
                    style={{ height: `${Math.max(4, incomeHeight)}px` }}
                  />
                  {/* Expense bar */}
                  <div
                    className="w-2.5 sm:w-3 bg-rose-500 rounded-t-sm transition-all duration-300"
                    style={{ height: `${Math.max(4, expenseHeight)}px` }}
                  />
                </div>

                {/* Month label */}
                <span
                  className={`mt-2 text-[10px] font-medium transition-colors ${
                    isSelected
                      ? "text-zinc-900 dark:text-zinc-100 font-bold"
                      : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                  }`}
                >
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
