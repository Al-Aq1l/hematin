"use client";

import { useState, type CSSProperties } from "react";
import { formatRupiah } from "@/lib/money";
import { AccountWithBalance } from "@/lib/balances";
import { useBalanceVisibility } from "@/components/BalanceVisibilityProvider";
import HoloCard from "@/components/HoloCard";
import { Eye, EyeOff } from "lucide-react";

interface DebitCardProps {
  accounts: AccountWithBalance[];
  totalBalance: number;
}

// Ratio kartu kredit standar (85.6 x 54 mm), lebar penuh
const CARD_STYLE = { width: "100%", "--hc-ratio": 1.586 } as CSSProperties;

export function DebitCard({ accounts, totalBalance }: DebitCardProps) {
  const { isHidden, toggleHideBalance, isReady } = useBalanceVisibility();
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
      <HoloCard
        preset="bursts"
        radius={28}
        shadow={false}
        idle={false}
        tiltMax={0}
        hoverScale={1}
        style={CARD_STYLE}
        className="ring-1 ring-inset ring-white/15 shadow-2xl shadow-black/60"
      >
        {/* Card body: teks di atas permukaan foil (canvas HoloCard) */}
        <div className="absolute inset-0 p-6 flex flex-col text-white">
          {/* Shade supaya teks kebaca di atas foil yang terang */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/10 to-black/60 pointer-events-none" />
          {/* Top Row: CARD BALANCE */}
          <div className="relative z-10 flex items-center">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-300">
              CARD BALANCE
            </span>
          </div>

          {/* Middle Row: Balance with Eye Toggle next to it */}
          <div className="relative z-10 mt-3 flex items-center gap-2 min-h-[34px]">
            <div
              className="text-[32px] sm:text-[34px] font-bold tracking-tight font-mono text-white leading-none drop-shadow-xs flex items-center cursor-pointer select-none"
              onClick={() => toggleHideBalance()}
              title={isReady && isHidden ? "Ketuk untuk melihat saldo" : "Ketuk untuk menyembunyikan saldo"}
            >
              {isReady && isHidden ? (
                <span className="tracking-[0.22em] text-[26px] sm:text-[28px] select-none text-zinc-200">
                  ••••••••
                </span>
              ) : (
                formatRupiah(activeCard.balance)
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleHideBalance();
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/15 active:scale-90 transition-all cursor-pointer backdrop-blur-xs shrink-0"
              title={isReady && isHidden ? "Tampilkan Saldo" : "Sembunyikan Saldo"}
              aria-label={isReady && isHidden ? "Tampilkan Saldo" : "Sembunyikan Saldo"}
            >
              {isReady && isHidden ? (
                <EyeOff className="w-4 h-4 text-zinc-300 hover:text-white transition-colors" />
              ) : (
                <Eye className="w-4 h-4 text-zinc-300 hover:text-white transition-colors" />
              )}
            </button>
          </div>

          {/* Bottom Row: Account Title & Mastercard Logo */}
          <div className="relative z-10 mt-auto flex items-end justify-between">
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
      </HoloCard>

      {/* Carousel Pagination Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {cards.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${currentIndex === idx
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
