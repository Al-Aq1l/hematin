"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/money";
import { DonutChart } from "@/components/charts/DonutChart";
import { BarChart6Months } from "@/components/charts/BarChart6Months";
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
                  className="p-3.5 rounded-[22px] bg-white/70 dark:bg-[#161a22]/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white/90 dark:hover:bg-[#1b202a]/80 flex flex-col justify-between transition-all group shadow-xs dark:shadow-md dark:shadow-black/20"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="text-sm font-bold font-mono text-zinc-900 dark:text-white truncate">
                      {formatRupiah(cat.amount)}
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 shrink-0">
                      {cat.percentage}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-medium text-zinc-300 truncate group-hover:text-white transition-colors">
                      {cat.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 4 Summary Cards with glassmorphism blend */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Income */}
          <div className="p-3.5 rounded-[20px] bg-white/70 dark:bg-[#161a22]/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs dark:shadow-md dark:shadow-black/20 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Pemasukan</span>
            </div>
            <div className="text-sm font-extrabold font-mono text-zinc-900 dark:text-zinc-100 truncate">
              {formatRupiah(summary.income)}
            </div>
          </div>

          {/* Expense */}
          <div className="p-3.5 rounded-[20px] bg-white/70 dark:bg-[#161a22]/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs dark:shadow-md dark:shadow-black/20 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span>Pengeluaran</span>
            </div>
            <div className="text-sm font-extrabold font-mono text-zinc-900 dark:text-zinc-100 truncate">
              {formatRupiah(summary.expense)}
            </div>
          </div>

          {/* Saving (Selisih) */}
          <div className="p-3.5 rounded-[20px] bg-white/70 dark:bg-[#161a22]/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs dark:shadow-md dark:shadow-black/20 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 mb-1">
              <PiggyBank className="w-4 h-4" />
              <span>Selisih</span>
            </div>
            <div
              className={`text-sm font-extrabold font-mono truncate ${
                summary.saving < 0
                  ? "text-rose-500"
                  : "text-zinc-900 dark:text-zinc-100"
              }`}
            >
              {formatRupiah(summary.saving)}
            </div>
          </div>

          {/* Saving Rate */}
          <div className="p-3.5 rounded-[20px] bg-white/70 dark:bg-[#161a22]/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs dark:shadow-md dark:shadow-black/20 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-500 mb-1">
              <Percent className="w-4 h-4" />
              <span>Saving Rate</span>
            </div>
            <div className="text-sm font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
              {summary.savingRate !== null ? `${summary.savingRate}%` : "—"}
            </div>
          </div>
        </div>

        {/* 6 Months Trend Bar Chart */}
        <div className="p-4 rounded-[24px] bg-white/70 dark:bg-[#161a22]/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs dark:shadow-md dark:shadow-black/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
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
