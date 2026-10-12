import { z } from "zod";
import { MAX_TRANSACTION_AMOUNT } from "@/lib/money";

export const TransactionTypeEnum = z.enum(["INCOME", "EXPENSE"]);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

export const createTransactionSchema = z.object({
  amount: z.coerce
    .number()
    .int("Nominal harus berupa bilangan bulat")
    .positive("Nominal harus lebih besar dari Rp0")
    .max(Number(MAX_TRANSACTION_AMOUNT), "Nominal melebihi batas wajar"),
  type: TransactionTypeEnum,
  accountId: z.string().min(1, "Pilih sumber uang"),
  categoryId: z.string().min(1, "Pilih kategori"),
  date: z.string().min(1, "Tanggal transaksi wajib diisi"),
  note: z.string().max(200, "Catatan maksimal 200 karakter").optional(),
});

export const updateTransactionSchema = createTransactionSchema.extend({
  id: z.string().min(1),
});

export const transactionFilterSchema = z.object({
  type: TransactionTypeEnum.optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(30),
  cursor: z.string().optional(),
});
