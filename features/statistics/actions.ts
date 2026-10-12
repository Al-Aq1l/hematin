"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fromBigIntToNumber } from "@/lib/money";
import {
  getMonthRangeWIB,
  getCurrentYearMonthWIB,
  getPreviousYearMonthWIB,
  getNextYearMonthWIB,
  INDO_MONTHS,
  INDO_MONTHS_SHORT,
} from "@/lib/date";
import { calculateMonthlySummary } from "@/lib/calc";
import { TransactionType } from "@prisma/client";

async function assertAuthenticated() {
  const isAuth = await getSession();
  if (!isAuth) {
    throw new Error("Unauthorized. Silakan login terlebih dahulu.");
  }
}

export interface CategoryBreakdownItem {
  id: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlyTrendItem {
  year: number;
  month: number;
  label: string;
  shortLabel: string;
  income: number;
  expense: number;
  saving: number;
}

export interface StatisticsData {
  year: number;
  month: number;
  monthLabel: string;
  prevYM: { year: number; month: number };
  nextYM: { year: number; month: number };
  summary: {
    income: number;
    expense: number;
    saving: number;
    savingRate: number | null;
  };
  expenseBreakdown: CategoryBreakdownItem[];
  incomeBreakdown: CategoryBreakdownItem[];
  trend6Months: MonthlyTrendItem[];
}

export async function getStatisticsData(
  yearParam?: number,
  monthParam?: number
): Promise<StatisticsData> {
  await assertAuthenticated();

  const currentYM = getCurrentYearMonthWIB();
  const year = yearParam ?? currentYM.year;
  const month = monthParam ?? currentYM.month;

  const prevYM = getPreviousYearMonthWIB(year, month);
  const nextYM = getNextYearMonthWIB(year, month);
  const monthLabel = `${INDO_MONTHS[month - 1]} ${year}`;

  const { start: monthStart, end: monthEnd } = getMonthRangeWIB(year, month);

  // 1. Fetch transactions for the selected month
  const monthlyTrx = await db.transaction.findMany({
    where: {
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          type: true,
        },
      },
    },
  });

  const summary = calculateMonthlySummary(
    monthlyTrx.map((t) => ({
      type: t.type,
      amount: fromBigIntToNumber(t.amount),
    }))
  );

  // 2. Compute Expense Breakdown
  const expenseMap = new Map<
    string,
    { id: string; name: string; color: string; amount: number; count: number }
  >();
  // Compute Income Breakdown
  const incomeMap = new Map<
    string,
    { id: string; name: string; color: string; amount: number; count: number }
  >();

  for (const t of monthlyTrx) {
    const amt = fromBigIntToNumber(t.amount);
    const catId = t.categoryId;
    const catName = t.category.name;
    const catColor = t.category.color || "#6B7280";

    if (t.type === TransactionType.EXPENSE) {
      const existing = expenseMap.get(catId) || {
        id: catId,
        name: catName,
        color: catColor,
        amount: 0,
        count: 0,
      };
      existing.amount += amt;
      existing.count += 1;
      expenseMap.set(catId, existing);
    } else if (t.type === TransactionType.INCOME) {
      const existing = incomeMap.get(catId) || {
        id: catId,
        name: catName,
        color: catColor,
        amount: 0,
        count: 0,
      };
      existing.amount += amt;
      existing.count += 1;
      incomeMap.set(catId, existing);
    }
  }

  const expenseBreakdown: CategoryBreakdownItem[] = Array.from(expenseMap.values())
    .map((item) => ({
      id: item.id,
      name: item.name,
      color: item.color,
      amount: item.amount,
      transactionCount: item.count,
      percentage: summary.expense > 0 ? Math.round((item.amount / summary.expense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const incomeBreakdown: CategoryBreakdownItem[] = Array.from(incomeMap.values())
    .map((item) => ({
      id: item.id,
      name: item.name,
      color: item.color,
      amount: item.amount,
      transactionCount: item.count,
      percentage: summary.income > 0 ? Math.round((item.amount / summary.income) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // 3. 6 Months Historical Trend
  // Build the 6 months series ending at (year, month)
  const monthsSeries: { year: number; month: number }[] = [];
  let curY = year;
  let curM = month;
  for (let i = 0; i < 6; i++) {
    monthsSeries.unshift({ year: curY, month: curM });
    const prev = getPreviousYearMonthWIB(curY, curM);
    curY = prev.year;
    curM = prev.month;
  }

  const oldestRange = getMonthRangeWIB(monthsSeries[0].year, monthsSeries[0].month);
  const newestRange = getMonthRangeWIB(
    monthsSeries[monthsSeries.length - 1].year,
    monthsSeries[monthsSeries.length - 1].month
  );

  const trendTrx = await db.transaction.findMany({
    where: {
      date: {
        gte: oldestRange.start,
        lte: newestRange.end,
      },
    },
    select: {
      type: true,
      amount: true,
      date: true,
    },
  });

  const trend6Months: MonthlyTrendItem[] = monthsSeries.map(({ year: y, month: m }) => {
    const { start, end } = getMonthRangeWIB(y, m);
    let inc = 0;
    let exp = 0;

    for (const t of trendTrx) {
      if (t.date >= start && t.date <= end) {
        const val = fromBigIntToNumber(t.amount);
        if (t.type === TransactionType.INCOME) inc += val;
        else if (t.type === TransactionType.EXPENSE) exp += val;
      }
    }

    return {
      year: y,
      month: m,
      label: `${INDO_MONTHS_SHORT[m - 1]} ${y}`,
      shortLabel: INDO_MONTHS_SHORT[m - 1],
      income: inc,
      expense: exp,
      saving: inc - exp,
    };
  });

  return {
    year,
    month,
    monthLabel,
    prevYM,
    nextYM,
    summary,
    expenseBreakdown,
    incomeBreakdown,
    trend6Months,
  };
}
