"use server";

import { redirect } from "next/navigation";
import {
  OWNER_PASSWORD,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get("password") as string;
  const returnUrl = (formData.get("returnUrl") as string) || "/";

  if (!password) {
    return { error: "Password wajib diisi." };
  }

  if (password !== OWNER_PASSWORD) {
    return { error: "Password tidak sesuai. Periksa kembali." };
  }

  const token = await createSessionToken();
  await setSessionCookie(token);

  redirect(returnUrl);
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
