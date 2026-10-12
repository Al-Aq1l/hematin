"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fromBigIntToNumber } from "@/lib/money";
import {
  getMonthRangeWIB,
  getCurrentYearMonthWIB,
} from "@/lib/date";
import { calculateMonthlySummary, calculateBudgetUsage } from "@/lib/calc";
import { getActiveAccountsWithBalance } from "@/lib/balances";
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

  // 1. Active accounts with balances (computed in DB)
  const accounts = await getActiveAccountsWithBalance();
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

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
          color: true,
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
