"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah, parseRupiahInput } from "@/lib/money";
import { toWIBDateInputString } from "@/lib/date";
import { createTransaction } from "./actions";
import { useQuickAdd } from "@/components/QuickAddProvider";
import { Check, Plus, Loader2, AlertCircle } from "lucide-react";

interface AccountOption {
  id: string;
  name: string;
  icon?: string | null;
  balance: number;
}

interface CategoryOption {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon?: string | null;
  color?: string | null;
}

interface QuickAddFormProps {
  accounts: AccountOption[];
  categories: CategoryOption[];
  defaultAccountId?: string;
  defaultExpenseCategoryId?: string;
  defaultIncomeCategoryId?: string;
  onSuccess?: () => void;
}

export function QuickAddForm({
  accounts,
  categories,
  defaultAccountId,
  defaultExpenseCategoryId,
  defaultIncomeCategoryId,
  onSuccess,
}: QuickAddFormProps) {
  const router = useRouter();
  const { closeQuickAdd } = useQuickAdd();
  const amountInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [displayAmount, setDisplayAmount] = useState<string>("");
  const [rawAmount, setRawAmount] = useState<number>(0);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    defaultAccountId || accounts[0]?.id || ""
  );

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = categories.filter((c) => c.type === "INCOME");

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    defaultExpenseCategoryId || expenseCategories[0]?.id || ""
  );

  const [date, setDate] = useState<string>(toWIBDateInputString());
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Focus nominal input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      amountInputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // When type changes, switch default category
  const handleTypeChange = (newType: "EXPENSE" | "INCOME") => {
    setType(newType);
    if (newType === "EXPENSE") {
      setSelectedCategoryId(defaultExpenseCategoryId || expenseCategories[0]?.id || "");
    } else {
      setSelectedCategoryId(defaultIncomeCategoryId || incomeCategories[0]?.id || "");
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseRupiahInput(e.target.value);
    setRawAmount(parsed);
    setDisplayAmount(parsed > 0 ? formatRupiah(parsed, { prefix: false }) : "");
    if (errorMsg) setErrorMsg(null);
  };

  const handleAddShortcut = (increment: number) => {
    const newAmount = rawAmount + increment;
    setRawAmount(newAmount);
    setDisplayAmount(formatRupiah(newAmount, { prefix: false }));
    if (errorMsg) setErrorMsg(null);
  };

  const activeCategories = type === "EXPENSE" ? expenseCategories : incomeCategories;

  const handleSubmit = async (keepOpen = false) => {
    if (rawAmount <= 0) {
      setErrorMsg("Nominal harus lebih besar dari Rp0.");
      amountInputRef.current?.focus();
      return;
    }
    if (!selectedAccountId) {
      setErrorMsg("Pilih sumber uang.");
      return;
    }
    if (!selectedCategoryId) {
      setErrorMsg("Pilih kategori terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await createTransaction({
      amount: rawAmount,
      type,
      accountId: selectedAccountId,
      categoryId: selectedCategoryId,
      date,
      note,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || "Gagal menyimpan transaksi.");
      return;
    }

    router.refresh();
    onSuccess?.();

    if (keepOpen) {
      // Reset form for next entry
      setRawAmount(0);
      setDisplayAmount("");
      setNote("");
      amountInputRef.current?.focus();
    } else {
      closeQuickAdd();
    }
  };

  return (
    <div className="space-y-4">
      {/* Type Selector (Tabs) */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => handleTypeChange("EXPENSE")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            type === "EXPENSE"
              ? "bg-zinc-800 text-white shadow-xs border border-zinc-700/60"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange("INCOME")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            type === "INCOME"
              ? "bg-zinc-800 text-white shadow-xs border border-zinc-700/60"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Pemasukan
        </button>
      </div>

      {/* Nominal Input & Quick Shortcuts */}
      <div>
        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
          Nominal
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-lg font-bold text-zinc-500">
            Rp
          </span>
          <input
            ref={amountInputRef}
            type="text"
            inputMode="numeric"
            value={displayAmount}
            onChange={handleAmountChange}
            placeholder="0"
            className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/80 rounded-2xl text-2xl font-extrabold tracking-tight font-mono text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-transparent transition-all"
          />
        </div>

        {/* Shortcuts: +10rb, +20rb, +50rb, +100rb */}
        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
          {[10_000, 20_000, 50_000, 100_000, 500_000].map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => handleAddShortcut(inc)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors shrink-0 cursor-pointer"
            >
              +{formatRupiah(inc, { prefix: false })}
            </button>
          ))}
        </div>
      </div>

      {/* Category Grid (1 Tap Selection) */}
      <div>
        <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
          Kategori ({activeCategories.length})
        </label>
        {activeCategories.length === 0 ? (
          <div className="p-3 text-xs text-center text-zinc-400 border border-dashed rounded-xl">
            Belum ada kategori {type.toLowerCase()}.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {activeCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center justify-center min-h-16 p-2 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? "border-zinc-500 bg-zinc-800 text-white font-semibold ring-1 ring-zinc-500"
                      : "border-zinc-800 bg-zinc-800/40 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mb-1"
                    style={{
                      backgroundColor: `${cat.color || "#6B7280"}25`,
                      color: cat.color || "#6B7280",
                    }}
                  >
                    {cat.icon || cat.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-[10px] truncate w-full">{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Account & Date Selection Row */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Account Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
            Sumber Uang
          </label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="w-full px-3 py-3 bg-zinc-800/50 border border-zinc-700/80 rounded-xl text-xs font-medium text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 cursor-pointer"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({formatRupiah(acc.balance)})
              </option>
            ))}
          </select>
        </div>

        {/* Date Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
            Tanggal
          </label>
          <div className="relative flex items-center">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-3 bg-zinc-800/50 border border-zinc-700/80 rounded-xl text-xs font-medium text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Note (Optional) */}
      <div>
        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
          Catatan (opsional)
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Makan siang bareng teman"
            maxLength={200}
            className="w-full px-3 py-3 bg-zinc-800/50 border border-zinc-700/80 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </div>
      </div>

      {/* Warning / Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting}
          className="flex-1 py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white active:bg-zinc-200 text-zinc-950 text-xs font-bold shadow-md shadow-black/40 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>Simpan Transaksi</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={isSubmitting}
          className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors disabled:opacity-50 cursor-pointer border border-zinc-700/60"
          title="Simpan & Tambah Lagi"
          aria-label="Simpan dan tambah lagi"
        >
          <Plus className="w-4 h-4" />
          <span>Lagi</span>
        </button>
      </div>
    </div>
  );
}
