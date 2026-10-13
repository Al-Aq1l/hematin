"use client";

import { useState, useEffect, useTransition } from "react";
import { Header } from "@/components/Header";
import { formatRupiah, parseRupiahInput } from "@/lib/money";
import { getCurrentYearMonthWIB } from "@/lib/date";
import {
  getBudgetData,
  upsertBudget,
  deleteBudget,
  copyBudgetsFromPreviousMonth,
  CategoryBudgetItem,
} from "@/features/budgets/actions";
import {
  Target,
  ChevronLeft,
  ChevronRight,
  Copy,
  Plus,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const INDO_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function BudgetPage() {
  const currentYM = getCurrentYearMonthWIB();
  const [selectedYear, setSelectedYear] = useState(currentYM.year);
  const [selectedMonth, setSelectedMonth] = useState(currentYM.month);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalBudget: number;
    totalUsed: number;
    totalRemaining: number;
    percentage: number;
    status: string;
    statusLabel: string;
    items: CategoryBudgetItem[];
    remainingDays: number;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  // Edit / Set Budget Modal
  const [selectedCat, setSelectedCat] = useState<CategoryBudgetItem | null>(null);
  const [budgetAmountInput, setBudgetAmountInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"DELETE_BUDGET" | "COPY_PREV" | null>(null);

  const loadData = () => {
    getBudgetData(selectedYear, selectedMonth)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    getBudgetData(selectedYear, selectedMonth)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error(e);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedYear, selectedMonth]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const openSetBudget = (item: CategoryBudgetItem) => {
    setSelectedCat(item);
    setBudgetAmountInput(
      item.budgetAmount > 0
        ? formatRupiah(item.budgetAmount, { prefix: false })
        : ""
    );
    setErrorMsg(null);
  };

  const handleSaveBudget = () => {
    if (!selectedCat) return;
    const amount = parseRupiahInput(budgetAmountInput);
    if (amount <= 0) {
      setErrorMsg("Budget harus lebih besar dari Rp0.");
      return;
    }

    startTransition(async () => {
      const res = await upsertBudget({
        categoryId: selectedCat.categoryId,
        amount,
        month: selectedMonth,
        year: selectedYear,
      });

      if (res.success) {
        setSelectedCat(null);
        loadData();
      } else {
        setErrorMsg(res.error || "Gagal menyimpan budget.");
      }
    });
  };

  const handleDeleteBudget = () => {
    if (!selectedCat?.budgetId) return;
    setConfirmAction("DELETE_BUDGET");
  };

  const runDeleteBudget = () => {
    if (!selectedCat?.budgetId) return;
    setConfirmAction(null);

    startTransition(async () => {
      const res = await deleteBudget(selectedCat.budgetId!);
      if (res.success) {
        setSelectedCat(null);
        loadData();
      } else {
        setPageError("Gagal menghapus budget.");
      }
    });
  };

  const handleCopyFromPrev = () => {
    setConfirmAction("COPY_PREV");
  };

  const runCopyFromPrev = () => {
    setConfirmAction(null);

    startTransition(async () => {
      const res = await copyBudgetsFromPreviousMonth({
        targetMonth: selectedMonth,
        targetYear: selectedYear,
      });

      if (res.success) {
        loadData();
      } else {
        setPageError("Gagal menyalin budget.");
      }
    });
  };

  const statusColorClass = (status: string) => {
    switch (status) {
      case "SAFE":
        return {
          bar: "bg-emerald-500",
          badge: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
        };
      case "WARNING":
        return {
          bar: "bg-amber-500",
          badge: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
        };
      case "CRITICAL":
        return {
          bar: "bg-orange-500",
          badge: "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400",
        };
      case "OVER_BUDGET":
      default:
        return {
          bar: "bg-rose-500",
          badge: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
        };
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-10">
      <Header title="Anggaran Bulanan" showGreeting={false} />

      <div className="px-5 space-y-4 mt-2">
        {/* Month Selector Bar with Navigation */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white/70 dark:bg-[#161a22]/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer"
            aria-label="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {INDO_MONTHS[selectedMonth - 1]} {selectedYear}
            </div>
            {selectedYear === currentYM.year && selectedMonth === currentYM.month ? (
              <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Bulan Ini ({data?.remainingDays} hari tersisa)
              </div>
            ) : (
              <div className="text-[10px] text-zinc-400">Arsip Periode</div>
            )}
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer"
            aria-label="Bulan Berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {pageError && (
          <div
            role="alert"
            className="flex items-center justify-between gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400"
          >
            <span>{pageError}</span>
            <button
              type="button"
              onClick={() => setPageError(null)}
              aria-label="Tutup pesan"
              className="p-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="py-20 flex justify-center text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : !data ? null : (
          <>
            {/* Total Budget Summary Card */}
            <div className="p-4 rounded-3xl bg-zinc-900/85 text-white dark:bg-[#161a22]/80 backdrop-blur-md border border-zinc-800/80 dark:border-zinc-700/80 space-y-3 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">Total Anggaran</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    statusColorClass(data.status).badge
                  }`}
                >
                  {data.percentage}% · {data.statusLabel}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-700/60 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    statusColorClass(data.status).bar
                  }`}
                  style={{ width: `${Math.min(100, data.percentage)}%` }}
                />
              </div>

              {/* Numbers */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800 dark:border-zinc-700/80">
                <div>
                  <div className="text-[10px] text-zinc-400">Terpakai</div>
                  <div className="text-sm font-bold font-mono text-zinc-100">
                    {formatRupiah(data.totalUsed)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-400">
                    {data.totalRemaining >= 0 ? "Tersisa" : "Defisit"}
                  </div>
                  <div
                    className={`text-sm font-bold font-mono ${
                      data.totalRemaining < 0 ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {formatRupiah(data.totalRemaining)}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions (Copy from last month) */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Kategori Pengeluaran
              </div>
              <button
                type="button"
                onClick={handleCopyFromPrev}
                disabled={isPending}
                className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Bulan Lalu</span>
              </button>
            </div>

            {/* Categories Budget List */}
            <div className="space-y-2.5">
              {data.items.map((item) => {
                const colors = statusColorClass(item.status);
                return (
                  <div
                    key={item.categoryId}
                    onClick={() => openSetBudget(item)}
                    className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-[#161a22]/80 backdrop-blur-md hover:bg-white/90 dark:hover:bg-[#1b202a]/80 transition-all cursor-pointer shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs"
                          style={{
                            backgroundColor: `${item.categoryColor || "#6B7280"}20`,
                            color: item.categoryColor || "#6B7280",
                          }}
                        >
                          {item.categoryName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {item.categoryName}
                          </div>
                          {item.hasBudget && item.dailySafeSpend > 0 && (
                            <div className="text-[10px] text-zinc-400">
                              Aman: ~{formatRupiah(item.dailySafeSpend)}/hari
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Amount / Status */}
                      <div className="text-right">
                        {item.hasBudget ? (
                          <>
                            <div className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100">
                              {formatRupiah(item.usedAmount)} / {formatRupiah(item.budgetAmount)}
                            </div>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full inline-block mt-0.5 ${colors.badge}`}
                            >
                              {item.percentage}% · {item.statusLabel}
                            </span>
                          </>
                        ) : (
                          <div className="text-right">
                            <div className="text-xs font-mono text-zinc-400">
                              Keluar: {formatRupiah(item.usedAmount)}
                            </div>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5 justify-end mt-0.5">
                              <Plus className="w-3 h-3" />
                              <span>Atur Budget</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category Progress Bar (if budget is set) */}
                    {item.hasBudget && (
                      <div className="w-full bg-zinc-100 dark:bg-zinc-700/60 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${colors.bar}`}
                          style={{ width: `${Math.min(100, item.percentage)}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Set / Edit Budget Sheet */}
      {selectedCat && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs backdrop-enter"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCat(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Budget ${selectedCat.categoryName}`}
        >
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))] sm:pb-5 border-t sm:border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto overscroll-contain sheet-enter">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Anggaran: {selectedCat.categoryName}</span>
              </h2>
              <button
                type="button"
                onClick={() => setSelectedCat(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-zinc-500">
                Tentukan batas pengeluaran untuk {selectedCat.categoryName} pada periode{" "}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {INDO_MONTHS[selectedMonth - 1]} {selectedYear}
                </span>.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Nominal Budget (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={budgetAmountInput}
                  onChange={(e) => {
                    const parsed = parseRupiahInput(e.target.value);
                    setBudgetAmountInput(parsed > 0 ? formatRupiah(parsed, { prefix: false }) : "");
                  }}
                  placeholder="0"
                  className="w-full px-3 py-2.5 text-lg font-bold font-mono rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Current status preview */}
              {selectedCat.usedAmount > 0 && (
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-xs flex justify-between items-center text-zinc-500">
                  <span>Pengeluaran saat ini:</span>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {formatRupiah(selectedCat.usedAmount)}
                  </span>
                </div>
              )}

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              {selectedCat.budgetId ? (
                <button
                  type="button"
                  onClick={handleDeleteBudget}
                  disabled={isPending}
                  className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCat(null)}
                  className="py-3 px-4 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveBudget}
                  disabled={isPending}
                  className="flex-1 py-3 px-4 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline confirmation sheet (replaces blocking browser confirm()) */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs backdrop-enter"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmAction(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))] sm:pb-5 border-t sm:border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 sheet-enter">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {confirmAction === "DELETE_BUDGET" ? "Hapus budget ini?" : "Salin budget bulan lalu?"}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  {confirmAction === "DELETE_BUDGET"
                    ? `Budget untuk ${selectedCat?.categoryName} akan dihapus. Catatan transaksi tetap aman.`
                    : `Semua nominal budget ${INDO_MONTHS[selectedMonth === 1 ? 11 : selectedMonth - 2]} akan disalin ke periode ini.`}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmAction === "DELETE_BUDGET" ? runDeleteBudget : runCopyFromPrev}
                disabled={isPending}
                className={`flex-1 py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 ${
                  confirmAction === "DELETE_BUDGET"
                    ? "bg-rose-600 hover:bg-rose-500"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{confirmAction === "DELETE_BUDGET" ? "Hapus" : "Salin"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
