"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/auth";

async function assertAuthenticated() {
  const isAuth = await getSession();
  if (!isAuth) {
    throw new Error("Unauthorized");
  }
}

export async function getBackupStatus() {
  await assertAuthenticated();

  const setting = await db.setting.findUnique({
    where: { key: "lastBackupAt" },
  });

  const [accountCount, categoryCount, transactionCount, budgetCount] =
    await Promise.all([
      db.account.count(),
      db.category.count(),
      db.transaction.count(),
      db.budget.count(),
    ]);

  return {
    lastBackupAt: setting?.value || null,
    currentCounts: {
      accountCount,
      categoryCount,
      transactionCount,
      budgetCount,
    },
  };
}
