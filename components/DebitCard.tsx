"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/money";
import { AccountWithBalance } from "@/lib/balances";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface DebitCardProps {
  accounts: AccountWithBalance[];
  totalBalance: number;
}

export function DebitCard({ accounts, totalBalance }: DebitCardProps) {
  const cards = accounts.length > 0
    ? accounts.map((acc) => ({
        id: acc.id,
        title: acc.name.toUpperCase(),
        balance: acc.balance,
        type: acc.type,
      }))
    : [
        {
          id: "total",
          title: "TOTAL SALDO",
          balance: totalBalance,
          type: "BANK" as const,
        },
      ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const activeCard = cards[currentIndex] || cards[0];

  return (
    <div className="w-full select-none">
      {/* Debit Card Box: Elevated card with crisp contrast & specular glow */}
      <div className="relative w-full rounded-[28px] p-6 bg-gradient-to-br from-[#252b36]/90 via-[#1c212a]/85 to-[#14171f]/90 backdrop-blur-md text-white border border-zinc-700/70 dark:border-zinc-700/80 ring-1 ring-inset ring-white/[0.1] shadow-2xl shadow-black/50 overflow-hidden transition-all duration-300">
        {/* Subtle specular reflection gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-black/[0.3] pointer-events-none" />

        {/* Top Row: CARD BALANCE & More options */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-300 dark:text-zinc-300">
            CARD BALANCE
          </span>

          <Link
            href="/settings/accounts"
            className="p-1.5 -mr-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Pengaturan Akun"
            title="Kelola Akun"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Link>
        </div>

        {/* Middle Row: Balance */}
        <div className="relative z-10 mt-3">
          <div className="text-[32px] sm:text-[34px] font-bold tracking-tight font-mono text-white leading-none drop-shadow-xs">
            {formatRupiah(activeCard.balance)}
          </div>
        </div>

        {/* Bottom Row: Account Title & Mastercard Logo */}
        <div className="relative z-10 mt-8 flex items-end justify-between">
          <div className="text-xs sm:text-sm font-semibold tracking-wider text-zinc-200 uppercase truncate max-w-[200px]">
            {activeCard.title}
          </div>

          {/* Authentic Mastercard Logo */}
          <div className="flex items-center shrink-0 drop-shadow-sm" aria-label="Mastercard">
            <svg
              className="w-10 h-7"
              viewBox="0 0 36 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10.5" fill="#EB001B" fillOpacity="0.96" />
              <circle cx="24" cy="12" r="10.5" fill="#F79E1B" fillOpacity="0.94" />
              <path
                d="M18 5.12a10.45 10.45 0 0 1 3.2 6.88 10.45 10.45 0 0 1-3.2 6.88 10.45 10.45 0 0 1-3.2-6.88c0-2.62 1.25-4.96 3.2-6.88z"
                fill="#FF5F00"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Carousel Pagination Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {cards.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentIndex === idx
                ? "w-4 h-1.5 bg-zinc-900 dark:bg-white shadow-xs"
                : "w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-500"
            }`}
            aria-label={`Pilih kartu ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
