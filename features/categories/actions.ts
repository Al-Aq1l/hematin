"use server";

import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { CategoryType } from "@prisma/client";
import {
  createCategorySchema,
  updateCategorySchema,
  deleteWithReassignSchema,
} from "./schemas";

async function assertAuthenticated() {
  const isAuth = await getSession();
  if (!isAuth) {
    throw new Error("Unauthorized. Silakan login terlebih dahulu.");
  }
}

export async function getCategories(
  type?: "INCOME" | "EXPENSE",
  includeArchived = false
) {
  await assertAuthenticated();

  const categories = await db.category.findMany({
    where: {
      ...(type ? { type: type as CategoryType } : {}),
      ...(includeArchived ? {} : { isArchived: false }),
    },
    include: {
      _count: {
        select: {
          transactions: true,
          budgets: true,
        },
      },
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    icon: c.icon,
    color: c.color,
    isDefault: c.isDefault,
    isArchived: c.isArchived,
    transactionCount: c._count.transactions,
    budgetCount: c._count.budgets,
    isProtected: c.name.toLowerCase() === "other",
  }));
}

export async function createCategory(input: unknown) {
  await assertAuthenticated();
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Input tidak valid" };
  }

  const { name, type, icon, color } = parsed.data;

  // Case-insensitive check within same type
  const existing = await db.category.findFirst({
    where: {
      type: type as CategoryType,
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    return { success: false, error: `Kategori '${name}' sudah ada untuk tipe ${type}.` };
  }

  const category = await db.category.create({
    data: {
      name,
      type: type as CategoryType,
      icon,
      color: color || "#6B7280",
    },
  });

  revalidatePath("/", "layout");
  return { success: true, id: category.id };
}

export async function updateCategory(input: unknown) {
  await assertAuthenticated();
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Input tidak valid" };
  }

  const { id, name, icon, color } = parsed.data;

  const current = await db.category.findUnique({ where: { id } });
  if (!current) {
    return { success: false, error: "Kategori tidak ditemukan." };
  }

  // Check duplicate
  const duplicate = await db.category.findFirst({
    where: {
      type: current.type,
      name: {
        equals: name,
        mode: "insensitive",
      },
      NOT: { id },
    },
  });

  if (duplicate) {
    return { success: false, error: `Nama kategori '${name}' sudah dipakai pada tipe ${current.type}.` };
  }

  await db.category.update({
    where: { id },
    data: {
      name,
      icon,
      color: color || current.color,
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function archiveCategory(id: string) {
  await assertAuthenticated();

  const category = await db.category.findUnique({ where: { id } });
  if (!category) {
    return { success: false, error: "Kategori tidak ditemukan." };
  }

  // PRD 8.6: Kategori "Other" tidak boleh diarsipkan
  if (category.name.toLowerCase() === "other") {
    return {
      success: false,
      error: "Kategori 'Other' tidak boleh diarsipkan agar selalu ada kategori tujuan pemindahan.",
    };
  }

  await db.category.update({
    where: { id },
    data: { isArchived: true },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function unarchiveCategory(id: string) {
  await assertAuthenticated();
  await db.category.update({
    where: { id },
    data: { isArchived: false },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteCategory(id: string) {
  await assertAuthenticated();

  const category = await db.category.findUnique({
    where: { id },
    include: {
      _count: { select: { transactions: true } },
    },
  });

  if (!category) {
    return { success: false, error: "Kategori tidak ditemukan." };
  }

  if (category.name.toLowerCase() === "other") {
    return { success: false, error: "Kategori 'Other' dilindungi dan tidak dapat dihapus." };
  }

  if (category.isDefault) {
    return { success: false, error: "Kategori default sistem hanya dapat diedit atau diarsipkan." };
  }

  if (category._count.transactions > 0) {
    return {
      success: false,
      error: `Kategori ini memiliki ${category._count.transactions} transaksi. Pilih opsi 'Arsipkan' atau 'Pindahkan transaksi lalu hapus'.`,
    };
  }

  await db.category.delete({ where: { id } });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteCategoryWithReassign(input: unknown) {
  await assertAuthenticated();
  const parsed = deleteWithReassignSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Input tidak valid" };
  }

  const { id, targetCategoryId } = parsed.data;

  if (id === targetCategoryId) {
    return { success: false, error: "Kategori tujuan harus berbeda dengan kategori yang dihapus." };
  }

  const [source, target] = await Promise.all([
    db.category.findUnique({ where: { id } }),
    db.category.findUnique({ where: { id: targetCategoryId } }),
  ]);

  if (!source || !target) {
    return { success: false, error: "Kategori sumber atau tujuan tidak valid." };
  }

  if (source.name.toLowerCase() === "other") {
    return { success: false, error: "Kategori 'Other' tidak boleh dihapus." };
  }

  if (source.type !== target.type) {
    return { success: false, error: "Kategori tujuan harus memiliki tipe yang sama (Income/Expense)." };
  }

  // Atomic database transaction: Move all transactions, then delete source
  await db.$transaction(async (tx) => {
    await tx.transaction.updateMany({
      where: { categoryId: id },
      data: { categoryId: targetCategoryId },
    });

    // Delete any associated budgets for source category
    await tx.budget.deleteMany({
      where: { categoryId: id },
    });

    await tx.category.delete({
      where: { id },
    });
  });

  revalidatePath("/", "layout");
  return { success: true };
}
