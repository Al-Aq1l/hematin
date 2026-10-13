"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { formatRupiah, parseRupiahInput } from "@/lib/money";
import {
  getAccounts,
  createAccount,
  updateAccount,
  archiveAccount,
  unarchiveAccount,
  deleteAccount,
  reconcileAccount,
} from "@/features/accounts/actions";
import {
  ArrowLeft,
  Plus,
  Wallet,
  Archive,
  RotateCcw,
  Trash2,
  SlidersHorizontal,
  X,
  Loader2,
} from "lucide-react";

interface AccountItem {
  id: string;
  name: string;
  type: "CASH" | "BANK" | "EWALLET" | "OTHER";
  icon?: string | null;
  initialBalance: number;
  balance: number;
  isArchived: boolean;
  transactionCount: number;
}

export default function AccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountItem | null>(null);
  const [reconcilingAccount, setReconcilingAccount] = useState<AccountItem | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<"CASH" | "BANK" | "EWALLET" | "OTHER">("BANK");
  const [initialBalance, setInitialBalance] = useState("");
  const [reconcileBalance, setReconcileBalance] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAccounts = () => {
    getAccounts(true)
      .then((data) => {
        setAccounts(data as AccountItem[]);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    getAccounts(true)
      .then((data) => {
        if (isMounted) {
          setAccounts(data as AccountItem[]);
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
  }, []);

  const openAdd = () => {
    setName("");
    setType("BANK");
    setInitialBalance("");
    setErrorMsg(null);
    setIsAddOpen(true);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setErrorMsg("Nama akun wajib diisi.");
      return;
    }
    setErrorMsg(null);
    startTransition(async () => {
      const res = await createAccount({
        name: name.trim(),
        type,
        initialBalance: parseRupiahInput(initialBalance),
      });
      if (res.success) {
        setIsAddOpen(false);
        fetchAccounts();
        router.refresh();
      } else {
        setErrorMsg(res.error || "Gagal membuat akun.");
      }
    });
  };

  const openEdit = (acc: AccountItem) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setInitialBalance(acc.initialBalance > 0 ? formatRupiah(acc.initialBalance, { prefix: false }) : "");
    setErrorMsg(null);
  };

  const handleUpdate = async () => {
    if (!editingAccount || !name.trim()) {
      setErrorMsg("Nama akun wajib diisi.");
      return;
    }
    setErrorMsg(null);
    startTransition(async () => {
      const res = await updateAccount({
        id: editingAccount.id,
        name: name.trim(),
        type,
        initialBalance: parseRupiahInput(initialBalance),
      });
      if (res.success) {
        setEditingAccount(null);
        fetchAccounts();
        router.refresh();
      } else {
        setErrorMsg(res.error || "Gagal memperbarui akun.");
      }
    });
  };

  const openReconcile = (acc: AccountItem) => {
    setReconcilingAccount(acc);
    setReconcileBalance(acc.balance > 0 ? formatRupiah(acc.balance, { prefix: false }) : "");
    setErrorMsg(null);
  };

  const handleReconcile = async () => {
    if (!reconcilingAccount) return;
    startTransition(async () => {
      const res = await reconcileAccount({
        id: reconcilingAccount.id,
        actualBalance: parseRupiahInput(reconcileBalance),
      });
      if (res.success) {
        setReconcilingAccount(null);
        fetchAccounts();
        router.refresh();
      } else {
        setErrorMsg(res.error || "Gagal rekonsiliasi saldo.");
      }
    });
  };

  const handleArchiveToggle = async (acc: AccountItem) => {
    startTransition(async () => {
      if (acc.isArchived) {
        await unarchiveAccount(acc.id);
      } else {
        await archiveAccount(acc.id);
      }
      fetchAccounts();
      router.refresh();
    });
  };

  const handleDelete = async (acc: AccountItem) => {
    if (!confirm(`Hapus akun "${acc.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteAccount(acc.id);
      if (res.success) {
        fetchAccounts();
        router.refresh();
      } else {
        alert(res.error);
      }
    });
  };

  const filteredAccounts = accounts.filter((a) =>
    showArchived ? true : !a.isArchived
  );

  return (
    <div className="flex flex-col flex-1 pb-10">
      {/* Header */}
      <Header
        title="Manajemen Akun"
        showBack
        backHref="/settings"
        rightElement={
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        }
      />

      <div className="px-5 mt-4 space-y-4">
        {/* Toggle Archived */}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{filteredAccounts.length} Akun terdaftar</span>
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
          >
            {showArchived ? "Sembunyikan Arsip" : "Tampilkan Arsip"}
          </button>
        </div>

        {/* Account List */}
        {loading ? (
          <div className="py-12 flex justify-center text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed text-center text-zinc-400 space-y-2">
            <Wallet className="w-8 h-8 mx-auto opacity-50" />
            <p className="text-xs">Belum ada akun. Tambahkan akun pertamamu (mis. Cash atau BCA).</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredAccounts.map((acc) => (
              <div
                key={acc.id}
                className={`p-4 rounded-2xl border transition-all ${
                  acc.isArchived
                    ? "bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/50 opacity-60"
                    : "bg-white/70 dark:bg-[#161a22]/80 backdrop-blur-md border-zinc-200/80 dark:border-zinc-800/80 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      {acc.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>{acc.name}</span>
                        {acc.isArchived && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                            Arsip
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 capitalize">
                        {acc.type.toLowerCase()} · {acc.transactionCount} transaksi
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                      {formatRupiah(acc.balance)}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Awal: {formatRupiah(acc.initialBalance)}
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => openReconcile(acc)}
                    className="px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-1 text-[11px]"
                    title="Rekonsiliasi Saldo Sebenarnya"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Rekonsiliasi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEdit(acc)}
                    className="px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-[11px]"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleArchiveToggle(acc)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    title={acc.isArchived ? "Aktifkan Kembali" : "Arsipkan"}
                  >
                    {acc.isArchived ? (
                      <RotateCcw className="w-3.5 h-3.5" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {acc.transactionCount === 0 && (
                    <button
                      type="button"
                      onClick={() => handleDelete(acc)}
                      className="p-2 rounded-lg text-red-400 hover:text-red-600"
                      title="Hapus Akun"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(isAddOpen || editingAccount) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {isAddOpen ? "Tambah Akun Baru" : "Edit Akun"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingAccount(null);
                }}
                className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Nama Akun
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: BCA, Cash, GoPay"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Tipe Akun
                </label>
                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "CASH" | "BANK" | "EWALLET" | "OTHER")
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                >
                  <option value="BANK">Bank</option>
                  <option value="CASH">Tunai (Cash)</option>
                  <option value="EWALLET">E-Wallet</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Saldo Awal (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={initialBalance}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setInitialBalance("");
                      return;
                    }
                    const parsed = parseRupiahInput(val);
                    setInitialBalance(parsed > 0 ? formatRupiah(parsed, { prefix: false }) : "");
                  }}
                  placeholder="0"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                />
                {editingAccount && (
                  <p className="text-[10px] text-amber-500 mt-1">
                    ⚠️ Mengubah saldo awal akan mengubah seluruh saldo historis akun ini.
                  </p>
                )}
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 text-xs">
                  {errorMsg}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingAccount(null);
                }}
                className="flex-1 py-3 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={isAddOpen ? handleCreate : handleUpdate}
                disabled={isPending}
                className="flex-1 py-3 text-xs rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-1.5"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reconcile Balance Modal */}
      {reconcilingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Rekonsiliasi Saldo: {reconcilingAccount.name}
              </h2>
              <button
                type="button"
                onClick={() => setReconcilingAccount(null)}
                className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-zinc-500">
                Masukkan saldo fisik / riil saat ini di rekening/dompet Anda. Sistem akan menyesuaikan saldo awal secara otomatis agar saldo akhir di aplikasi persis sama dengan saldo riil.
              </p>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-xs space-y-1.5 border border-zinc-200/50 dark:border-zinc-800">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Saldo di Aplikasi Saat Ini:</span>
                  <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">{formatRupiah(reconcilingAccount.balance)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-zinc-400">
                  <span>Saldo Awal Tercatat:</span>
                  <span className="font-mono">{formatRupiah(reconcilingAccount.initialBalance)}</span>
                </div>
                {reconcileBalance && (
                  <div className="flex justify-between items-center pt-1.5 border-t border-zinc-200/50 dark:border-zinc-700/50 text-[11px]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Saldo Awal Baru:</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(
                        reconcilingAccount.initialBalance +
                          (parseRupiahInput(reconcileBalance) - reconcilingAccount.balance)
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Saldo Riil / Sebenarnya Saat Ini (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={reconcileBalance}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setReconcileBalance("");
                      return;
                    }
                    const parsed = parseRupiahInput(val);
                    setReconcileBalance(parsed > 0 ? formatRupiah(parsed, { prefix: false }) : "");
                  }}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm font-bold font-mono rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs">
                  {errorMsg}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReconcilingAccount(null)}
                className="flex-1 py-3 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleReconcile}
                disabled={isPending}
                className="flex-1 py-3 text-xs rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-1.5"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Sesuaikan Saldo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
