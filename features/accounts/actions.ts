"use server";

import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fromBigIntToNumber } from "@/lib/money";
import { calculateAccountBalance } from "@/lib/calc";
import {
  createAccountSchema,
  updateAccountSchema,
  reconcileAccountSchema,
} from "./schemas";

async function assertAuthenticated() {
  const isAuth = await getSession();
  if (!isAuth) {
    throw new Error("Unauthorized. Silakan login terlebih dahulu.");
  }
}

export async function getAccounts(includeArchived = false) {
  await assertAuthenticated();

  const accounts = await db.account.findMany({
    where: includeArchived ? undefined : { isArchived: false },
    include: {
      transactions: {
        select: {
          type: true,
          amount: true,
        },
      },
      _count: {
        select: { transactions: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return accounts.map((acc) => {
    const initialBalanceNum = fromBigIntToNumber(acc.initialBalance);
    const balance = calculateAccountBalance(
      initialBalanceNum,
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
      initialBalance: initialBalanceNum,
      balance,
      isArchived: acc.isArchived,
      sortOrder: acc.sortOrder,
      transactionCount: acc._count.transactions,
      createdAt: acc.createdAt.toISOString(),
      updatedAt: acc.updatedAt.toISOString(),
    };
  });
}

export async function createAccount(input: unknown) {
  await assertAuthenticated();
  const parsed = createAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Input tidak valid" };
  }

  const { name, type, initialBalance, icon } = parsed.data;

  // Case-insensitive check
  const existing = await db.account.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    return { success: false, error: "Nama akun sudah digunakan." };
  }

  const account = await db.account.create({
    data: {
      name,
      type,
      initialBalance: BigInt(Math.round(initialBalance)),
      icon: icon || null,
    },
  });

  revalidatePath("/", "layout");
  return { success: true, id: account.id };
}

export async function updateAccount(input: unknown) {
  await assertAuthenticated();
  const parsed = updateAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Input tidak valid" };
  }

  const { id, name, type, initialBalance, icon } = parsed.data;

  // Check duplicate name
  const duplicate = await db.account.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
      NOT: { id },
    },
  });

  if (duplicate) {
    return { success: false, error: "Nama akun sudah dipakai." };
  }

  await db.account.update({
    where: { id },
    data: {
      name,
      type,
      initialBalance: BigInt(Math.round(initialBalance)),
      icon: icon || null,
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function archiveAccount(id: string) {
  await assertAuthenticated();
  await db.account.update({
    where: { id },
    data: { isArchived: true },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function unarchiveAccount(id: string) {
  await assertAuthenticated();
  await db.account.update({
    where: { id },
    data: { isArchived: false },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteAccount(id: string) {
  await assertAuthenticated();

  const account = await db.account.findUnique({
    where: { id },
    include: { _count: { select: { transactions: true } } },
  });

  if (!account) {
    return { success: false, error: "Akun tidak ditemukan." };
  }

  if (account._count.transactions > 0) {
    return {
      success: false,
      error: "Akun yang memiliki riwayat transaksi tidak dapat dihapus, hanya dapat diarsipkan.",
    };
  }

  await db.account.delete({ where: { id } });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function reconcileAccount(input: unknown) {
  await assertAuthenticated();
  const parsed = reconcileAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Input tidak valid" };
  }

  const { id, actualBalance } = parsed.data;

  const account = await db.account.findUnique({
    where: { id },
    include: {
      transactions: { select: { type: true, amount: true } },
    },
  });

  if (!account) {
    return { success: false, error: "Akun tidak ditemukan." };
  }

  const currentInitialNum = fromBigIntToNumber(account.initialBalance);
  const currentCalcBalance = calculateAccountBalance(
    currentInitialNum,
    account.transactions.map((t) => ({
      type: t.type,
      amount: fromBigIntToNumber(t.amount),
    }))
  );

  const diff = actualBalance - currentCalcBalance;
  const newInitialBalance = currentInitialNum + diff;

  await db.account.update({
    where: { id },
    data: {
      initialBalance: BigInt(Math.round(newInitialBalance)),
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}
