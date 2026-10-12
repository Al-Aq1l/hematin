"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { formatRupiah, parseRupiahInput } from "@/lib/money";
import { formatDateIndo } from "@/lib/date";
import { getTransactions, updateTransaction, deleteTransaction } from "@/features/transactions/actions";
import { useQuickAdd } from "@/components/QuickAddProvider";
import {
  Receipt,
  Search,
  Plus,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

interface TransactionItem {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  note?: string | null;
  date: string;
  account: { id: string; name: string; type: string; icon?: string | null };
  category: { id: string; name: string; type: string; icon?: string | null; color?: string | null };
}

export default function TransactionsPage() {
  const router = useRouter();
  const { openQuickAdd } = useQuickAdd();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit / Details modal
  const [selectedTrx, setSelectedTrx] = useState<TransactionItem | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTransactions = () => {
    getTransactions({
      type: typeFilter === "ALL" ? undefined : typeFilter,
      search: searchQuery.trim() || undefined,
      limit: 50,
    })
      .then((data) => {
        setTransactions(data as TransactionItem[]);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    getTransactions({
      type: typeFilter === "ALL" ? undefined : typeFilter,
      search: searchQuery.trim() || undefined,
      limit: 50,
    })
      .then((data) => {
        if (isMounted) {
          setTransactions(data as TransactionItem[]);
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
  }, [typeFilter, searchQuery]);

  const openDetail = (trx: TransactionItem) => {
    setSelectedTrx(trx);
    setEditAmount(formatRupiah(trx.amount, { prefix: false }));
    setEditNote(trx.note || "");
    setEditDate(trx.date.slice(0, 10));
    setErrorMsg(null);
  };

  const handleUpdate = async () => {
    if (!selectedTrx) return;
    const parsedAmount = parseRupiahInput(editAmount);
    if (parsedAmount <= 0) {
      setErrorMsg("Nominal harus lebih besar dari Rp0.");
      return;
    }

    startTransition(async () => {
      const res = await updateTransaction({
        id: selectedTrx.id,
        amount: parsedAmount,
        type: selectedTrx.type,
        accountId: selectedTrx.account.id,
        categoryId: selectedTrx.category.id,
        date: editDate,
        note: editNote,
      });

      if (res.success) {
        setSelectedTrx(null);
        fetchTransactions();
        router.refresh();
      } else {
        setErrorMsg(res.error || "Gagal memperbarui transaksi.");
      }
    });
  };

  const handleDelete = async () => {
    if (!selectedTrx) return;
    if (!confirm(`Hapus transaksi ${formatRupiah(selectedTrx.amount)}?`)) return;

    startTransition(async () => {
      const res = await deleteTransaction(selectedTrx.id);
      if (res.success) {
        setSelectedTrx(null);
        fetchTransactions();
        router.refresh();
      } else {
        alert("Gagal menghapus transaksi.");
      }
    });
  };

  // Group transactions by date string (YYYY-MM-DD)
  const groupedByDate: { [dateStr: string]: TransactionItem[] } = {};
  for (const trx of transactions) {
    const dStr = trx.date.slice(0, 10);
    if (!groupedByDate[dStr]) {
      groupedByDate[dStr] = [];
    }
    groupedByDate[dStr].push(trx);
  }

  // Calculate daily subtotal
  const dateKeys = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col flex-1 pb-10">
      <Header title="Riwayat Transaksi" showGreeting={false} />

      <div className="px-5 space-y-3 mt-2">
        {/* Search & Type Filter stays visible while scrolling the list */}
        <div className="space-y-2 sticky top-16 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md py-2 -my-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi berdasarkan catatan..."
              enterKeyHint="search"
              aria-label="Cari transaksi"
              className="w-full pl-9 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-zinc-400"
            />
          </div>

          <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setTypeFilter("ALL")}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                typeFilter === "ALL"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("INCOME")}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                typeFilter === "INCOME"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-zinc-500"
              }`}
            >
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("EXPENSE")}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                typeFilter === "EXPENSE"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-zinc-500"
              }`}
            >
              Pengeluaran
            </button>
          </div>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="py-16 flex justify-center text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : dateKeys.length === 0 ? (
          <div className="p-12 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center flex flex-col items-center justify-center space-y-3 mt-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {searchQuery ? "Tidak ada transaksi yang cocok" : "Belum ada transaksi"}
              </h4>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs">
                {searchQuery
                  ? "Coba ubah kata kunci pencarian atau bersihkan filter."
                  : "Mulai catat uangmu hari ini dengan menekan tombol di bawah."}
              </p>
            </div>
            {!searchQuery && (
              <button
                type="button"
                onClick={openQuickAdd}
                className="mt-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Transaksi</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {dateKeys.map((dateStr) => {
              const dayTrxs = groupedByDate[dateStr];
              const dailyExpense = dayTrxs
                .filter((t) => t.type === "EXPENSE")
                .reduce((sum, t) => sum + t.amount, 0);
              const dailyIncome = dayTrxs
                .filter((t) => t.type === "INCOME")
                .reduce((sum, t) => sum + t.amount, 0);

              const subtotal = dailyIncome - dailyExpense;

              return (
                <div key={dateStr} className="space-y-1.5">
                  {/* Date Header & Subtotal */}
                  <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    <span>{formatDateIndo(dateStr, { withDay: true })}</span>
                    <span
                      className={`font-mono ${
                        subtotal > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : subtotal < 0
                          ? "text-zinc-600 dark:text-zinc-300"
                          : "text-zinc-400"
                      }`}
                    >
                      {formatRupiah(subtotal, { showSign: true })}
                    </span>
                  </div>

                  {/* Transactions of this date */}
                  <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 divide-y divide-zinc-100 dark:divide-zinc-800/60 overflow-hidden shadow-xs">
                    {dayTrxs.map((trx) => {
                      const isExpense = trx.type === "EXPENSE";
                      return (
                        <div
                          key={trx.id}
                          onClick={() => openDetail(trx)}
                          className="p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0"
                              style={{
                                backgroundColor: `${trx.category.color || "#6B7280"}20`,
                                color: trx.category.color || "#6B7280",
                              }}
                            >
                              <span>{trx.category.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                <span>{trx.note || trx.category.name}</span>
                              </div>
                              <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                                <span>{trx.category.name}</span>
                                <span>·</span>
                                <span>{trx.account.name}</span>
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit / Details Sheet */}
      {selectedTrx && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs backdrop-enter"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTrx(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Detail Transaksi"
        >
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))] sm:pb-5 border-t sm:border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto overscroll-contain sheet-enter">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>Detail Transaksi</span>
              </h2>
              <button
                type="button"
                onClick={() => setSelectedTrx(null)}
                aria-label="Tutup"
                className="p-2 -mr-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={editAmount}
                  onChange={(e) => {
                    const parsed = parseRupiahInput(e.target.value);
                    setEditAmount(parsed > 0 ? formatRupiah(parsed, { prefix: false }) : "");
                  }}
                  className="w-full px-3 py-2 text-base font-bold font-mono rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="text-[10px] text-zinc-400">Kategori</div>
                  <div className="font-semibold mt-0.5 flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: selectedTrx.category.color || "#6B7280" }}
                    />
                    <span>{selectedTrx.category.name}</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="text-[10px] text-zinc-400">Sumber Uang</div>
                  <div className="font-semibold mt-0.5">{selectedTrx.account.name}</div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Catatan
                </label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Catatan..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs">
                  {errorMsg}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTrx(null)}
                  className="py-2 px-3 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isPending}
                  className="py-2 px-4 text-xs rounded-xl bg-emerald-600 text-white font-semibold flex items-center gap-1.5"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
