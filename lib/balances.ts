import db from "@/lib/db";
import { fromBigIntToNumber } from "@/lib/money";
import { calculateAccountBalance } from "@/lib/calc";

export interface AccountWithBalance {
  id: string;
  name: string;
  type: "CASH" | "BANK" | "EWALLET" | "OTHER";
  icon: string | null;
  initialBalance: number;
  balance: number;
  isArchived: boolean;
  sortOrder: number;
  createdAt: Date;
}

/**
 * Active accounts with balances computed in the database (2 small queries),
 * instead of loading every transaction row into memory.
 * Balance = initialBalance + Σ income − Σ expense (PRD 8.2).
 */
export async function getActiveAccountsWithBalance(): Promise<AccountWithBalance[]> {
  const [accounts, sums] = await Promise.all([
    db.account.findMany({
      where: { isArchived: false },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    db.transaction.groupBy({
      by: ["accountId", "type"],
      _sum: { amount: true },
    }),
  ]);

  const byAccount = new Map<string, { type: "INCOME" | "EXPENSE"; amount: number }[]>();
  for (const row of sums) {
    const list = byAccount.get(row.accountId) ?? [];
    list.push({ type: row.type, amount: fromBigIntToNumber(row._sum.amount) });
    byAccount.set(row.accountId, list);
  }

  return accounts.map((acc) => {
    const initialBalance = fromBigIntToNumber(acc.initialBalance);
    return {
      id: acc.id,
      name: acc.name,
      type: acc.type,
      icon: acc.icon,
      initialBalance,
      balance: calculateAccountBalance(initialBalance, byAccount.get(acc.id) ?? []),
      isArchived: acc.isArchived,
      sortOrder: acc.sortOrder,
      createdAt: acc.createdAt,
    };
  });
}
