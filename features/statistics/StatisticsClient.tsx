"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/money";
import { categoryColor } from "@/lib/categoryColor";
import { DonutChart } from "@/components/charts/DonutChart";
import { BarChart6Months } from "@/components/charts/BarChart6Months";
import { useBalanceVisibility } from "@/components/BalanceVisibilityProvider";
import { StatisticsData } from "./actions";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  BarChart3,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
} from "lucide-react";

interface StatisticsClientProps {
  data: StatisticsData;
}

export function StatisticsClient({ data }: StatisticsClientProps) {
  const {
    year,
    month,
    monthLabel,
    prevYM,
    nextYM,
    summary,
    expenseBreakdown,
    incomeBreakdown,
    trend6Months,
  } = data;

  const [activeTab, setActiveTab] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [timeFilter, setTimeFilter] = useState<"WEEK" | "MONTH" | "YEAR">("MONTH");
  const { isHidden, isReady } = useBalanceVisibility();

  const activeBreakdown =
    activeTab === "EXPENSE" ? expenseBreakdown : incomeBreakdown;
  const activeTotal =
    activeTab === "EXPENSE" ? summary.expense : summary.income;

  const monthFirstWord = (monthLabel.split(" ")[0] || "MONTH").toUpperCase();

  return (
    <div className="space-y-6">
      {/* Top Header: < HOME on left, Calendar Month Year on right */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 sticky top-0 z-30 bg-white/80 dark:bg-[#0d1015]/85 backdrop-blur-xl backdrop-saturate-150 border-b border-zinc-200/40 dark:border-zinc-800/40">
        <Link
          href="/"
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          <span>HOME</span>
        </Link>

        {/* Month Navigator with Calendar Icon */}
        <div className="flex items-center gap-1.5 bg-white/80 dark:bg-[#1a1f28]/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-zinc-200/60 dark:border-zinc-700/60 shadow-sm">
          <Link
            href={`/statistics?year=${prevYM.year}&month=${prevYM.month}`}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
            <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span>{monthLabel.toUpperCase()}</span>
          </div>

          <Link
            href={`/statistics?year=${nextYM.year}&month=${nextYM.month}`}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Large Segmented Donut Ring */}
        <div className="flex flex-col items-center justify-center">
          <DonutChart
            items={activeBreakdown}
            total={activeTotal}
            centerSubtitle={`SPENT THIS ${monthFirstWord}`}
            emptyLabel={`Belum ada ${
              activeTab === "EXPENSE" ? "pengeluaran" : "pemasukan"
            }`}
          />

          {/* Filter Pills: WEEK | MONTH | YEAR */}
          <div className="flex items-center justify-center gap-6 mt-3 text-xs uppercase tracking-widest font-semibold">
            <button
              type="button"
              onClick={() => setTimeFilter("WEEK")}
              className={`transition-colors cursor-pointer ${
                timeFilter === "WEEK"
                  ? "text-zinc-900 dark:text-white font-bold"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              WEEK
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter("MONTH")}
              className={`transition-colors cursor-pointer ${
                timeFilter === "MONTH"
                  ? "text-zinc-900 dark:text-white font-bold"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              MONTH
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter("YEAR")}
              className={`transition-colors cursor-pointer ${
                timeFilter === "YEAR"
                  ? "text-zinc-900 dark:text-white font-bold"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              YEAR
            </button>
          </div>
        </div>

        {/* Section: Spending categories matching 2-column cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Spending categories
            </h2>

            {/* Income / Expense Toggle */}
            <div className="flex bg-white/70 dark:bg-[#161a22]/70 backdrop-blur-md p-0.5 rounded-xl text-[11px] font-semibold border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab("EXPENSE")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTab === "EXPENSE"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs"
                    : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
              >
                Keluar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("INCOME")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTab === "INCOME"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs"
                    : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
              >
                Masuk
              </button>
            </div>
          </div>

          {activeBreakdown.length === 0 ? (
            <div className="p-6 rounded-[22px] bg-white/70 dark:bg-[#161a22]/80 backdrop-blur-md border border-dashed border-zinc-300/80 dark:border-zinc-800/80 text-center shadow-xs dark:shadow-md dark:shadow-black/20">
              <p className="text-xs text-zinc-400">
                Belum ada transaksi di bulan ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {activeBreakdown.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/transactions?categoryId=${cat.id}&year=${year}&month=${month}`}
                  className="p-3.5 rounded-[22px] bg-white/[0.03] hover:bg-white/[0.06] flex flex-col justify-between transition-colors group"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="text-sm font-bold font-mono text-white truncate">
                      {formatRupiah(cat.amount)}
                    </div>
                    <span className="text-[11px] font-medium text-white/30 shrink-0">
                      {cat.percentage}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: categoryColor(cat.color) }}
                    />
                    <span className="text-xs font-medium text-white/40 truncate group-hover:text-white/70 transition-colors uppercase tracking-wide">
                      {cat.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Income */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 mb-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
              <span>Pemasukan</span>
            </div>
            <div className="text-sm font-semibold font-mono text-zinc-100 tracking-tight truncate">
              {formatRupiah(summary.income)}
            </div>
          </div>

          {/* Expense */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 mb-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-zinc-400" />
              <span>Pengeluaran</span>
            </div>
            <div className="text-sm font-semibold font-mono text-zinc-100 tracking-tight truncate">
              {formatRupiah(summary.expense)}
            </div>
          </div>

          {/* Saving (Selisih) */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 mb-1.5">
              <PiggyBank className="w-3.5 h-3.5 text-zinc-400" />
              <span>Selisih</span>
            </div>
            <div className="text-sm font-semibold font-mono text-zinc-100 tracking-tight truncate">
              {isReady && isHidden ? "••••••••" : formatRupiah(summary.saving, { showSign: true })}
            </div>
          </div>

          {/* Saving Rate */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 mb-1.5">
              <Percent className="w-3.5 h-3.5 text-zinc-400" />
              <span>Saving Rate</span>
            </div>
            <div className="text-sm font-semibold font-mono text-zinc-100 tracking-tight">
              {summary.savingRate !== null ? `${summary.savingRate}%` : "—"}
            </div>
          </div>
        </div>

        {/* 6 Months Trend Bar Chart */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
              <BarChart3 className="w-4 h-4 text-zinc-400" />
              <span>Tren 6 Bulan Terakhir</span>
            </div>
            <span className="text-[10px] text-zinc-400">Masuk vs Keluar</span>
          </div>

          <BarChart6Months data={trend6Months} />
        </div>
      </div>
    </div>
  );
}
