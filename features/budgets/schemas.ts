import { z } from "zod";
import { MAX_TRANSACTION_AMOUNT } from "@/lib/money";

export const upsertBudgetSchema = z.object({
  categoryId: z.string().min(1, "Pilih kategori"),
  amount: z.coerce
    .number()
    .int("Nominal harus berupa bilangan bulat")
    .positive("Budget harus lebih besar dari Rp0")
    .max(Number(MAX_TRANSACTION_AMOUNT), "Nominal melebihi batas wajar"),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
});

export const copyBudgetSchema = z.object({
  targetMonth: z.coerce.number().min(1).max(12),
  targetYear: z.coerce.number().min(2000).max(2100),
});
