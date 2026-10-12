import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { toWIBDateInputString } from "@/lib/date";

export async function GET() {
  const isAuth = await getSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [accounts, categories, transactions, budgets, settings] = await Promise.all([
    db.account.findMany({ orderBy: { sortOrder: "asc" } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.transaction.findMany({ orderBy: { date: "asc" } }),
    db.budget.findMany({ orderBy: [{ year: "asc" }, { month: "asc" }] }),
    db.setting.findMany(),
  ]);

  const now = new Date();
  const dateStr = toWIBDateInputString(now);

  // Update lastBackupAt
  await db.setting.upsert({
    where: { key: "lastBackupAt" },
    update: { value: now.toISOString() },
    create: { key: "lastBackupAt", value: now.toISOString() },
  });

  const exportPayload = {
    schemaVersion: 1,
    appVersion: "1.0.0",
    exportedAt: now.toISOString(),
    data: {
      accounts: accounts.map((a) => ({
        ...a,
        initialBalance: a.initialBalance.toString(),
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      categories: categories.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      transactions: transactions.map((t) => ({
        ...t,
        amount: t.amount.toString(),
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      budgets: budgets.map((b) => ({
        ...b,
        amount: b.amount.toString(),
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      })),
      settings: settings.map((s) => ({
        ...s,
        updatedAt: s.updatedAt.toISOString(),
      })),
    },
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);

  return new NextResponse(jsonString, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="money-management-backup-${dateStr}.json"`,
    },
  });
}
