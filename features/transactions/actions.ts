"use server";

import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fromBigIntToNumber } from "@/lib/money";
import { createWIBDate } from "@/lib/date";
import { TransactionType, CategoryType } from "@prisma/client";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFilterSchema,
} from "./schemas";

async function assertAuthenticated() {
  const isAuth = await getSession();
  if (!isAuth) {
    throw new Error("Unauthorized. Silakan login terlebih dahulu.");
  }
}

/**
 * Parses user-selected date string (either YYYY-MM-DD or ISO string)
 * into a proper UTC Date stored with accurate WIB calendar day.
 */
function parseTransactionDate(dateStr: string): Date {
  if (dateStr.includes("T")) {
    return new Date(dateStr);
  }
  // YYYY-MM-DD
  const [yyyy, mm, dd] = dateStr.split("-").map(Number);
  // Default to noon WIB on that day to avoid any boundary shifts
  return createWIBDate(yyyy, mm, dd, 12, 0, 0);
}

export async function getTransactions(inputFilter?: unknown) {
  await assertAuthenticated();

  const filter = transactionFilterSchema.parse(inputFilter ?? {});

  const whereClause: {
    type?: TransactionType;
    accountId?: string;
    categoryId?: string;
    note?: { contains: string; mode: "insensitive" };
    date?: { gte?: Date; lte?: Date };
  } = {};

  if (filter.type) {
    whereClause.type = filter.type as TransactionType;
  }
  if (filter.accountId) {
    whereClause.accountId = filter.accountId;
  }
  if (filter.categoryId) {
    whereClause.categoryId = filter.categoryId;
  }
  if (filter.search?.trim()) {
    whereClause.note = {
      contains: filter.search.trim(),
      mode: "insensitive",
    };
  }

  if (filter.startDate || filter.endDate) {
    whereClause.date = {};
    if (filter.startDate) {
      whereClause.date.gte = parseTransactionDate(filter.startDate);
    }
    if (filter.endDate) {
      // Set to end of that day WIB
      const [yyyy, mm, dd] = filter.endDate.split("-").map(Number);
      whereClause.date.lte = createWIBDate(yyyy, mm, dd, 23, 59, 59, 999);
    }
  }

  const transactions = await db.transaction.findMany({
    where: whereClause,
    include: {
      account: { select: { id: true, name: true, type: true, icon: true } },
      category: { select: { id: true, name: true, type: true, icon: true, color: true } },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: filter.limit,
  });

  return transactions.map((t) => ({
    id: t.id,
    type: t.type,
    amount: fromBigIntToNumber(t.amount),
    note: t.note,
    date: t.date.toISOString(),
    account: t.account,
    category: t.category,
    createdAt: t.createdAt.toISOString(),
  }));
}

export async function createTransaction(input: unknown) {
  await assertAuthenticated();
  const parsed = createTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Input tidak valid" };
  }

  const { amount, type, accountId, categoryId, date, note } = parsed.data;

  // 1. Verify account exists
  const account = await db.account.findUnique({ where: { id: accountId } });
  if (!account) {
    return { success: false, error: "Akun sumber uang tidak ditemukan." };
  }
  if (account.isArchived) {
    return { success: false, error: "Akun yang diarsipkan tidak dapat menerima transaksi baru." };
  }

  // 2. Verify category exists and matches transaction type (PRD 10.4)
  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return { success: false, error: "Kategori tidak ditemukan." };
  }
  if (category.type !== (type as unknown as CategoryType)) {
    return { success: false, error: `Kategori '${category.name}' tidak cocok untuk tipe ${type}.` };
  }

  const dateObj = parseTransactionDate(date);

  const trx = await db.transaction.create({
    data: {
      amount: BigInt(Math.round(amount)),
      type: type as TransactionType,
      accountId,
      categoryId,
      date: dateObj,
      note: note?.trim() || null,
    },
  });

  // Remember last used account and category for smart defaults (PRD 8.7 & 10.5)
  try {
    await db.setting.upsert({
      where: { key: "lastUsedAccountId" },
      update: { value: accountId },
      create: { key: "lastUsedAccountId", value: accountId },
    });
    await db.setting.upsert({
      where: { key: `lastUsedCategory.${type}` },
      update: { value: categoryId },
      create: { key: `lastUsedCategory.${type}`, value: categoryId },
    });
  } catch {
    // Non-blocking for transaction save
  }

  revalidatePath("/", "layout");
  return { success: true, id: trx.id };
}

export async function updateTransaction(input: unknown) {
  await assertAuthenticated();
  const parsed = updateTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Input tidak valid" };
  }

  const { id, amount, type, accountId, categoryId, date, note } = parsed.data;

  // Verify category matches type
  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category || category.type !== (type as unknown as CategoryType)) {
    return { success: false, error: "Kategori tidak valid atau tidak cocok dengan tipe transaksi." };
  }

  const dateObj = parseTransactionDate(date);

  await db.transaction.update({
    where: { id },
    data: {
      amount: BigInt(Math.round(amount)),
      type: type as TransactionType,
      accountId,
      categoryId,
      date: dateObj,
      note: note?.trim() || null,
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  await assertAuthenticated();
  await db.transaction.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { success: true };
}
