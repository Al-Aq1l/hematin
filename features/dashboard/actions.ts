"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fromBigIntToNumber } from "@/lib/money";
import {
  getMonthRangeWIB,
  getCurrentYearMonthWIB,
} from "@/lib/date";
import {
  calculateAccountBalance,
  calculateTotalBalance,
  calculateMonthlySummary,
  calculateBudgetUsage,
} from "@/lib/calc";
import { TransactionType } from "@prisma/client";

async function assertAuthenticated() {
  const isAuth = await getSession();
  if (!isAuth) {
    throw new Error("Unauthorized. Silakan login terlebih dahulu.");
  }
}

export async function getDashboardData(yearParam?: number, monthParam?: number) {
  await assertAuthenticated();

  const currentYM = getCurrentYearMonthWIB();
  const year = yearParam ?? currentYM.year;
  const month = monthParam ?? currentYM.month;

  const { start: monthStart, end: monthEnd } = getMonthRangeWIB(year, month);

  // 1. Fetch active accounts
  const rawAccounts = await db.account.findMany({
    where: { isArchived: false },
    include: {
      transactions: {
        select: { type: true, amount: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const accounts = rawAccounts.map((acc) => {
    const initialNum = fromBigIntToNumber(acc.initialBalance);
    const balance = calculateAccountBalance(
      initialNum,
      acc.transactions.map((t) => ({
        type: t.type,
        amount: fromBigIntToNumber(t.amount),
      }))
    );

    return {
      id: acc.id,
      name: acc.name,
      type: acc.type,
      icon: acc.icon,
      initialBalance: initialNum,
      balance,
      isArchived: acc.isArchived,
    };
  });

  const totalBalance = calculateTotalBalance(
    accounts.map((a) => ({
      initialBalance: a.initialBalance,
      isArchived: a.isArchived,
      transactions: [],
    })).map((a, idx) => ({
      initialBalance: accounts[idx].balance,
      isArchived: false,
    }))
  );

  // 2. Fetch monthly transactions for summary
  const monthlyTrx = await db.transaction.findMany({
    where: {
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    select: {
      type: true,
      amount: true,
      categoryId: true,
      date: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const monthlySummary = calculateMonthlySummary(
    monthlyTrx.map((t) => ({
      type: t.type,
      amount: fromBigIntToNumber(t.amount),
    }))
  );

  // Expense map per category
  const expenseMap = new Map<string, { id: string; name: string; amount: number }>();
  for (const t of monthlyTrx) {
    if (t.type === TransactionType.EXPENSE) {
      const amt = fromBigIntToNumber(t.amount);
      const existing = expenseMap.get(t.categoryId) || {
        id: t.categoryId,
        name: t.category.name,
        amount: 0,
      };
      existing.amount += amt;
      expenseMap.set(t.categoryId, existing);
    }
  }

  // 3. Fetch monthly budgets
  const rawBudgets = await db.budget.findMany({
    where: {
      year,
      month,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
    },
  });

  const totalBudgetAmount = rawBudgets.reduce(
    (sum, b) => sum + fromBigIntToNumber(b.amount),
    0
  );

  // Calculate expense for categories that have budgets
  const budgetedCategoryIds = new Set(rawBudgets.map((b) => b.categoryId));
  const budgetedExpense = monthlyTrx
    .filter((t) => t.type === TransactionType.EXPENSE && budgetedCategoryIds.has(t.categoryId))
    .reduce((sum, t) => sum + fromBigIntToNumber(t.amount), 0);

  const budgetUsage = calculateBudgetUsage(totalBudgetAmount, budgetedExpense);

  // 4. Fetch recent 5 transactions
  const rawRecentTrx = await db.transaction.findMany({
    include: {
      account: { select: { name: true } },
      category: { select: { name: true, icon: true, color: true } },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 5,
  });

  const recentTransactions = rawRecentTrx.map((t) => ({
    id: t.id,
    type: t.type,
    amount: fromBigIntToNumber(t.amount),
    note: t.note,
    date: t.date.toISOString(),
    accountName: t.account.name,
    categoryName: t.category.name,
    categoryIcon: t.category.icon,
    categoryColor: t.category.color,
  }));

  return {
    year,
    month,
    totalBalance,
    accounts,
    summary: monthlySummary,
    budget: {
      totalBudget: totalBudgetAmount,
      budgetedExpense,
      ...budgetUsage,
      hasBudgets: rawBudgets.length > 0,
    },
    recentTransactions,
  };
}
