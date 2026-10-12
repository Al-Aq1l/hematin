"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/money";
import { DonutChart } from "@/components/charts/DonutChart";
import { BarChart6Months } from "@/components/charts/BarChart6Months";
import { StatisticsData } from "./actions";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon,
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

  const activeBreakdown =
    activeTab === "EXPENSE" ? expenseBreakdown : incomeBreakdown;
  const activeTotal =
    activeTab === "EXPENSE" ? summary.expense : summary.income;

  return (
    <div className="space-y-5">
      {/* Month Navigator */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800">
        <Link
          href={`/statistics?year=${prevYM.year}&month=${prevYM.month}`}
          className="p-2 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
          title="Bulan sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>

        <div className="text-center">
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            {monthLabel}
          </span>
        </div>

        <Link
          href={`/statistics?year=${nextYM.year}&month=${nextYM.month}`}
          className="p-2 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
          title="Bulan berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Income */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Pemasukan</span>
          </div>
          <div className="text-sm font-extrabold font-mono text-zinc-900 dark:text-zinc-100 truncate">
            {formatRupiah(summary.income)}
          </div>
        </div>

        {/* Expense */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 mb-1">
            <TrendingDown className="w-4 h-4" />
            <span>Pengeluaran</span>
          </div>
          <div className="text-sm font-extrabold font-mono text-zinc-900 dark:text-zinc-100 truncate">
            {formatRupiah(summary.expense)}
          </div>
        </div>

        {/* Saving (Selisih) */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
            <PiggyBank className="w-4 h-4" />
            <span>Selisih (Saving)</span>
          </div>
          <div
            className={`text-sm font-extrabold font-mono truncate ${
              summary.saving < 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-zinc-900 dark:text-zinc-100"
            }`}
          >
            {formatRupiah(summary.saving)}
          </div>
        </div>

        {/* Saving Rate */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">
            <Percent className="w-4 h-4" />
            <span>Saving Rate</span>
          </div>
          <div className="text-sm font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
            {summary.savingRate !== null ? `${summary.savingRate}%` : "—"}
          </div>
        </div>
      </div>

      {/* Donut Chart & Category Breakdown Section */}
      <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 space-y-4">
        {/* Header & Toggle (FR-STAT-6) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
            <PieChartIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Komposisi Kategori</span>
          </div>

          {/* Toggle Button */}
          <div className="flex bg-zinc-200/70 dark:bg-zinc-700/60 p-0.5 rounded-xl text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("EXPENSE")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === "EXPENSE"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("INCOME")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === "INCOME"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Pemasukan
            </button>
          </div>
        </div>

        {/* Donut Chart */}
        <DonutChart
          items={activeBreakdown}
          total={activeTotal}
          emptyLabel={`Belum ada ${
            activeTab === "EXPENSE" ? "pengeluaran" : "pemasukan"
          }`}
        />

        {/* Category List (FR-STAT-5) */}
        {activeBreakdown.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
            {activeBreakdown.map((cat) => (
              <Link
                key={cat.id}
                href={`/transactions?categoryId=${cat.id}&year=${year}&month=${month}`}
                className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-700/40 flex items-center justify-between hover:border-zinc-300 dark:hover:border-zinc-600 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                    style={{
                      backgroundColor: `${cat.color}20`,
                      color: cat.color,
                    }}
                  >
                    <span>{cat.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {cat.name}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {cat.transactionCount} transaksi
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {formatRupiah(cat.amount)}
                  </div>
                  <div className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                    {cat.percentage}%
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 6 Months Trend Bar Chart (FR-STAT-4) */}
      <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Tren 6 Bulan Terakhir</span>
          </div>
          <span className="text-[10px] text-zinc-400">Masuk vs Keluar</span>
        </div>

        <BarChart6Months data={trend6Months} />
      </div>
    </div>
  );
}
