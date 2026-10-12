import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateAccountBalance,
  calculateTotalBalance,
  calculateMonthlySummary,
  calculateBudgetUsage,
  getBudgetStatus,
  calculateDailySafeSpend,
  AccountCalcInput,
} from "../lib/calc";

test("calculateAccountBalance - properly computes initial + income - expense", () => {
  const initial = BigInt(1_000_000);
  const balance = calculateAccountBalance(initial, [
    { type: "EXPENSE", amount: BigInt(100_000) },
    { type: "INCOME", amount: BigInt(500_000) },
    { type: "EXPENSE", amount: BigInt(250_000) },
  ]);
  assert.equal(balance, 1_150_000);
});

test("calculateAccountBalance - can produce negative balance with warning allowed", () => {
  const initial = 100_000;
  const balance = calculateAccountBalance(initial, [
    { type: "EXPENSE", amount: 250_000 },
  ]);
  assert.equal(balance, -150_000);
});

test("calculateTotalBalance - only includes active accounts, excludes archived", () => {
  const accounts: AccountCalcInput[] = [
    {
      initialBalance: BigInt(500_000),
      isArchived: false,
      transactions: [{ type: "EXPENSE", amount: BigInt(50_000) }],
    },
    {
      initialBalance: BigInt(1_000_000),
      isArchived: false,
      transactions: [{ type: "INCOME", amount: BigInt(200_000) }],
    },
    {
      initialBalance: BigInt(300_000),
      isArchived: true, // Archived should be excluded from total balance
      transactions: [],
    },
  ];

  const total = calculateTotalBalance(accounts);
  // (500000 - 50000) + (1000000 + 200000) = 450000 + 1200000 = 1650000
  assert.equal(total, 1_650_000);
});

test("calculateMonthlySummary - computes income, expense, saving, and saving rate", () => {
  const summary = calculateMonthlySummary([
    { type: "INCOME", amount: 5_000_000 },
    { type: "EXPENSE", amount: 2_750_000 },
  ]);

  assert.equal(summary.income, 5_000_000);
  assert.equal(summary.expense, 2_750_000);
  assert.equal(summary.saving, 2_250_000);
  assert.equal(summary.savingRate, 45); // 2250000 / 5000000 * 100 = 45%
});

test("calculateMonthlySummary - handles zero income gracefully by returning null savingRate", () => {
  const summary = calculateMonthlySummary([
    { type: "EXPENSE", amount: 500_000 },
  ]);

  assert.equal(summary.income, 0);
  assert.equal(summary.expense, 500_000);
  assert.equal(summary.saving, -500_000);
  assert.equal(summary.savingRate, null);
});

test("getBudgetStatus - respects strict boundary definitions from PRD 8.4", () => {
  // < 70% -> Safe
  assert.equal(getBudgetStatus(0).status, "SAFE");
  assert.equal(getBudgetStatus(69).status, "SAFE");

  // 70% to < 90% -> Warning
  assert.equal(getBudgetStatus(70).status, "WARNING");
  assert.equal(getBudgetStatus(89).status, "WARNING");

  // 90% to 100% -> Critical
  assert.equal(getBudgetStatus(90).status, "CRITICAL");
  assert.equal(getBudgetStatus(100).status, "CRITICAL");

  // > 100% -> Over Budget
  assert.equal(getBudgetStatus(101).status, "OVER_BUDGET");
  assert.equal(getBudgetStatus(150).status, "OVER_BUDGET");
});

test("calculateBudgetUsage - calculates remaining, percentage, and status", () => {
  const budget = 1_500_000;
  const used = 750_000;
  const res = calculateBudgetUsage(budget, used);

  assert.equal(res.budgetAmount, 1_500_000);
  assert.equal(res.usedAmount, 750_000);
  assert.equal(res.remainingAmount, 750_000);
  assert.equal(res.percentage, 50);
  assert.equal(res.status, "SAFE");
});

test("calculateDailySafeSpend - computes remaining per day", () => {
  assert.equal(calculateDailySafeSpend(600_000, 20), 30_000);
  assert.equal(calculateDailySafeSpend(-50_000, 10), 0);
  assert.equal(calculateDailySafeSpend(500_000, 0), 0);
});

test("PRD Section 16.4 - Balance Regression Checklist", () => {
  // 1. Akun A (1.000.000), Akun B (500.000)
  const aInitial = 1_000_000;
  const bInitial = 500_000;

  // 2. Expense 100.000 dari A -> A = 900.000, total = 1.400.000
  let aTrx: Array<{ type: "INCOME" | "EXPENSE"; amount: number }> = [
    { type: "EXPENSE", amount: 100_000 },
  ];
  const bTrx: Array<{ type: "INCOME" | "EXPENSE"; amount: number }> = [];

  let aBal = calculateAccountBalance(aInitial, aTrx);
  let bBal = calculateAccountBalance(bInitial, bTrx);
  assert.equal(aBal, 900_000);
  assert.equal(aBal + bBal, 1_400_000);

  // 3. Income 500.000 ke A -> A = 1.400.000, total = 1.900.000
  aTrx.push({ type: "INCOME", amount: 500_000 });
  aBal = calculateAccountBalance(aInitial, aTrx);
  assert.equal(aBal, 1_400_000);
  assert.equal(aBal + bBal, 1_900_000);

  // 4. Expense 50.000 dari B -> B = 450.000, total = 1.850.000
  bTrx.push({ type: "EXPENSE", amount: 50_000 });
  bBal = calculateAccountBalance(bInitial, bTrx);
  assert.equal(bBal, 450_000);
  assert.equal(aBal + bBal, 1_850_000);

  // 5. Hapus expense langkah 2 -> A = 1.500.000, total = 1.950.000
  // Remove the first expense from A
  aTrx = aTrx.filter((t, i) => i !== 0);
  aBal = calculateAccountBalance(aInitial, aTrx);
  assert.equal(aBal, 1_500_000);
  assert.equal(aBal + bBal, 1_950_000);

  // 6. Income bulan ini = 500.000, expense bulan ini = 50.000
  const allMonthlyTrx = [...aTrx, ...bTrx];
  const summary = calculateMonthlySummary(allMonthlyTrx);
  assert.equal(summary.income, 500_000);
  assert.equal(summary.expense, 50_000);
});
