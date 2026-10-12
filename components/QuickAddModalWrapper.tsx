import db from "@/lib/db";
import { getActiveAccountsWithBalance } from "@/lib/balances";
import { QuickAddModal } from "./QuickAddModal";
import { QuickAddForm } from "@/features/transactions/QuickAddForm";

export async function QuickAddModalWrapper() {
  let accounts: Array<{ id: string; name: string; icon?: string | null; balance: number }> = [];
  let categories: Array<{ id: string; name: string; type: "INCOME" | "EXPENSE"; icon?: string | null; color?: string | null }> = [];
  let defaultAccountId: string | undefined;
  let defaultExpenseCategoryId: string | undefined;
  let defaultIncomeCategoryId: string | undefined;

  try {
    const [accountRows, rawCategories, settings] = await Promise.all([
      getActiveAccountsWithBalance(),
      db.category.findMany({
        where: { isArchived: false },
        orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      }),
      // Smart defaults from Settings
      db.setting.findMany({
        where: {
          key: {
            in: ["lastUsedAccountId", "lastUsedCategory.EXPENSE", "lastUsedCategory.INCOME"],
          },
        },
      }),
    ]);

    accounts = accountRows.map((acc) => ({
      id: acc.id,
      name: acc.name,
      icon: acc.icon,
      balance: acc.balance,
    }));

    categories = rawCategories.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      icon: c.icon,
      color: c.color,
    }));

    for (const s of settings) {
      if (s.key === "lastUsedAccountId") defaultAccountId = s.value;
      if (s.key === "lastUsedCategory.EXPENSE") defaultExpenseCategoryId = s.value;
      if (s.key === "lastUsedCategory.INCOME") defaultIncomeCategoryId = s.value;
    }
  } catch {
    // If DB is not yet connected/seeded, fallback gracefully
  }

  return (
    <QuickAddModal>
      {accounts.length === 0 ? (
        <div className="py-6 text-center space-y-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Kamu belum memiliki akun untuk mencatat transaksi.
          </p>
          <a
            href="/settings/accounts"
            className="inline-block py-2 px-4 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
          >
            Buat Akun Pertama
          </a>
        </div>
      ) : (
        <QuickAddForm
          accounts={accounts}
          categories={categories}
          defaultAccountId={defaultAccountId}
          defaultExpenseCategoryId={defaultExpenseCategoryId}
          defaultIncomeCategoryId={defaultIncomeCategoryId}
        />
      )}
    </QuickAddModal>
  );
}
