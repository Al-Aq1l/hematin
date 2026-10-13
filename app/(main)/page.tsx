import Link from "next/link";
import { Header } from "@/components/Header";
import { DebitCard } from "@/components/DebitCard";
import { formatRupiah } from "@/lib/money";
import { formatDateIndo } from "@/lib/date";
import { getDashboardData } from "@/features/dashboard/actions";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  ChevronRight,
  Target,
  ArrowRight,
  PlusCircle,
} from "lucide-react";

const accountTypeLabels: Record<string, string> = {
  BANK: "Rekening Bank",
  EWALLET: "E-Wallet",
  CASH: "Uang Tunai",
  OTHER: "Akun",
};

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { totalBalance, accounts, summary, budget, recentTransactions } = data;

  const budgetStatusColors = {
    SAFE: "bg-zinc-200 text-zinc-300",
    WARNING: "bg-zinc-400 text-zinc-300",
    CRITICAL: "bg-zinc-500 text-zinc-300",
    OVER_BUDGET: "bg-zinc-600 text-zinc-300",
  }[budget.status];

  return (
    <div className="flex flex-col flex-1 pb-6">
      {/* Top Header: Avatar, Search Bar, Settings */}
      <Header isDashboard={true} />

      <div className="px-5 space-y-4 mt-1">
        {/* Section: Debit card Hero */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h1 className="text-lg font-bold tracking-tight text-white">
              Debit card
            </h1>
            <Link
              href="/settings/accounts"
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Tambah Akun"
              title="Tambah / Kelola Akun"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>

          {/* Authentic Reference Debit Card */}
          <DebitCard accounts={accounts} totalBalance={totalBalance} />
        </div>

        {/* 3 Monthly Cash Flow Cards: Minimalist clean dark cards */}
        <div className="grid grid-cols-3 gap-2">
          {/* Masuk */}
          <div className="p-3.5 rounded-2xl bg-[#161a22]/80 backdrop-blur-md border border-zinc-800/80 shadow-md shadow-black/25 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 mb-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
              <span>Masuk</span>
            </div>
            <div className="text-xs sm:text-sm font-bold font-mono tracking-tight text-zinc-100 truncate">
              {formatRupiah(summary.income)}
            </div>
          </div>

          {/* Keluar */}
          <div className="p-3.5 rounded-2xl bg-[#161a22]/80 backdrop-blur-md border border-zinc-800/80 shadow-md shadow-black/25 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 mb-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-zinc-400" />
              <span>Keluar</span>
            </div>
            <div className="text-xs sm:text-sm font-bold font-mono tracking-tight text-zinc-100 truncate">
              {formatRupiah(summary.expense)}
            </div>
          </div>

          {/* Selisih (Saving / Arus Kas Bersih) */}
          <div className="p-3.5 rounded-2xl bg-[#161a22]/80 backdrop-blur-md border border-zinc-800/80 shadow-md shadow-black/25 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                <PiggyBank className="w-3.5 h-3.5 text-zinc-400" />
                <span>Selisih</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium tracking-tight bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                {summary.saving < 0 ? "Defisit" : summary.saving > 0 ? "Surplus" : "0"}
              </span>
            </div>
            <div
              className="text-xs sm:text-sm font-bold font-mono tracking-tight text-zinc-100 truncate"
              title="Selisih arus kas bulan ini"
            >
              {formatRupiah(summary.saving, { showSign: true })}
            </div>
          </div>
        </div>

        {/* Section: Your accounts */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">
              Your accounts
            </h2>
            <Link
              href="/settings/accounts"
              className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-0.5 font-medium transition-colors"
            >
              <span>Kelola</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {accounts.length === 0 ? (
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 backdrop-blur-md border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Setup Akun Pertamamu
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                  Tambahkan rekening untuk mulai mencatat.
                </div>
              </div>
              <Link
                href="/settings/accounts"
                className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shrink-0 ml-2"
              >
                Tambah
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {accounts.map((acc) => {
                return (
                  <Link
                    key={acc.id}
                    href={`/transactions?accountId=${acc.id}`}
                    className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#161a22]/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white/90 dark:hover:bg-[#1b202a]/80 flex items-center justify-between transition-all cursor-pointer group shadow-xs dark:shadow-md dark:shadow-black/25"
                  >
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                        {acc.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {accountTypeLabels[acc.type] || "Akun"}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-zinc-900 dark:text-white">
                        {formatRupiah(acc.balance)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Budget Bulan Ini Card: Crisp border and track */}
        <Link
          href="/budget"
          className="block p-4 rounded-2xl bg-[#161a22]/80 backdrop-blur-md border border-zinc-800/80 hover:border-zinc-700 hover:bg-[#1b202a]/80 space-y-2.5 transition-all cursor-pointer shadow-md shadow-black/25"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
              <Target className="w-4 h-4 text-zinc-400" />
              <span>Budget Bulan Ini</span>
            </div>
            <span className="text-[11px] text-zinc-400 flex items-center gap-0.5">
              <span>{budget.hasBudgets ? "Detail" : "Atur Budget"}</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          <div className="w-full bg-zinc-800/80 h-2 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 bg-zinc-300"
              style={{ width: `${Math.min(100, budget.percentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-300 font-mono">
            <span>
              {formatRupiah(budget.usedAmount)} / {formatRupiah(budget.budgetAmount)}
            </span>
            <span className="font-medium text-zinc-400">
              {budget.percentage}% · {budget.statusLabel}
            </span>
          </div>
        </Link>

        {/* Recent Transactions Section: High contrast container */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Transaksi Terakhir
            </h3>
            {recentTransactions.length > 0 && (
              <Link
                href="/transactions"
                className="text-[11px] text-zinc-400 hover:text-white font-medium flex items-center gap-0.5 transition-colors"
              >
                <span>Lihat semua</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {recentTransactions.length === 0 ? (
            <div className="p-8 rounded-3xl border border-dashed border-zinc-800/80 bg-[#161a22]/40 backdrop-blur-md text-center flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center">
                <PlusCircle className="w-5 h-5" />
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                Belum ada transaksi bulan ini.
              </p>
              <p className="text-[11px] text-zinc-500 max-w-xs">
                Ketuk tombol kartu di navigasi bawah untuk mencatat transaksi dengan cepat.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800/80 bg-[#161a22]/80 backdrop-blur-md divide-y divide-zinc-800/70 overflow-hidden shadow-md shadow-black/25">
              {recentTransactions.map((trx) => {
                const isExpense = trx.type === "EXPENSE";
                return (
                  <div
                    key={trx.id}
                    className="p-3.5 flex items-center justify-between hover:bg-[#1b202a]/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs bg-zinc-800/90 text-zinc-300 border border-zinc-700/40"
                      >
                        <span>{trx.categoryName.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-100">
                          {trx.note || trx.categoryName}
                        </div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <span>{trx.categoryName}</span>
                          <span>·</span>
                          <span>{trx.accountName}</span>
                          <span>·</span>
                          <span>{formatDateIndo(trx.date, { shortMonth: true })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-zinc-100">
                        {formatRupiah(trx.amount, {
                          showSign: !isExpense,
                          prefix: true,
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
