import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { backupDataSchema } from "@/features/backup/schemas";

export async function POST(request: NextRequest) {
  const isAuth = await getSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawBody = await request.json();
    const { confirmation, backupData } = rawBody;

    if (confirmation !== "IMPORT") {
      return NextResponse.json(
        {
          success: false,
          error: 'Konfirmasi tidak valid. Harap ketik "IMPORT" untuk melanjutkan.',
        },
        { status: 400 }
      );
    }

    const parseResult = backupDataSchema.safeParse(backupData);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Format berkas data backup tidak valid.",
        },
        { status: 400 }
      );
    }

    const { data } = parseResult.data;

    // Step 1: Create auto-backup snapshot of current data before overwriting (FR-IMP-7)
    const [currAccounts, currCategories, currTransactions, currBudgets, currSettings] =
      await Promise.all([
        db.account.findMany(),
        db.category.findMany(),
        db.transaction.findMany(),
        db.budget.findMany(),
        db.setting.findMany(),
      ]);

    const autoBackupSnapshot = {
      schemaVersion: 1,
      appVersion: "1.0.0",
      exportedAt: new Date().toISOString(),
      data: {
        accounts: currAccounts.map((a) => ({
          ...a,
          initialBalance: a.initialBalance.toString(),
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
        })),
        categories: currCategories.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        })),
        transactions: currTransactions.map((t) => ({
          ...t,
          amount: t.amount.toString(),
          date: t.date.toISOString(),
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        })),
        budgets: currBudgets.map((b) => ({
          ...b,
          amount: b.amount.toString(),
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
        })),
        settings: currSettings.map((s) => ({
          ...s,
          updatedAt: s.updatedAt.toISOString(),
        })),
      },
    };

    // Step 2: Execute atomic restore transaction (FR-IMP-8)
    await db.$transaction(async (tx) => {
      // Clear dependent child tables first
      await tx.transaction.deleteMany();
      await tx.budget.deleteMany();
      // Clear categories & accounts
      await tx.category.deleteMany();
      await tx.account.deleteMany();

      // Insert Accounts
      for (const acc of data.accounts) {
        await tx.account.create({
          data: {
            id: acc.id,
            name: acc.name,
            type: acc.type,
            initialBalance: BigInt(acc.initialBalance),
            icon: acc.icon ?? null,
            isArchived: acc.isArchived,
            sortOrder: acc.sortOrder,
            createdAt: new Date(acc.createdAt),
            updatedAt: new Date(acc.updatedAt),
          },
        });
      }

      // Insert Categories
      for (const cat of data.categories) {
        await tx.category.create({
          data: {
            id: cat.id,
            name: cat.name,
            type: cat.type,
            icon: cat.icon ?? null,
            color: cat.color ?? null,
            isDefault: cat.isDefault,
            isArchived: cat.isArchived,
            createdAt: new Date(cat.createdAt),
            updatedAt: new Date(cat.updatedAt),
          },
        });
      }

      // Insert Transactions
      for (const trx of data.transactions) {
        await tx.transaction.create({
          data: {
            id: trx.id,
            type: trx.type,
            amount: BigInt(trx.amount),
            date: new Date(trx.date),
            note: trx.note ?? null,
            accountId: trx.accountId,
            categoryId: trx.categoryId,
            createdAt: new Date(trx.createdAt),
            updatedAt: new Date(trx.updatedAt),
          },
        });
      }

      // Insert Budgets
      for (const bud of data.budgets) {
        await tx.budget.create({
          data: {
            id: bud.id,
            categoryId: bud.categoryId,
            amount: BigInt(bud.amount),
            month: bud.month,
            year: bud.year,
            createdAt: new Date(bud.createdAt),
            updatedAt: new Date(bud.updatedAt),
          },
        });
      }

      // Restore / Upsert Settings
      for (const set of data.settings) {
        await tx.setting.upsert({
          where: { key: set.key },
          update: { value: set.value },
          create: { key: set.key, value: set.value },
        });
      }

      // Record backup time
      await tx.setting.upsert({
        where: { key: "lastBackupAt" },
        update: { value: new Date().toISOString() },
        create: { key: "lastBackupAt", value: new Date().toISOString() },
      });
    });

    return NextResponse.json({
      success: true,
      autoBackupSnapshot,
      message: "Data berhasil diimpor sepenuhnya!",
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat mengimpor data. Seluruh perubahan dibatalkan.",
      },
      { status: 500 }
    );
  }
}
