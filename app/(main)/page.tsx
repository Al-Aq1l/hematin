import Link from "next/link";
import { Header } from "@/components/Header";
import { DebitCard } from "@/components/DebitCard";
import { MaskedBalance } from "@/components/MaskedBalance";
import { CashFlowCards } from "@/components/CashFlowCards";
import { formatRupiah } from "@/lib/money";
import { formatDateIndo } from "@/lib/date";
import { getDashboardData } from "@/features/dashboard/actions";
import {
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
        <CashFlowCards summary={summary} />

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
                    className="p-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
                        {acc.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {accountTypeLabels[acc.type] || "Akun"}
                      </div>
                    </div>

                    <div className="text-sm font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                      <MaskedBalance amount={acc.balance} />
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
          className="block p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] space-y-2.5 transition-colors cursor-pointer"
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

          <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
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
            <div className="p-8 rounded-2xl bg-white/[0.03] text-center flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white/[0.06] text-zinc-500 flex items-center justify-center">
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
            <div className="rounded-2xl bg-white/[0.03] divide-y divide-white/[0.04] overflow-hidden">
              {recentTransactions.map((trx) => {
                const isExpense = trx.type === "EXPENSE";
                return (
                  <div
                    key={trx.id}
                    className="p-3.5 flex items-center justify-between hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-xs shrink-0 bg-white/[0.06] text-zinc-400"
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
