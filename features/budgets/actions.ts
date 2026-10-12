"use server";

import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fromBigIntToNumber } from "@/lib/money";
import {
  getMonthRangeWIB,
  getCurrentYearMonthWIB,
  getRemainingDaysInMonthWIB,
} from "@/lib/date";
import {
  calculateBudgetUsage,
  calculateDailySafeSpend,
  BudgetStatus,
} from "@/lib/calc";
import { CategoryType, TransactionType } from "@prisma/client";
import { upsertBudgetSchema, copyBudgetSchema } from "./schemas";

async function assertAuthenticated() {
  const isAuth = await getSession();
  if (!isAuth) {
    throw new Error("Unauthorized. Silakan login terlebih dahulu.");
  }
}

export interface CategoryBudgetItem {
  categoryId: string;
  categoryName: string;
  categoryIcon?: string | null;
  categoryColor?: string | null;
  budgetId?: string;
  budgetAmount: number;
  usedAmount: number;
  remainingAmount: number;
  percentage: number;
  status: BudgetStatus;
  statusLabel: string;
  dailySafeSpend: number;
  hasBudget: boolean;
}

export async function getBudgetData(yearParam?: number, monthParam?: number) {
  await assertAuthenticated();

  const currentYM = getCurrentYearMonthWIB();
  const year = yearParam ?? currentYM.year;
  const month = monthParam ?? currentYM.month;

  const { start: monthStart, end: monthEnd } = getMonthRangeWIB(year, month);
  const remainingDays = getRemainingDaysInMonthWIB(new Date());

  // 1. Get all active EXPENSE categories
  const categories = await db.category.findMany({
    where: {
      type: CategoryType.EXPENSE,
      isArchived: false,
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  // 2. Get budgets for this month
  const budgets = await db.budget.findMany({
    where: {
      year,
      month,
    },
  });

  const budgetMap = new Map<string, { id: string; amount: number }>();
  for (const b of budgets) {
    budgetMap.set(b.categoryId, {
      id: b.id,
      amount: fromBigIntToNumber(b.amount),
    });
  }

  // 3. Get transactions for this month in expense categories
  const transactions = await db.transaction.findMany({
    where: {
      type: TransactionType.EXPENSE,
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    select: {
      categoryId: true,
      amount: true,
    },
  });

  const expenseMap = new Map<string, number>();
  for (const t of transactions) {
    const prev = expenseMap.get(t.categoryId) || 0;
    expenseMap.set(t.categoryId, prev + fromBigIntToNumber(t.amount));
  }

  // 4. Combine into items
  const items: CategoryBudgetItem[] = categories.map((cat) => {
    const budgetInfo = budgetMap.get(cat.id);
    const used = expenseMap.get(cat.id) || 0;
    const hasBudget = Boolean(budgetInfo);
    const budgetAmount = budgetInfo ? budgetInfo.amount : 0;

    const calc = calculateBudgetUsage(budgetAmount, used);
    const dailySafe = hasBudget
      ? calculateDailySafeSpend(calc.remainingAmount, remainingDays)
      : 0;

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      budgetId: budgetInfo?.id,
      budgetAmount,
      usedAmount: used,
      remainingAmount: calc.remainingAmount,
      percentage: calc.percentage,
      status: calc.status,
      statusLabel: calc.statusLabel,
      dailySafeSpend: dailySafe,
      hasBudget,
    };
  });

  // PRD 9.7 FR-BUD-9: Daftar budget diurutkan: yang paling kritis di atas
  items.sort((a, b) => {
    if (a.hasBudget && !b.hasBudget) return -1;
    if (!a.hasBudget && b.hasBudget) return 1;
    // Both have budgets: highest percentage first
    return b.percentage - a.percentage;
  });

  // Summary
  const budgetedItems = items.filter((i) => i.hasBudget);
  const totalBudget = budgetedItems.reduce((sum, i) => sum + i.budgetAmount, 0);
  const totalUsedInBudget = budgetedItems.reduce((sum, i) => sum + i.usedAmount, 0);
  const totalRemaining = totalBudget - totalUsedInBudget;
  const overallCalc = calculateBudgetUsage(totalBudget, totalUsedInBudget);

  return {
    year,
    month,
    totalBudget,
    totalUsed: totalUsedInBudget,
    totalRemaining,
    percentage: overallCalc.percentage,
    status: overallCalc.status,
    statusLabel: overallCalc.statusLabel,
    items,
    remainingDays,
  };
}

export async function upsertBudget(input: unknown) {
  await assertAuthenticated();
  const parsed = upsertBudgetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Input tidak valid" };
  }

  const { categoryId, amount, month, year } = parsed.data;

  // Verify category is EXPENSE
  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category || category.type !== CategoryType.EXPENSE) {
    return { success: false, error: "Budget hanya dapat ditentukan untuk kategori Pengeluaran." };
  }

  const budget = await db.budget.upsert({
    where: {
      categoryId_month_year: {
        categoryId,
        month,
        year,
      },
    },
    update: {
      amount: BigInt(Math.round(amount)),
    },
    create: {
      categoryId,
      amount: BigInt(Math.round(amount)),
      month,
      year,
    },
  });

  revalidatePath("/", "layout");
  return { success: true, id: budget.id };
}

export async function deleteBudget(id: string) {
  await assertAuthenticated();
  await db.budget.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function copyBudgetsFromPreviousMonth(input: unknown) {
  await assertAuthenticated();
  const parsed = copyBudgetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Input tidak valid" };
  }

  const { targetMonth, targetYear } = parsed.data;

  // Calculate previous month
  const prevMonth = targetMonth === 1 ? 12 : targetMonth - 1;
  const prevYear = targetMonth === 1 ? targetYear - 1 : targetYear;

  const prevBudgets = await db.budget.findMany({
    where: {
      month: prevMonth,
      year: prevYear,
    },
  });

  if (prevBudgets.length === 0) {
    return {
      success: false,
      error: "Tidak ada budget pada bulan sebelumnya untuk disalin.",
    };
  }

  let count = 0;
  for (const b of prevBudgets) {
    await db.budget.upsert({
      where: {
        categoryId_month_year: {
          categoryId: b.categoryId,
          month: targetMonth,
          year: targetYear,
        },
      },
      update: {
        amount: b.amount,
      },
      create: {
        categoryId: b.categoryId,
        amount: b.amount,
        month: targetMonth,
        year: targetYear,
      },
    });
    count++;
  }

  revalidatePath("/", "layout");
  return { success: true, count };
}
