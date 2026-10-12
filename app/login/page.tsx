"use client";

import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { Lock, Eye, EyeOff, WalletCards, ArrowRight } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [state, formAction, isPending] = useActionState(loginAction, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="returnUrl" value={returnUrl} />

      <div>
        <label
          htmlFor="password"
          className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          Password Pemilik
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan password"
            required
            autoFocus
            className="w-full pl-9 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-zinc-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {state?.error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isPending ? (
          <span>Memverifikasi...</span>
        ) : (
          <>
            <span>Buka Aplikasi</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-sm">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 mb-3">
            <WalletCards className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Hematin</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Personal Money Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Masuk ke Akun</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Masukkan password pemilik untuk mengakses catatan keuangan.
            </p>
          </div>

          <Suspense fallback={<div className="py-6 text-center text-xs text-zinc-400">Memuat...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-600 mt-6">
          Privat &amp; Mandiri · Data tersimpan aman di database pribadi
        </p>
      </div>
    </div>
  );
}
