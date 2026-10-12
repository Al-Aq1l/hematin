import { z } from "zod";

export const CategoryTypeEnum = z.enum(["INCOME", "EXPENSE"]);
export type CategoryType = z.infer<typeof CategoryTypeEnum>;

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Nama kategori wajib diisi").max(50, "Nama maksimal 50 karakter"),
  type: CategoryTypeEnum,
  icon: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Warna harus berupa kode HEX valid (mis. #F97316)").optional(),
});

export const updateCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Nama kategori wajib diisi").max(50, "Nama maksimal 50 karakter"),
  icon: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Warna harus berupa kode HEX valid").optional(),
});

export const deleteWithReassignSchema = z.object({
  id: z.string().min(1),
  targetCategoryId: z.string().min(1, "Pilih kategori tujuan pemindahan transaksi"),
});
