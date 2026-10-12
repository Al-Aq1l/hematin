/**
 * Core business calculations for Hematin Money Management.
 * Single source of truth: PRD v1.1 Section 8.2, 8.3, 8.4
 */

export type TransactionType = "INCOME" | "EXPENSE";

export type BudgetStatus = "SAFE" | "WARNING" | "CRITICAL" | "OVER_BUDGET";

export interface AccountCalcInput {
  initialBalance: bigint | number;
  isArchived: boolean;
  transactions?: Array<{
    type: TransactionType;
    amount: bigint | number;
  }>;
}

export interface TransactionCalcInput {
  type: TransactionType;
  amount: bigint | number;
}

/**
 * Calculate the balance of a single account.
 * Saldo Akun = Initial Balance + Σ Income − Σ Expense
 */
export function calculateAccountBalance(
  initialBalance: bigint | number,
  transactions: TransactionCalcInput[] = []
): number {
  let balance = typeof initialBalance === "bigint" ? Number(initialBalance) : initialBalance;

  for (const trx of transactions) {
    const amt = typeof trx.amount === "bigint" ? Number(trx.amount) : trx.amount;
    if (trx.type === "INCOME") {
      balance += amt;
    } else if (trx.type === "EXPENSE") {
      balance -= amt;
    }
  }

  return balance;
}

/**
 * Calculate total balance across all accounts that are NOT archived.
 * Total Saldo = Σ Saldo semua akun yang tidak diarsipkan
 */
export function calculateTotalBalance(accounts: AccountCalcInput[]): number {
  return accounts
    .filter((acc) => !acc.isArchived)
    .reduce((total, acc) => {
      const balance = calculateAccountBalance(acc.initialBalance, acc.transactions ?? []);
      return total + balance;
    }, 0);
}

export interface MonthlySummaryResult {
  income: number;
  expense: number;
  saving: number;
  savingRate: number | null; // null represents "-" when income is 0
}

/**
 * Calculate monthly Income, Expense, Saving, and Saving Rate.
 * Source: PRD v1.1 Section 8.3
 * Saving = Income - Expense
 * Saving Rate = Saving / Income * 100 (if Income == 0 -> null)
 */
export function calculateMonthlySummary(
  transactions: TransactionCalcInput[] = []
): MonthlySummaryResult {
  let income = 0;
  let expense = 0;

  for (const trx of transactions) {
    const amt = typeof trx.amount === "bigint" ? Number(trx.amount) : trx.amount;
    if (trx.type === "INCOME") {
      income += amt;
    } else if (trx.type === "EXPENSE") {
      expense += amt;
    }
  }

  const saving = income - expense;
  const savingRate = income > 0 ? (saving / income) * 100 : null;

  return {
    income,
    expense,
    saving,
    savingRate,
  };
}

export interface BudgetCalcResult {
  budgetAmount: number;
  usedAmount: number;
  remainingAmount: number;
  percentage: number;
  status: BudgetStatus;
  statusLabel: string;
}

/**
 * Determine budget status based on PRD Section 8.4:
 * < 70% -> Safe
 * 70% to < 90% -> Warning
 * 90% to 100% -> Critical
 * > 100% -> Over Budget
 */
export function getBudgetStatus(percentage: number): {
  status: BudgetStatus;
  statusLabel: string;
} {
  if (percentage < 70) {
    return { status: "SAFE", statusLabel: "Safe" };
  }
  if (percentage < 90) {
    return { status: "WARNING", statusLabel: "Warning" };
  }
  if (percentage <= 100) {
    return { status: "CRITICAL", statusLabel: "Critical" };
  }
  return { status: "OVER_BUDGET", statusLabel: "Over Budget" };
}

/**
 * Calculate budget usage, remaining amount, and percentage for a category.
 */
export function calculateBudgetUsage(
  budgetAmount: bigint | number,
  expenseAmount: bigint | number
): BudgetCalcResult {
  const budget = typeof budgetAmount === "bigint" ? Number(budgetAmount) : budgetAmount;
  const used = typeof expenseAmount === "bigint" ? Number(expenseAmount) : expenseAmount;

  const remaining = budget - used;
  const percentage = budget > 0 ? Math.round((used / budget) * 100) : 0;
  const { status, statusLabel } = getBudgetStatus(percentage);

  return {
    budgetAmount: budget,
    usedAmount: used,
    remainingAmount: remaining,
    percentage,
    status,
    statusLabel,
  };
}

/**
 * Calculate safe daily spending average for remaining budget.
 * PRD 9.7 FR-BUD-8: Sisa budget ÷ sisa hari dalam bulan
 */
export function calculateDailySafeSpend(
  remainingBudget: bigint | number,
  remainingDays: number
): number {
  const remaining = typeof remainingBudget === "bigint" ? Number(remainingBudget) : remainingBudget;
  if (remaining <= 0 || remainingDays <= 0) return 0;
  return Math.floor(remaining / remainingDays);
}
