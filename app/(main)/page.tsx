import Link from "next/link";
import { Header } from "@/components/Header";
import { formatRupiah } from "@/lib/money";
import { formatDateIndo } from "@/lib/date";
import { getDashboardData } from "@/features/dashboard/actions";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PlusCircle,
  ChevronRight,
  Target,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { totalBalance, accounts, summary, budget, recentTransactions } = data;

  const budgetStatusColors = {
    SAFE: "bg-emerald-500 text-emerald-600 dark:text-emerald-400",
    WARNING: "bg-amber-500 text-amber-600 dark:text-amber-400",
    CRITICAL: "bg-orange-500 text-orange-600 dark:text-orange-400",
    OVER_BUDGET: "bg-rose-500 text-rose-600 dark:text-rose-400",
  }[budget.status];

  return (
    <div className="flex flex-col flex-1 pb-6">
      <Header />

      <div className="px-5 space-y-4 mt-2">
        {/* Total Saldo Card */}
        <div className="p-5 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="flex items-center justify-between text-emerald-100 text-xs font-medium mb-1">
            <span>Total Saldo</span>
            <Wallet className="w-4 h-4 opacity-80" />
          </div>
          <div className="text-3xl font-extrabold tracking-tight font-mono">
            {formatRupiah(totalBalance)}
          </div>
          <p className="text-[11px] text-emerald-100/80 mt-1">
            Saldo aktif seluruh akun (termasuk saldo awal)
          </p>

          {/* Accounts breakdown row */}
          <Link
            href="/settings/accounts"
            className="mt-4 pt-3 border-t border-emerald-500/40 flex items-center justify-between text-xs text-emerald-100 hover:text-white transition-colors cursor-pointer"
          >
            <span>Rincian Saldo Akun</span>
            <div className="flex items-center gap-1 font-semibold">
              <span>{accounts.length} Akun</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>

        {/* If no accounts exist yet, show onboarding banner */}
        {accounts.length === 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Setup Akun Pertamamu
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                Tambahkan rekening (misal Cash atau BCA) untuk mulai mencatat.
              </div>
            </div>
            <Link
              href="/settings/accounts"
              className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shrink-0 ml-2"
            >
              Tambah
            </Link>
          </div>
        )}

        {/* Monthly Summary Cards (Income, Expense, Selisih Arus Kas) */}
        <div className="grid grid-cols-3 gap-2">
          {/* Pemasukan */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </div>
            <div className="text-xs font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
              {formatRupiah(summary.income)}
            </div>
          </div>

          {/* Pengeluaran */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 mb-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </div>
            <div className="text-xs font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
              {formatRupiah(summary.expense)}
            </div>
          </div>

          {/* Selisih Bulan Ini (Saving / Arus Kas Bersih) */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                <PiggyBank className="w-3.5 h-3.5" />
                <span>Selisih</span>
              </div>
              <span
                className={`text-[9px] px-1 py-0.5 rounded font-medium ${
                  summary.saving < 0
                    ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                    : summary.saving > 0
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                }`}
              >
                {summary.saving < 0 ? "Defisit" : summary.saving > 0 ? "Surplus" : "0"}
              </span>
            </div>
            <div
              className={`text-xs font-bold font-mono tracking-tight truncate ${
                summary.saving < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-zinc-900 dark:text-zinc-100"
              }`}
              title="Selisih arus kas bulan ini (Pemasukan - Pengeluaran)"
            >
              {formatRupiah(summary.saving, { showSign: true })}
            </div>
          </div>
        </div>

        {/* Budget Bulan Ini Card */}
        <Link
          href="/budget"
          className="block p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
              <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Budget Bulan Ini</span>
            </div>
            <span className="text-[11px] text-zinc-400 flex items-center gap-0.5">
              <span>{budget.hasBudgets ? "Detail" : "Atur Budget"}</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                budgetStatusColors.split(" ")[0]
              }`}
              style={{ width: `${Math.min(100, budget.percentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
            <span>
              {formatRupiah(budget.usedAmount)} / {formatRupiah(budget.budgetAmount)}
            </span>
            <span className={`font-semibold ${budgetStatusColors.split(" ")[1]}`}>
              {budget.percentage}% · {budget.statusLabel}
            </span>
          </div>
        </Link>

        {/* Recent Transactions Section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Transaksi Terakhir
            </h3>
            {recentTransactions.length > 0 && (
              <Link
                href="/transactions"
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-0.5"
              >
                <span>Lihat semua</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {recentTransactions.length === 0 ? (
            <div className="p-8 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <PlusCircle className="w-5 h-5" />
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                Belum ada transaksi bulan ini.
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-xs">
                Ketuk tombol &apos;+&apos; di bawah untuk mencatat transaksi dengan cepat.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 divide-y divide-zinc-100 dark:divide-zinc-800/60 overflow-hidden shadow-xs">
              {recentTransactions.map((trx) => {
                const isExpense = trx.type === "EXPENSE";
                return (
                  <div
                    key={trx.id}
                    className="p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0"
                        style={{
                          backgroundColor: `${trx.categoryColor || "#6B7280"}20`,
                          color: trx.categoryColor || "#6B7280",
                        }}
                      >
                        <span>{trx.categoryName.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
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
                      <div
                        className={`text-xs font-bold font-mono ${
                          isExpense
                            ? "text-zinc-900 dark:text-zinc-100"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
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
