"use client";

import { useBalanceVisibility } from "@/components/BalanceVisibilityProvider";
import { Eye, EyeOff } from "lucide-react";

export function HideBalanceToggle() {
  const { isHidden, toggleHideBalance, isReady } = useBalanceVisibility();

  const active = isReady && isHidden;

  return (
    <div className="flex items-center justify-between p-3.5 hover:bg-zinc-50/60 dark:hover:bg-[#1b202a]/60 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors">
          {active ? (
            <EyeOff className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </div>
        <div>
          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Sembunyikan Saldo
          </div>
          <div className="text-[10px] text-zinc-400">
            Sensor nominal saldo di kartu &amp; daftar akun
          </div>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={active}
        onClick={toggleHideBalance}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
          active ? "bg-emerald-500" : "bg-zinc-700"
        }`}
      >
        <span className="sr-only">Toggle Sembunyikan Saldo</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            active ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
