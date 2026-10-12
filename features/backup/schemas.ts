import { z } from "zod";

export const backupAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["CASH", "BANK", "EWALLET"]),
  initialBalance: z.string(), // serialized as string for BigInt precision
  icon: z.string().nullable().optional(),
  isArchived: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const backupCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["EXPENSE", "INCOME"]),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  isDefault: z.boolean(),
  isArchived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const backupTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(["EXPENSE", "INCOME"]),
  amount: z.string(), // serialized BigInt as string
  date: z.string(),
  note: z.string().nullable().optional(),
  accountId: z.string(),
  categoryId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const backupBudgetSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  amount: z.string(), // serialized BigInt as string
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const backupSettingSchema = z.object({
  key: z.string(),
  value: z.string(),
  updatedAt: z.string(),
});

export const backupDataSchema = z.object({
  schemaVersion: z.literal(1),
  appVersion: z.string().default("1.0.0"),
  exportedAt: z.string(),
  data: z.object({
    accounts: z.array(backupAccountSchema),
    categories: z.array(backupCategorySchema),
    transactions: z.array(backupTransactionSchema),
    budgets: z.array(backupBudgetSchema),
    settings: z.array(backupSettingSchema),
  }),
});

export type BackupData = z.infer<typeof backupDataSchema>;
