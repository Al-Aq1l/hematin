import { z } from "zod";

export const AccountTypeEnum = z.enum(["CASH", "BANK", "EWALLET", "OTHER"]);
export type AccountType = z.infer<typeof AccountTypeEnum>;

export const createAccountSchema = z.object({
  name: z.string().trim().min(1, "Nama akun wajib diisi").max(50, "Nama akun maksimal 50 karakter"),
  type: AccountTypeEnum,
  initialBalance: z.coerce.number().min(0, "Saldo awal tidak boleh negatif"),
  icon: z.string().optional(),
});

export const updateAccountSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Nama akun wajib diisi").max(50, "Nama akun maksimal 50 karakter"),
  type: AccountTypeEnum,
  initialBalance: z.coerce.number().min(0, "Saldo awal tidak boleh negatif"),
  icon: z.string().optional(),
});

export const reconcileAccountSchema = z.object({
  id: z.string().min(1),
  actualBalance: z.coerce.number(),
});
