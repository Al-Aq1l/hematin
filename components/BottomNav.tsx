"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  ArrowLeftRight,
  BarChart3,
  Target,
  Plus,
  Loader2,
  CreditCard,
} from "lucide-react";
import { useQuickAdd } from "./QuickAddProvider";

type PendingNav = { from: string; to: string };

export function BottomNav() {
  const pathname = usePathname();
  const { openQuickAdd } = useQuickAdd();
  const [pending, setPending] = useState<PendingNav | null>(null);

  const navItems = [
    { label: "Home", href: "/", icon: Wallet, exact: true },
    { label: "Transaksi", href: "/transactions", icon: ArrowLeftRight, exact: false },
    { label: "QuickAdd", isAction: true },
    { label: "Statistik", href: "/statistics", icon: BarChart3, exact: false },
    { label: "Budget", href: "/budget", icon: Target, exact: false },
  ];

  const isNavigating = pending !== null && pending.from === pathname;

  return (
    <>
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 h-0.5 z-50 overflow-hidden pointer-events-none">
          <div className="nav-progress h-full w-1/3 bg-emerald-500 rounded-full" />
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
        aria-label="Navigasi Utama"
      >
        <div className="w-full max-w-md pointer-events-auto bg-white/95 dark:bg-[#12151c]/95 backdrop-blur-xl border-t border-zinc-200/90 dark:border-zinc-800 px-3 py-2 flex items-center justify-between pb-[calc(0.6rem+env(safe-area-inset-bottom))] shadow-2xl">
          {navItems.map((item, idx) => {
            if (item.isAction) {
              return (
                <div key="action-add" className="flex items-center justify-center -mt-5">
                  <button
                    type="button"
                    onClick={openQuickAdd}
                    className="group relative flex items-center justify-center w-12 h-12 rounded-[18px] bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-lg shadow-emerald-600/35 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
                    aria-label="Catat Transaksi Cepat"
                  >
                    <div className="relative">
                      <CreditCard className="w-5 h-5 text-white" />
                      <Plus className="w-3 h-3 text-white absolute -top-1 -right-1 stroke-[3]" />
                    </div>
                  </button>
                </div>
              );
            }

            const Icon = item.icon!;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href!);
            const isLoading =
              pending !== null &&
              pending.from === pathname &&
              pending.to === item.href &&
              !isActive;

            return (
              <Link
                key={item.href || idx}
                href={item.href!}
                prefetch
                onClick={() => {
                  if (!isActive) setPending({ from: pathname, to: item.href! });
                }}
                aria-current={isActive ? "page" : undefined}
                aria-busy={isLoading || undefined}
                className={`relative flex flex-col items-center justify-center min-w-12 min-h-12 py-1 px-2 rounded-xl transition-colors cursor-pointer ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 font-normal"
                }`}
              >
                {isActive && (
                  <span className="nav-indicator absolute -top-2 h-0.5 w-5 rounded-full bg-emerald-500" />
                )}
                <span className={`nav-icon ${isActive ? "nav-icon-active" : ""}`}>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 stroke-[1.8]" />
                  )}
                </span>
                <span className="text-[10px] mt-1 tracking-tight font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
