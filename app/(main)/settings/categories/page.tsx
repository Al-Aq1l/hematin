"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import {
  getCategories,
  createCategory,
  updateCategory,
  archiveCategory,
  unarchiveCategory,
  deleteCategory,
  deleteCategoryWithReassign,
} from "@/features/categories/actions";
import {
  ArrowLeft,
  Plus,
  Tag,
  Archive,
  RotateCcw,
  Trash2,
  X,
  Loader2,
  Lock,
  ArrowRightLeft,
} from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon?: string | null;
  color?: string | null;
  isDefault: boolean;
  isArchived: boolean;
  transactionCount: number;
  budgetCount: number;
  isProtected: boolean;
}

const COLOR_PRESETS = [
  "#EF4444", "#F97316", "#F59E0B", "#10B981",
  "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899",
  "#6B7280", "#14B8A6", "#84CC16", "#A855F7"
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [showArchived, setShowArchived] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [reassignCategory, setReassignCategory] = useState<CategoryItem | null>(null);
  const [targetCategoryId, setTargetCategoryId] = useState<string>("");

  // Form states
  const [name, setName] = useState("");
  const [color, setColor] = useState("#F97316");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCategories = () => {
    getCategories(undefined, true)
      .then((data) => {
        setCategories(data as CategoryItem[]);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    getCategories(undefined, true)
      .then((data) => {
        if (isMounted) {
          setCategories(data as CategoryItem[]);
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
    setColor(activeTab === "EXPENSE" ? "#F97316" : "#10B981");
    setErrorMsg(null);
    setIsAddOpen(true);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setErrorMsg("Nama kategori wajib diisi.");
      return;
    }
    setErrorMsg(null);
    startTransition(async () => {
      const res = await createCategory({
        name: name.trim(),
        type: activeTab,
        icon: null,
        color,
      });
      if (res.success) {
        setIsAddOpen(false);
        fetchCategories();
      } else {
        setErrorMsg(res.error || "Gagal membuat kategori.");
      }
    });
  };

  const openEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color || "#6B7280");
    setErrorMsg(null);
  };

  const handleUpdate = async () => {
    if (!editingCategory || !name.trim()) {
      setErrorMsg("Nama kategori wajib diisi.");
      return;
    }
    setErrorMsg(null);
    startTransition(async () => {
      const res = await updateCategory({
        id: editingCategory.id,
        name: name.trim(),
        icon: null,
        color,
      });
      if (res.success) {
        setEditingCategory(null);
        fetchCategories();
      } else {
        setErrorMsg(res.error || "Gagal memperbarui kategori.");
      }
    });
  };

  const handleArchiveToggle = async (cat: CategoryItem) => {
    startTransition(async () => {
      if (cat.isArchived) {
        await unarchiveCategory(cat.id);
      } else {
        const res = await archiveCategory(cat.id);
        if (!res.success) alert(res.error);
      }
      fetchCategories();
    });
  };

  const handleDeleteDirect = async (cat: CategoryItem) => {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteCategory(cat.id);
      if (res.success) {
        fetchCategories();
      } else {
        alert(res.error);
      }
    });
  };

  const openReassignModal = (cat: CategoryItem) => {
    setReassignCategory(cat);
    const availableTargets = categories.filter(
      (c) => c.id !== cat.id && c.type === cat.type && !c.isArchived
    );
    setTargetCategoryId(availableTargets[0]?.id || "");
    setErrorMsg(null);
  };

  const handleReassignAndDelete = async () => {
    if (!reassignCategory || !targetCategoryId) return;
    startTransition(async () => {
      const res = await deleteCategoryWithReassign({
        id: reassignCategory.id,
        targetCategoryId,
      });
      if (res.success) {
        setReassignCategory(null);
        fetchCategories();
      } else {
        setErrorMsg(res.error || "Gagal memindahkan transaksi.");
      }
    });
  };

  const filteredCategories = categories.filter((c) => {
    if (c.type !== activeTab) return false;
    return showArchived ? true : !c.isArchived;
  });

  return (
    <div className="flex flex-col flex-1 pb-10">
      {/* Header */}
      <Header
        title="Kategori Transaksi"
        showBack
        backHref="/settings"
        rightElement={
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1 py-2 px-3.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        }
      />

      <div className="px-5 mt-4 space-y-4">
        {/* Type Toggle Tabs */}
        <div className="flex bg-[#161a22]/80 backdrop-blur-md p-1 rounded-2xl border border-zinc-800/80 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("EXPENSE")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "EXPENSE"
                ? "bg-zinc-800 text-white shadow-xs border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("INCOME")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "INCOME"
                ? "bg-zinc-800 text-white shadow-xs border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Pemasukan
          </button>
        </div>

        {/* Toggle Archived */}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{filteredCategories.length} Kategori</span>
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className="text-zinc-400 hover:text-white font-medium cursor-pointer transition-colors"
          >
            {showArchived ? "Sembunyikan Arsip" : "Tampilkan Arsip"}
          </button>
        </div>

        {/* Categories List */}
        {loading ? (
          <div className="py-12 flex justify-center text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed text-center text-zinc-400 space-y-2">
            <Tag className="w-8 h-8 mx-auto opacity-50" />
            <p className="text-xs">Belum ada kategori untuk tipe ini.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  cat.isArchived
                    ? "bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/50 opacity-60"
                    : "bg-white/70 dark:bg-[#161a22]/80 backdrop-blur-md border-zinc-200/80 dark:border-zinc-800/80 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs"
                    style={{
                      backgroundColor: `${cat.color || "#6B7280"}20`,
                      color: cat.color || "#6B7280",
                    }}
                  >
                    <span>{cat.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>{cat.name}</span>
                      {cat.isProtected && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Dilindungi
                        </span>
                      )}
                      {cat.isArchived && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-500">
                          Arsip
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {cat.transactionCount} transaksi
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(cat)}
                    className="px-2 py-1 text-[11px] rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  >
                    Edit
                  </button>

                  {!cat.isProtected && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleArchiveToggle(cat)}
                        className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        title={cat.isArchived ? "Aktifkan" : "Arsipkan"}
                      >
                        {cat.isArchived ? (
                          <RotateCcw className="w-3.5 h-3.5" />
                        ) : (
                          <Archive className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {cat.transactionCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => openReassignModal(cat)}
                          className="p-2 rounded-lg text-amber-500 hover:text-amber-600"
                          title="Pindahkan transaksi lalu hapus"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                      ) : !cat.isDefault ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteDirect(cat)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-600"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {(isAddOpen || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {isAddOpen ? "Tambah Kategori" : "Edit Kategori"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingCategory(null);
                }}
                className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Langganan, Kopi"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                />
              </div>

              {/* Badge Preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{
                    backgroundColor: `${color}25`,
                    color: color,
                  }}
                >
                  {name ? name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {name || "Nama Kategori"}
                  </div>
                  <div className="text-[10px] text-zinc-400">Pratinjau tampilan kategori</div>
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Warna Indikator
                </label>
                <div className="flex gap-2 items-center">
                  <div className="grid grid-cols-6 gap-2 flex-1">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`h-6 rounded-lg transition-transform ${
                          color === c ? "ring-2 ring-emerald-500 scale-110" : ""
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                    title="Kustom warna"
                  />
                </div>
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
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingCategory(null);
                }}
                className="flex-1 py-3 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={isAddOpen ? handleCreate : handleUpdate}
                disabled={isPending}
                className="flex-1 py-3 text-xs rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign and Delete Modal */}
      {reassignCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Pindahkan Transaksi &amp; Hapus
              </h2>
              <button
                type="button"
                onClick={() => setReassignCategory(null)}
                className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Kategori <span className="font-bold">{reassignCategory.name}</span> dipakai di{" "}
                <span className="font-bold text-amber-500">
                  {reassignCategory.transactionCount} transaksi
                </span>
                . Pilih kategori tujuan untuk memindahkan seluruh transaksi tersebut sebelum kategori ini dihapus permanen.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Pindahkan ke Kategori Tujuan
                </label>
                <select
                  value={targetCategoryId}
                  onChange={(e) => setTargetCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                >
                  {categories
                    .filter(
                      (c) =>
                        c.id !== reassignCategory.id &&
                        c.type === reassignCategory.type &&
                        !c.isArchived
                    )
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                </select>
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
                onClick={() => setReassignCategory(null)}
                className="flex-1 py-3 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleReassignAndDelete}
                disabled={isPending}
                className="flex-1 py-3 text-xs rounded-xl bg-red-600 text-white font-semibold flex items-center justify-center gap-1.5"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Pindahkan &amp; Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
